const express = require('express');
const { paymentController } = require('../controllers');

const {
  callBackHandler,
  paymentInitiate
} = paymentController();

const router = express.Router();

router.route('/initiate').post(paymentInitiate);
router.route('/callback').post(callBackHandler);

module.exports = router;
