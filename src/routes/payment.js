const express = require('express');
const { paymentController } = require('../controllers');

const {
  callBackHandler,
  paymentInitiate
} = paymentController();

const router = express.Router();

router.route('/initiate').get(paymentInitiate);
router.route('/callback').get(callBackHandler);

module.exports = router;
