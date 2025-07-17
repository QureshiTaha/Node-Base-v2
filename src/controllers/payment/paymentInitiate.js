const { v4: uuidv4 } = require('uuid');


const {
    encryptString, decryptString, MERCHANT_ID,
    ENCRYPTION_KEY, PAYMENT_BASE_URL, CALLBACK_URL
} = require('../../Modules/paymentConfigs');


module.exports = (dependencies) => {
    return async (req, res) => {
        const order_id = 'ORD' + Date.now().toString().toUpperCase();
        const amount = '1.00';
        const orderNo = order_id.slice(0, 35);
        const billing_phone = '9876543210';
        const billing_name = 'Kalpana';
        const latitude = '28.7041';
        const longitude = '77.1025';
        const txnReqType = 'Slupi';

        const paymentRequest = {
            "mid": "UATCOS00096BHO",
            "enckey": "ulh1yx9kazhdsnnt2nmi9ydafwh744ks",
            "orderNo": order_id,
            "amount": "1.00",
            "currency": "INR",
            "txnReqType": "Slupi",
            "emailId": "ns200drift@gmail.com",
            "dateOfReg": "2025-06-30",
            "customerVpa": "1789002584@gbl",
            "name": "Kalpana",
            "userId": "string",
            "mobileNo": "9876543210",
            "respUrl": "https://api-dating-app.iceweb.in/api/v1/payment/callback",
            "udf1": "28.7041",
            "udf2": "77.1025",
            "udf3": "string",
            "udf4": "string",
            "udf5": "string",
            "udf6": "string",
            "udf7": "string",
            "udf8": "string",
            "udf9": "string",
            "udf10": "string",
            "udf11": "string",
            "udf12": "string",
            "udf13": "string",
            "udf14": "string",
            "userVpa": "string"
        };
        // const paymentRequest = {
        //   "mid": MERCHANT_ID,
        //   "enckey": ENCRYPTION_KEY,
        //   "orderNo": orderNo,
        //   "amount": amount,
        //   "currency": "INR",
        //   "txnReqType": txnReqType,
        //   "dateOfReg": new Date().toISOString().split("T")[0],
        //   "customerVpa": "1789002584@gbl",
        //   "emailId": "qureshi.t2000@gmail.com",
        //   "name": billing_name,
        //   "userId": "ABCDEF1010",
        //   "mobileNo": billing_phone,
        //   "respUrl": CALLBACK_URL,
        //   "udf1": latitude,
        //   "udf2": longitude,
        //   "udf3": "String",
        //   "udf4": "String",
        //   "udf5": "String",
        //   "udf6": "String",
        //   "udf7": "String",
        //   "udf8": "String",
        //   "udf9": "String",
        //   "udf10": "String",
        //   "udf11": "String",
        //   "udf12": "String",
        //   "udf13": "String",
        //   "udf14": "String",
        //   "userVpa": "string"
        // };

        const encryptedPayload = encryptString(JSON.stringify(paymentRequest), ENCRYPTION_KEY);


        console.log("MERCHANT_ID: ", MERCHANT_ID, "PAYMENT_BASE_URL: ", PAYMENT_BASE_URL);

        console.log("\n\nencryptedPayload: \n", encryptedPayload,"\n");
        
        const paymentUrl = `${PAYMENT_BASE_URL}?payload=${encodeURIComponent(encryptedPayload)}&mid=${MERCHANT_ID}`;
        console.log(paymentRequest);

        res.status(200).json({ status: true, url: paymentUrl });
    }
}