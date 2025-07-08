const dataUseCase = require('./dataUseCase');

module.exports = (dependencies) => {
    return {
        addDataController: async (req, res) => {
            try {
                const { data_value, userID } = req.body;
                if (!data_value || !userID) {
                    return res.status(400).json({ success: false, message: 'data_value and userID is required' });
                }
                isExist = await dataUseCase.checkIfExist({ data_value, data_id: null, userID });
                if (isExist.success === false) {
                    return res.status(400).json({ success: false, message: isExist.data });
                } else if (isExist.data.count > 0) {
                    return res.status(400).json({ success: false, message: 'data_value already exists' });
                } else {

                    const result = await dataUseCase.addData(data_value);
                    if (result) {
                        console.log({ adminID: userID, userID: userID, data_id: result.data[0].id });

                        await dataUseCase.grantAccess({ adminID: userID, userID: userID, data_id: result.data[0].id });
                        res.status(200).json({ success: result.success, data: result.data });
                    }
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        grantAccessController: async (req, res) => {
            try {
                const { data_id, userID, adminID } = req.body;
                if (!data_id || !userID || !adminID) {
                    return res.status(400).json({ success: false, message: 'data_id, adminID and userID are required' });
                }
                const result = await dataUseCase.grantAccess({ adminID, userID, data_id });
                if (result) {
                    res.status(200).json({ success: result.success, data: result.data });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        revokeAccessController: async (req, res) => {
            try {
                const { userID, fieldID } = req.params;

                if (!userID || !fieldID) {
                    return res.status(400).json({ success: false, message: 'userID and fieldID is required' });
                }
                const result = await dataUseCase.revokeAccess({ userID, data_id: fieldID });
                if (result) {
                    res.status(200).json({ success: result.success, data: result.data });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getDataController: async (req, res) => {
            try {
                const { data_id, userID } = req.params;

                const result = await dataUseCase.getData({ data_id, ...req.query, userID });
                if (result) {
                    res.status(200).json({ success: true, data: result });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        deleteDataController: async (req, res) => {
            try {
                const { data_id } = req.params;
                const result = await dataUseCase.deleteData({ data_id });
                if (result) {
                    res.status(200).json({ success: true, message: 'Data deleted successfully' });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        addDataMetaController: async (req, res) => {
            try {
                const { data_id, meta_key, meta_value } = req.body;

                if (!data_id || !meta_key || !meta_value) {
                    return res.status(400).json({ success: false, message: 'data_id, meta_key and meta_value are required' });
                }

                const isExist = await dataUseCase.checkIfExist({ data_value: null, data_id });
                console.log("isExist", isExist, isExist.data.count);

                if (isExist.success === false) {
                    return res.status(400).json({ success: false, message: isExist.data });
                } else if (isExist.success === true && isExist.data.count === 0) {
                    return res.status(400).json({ success: false, message: 'data_id not found' });
                }
                // Stringify if its JSON
                var filteredMetaValue = meta_value;
                if (typeof meta_value === 'object') {
                    filteredMetaValue = JSON.stringify(meta_value);
                }
                const result = await dataUseCase.addDataMeta({ data_id, meta_key, meta_value: filteredMetaValue });
                if (result) {
                    res.status(200).json({ success: true, data: result });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },

        updateDataMetaController: async (req, res) => {
            try {
                const { meta_id, meta_key, meta_value } = req.body;
                if (!meta_id) {
                    return res.status(400).json({ success: false, message: 'meta_id is required' });
                }
                filteredMetaValue = meta_value;
                if (typeof meta_value === 'object') {
                    filteredMetaValue = JSON.stringify(meta_value);
                }
                const result = await dataUseCase.updateDataMeta({ meta_id, meta_key, meta_value: filteredMetaValue });
                if (result) {
                    res.status(200).json({ success: true, data: result });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getDataMetaByDataIDController: async (req, res) => {
            try {
                const { data_id } = req.params;
                const result = await dataUseCase.getDataMetaByDataID({ data_id });
                if (result) {
                    res.status(200).json({ success: true, data: result });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getDataMetaByMetaIDController: async (req, res) => {
            try {
                const { meta_id } = req.params;
                const { page, limit } = req.query;

                const result = await dataUseCase.getDataMetaByMetaID({ meta_id, ...req.query });
                if (result) {
                    res.status(200).json({ success: true, data: result });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        deleteDataMetaController: async (req, res) => {
            try {
                const { meta_id } = req.params;
                const result = await dataUseCase.deleteDataMeta({ meta_id });
                if (result) {
                    res.status(200).json({ success: true, message: 'Data deleted successfully' });
                } else {
                    res.status(404).json({ success: false, message: 'Data not found' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
    };
};
