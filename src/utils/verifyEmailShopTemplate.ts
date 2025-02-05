interface ShopEmailTemplateProps {
  shopName: string; // Tên shop
  name: string; // Tên chủ shop
  url: string; // URL xác minh
}

const verifyShopTemplate = ({
  shopName,
  name,
  url,
}: ShopEmailTemplateProps): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Shop</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                background-color: #FF5722;
                padding: 20px 10px;
                color: white;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                text-decoration: none;
                padding: 10px 20px;
                background-color: #FF5722;
                color: white;
                border-radius: 5px;
                font-weight: bold;
            }
            .btn:hover {
                background-color: #E64A19;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Verify Your Shop</h1>
            </div>
            <div class="content">
                <p>Hello ${name},</p>
                <p>Thank you for creating your shop <strong>${shopName}</strong> with us!</p>
                <p>To activate your shop and start selling, please verify your shop's email address by clicking the button below:</p>
                <a href="${url}" class="btn">Verify Shop</a>
                <p>If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Your Shop Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
export default verifyShopTemplate;
