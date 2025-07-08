const { sqlQuery } = require('../../Modules/sqlHandler');

module.exports = {
    // Add Data
    addData: async (data_value) => {
        try {
            const query = `INSERT INTO db_data (data_value) VALUES (?)`;
            const result = await sqlQuery(query, [data_value]);
            // Get the ID of the inserted data
            if (result.affectedRows > 0) {
                resultData = await sqlQuery(`SELECT * FROM db_data WHERE id = ?`, [result.insertId]);
                return { success: true, data: resultData };

            }
        } catch (error) {
            return { success: false, data: `Error adding data: ${error.message}` };
        }
    },
    checkIfExist: async ({ data_value, data_id }) => {
        try {
            const query = `SELECT count(1) as count FROM db_data WHERE (data_value = ? || id = ?)`;;
            const result = await sqlQuery(query, [data_value, data_id]);
            return { success: true, data: result[0] };
        } catch (error) {
            return { success: false, data: `Error While Checking Existence: ${error.message}` };
        }

    },
    // 
    grantAccess: async ({ adminID, userID, data_id }) => {
        const query = `
        INSERT IGNORE INTO db_data_access (data_id, userID, granted_by)
        VALUES (?, ?, ?)
    `;
        try {
            await sqlQuery(query, [data_id, userID, adminID]);
            return { success: true, message: 'Access granted' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    revokeAccess: async ({ userID, data_id }) => {
        const query = `DELETE FROM db_data_access WHERE userID = ? AND data_id = ?`;
        try {
            await sqlQuery(query, [userID, data_id]);
            return { success: true, message: 'Access revoked' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Get Data
    getAllData: async ({ data_id, page = 1, limit = 10 }) => {
        const offset = (page - 1) * limit;
        const queryParams = data_id ? [data_id] : [];
        const baseQuery = data_id ? `SELECT * FROM db_data WHERE id = ?` : `SELECT * FROM db_data ORDER BY id DESC LIMIT ? OFFSET ?`;

        try {
            var result = await sqlQuery(baseQuery, data_id ? queryParams : [limit, offset]);
            const totalCount = await sqlQuery(`SELECT count(1) as count FROM db_data${data_id ? ' WHERE id = ?' : ''}`, queryParams);

            if (result.length > 0) {
                const haveMore = totalCount[0].count > offset + limit;
                result[result.length - 1].haveMore = haveMore;
                result[result.length - 1].totalCount = totalCount[0].count;
            }

            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error getting data: ${error.message}` };
        }
    },

    getData: async ({ userID, data_id, page = 1, limit = 10 }) => {
        const offset = (page - 1) * limit;
        const params = [userID];

        let baseQuery = `
        SELECT d.* FROM db_data d
        INNER JOIN db_data_access a ON d.id = a.data_id
        WHERE a.userID = ?
    `;

        if (data_id) {
            baseQuery += ' AND d.id = ?';
            params.push(data_id);
        } else {
            baseQuery += ` ORDER BY d.data_value ASC LIMIT ${limit} OFFSET ${offset}`;
        }

        const countQuery = `
        SELECT COUNT(1) AS count FROM db_data d
        INNER JOIN db_data_access a ON d.id = a.data_id
        WHERE a.userID = ?
        ${data_id ? ' AND d.id = ?' : ''}
    `;

        try {
            var result = await sqlQuery(baseQuery, params);
            const totalCount = await sqlQuery(countQuery, params);

            if (result.length > 0) {
                const haveMore = totalCount[0].count > offset + limit;
                result[result.length - 1].haveMore = haveMore;
                result[result.length - 1].totalCount = totalCount[0].count;
            }

            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error getting data: ${error.message}` };
        }
    },


    // Delete Data
    deleteData: async (data) => {
        const { data_id } = data
        try {
            const query = `DELETE FROM db_data WHERE id = ?`;
            const result = await sqlQuery(query, [data_id]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error deleting data: ${error.message}` };
        }
    },

    getDataMetaByDataID: async (data) => {
        const { data_id } = data;
        try {
            const query = `SELECT * FROM db_datameta WHERE data_id = ?`;
            const result = await sqlQuery(query, [data_id]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error getting data meta: ${error.message}` };
        }
    },
    getDataMetaByMetaID: async (data) => {
        const { meta_id } = data;
        try {
            const query = `SELECT * FROM db_datameta WHERE id = ?`;
            const result = await sqlQuery(query, [meta_id]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error getting data meta: ${error.message}` };
        }
    },

    addDataMeta: async (data) => {
        const { data_id, meta_key, meta_value } = data;
        console.log("Data", data);

        try {
            const query = `INSERT INTO db_datameta (data_id, meta_key, meta_value) VALUES (?, ?, ?)`;
            const result = await sqlQuery(query, [data_id, meta_key, meta_value]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error adding data meta: ${error.message}` };
        }
    },
    updateDataMeta: async (data) => {
        const { meta_id, meta_key, meta_value } = data;
        if (!meta_id) {
            return { success: false, data: "meta_id is required" };
        }
        let updateFields = [];
        let values = [];

        try {
            if (meta_key) {
                updateFields.push('meta_key = ?');
                values.push(meta_key);
            }
            if (meta_value) {
                updateFields.push('meta_value = ?');
                values.push(meta_value);
            }
            if (updateFields.length > 0) {
                const query = `UPDATE db_datameta SET ${updateFields.join(', ')} WHERE id = ?`;
                const result = await sqlQuery(query, [...values, meta_id]);
                return { success: true, data: result };
            } else {
                return { success: false, data: "No fields to update" };
            }

        } catch (error) {
            return { success: false, data: `Error updating data meta: ${error.message}` };
        }
    },
    deleteDataMeta: async (data) => {
        const { meta_id } = data;
        try {
            const query = `DELETE FROM db_datameta WHERE id = ?`;
            const result = await sqlQuery(query, [meta_id]);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, data: `Error deleting data meta: ${error.message}` };
        }
    },


};
