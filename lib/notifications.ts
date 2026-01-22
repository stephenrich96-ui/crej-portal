import { prisma } from './db';

interface NotificationData {
  userEmail: string;
  userName: string;
  roles: string[];
}

/**
 * Send email notification to admins about new user role selection
 */
export async function sendAdminEmailNotification(data: NotificationData): Promise<void> {
  try {
    // Get all admin users
      const admins = await prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: 'ADMIN',
            },
          },
        },
        select: {
          email: true,
          name: true,
        },
      });

    if (admins.length === 0) {
      console.warn('No admin users found to send notification to');
      return;
    }

    const roleLabels: Record<string, string> = {
      'ADMIN': 'Admin',
      'DSPD_SUPPORT_COORDINATOR': 'DSPD Support Coordinator',
      'DSPD_MANAGER': 'DSPD Manager',
      'HRSS_STAFF': 'HRSS Staff',
      'EPAS_STAFF': 'EPAS Staff',
      'TRAINER': 'Trainer',
    };

    // Get additional user info
    let userInfo = '';
    try {
      const fullUser = await prisma.user.findUnique({
        where: { email: data.userEmail },
        select: {
          createdAt: true,
        },
      });
      if (fullUser) {
        userInfo = `
- Account Created: ${new Date(fullUser.createdAt).toLocaleDateString('en-US', { timeZone: 'America/Denver' })}`;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }

    const rolesText = data.roles.map(r => roleLabels[r] || r).join(', ');
    const subject = `New User Role Selection - ${data.userName}`;
    const body = `
A new user has selected their roles in the CREJ Portal:

User Information:
- Name: ${data.userName}
- Email: ${data.userEmail}
- Selected Roles: ${rolesText}${userInfo}
- Selection Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })}

Please review and confirm these role assignments in the admin panel at: ${process.env.NEXTAUTH_URL || 'http://localhost:3005'}/admin/users

CREJ Portal
    `.trim();

    // Send email to each admin
    for (const admin of admins) {
      await sendEmail(admin.email, subject, body);
    }
  } catch (error) {
    console.error('Error sending admin email notification:', error);
    // Don't throw - we don't want to block role selection if email fails
  }
}

/**
 * Send SMS notification to admins about new user role selection
 */
export async function sendAdminSMSNotification(data: NotificationData): Promise<void> {
  try {
    const adminPhone = process.env.ADMIN_PHONE || '8013671689'; // Default to test number
    
    const roleLabels: Record<string, string> = {
      'ADMIN': 'Admin',
      'DSPD_SUPPORT_COORDINATOR': 'DSPD Support Coordinator',
      'DSPD_MANAGER': 'DSPD Manager',
      'HRSS_STAFF': 'HRSS Staff',
      'EPAS_STAFF': 'EPAS Staff',
      'TRAINER': 'Trainer',
    };

    const rolesText = data.roles.map(r => roleLabels[r] || r).join(', ');
    const message = `CREJ Portal: ${data.userName} (${data.userEmail}) selected roles: ${rolesText}. Review at admin panel.`;

    await sendSMS(adminPhone, message);
  } catch (error) {
    console.error('Error sending admin SMS notification:', error);
    // Don't throw - we don't want to block role selection if SMS fails
  }
}

/**
 * Send email using environment configuration
 */
async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  // If using a service like Resend, SendGrid, etc., configure here
  const emailService = process.env.EMAIL_SERVICE || 'console';
  
  if (emailService === 'console') {
    // Development: just log to console
    console.log('\n=== EMAIL NOTIFICATION ===');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    console.log('==========================\n');
    return;
  }

  // Production email sending would go here
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: process.env.EMAIL_FROM || 'noreply@crej.com',
  //   to,
  //   subject,
  //   html: body.replace(/\n/g, '<br>'),
  // });
}

/**
 * Send SMS using Twilio or similar service
 */
async function sendSMS(to: string, message: string): Promise<void> {
  const smsService = process.env.SMS_SERVICE || 'twilio';
  
  if (smsService === 'console') {
    // Development: just log to console
    console.log('\n=== SMS NOTIFICATION ===');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('========================\n');
    return;
  }

  // Use Twilio if credentials are available
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      const phoneNumber = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;
      
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER,
        to: phoneNumber,
      });
      
      console.log(`SMS sent successfully to ${phoneNumber}`);
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      // Fallback to console logging
      console.log('\n=== SMS NOTIFICATION (Twilio failed) ===');
      console.log(`To: ${to}`);
      console.log(`Message: ${message}`);
      console.log('========================================\n');
    }
  } else {
    // No Twilio credentials, just log
    console.log('\n=== SMS NOTIFICATION (Twilio not configured) ===');
    console.log(`To: ${to}`);
    console.log(`Message: ${message}`);
    console.log('==============================================\n');
  }
}
