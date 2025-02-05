interface ResetPasswordWithOtpTemplateProps {
  userName: string; // Tên người dùng
  resetLink: string; // Link reset mật khẩu
  otpCode: string; // Mã OTP
}

const resetPasswordWithOtpTemplate = ({
  userName,
  resetLink,
  otpCode,
}: ResetPasswordWithOtpTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Mật khẩu</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background: #f4f7fc;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 600px;
          width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h2 {
          color: #4a90e2;
          font-size: 28px;
          font-weight: bold;
        }
        .message {
          font-size: 16px;
          text-align: center;
          color: #555555;
          line-height: 1.5;
        }
        .otp-code {
          font-size: 26px;
          font-weight: bold;
          color: #ff6f61;
          margin: 20px 0;
          text-align: center;
        }
        .copy-btn {
          display: block;
          margin: 10px auto;
          background-color: #4a90e2;
          color: white;
          padding: 10px 20px;
          font-size: 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .copy-btn:hover {
          background-color: #2a6cb0;
        }
        .cta-link {
          display: block;
          text-align: center;
          margin-top: 30px;
        }
        .cta-link a {
          background-color: #4a90e2;
          color: white;
          padding: 12px 28px;
          font-size: 18px;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        .cta-link a:hover {
          background-color: #2a6cb0;
          transform: translateY(-3px);
        }
        .footer {
          margin-top: 30px;
          text-align: center;
        }
        .footer p {
          font-size: 14px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Đặt lại mật khẩu</h2>
        </div>
        <p class="message">Chào ${userName},</p>
        <p class="message">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Để tiếp tục, vui lòng nhập mã OTP dưới đây và nhấn vào liên kết để thay đổi mật khẩu:</p>
        
        <div class="otp-code" id="otpCode">${otpCode}</div>
      

        <p class="message">Mã OTP này sẽ hết hạn trong 10 phút.</p>

        <div class="cta-link">
          <a href="${resetLink}">Truy cập trang web để nhập mã OTP</a>
        </div>

        <p class="message">Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.</p>

        <div class="footer">
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ hỗ trợ khách hàng</p>
        </div>
      </div>

   
    </body>
    </html>
  `;
};

export default resetPasswordWithOtpTemplate;
