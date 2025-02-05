interface EmailTemplateProps {
  name: string;
  url: string;
  expiryHours: number;
}

const verifyEmailTemplate = ({
  name,
  url,
  expiryHours,
}: EmailTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác Thực Email</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          background-color: #f9f9f9;
          font-family: Arial, sans-serif;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
          display: block;
          margin: 0 auto 30px;
          max-width: 120px;
          height: auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 26px;
          font-weight: bold;
          color: #333;
        }
        .content {
          color: #555;
          font-size: 16px;
          line-height: 1.8;
        }
        .content strong {
          color: #333;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background-color: #28a745;
          color: #fff;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 5px;
          font-size: 16px;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #218838;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
      
        <div class="header">
          <h1>Xác Thực Email</h1>
        </div>
        
        <div class="content">
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>MyShop</strong>!</p>
          <p>
            Để hoàn tất quá trình đăng ký và đảm bảo an toàn cho tài khoản, 
            vui lòng xác thực email của bạn bằng cách nhấn vào nút bên dưới:
          </p>
        </div>
        
        <div class="button-container">
          <a href="${url}" class="button">Xác Thực Ngay</a>
        </div>
        
        <div class="content">
          <p>
            Liên kết xác thực này sẽ hết hạn sau <strong>${expiryHours} giờ</strong>.
            Nếu bạn không tạo tài khoản tại <strong>MyShop</strong>, vui lòng bỏ qua email này.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>MyShop Inc.</strong></p>
          <p>[Địa chỉ của bạn]</p>
          <p>© ${new Date().getFullYear()} MyShop. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default verifyEmailTemplate;
