const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS 
    },
  });

  await transporter.sendMail({ // ✅ fix 1: transporter
    from: `"Clarte SkinCare" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<h2>${subject}</h2><p>${html}</p>`,
  });
};

module.exports = sendEmail;
