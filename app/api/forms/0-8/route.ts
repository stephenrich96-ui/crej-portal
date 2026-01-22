import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/get-session';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...formData } = body;

    // Generate formatted text content
    const textContent = generateFormContent(formData, '0-8');

    if (action === 'email') {
      // For email, return the content as JSON
      return NextResponse.json({ 
        success: true,
        message: 'Form content generated. Email functionality coming soon.',
        content: textContent,
        email: formData.email,
        instructions: 'Please copy the form content and email it to usteps@utah.gov'
      });
    } else {
      // Return as downloadable text file
      return new NextResponse(textContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="0-8-UPI-Access-Form-${formData.lastName || 'form'}.txt"`,
        },
      });
    }
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { error: 'Failed to process form' },
      { status: 500 }
    );
  }
}

function generateFormContent(formData: any, formType: string): string {
  return `
================================================================================
FORM ${formType}: UPI ACCESS FORM
================================================================================

PERSONAL INFORMATION
--------------------------------------------------------------------------------
First Name:        ${formData.firstName}
Last Name:         ${formData.lastName}
Email Address:     ${formData.email}
Phone Number:      ${formData.phone}
Title/Position:    ${formData.title}

ORGANIZATION INFORMATION
--------------------------------------------------------------------------------
Organization Name: ${formData.organizationName}
Address:           ${formData.organizationAddress}
City:              ${formData.organizationCity}
State:             ${formData.organizationState}
ZIP Code:          ${formData.organizationZip}

UPI ACCESS INFORMATION
--------------------------------------------------------------------------------
Requested Access Level: ${formData.requestedAccessLevel}

Reason for Access:
${formData.reasonForAccess}

SUPERVISOR INFORMATION
--------------------------------------------------------------------------------
Supervisor Name:   ${formData.supervisorName}
Supervisor Email:  ${formData.supervisorEmail}
Supervisor Phone:  ${formData.supervisorPhone}

SIGNATURE
--------------------------------------------------------------------------------
Signature (Full Name): ${formData.signature}
Date:                  ${formData.signatureDate}

================================================================================
INSTRUCTIONS:
1. Review all information above
2. Email this completed form to: usteps@utah.gov
3. Use your CREJ email address when sending
================================================================================
`;
}
