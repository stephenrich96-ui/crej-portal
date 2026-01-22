'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Form08Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    
    // Organization Information
    organizationName: 'CREJ, LLC',
    organizationAddress: '',
    organizationCity: '',
    organizationState: 'UT',
    organizationZip: '',
    
    // UPI Access Information
    requestedAccessLevel: '',
    reasonForAccess: '',
    supervisorName: '',
    supervisorEmail: '',
    supervisorPhone: '',
    
    // Signature
    signature: '',
    signatureDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Fetch user session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          // Pre-fill email if available
          if (data.user.email && !formData.email) {
            setFormData(prev => ({ ...prev, email: data.user.email }));
          }
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, action: 'download' | 'email') => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/forms/0-8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, action }),
      });

      if (response.ok) {
        if (action === 'download') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `0-8-UPI-Access-Form-${formData.lastName || 'form'}-${Date.now()}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          alert('Form downloaded! Please email it to usteps@utah.gov using your CREJ email.');
        } else {
          const data = await response.json();
          if (data.success) {
            // Copy content to clipboard and show instructions
            await navigator.clipboard.writeText(data.content);
            alert(`Form content copied to clipboard!\n\n${data.instructions}\n\nEmail: usteps@utah.gov`);
          } else {
            alert('Form has been sent to your email! Please check your inbox and forward it to usteps@utah.gov');
          }
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to process form'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <Link href="/forms" className="inline-flex items-center text-crej-primary hover:text-crej-dark mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Link>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-black">
              Form 0-8: UPI ACCESS Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 pb-2 border-b">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">First Name *</label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Last Name *</label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Email Address *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Phone Number *</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Title/Position *</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Support Coordinator"
                      required
                      className="text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 pb-2 border-b">Organization Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Organization Name *</label>
                    <Input
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">Organization Address *</label>
                    <Input
                      name="organizationAddress"
                      value={formData.organizationAddress}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">City *</label>
                    <Input
                      name="organizationCity"
                      value={formData.organizationCity}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">State *</label>
                    <Input
                      name="organizationState"
                      value={formData.organizationState}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">ZIP Code *</label>
                    <Input
                      name="organizationZip"
                      value={formData.organizationZip}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                </div>
              </div>

              {/* UPI Access Information */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 pb-2 border-b">UPI Access Information</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Requested Access Level *</label>
                    <select
                      name="requestedAccessLevel"
                      value={formData.requestedAccessLevel}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
                    >
                      <option value="">Select access level</option>
                      <option value="Support Coordinator">Support Coordinator</option>
                      <option value="Manager">Manager</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Reason for Access *</label>
                    <textarea
                      name="reasonForAccess"
                      value={formData.reasonForAccess}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white"
                      placeholder="Describe why you need UPI access..."
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Supervisor Name *</label>
                      <Input
                        name="supervisorName"
                        value={formData.supervisorName}
                        onChange={handleChange}
                        required
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Supervisor Email *</label>
                      <Input
                        type="email"
                        name="supervisorEmail"
                        value={formData.supervisorEmail}
                        onChange={handleChange}
                        required
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Supervisor Phone *</label>
                      <Input
                        type="tel"
                        name="supervisorPhone"
                        value={formData.supervisorPhone}
                        onChange={handleChange}
                        required
                        className="text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-4 pb-2 border-b">Signature</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Signature (Type Full Name) *</label>
                    <Input
                      name="signature"
                      value={formData.signature}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Date *</label>
                    <Input
                      type="date"
                      name="signatureDate"
                      value={formData.signatureDate}
                      onChange={handleChange}
                      required
                      className="text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'download')}
                  disabled={loading}
                  className="flex-1 bg-crej-primary hover:bg-crej-dark text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download Form
                </Button>
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'email')}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  Copy to Clipboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
