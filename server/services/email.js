import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.VITE_APP_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Recuperación de Contraseña - Perro Negro',
    html: `
      <h1>Recuperación de Contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}