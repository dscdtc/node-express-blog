var path = require('path');
var assert = require('assert');
var request = require('supertest');
var app = require('../index');
var User = require('../lib/mongo').User;

var testName1 = 'test'
var testName2 = 'dscdtc'
describe('signup', function() {
    describe('POST /signup', function() {
        var agent = request.agent(app); //persist cookie when redirect
        beforeEach(function(done) {
            //创建一个用户
            User.create({
                name: testName1,
                password: '123456',
                avatar: '',
                gender: 'x',
                bio: ''
            })
            .exec()
            .then(function() {
                done();
            })
            .catch(done);
        });
        afterEach(function(done) {
            // 删除测试用户
            User.remove({ name: { $in: [testName1, testName2] } })
                .exec()
                .then(function() {
                    done();
                })
                .catch(done);
        });

        //用户名错误
        it('wrong name', function(done) {
            console.log(path.join(__dirname, 'avatar.jpg'))
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.jpg'))
                .field({ name: '', gender: 'f', bio: 'hello node', password:'123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                    if (err) return done(err);
                    assert(res.text.match(/用户名请限制在 1-10 个字符/));
                    done();
                });
        });

        //性别错误
        it('wrong gender', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.jpg'))
                .field({ name: testName2, gender: 'fuckyou', bio: 'hello node', password:'123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                    if (err) return done(err);
                    assert(res.text.match(/请选择性别/));
                    done();
                });
        });
        
        //其余参数自行补充

        //用户名被占用
        it('duplicate name', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.jpg'))
                .field({ name: testName1, gender: 'm', bio: 'hello node', password:'123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                    if (err) return done(err);
                    assert(res.text.match(/用户名已被占用/));
                    done();
                });
        });
        
        //注册成功
        it('success', function(done) {
            agent
                .post('/signup')
                .type('form')
                .attach('avatar', path.join(__dirname, 'avatar.jpg'))
                .field({ name: testName2, gender: 'm', bio: 'hello node', password:'123456', repassword: '123456' })
                .redirects()
                .end(function(err, res) {
                    if (err) return done(err);
                    assert(res.text.match(/注册成功/));
                    done();
                });
        });

    });
});