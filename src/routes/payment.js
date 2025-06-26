const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const {
  encryptString,
  decryptString,
  MERCHANT_ID,
  ENCRYPTION_KEY,
  PAYMENT_BASE_URL,
  CALLBACK_URL
} = require('../Modules/paymentConfigs');

router.get('/initiate', (req, res) => {
  const order_id = "ORD" + Date.now().toString().toUpperCase();
  const amount = '1.00';
  const orderNo = order_id.slice(0, 35);
  const billing_phone = '9876543210';
  const billing_name = 'Kalpana';
  const latitude = '28.7041';
  const longitude = '77.1025';
  const txnReqType = 'S';

  const paymentRequest = {
    mid: MERCHANT_ID,
    enckey: ENCRYPTION_KEY,
    orderNo,
    amount,
    currency: 'INR',
    txnReqType,
    dateOfReg: new Date().toISOString().split('T')[0],
    customerVpa: '1789002584@gbl',
    name: billing_name,
    userId: 'ABCDEF1010',
    mobileNo: billing_phone,
    respUrl: CALLBACK_URL,
    udf1: latitude,
    udf2: longitude,
    udf3: '',
    udf4: '',
    udf5: '',
    udf6: '',
    udf7: '',
    udf8: '',
    udf9: '',
    udf10: '',
    udf11: '',
    udf12: '',
    udf13: '',
    udf14: ''
  };

  const encryptedPayload = encryptString(JSON.stringify(paymentRequest), ENCRYPTION_KEY);
  const paymentUrl = `${PAYMENT_BASE_URL}?payload=${encodeURIComponent(encryptedPayload)}&mid=${MERCHANT_ID}`;
  console.log(paymentRequest);
  
  

  res.status(200).json({ status: true, url: paymentUrl });
});

module.exports = router;
