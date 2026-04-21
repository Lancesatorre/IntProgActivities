import nodemailer from 'nodemailer';
import config from '../../config.json';

export default async function sendEmail({ to, subject, html, from = config.smtpOptions.auth.user || config.emailFrom }: any) {
  try {
    console.log('Creating SMTP transporter with host:', config.smtpOptions.host);
    const transporter = nodemailer.createTransport(config.smtpOptions);
    await transporter.verify();
    
    console.log('Sending email to:', to);
    const result = await transporter.sendMail({ from, to, subject, html });
    console.log('Email sent successfully:', result);
    const previewUrl = nodemailer.getTestMessageUrl(result);
    if (previewUrl) {
      console.log('Ethereal preview URL:', previewUrl);
    }
    return result;
  } catch (error: any) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
}