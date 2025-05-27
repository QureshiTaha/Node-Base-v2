const sql = require('../../Modules/sqlHandler');
const { v4: uuidv4 } = require('uuid');
const sqlQuery = sql.query;

module.exports = () => {
  return async (req, res) => {
    const { userId, count } = req.body;

    if (!userId || !count) {
      return res.status(400).json({
        status: false,
        msg: 'userId and count are required'
      });
    } else if (isNaN(count)) {
      return res.status(400).json({
        status: false,
        msg: 'Count must be a number'
      });
    } else if (count <= 0) {
      return res.status(400).json({
        status: false,
        msg: 'Count must be greater than 0'
      });
    }

    try {
      const batchInsert = async (count) => {
        const batchSize = 100;
        const concurrencyLimit = 5;
        const batches = [];

        // Create batches with multiple rows
        for (let i = 0; i < count; i++) {
          const coinStoreId = uuidv4();
          const batchIndex = Math.floor(i / batchSize);

          if (!batches[batchIndex]) {
            batches[batchIndex] = [];
          }
          batches[batchIndex].push(`('${coinStoreId}')`);
        }
        const runBatchInsert = async (batch) => {
          const insertQuery = `
      INSERT INTO coin_store (coinStoreId)
      VALUES ${batch.join(', ')}
    `;
          await sqlQuery(insertQuery);
        };

        const executeBatchesConcurrently = async () => {
          const results = [];
          const runningBatches = [];

          for (let i = 0; i < batches.length; i++) {
            if (runningBatches.length >= concurrencyLimit) {
              const completedBatch = await Promise.race(runningBatches);
              runningBatches.splice(runningBatches.indexOf(completedBatch), 1);
            }
            const batchPromise = runBatchInsert(batches[i]);
            runningBatches.push(batchPromise);
            results.push(batchPromise);
          }
          await Promise.all(results);
        };

        await executeBatchesConcurrently();
      };

      await batchInsert(count);
      return res.status(201).json({
        status: true,
        msg: 'Coins added successfully'
      });
    } catch (error) {
      console.error('Error adding coins:', error);
      return res.status(500).json({
        status: false,
        msg: 'Internal Server Error',
        error: error.toString()
      });
    }
  };
};
