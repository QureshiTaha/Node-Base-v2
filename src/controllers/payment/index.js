
const callBackHandler = require('./callBackHandler');
const paymentInitiate = require('./paymentInitiate');
module.exports = (dependencies) => {
    return {
        callBackHandler: callBackHandler(dependencies),
        paymentInitiate: paymentInitiate(dependencies)
    }
}