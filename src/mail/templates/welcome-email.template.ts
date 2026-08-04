interface WelcomeEmailParams {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
}

export function welcomeEmailTemplate(params: WelcomeEmailParams): string {
  const { name, email, password, loginUrl } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #1a73e8; color: #fff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; }
    .body { padding: 24px; color: #333; }
    .body p { line-height: 1.6; margin: 0 0 16px; }
    .credentials { background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .credentials code { font-family: 'Courier New', monospace; font-size: 14px; background: #e8eaed; padding: 2px 6px; border-radius: 3px; }
    .btn { display: inline-block; background: #1a73e8; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 16px 0; }
    .footer { background: #f8f9fa; padding: 16px 24px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Restaurant Management</h1>
    </div>
    <div class="body">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account has been created. Use the credentials below to log in:</p>

      <div class="credentials">
        <p><strong>Email:</strong> <code>${email}</code></p>
        <p><strong>Password:</strong> <code>${password}</code></p>
      </div>

      <a href="${loginUrl}" class="btn">Log In Now</a>

      <p>For security, please change your password after your first login.</p>
      <p>If you have any questions, contact your administrator.</p>
    </div>
    <div class="footer">
      This is an automated message. Please do not reply to this email.
    </div>
  </div>
</body>
</html>`;
}
