import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

console.log(transporter);

export const sendEmail = async (toMail, subject, body) => {
  const info = await transporter.sendMail({
    from: 'test@gamil.com', // sender address
    to: toMail, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });
};

// sendEmail('sachinthapa@gamil.com', 'Test Email', '<h1>Test Email</h1>');
