const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  console.log('🔍 Testing SMTP Configuration...\n');
  
  // Check environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
  }

  console.log('✅ Environment variables loaded:');
  console.log(`   HOST: ${process.env.SMTP_HOST}`);
  console.log(`   PORT: ${process.env.SMTP_PORT}`);
  console.log(`   USER: ${process.env.SMTP_USER}`);
  console.log(`   FROM: ${process.env.SMTP_FROM}`);
  console.log(`   SECURE: ${process.env.SMTP_SECURE}\n`);

  // Check if using placeholder password
  if (process.env.SMTP_PASS.includes('YOUR_16_DIGIT_APP_PASSWORD') || 
      process.env.SMTP_PASS.length < 12) {
    console.error('❌ ERROR: SMTP_PASS is still a placeholder!');
    console.error('   You need a real Gmail App Password.');
    console.error('\n   Steps to generate Gmail App Password:');
    console.error('   1. Go to myaccount.google.com');
    console.error('   2. Click "Security" (left sidebar)');
    console.error('   3. Enable "2-Step Verification" if not already enabled');
    console.error('   4. Search for "App passwords" (will appear after 2FA is enabled)');
    console.error('   5. Select "Mail" and "Windows Computer"');
    console.error('   6. Copy the 16-character password');
    console.error('   7. Update SMTP_PASS in .env with this password (no spaces)\n');
    process.exit(1);
  }

  try {
    console.log('📧 Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: 'PyProctor AI - Email Configuration Test',
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: auto; padding: 20px;">
          <h2 style="color: #3b82f6;">✅ Email Configuration Works!</h2>
          <p>Your SMTP settings are correctly configured.</p>
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Host: ${process.env.SMTP_HOST}</li>
              <li>Port: ${process.env.SMTP_PORT}</li>
              <li>User: ${process.env.SMTP_USER}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">This is an automated test email from PyProctor AI.</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}\n`);
    console.log('🎉 Your email configuration is ready to use!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nCommon issues:');
    console.error('• Gmail App Password is incorrect or expired');
    console.error('• 2-Factor Authentication not enabled on Google Account');
    console.error('• Firewall blocking SMTP connection');
    console.error('• SMTP_SECURE setting incorrect for your port');
    process.exit(1);
  }
};

testEmail();
