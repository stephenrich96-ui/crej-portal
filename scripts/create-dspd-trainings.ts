// Script to create DSPD Support Coordinator required trainings
// Run with: tsx scripts/create-dspd-trainings.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const requiredTrainings = [
  {
    title: 'DSPD SCE: Acquiring and maintaining integrated community-based housing',
    description: 'Introduces the benefits of integrated, home and community-based housing and provides practical guidance on supporting clients in acquiring and maintaining safe, stable housing within the community.',
    program: 'DSPD',
    duration: '25 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Profound and complex disabilities (Open Future Learning)',
    description: 'Helps participants better understand and support people with profound and complex disabilities. Emphasizes seeing the whole person, recognizing that communication happens in every part of life, and supporting people to have power and control in their daily choices.',
    program: 'DSPD',
    duration: '2 hours 35 minutes',
    frequency: 'Once',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Ethics training for support coordinators',
    description: 'Reviews the ethical standards essential to support coordination. Equips support coordinators with the knowledge and skills to apply ethical principles in decision-making processes.',
    program: 'DSPD',
    duration: '25 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Finance',
    description: 'Provides support coordinators with an overview of their role as contracted Medicaid Providers in the payment process, along with guidance on meeting requirements for contracts, licensing, and Medicaid policy and billing. Includes training related to HB125.',
    program: 'DSPD',
    duration: '40 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Records management',
    description: 'Guides participants through the proper use of the 6 DSPD HIPAA forms, emphasizing respect for client confidentiality and the appropriate timing for destroying confidential records. Includes navigation of the imaging module in USTEPS.',
    program: 'DSPD',
    duration: '20 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Health monitoring: The fatal five (Open Future Learning)',
    description: 'Covers the "Fatal Five" preventable conditions–aspiration, dehydration, constipation, seizures, and sepsis–that pose health risks to the people you support. Explores the key causes, signs, and symptoms of each condition.',
    program: 'DSPD',
    duration: '2 hours',
    frequency: 'Once',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'Supporting a vision for employment (SELN)',
    description: 'Developed by the State Employment Leadership Network (SELN), this training highlights the vital role case managers play in supporting people to pursue and maintain competitive, integrated employment. Focuses on essential components of effective employment support, presents real-world scenarios, and includes interactive exercises.',
    program: 'DSPD',
    duration: '5 hours 30 minutes',
    frequency: 'Once (Due by June 5, 2026)',
    videoUrl: 'https://seln.org/training/supporting-a-vision-for-employment',
    documentUrl: 'https://seln.org/training/supporting-a-vision-for-employment',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Level of care and Medicaid eligibility',
    description: 'Provides an overview of the two-step waiver Medicaid determination process, covering both level of care and waiver Medicaid eligibility. Learn how to navigate the waiver review process and identify and report changes that may affect eligibility.',
    program: 'DSPD',
    duration: '45 minutes',
    frequency: 'Once (FY26)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: State match program',
    description: 'Provides an overview of the state match program, including its purpose, structure, and target population. Learn the support coordinator\'s key roles and responsibilities, how to navigate funding, billing, and WHX code requirements.',
    program: 'DSPD',
    duration: '25 minutes',
    frequency: 'Once (FY26)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Challenging behaviors (Open Future Learning)',
    description: 'Explores the meaning and causes of challenging behavior and how to respond in ways that promote understanding and support. Learn how individual and environmental factors influence behavior, and how communication difficulties can play a role.',
    program: 'DSPD',
    duration: '3 hours 45 minutes',
    frequency: 'Once (FY26)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Disability 101',
    description: 'Introduces the concept of disability, exploring different types of disabilities and how they are perceived. Learn effective communication strategies, including the use of disability related language, and gain an understanding of the history of disability rights in the United States.',
    program: 'DSPD',
    duration: '30 minutes',
    frequency: 'Once (FY26)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Incident/fatality reporting',
    description: 'Provides an overview of reporting requirements, including what must be reported, to whom, and within what timeframes. Learn how to complete required reporting, become familiar with the state and federal codes and division policies that authorize these requirements.',
    program: 'DSPD',
    duration: '30 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Office of Services Review',
    description: 'Provides an overview of the Office of Service Review\'s responsibilities within the support coordination contract. Learn about types of contract monitoring and when it is appropriate to contact the Office of Services Review.',
    program: 'DSPD',
    duration: '20 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Person-centered approaches, thinking, and planning (Open Future Learning)',
    description: 'Explores the foundations of person-centered approaches, thinking, and planning, with a focus on the key principles that guide effective practice. Learn how to apply person-centered thinking tools in your work and understand what makes a planning meeting successful.',
    program: 'DSPD',
    duration: '3 hours',
    frequency: 'Every other year (even fiscal years)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Person-centered planning (Utah specific)',
    description: 'Gives learners an understanding of the key principles and best practices that underpin person-centered planning.',
    program: 'DSPD',
    duration: '45 minutes',
    frequency: 'Every other year (odd fiscal years)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Self-administered (SAS) and agency services',
    description: 'Introduces the SAS service delivery model, outlining the roles and responsibilities of those involved. Learn how to integrate SAS services into person-centered planning and support coordination activities.',
    program: 'DSPD',
    duration: '30 minutes',
    frequency: 'Once (FY26)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'DSPD SCE: Settings Rule and monitoring',
    description: 'Introduces the purpose of the Home and Community-Based Services (HCBS) Settings Rule, the rights it protects, and what those rights look like in practice. Learn how to identify and report potential rule violations and gain an understanding of what constitutes a rights restriction.',
    program: 'DSPD',
    duration: '30 minutes',
    frequency: 'Every year',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
  {
    title: 'Medicaid 101',
    description: 'Required annual training for all Medicaid providers contracted with DSPD, including all support coordinators. This training is automatically assigned every year through the ULP with a 30-day completion deadline.',
    program: 'DSPD',
    duration: 'Varies',
    frequency: 'Every year (30-day deadline)',
    videoUrl: '', // Assigned through ULP
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
  },
];

async function main() {
  console.log('Creating DSPD Support Coordinator required trainings...\n');

  // Find or create the training guide content item
  const guideContent = await prisma.contentItem.findFirst({
    where: {
      title: 'DSPD Support Coordinator Training Tracking Guide',
      program: 'DSPD',
    },
  });

  if (!guideContent) {
    console.log('Training guide content not found. Please run content sync first.');
    console.log('Or create the content item manually in the admin panel.');
  }

  for (const trainingData of requiredTrainings) {
    const { requiredRoles, ...trainingInfo } = trainingData;

    // Check if training already exists
    const existing = await prisma.training.findFirst({
      where: {
        title: trainingInfo.title,
        program: trainingInfo.program,
      },
    });

    if (existing) {
      console.log(`  ⏭️  Skipped (exists): ${trainingInfo.title}`);
      continue;
    }

    // Create training
    const training = await prisma.training.create({
      data: {
        title: trainingInfo.title,
        description: `${trainingInfo.description}\n\nDuration: ${trainingInfo.duration}\nFrequency: ${trainingInfo.frequency}`,
        program: trainingInfo.program,
        videoUrl: trainingInfo.videoUrl || null,
        documentUrl: trainingInfo.documentUrl || null,
        order: 0,
      },
    });

    // Create requirements
    for (const role of requiredRoles) {
      await prisma.trainingRequirement.create({
        data: {
          trainingId: training.id,
          role,
        },
      });
    }

    console.log(`  ✓ Created: ${trainingInfo.title}`);
  }

  console.log(`\n✅ Created ${requiredTrainings.length} DSPD Support Coordinator trainings`);
  console.log('\nNote: Most trainings are accessed through the Utah Learning Portal (ULP)');
  console.log('      Link: https://utahlearningportal.com');
  console.log('\n      SELN Training: https://seln.org/training/supporting-a-vision-for-employment');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
