module.exports = function () {
    return config = {
        "nodemailerTransport": {
            host: process.env.HOST,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.UNAME, // generated ethereal user
                pass: process.env.PASSWORD // generated ethereal password
            },tls: {
                ignoreTLS:true,
                rejectUnauthorized: false
            }
        }
    }
}();

