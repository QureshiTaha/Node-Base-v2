const express = require('express');
const { reelsController } = require('../controllers');

const {
  addReelsController,
  archiveReelsController,
  getReelsByUserIDController,
  getAllReelsController,
  deleteReelController,
  likeReelController,
  dislikeReelController,
  addCommentsController,
  deleteCommentsController,
  interactionStatusController,
} = reelsController();

const router = express.Router();

router.route('/').post(addReelsController);
router.route('/setArchive/:reelID/:isArchive').post(archiveReelsController);
router.route('/by-userID/:userID').get(getReelsByUserIDController);
router.route('/get-latest').get(getAllReelsController);
router.route('/delete/:reelID').delete(deleteReelController);
router.route('/like').post(likeReelController);
router.route('/dislike').post(dislikeReelController);
router.route('/add-comment').post(addCommentsController);
router.route('/delete-comment').post(deleteCommentsController);
router.route('/interaction-status/:reelId/:userID').get(interactionStatusController);
module.exports = router;
