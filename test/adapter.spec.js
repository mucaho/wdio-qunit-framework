import QUnit from './qunit.test'
import sinon from 'sinon'

/**
 * import mocks
 */
import { adapterFactory, QUnitAdapter } from '../lib/adapter'
// import QUnitMock from 'qunitjs'

QUnit.module('QUnitAdapterFactory', (hooks) => {
    const sandbox = sinon.sandbox.create()

    hooks.before((assert) => {
        sandbox.spy(adapterFactory, 'run')
    })
    hooks.beforeEach((assert) => {
        sandbox.reset()
    })

    QUnit.test('should by calling the run method', (assert) => {
        let adapter = sandbox.mock(QUnitAdapter.prototype)
        adapter.expects('construct').once().withExactArgs(1, 2, 3, 4).when('creating an adapter instance')
        adapter.expects('run').once().when('immediately starting the run sequence')

        adapterFactory.run(1, 2, 3, 4)
            .then(assert.async())
    })

    hooks.afterEach((assert) => {
        sandbox.verify()
    })

    hooks.after((assert) => {
        sandbox.restore()
    })
})

/*
QUnit.module('QUnitAdapter', (hooks) => {
    let adapter, load, send, sendInternal, originalCWD

    let cid = 1
    const title = 'qunit-tests'
    let config = { framework: 'qunit', title: title }
    let specs = ['fileA.js', 'fileB.js']
    let caps = { browserName: 'chrome' }

        beforeEach(() => {
            adapter = new MochaAdapter(cid, config, specs, caps)
            load = adapter.load = sinon.spy()
            send = adapter.send = sinon.stub()
            send.returns(true)

            sendInternal = adapter.sendInternal = sinon.spy()
        })

    const sandbox = sinon.sandbox.create()

    hooks.before((assert) => {
        sandbox.stub(process, 'cwd', () => return 'mypath')
        sandbox.stub(QUnitAdapter.prototype, 'construct')
        sandbox.stub(QUnitAdapter.prototype, 'run')
        sandbox.spy(adapterFactory, 'run')
    })

    QUnit.test('should create an adapter instance', (assert) => {
        var done = assert.async()

        adapterFactory
            .run(1, 2, 3, 4)
            .then(() => {
                sandbox.assert.calledWith(adapterFactory.run, 1, 2, 3, 4)
                sandbox.assert.calledWith(QUnitAdapter.prototype.construct, 1, 2, 3, 4)
                done()
            })
    })

    QUnit.test('should immediately start the run sequence', (assert) => {
        var done = assert.async()

        adapterFactory
            .run(1, 2, 3, 4)
            .then(() => {
                sandbox.assert.calledOnce(QUnitAdapter.prototype.run)
                done()
            })
    })

    hooks.afterEach((assert) => {
        sandbox.reset()
    })

    hooks.after((assert) => {
        sandbox.restore()
    })
})
*/
/*
describe('mocha adapter', () => {
    before(() => {
        adapterFactory.__Rewire__('Mocha', Mocka)
    })

    describe('MochaAdapter', () => {
        let adapter, load, send, sendInternal, originalCWD

        let cid = 1
        const title = 'mocha-tests'
        let config = { framework: 'mocha', title: title }
        let specs = ['fileA.js', 'fileB.js']
        let caps = { browserName: 'chrome' }

        before(() => {
            originalCWD = process.cwd
            Object.defineProperty(process, 'cwd', {
                value: function () { return '/mypath' }
            })
        })

        beforeEach(() => {
            adapter = new MochaAdapter(cid, config, specs, caps)
            load = adapter.load = sinon.spy()
            send = adapter.send = sinon.stub()
            send.returns(true)

            sendInternal = adapter.sendInternal = sinon.spy()
        })

        describe('can load external modules', () => {
            it('should do nothing if no modules are required', () => {
                adapter.requireExternalModules([])
                load.called.should.be.false()
            })

            it('should throw an exception if passed invalid name', () => {
                adapter.requireExternalModules.bind(adapter, [1]).should.throw()
            })

            it('should do nothing if no compilers', () => {
                adapter.options({ compilers: [], require: [] })
                load.called.should.be.false()
                load.called.should.be.false()
            })

            it('should load modules', () => {
                let context = { context: true }

                adapter.options({
                    require: './lib/moduleA',
                    compilers: ['js:moduleB', './lib/moduleC']
                }, context)

                load.calledWith('/mypath/lib/moduleA', context).should.be.true()
                load.calledWith('moduleB', context).should.be.true()
                load.calledWith('/mypath/lib/moduleC', context).should.be.true()
            })
        })

        describe('sends event messages', () => {
            it('should have proper message payload', () => {
                let err = { unAllowedProp: true, message: 'Uuups' }
                adapter.emit('suite:start', config, err)

                let msg = send.firstCall.args[0]
                msg.type.should.be.exactly('suite:start')
                msg.cid.should.be.exactly(cid)
                msg.uid.should.startWith(title)
                msg.specs.should.be.exactly(specs)
                msg.runner[cid].should.be.exactly(caps)
                msg.err.should.not.have.property('unAllowedProp')
                msg.err.message.should.be.exactly('Uuups')
            })

            it('should not emit an internal message by default', () => {
                adapter.emit('suite:start', config)
                sendInternal.called.should.be.false()
            })

            it('should emit an internal message when starting a test', () => {
                adapter.emit('test:start', config)
                let event = sendInternal.firstCall.args[0]
                event.should.be.exactly('test:start')

                let msg = sendInternal.firstCall.args[1]
                msg.cid.should.be.exactly(cid)
                msg.uid.should.startWith(title)
                msg.specs.should.be.exactly(specs)
                msg.runner[cid].should.be.exactly(caps)
            })

            it('should not emit any messages for root test suite events', () => {
                adapter.emit('suite:end', { root: true })
                send.called.should.be.false()
                sendInternal.called.should.be.false()
            })
        })

        describe('runs Mocha tests', () => {
            it('should run return right amount of errors', () => {
                let promise = adapter.run().then((failures) => {
                    failures.should.be.exactly(1234)
                })
                setTimeout(() => run.callArgWith(0, 1234), 100)
                return promise
            })

            it('should load files, wrap commands and run hooks', () => {
                loadFiles.called.should.be.true()
                addFile.called.should.be.true()
                reporter.called.should.be.true()
                fullTrace.called.should.be.true()
            })
        })

        it('should wait until all events were sent', (done) => {
            const start = (new Date()).getTime()
            adapter.run().then((failures) => {
                const end = (new Date()).getTime();
                (end - start).should.be.greaterThan(500)
                failures.should.be.exactly(1234)
            })
            adapter.emit('suite:start', {}, {})
            adapter.emit('suite:end', {}, {})

            setTimeout(() => {
                run.callArgWith(0, 1234)
                send.args[0][3]()
                send.args[1][3]()
                done()
            }, 500)
        })

        after(() => {
            Object.defineProperty(process, 'cwd', {
                value: originalCWD
            })
        })
    })

    after(() => {
        adapterFactory.__ResetDependency__('Mocha')
        adapterFactory.__ResetDependency__('wrapCommands')
        adapterFactory.__ResetDependency__('runInFiberContext')
        adapterFactory.__ResetDependency__('executeHooksWithArgs')
    })
})
*/
