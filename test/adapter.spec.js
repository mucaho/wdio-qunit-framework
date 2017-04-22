import QUnit from './qunit.test'
import sinon from 'sinon'

/**
 * import mocks
 */
import { adapterFactory, QUnitAdapter } from '../lib/adapter'
import QUnitMock from 'qunitjs'

QUnit.module('QUnitAdapterFactory', (hooks) => {
    const sandbox = sinon.sandbox.create()

    hooks.afterEach(() => {
        sandbox.verifyAndRestore()
    })

    QUnit.test('should by invoking the run method call', (assert) => {
        sandbox.spy(adapterFactory, 'run')

        let adapter = sandbox.mock(QUnitAdapter.prototype)
        adapter.expects('construct').once().withExactArgs(1, 2, 3, 4).thus('create an adapter instance')
        adapter.expects('run').once().thus('immediately start the run sequence')

        adapterFactory.run(1, 2, 3, 4)
            .then(assert.async())
    })
})

QUnit.module('QUnitAdapter', (hooks) => {
    const sandbox = sinon.sandbox.create()

    let cid = 1
    const title = 'qunit-tests'
    let config = { framework: 'qunit', title: title }
    let specs = ['fileA.js', 'fileB.js']
    let caps = { browserName: 'chrome' }

    let adapter, load

    QUnit.module('can load external modules', (hooks) => {
        hooks.beforeEach(() => {
            adapter = new QUnitAdapter(cid, config, specs, caps)
            sandbox.stub(process, 'cwd').returns('mypath')
        })

        QUnit.test('should do nothing if no modules are required', () => {
            sandbox.mock(QUnitAdapter.prototype).expects('load').never()
            adapter.requireExternalModules([])
        })

        QUnit.test('should throw an exception if passed invalid name', (assert) => {
            let spy = sandbox.spy(QUnitAdapter.prototype, 'requireExternalModules')
            assert.throws(adapter.requireExternalModules.bind(adapter, [1]))
            sinon.assert.alwaysThrew(spy)
        })

        QUnit.test('should do nothing if no modules', () => {
            sandbox.mock(QUnitAdapter.prototype).expects('load').never()
            adapter.construct(undefined, undefined, [], undefined)
            adapter.run()
        })

        QUnit.test('should load modules', () => {
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

    hooks.afterEach((assert) => {
        sandbox.verifyAndRestore()
    })
})
