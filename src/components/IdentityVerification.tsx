import { useState } from 'react';
import { TrendingUp, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface IdentityVerificationProps {
  email: string;
  onVerified: () => void;
}

type DocumentType = 'passport' | 'id' | null;

export function IdentityVerification({ email, onVerified }: IdentityVerificationProps) {
  const [documentType, setDocumentType] = useState<DocumentType>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setError('');
      if (side === 'front') {
        setFrontFile(file);
      } else {
        setBackFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (!frontFile) {
      setError('Please upload the front side of your document');
      return;
    }

    if (documentType === 'id' && !backFile) {
      setError('Please upload the back side of your ID');
      return;
    }

    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleContinue = () => {
    onVerified();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-white mb-4">Documents Submitted!</h2>
            <p className="text-blue-200 mb-6">
              Thank you for submitting your identity documents. Our customer service team will review your documents within 24-48 hours.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-yellow-200 text-sm mb-1">Pending Verification</p>
                  <p className="text-yellow-100 text-xs">
                    You can access your dashboard, but some features (deposits, withdrawals) will be limited until your identity is verified.
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6"
            >
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xl">InvestPro</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-white mb-2">Verify Your Identity</h2>
            <p className="text-blue-200">
              To comply with regulations and ensure platform security, please upload your identity documents
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <Label className="text-blue-200 mb-4 block">Select Document Type</Label>
              <RadioGroup value={documentType || ''} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    documentType === 'passport' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}>
                    <RadioGroupItem value="passport" id="passport" className="text-blue-500" />
                    <div className="flex-1">
                      <p className="text-white">Passport</p>
                      <p className="text-blue-300 text-xs">International passport</p>
                    </div>
                  </label>

                  <label className={`relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    documentType === 'id' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}>
                    <RadioGroupItem value="id" id="id" className="text-blue-500" />
                    <div className="flex-1">
                      <p className="text-white">National ID</p>
                      <p className="text-blue-300 text-xs">Government-issued ID card</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* File Upload Areas */}
            {documentType && (
              <div className="space-y-4">
                {/* Front Side */}
                <div>
                  <Label className="text-blue-200 mb-2 block">
                    {documentType === 'passport' ? 'Passport Photo Page' : 'Front Side of ID'}
                  </Label>
                  <div className="relative">
                    <input
                      type="file"
                      id="front-upload"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={(e) => handleFileChange(e, 'front')}
                      className="hidden"
                    />
                    <label
                      htmlFor="front-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      {frontFile ? (
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-green-400 mx-auto mb-2" />
                          <p className="text-white text-sm">{frontFile.name}</p>
                          <p className="text-blue-300 text-xs mt-1">
                            {(frontFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                          <p className="text-white text-sm">Click to upload</p>
                          <p className="text-blue-300 text-xs mt-1">JPG, PNG or PDF (Max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {documentType === 'id' && (
                  <div>
                    <Label className="text-blue-200 mb-2 block">Back Side of ID</Label>
                    <div className="relative">
                      <input
                        type="file"
                        id="back-upload"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) => handleFileChange(e, 'back')}
                        className="hidden"
                      />
                      <label
                        htmlFor="back-upload"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {backFile ? (
                          <div className="text-center">
                            <FileText className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <p className="text-white text-sm">{backFile.name}</p>
                            <p className="text-blue-300 text-xs mt-1">
                              {(backFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                            <p className="text-white text-sm">Click to upload</p>
                            <p className="text-blue-300 text-xs mt-1">JPG, PNG or PDF (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm mb-2">Important Guidelines:</p>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• Ensure the document is valid and not expired</li>
                <li>• All details must be clearly visible</li>
                <li>• Photo should be in color and well-lit</li>
                <li>• No screenshots or photocopies</li>
                <li>• File size should not exceed 5MB</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !documentType || !frontFile || (documentType === 'id' && !backFile)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 py-6"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading Documents...
                </span>
              ) : (
                'Submit for Verification'
              )}
            </Button>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-blue-200 text-sm text-center">
            🔒 Your documents are encrypted and securely stored. We respect your privacy and will only use these documents for verification purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
