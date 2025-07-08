const express = require('express');
const { dataControllers } = require('../controllers');
const { isAdmin } = require('../Modules/authJwt');
const router = express.Router();

const dependencies = {};
const { dataController } = dataControllers(dependencies);


const {
    addDataController,
    getDataController,
    deleteDataController,
    addDataMetaController,
    updateDataMetaController,
    getDataMetaByDataIDController,
    getDataMetaByMetaIDController,
    deleteDataMetaController,
    grantAccessController,
    revokeAccessController,
} = dataController;

router.route('/add').post(addDataController);
router.route('/get-all/:userID').get(getDataController);
router.route('/get/:data_id/:userID').get(getDataController);
router.route('/delete/:data_id').delete(deleteDataController);
router.route('/grant-access').post(isAdmin, grantAccessController);
router.route('/revoke-Access/:userID/:fieldID').delete(isAdmin, revokeAccessController);

router.route('/meta/get-all/:data_id').get(getDataMetaByDataIDController);
router.route('/meta/get-all/:data_id/:userID').get(getDataMetaByDataIDController);
router.route('/get/:meta_id').get(getDataMetaByMetaIDController);
router.route('/meta/add').post(addDataMetaController);
router.route('/meta/update').put(updateDataMetaController);
router.route('/meta/delete/:meta_id').delete(deleteDataMetaController);

module.exports = router;
