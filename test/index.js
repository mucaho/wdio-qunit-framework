// Let babel transform all required modules
require('babel-register')({ cache: false })

// Two QUnit instances are needed, one for actual testing and
// one to be used inside the code under test
var QUnit = require('./qunit.test')

// Configure sinon
var sinon = require('sinon')
sinon.assert.fail = function (message) {
    QUnit.assert.ok(false, message)
}
sinon.assert.pass = function (message) {
    QUnit.assert.ok(true, message)
}
sinon.addBehavior('when', function (fake, message) {
    QUnit.assert.ok(true, message)
})

// Configure QUnit
QUnit.config.autostart = false
// QUnit.config.notrycatch = true
// QUnit.config.noglobals = true

QUnit.on('testEnd', function (testEnd) {
    process.stdout.write('.')

    testEnd.errors.forEach(function (error) {
        console.error('Description: ' + error.message)
        console.error(error.stack)
    })
})

QUnit.on('runEnd', function (data) {
    console.log()
    console.log('Passed: ' + data.testCounts.passed)
    console.log('Failed: ' + data.testCounts.failed)
    console.log('Skipped: ' + data.testCounts.skipped)
    console.log('Todo: ' + data.testCounts.todo)
    console.log('Total: ' + data.testCounts.total)
})

// Load tests
require('./adapter.spec')

// Start tests
QUnit.start()
