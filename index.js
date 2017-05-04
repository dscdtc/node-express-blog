var path = require('path');
var express = require('express');
//var winston = require('winston');
//var expresswinston = require('express-winston');
var flash = require('connect-flash')();
var session = require('express-session');
var formidable = require('express-formidable');
var config = require('config-lite')(__dirname);
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes');
var pkg = require('./package');

// 生成一个 express 实例 app
var app = express();

// 设置模板文件目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板文件引擎为ejs
app.set('view engine', 'ejs');

// 设置在静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// session中间件
app.use(session({
    name: config.session.key, // 设置cookie中保存session id的字段名称
    secret: config.session.secret, // 通过设置secret来计算hash值并放在cookie中，使产生的signedCookie防篡改
    resave: true, // 强制更新 session
    saveUninitialized: false, // 设置为false，强制创建一个session，即使用户未登录
    cookie: {
        maxAge: config.session.maxAge // 过期时间，过期后cookie中的session id自动删除
    },
    store: new MongoStore({ // 将session存储到mongodb
        url: config.mongodb // mongodb地址
    })
}));

// flash中间件-显示通知
app.use(flash);

// 处理表单及文件上传的中间件
app.use(formidable({
    uploadDir: path.join(__dirname, './public/img'), // 上传文件目录
    keepExtensions: true // 保留后缀
}));

//设置模板全局常量
app.locals.blog = {
    title: pkg.name,
    description: pkg.description
};

//添加模板必须的三个变量
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

// // 正常请求日志
// app.use(expresswinston.logger({
//     transports: [
//         // new winston.transports.Console ({
//         //     json: true,
//         //     colorize: true
//         // }),
//         new winston.transports.File ({
//             filename: 'logs/success.log'
//         })
//     ]
// }));
// 路由
routes(app);
// // 错误请求日志
// app.use(expresswinston.errorLogger({
//     transports: [
//         new winston.transports.Console ({
//             json: true,
//             colorize: true
//         }),
//         new winston.transports.File ({
//             filename: 'logs/error.log'
//         })
//     ]
// }))

// 自定义错误提示页面
app.use(function(err, req, res, next) {
    res.render('error', {error: err});
});

// 监听端口，启动程序
const port = process.env.PORT || config.port; // Heroku 会动态分配端口，所以不能用配置文件里写死的端口
if (module.parent) { // 直接启动 index.js 则会监听端口启动程序，如果 index.js 被 require 了，则导出 app，通常用于测试
    module.exports = app;
} else {
    app.listen(port, function() {
        console.log(`${pkg.name} Listerning on port ${port}`);
    });
}
