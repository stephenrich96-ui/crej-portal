# DSPD Forms Directory

This directory should contain the official DSPD PDF forms:

- `0-2-USTEPS-Access-Form.pdf` - DHHS Private Support Coordinator USTEPS Access Form
- `0-8-UPI-Access-Form.pdf` - UPI ACCESS Form

## Instructions

1. Download the official DSPD forms from the DSPD website or your supervisor
2. Place them in this directory with the exact filenames above
3. The forms must be fillable PDFs (with form fields, not just static PDFs)
4. The form field names in the PDF should match (or be similar to) the field names used in the form pages

## Field Name Mapping

The application will try to match form data to PDF fields using these common field names:
- First Name / FirstName / firstName
- Last Name / LastName / lastName
- Email / EmailAddress / email
- Phone / PhoneNumber / phone
- Title / Position / title
- Organization Name / Organization / organizationName
- Address / Organization Address / organizationAddress
- City / organizationCity
- State / organizationState
- ZIP Code / ZIP / ZipCode / organizationZip
- Requested Access Level / Access Level / requestedAccessLevel
- Reason for Access / Reason / reasonForAccess
- Supervisor Name / Supervisor / supervisorName
- Supervisor Email / supervisorEmail
- Supervisor Phone / supervisorPhone
- Signature / signature
- Date / Signature Date / signatureDate

If the PDF field names don't match exactly, you may need to adjust the field mapping in the form pages.
