const { get } = require("../../routes");
const addReelsController = require("./addReels.controller");
const archiveReelsController = require("./archiveReels.controller");
const getReelsByUserIDController = require("./getReelsByUserID.controller");
const getAllReelsController = require("./getAllReels.controller");
const deleteReelController = require("./deleteReel.controller");
module.exports=(dependencies)=>{
    return{
        addReelsController:addReelsController(dependencies),
        archiveReelsController:archiveReelsController(dependencies),
        getReelsByUserIDController:getReelsByUserIDController(dependencies),
        getAllReelsController:getAllReelsController(dependencies),
        deleteReelController:deleteReelController(dependencies)
    }
}