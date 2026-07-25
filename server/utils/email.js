const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // 465 端口使用 SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://abook2read.xyz';

/**
 * 发送邮箱验证邮件
 */
async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="max-width:480px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;border:1px solid #e0e0e0;border-radius:8px;">
      <h2 style="color:#6366f1;margin:0 0 16px;">📖 静志博客</h2>
      <p style="font-size:16px;color:#333;">感谢注册！请点击下方按钮验证您的邮箱地址：</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;margin:16px 0;">验证邮箱</a>
      <p style="font-size:13px;color:#888;">如果按钮无法点击，请复制以下链接到浏览器：</p>
      <p style="font-size:12px;color:#aaa;word-break:break-all;">${verifyUrl}</p>
      <p style="font-size:13px;color:#888;">如非本人操作，请忽略此邮件。</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: '验证您的邮箱 - 静志博客',
    html,
  });

  return { messageId: info.messageId };
}

/**
 * 发送密码重置邮件
 */
async function sendPasswordResetEmail(toEmail, token) {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="max-width:480px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;border:1px solid #e0e0e0;border-radius:8px;">
      <h2 style="color:#6366f1;margin:0 0 16px;">📖 静志博客</h2>
      <p style="font-size:16px;color:#333;">您正在申请重置密码，请点击下方按钮设置新密码：</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;margin:16px 0;">重置密码</a>
      <p style="font-size:13px;color:#888;">如果按钮无法点击，请复制以下链接到浏览器：</p>
      <p style="font-size:12px;color:#aaa;word-break:break-all;">${resetUrl}</p>
      <p style="font-size:13px;color:#888;">链接有效期为 1 小时。如非本人操作，请忽略此邮件。</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: '重置密码 - 静志博客',
    html,
  });

  return { messageId: info.messageId };
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };