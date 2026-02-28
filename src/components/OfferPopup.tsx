import { useState, useEffect } from 'react';
import { X, Gift, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

export interface Offer {
  id: string;
  userId: string;
  title: string;
  message: string;
  reward: string;
  actionLabel: string;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

interface OfferPopupProps {
  offer: Offer | null;
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
}

export function OfferPopup({ offer, onAccept, onDecline }: OfferPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (offer) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [offer]);

  if (!offer) return null;

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(() => onAccept(offer.id), 300);
    
    if (offer.actionUrl) {
      window.open(offer.actionUrl, '_blank');
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
    setTimeout(() => onDecline(offer.id), 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDecline}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border-2 border-blue-400 shadow-2xl max-w-md w-full pointer-events-auto transition-all duration-300 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header with close button */}
          <div className="relative p-6 pb-0">
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-2">
            <h2 className="text-white text-center mb-3">{offer.title}</h2>
            <p className="text-blue-200 text-center mb-6 leading-relaxed">
              {offer.message}
            </p>

            {/* Reward Badge */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 rounded-xl p-4 mb-6 text-center">
              <p className="text-green-200 text-sm mb-1">Your Reward</p>
              <p className="text-white text-2xl">{offer.reward}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAccept}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-6 shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {offer.actionLabel}
                {offer.actionUrl && <ExternalLink className="w-4 h-4 ml-2" />}
              </Button>
              
              <Button
                onClick={handleDecline}
                variant="outline"
                className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 py-6"
              >
                Maybe Later
              </Button>
            </div>

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
