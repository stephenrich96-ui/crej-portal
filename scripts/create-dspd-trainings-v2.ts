// Script to create DSPD Support Coordinator trainings from the official guide
// Run with: tsx scripts/create-dspd-trainings-v2.ts

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
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 1,
  },
  {
    title: 'DSPD SCE: Profound and complex disabilities (Open Future Learning)',
    description: 'This course helps participants better understand and support people with profound and complex disabilities. It emphasizes seeing the whole person, recognizing that communication happens in every part of life, and supporting people to have power and control in their daily choices. Participants will also learn about sensory experiences, postural care, and common medical needs to provide thoughtful, person-centered support.',
    program: 'DSPD',
    duration: '2 hrs 35 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 2,
  },
  {
    title: 'DSPD SCE: Ethics training for support coordinators',
    description: 'This course reviews the ethical standards essential to support coordination. It also equips support coordinators with the knowledge and skills to apply ethical principles in decision-making processes.',
    program: 'DSPD',
    duration: '25 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 3,
  },
  {
    title: 'DSPD SCE: Finance',
    description: 'This course provides support coordinators with an overview of their role as contracted Medicaid Providers in the payment process, along with guidance on meeting requirements for contracts, licensing, and Medicaid policy and billing. Participants will also learn about the procurement process, including training related to HB125.',
    program: 'DSPD',
    duration: '40 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 4,
  },
  {
    title: 'DSPD SCE: Records management',
    description: 'This course guides participants through the proper use of the 6 DSPD HIPAA forms, emphasizing respect for client confidentiality and the appropriate timing for destroying confidential records. Additionally, learners will learn how to navigate the imaging module in USTEPS.',
    program: 'DSPD',
    duration: '20 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 5,
  },
  {
    title: 'DSPD SCE: Health monitoring: The fatal five (Open Future Learning)',
    description: 'This course covers the "Fatal Five" preventable conditions–aspiration, dehydration, constipation, seizures, and sepsis–that pose health risks to the people you support. Learners will explore the key causes, signs, and symptoms of each condition.',
    program: 'DSPD',
    duration: '2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 6,
  },
];

// REQUIRED TRAININGS - Due by June 5, 2026
const deadlineRequiredTrainings = [
  {
    title: 'Supporting a vision for employment',
    description: 'Developed by the State Employment Leadership Network (SELN), this training highlights the vital role case managers play in supporting people to pursue and maintain competitive, integrated employment. This course focuses on essential components of effective employment support, presents real-world scenarios, and includes interactive exercises that help learners apply what they\'ve learned. It equips support coordinators with the knowledge and confidence needed to perform their duties effectively.',
    program: 'DSPD',
    duration: '5 hrs 30 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://seln.org/training/supporting-a-vision-for-employment',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 7,
    deadlineDate: '2026-06-05',
  },
];

// MORE REQUIRED TRAININGS - Coming in FY26
const moreRequiredTrainings = [
  {
    title: 'DSPD SCE: Level of care and Medicaid eligibility',
    description: 'This course provides an overview of the two-step waiver Medicaid determination process, covering both level of care and waiver Medicaid eligibility. Participants will learn how to navigate the waiver review process and identify and report changes that may affect eligibility.',
    program: 'DSPD',
    duration: '45 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 8,
  },
  {
    title: 'DSPD SCE: State match program',
    description: 'This course provides an overview of the state match program, including its purpose, structure, and target population. Participants will learn the support coordinator\'s key roles and responsibilities, how to navigate funding, billing, and WHX code requirements, and how to manage case transitions and closures effectively. This includes information on working with the Division of Child & Family Services and the Division of Juvenile Justice & Youth Services.',
    program: 'DSPD',
    duration: '25 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 9,
  },
  {
    title: 'DSPD SCE: Challenging behaviors (Open Future Learning)',
    description: 'This course explores the meaning and causes of challenging behavior and how to respond in ways that promote understanding and support. Participants will learn how individual and environmental factors influence behavior, and how communication difficulties can play a role. The course emphasizes person-centered tools and strategies to prevent or reduce challenging behavior. Learners will also consider how loneliness, relationships, and valued roles affect well-being and behavior.',
    program: 'DSPD',
    duration: '3 hrs 45 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 10,
  },
  {
    title: 'DSPD SCE: Autism',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 11,
  },
  {
    title: 'DSPD SCE: Dementia strategies',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 12,
  },
  {
    title: 'DSPD SCE: Down syndrome',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 13,
  },
  {
    title: 'DSPD SCE: Epilepsy',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 14,
  },
  {
    title: 'DSPD SCE: Fetal Alcohol Spectrum Disorder - Supporting Success',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 15,
  },
  {
    title: 'DSPD SCE: Mental health',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 16,
  },
  {
    title: 'DSPD SCE: Prader-Willi Syndrome',
    description: 'This course is designed to broaden your knowledge of disability and disability conditions. Support coordinators are required to complete one of the disability condition courses.',
    program: 'DSPD',
    duration: '~2 hrs',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 17,
  },
  {
    title: 'DSPD SCE: Disability 101',
    description: 'This course introduces the concept of disability, exploring different types of disabilities and how they are perceived. Participants will learn effective communication strategies, including the use of disability related language, and gain an understanding of the history of disability rights in the United States.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 18,
  },
  {
    title: 'DSPD SCE: Incident/fatality reporting',
    description: 'This course provides an overview of reporting requirements, including what must be reported, to whom, and within what timeframes. Participants will learn how to complete required reporting, become familiar with the state and federal codes and division policies that authorize these requirements, and discover resources to turn to when questions arise.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 19,
  },
  {
    title: 'DSPD SCE: Office of Services Review',
    description: 'This course provides an overview of the Office of Service Review\'s responsibilities within the support coordination contract. Participants will learn about types of contract monitoring and when it is appropriate to contact the Office of Services Review.',
    program: 'DSPD',
    duration: '20 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 20,
  },
  {
    title: 'DSPD SCE: Person-centered approaches, thinking, and planning (Open Future Learning)',
    description: 'This course explores the foundations of person-centered approaches, thinking, and planning, with a focus on the key principles that guide effective practice. Participants will learn how to apply person-centered thinking tools in their work and understand what makes a planning meeting successful. The course emphasizes strategies for supporting individuals in leading and directing their own meetings.',
    program: 'DSPD',
    duration: '3 hrs',
    frequency: 'Every other year (even fiscal years)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 21,
  },
  {
    title: 'DSPD SCE: Person-centered planning (Utah specific)',
    description: 'This course will give learners an understanding of the key principles and best practices that underpin person-centered planning.',
    program: 'DSPD',
    duration: '45 mins',
    frequency: 'Every other year (odd fiscal years)',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 22,
  },
  {
    title: 'DSPD SCE: Self-administered (SAS) and agency services',
    description: 'This course introduces the SAS service delivery model, outlining the roles and responsibilities of those involved. Participants will also learn how to integrate SAS services into person-centered planning and support coordination activities.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Once',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 23,
  },
  {
    title: 'DSPD SCE: Settings Rule and monitoring',
    description: 'This course introduced the purpose of the Home and Community-Based Services (HCBS) Settings Rule, the rights it protects, and what those rights look like in practice. Participants will learn how to identify and report potential rule violations and gain an understanding of what constitutes a rights restriction.',
    program: 'DSPD',
    duration: '30 mins',
    frequency: 'Every year',
    videoUrl: '',
    documentUrl: 'https://utahlearningportal.com',
    requiredRoles: ['DSPD_SUPPORT_COORDINATOR'],
    order: 24,
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

  // Clear existing trainings
  const existingTrainings = await prisma.training.findMany({
    where: { program: 'DSPD' },
  });

  if (existingTrainings.length > 0) {
    console.log(`Removing ${existingTrainings.length} existing DSPD trainings...`);
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

  // Create initial required trainings
  console.log('\nCreating initial required trainings (due in 60 days)...');
  for (const trainingData of initialRequiredTrainings) {
    const { requiredRoles, ...trainingInfo } = trainingData;
    const training = await prisma.training.create({
      data: {
        title: trainingInfo.title,
        description: `${trainingInfo.description}\n\nDuration: ${trainingInfo.duration}\nFrequency: ${trainingInfo.frequency}`,
        program: trainingInfo.program,
        videoUrl: trainingInfo.videoUrl || null,
        documentUrl: trainingInfo.documentUrl || null,
        order: trainingInfo.order,
      },
    });

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

  // Create deadline required trainings
  console.log('\nCreating required trainings with deadlines (due by June 5, 2026)...');
  for (const trainingData of deadlineRequiredTrainings) {
    const { requiredRoles, deadlineDate, ...trainingInfo } = trainingData;
    const training = await prisma.training.create({
      data: {
        title: trainingInfo.title,
        description: `${trainingInfo.description}\n\nDuration: ${trainingInfo.duration}\nFrequency: ${trainingInfo.frequency}\n\n⚠️ DEADLINE: Due by June 5, 2026`,
        program: trainingInfo.program,
        videoUrl: trainingInfo.videoUrl || null,
        documentUrl: trainingInfo.documentUrl || null,
        order: trainingInfo.order,
      },
    });

    for (const role of requiredRoles) {
      await prisma.trainingRequirement.create({
        data: {
          trainingId: training.id,
          role,
        },
      });
    }
    console.log(`  ✓ Created: ${trainingInfo.title} (Deadline: ${deadlineDate})`);
  }

  // Create more required trainings (FY26)
  console.log('\nCreating more required trainings (FY26)...');
  for (const trainingData of moreRequiredTrainings) {
    const { requiredRoles, ...trainingInfo } = trainingData;
    const training = await prisma.training.create({
      data: {
        title: trainingInfo.title,
        description: `${trainingInfo.description}\n\nDuration: ${trainingInfo.duration}\nFrequency: ${trainingInfo.frequency}`,
        program: trainingInfo.program,
        videoUrl: trainingInfo.videoUrl || null,
        documentUrl: trainingInfo.documentUrl || null,
        order: trainingInfo.order,
      },
    });

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

  // Create optional trainings (not required, so no requirements)
  console.log('\nCreating optional trainings...');
  for (const optTraining of optionalTrainings) {
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
  }

  console.log(`\n✅ Training creation complete!`);
  console.log(`   - Initial required trainings: ${initialRequiredTrainings.length}`);
  console.log(`   - Deadline required trainings: ${deadlineRequiredTrainings.length}`);
  console.log(`   - More required trainings (FY26): ${moreRequiredTrainings.length}`);
  console.log(`   - Optional trainings: ${optionalTrainings.length}`);
  console.log(`   - Total: ${initialRequiredTrainings.length + deadlineRequiredTrainings.length + moreRequiredTrainings.length + optionalTrainings.length} trainings`);
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
