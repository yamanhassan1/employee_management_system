const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, CLIENT_URL, NODE_ENV } = require("../config/env");

// If SMTP is not configured (or still using placeholder values), fall back to
// logging verification/reset links to the console. This keeps register and
// forgot-password flows working during local development.
// Only treat as placeholder if it's empty or clearly a sample value (example.com).
// A real SMTP host like smtp.gmail.com must NOT be flagged as a placeholder.
const isPlaceholder = (v) => !v || /example\.com/i.test(String(v));
const isSmtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS) && !isPlaceholder(SMTP_HOST);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

const sendMail = async ({ to, subject, html }) => {
  if (!transporter) {
    // eslint-disable-next-line no-console
    console.log(`\n[email:dev] To: ${to} | Subject: ${subject}\n${html}\n`);
    return;
  }
  await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
};

const sendWelcomeEmail = async (email, name) => {
  await sendMail({
    to: email,
    subject: "Welcome to Employee Management System",
    html: `<p>Hi ${name || "there"},</p><p>Welcome aboard! Your account has been created successfully.</p>`,
  });
};

const sendVerificationEmail = async (email, rawToken) => {
  const link = `${CLIENT_URL}/auth/verify-email?token=${rawToken}`;
  await sendMail({
    to: email,
    subject: "Verify your email",
    html: `<p>Click below to verify your email (expires in 24h).</p><a href="${link}">${link}</a>`,
  });
};

const sendPasswordResetEmail = async (email, rawToken) => {
  const link = `${CLIENT_URL}/auth/reset-password?token=${rawToken}`;
  await sendMail({
    to: email,
    subject: "Reset your password",
    html: `<p>Click below to reset your password (expires in 1h).</p><a href="${link}">${link}</a>`,
  });
};

module.exports = { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail };
