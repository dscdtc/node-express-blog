module.exports = {
    port: 3000,
    session: {
        secret: 'myblog',
        key: 'dscdtc$201705',
        maxAge:2592000000
    },
    mongodb: 'mongodb://myblog:myblog-1753@ds137090.mlab.com:37090/dscdtc'
};