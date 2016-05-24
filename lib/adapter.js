import path from 'path'
import QUnit from 'qunitjs'

// FIXME: What do these do?
import { runInFiberContext, wrapCommands, executeHooksWithArgs } from 'wdio-sync'
/* FIXME: update wdio-sync/index.js
/**
 * [runInFiberContext description]
 * @param  {[type]} testInterfaceFnNames  global command that runs specs
 * @param  {[type]} before               before hook hook
 * @param  {[type]} after                after hook hook
 * @param  {[type]} fnName               test interface command to wrap
 * @param  {[type]} globalNS             global namespace object
 *
let runInFiberContext = function (testInterfaceFnNames, before, after, fnName, globalNS) {
    globalNS = globalNS || global
    let origFn = globalNS[fnName]
    globalNS[fnName] = wrapTestFunction(fnName, origFn, testInterfaceFnNames, before, after)
    ....
}
*/

const COMMANDS = [
    'module', 'test', 'skip', 'only'
]

const EVENTS = {
    'moduleStart': 'suite:start',
    'moduleDone': 'suite:end',
    'testStart': 'test:start',
    'testDone': 'test:end'
}

const NOOP = function () {}

/**
 * QUnit runner
 */
class QUnitAdapter {
    constructor (cid, config, specs, capabilities) {
        this.cid = cid
        this.capabilities = capabilities
        this.specs = specs
        this.config = Object.assign({
            qunitOpts: {}
        }, config)
        this.runner = QUnit
    }

    async run () {
        // setup QUnit
        Object.keys(this.config.qunitOpts).forEach(key =>
            QUnit.config[key] = this.config.qunitOpts[key])
        QUnit.config.autostart = false
        // FIXME QUnit.config.autorun = false

        // trigger before and after wdio config hooks
        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand)

        // run QUnit commands as if synchronous
        // trigger before and after wdio config hooks
        COMMANDS.forEach((fnName) => runInFiberContext(
            ['test', 'only'],
            this.config.beforeHook,
            this.config.afterHook,
            fnName,
            QUnit
        ))
        // FIXME: include above in here?
        /*
        QUnit.begin((details) => ...{
            console.log( "Test amount:", details.totalTests)
        })
        */

        // listen for QUnit callbacks to trigger reporting
        function sendMessage(evt, suiteName, title, duration, error) {
            var message = {
                event: evt,
                pid: process.pid,
                title: title || suiteName,
                pending: false,
                parent: evt.indexOf('test') >= 0 ? suiteName : null,
                type: evt.indexOf('test') >= 0 ? 'test' : 'suite',
                file: undefined,
                err: error || {},
                duration: duration,
                runner: {}
            }
            message.runner[process.pid] = capabilities

            process.send(message)
        }
        setupMessageCallbacks(QUnit, sendMessage)


        await executeHooksWithArgs(this.config.before, [this.capabilities, this.specs])
        let result = await new Promise((resolve, reject) => {
            // run QUnit tests
            requireExternalModules(this.specs)
            // start & end QUnit
            QUnit.done((details) => resolve(details.failed))
            QUnit.start();
            // FIXME QUnit.load();

            /* FIXME
            this.runner.suite.beforeAll(this.wrapHook('beforeSuite'))
            this.runner.suite.beforeEach(this.wrapHook('beforeTest'))
            this.runner.suite.afterEach(this.wrapHook('afterTest'))
            this.runner.suite.afterAll(this.wrapHook('afterSuite'))
            */
        })
        await executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs])
        return result
    }

    /**
     * Hooks which are added as true QUnit hooks need to call done() to notify async
     */
    wrapHook (hookName) {
        return (done) => executeHooksWithArgs(
            this.config[hookName],
            this.prepareMessage(hookName)
        ).then(() => done())
    }

    prepareMessage (hookName) {
        const params = { type: hookName }

        switch (hookName) {
        case 'beforeSuite':
        case 'afterSuite':
            params.payload = this.runner.suite.suites[0]
            break
        case 'beforeTest':
        case 'afterTest':
            params.payload = this.runner.test
            break
        }

        params.err = this.runner.lastError
        delete this.runner.lastError
        return this.formatMessage(params)
    }

    formatMessage (params) {
        let message = {
            type: params.type
        }

        if (params.err) {
            message.err = {
                message: params.err.message,
                stack: params.err.stack,
                type: params.err.type || params.err.name,
                expected: params.err.expected,
                actual: params.err.actual
            }
        }

        if (params.payload) {
            message.title = params.payload.title
            message.parent = params.payload.parent ? params.payload.parent.title : null

            /**
             * get title for hooks in root suite
             */
            if (message.parent === '' && params.payload.parent && params.payload.parent.suites) {
                message.parent = params.payload.parent.suites[0].title
            }

            message.pending = params.payload.pending || false
            message.file = params.payload.file

            // Add the current test title to the payload for cases where it helps to
            // identify the test, e.g. when running inside a beforeEach hook
            if (params.payload.ctx && params.payload.ctx.currentTest) {
                message.currentTest = params.payload.ctx.currentTest.title
            }

            if (params.type.match(/Test/)) {
                message.passed = (params.payload.state === 'passed')
                message.duration = params.payload.duration
            }
        }

        return message
    }

    emit (event, payload, err) {
        let message = this.formatMessage({type: event, payload, err})

        message.cid = this.cid
        message.specs = this.specs
        message.event = event
        message.runner = {}
        message.runner[this.cid] = this.capabilities

        if (err) {
            this.runner.lastError = err
        }

        // When starting a new test, propagate the details to the test runner so that
        // commands, results, screenshots and hooks can be associated with this test
        if (event === 'test:start') {
            this.sendInternal(event, message)
        }

        this.send(message)
    }

    sendInternal (event, message) {
        process.emit(event, message)
    }

    /**
     * reset globals to rewire it out in tests
     */
    send (...args) {
        return process.send.apply(process, args)
    }

    requireExternalModules (requires = []) {
        requires.forEach((mod) => {
            mod = mod.split(':')
            mod = mod[mod.length - 1]

            if (mod[0] === '.') {
                mod = path.join(process.cwd(), mod)
            }

            this.load(mod)
        })
    }


    load (module) {
        try {
            require(module)
        } catch (e) {
            throw new Error(`Module ${module} can't get loaded. Are you sure you have installed it?\n` +
                            `Note: if you've installed WebdriverIO globally you need to install ` +
                            `these external modules globally too!`)
        }
    }
}



function setupMessageCallbacks(QUnit, sendMessage) {
    var suiteName = 'Default module',
        error = undefined;


    QUnit.moduleStart(function(details) {
        suiteName = details.name;

        sendMessage('suite:start', details.name, '', 0, undefined);
    });


    QUnit.testStart(function(details) {
        error = undefined;

        var testName = (details.module || suiteName) + ' - ' + (details.name || 'Unnamed test');
        sendMessage('test:start', suiteName, testName, 0, error);
    });

    QUnit.log(function(details) {
        if (!details.result && !error) {
            var msg = 'Actual value ' + util.inspect(details.actual) + ' does not match expected value ' + util.inspect(details.expected) + '.';
            error = {
                message: 'Description: ' + details.message + EOL + 'Reason: ' + msg,
                stack: details.source
            };
        }
    });

    QUnit.testDone(function(details) {
        var testName = (details.module || suiteName) + ' - ' + (details.name || 'Unnamed test');

        sendMessage('test:end', suiteName, testName, details.runtime, error);
        if (details.skipped)
            sendMessage('test:pending', suiteName, testName, details.runtime, error);
        else if (details.failed > 0)
            sendMessage('test:fail', suiteName, testName, details.runtime, error);
        else if (details.passed === details.total)
            sendMessage('test:pass', suiteName, testName, details.runtime, error);
    });


    QUnit.moduleDone(function(details) {
        sendMessage('suite:end', details.name, '', details.runtime, undefined);
    });
}


const _QUnitAdapter = QUnitAdapter
const adapterFactory = {}

adapterFactory.run = async function (cid, config, specs, capabilities) {
    const adapter = new _QUnitAdapter(cid, config, specs, capabilities)
    return await adapter.run()
}

export default adapterFactory
export { QUnitAdapter, adapterFactory }
