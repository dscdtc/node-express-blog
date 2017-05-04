var router = require('express').Router();

var checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 注销
router.get('/', checkLogin, function(req, res, next) {
    // 清空 session 中用户信息
    req.session.user = null;
    req.flash('success', '注销成功');
    // 注销成功后跳转主页
    res.redirect('/posts');
});

module.exports = router;