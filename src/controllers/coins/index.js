const addCoinsController = require('./addCoin.controller');
const sendCoinController = require('./sendCoin.controller');
const purchaseCoinController = require('./purchaseCoin.controller');
const userTotalCoinController = require('./userTotalCoin.controller');
const getTotalCoinStoreController = require('./getTotalCoinStore.controller');
const getAvailableCoinsController = require('./getAvailableCoins.controller');
const listPurchasedCoinController = require('./listPurchasedCoin.controller');
const coinHistoryController = require('./coinHistory.controller');

module.exports = (dependencies) => {
  return {
    addCoinsController: addCoinsController(dependencies),
    sendCoinController: sendCoinController(dependencies),
    purchaseCoinController: purchaseCoinController(dependencies),
    userTotalCoinController: userTotalCoinController(dependencies),
    getTotalCoinStoreController: getTotalCoinStoreController(dependencies),
    getAvailableCoinsController: getAvailableCoinsController(dependencies),
    listPurchasedCoinController: listPurchasedCoinController(dependencies),
    coinHistoryController: coinHistoryController(dependencies),
  };
};

