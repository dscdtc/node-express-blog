var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var router = require('express').Router();

var UserModel = require('../models/users')
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signup');
});

// POST /signup 注册
router.post('/', checkNotLogin, function(req, res, next) { //变量定义顺序
    var name = req.fields.name;
    var password = req.fields.password;
    var repassword = req.fields.repassword;
    var gender = req.fields.gender;
    var avatar = req.files.avatar.path.split(path.sep).pop(); //?????
    var bio = req.fields.bio;

    //校验参数
    try {
        if (!(name.length >= 1 && name.length <=10)) {
            throw new Error('用户名请限制在 1-10 个字符');
        }
        if (password.length < 6) {
            throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
            throw new Error('两次输入密码不一致');
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('请选择性别');
        }
        if (!(req.files.avatar.name)) { //?????
            throw new Error('请上传头像');
        }
    } catch (e) {
        //注册失败，异步删除上传头像
        fs.unlink(req.files.avatar.path); //?????
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

    //密码加密 sha1 并不是一种十分安全的加密方式，实际开发中可以使用更安全的 bcrypt 或 scrypt 加密 #加密放到浏览器执行
    password = sha1(password);

    //待写入数据库信息
    var user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    };
    //写入数据库
    UserModel.create(user)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // 将用户信息存入 session
            delete user.password;
            req.session.user = user;
            // 写入 flash
            req.flash('success', '注册成功');
            // 跳转到首页
            res.redirect('/posts');
        })
        .catch(function (e) {
            // 注册失败，异步删除上传头像
            fs.unlink(req.files.avatar.path);
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '用户名已被占用');
                return res.redirect('/signup');
            }
            next(e);
        });

});

module.exports = router;