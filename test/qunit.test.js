// Two QUnit instances are needed, one for actual testing and
// one to be used inside the code under test

// this is the QUnit instance used for testing
// it should be required at the start of testing
// all following requires to 'qunitjs' will return a different instance
import QUnit from 'qunitjs'
delete require.cache[require.resolve('qunitjs')]

export default QUnit
