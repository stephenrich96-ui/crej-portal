# 📄 HOW TO UPLOAD OFFICIAL DSPD FORMS

## Quick Steps:

1. **Get the official PDF forms from DSPD**
   - Form 0-2: USTEPS Access Form
   - Form 0-8: UPI Access Form

2. **Navigate to the project folder:**
   ```bash
   cd /Users/stephenrichardson/crej-portal
   ```

3. **Copy the PDF files to the public/forms directory:**
   ```bash
   # Copy your PDF files here:
   cp /path/to/your/0-2-USTEPS-Access-Form.pdf public/forms/
   cp /path/to/your/0-8-UPI-Access-Form.pdf public/forms/
   ```

4. **OR use Finder:**
   - Open Finder
   - Navigate to: `/Users/stephenrichardson/crej-portal/public/forms/`
   - Drag and drop your PDF files there
   - Make sure they're named EXACTLY:
     - `0-2-USTEPS-Access-Form.pdf`
     - `0-8-UPI-Access-Form.pdf`

5. **Restart the dev server** (if running):
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

## File Locations:

- **PDF Forms go here:** `/Users/stephenrichardson/crej-portal/public/forms/`
- **Logo goes here:** `/Users/stephenrichardson/crej-portal/public/logo.png`

## Important Notes:

- The PDFs MUST be fillable forms (with form fields, not just static PDFs)
- File names must match EXACTLY (case-sensitive)
- After uploading, refresh your browser

## Troubleshooting:

If you still see 404 errors:
1. Check the file names match exactly
2. Make sure files are in `public/forms/` not `public/forms/forms/`
3. Restart the Next.js dev server
4. Clear your browser cache
