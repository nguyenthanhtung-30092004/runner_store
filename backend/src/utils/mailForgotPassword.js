const { google } = require("googleapis");

const nodemailer = require("nodemailer");

require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const SendMailForgotPassword = async (email, otp) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const info = await transport.sendMail({
      from: `"Runner-Store" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Yêu cầu đặt lại mật khẩu",
      text: `Mã OTP để đặt lại mật khẩu của bạn là: ${otp}`,
      html: `
            <!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Đặt lại mật khẩu</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f7fb; font-family: 'Segoe UI', Roboto, Arial, sans-serif; color:#2d3436;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fb; padding:40px 0;">
    <tr>
      <td align="center">
        
        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c5ce7,#a29bfe); padding:32px; text-align:center; color:#ffffff;">
              <h1 style="margin:0; font-size:24px; font-weight:600;">
                Đặt lại mật khẩu
              </h1>
              <p style="margin:8px 0 0; font-size:14px; opacity:0.9;">
                Xác minh danh tính của bạn
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              <p style="font-size:16px; line-height:1.6; margin:0 0 16px;">
                Xin chào,
              </p>

              <p style="font-size:16px; line-height:1.6; margin:0 0 16px;">
                Chúng tôi đã nhận được yêu cầu <strong>đặt lại mật khẩu</strong> cho tài khoản sử dụng địa chỉ email này.
              </p>

              <p style="font-size:16px; line-height:1.6; margin:0 0 24px;">
                Vui lòng nhập mã xác thực (OTP) bên dưới để tiếp tục:
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; background-color:#f4f6ff; border:2px dashed #6c5ce7; border-radius:12px; padding:20px; margin-bottom:24px;">
                <span style="font-size:28px; font-weight:700; letter-spacing:6px; color:#6c5ce7;">
                  ${otp}
                </span>
              </div>

              <p style="font-size:14px; line-height:1.6; color:#636e72; margin:0 0 8px;">
                ⏱️ Mã OTP có hiệu lực trong <strong>5 phút</strong>.
              </p>

              <p style="font-size:14px; line-height:1.6; color:#636e72; margin:0;">
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ bộ phận hỗ trợ.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f1f3f8; padding:24px; text-align:center; font-size:13px; color:#636e72;">
              <p style="margin:0 0 8px;">
                Trân trọng,
              </p>
              <p style="margin:0; font-weight:600; color:#2d3436;">
                Runner-Store
              </p>
              <p style="margin:12px 0 0; font-size:12px; color:#b2bec3;">
                © 2025 Runner-Store. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

            `,
    });

    console.log("Forgot password email sent:", info.messageId);
  } catch (error) {
    console.log("Error sending forgot password email:", error);
  }
};

module.exports = SendMailForgotPassword;
