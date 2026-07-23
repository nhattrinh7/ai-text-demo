import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, code: string) => {
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333333; margin-bottom: 20px;">Verify your email address</h2>
        <p style="color: #666666; font-size: 16px; margin-bottom: 30px;">
          Thanks for signing up! Please use the verification code below to complete your registration.
        </p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p style="color: #999999; font-size: 14px;">
          This code will expire in 5 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: 'no-reply@szone.top',
      to: email,
      subject: 'Your Verification Code',
      html: htmlTemplate,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
};
