import { useState, useEffect } from 'react';
import { X, Gift, ExternalLink, CheckCircle, Send, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export interface OfferEnhanced {
  id: string;
  userId: string;
  title: string;
  message: string;
  reward: string;
  actionLabel: string;
  platform: 'facebook' | 'instagram' | 'youtube';
  createdAt: string;
  expiresAt?: string;
  status: 'pending' | 'accepted' | 'declined' | 'submitted' | 'approved' | 'rejected';
  submittedLink?: string;
}

interface OfferPopupEnhancedProps {
  offer: OfferEnhanced | null;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onSubmitLink: (offerId: string, link: string) => void;
}

export function OfferPopupEnhanced({ offer, onAccept, onDecline, onSubmitLink }: OfferPopupEnhancedProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkInput, setLinkInput] = useState('');

  useEffect(() => {
    if (offer) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [offer]);

  if (!offer) return null;

  const handleAccept = () => {
    if (offer.status === 'accepted' && !offer.submittedLink) {
      setShowLinkForm(true);
    } else {
      setIsVisible(false);
      setTimeout(() => onAccept(offer.id), 300);
    }
  };

  const handleSubmitLink = () => {
    if (linkInput.trim()) {
      onSubmitLink(offer.id, linkInput);
      setIsVisible(false);
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
    setTimeout(() => onDecline(offer.id), 300);
  };

  const getPlatformColor = () => {
    switch (offer.platform) {
      case 'facebook':
        return 'from-blue-600 to-blue-500';
      case 'instagram':
        return 'from-pink-600 to-purple-600';
      case 'youtube':
        return 'from-red-600 to-red-500';
    }
  };

  const getPlatformName = () => {
    return offer.platform.charAt(0).toUpperCase() + offer.platform.slice(1);
  };

  if (offer.status === 'submitted') {
    return (
      <>
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`} onClick={handleDecline} />

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div className={`bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border-2 border-yellow-400 shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="relative p-6">
              <button
                onClick={handleDecline}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-white text-center mb-3">Awaiting Review</h2>
              <p className="text-blue-200 text-center mb-6 leading-relaxed">
                Your link has been submitted and is pending admin review. We'll notify you once it's been verified!
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-blue-200 text-sm mb-1">Submitted Link:</p>
                <p className="text-white text-sm break-all">{offer.submittedLink}</p>
              </div>

              <Button
                onClick={handleDecline}
                className="w-full bg-white/10 hover:bg-white/20 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`} onClick={handleDecline} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className={`bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border-2 border-blue-400 shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}>
          <div className="relative p-6 pb-0">
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getPlatformColor()} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="p-6 pt-2">
            <h2 className="text-white text-center mb-3">{offer.title}</h2>
            <p className="text-blue-200 text-center mb-4 leading-relaxed">
              {offer.message}
            </p>

            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-200 text-sm mb-1">Your Reward</p>
              <p className="text-white text-2xl">{offer.reward}</p>
              <p className="text-green-300 text-xs mt-1">After verification</p>
            </div>

            {!showLinkForm ? (
              <div className="flex flex-col gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-blue-200 text-sm">Share on</p>
                  <p className="text-white">{getPlatformName()}</p>
                </div>

                <Button
                  onClick={handleAccept}
                  className={`w-full bg-gradient-to-r ${getPlatformColor()} hover:opacity-90 text-white py-6 shadow-lg`}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {offer.actionLabel}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                
                <Button
                  onClick={handleDecline}
                  variant="outline"
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 py-6"
                >
                  Maybe Later
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/30">
                  <p className="text-blue-200 text-sm text-center">
                    📝 After sharing, paste the link to your {getPlatformName()} post/video below
                  </p>
                </div>

                <div>
                  <Input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder={`Paste your ${getPlatformName()} link here...`}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <Button
                  onClick={handleSubmitLink}
                  disabled={!linkInput.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>

                <Button
                  onClick={() => setShowLinkForm(false)}
                  variant="outline"
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              </div>
            )}

            {offer.expiresAt && (
              <p className="text-blue-300 text-xs text-center mt-4">
                Offer expires: {new Date(offer.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
