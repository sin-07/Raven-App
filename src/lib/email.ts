/**
 * Brevo Transactional Email Utility
 * 
 * Simple, direct email sending for Vercel serverless
 * Uses Promise.race for reliable timeout
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const TIMEOUT_MS = 9000; // 9 seconds to stay under Vercel's 10s limit

interface BrevoPayload {
  sender: { name: string; email: string };
  to: { email: string; name: string }[];
  subject: string;
  htmlContent: string;
}

// Timeout promise that rejects after specified ms
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`TIMEOUT_${ms}ms`)), ms);
  });
}

/**
 * Send email via Brevo API with reliable timeout using Promise.race
 */
async function sendBrevoEmail(payload: BrevoPayload): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not configured');
    return false;
  }

  if (!payload.sender.email || !payload.sender.email.includes('@')) {
    console.error('❌ Invalid sender email:', payload.sender.email);
    return false;
  }

  const startTime = Date.now();
  console.log(`📧 Sending email to ${payload.to[0].email} from ${payload.sender.email}`);

  try {
    const fetchPromise = fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    // Race between fetch and timeout
    const res = await Promise.race([fetchPromise, timeout(TIMEOUT_MS)]) as Response;
    const duration = Date.now() - startTime;

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      console.log(`✅ Email sent in ${duration}ms:`, data.messageId || 'success');
      return true;
    }

    const errorText = await res.text().catch(() => 'Unable to read response');
    console.error(`❌ Brevo API error ${res.status} (${duration}ms):`, errorText);
    
    if (res.status === 401) {
      console.error('   → Check your BREVO_API_KEY is valid');
    } else if (res.status === 400 || res.status === 403) {
      console.error('   → Sender email not verified. Verify at: https://app.brevo.com/settings/senders');
    }
    
    return false;

  } catch (err: any) {
    const duration = Date.now() - startTime;
    
    if (err.message?.startsWith('TIMEOUT_')) {
      console.error(`❌ Request timeout after ${duration}ms`);
    } else {
      console.error(`❌ Request failed (${duration}ms):`, err.message);
    }
    return false;
  }
}

function getSender() {
  return {
    name: process.env.BREVO_SENDER_NAME || 'Raven Tutorials',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@raventutorials.in',
  };
}

// ============================================
// OTP Email
// ============================================

interface SendOTPEmailParams {
  to: string;
  studentName: string;
  otp: string;
}

export async function sendOTPEmail({ to, studentName, otp }: SendOTPEmailParams): Promise<boolean> {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0b0b0b;margin:0;padding:20px">
<div style="max-width:500px;margin:0 auto;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #222">

<div style="background:linear-gradient(135deg,#0b0b0b 0%,#1a1a1a 100%);padding:32px;text-align:center;border-bottom:1px solid #222">
<h1 style="color:#00E5A8;margin:0;font-size:28px;font-weight:700;letter-spacing:1px">RAVEN Tutorials</h1>
<p style="color:#9ca3af;margin:8px 0 0;font-size:13px">Email Verification</p>
</div>

<div style="padding:32px">
<p style="color:#e5e7eb;font-size:16px;margin:0 0 8px">Hello <span style="color:#00E5A8;font-weight:600">${studentName}</span>!</p>
<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Use the code below to verify your email address:</p>

<div style="text-align:center;margin:32px 0">
<p style="color:#6b7280;font-size:11px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px">Verification Code</p>
<div style="font-size:36px;font-weight:700;color:#00E5A8;letter-spacing:8px;font-family:monospace;background:#0b0b0b;padding:20px;border-radius:12px;border:2px solid #00E5A8">${otp}</div>
<p style="color:#6b7280;font-size:12px;margin:16px 0 0">⏱ Expires in 10 minutes</p>
</div>

<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0">If you didn't request this code, please ignore this email.</p>
</div>

<div style="background:#0b0b0b;padding:20px;text-align:center;border-top:1px solid #222">
<p style="color:#4b5563;font-size:11px;margin:0">© ${new Date().getFullYear()} Raven Tutorials. All rights reserved.</p>
</div>

</div>
</body></html>`;

  const success = await sendBrevoEmail({
    sender: getSender(),
    to: [{ email: to, name: studentName }],
    subject: 'Verify Your Email - Raven Tutorials',
    htmlContent: html,
  });

  console.log(success ? `✓ OTP sent to ${to}` : `✗ OTP failed for ${to}`);
  return success;
}

// ============================================
// Welcome Email
// ============================================

interface SendWelcomeEmailParams {
  to: string;
  studentName: string;
  registrationId: string;
  password: string;
}

export async function sendWelcomeEmail({ to, studentName, registrationId, password }: SendWelcomeEmailParams): Promise<boolean> {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0b0b0b;margin:0;padding:20px">
<div style="max-width:500px;margin:0 auto;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #222">

<div style="background:linear-gradient(135deg,#0b0b0b 0%,#1a1a1a 100%);padding:32px;text-align:center;border-bottom:1px solid #222">
<h1 style="color:#00E5A8;margin:0;font-size:28px;font-weight:700;letter-spacing:1px">RAVEN Tutorials</h1>
<p style="color:#9ca3af;margin:8px 0 0;font-size:13px">Registration Successful</p>
</div>

<div style="padding:32px">
<h2 style="color:#00E5A8;margin:0 0 8px;font-size:22px;font-weight:600;text-align:center">🎉 Congratulations!</h2>
<p style="color:#e5e7eb;font-size:16px;text-align:center;margin:0 0 24px">Welcome aboard, <span style="color:#00E5A8;font-weight:600">${studentName}</span></p>

<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Your admission has been confirmed. Here are your login credentials:</p>

<div style="margin:24px 0">
<div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #222">
<span style="color:#6b7280;font-size:13px">Registration ID</span>
<span style="color:#00E5A8;font-size:15px;font-weight:600;font-family:monospace">${registrationId}</span>
</div>
<div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #222">
<span style="color:#6b7280;font-size:13px">Email</span>
<span style="color:#e5e7eb;font-size:14px">${to}</span>
</div>
<div style="display:flex;justify-content:space-between;padding:16px 0">
<span style="color:#6b7280;font-size:13px">Password</span>
<span style="color:#00E5A8;font-size:15px;font-weight:600;font-family:monospace">${password}</span>
</div>
</div>

<div style="text-align:center;margin:32px 0 0">
<a href="https://www.raventutorials.in/login" style="display:inline-block;background:#00E5A8;color:#0b0b0b;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:15px">Login Now →</a>
</div>

<p style="color:#6b7280;font-size:12px;text-align:center;margin:24px 0 0">Please save these credentials securely and don't share with anyone.</p>
</div>

<div style="background:#0b0b0b;padding:20px;text-align:center;border-top:1px solid #222">
<p style="color:#4b5563;font-size:11px;margin:0">© ${new Date().getFullYear()} Raven Tutorials. All rights reserved.</p>
</div>

</div>
</body></html>`;

  const success = await sendBrevoEmail({
    sender: getSender(),
    to: [{ email: to, name: studentName }],
    subject: 'Welcome to Raven Tutorials - Your Credentials',
    htmlContent: html,
  });

  console.log(success ? `✓ Welcome email sent to ${to}` : `✗ Welcome email failed for ${to}`);
  return success;
}

// ============================================
// Absence Notification Email
// ============================================

interface SendAbsenceEmailParams {
  to: string;
  studentName: string;
  subject: string;
  date: string;
  className: string;
}

export async function sendAbsenceNotificationEmail({ to, studentName, subject, date, className }: SendAbsenceEmailParams): Promise<boolean> {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0b0b0b;margin:0;padding:20px">
<div style="max-width:500px;margin:0 auto;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #222">

<div style="background:linear-gradient(135deg,#1a0b0b 0%,#2a1515 100%);padding:32px;text-align:center;border-bottom:1px solid #3a2020">
<h1 style="color:#ef4444;margin:0;font-size:28px;font-weight:700;letter-spacing:1px">RAVEN Tutorials</h1>
<p style="color:#fca5a5;margin:8px 0 0;font-size:13px">⚠️ Attendance Alert</p>
</div>

<div style="padding:32px">
<p style="color:#e5e7eb;font-size:16px;margin:0 0 8px">Dear <span style="color:#00E5A8;font-weight:600">${studentName}</span>,</p>
<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">This is to inform you that you were marked <span style="color:#ef4444;font-weight:700">ABSENT</span> for the following class:</p>

<div style="margin:24px 0">
<div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #222">
<span style="color:#6b7280;font-size:13px">Subject</span>
<span style="color:#e5e7eb;font-size:15px;font-weight:600">${subject}</span>
</div>
<div style="display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid #222">
<span style="color:#6b7280;font-size:13px">Class</span>
<span style="color:#e5e7eb;font-size:15px;font-weight:600">${className}</span>
</div>
<div style="display:flex;justify-content:space-between;padding:16px 0">
<span style="color:#6b7280;font-size:13px">Date</span>
<span style="color:#ef4444;font-size:15px;font-weight:600">${formattedDate}</span>
</div>
</div>

<p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:24px 0 0">If you believe this is an error, please contact your class teacher or administration within 2 hours of receiving this notification.</p>
<p style="color:#6b7280;font-size:12px;line-height:1.6;margin:16px 0 0">📚 Regular attendance is crucial for your academic success. Please ensure you attend all classes.</p>
</div>

<div style="background:#0b0b0b;padding:20px;text-align:center;border-top:1px solid #222">
<p style="color:#4b5563;font-size:11px;margin:0">© ${new Date().getFullYear()} Raven Tutorials. All rights reserved.</p>
</div>

</div>
</body></html>`;

  const success = await sendBrevoEmail({
    sender: getSender(),
    to: [{ email: to, name: studentName }],
    subject: `Attendance Alert: Absent on ${formattedDate}`,
    htmlContent: html,
  });

  console.log(success ? `✓ Absence notification sent to ${to}` : `✗ Absence notification failed for ${to}`);
  return success;
}

// ============================================
// Test Result Email
// ============================================

interface SendTestResultEmailParams {
  to: string;
  studentName: string;
  testTitle: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  passingMarks: number;
  status: 'Pass' | 'Fail';
  submittedAt: Date;
  violationsCount?: number;
}

export async function sendTestResultEmail({
  to,
  studentName,
  testTitle,
  subject,
  marksObtained,
  totalMarks,
  passingMarks,
  status,
  submittedAt,
  violationsCount = 0
}: SendTestResultEmailParams): Promise<boolean> {
  const formattedDate = submittedAt.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const percentage = ((marksObtained / totalMarks) * 100).toFixed(2);
  const isPassed = status === 'Pass';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#0b0b0b;margin:0;padding:20px">
<div style="max-width:500px;margin:0 auto;background:#111111;border-radius:16px;overflow:hidden;border:1px solid #222">

<div style="background:linear-gradient(135deg,#0b0b0b 0%,#1a1a1a 100%);padding:32px;text-align:center;border-bottom:1px solid #222">
<h1 style="color:#00E5A8;margin:0;font-size:28px;font-weight:700;letter-spacing:1px">RAVEN Tutorials</h1>
<p style="color:#9ca3af;margin:8px 0 0;font-size:13px">Test Result Notification</p>
</div>

<div style="padding:32px">
<h2 style="color:#e5e7eb;margin:0 0 8px;font-size:20px;font-weight:600">Test Completed Successfully!</h2>
<p style="color:#9ca3af;font-size:14px;margin:0 0 24px">Dear <span style="color:#00E5A8;font-weight:600">${studentName}</span>,</p>
<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 24px">Your test has been successfully submitted. Here are your results:</p>

<div style="margin:0 0 24px">
<h3 style="color:#e5e7eb;margin:0 0 8px;font-size:18px;font-weight:600">${testTitle}</h3>
<p style="color:#6b7280;font-size:14px;margin:0"><strong style="color:#9ca3af">Subject:</strong> ${subject}</p>
<p style="color:#6b7280;font-size:14px;margin:8px 0 0"><strong style="color:#9ca3af">Submitted:</strong> ${formattedDate}</p>
</div>

<div style="background:${isPassed ? 'linear-gradient(135deg,#052e16 0%,#064e3b 100%)' : 'linear-gradient(135deg,#2a0f0f 0%,#3b1515 100%)'};border-radius:12px;padding:24px;margin:24px 0;border:1px solid ${isPassed ? '#00E5A8' : '#ef4444'}33">
<div style="display:flex;justify-content:space-between;margin-bottom:20px">
<div>
<p style="color:#6b7280;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Score</p>
<p style="color:#e5e7eb;font-size:28px;font-weight:700;margin:0">${marksObtained} / ${totalMarks}</p>
</div>
<div style="text-align:right">
<p style="color:#6b7280;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Percentage</p>
<p style="color:#e5e7eb;font-size:28px;font-weight:700;margin:0">${percentage}%</p>
</div>
</div>
<div style="border-top:1px solid ${isPassed ? '#00E5A8' : '#ef4444'}33;padding-top:20px;display:flex;justify-content:space-between;align-items:center">
<div>
<p style="color:#6b7280;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Passing Marks</p>
<p style="color:#e5e7eb;font-size:18px;font-weight:600;margin:0">${passingMarks}</p>
</div>
<div style="background:${isPassed ? '#00E5A8' : '#ef4444'};color:${isPassed ? '#0b0b0b' : '#fff'};padding:10px 24px;border-radius:8px;font-weight:700;font-size:16px">
${status}
</div>
</div>
</div>

${violationsCount > 0 ? `
<div style="margin:24px 0;padding:16px;background:#2a200f;border-radius:8px;border:1px solid #f59e0b33">
<p style="color:#fbbf24;font-size:13px;margin:0">⚠️ <strong>Warning:</strong> ${violationsCount} violation(s) were recorded during the test.</p>
</div>
` : ''}

<p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0">
${isPassed 
  ? '🎉 Congratulations on passing the test! Keep up the excellent work.' 
  : '💪 Don\'t be discouraged. Review the topics and try again. We\'re here to help you succeed!'}
</p>
</div>

<div style="background:#0b0b0b;padding:20px;text-align:center;border-top:1px solid #222">
<p style="color:#4b5563;font-size:11px;margin:0">© ${new Date().getFullYear()} Raven Tutorials. All rights reserved.</p>
<p style="color:#374151;font-size:10px;margin:8px 0 0">This is an automated email. Please do not reply.</p>
</div>

</div>
</body></html>`;

  const emailSuccess = await sendBrevoEmail({
    sender: getSender(),
    to: [{ email: to, name: studentName }],
    subject: `Test Result: ${testTitle} - ${status}`,
    htmlContent: html,
  });

  console.log(emailSuccess ? `✓ Test result sent to ${to}` : `✗ Test result email failed for ${to}`);
  return emailSuccess;
}
