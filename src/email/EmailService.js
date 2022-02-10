const { transporter } = require('../config/emailTransporter');

const sendEmailActivation = async (email, token) => {
  await transporter.sendMail({
    from: 'My app <info@app.com',
    to: email,
    subject: 'Activate your account',
    html: `Token is ${token}`,
  });
};

module.exports = { sendEmailActivation };
