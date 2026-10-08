import React from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import { maskRegNumber, maskStudentName, maskEmail, maskPhone } from '../utils/masking';
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: LostFoundItem;
  onClose: () => void;
  onOpenClaim: (item: LostFoundItem) => void;
  onOpenReviews: (item: LostFoundItem) => void;
  onOpenHandoff: (item: LostFoundItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onOpenClaim,
  onOpenReviews,
  onOpenHandoff,
}) => {
  const { currentUser } = useApp();

  const isReporter = item.reporter.studentId === currentUser.id;
  const myClaim = item.claims.find((c) => c.claimantStudentId === currentUser.id);
  const isApprovedClaimant = myClaim?.status === 'approved';
  const isResolved = item.status === 'resolved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#dadce0] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                item.type === 'found'
                  ? 'bg-[#e6f4ea] text-[#006e2c]'
                  : 'bg-[#fce8e6] text-[#b81d17]'
              }`}
            >
              {item.type === 'found' ? 'Found Item' : 'Lost Declaration'}
            </span>
            <span className="text-xs text-[#5f6368]">·</span>
            <span className="text-xs text-[#5f6368] font-medium">{item.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-bold text-[#1a1b1e] leading-snug">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#5f6368] mt-2">
              <span className="flex items-center gap-1 font-semibold text-[#1a1b1e]">
                <Building2 className="w-4 h-4 text-[#1a73e8]" />
                {item.venueZone} ({item.venueCode})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1a73e8]" />
                {item.specificLocation}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#727785]" />
                {item.dateTime}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#5f6368] uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-xs text-[#1a1b1e] leading-relaxed whitespace-pre-line bg-[#faf9fd] p-3 rounded-lg border border-[#dadce0]">
              {item.description}
            </p>
          </div>

          {/* Verification Challenge Card */}
          <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a73e8] uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Finder's Verification Challenge</span>
            </div>
            <p className="text-xs font-bold text-[#1a1b1e] leading-relaxed">
              "{item.verificationChallenge.question}"
            </p>
            {item.verificationChallenge.hint && (
              <p className="text-xs text-[#5f6368] italic">
                Hint: {item.verificationChallenge.hint}
              </p>
            )}
            <p className="text-[11px] text-[#5f6368] pt-1 border-t border-[#efedf1]">
              To claim this item, you must answer this question. The finder evaluates answers privately.
            </p>
          </div>

          {/* Privacy Footprint */}
          <div className="p-3.5 bg-[#e8f0fe]/60 border border-[#c1c6d6] rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a73e8]">
              <Lock className="w-3.5 h-3.5 text-[#34a853]" />
              <span>Campus Privacy Shield</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#3c4043]">
              <div>
                <span className="text-[#5f6368] block text-[11px]">Reporter Name:</span>
                <span className="font-semibold text-[#1a1b1e]">
                  {isReporter ? item.reporter.fullName : maskStudentName(item.reporter.fullName)}
                </span>
              </div>
              <div>
                <span className="text-[#5f6368] block text-[11px]">Registration No:</span>
                <span className="font-mono font-medium">
                  {isReporter ? item.reporter.regNumber : maskRegNumber(item.reporter.regNumber)}
                </span>
              </div>
              <div>
                <span className="text-[#5f6368] block text-[11px]">Campus Email:</span>
                <span className="font-mono text-[#5f6368]">
                  {isReporter ? item.reporter.email : maskEmail(item.reporter.email)}
                </span>
              </div>
              <div>
                <span className="text-[#5f6368] block text-[11px]">Phone:</span>
                <span className="font-mono text-[#5f6368]">
                  {isReporter ? item.reporter.phone : maskPhone(item.reporter.phone)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#414754] hover:bg-[#efedf1] rounded-lg cursor-pointer"
          >
            Close
          </button>

          {isResolved ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#006e2c] bg-[#e6f4ea] px-3.5 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolved & Returned at Security Desk</span>
            </div>
          ) : isReporter ? (
            <div className="flex items-center gap-2">
              {item.claims.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHandoff(item);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#006e2c] hover:bg-[#005320] rounded-lg shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Live Chat</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReviews(item);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Review Claims ({item.claims.length})</span>
              </button>
            </div>
          ) : myClaim ? (
            <div className="flex items-center gap-2">
              {myClaim.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHandoff(item);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#006e2c] hover:bg-[#005320] rounded-lg shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open Chat with Finder</span>
                </button>
              )}
              {myClaim.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHandoff(item);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#34a853] hover:bg-[#2d8e47] rounded-lg shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Meetup & Chat</span>
                </button>
              )}
              {myClaim.status === 'rejected' && (
                <span className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg inline-block">
                  Verification Mismatch
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenClaim(item);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg shadow-sm cursor-pointer"
            >
              <span>Answer Question to Claim</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
