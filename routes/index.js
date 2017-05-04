module.exports = function (app) {
    app.get('/', function(req, res) {
        res.redirect('/posts');
    });
    app.get('/favicon.ico', function(req, res) {
        res.end("");
    });
    app.use('/signup', require('./signup'));
    app.use('/signin', require('./signin'));
    app.use('/signout', require('./signout'));
    app.use('/posts', require('./posts'));
    // 404 Page
    app.use(function(req,res) {
        if (!res.headersSent) {
            res.render('404');
        }
    });
};
