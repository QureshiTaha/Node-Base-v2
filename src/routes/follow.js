const express = require('express');
const { followController } = require('../controllers');

const {
  followUserController,
  getFollowingListController,
  getFollowersListController,  
} = followController();

const router = express.Router();

router.post('/follow', followUserController);
router.post('/getFollowingList', getFollowingListController);
router.post('/getFollowersList', getFollowersListController);


module.exports = router;
