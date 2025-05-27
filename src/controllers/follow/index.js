const followUserController = require('./followUser.controller');
const getFollowingListController = require('./getFollowingList.controller');
const getFollowersListController = require('./getFollowersList.controller');

module.exports = (dependencies) => {
  return {
    followUserController: followUserController(dependencies),
    getFollowingListController: getFollowingListController(dependencies),
    getFollowersListController: getFollowersListController(dependencies),
  };
};
