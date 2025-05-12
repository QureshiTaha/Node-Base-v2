const express = require("express");
const { reelsController } =  require('../controllers');



const{addReelsController,archiveReelsController,getReelsByUserIDController,getAllReelsController,deleteReelController} = reelsController()

    const router = express.Router();
    router.route("/").post( addReelsController) 
    router.route("/setArchive/:reelID/:isArchive").post( archiveReelsController) 
    router.route("/by-userID/:userID").get(getReelsByUserIDController)
    router.route("/get-latest").get(getAllReelsController)
    router.route("/delete/:reelID").delete(deleteReelController)

module.exports = router;
