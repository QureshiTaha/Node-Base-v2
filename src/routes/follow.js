const express = require('express');
const { followController } = require('../controllers');

const {
  followUserController,
  getFollowingListController,
  getFollowersListController,  
  unfollowController,
  checkFollowController,
} = followController();

const router = express.Router();

router.post('/follow', followUserController);
router.post('/getFollowingList', getFollowingListController);
router.post('/getFollowersList', getFollowersListController);
router.post('/unfollow', unfollowController);
router.post('/checkFollow', checkFollowController);


module.exports = router;
