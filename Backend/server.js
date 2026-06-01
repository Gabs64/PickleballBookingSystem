import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from the React/Vite frontend (typically port 5173, 3000, etc.)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Relay Verification Email API
app.post('/api/send-code', async (req, res) => {
  const { email, name, code, smtpConfig } = req.body;

  console.log(`[REQUEST] Send verification code to: ${email}`);

  // If custom SMTP config is NOT provided or incomplete, run in Sandbox Fallback Mode
  if (!smtpConfig || !smtpConfig.host || !smtpConfig.auth || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.log(`[SMTP] Sandbox Mode: No SMTP credentials found. Fallback to inline display.`);
    return res.status(200).json({
      success: true,
      mode: 'sandbox',
      message: 'SMTP is unconfigured. Running in Sandbox Mode.'
    });
  }

  // Live SMTP Mode: Attempt to relay the real email dispatch using the admin credentials
  try {
    console.log(`[SMTP] Establishing connection to mail relay host: ${smtpConfig.host}:${smtpConfig.port}`);
    
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: smtpConfig.secure === true || smtpConfig.port === 465, // true for port 465 (SSL), false for other ports
      auth: {
        user: smtpConfig.auth.user,
        pass: smtpConfig.auth.pass
      },
      tls: {
        rejectUnauthorized: false // bypass SSL verification issues in sandbox setups
      }
    });

    const mailOptions = {
      from: `"${smtpConfig.senderName || 'NetRally Arena'}" <${smtpConfig.auth.user}>`,
      to: email,
      subject: '🏓 Verify Your Pickleball Account',
      html: `
        <div style="background-color: #07080c; color: #f8fafc; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 2.5rem 1.5rem; max-width: 500px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="text-align: center; margin-bottom: 2rem;">
            <span style="font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;">NETRALLY <span style="color: #ccff00;">ARENA</span></span>
            <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.08em;">Account Security Verification</p>
          </div>
          <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 1.5rem;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 0.9rem; color: #94a3b8; line-height: 1.6; margin-bottom: 2rem;">Thank you for registering an account at NetRally Arena! To complete your self-registration and verify your email address, please enter the following 6-digit verification code in the portal:</p>
          <div style="background-color: rgba(204, 255, 0, 0.08); border: 1px solid rgba(204, 255, 0, 0.25); border-radius: 8px; padding: 1rem; text-align: center; margin-bottom: 2rem;">
            <span style="font-size: 2.25rem; font-weight: 900; color: #ccff00; letter-spacing: 0.15em; font-family: monospace;">${code}</span>
          </div>
          <p style="font-size: 0.75rem; color: #64748b; line-height: 1.5; text-align: center;">This verification code is for sandbox demonstration purposes. If you did not request this code, please ignore this email.</p>
          <div style="border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 1.5rem; margin-top: 2rem; text-align: center; font-size: 0.7rem; color: #475569;">
            © 2026 NetRally Arena. All rights reserved.
          </div>
        </div>
      `
    };

    console.log(`[SMTP] Dispatched verify mail trigger to customer inbox: ${email}`);
    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Dispatch succeeded.`);
    
    return res.status(200).json({
      success: true,
      mode: 'live',
      message: 'Verification code dispatched to actual recipient.'
    });

  } catch (error) {
    console.error(`[SMTP ERROR] Relay failed: ${error.message}`);
    // If SMTP fails, return error so the frontend is aware of it
    return res.status(200).json({
      success: false,
      mode: 'sandbox',
      message: `Mail relay failure: ${error.message}. Defaulting back to sandbox display.`
    });
  }
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`⚡ Pickleball command server booted on PORT: ${PORT}`);
  console.log(`🚀 RELAY ROOT: http://localhost:${PORT}/api/send-code`);
  console.log(`===================================================`);
});
