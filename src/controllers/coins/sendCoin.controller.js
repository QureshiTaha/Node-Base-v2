const { sqlQuery } = require('../../Modules/sqlHandler');
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return async (req, res) => {
    const { senderId, receiverId, count } = req.body;

    if (!senderId || !receiverId || !count) {
      return res.status(400).json({
        status: false,
        msg: 'senderId, receiverId, and count are required'
      });
    }

    const numCount = Number(count);
    if (!Number.isInteger(numCount) || numCount <= 0) {
      return res.status(400).json({
        status: false,
        msg: 'count must be a positive integer'
      });
    }

    let transactionStarted = false;
    try {
      await sqlQuery('START TRANSACTION');
      transactionStarted = true;

      const [sender] = await sqlQuery(
        `SELECT 1 FROM db_users WHERE userID = ? AND userDeleted IS NULL LIMIT 1`,
        [senderId]
      );
      const [receiver] = await sqlQuery(
        `SELECT 1 FROM db_users WHERE userID = ? AND userDeleted IS NULL LIMIT 1`,
        [receiverId]
      );

      if (!sender || !receiver) {
        await sqlQuery('ROLLBACK');
        return res.status(404).json({
          status: false,
          msg: sender ? 'Receiver not found' : 'Sender not found'
        });
      }

      const coinsToTransfer = await sqlQuery(
        `SELECT coinStoreId FROM coin_store 
         WHERE ownerId = ? 
         LIMIT ? 
         FOR UPDATE`,
        [senderId, numCount]
      );

      if (coinsToTransfer.length < numCount) {
        await sqlQuery('ROLLBACK');
        return res.status(400).json({
          status: false,
          msg: `Sender only has ${coinsToTransfer.length} coins available`
        });
      }

      const coinIds = coinsToTransfer.map(c => c.coinStoreId);
      const batchSize = 100; 
      const concurrencyLimit = 5;

      const processTransfers = async () => {
        const batches = [];
        for (let i = 0; i < coinIds.length; i += batchSize) {
          batches.push(coinIds.slice(i, i + batchSize));
        }

        const processBatch = async (batch) => {
          const transactionId = uuidv4();
          
          await sqlQuery(
            `UPDATE coin_store 
             SET ownerId = ? 
             WHERE coinStoreId IN (?)`,
            [receiverId, batch]
          );

          const transactionValues = batch.map(id => 
            `('${uuidv4()}', '${id}', '${senderId}', '${receiverId}', NOW())`
          ).join(',');

          await sqlQuery(
            `INSERT INTO coin_transaction 
             (coinTransactionId, coinId, senderId, receiverId, transactionDate)
             VALUES ${transactionValues}`
          );
        };

        const runningBatches = new Set();
        const results = [];

        for (const batch of batches) {
          if (runningBatches.size >= concurrencyLimit) {
            await Promise.race(runningBatches);
          }

          const batchPromise = processBatch(batch)
            .finally(() => runningBatches.delete(batchPromise));
          
          runningBatches.add(batchPromise);
          results.push(batchPromise);
        }

        await Promise.all(results);
      };

      await processTransfers();
      await sqlQuery('COMMIT');
      transactionStarted = false;

      return res.status(200).json({
        status: true,
        msg: `${coinIds.length} coins transferred successfully`,
        transferredCoins: coinIds
      });

    } catch (error) {
      if (transactionStarted) {
        await sqlQuery('ROLLBACK').catch(rollbackError => {
          console.error('Rollback failed:', rollbackError);
        });
      }

      console.error('Transfer error:', error);
      return res.status(500).json({
        status: false,
        msg: 'Transfer failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};