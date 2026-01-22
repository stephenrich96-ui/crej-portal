// Script to create DSPD Support Coordinator required trainings
// Run with: tsx scripts/create-dspd-trainings.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// REQUIRED TRAININGS - Initial course assignments (due in 60 days)
const initialRequiredTrainings = [
  {
    title: 'DSPD SCE: Acquiring and maintaining integrated community-based housing',
    description: 'This course introduces the benefits of integrated, home and community-based housing and provides practical guidance on supporting clients in acquiring and maintaining safe, stable housing within the community.',
    program: 'DSPD',
    duration: '25 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 10,
  },
  {
    title: 'DSPD SCE: Profound and complex disabilities (Open Future Learning)',
    description: 'This course helps participants better understand and support people with profound and complex disabilities. It emphasizes seeing the whole person, recognizing that communication happens in every part of life, and supporting people to have power and control in their daily choices. Participants will also learn about sensory experiences, postural care, and common medical needs to provide thoughtful, person-centered support.',
    program: 'DSPD',
    duration: '2 hrs 35 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 11,
  },
  {
    title: 'DSPD SCE: Ethics training for support coordinators',
    description: 'This course reviews the ethical standards essential to support coordination. It also equips support coordinators with the knowledge and skills to apply ethical principles in decision-making processes.',
    program: 'DSPD',
    duration: '25 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 12,
  },
  {
    title: 'DSPD SCE: Finance',
    description: 'This course provides support coordinators with an overview of their role as contracted Medicaid Providers in the payment process, along with guidance on meeting requirements for contracts, licensing, and Medicaid policy and billing. Participants will also learn about the procurement process, including training related to HB125.',
    program: 'DSPD',
    duration: '40 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 13,
  },
  {
    title: 'DSPD SCE: Records management',
    description: 'This course guides participants through the proper use of the 6 DSPD HIPAA forms, emphasizing respect for client confidentiality and the appropriate timing for destroying confidential records. Additionally, learners will learn how to navigate the imaging module in USTEPS.',
    program: 'DSPD',
    duration: '20 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 14,
  },
  {
    title: 'DSPD SCE: Health monitoring: The fatal five (Open Future Learning)',
    description: 'This course covers the "Fatal Five" preventable conditions–aspiration, dehydration, constipation, seizures, and sepsis–that pose health risks to the people you support. Learners will explore the key causes, signs, and symptoms of each condition.',
    program: 'DSPD',
    duration: '2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 15,
  },
];

// REQUIRED - Due by June 5, 2026
const deadlineRequiredTrainings = [
  {
    title: 'Supporting a vision for employment (SELN)',
    description: 'Developed by the State Employment Leadership Network (SELN), this training highlights the vital role case managers play in supporting people to pursue and maintain competitive, integrated employment. This course focuses on essential components of effective employment support, presents real-world scenarios, and includes interactive exercises that help learners apply what they\'ve learned. It equips support coordinators with the knowledge and confidence needed to perform their duties effectively.',
    program: 'DSPD',
    duration: '5 hrs 30 mins',
    frequency: 'Once (Due by June 5, 2026)',
    videoUrl: 'https://seln.org/training/supporting-a-vision-for-employment',
    documentUrl: 'https://seln.org/training/supporting-a-vision-for-employment',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 2,
  },
];

// REQUIRED - More required courses (FY26)
const fy26RequiredTrainings = [
  {
    title: 'DSPD SCE: Level of care and Medicaid eligibility',
    description: 'This course provides an overview of the two-step waiver Medicaid determination process, covering both level of care and waiver Medicaid eligibility. Participants will learn how to navigate the waiver review process and identify and report changes that may affect eligibility.',
    program: 'DSPD',
    duration: '45 mins',
    frequency: 'Once (FY26)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 20,
  },
  {
    title: 'DSPD SCE: State match program',
    description: 'This course provides an overview of the state match program, including its purpose, structure, and target population. Participants will learn the support coordinator\'s key roles and responsibilities, how to navigate funding, billing, and WHX code requirements, and how to manage case transitions and closures effectively. This includes information on working with the Division of Child & Family Services and the Division of Juvenile Justice & Youth Services.',
    program: 'DSPD',
    duration: '25 mins',
    frequency: 'Once (FY26)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 21,
  },
  {
    title: 'DSPD SCE: Challenging behaviors (Open Future Learning)',
    description: 'This course explores the meaning and causes of challenging behavior and how to respond in ways that promote understanding and support. Participants will learn how individual and environmental factors influence behavior, and how communication difficulties can play a role. The course emphasizes person-centered tools and strategies to prevent or reduce challenging behavior. Learners will also consider how loneliness, relationships, and valued roles affect well-being and behavior.',
    program: 'DSPD',
    duration: '3 hrs 45 mins',
    frequency: 'Once (FY26)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 22,
  },
  {
    title: 'DSPD SCE: Disability 101',
    description: 'This course introduces the concept of disability, exploring different types of disabilities and how they are perceived. Participants will learn effective communication strategies, including the use of disability related language, and gain an understanding of the history of disability rights in the United States.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Once (FY26)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 23,
  },
  {
    title: 'DSPD SCE: Incident/fatality reporting',
    description: 'This course provides an overview of reporting requirements, including what must be reported, to whom, and within what timeframes. Participants will learn how to complete required reporting, become familiar with the state and federal codes and division policies that authorize these requirements, and discover resources to turn to when questions arise.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 30,
  },
  {
    title: 'DSPD SCE: Office of Services Review',
    description: 'This course provides an overview of the Office of Service Review\'s responsibilities within the support coordination contract. Participants will learn about types of contract monitoring and when it is appropriate to contact the Office of Services Review.',
    program: 'DSPD',
    duration: '20 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 31,
  },
  {
    title: 'DSPD SCE: Person-centered approaches, thinking, and planning (Open Future Learning)',
    description: 'This course explores the foundations of person-centered approaches, thinking, and planning, with a focus on the key principles that guide effective practice. Participants will learn how to apply person-centered thinking tools in their work and understand what makes a planning meeting successful. The course emphasizes strategies for supporting individuals in leading and directing their own meetings.',
    program: 'DSPD',
    duration: '3 hrs',
    frequency: 'Every other year (even fiscal years)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 40,
  },
  {
    title: 'DSPD SCE: Person-centered planning (Utah specific)',
    description: 'This course will give learners an understanding of the key principles and best practices that underpin person-centered planning.',
    program: 'DSPD',
    duration: '45 mins',
    frequency: 'Every other year (odd fiscal years)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 41,
  },
  {
    title: 'DSPD SCE: Self-administered (SAS) and agency services',
    description: 'This course introduces the SAS service delivery model, outlining the roles and responsibilities of those involved. Participants will also learn how to integrate SAS services into person-centered planning and support coordination activities.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Once (FY26)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 24,
  },
  {
    title: 'DSPD SCE: Settings Rule and monitoring',
    description: 'This course introduced the purpose of the Home and Community-Based Services (HCBS) Settings Rule, the rights it protects, and what those rights look like in practice. Participants will learn how to identify and report potential rule violations and gain an understanding of what constitutes a rights restriction.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 32,
  },
];

// Disability conditions - choose one (required)
const disabilityConditionTrainings = [
  {
    title: 'DSPD SCE: Autism',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 25,
  },
  {
    title: 'DSPD SCE: Dementia strategies',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 26,
  },
  {
    title: 'DSPD SCE: Down syndrome',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 27,
  },
  {
    title: 'DSPD SCE: Epilepsy',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 28,
  },
  {
    title: 'DSPD SCE: Fetal Alcohol Spectrum Disorder - Supporting Success',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 29,
  },
  {
    title: 'DSPD SCE: Mental health',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 30,
  },
  {
    title: 'DSPD SCE: Prader-Willi Syndrome',
    description: 'These courses are designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once (Choose one)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 31,
  },
];

// Additional required - Medicaid 101
const medicaid101 = [
  {
    title: 'Medicaid 101',
    description: 'While not part of the required support coordinator core training, the Medicaid 101 training is a required annual training for all Medicaid providers contracted with the Division of Services for People with Disabilities (DSPD). This includes all support coordinators. This will automatically be assigned to you every year through the ULP with a 30-day completion deadline.',
    program: 'DSPD',
    duration: 'Varies',
    frequency: 'Every year (30-day deadline)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 1,
  },
];

// OPTIONAL TRAININGS
const optionalTrainings = [
  { title: 'DSPD SCE: Advocacy explained', duration: '35 mins', order: 100 },
  { title: 'DSPD SCE: All behavior is meaningful', duration: '30 mins', order: 101 },
  { title: 'DSPD SCE: Autism and sensory processing', duration: '1 hr 30 mins', order: 102 },
  { title: 'DSPD SCE: Autism-social communication', duration: '25 mins', order: 103 },
  { title: 'DSPD SCE: Autism-social relationships', duration: '25 mins', order: 104 },
  { title: 'DSPD SCE: Boundaries', duration: '2 hrs', order: 105 },
  { title: 'DSPD SCE: Communication without words', duration: '25 mins', order: 106 },
  { title: 'DSPD SCE: Communication - the barriers', duration: '20 mins', order: 107 },
  { title: 'DSPD SCE: Damage and intrusion of self', duration: '30 mins', order: 108 },
  { title: 'DSPD SCE: End of life care', duration: '2 hrs 20 mins', order: 109 },
  { title: 'DSPD SCE: Fetal alcohol syndrome disorder - daily routines', duration: '30 mins', order: 110 },
  { title: 'DSPD SCE: Fetal alcohol syndrome disorder - explained', duration: '30 mins', order: 111 },
  { title: 'DSPD SCE: Fetal alcohol syndrome disorder - lessons learned', duration: '35 mins', order: 112 },
  { title: 'DSPD SCE: Finding and building community', duration: '40 mins', order: 113 },
  { title: 'DSPD SCE: Friendship challenges', duration: '30 mins', order: 114 },
  { title: 'DSPD SCE: Growing older-adapting', duration: '50 mins', order: 115 },
  { title: 'DSPD SCE: Growing older - emotional support', duration: '40 mins', order: 116 },
  { title: 'DSPD SCE: Intensive interactions', duration: '2 hrs 10 mins', order: 117 },
  { title: 'DSPD SCE: Looking after my mental health - part 1', duration: '30 mins', order: 118 },
  { title: 'DSPD SCE: Looking after my mental health - part 2', duration: '25 mins', order: 119 },
  { title: 'DSPD SCE: Looking after my mental health - part 3', duration: '30 mins', order: 120 },
  { title: 'DSPD SCE: Looking after my mental health - part 4', duration: '30 mins', order: 121 },
  { title: 'DSPD SCE: Mental health diagnoses', duration: '50 mins', order: 122 },
  { title: 'DSPD SCE: Mental health explained', duration: '30 mins', order: 123 },
  { title: 'DSPD SCE: Mental health promotion', duration: '30 mins', order: 124 },
  { title: 'DSPD SCE: Mental health treatment options and hospital visits', duration: '45 mins', order: 125 },
  { title: 'DSPD SCE: Moving beyond difficult behavior', duration: '45 mins', order: 126 },
  { title: 'DSPD SCE: Relationships, dating, and intimacy - part 1', duration: '35 mins', order: 127 },
  { title: 'DSPD SCE: Relationships, dating, and intimacy - part 2', duration: '30 mins', order: 128 },
  { title: 'DSPD SCE: Relationships, dating, and intimacy - part 3', duration: '35 mins', order: 129 },
  { title: 'DSPD SCE: Sexuality and relationships', duration: '2 hrs 30 mins', order: 130 },
  { title: 'DSPD SCE: Staying connected on social media', duration: '25 mins', order: 131 },
  { title: 'DSPD SCE: Staying safe on social media', duration: '30 mins', order: 132 },
  { title: 'DSPD SCE: The impact of disability', duration: '40 mins', order: 133 },
  { title: 'DSPD SCE: The importance of being present', duration: '30 mins', order: 134 },
  { title: 'DSPD SCE: The importance of control', duration: '30 mins', order: 135 },
];

async function main() {
  console.log('Creating DSPD Support Coordinator trainings from official guide...\n');

  // Find or create the "Start Here" content item
  let startHereContent = await prisma.contentItem.findFirst({
    where: {
      title: 'DSPD Support Coordinator Start Here',
      program: 'DSPD',
    },
  });

  if (!startHereContent) {
    console.log('Creating "Start Here" content item...');
    const slug = 'dspd-support-coordinator-start-here';
    startHereContent = await prisma.contentItem.create({
      data: {
        title: 'DSPD Support Coordinator Start Here',
        slug,
        summary: 'Complete onboarding guide for new DSPD Support Coordinators. Walk through all required steps, forms, and initial trainings in order.',
        content: '# DSPD Support Coordinator Start Here\n\nSee the full guide in the Library section.',
        category: 'TRAININGS',
        program: 'DSPD',
        isFromFile: false,
      },
    });
    console.log('  ✓ Created "Start Here" content item');
  }

  // Create "Start Here" training
  const startHereTraining = {
    title: 'DSPD Support Coordinator Start Here',
    description: 'Complete onboarding guide for new DSPD Support Coordinators. Walk through all required steps, forms, and initial trainings in order.',
    program: 'DSPD',
    duration: 'Guide (follow step-by-step)',
    frequency: 'Once (for new coordinators)',
    videoUrl: '',
    documentUrl: '',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    order: 0,
    contentItemId: startHereContent.id,
  };

  // Combine all required trainings
  const allRequiredTrainings = [
    startHereTraining,
    ...medicaid101,
    ...deadlineRequiredTrainings,
    ...initialRequiredTrainings,
    ...fy26RequiredTrainings,
    ...disabilityConditionTrainings,
  ];

  // First, delete all existing DSPD trainings that aren't "Start Here"
  const existingTrainings = await prisma.training.findMany({
    where: {
      program: 'DSPD',
      title: { not: 'DSPD Support Coordinator Start Here' },
    },
  });

  if (existingTrainings.length > 0) {
    console.log(`\nRemoving ${existingTrainings.length} existing DSPD trainings...`);
    for (const training of existingTrainings) {
      await prisma.trainingRequirement.deleteMany({
        where: { trainingId: training.id },
      });
      await prisma.trainingCompletion.deleteMany({
        where: { trainingId: training.id },
      });
      await prisma.training.delete({
        where: { id: training.id },
      });
    }
    console.log('  ✓ Removed existing trainings');
  }

  // Create all required trainings
  console.log('\nCreating required trainings...');
  for (const trainingData of allRequiredTrainings) {
    const { requiredRoles, contentItemId, ...trainingInfo } = trainingData;

    // Check if training already exists (for Start Here)
    const existing = await prisma.training.findFirst({
      where: {
        title: trainingInfo.title,
        program: trainingInfo.program,
      },
    });

    if (existing) {
      // Update existing training
      await prisma.training.update({
        where: { id: existing.id },
        data: {
          description: `${trainingInfo.description}\n\nDuration: ${trainingInfo.duration}\nFrequency: ${trainingInfo.frequency}`,
          order: trainingInfo.order,
          contentItemId: contentItemId || null,
        },
      });
      console.log(`  ✓ Updated: ${trainingInfo.title}`);
    } else {
      // Create new training
      const training = await prisma.training.create({
        data: {
          title: trainingInfo.title,
          description: `${trainingInfo.description}\n\nDuration: ${trainingInfo.duration}\nFrequency: ${trainingInfo.frequency}`,
          program: trainingInfo.program,
          videoUrl: trainingInfo.videoUrl || null,
          documentUrl: trainingInfo.documentUrl || null,
          contentItemId: contentItemId || null,
          order: trainingInfo.order,
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
  }

  // Create optional trainings (not required, so no requirements)
  console.log('\nCreating optional trainings...');
  for (const optTraining of optionalTrainings) {
    const existing = await prisma.training.findFirst({
      where: {
        title: optTraining.title,
        program: 'DSPD',
      },
    });

    if (!existing) {
      await prisma.training.create({
        data: {
          title: optTraining.title,
          description: `Optional training available through the Utah Learning Portal. This training counts toward your 30 hours of annual continuing education.\n\nDuration: ${optTraining.duration}\nFrequency: Optional`,
          program: 'DSPD',
          videoUrl: null,
          documentUrl: 'https://utahlearningportal.com',
          order: optTraining.order,
        },
      });
      console.log(`  ✓ Created: ${optTraining.title}`);
    } else {
      console.log(`  ⏭️  Skipped (exists): ${optTraining.title}`);
    }
  }

  console.log(`\n✅ Training creation complete!`);
  console.log(`   - Required trainings: ${allRequiredTrainings.length}`);
  console.log(`   - Optional trainings: ${optionalTrainings.length}`);
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
