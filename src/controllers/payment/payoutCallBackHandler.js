const { decryptString, ENCRYPTION_KEY } = require("../../Modules/paymentConfigs");
const { v4: uuidv4 } = require('uuid');
const { myConsole } = require("../../utils/myConsole");

module.exports = (dependencies) => {
    return async (req, res) => {
        try {
            myConsole("\n Payout - Req Body -", req.body);
            // {
            //     "attempt": "1",
            //     "transactionStatus": "success",
            //     "referenceId": "REF1756802364104",
            //     "txnId": "BX20250902083924852315A66598e2b667f",
            //     "providerMessage": "",
            //     "transferType": "IMPS",
            //     "bankReferenceNumber": "524514255070",
            //     "beneficiaryName": "Mohammed Taha Qureshi",
            //     "amount": "1.94"
            // },
            const { attempt, transactionStatus, referenceId, txnId, providerMessage, transferType, bankReferenceNumber, beneficiaryName, amount } = req.body;
            await sqlQuery(
                `UPDATE db_coin_transaction 
                SET  status = ?, metaData = ?
                WHERE coinTransactionId = ?`,
                [
                    'withdraw-success',
                    JSON.stringify(req.body),
                    referenceId
                ]
            );

            // await sqlQuery('INSERT INTO db_coin_payments (paymentId, userId, coinCount,amount, createdAt, paymentType, status) VALUES (?, ?, ?, ?, NOW(), ?, ?)',
            //      [txnId, userID, coinCount, amount, 'debit', 'processing']);

            await sqlQuery('UPDATE db_coin_payments SET amount = ?  AND status = ? where transactionId = ?',
                [ amount, 'success', referenceId]);


            return res.status(200).json({
                status: true,
                msg: 'Payout Callback received successfully',
                data: req.body
            });
        } catch (error) {
            console.log("error/exception occurred\n stacktrace", error);

            return res.status(500).json({
                status: false,
                msg: 'error/exception occurred\n stacktrace: ' + error,
            });
        }
    }
};