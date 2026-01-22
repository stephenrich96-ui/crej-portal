'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, CheckCircle2 } from 'lucide-react';

interface PDFFormFillerProps {
  pdfUrl: string;
  formFields: Record<string, string>;
  formName: string;
  onDownload?: (filledPdf: Uint8Array) => void;
  autoFill?: boolean;
}

export function PDFFormFiller({ pdfUrl, formFields, formName, onDownload, autoFill = true }: PDFFormFillerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFields, setPdfFields] = useState<string[]>([]);
  const [autoFilled, setAutoFilled] = useState(false);
  const [filledPdfUrl, setFilledPdfUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Company-specific fields that are always the same
  const companyFields: Record<string, string> = {
    'DSPD Contract Number': 'A05054',
    'Contract Number': 'A05054',
    'CAPS/USTEPS/UPI Provider ID': '111905',
    'Provider ID': '111905',
    'CAPS Provider ID': '111905',
    'USTEPS Provider ID': '111905',
    'UPI Provider ID': '111905',
    'Medicaid PRISM ID': '4391138',
    'PRISM ID': '4391138',
    'Medicaid ID': '4391138',
  };

  // Enhanced field matching function
  const findMatchingField = useCallback((fieldName: string, pdfFieldNames: string[]): string | null => {
    const normalized = fieldName.toLowerCase().trim();
    
    // Exact match
    const exact = pdfFieldNames.find(f => f.toLowerCase() === normalized);
    if (exact) return exact;
    
    // Contains match
    const contains = pdfFieldNames.find(f => {
      const fLower = f.toLowerCase();
      return fLower.includes(normalized) || normalized.includes(fLower);
    });
    if (contains) return contains;
    
    // Partial word match
    const words = normalized.split(/[\s_-]+/);
    const partial = pdfFieldNames.find(f => {
      const fLower = f.toLowerCase();
      return words.some(word => word.length > 2 && fLower.includes(word));
    });
    if (partial) return partial;
    
    return null;
  }, []);

  const autoFillPDFInternal = useCallback(async (pdfDoc: PDFDocument, fields: any[], pdfFieldNames: string[], fieldsToFill: Record<string, string>) => {
    try {
      // Fill company fields FIRST (always the same)
      for (const [key, value] of Object.entries(companyFields)) {
        const matchingField = findMatchingField(key, pdfFieldNames);
        if (matchingField) {
          const field = fields.find(f => f.getName() === matchingField);
          if (field) {
            try {
              const fieldType = field.constructor.name;
              if (fieldType === 'PDFTextField') {
                (field as any).setText(value);
              } else if (fieldType === 'PDFCheckBox') {
                if (value === 'true' || value === 'yes' || value === 'on') {
                  (field as any).check();
                }
              }
            } catch (err) {
              console.warn(`Could not auto-fill company field ${key}:`, err);
            }
          }
        }
      }

      // Fill user-provided fields (from form data)
      for (const [fieldName, value] of Object.entries(fieldsToFill)) {
        if (!value || value.trim() === '') continue;
        
        const matchingField = findMatchingField(fieldName, pdfFieldNames);
        if (matchingField) {
          const field = fields.find(f => f.getName() === matchingField);
          if (field) {
            try {
              const fieldType = field.constructor.name;
              
              if (fieldType === 'PDFTextField') {
                (field as any).setText(value);
              } else if (fieldType === 'PDFCheckBox') {
                if (value === 'true' || value === 'yes' || value === 'on') {
                  (field as any).check();
                }
              } else if (fieldType === 'PDFDropdown') {
                try {
                  (field as any).select(value);
                } catch {
                  const options = (field as any).getOptions();
                  const matchingOption = options.find((opt: string) => 
                    opt.toLowerCase().includes(value.toLowerCase()) || 
                    value.toLowerCase().includes(opt.toLowerCase())
                  );
                  if (matchingOption) {
                    (field as any).select(matchingOption);
                  }
                }
              }
            } catch (fieldError) {
              console.warn(`Could not fill user field "${fieldName}":`, fieldError);
            }
          }
        }
      }

      // Save the auto-filled PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      // Revoke old URL if exists
      if (filledPdfUrl) {
        window.URL.revokeObjectURL(filledPdfUrl);
      }
      
      const url = window.URL.createObjectURL(blob);
      
      // Store the URL and update iframe
      setFilledPdfUrl(url);
      setAutoFilled(true);
      
      // Update iframe to show filled PDF IMMEDIATELY
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
    } catch (err) {
      console.warn('Auto-fill failed:', err);
      setError('Failed to auto-fill PDF. Please try again.');
    }
  }, [companyFields, findMatchingField, filledPdfUrl]);

  // Load PDF and IMMEDIATELY auto-fill on mount
  useEffect(() => {
    if (!autoFill || !pdfUrl) return;

    const loadAndAutoFill = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          setError('PDF form not found. Please contact your administrator to upload the official DSPD form PDF.');
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        
        const fieldNames = fields.map(f => f.getName());
        setPdfFields(fieldNames);
        
        // IMMEDIATELY auto-fill with ALL available data (company + user fields)
        // This ensures the PDF is pre-filled when it first loads
        await autoFillPDFInternal(pdfDoc, fields, fieldNames, formFields);
      } catch (err) {
        console.warn('Could not load PDF fields:', err);
        setError('Failed to load PDF form. Please try again.');
      }
    };

    loadAndAutoFill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl, autoFill]); // Only depend on pdfUrl and autoFill, not autoFillPDFInternal

  // Re-auto-fill when formFields change (debounced)
  useEffect(() => {
    if (!autoFill || !pdfUrl || pdfFields.length === 0) return;

    const refillPDF = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) return;

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        const fieldNames = fields.map(f => f.getName());
        
        await autoFillPDFInternal(pdfDoc, fields, fieldNames, formFields);
      } catch (err) {
        console.warn('Could not re-fill PDF:', err);
      }
    };

    // Debounce to avoid too many re-fills
    const timeoutId = setTimeout(refillPDF, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFields, pdfUrl, autoFill, pdfFields.length]); // Exclude autoFillPDFInternal from deps

  const fillAndDownloadPDF = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the PDF
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('PDF form not found. Please contact your administrator to upload the official DSPD form PDF.');
        }
        throw new Error('Failed to fetch PDF');
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get the form
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      const pdfFieldNames = fields.map(f => f.getName());

      // Fill company fields first
      for (const [key, value] of Object.entries(companyFields)) {
        const matchingField = findMatchingField(key, pdfFieldNames);
        if (matchingField) {
          const field = fields.find(f => f.getName() === matchingField);
          if (field) {
            try {
              const fieldType = field.constructor.name;
              if (fieldType === 'PDFTextField') {
                (field as any).setText(value);
              }
            } catch (err) {
              console.warn(`Could not fill ${key}:`, err);
            }
          }
        }
      }

      // Fill in the user form fields
      for (const [fieldName, value] of Object.entries(formFields)) {
        if (!value) continue;
        
        const matchingField = findMatchingField(fieldName, pdfFieldNames);
        if (matchingField) {
          const field = fields.find(f => f.getName() === matchingField);
          if (field) {
            try {
              const fieldType = field.constructor.name;
              
              if (fieldType === 'PDFTextField') {
                (field as any).setText(value);
              } else if (fieldType === 'PDFCheckBox') {
                if (value === 'true' || value === 'yes' || value === 'on') {
                  (field as any).check();
                }
              } else if (fieldType === 'PDFDropdown') {
                try {
                  (field as any).select(value);
                } catch {
                  // If exact match fails, try to find a matching option
                  const options = (field as any).getOptions();
                  const matchingOption = options.find((opt: string) => 
                    opt.toLowerCase().includes(value.toLowerCase()) || 
                    value.toLowerCase().includes(opt.toLowerCase())
                  );
                  if (matchingOption) {
                    (field as any).select(matchingOption);
                  }
                }
              }
            } catch (fieldError) {
              console.warn(`Could not fill field ${fieldName}:`, fieldError);
            }
          }
        }
      }

      // Flatten the form (make it non-editable)
      form.flatten();

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      if (onDownload) {
        onDownload(pdfBytes);
      } else {
        // Download the PDF
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formName}-filled-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error('Error filling PDF:', err);
      setError(err.message || 'Failed to fill PDF form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
        {pdfUrl && (
          <iframe
            ref={iframeRef}
            src={filledPdfUrl || pdfUrl}
            className="w-full h-[600px]"
            title={`${formName} PDF`}
            onError={() => setError('PDF form not found. Please contact your administrator to upload the official DSPD form PDF.')}
          />
        )}
        {!pdfUrl && (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">PDF form will be displayed here once uploaded</p>
              <p className="text-sm text-gray-500 mt-2">Contact your administrator to upload the official DSPD form PDF</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={fillAndDownloadPDF}
          disabled={loading}
          className="bg-crej-primary hover:bg-crej-dark text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Fill & Download PDF
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => window.open(pdfUrl, '_blank')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>

      {autoFilled && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Form has been auto-filled with your information and company details.</span>
        </div>
      )}

      <p className="text-sm text-gray-600">
        {autoFilled 
          ? 'Review the filled form above, then click "Fill & Download PDF" to download the completed PDF.'
          : 'Fill in the form fields above, then click "Fill & Download PDF" to generate a completed PDF. The form will auto-fill when you enter your information.'}
      </p>
    </div>
  );
}
