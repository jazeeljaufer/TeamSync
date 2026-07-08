const transporter = require("../config/mail");

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Weekly Report System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
