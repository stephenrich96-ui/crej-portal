import { PrismaClient } from '@prisma/client';
import { scanContentDirectory, parseMarkdownFile } from '../lib/content-ingestion';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing content items from files
  await prisma.contentItem.deleteMany({
    where: { isFromFile: true },
  });

  // Scan and import markdown files
  const contentDir = path.join(process.cwd(), 'content');
  const parsedFiles = scanContentDirectory(contentDir);

  console.log(`📄 Found ${parsedFiles.length} markdown files`);

  for (const parsed of parsedFiles) {
    try {
      // Check if content item already exists (by slug)
      const existing = await prisma.contentItem.findUnique({
        where: { slug: parsed.slug },
      });

      if (existing && existing.isFromFile) {
        // Update existing
        await prisma.contentItem.update({
          where: { slug: parsed.slug },
          data: {
            title: parsed.title,
            summary: parsed.summary,
            content: parsed.content,
            category: parsed.category,
            program: parsed.program,
            filePath: parsed.filePath,
            isFromFile: true,
          },
        });
        console.log(`  ✓ Updated: ${parsed.title}`);
      } else {
        // Create new
        await prisma.contentItem.create({
          data: {
            title: parsed.title,
            slug: parsed.slug,
            summary: parsed.summary,
            content: parsed.content,
            category: parsed.category,
            program: parsed.program,
            filePath: parsed.filePath,
            isFromFile: true,
          },
        });
        console.log(`  ✓ Created: ${parsed.title}`);
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${parsed.filePath}:`, error);
    }
  }

  // Clear existing trainings FIRST to ensure fresh data
  console.log('\n📚 Creating trainings...');
  await prisma.trainingRequirement.deleteMany({});
  await prisma.trainingCompletion.deleteMany({});
  await prisma.training.deleteMany({});
  console.log('  ✓ Cleared existing trainings');

  // Find content items that should be trainings
  const trainingContent = await prisma.contentItem.findMany({
    where: {
      OR: [
        { category: 'TRAININGS' },
        { slug: { contains: 'training' } },
        { slug: { contains: 'onboarding' } },
      ],
      program: 'DSPD',
    },
  });

  // Create trainings linked to content - ONLY if they should be required trainings
  // Only create trainings that are explicitly training content, not just reference material
  for (const content of trainingContent) {
    // Only create training if it's explicitly a training (not just reference material)
    const isTraining = content.category === 'TRAININGS' || 
                       content.slug.includes('onboarding') ||
                       content.slug.includes('training');
    
    if (isTraining) {
      const training = await prisma.training.create({
        data: {
          title: content.title,
          description: content.summary || undefined,
          contentItemId: content.id,
          program: content.program,
          order: 0,
        },
      });

      // Make required for all DSPD roles
      const roles = ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'];
      for (const role of roles) {
        await prisma.trainingRequirement.create({
          data: {
            trainingId: training.id,
            role,
          },
        });
      }
      console.log(`  ✓ Created training: ${content.title}`);
    }
  }

  // Create content items for waiver trainings, then link to trainings
  const waiverTrainings = [
    {
      title: 'Community Supports Waiver Training',
      description: 'Comprehensive training on the Community Supports Waiver program, including eligibility, services, and coordination requirements.',
      program: 'DSPD',
      content: `# Community Supports Waiver Training

## Overview
The Community Supports Waiver provides services to individuals with developmental disabilities who need ongoing support to live in the community.

## Key Topics
- Eligibility requirements
- Available services and supports
- Service planning process
- Provider coordination
- Documentation requirements

## Training Video
The training video will be embedded above when a video URL is provided.

## Additional Resources
- DSPD Manual: Waiver Programs Section
- Form 0-2: Service Plan
- Health E: Service catalog`,
      videoUrl: '', // TODO: Add YouTube/Vimeo embed URL or direct video URL
      requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    },
    {
      title: 'Community Transitions Waiver Training',
      description: 'Training on the Community Transitions Waiver, focusing on transition services and community integration.',
      program: 'DSPD',
      content: `# Community Transitions Waiver Training

## Overview
The Community Transitions Waiver assists individuals transitioning from institutional settings to community-based living.

## Key Topics
- Transition planning
- Housing supports
- Community integration services
- Ongoing coordination
- Documentation requirements

## Training Video
The training video will be embedded above when a video URL is provided.

## Additional Resources
- DSPD Manual: Waiver Programs Section
- Transition planning guidelines
- Health E: Service catalog`,
      videoUrl: '', // TODO: Add YouTube/Vimeo embed URL or direct video URL
      requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    },
    {
      title: 'Limited Supports Waiver Training',
      description: 'Training on the Limited Supports Waiver program and its specific service requirements.',
      program: 'DSPD',
      content: `# Limited Supports Waiver Training

## Overview
The Limited Supports Waiver provides services to individuals who need minimal support to maintain community living.

## Key Topics
- Eligibility criteria
- Limited support services
- Service planning
- Provider requirements
- Documentation standards

## Training Video
The training video will be embedded above when a video URL is provided.

## Additional Resources
- DSPD Manual: Waiver Programs Section
- Service plan templates
- Health E: Service catalog`,
      videoUrl: '', // TODO: Add YouTube/Vimeo embed URL or direct video URL
      requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    },
    {
      title: 'Physical Disabilities Waiver Training',
      description: 'Training on the Physical Disabilities Waiver, including services for individuals with physical disabilities.',
      program: 'DSPD',
      content: `# Physical Disabilities Waiver Training

## Overview
The Physical Disabilities Waiver provides services to individuals with physical disabilities who need support to live independently in the community.

## Key Topics
- Eligibility requirements
- Physical disability services
- Assistive technology
- Home modifications
- Service coordination

## Training Video
The training video will be embedded above when a video URL is provided.

## Additional Resources
- DSPD Manual: Waiver Programs Section
- Assistive technology resources
- Health E: Service catalog`,
      videoUrl: '', // TODO: Add YouTube/Vimeo embed URL or direct video URL
      requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    },
    {
      title: 'Acquired Brain Injury Waiver Training',
      description: 'Training on the Acquired Brain Injury Waiver and specialized services for individuals with brain injuries.',
      program: 'DSPD',
      content: `# Acquired Brain Injury Waiver Training

## Overview
The Acquired Brain Injury Waiver provides specialized services for individuals who have acquired brain injuries and need support services.

## Key Topics
- Brain injury assessment
- Specialized services
- Cognitive supports
- Rehabilitation services
- Long-term coordination

## Training Video
The training video will be embedded above when a video URL is provided.

## Additional Resources
- DSPD Manual: Waiver Programs Section
- Brain injury resources
- Health E: Service catalog`,
      videoUrl: '', // TODO: Add YouTube/Vimeo embed URL or direct video URL
      requiredRoles: ['DSPD_SUPPORT_COORDINATOR', 'DSPD_MANAGER'],
    },
  ];

  for (const trainingData of waiverTrainings) {
    const { requiredRoles, content, ...trainingInfo } = trainingData;
    
    // Create or find content item
    let contentItem = await prisma.contentItem.findFirst({
      where: { 
        title: trainingInfo.title,
        program: trainingInfo.program,
      },
    });

    if (!contentItem) {
      const slug = trainingInfo.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      contentItem = await prisma.contentItem.create({
        data: {
          title: trainingInfo.title,
          slug,
          summary: trainingInfo.description,
          content: content,
          category: 'TRAININGS',
          program: trainingInfo.program,
          isFromFile: false,
        },
      });
    }

    // Create training linked to content
    const existing = await prisma.training.findFirst({
      where: { title: trainingInfo.title, program: trainingInfo.program },
    });

    if (!existing) {
      const training = await prisma.training.create({
        data: {
          ...trainingInfo,
          contentItemId: contentItem.id,
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
      console.log(`  ✓ Created training: ${trainingInfo.title}`);
    }
  }

  // Create comprehensive checklists from documentation
  console.log('\n✅ Creating comprehensive checklists...');

  // Clear existing checklists to ensure fresh data
  await prisma.checklistItem.deleteMany({});
  await prisma.checklistInstance.deleteMany({});
  await prisma.checklist.deleteMany({});
  console.log('  ✓ Cleared existing checklists');

  const comprehensiveChecklists = [
    // NEW CLIENT INTAKE - DSPD
    {
      title: 'New Client Intake - DSPD',
      description: 'Complete checklist for new DSPD client intake process',
      type: 'NEW_CLIENT',
      program: 'DSPD',
      items: [
        {
          title: 'Step 1: Receive and Review Referral',
          description: 'Receive referral from DSPD. Review referral information for completeness. Document receipt in Health E.',
          order: 0,
        },
        {
          title: 'Step 2: Initial Contact (Within 2 Business Days)',
          description: 'Contact client/family within 2 business days. Introduce yourself and explain role. Schedule initial assessment meeting. Document contact in Health E.',
          order: 1,
        },
        {
          title: 'Step 3: Prepare for Assessment Meeting',
          description: 'Review referral information. Prepare assessment questions. Gather necessary forms (Form 0-0). Confirm meeting location/time.',
          order: 2,
        },
        {
          title: 'Step 4: Conduct Initial Assessment',
          description: 'Meet with client and family/guardian. Complete comprehensive assessment. Identify strengths and needs. Discuss goals and preferences. Review available services. Answer questions.',
          order: 3,
        },
        {
          title: 'Step 5: Complete Assessment Documentation',
          description: 'Complete assessment form (Form 0-0). Document meeting notes. Upload to Health E within 3 business days. Notify manager of completion.',
          order: 4,
        },
        {
          title: 'Step 6: Develop Service Plan',
          description: 'Review assessment findings. Identify service needs. Research available providers. Develop person-centered goals. Create service plan (Form 0-2).',
          order: 5,
        },
        {
          title: 'Step 7: Review Service Plan with Client',
          description: 'Present service plan to client/family. Get client/family input. Make revisions as needed. Obtain signatures/approval.',
          order: 6,
        },
        {
          title: 'Step 8: Submit for Approval',
          description: 'Complete all required forms. Submit to DSPD via Health E. Follow up on approval status. Document submission date.',
          order: 7,
        },
        {
          title: 'Step 9: Coordinate Service Implementation',
          description: 'Contact service providers. Verify provider availability. Coordinate start dates. Ensure services begin as planned.',
          order: 8,
        },
        {
          title: 'Step 10: Initial Monitoring (After 1 Week)',
          description: 'Check in with client after 1 week. Verify services started. Address any concerns. Document initial monitoring.',
          order: 9,
        },
      ],
    },
    // NEW ISO FORM SUBMISSION
    {
      title: 'New ISO Form Submission',
      description: 'Checklist for completing and submitting any ISO form to DSPD',
      type: 'REQUIRED_FORMS',
      program: 'DSPD',
      items: [
        {
          title: 'Step 1: Identify Required Form',
          description: 'Determine which form is needed (Form 0-0, 0-2, 0-5, 0-8, 0-9). Review form purpose and requirements. Check DSPD manual for guidance.',
          order: 0,
        },
        {
          title: 'Step 2: Gather Required Information',
          description: 'Collect all necessary client information. Review previous documentation. Verify accuracy of data. Prepare supporting documents.',
          order: 1,
        },
        {
          title: 'Step 3: Complete Form',
          description: 'Read form completely before starting. Fill out all required fields. Use clear, professional language. Be specific and detailed. Use N/A for truly non-applicable sections.',
          order: 2,
        },
        {
          title: 'Step 4: Quality Check',
          description: 'Verify all required fields completed. Check information is accurate and current. Ensure language is clear and professional. Verify all signatures obtained. Confirm supporting documentation attached.',
          order: 3,
        },
        {
          title: 'Step 5: Manager Review',
          description: 'Submit form to manager for review. Address any feedback or corrections. Make necessary revisions. Obtain manager approval.',
          order: 4,
        },
        {
          title: 'Step 6: Submit to DSPD',
          description: 'Upload form to Health E. Verify submission successful. Document submission date. Follow up on approval status if needed.',
          order: 5,
        },
      ],
    },
    // MONTHLY SERVICE COORDINATION
    {
      title: 'Monthly Service Coordination - DSPD',
      description: 'Required monthly tasks for ongoing client service coordination',
      type: 'MONTHLY_REMINDERS',
      program: 'DSPD',
      items: [
        {
          title: 'Monthly Client Contact (First Week)',
          description: 'Contact client or family. Assess current situation. Identify any concerns or changes. Document contact in Health E.',
          order: 0,
        },
        {
          title: 'Service Monitoring',
          description: 'Verify services being provided. Check service quality. Address any service issues. Document monitoring activities.',
          order: 1,
        },
        {
          title: 'Provider Communication',
          description: 'Respond to provider inquiries. Coordinate service changes. Address billing questions. Document all communications.',
          order: 2,
        },
        {
          title: 'Progress Notes',
          description: 'Complete progress notes. Include date, time, method of contact, who was present, topics discussed, actions taken, next steps. Upload to Health E within 3 business days.',
          order: 3,
        },
        {
          title: 'Service Plan Updates (If Needed)',
          description: 'Update service plan as needed. File all documents in Health E. Maintain organized case file.',
          order: 4,
        },
      ],
    },
    // ANNUAL REVIEW PROCESS
    {
      title: 'Annual Review Process - DSPD',
      description: 'Complete checklist for annual review (start 60 days before due date)',
      type: 'NEW_ISO',
      program: 'DSPD',
      items: [
        {
          title: '60 Days Before: Schedule Assessment',
          description: 'Contact client/family. Schedule comprehensive assessment. Notify service providers. Prepare assessment materials.',
          order: 0,
        },
        {
          title: '60 Days Before: Gather Information',
          description: 'Review past year\'s progress. Collect provider reports. Review service utilization. Identify changes in needs.',
          order: 1,
        },
        {
          title: '30 Days Before: Conduct Comprehensive Assessment',
          description: 'Meet with client and family. Complete assessment forms. Review all services. Assess goal achievement. Identify new needs.',
          order: 2,
        },
        {
          title: '30 Days Before: Update Service Plan',
          description: 'Update goals based on assessment. Revise services as needed. Complete new service plan (Form 0-2). Review with client/family.',
          order: 3,
        },
        {
          title: 'On or Before Due Date: Complete All Forms',
          description: 'Updated service plan completed. Assessment documentation complete. Required attachments gathered. All signatures obtained.',
          order: 4,
        },
        {
          title: 'On or Before Due Date: Submit to DSPD',
          description: 'Upload to Health E. Verify submission successful. Document submission date. Follow up on approval.',
          order: 5,
        },
      ],
    },
    // MONTHLY NOTES AUDIT
    {
      title: 'Monthly Notes Audit',
      description: 'Monthly audit checklist to ensure all documentation is complete and timely',
      type: 'MONTHLY_NOTES_AUDIT',
      program: 'DSPD',
      items: [
        {
          title: 'Verify Monthly Contacts Completed',
          description: 'Check that all clients had monthly contact. Verify contact documented in Health E. Ensure contact was within required timeframe.',
          order: 0,
        },
        {
          title: 'Check Documentation Timeliness',
          description: 'Verify all progress notes uploaded within 3 business days. Check for any overdue documentation. Identify any missing notes.',
          order: 1,
        },
        {
          title: 'Review Note Quality',
          description: 'Check notes include required elements (date, time, method, participants, topics, actions, next steps). Verify notes are clear and professional. Ensure no PHI/client names in notes.',
          order: 2,
        },
        {
          title: 'Verify Service Plan Currency',
          description: 'Check all service plans are current. Verify no expired or outdated plans. Ensure annual reviews completed on time.',
          order: 3,
        },
        {
          title: 'Check Provider Communications Documented',
          description: 'Verify all provider communications documented. Check billing questions addressed. Ensure service changes documented.',
          order: 4,
        },
        {
          title: 'Complete Audit Documentation',
          description: 'Document audit findings. Address any issues identified. Update tracking spreadsheet. Report to manager if concerns.',
          order: 5,
        },
      ],
    },
    // INCIDENT REPORTING
    {
      title: 'Incident Reporting Process',
      description: 'Checklist for reporting and documenting incidents',
      type: 'INCIDENT_REPORTING',
      program: 'DSPD',
      items: [
        {
          title: 'Immediate Response (If Emergency)',
          description: 'If client in immediate danger: Call 911 immediately. Notify manager within 15 minutes. Follow crisis protocols.',
          order: 0,
        },
        {
          title: 'Document Incident',
          description: 'Complete incident report form. Include date, time, location, description, participants, actions taken. Document in Health E within 24 hours.',
          order: 1,
        },
        {
          title: 'Follow Up with Client/Family',
          description: 'Contact client/family within 48 hours. Provide support and information. Document follow-up contact.',
          order: 2,
        },
        {
          title: 'Notify Manager',
          description: 'Inform manager of incident. Provide all documentation. Discuss any needed follow-up actions.',
          order: 3,
        },
        {
          title: 'Complete Required Forms',
          description: 'Complete any required DSPD incident forms. Submit to DSPD if required. Maintain documentation in case file.',
          order: 4,
        },
        {
          title: 'Follow Up Actions',
          description: 'Implement any corrective actions. Monitor situation. Document resolution. Update service plan if needed.',
          order: 5,
        },
      ],
    },
    // TIMESHEET / BILLING PROCESS
    {
      title: 'Timesheet / Billing Process',
      description: 'Monthly checklist for timesheet submission and billing verification',
      type: 'TIMESHEET_BILLING',
      program: 'DSPD',
      items: [
        {
          title: 'Document All Billable Activities',
          description: 'Record all client contacts. Document service coordination activities. Note provider communications. Track assessment and planning time.',
          order: 0,
        },
        {
          title: 'Complete Timesheet',
          description: 'Enter all billable hours. Verify accuracy of entries. Include appropriate billing codes. Ensure all required information completed.',
          order: 1,
        },
        {
          title: 'Verify Service Documentation',
          description: 'Ensure all services documented in Health E. Verify progress notes completed. Check service plans current. Confirm all required documentation present.',
          order: 2,
        },
        {
          title: 'Submit Timesheet',
          description: 'Submit timesheet by deadline. Verify submission successful. Retain copy for records.',
          order: 3,
        },
        {
          title: 'Review Billing Reports',
          description: 'Review billing reports when received. Verify accuracy. Address any discrepancies. Document resolution.',
          order: 4,
        },
      ],
    },
    // REQUIRED FORMS CHECKLIST
    {
      title: 'Required Forms - DSPD',
      description: 'Checklist of all required forms and when they must be completed',
      type: 'REQUIRED_FORMS',
      program: 'DSPD',
      items: [
        {
          title: 'Form 0-0: Initial Service Option',
          description: 'Required for: New client intake. Location: /Desktop/CREJ/DSPD files needed to be sent/Form0-2-2.pdf. Due: Within 3 business days of assessment.',
          order: 0,
        },
        {
          title: 'Form 0-2: Service Plan',
          description: 'Required for: Initial service plan, annual reviews, service changes. Location: /Desktop/CREJ/DSPD files needed to be sent/Form0-2-2.pdf. Due: As needed, annual reviews on time.',
          order: 1,
        },
        {
          title: 'Form 0-5: [Purpose - Update when known]',
          description: 'Location: /Desktop/CREJ/DSPD files needed to be sent/Form 0-5.pdf. Review with manager for specific requirements.',
          order: 2,
        },
        {
          title: 'Form 0-8: [Purpose - Update when known]',
          description: 'Location: /Desktop/CREJ/DSPD files needed to be sent/Form 0-8.pdf. Review with manager for specific requirements.',
          order: 3,
        },
        {
          title: 'Form 0-9: [Purpose - Update when known]',
          description: 'Location: /Desktop/CREJ/DSPD files needed to be sent/Form 0-9 DSPD-2.pdf. Review with manager for specific requirements.',
          order: 4,
        },
        {
          title: 'Progress Notes',
          description: 'Required for: All client contacts. Format: Health E progress note template. Due: Within 3 business days of contact.',
          order: 5,
        },
        {
          title: 'Incident Reports',
          description: 'Required for: All incidents, emergencies, service issues. Format: DSPD incident report form. Due: Within 24 hours of incident.',
          order: 6,
        },
      ],
    },
    // SUPPORT COORDINATOR ONBOARDING (Manager Checklist)
    {
      title: 'Support Coordinator Onboarding - Manager Tasks',
      description: 'Manager checklist for onboarding new support coordinators',
      type: 'CUSTOM',
      program: 'DSPD',
      items: [
        {
          title: 'Pre-First Day: System Access Setup',
          description: 'Request Health E account creation. Set up MyCase access. Create email account. Configure phone/voicemail. Issue office keys and access cards. Test all system access.',
          order: 0,
        },
        {
          title: 'Pre-First Day: Workspace Preparation',
          description: 'Prepare desk/workstation. Ensure computer and equipment ready. Stock supplies. Prepare welcome packet.',
          order: 1,
        },
        {
          title: 'Pre-First Day: Training Materials',
          description: 'Verify all training links work. Ensure training videos accessible. Prepare sample case files. Create training schedule. Assign mentor/shadow coordinator.',
          order: 2,
        },
        {
          title: 'First Day: Orientation',
          description: 'Welcome meeting and introductions. Tour of office. Review onboarding checklist. Set up training schedule. Introduce to team. Review first week expectations.',
          order: 3,
        },
        {
          title: 'Week 1: Daily Check-ins',
          description: 'Review training progress daily (15-30 min). Answer questions. Address concerns. Provide encouragement. Verify foundation training completion.',
          order: 4,
        },
        {
          title: 'Week 2-4: Weekly Progress Reviews',
          description: 'Review training completion. Assess competency development. Identify areas needing support. Adjust training plan. Observe form completion. Review sample documentation.',
          order: 5,
        },
        {
          title: 'Month 2-3: Caseload Management',
          description: 'Gradually assign clients (start with 2-3). Monitor case management quality. Review all documentation before submission. Provide feedback and coaching. Complete competency assessment.',
          order: 6,
        },
      ],
    },
    // QUARTERLY SERVICE PLAN REVIEW
    {
      title: 'Quarterly Service Plan Review',
      description: 'Quarterly review of service plans and client progress',
      type: 'CUSTOM',
      program: 'DSPD',
      items: [
        {
          title: 'Review Current Service Plan',
          description: 'Review all active service plans. Assess progress toward goals. Identify needed changes. Note any service issues.',
          order: 0,
        },
        {
          title: 'Assess Goal Achievement',
          description: 'Review each client\'s goals. Assess progress made. Identify barriers. Note successes.',
          order: 1,
        },
        {
          title: 'Identify Service Changes Needed',
          description: 'Determine if services need adjustment. Identify new service needs. Note services no longer needed.',
          order: 2,
        },
        {
          title: 'Schedule Stakeholder Meeting (If Needed)',
          description: 'Schedule with client/family if changes needed. Invite service providers. Review progress and goals. Update service plan.',
          order: 3,
        },
        {
          title: 'Update Service Plan (If Needed)',
          description: 'Complete updated service plan (Form 0-2). Review with client/family. Obtain signatures. Submit to DSPD.',
          order: 4,
        },
        {
          title: 'Document Review',
          description: 'Document review findings. Update case notes. File documentation in Health E.',
          order: 5,
        },
      ],
    },
  ];

  for (const checklistData of comprehensiveChecklists) {
    const { items, ...checklistInfo } = checklistData;
    
    const checklist = await prisma.checklist.create({
      data: checklistInfo,
    });

    for (const item of items) {
      await prisma.checklistItem.create({
        data: {
          ...item,
          checklistId: checklist.id,
        },
      });
    }
    console.log(`  ✓ Created checklist: ${checklistInfo.title} (${items.length} items)`);
  }

  console.log('\n✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
