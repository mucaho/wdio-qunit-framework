'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _qunitjs = require('qunitjs');

var _qunitjs2 = _interopRequireDefault(_qunitjs);

// FIXME: What do these do?

var _wdioSync = require('wdio-sync');

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

var setupMessageCallbacks = _setupMessageCallbacksOrig;
var __$Getters__ = [];
var __$Setters__ = [];
var __$Resetters__ = [];

function __GetDependency__(name) {
    return __$Getters__[name]();
}

function __Rewire__(name, value) {
    __$Setters__[name](value);
}

function __ResetDependency__(name) {
    __$Resetters__[name]();
}

var __RewireAPI__ = {
    '__GetDependency__': __GetDependency__,
    '__get__': __GetDependency__,
    '__Rewire__': __Rewire__,
    '__set__': __Rewire__,
    '__ResetDependency__': __ResetDependency__
};
var path = _path2['default'];

__$Getters__['path'] = function () {
    return path;
};

__$Setters__['path'] = function (value) {
    path = value;
};

__$Resetters__['path'] = function () {
    path = _path2['default'];
};

var QUnit = _qunitjs2['default'];

__$Getters__['QUnit'] = function () {
    return QUnit;
};

__$Setters__['QUnit'] = function (value) {
    QUnit = value;
};

__$Resetters__['QUnit'] = function () {
    QUnit = _qunitjs2['default'];
};

var runInFiberContext = _wdioSync.runInFiberContext;
var wrapCommands = _wdioSync.wrapCommands;
var executeHooksWithArgs = _wdioSync.executeHooksWithArgs;

__$Getters__['runInFiberContext'] = function () {
    return runInFiberContext;
};

__$Setters__['runInFiberContext'] = function (value) {
    runInFiberContext = value;
};

__$Resetters__['runInFiberContext'] = function () {
    runInFiberContext = _wdioSync.runInFiberContext;
};

__$Getters__['wrapCommands'] = function () {
    return wrapCommands;
};

__$Setters__['wrapCommands'] = function (value) {
    wrapCommands = value;
};

__$Resetters__['wrapCommands'] = function () {
    wrapCommands = _wdioSync.wrapCommands;
};

__$Getters__['executeHooksWithArgs'] = function () {
    return executeHooksWithArgs;
};

__$Setters__['executeHooksWithArgs'] = function (value) {
    executeHooksWithArgs = value;
};

__$Resetters__['executeHooksWithArgs'] = function () {
    executeHooksWithArgs = _wdioSync.executeHooksWithArgs;
};

var COMMANDS = ['module', 'test', 'skip', 'only'];

var _COMMANDS = COMMANDS;

__$Getters__['COMMANDS'] = function () {
    return COMMANDS;
};

__$Setters__['COMMANDS'] = function (value) {
    COMMANDS = value;
};

__$Resetters__['COMMANDS'] = function () {
    COMMANDS = _COMMANDS;
};

var EVENTS = {
    'moduleStart': 'suite:start',
    'moduleDone': 'suite:end',
    'testStart': 'test:start',
    'testDone': 'test:end'
};

var _EVENTS = EVENTS;

__$Getters__['EVENTS'] = function () {
    return EVENTS;
};

__$Setters__['EVENTS'] = function (value) {
    EVENTS = value;
};

__$Resetters__['EVENTS'] = function () {
    EVENTS = _EVENTS;
};

var NOOP = function NOOP() {};

/**
 * QUnit runner
 */
var _NOOP = NOOP;

__$Getters__['NOOP'] = function () {
    return NOOP;
};

__$Setters__['NOOP'] = function (value) {
    NOOP = value;
};

__$Resetters__['NOOP'] = function () {
    NOOP = _NOOP;
};

var QUnitAdapter = (function () {
    function QUnitAdapter(cid, config, specs, capabilities) {
        _classCallCheck(this, QUnitAdapter);

        this.cid = cid;
        this.capabilities = capabilities;
        this.specs = specs;
        this.config = _Object$assign({
            qunitOpts: {}
        }, config);
        this.runner = QUnit;
    }

    _createClass(QUnitAdapter, [{
        key: 'run',
        value: function run() {
            var sendMessage, result;
            return _regeneratorRuntime.async(function run$(context$2$0) {
                var _this = this;

                while (1) switch (context$2$0.prev = context$2$0.next) {
                    case 0:
                        sendMessage = function sendMessage(evt, suiteName, title, duration, error) {
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
                            };
                            message.runner[process.pid] = capabilities;

                            process.send(message);
                        };

                        // setup QUnit
                        _Object$keys(this.config.qunitOpts).forEach(function (key) {
                            return QUnit.config[key] = _this.config.qunitOpts[key];
                        });
                        QUnit.config.autostart = false;
                        // FIXME QUnit.config.autorun = false

                        // trigger before and after wdio config hooks
                        wrapCommands(global.browser, this.config.beforeCommand, this.config.afterCommand);

                        // run QUnit commands as if synchronous
                        // trigger before and after wdio config hooks
                        COMMANDS.forEach(function (fnName) {
                            return runInFiberContext(['test', 'only'], _this.config.beforeHook, _this.config.afterHook, fnName, QUnit);
                        });
                        // FIXME: include above in here?
                        /*
                        QUnit.begin((details) => ...{
                            console.log( "Test amount:", details.totalTests)
                        })
                        */

                        // listen for QUnit callbacks to trigger reporting

                        setupMessageCallbacks(QUnit, sendMessage);

                        context$2$0.next = 8;
                        return _regeneratorRuntime.awrap(executeHooksWithArgs(this.config.before, [this.capabilities, this.specs]));

                    case 8:
                        context$2$0.next = 10;
                        return _regeneratorRuntime.awrap(new _Promise(function (resolve, reject) {
                            // run QUnit tests
                            requireExternalModules(_this.specs);
                            // start & end QUnit
                            QUnit.done(function (details) {
                                return resolve(details.failed);
                            });
                            QUnit.start();
                            // FIXME QUnit.load();

                            /* FIXME
                            this.runner.suite.beforeAll(this.wrapHook('beforeSuite'))
                            this.runner.suite.beforeEach(this.wrapHook('beforeTest'))
                            this.runner.suite.afterEach(this.wrapHook('afterTest'))
                            this.runner.suite.afterAll(this.wrapHook('afterSuite'))
                            */
                        }));

                    case 10:
                        result = context$2$0.sent;
                        context$2$0.next = 13;
                        return _regeneratorRuntime.awrap(executeHooksWithArgs(this.config.after, [result, this.capabilities, this.specs]));

                    case 13:
                        return context$2$0.abrupt('return', result);

                    case 14:
                    case 'end':
                        return context$2$0.stop();
                }
            }, null, this);
        }

        /**
         * Hooks which are added as true QUnit hooks need to call done() to notify async
         */
    }, {
        key: 'wrapHook',
        value: function wrapHook(hookName) {
            var _this2 = this;

            return function (done) {
                return executeHooksWithArgs(_this2.config[hookName], _this2.prepareMessage(hookName)).then(function () {
                    return done();
                });
            };
        }
    }, {
        key: 'prepareMessage',
        value: function prepareMessage(hookName) {
            var params = { type: hookName };

            switch (hookName) {
                case 'beforeSuite':
                case 'afterSuite':
                    params.payload = this.runner.suite.suites[0];
                    break;
                case 'beforeTest':
                case 'afterTest':
                    params.payload = this.runner.test;
                    break;
            }

            params.err = this.runner.lastError;
            delete this.runner.lastError;
            return this.formatMessage(params);
        }
    }, {
        key: 'formatMessage',
        value: function formatMessage(params) {
            var message = {
                type: params.type
            };

            if (params.err) {
                message.err = {
                    message: params.err.message,
                    stack: params.err.stack,
                    type: params.err.type || params.err.name,
                    expected: params.err.expected,
                    actual: params.err.actual
                };
            }

            if (params.payload) {
                message.title = params.payload.title;
                message.parent = params.payload.parent ? params.payload.parent.title : null;

                /**
                 * get title for hooks in root suite
                 */
                if (message.parent === '' && params.payload.parent && params.payload.parent.suites) {
                    message.parent = params.payload.parent.suites[0].title;
                }

                message.pending = params.payload.pending || false;
                message.file = params.payload.file;

                // Add the current test title to the payload for cases where it helps to
                // identify the test, e.g. when running inside a beforeEach hook
                if (params.payload.ctx && params.payload.ctx.currentTest) {
                    message.currentTest = params.payload.ctx.currentTest.title;
                }

                if (params.type.match(/Test/)) {
                    message.passed = params.payload.state === 'passed';
                    message.duration = params.payload.duration;
                }
            }

            return message;
        }
    }, {
        key: 'emit',
        value: function emit(event, payload, err) {
            var message = this.formatMessage({ type: event, payload: payload, err: err });

            message.cid = this.cid;
            message.specs = this.specs;
            message.event = event;
            message.runner = {};
            message.runner[this.cid] = this.capabilities;

            if (err) {
                this.runner.lastError = err;
            }

            // When starting a new test, propagate the details to the test runner so that
            // commands, results, screenshots and hooks can be associated with this test
            if (event === 'test:start') {
                this.sendInternal(event, message);
            }

            this.send(message);
        }
    }, {
        key: 'sendInternal',
        value: function sendInternal(event, message) {
            process.emit(event, message);
        }

        /**
         * reset globals to rewire it out in tests
         */
    }, {
        key: 'send',
        value: function send() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return process.send.apply(process, args);
        }
    }, {
        key: 'requireExternalModules',
        value: function requireExternalModules() {
            var _this3 = this;

            var requires = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            requires.forEach(function (mod) {
                mod = mod.split(':');
                mod = mod[mod.length - 1];

                if (mod[0] === '.') {
                    mod = path.join(process.cwd(), mod);
                }

                _this3.load(mod);
            });
        }
    }, {
        key: 'load',
        value: function load(module) {
            try {
                require(module);
            } catch (e) {
                throw new Error('Module ' + module + ' can\'t get loaded. Are you sure you have installed it?\n' + 'Note: if you\'ve installed WebdriverIO globally you need to install ' + 'these external modules globally too!');
            }
        }
    }]);

    return QUnitAdapter;
})();

function _setupMessageCallbacksOrig(QUnit, sendMessage) {
    var suiteName = 'Default module',
        error = undefined;

    QUnit.moduleStart(function (details) {
        suiteName = details.name;

        sendMessage('suite:start', details.name, '', 0, undefined);
    });

    QUnit.testStart(function (details) {
        error = undefined;

        var testName = (details.module || suiteName) + ' - ' + (details.name || 'Unnamed test');
        sendMessage('test:start', suiteName, testName, 0, error);
    });

    QUnit.log(function (details) {
        if (!details.result && !error) {
            var msg = 'Actual value ' + util.inspect(details.actual) + ' does not match expected value ' + util.inspect(details.expected) + '.';
            error = {
                message: 'Description: ' + details.message + EOL + 'Reason: ' + msg,
                stack: details.source
            };
        }
    });

    QUnit.testDone(function (details) {
        var testName = (details.module || suiteName) + ' - ' + (details.name || 'Unnamed test');

        sendMessage('test:end', suiteName, testName, details.runtime, error);
        if (details.skipped) sendMessage('test:pending', suiteName, testName, details.runtime, error);else if (details.failed > 0) sendMessage('test:fail', suiteName, testName, details.runtime, error);else if (details.passed === details.total) sendMessage('test:pass', suiteName, testName, details.runtime, error);
    });

    QUnit.moduleDone(function (details) {
        sendMessage('suite:end', details.name, '', details.runtime, undefined);
    });
}

var _setupMessageCallbacks = setupMessageCallbacks;

__$Getters__['setupMessageCallbacks'] = function () {
    return setupMessageCallbacks;
};

__$Setters__['setupMessageCallbacks'] = function (value) {
    setupMessageCallbacks = value;
};

__$Resetters__['setupMessageCallbacks'] = function () {
    setupMessageCallbacks = _setupMessageCallbacks;
};

var _QUnitAdapter = QUnitAdapter;
var _QUnitAdapter2 = _QUnitAdapter;

__$Getters__['_QUnitAdapter'] = function () {
    return _QUnitAdapter;
};

__$Setters__['_QUnitAdapter'] = function (value) {
    _QUnitAdapter = value;
};

__$Resetters__['_QUnitAdapter'] = function () {
    _QUnitAdapter = _QUnitAdapter2;
};

var adapterFactory = {};

var _adapterFactory = adapterFactory;

__$Getters__['adapterFactory'] = function () {
    return adapterFactory;
};

__$Setters__['adapterFactory'] = function (value) {
    exports.adapterFactory = adapterFactory = value;
};

__$Resetters__['adapterFactory'] = function () {
    exports.adapterFactory = adapterFactory = _adapterFactory;
};

adapterFactory.run = function callee$0$0(cid, config, specs, capabilities) {
    var adapter;
    return _regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                adapter = new _QUnitAdapter(cid, config, specs, capabilities);
                context$1$0.next = 3;
                return _regeneratorRuntime.awrap(adapter.run());

            case 3:
                return context$1$0.abrupt('return', context$1$0.sent);

            case 4:
            case 'end':
                return context$1$0.stop();
        }
    }, null, this);
};

var _defaultExport = adapterFactory;

if (typeof _defaultExport === 'object' || typeof _defaultExport === 'function') {
    Object.defineProperty(_defaultExport, '__Rewire__', {
        'value': __Rewire__,
        'enumberable': false
    });
    Object.defineProperty(_defaultExport, '__set__', {
        'value': __Rewire__,
        'enumberable': false
    });
    Object.defineProperty(_defaultExport, '__ResetDependency__', {
        'value': __ResetDependency__,
        'enumberable': false
    });
    Object.defineProperty(_defaultExport, '__GetDependency__', {
        'value': __GetDependency__,
        'enumberable': false
    });
    Object.defineProperty(_defaultExport, '__get__', {
        'value': __GetDependency__,
        'enumberable': false
    });
    Object.defineProperty(_defaultExport, '__RewireAPI__', {
        'value': __RewireAPI__,
        'enumberable': false
    });
}

exports['default'] = _defaultExport;
exports.QUnitAdapter = QUnitAdapter;
exports.adapterFactory = adapterFactory;
exports.__GetDependency__ = __GetDependency__;
exports.__get__ = __GetDependency__;
exports.__Rewire__ = __Rewire__;
exports.__set__ = __Rewire__;
exports.__ResetDependency__ = __ResetDependency__;
exports.__RewireAPI__ = __RewireAPI__;
