const addReelsController = require('./addReels.controller');
const archiveReelsController = require('./archiveReels.controller');
const getReelsByUserIDController = require('./getReelsByUserID.controller');
const getAllReelsController = require('./getAllReels.controller');
const deleteReelController = require('./deleteReel.controller');
const likeReelController = require('./likeReel.controller');
const dislikeReelController = require('./dislikeReel.controller');
const addCommentController = require('./addComment.controller');

module.exports = (dependencies) => {
  return {
    addReelsController: addReelsController(dependencies),
    archiveReelsController: archiveReelsController(dependencies),
    getReelsByUserIDController: getReelsByUserIDController(dependencies),
    getAllReelsController: getAllReelsController(dependencies),
    deleteReelController: deleteReelController(dependencies),
    likeReelController: likeReelController(dependencies),
    dislikeReelController: dislikeReelController(dependencies),
    addCommentController: addCommentController(dependencies)
  };
};
