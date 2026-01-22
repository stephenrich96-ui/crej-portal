// Training reminder system - sends emails for trainings with deadlines
import { prisma } from '@/lib/db';

interface TrainingWithDeadline {
  id: string;
  title: string;
  description: string | null;
  deadlineDate: Date | null;
  daysUntil: number;
  userEmail: string;
  userName: string | null;
}

/**
 * Get all trainings with deadlines that need reminders
 */
export async function getTrainingsNeedingReminders(): Promise<TrainingWithDeadline[]> {
  // Get all trainings and filter in JavaScript (SQLite doesn't support case-insensitive mode)
  const allTrainings = await prisma.training.findMany({
    include: {
      requirements: true,
      completions: {
        include: {
          user: true,
        },
      },
    },
  });

  // Filter trainings that match our criteria (case-insensitive)
  const trainings = allTrainings.filter(t => {
    const titleLower = t.title.toLowerCase();
    const descLower = (t.description || '').toLowerCase();
    return (
      titleLower.includes('medicaid 101') ||
      titleLower.includes('seln') ||
      descLower.includes('30-day') ||
      descLower.includes('due by') ||
      descLower.includes('june 5, 2026')
    );
  });

  const trainingsNeedingReminders: TrainingWithDeadline[] = [];

  for (const training of trainings) {
    // Determine deadline date
    let deadlineDate: Date | null = null;
    
    if (training.title.toLowerCase().includes('seln') || 
        training.description?.toLowerCase().includes('june 5, 2026')) {
      deadlineDate = new Date('2026-06-05');
    } else if (training.title.toLowerCase().includes('medicaid 101')) {
      // Medicaid 101 has 30-day deadline from assignment
      // For now, we'll check if it's been more than 20 days since creation
      // In production, you'd track assignment date
      deadlineDate = new Date(training.createdAt);
      deadlineDate.setDate(deadlineDate.getDate() + 30);
    }

    if (!deadlineDate) continue;

    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Send reminders at 30 days, 14 days, 7 days, and 1 day before deadline
    const reminderDays = [30, 14, 7, 1];
    if (!reminderDays.includes(daysUntil)) continue;

    // Get all users who need this training and haven't completed it
    const requiredRoles = training.requirements.map(r => r.role);
    
    const usersNeedingTraining = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: { in: requiredRoles },
          },
        },
        NOT: {
          trainingCompletions: {
            some: {
              trainingId: training.id,
            },
          },
        },
      },
      include: {
        roles: true,
      },
    });

    for (const user of usersNeedingTraining) {
      trainingsNeedingReminders.push({
        id: training.id,
        title: training.title,
        description: training.description,
        deadlineDate,
        daysUntil,
        userEmail: user.email,
        userName: user.name,
      });
    }
  }

  return trainingsNeedingReminders;
}

/**
 * Generate email content for training reminder
 */
export function generateTrainingReminderEmail(training: TrainingWithDeadline): {
  subject: string;
  html: string;
  text: string;
} {
  const deadlineStr = training.deadlineDate 
    ? training.deadlineDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'soon';

  const subject = `Reminder: ${training.title} - Due ${deadlineStr}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f8fafc; }
        .training-box { background-color: white; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Training Reminder</h1>
        </div>
        <div class="content">
          <p>Hello ${training.userName || 'there'},</p>
          
          <p>This is a reminder that you have a required training with a deadline:</p>
          
          <div class="training-box">
            <h2 style="margin-top: 0;">${training.title}</h2>
            ${training.description ? `<p>${training.description.split('\n')[0]}</p>` : ''}
            <p><strong>Deadline:</strong> ${deadlineStr}</p>
            <p><strong>Days Remaining:</strong> ${training.daysUntil} day${training.daysUntil !== 1 ? 's' : ''}</p>
          </div>
          
          <p>Please complete this training as soon as possible to avoid missing the deadline.</p>
          
          <p>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/trainings/${training.id}" class="button">
              Complete Training
            </a>
          </p>
          
          <p>You can also access all your trainings at:<br>
          <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/trainings">${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/trainings</a></p>
        </div>
        <div class="footer">
          <p>This is an automated reminder from CREJ Portal.</p>
          <p>If you have questions, contact your supervisor or dspdlearninginfo@utah.gov</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Training Reminder

Hello ${training.userName || 'there'},

This is a reminder that you have a required training with a deadline:

${training.title}
${training.description ? training.description.split('\n')[0] : ''}

Deadline: ${deadlineStr}
Days Remaining: ${training.daysUntil} day${training.daysUntil !== 1 ? 's' : ''}

Please complete this training as soon as possible to avoid missing the deadline.

Access your training: ${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/trainings/${training.id}
View all trainings: ${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/trainings

This is an automated reminder from CREJ Portal.
If you have questions, contact your supervisor or dspdlearninginfo@utah.gov
  `;

  return { subject, html, text };
}

/**
 * Send training reminder emails
 * This would integrate with your email service (e.g., Resend, SendGrid, Nodemailer)
 */
export async function sendTrainingReminders() {
  const trainingsNeedingReminders = await getTrainingsNeedingReminders();

  // TODO: Implement actual email sending
  // For now, just log the reminders that would be sent
  console.log(`Would send ${trainingsNeedingReminders.length} training reminder emails`);
  
  for (const training of trainingsNeedingReminders) {
    const email = generateTrainingReminderEmail(training);
    console.log(`Reminder for ${training.userEmail}:`, email.subject);
    
    // TODO: Send email using your email service
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'CREJ Portal <noreply@crejllc.net>',
    //   to: training.userEmail,
    //   subject: email.subject,
    //   html: email.html,
    //   text: email.text,
    // });
  }

  return trainingsNeedingReminders.length;
}
