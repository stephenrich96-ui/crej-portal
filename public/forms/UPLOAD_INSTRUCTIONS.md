# 📤 UPLOAD DSPD FORMS HERE

## ⚠️ READ THIS FIRST

This folder needs the **OFFICIAL DSPD PDF FORMS**. The app cannot generate these - you must upload them.

## Required Files:

1. **`0-2-USTEPS-Access-Form.pdf`** - DHHS Private Support Coordinator USTEPS Access Form
2. **`0-8-UPI-Access-Form.pdf`** - UPI ACCESS Form

## How to Upload:

### Option 1: Using Finder (Mac)
1. Open Finder
2. Press `Cmd + Shift + G` (Go to Folder)
3. Type: `/Users/stephenrichardson/crej-portal/public/forms`
4. Drag your PDF files here
5. Make sure file names match EXACTLY (case-sensitive!)

### Option 2: Using Terminal
```bash
# Navigate to project
cd /Users/stephenrichardson/crej-portal

# Copy your PDFs here (replace /path/to/your/file.pdf with actual path)
cp /path/to/your/0-2-USTEPS-Access-Form.pdf public/forms/
cp /path/to/your/0-8-UPI-Access-Form.pdf public/forms/
```

### Option 3: Using VS Code / Cursor
1. Open the project in your editor
2. Navigate to `public/forms/` folder
3. Right-click → "Reveal in Finder" or drag files directly

## After Uploading:

1. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C) then:
   npm run dev
   ```

2. **Refresh your browser** (hard refresh: Cmd+Shift+R)

3. **Check the forms page** - the PDFs should now load!

## File Requirements:

- ✅ Must be fillable PDFs (with form fields)
- ✅ File names must match EXACTLY:
  - `0-2-USTEPS-Access-Form.pdf` (not `0-2-usteps-access-form.pdf`)
  - `0-8-UPI-Access-Form.pdf` (not `0-8-upi-access-form.pdf`)
- ✅ Files must be in this exact folder: `public/forms/`

## Still Not Working?

1. Check file names are EXACT (case-sensitive)
2. Make sure files are PDFs, not Word docs or images
3. Verify files are in `public/forms/` not a subfolder
4. Restart the Next.js server
5. Clear browser cache
