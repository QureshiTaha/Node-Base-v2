const dataControllers = require('./dataControllers');

module.exports = (dependencies) => {
    return {
        dataController: dataControllers(dependencies),
    };
};
