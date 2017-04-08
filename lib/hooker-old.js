import util from 'util'
import { runInFiberContext, wrapCommands, executeHooksWithArgs } from 'wdio-sync'

const TEST_COMMANDS = [
    'module',
    'test', 'todo', 'skip', 'only'
]

const QUNIT_HOOKS = {
    'moduleStart': 'beforeSuite',
    'testStart': 'beforeTest',
    'testDone': 'afterTest',
    'moduleDone': 'afterSuite'
}

const WDIO_HOOKS = {
    'beforeSuite': 'suite:start',
    'beforeTest': 'test:start',
    'afterTest': 'test:end',
    'afterSuite': 'suite:end'
}

const COMMANDS = [
    // 'on',
    ...TEST_COMMANDS,
    ...Object.keys(QUNIT_HOOKS)
]

// const NOOP = () => {}

/**
 * QUnit hooker
 */
class QUnitHooker {
    constructor (adapter) {
        this.adapter = adapter
    }

    setupHooks () {
        // trigger before and after wdio config hooks
        wrapCommands(global.browser, this.adapter.config.beforeCommand, this.adapter.config.afterCommand)

        // wrap QUnit commands into fiber context
        COMMANDS.forEach((fnName) => {
            runInFiberContext(
                TEST_COMMANDS,
                this.adapter.config.beforeHook,
                this.adapter.config.afterHook,
                fnName,
                this.adapter.runner
            )
        })

        // setup QUnit hooks to trigger WDIO hooks
        // this.setupHookCallbacks()
    }

    async execStartHook () {
        executeHooksWithArgs(this.adapter.config.before, [this.adapter.capabilities, this.adapter.specs])
    }

    async execEndHook (result) {
        executeHooksWithArgs(this.adapter.config.after, [result, this.adapter.capabilities, this.adapter.specs])
    }

    setupHookCallbacks () {
        let error = null

        this.adapter.runner.moduleStart((details) => {
            this.callHook('beforeSuite', details.name || 'Default module', '', 0, undefined)
        })

        this.adapter.runner.testStart((details) => {
            error = null

            this.callHook('beforeTest', details.module || 'Default module', details.name || 'Unnamed Test', 0, error)
        })

        this.adapter.runner.log((details) => {
            if (!details.result && !error) {
                let msg = `Actual value ${util.inspect(details.actual)} does not match expected value ${util.inspect(details.expected)}.`
                error = {
                    type: details.name,
                    message: `Description: ${details.message}
                              Reason: ${msg}`,
                    stack: details.source,
                    actual: util.inspect(details.actual),
                    expected: util.inspect(details.expected)
                }
            }
        })

        this.adapter.runner.testDone((details) => {
            this.callHook('afterTest', details.module || 'Default module', details.name || 'Unnamed Test', details.runtime, error)
        })

        this.adapter.runner.moduleDone((details) => {
            this.callHook('afterSuite', details.name, '', details.runtime, undefined)
        })
    }

    callHook (evt, suiteName, testName, duration, error) {
        let message = {
            type: WDIO_HOOKS[evt], // evt, // evt.endsWith('Test') ? 'test' : 'suite',
            title: testName || suiteName,
            fullTitle: testName ? `${suiteName} - ${testName}` : `${suiteName}`,
            parent: evt.endsWith('Test') ? suiteName : null,
            passed: !error,
            err: error || {},
            pending: false,
            file: undefined,
            duration: duration
        }

        this.adapter.reporter.tagMessage(message, evt)

        executeHooksWithArgs(
            this.adapter.config[evt],
            message
        ).catch((e) => {
            console.log(`Error in ${evt} hook`, e.stack)
        })
    }
}

export default QUnitHooker
