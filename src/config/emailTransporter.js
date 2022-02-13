const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    port: 8587,
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = { transporter };
