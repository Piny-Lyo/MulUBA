const Router = require('@koa/router');
const AdFeatureController = require('../controllers/ad-feature');
const APIController = require('../controllers/api');

const router = new Router({
    prefix: '/api'
});

/**
 * 接口
 */
router.get('/data', AdFeatureController.data);
router.get('/getUserByUserID', APIController.getUserByUserID);
router.get('/getUserBehaviorsByUserID', APIController.getUserBehaviorsByUserID);
router.get('/getUserBehaviorsOfHourByTime', APIController.getUserBehaviorsOfHourByTime);
router.get('/getUserBehaviorsOfMinByTime', APIController.getUserBehaviorsOfMinByTime);
// router.get('/getMinUserBehaviorsByTime', APIController.getMinUserBehaviorsByTime);

module.exports = router;