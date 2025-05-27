const express = require('express');
const { coinsController } = require('../controllers'); 

const {
    addCoinsController, 
    sendCoinController,
    purchaseCoinController,
    userTotalCoinController,
    getTotalCoinStoreController,
    getAvailableCoinsController,
    listPurchasedCoinController,
    coinHistoryController,
} = coinsController();

const router = express.Router();

router.route('/add-coin').post(addCoinsController);
router.route('/send-coin').post(sendCoinController);
router.route('/purchase-coin').post(purchaseCoinController);
router.route('/user-total-coin').post(userTotalCoinController);  
router.route('/total-coin-store').get(getTotalCoinStoreController);
router.route('/available-coins').get(getAvailableCoinsController);
router.route('/purchased-coins').get(listPurchasedCoinController);
router.route('/coin-history/:coinStoreId').get(coinHistoryController);

module.exports = router;