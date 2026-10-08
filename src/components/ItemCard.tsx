import React from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import { maskRegNumber, maskStudentName } from '../utils/masking';
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface ItemCardProps {
  item: LostFoundItem;
  onOpenDetails: (item: LostFoundItem) => void;
  onOpenClaim: (item: LostFoundItem) => void;
  onOpenReviews: (item: LostFoundItem) => void;
  onOpenHandoff: (item: LostFoundItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onOpenDetails,
  onOpenClaim,
  onOpenReviews,
  onOpenHandoff,
}) => {
  const { currentUser } = useApp();

  const isReporter = item.reporter.studentId === currentUser.id;
  const myClaim = item.claims.find((c) => c.claimantStudentId === currentUser.id);
  const isApprovedClaimant = myClaim?.status === 'approved';
  const pendingClaimsCount = item.claims.filter((c) => c.status === 'pending').length;
  const hasMessages = item.handoffDetails && item.handoffDetails.messages.length > 0;

  return (
    <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden hover:border-[#1a73e8]/60 transition-all flex flex-col justify-between shadow-[0_1px_2px_0_rgba(60,64,67,0.05)] hover:shadow-md group">
      <div>
        {/* Top bar */}
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between border-b border-[#f1f3f4] bg-[#faf9fd]">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {item.type === 'found' ? (
              <span className="text-[#006e2c] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#34a853]" />
                Found Item
              </span>
            ) : (
              <span className="text-[#b81d17] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ea4335]" />
                Lost Item
              </span>
            )}
            <span className="text-[#dadce0]">·</span>
            <span className="text-[#5f6368] font-medium">{item.category}</span>
          </div>

          {/* Status badge */}
          {item.status === 'resolved' ? (
            <span className="text-[11px] font-bold text-[#006e2c] bg-[#e6f4ea] px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Returned
            </span>
          ) : item.status === 'handoff_coordination' ? (
            <span className="text-[11px] font-bold text-[#006e2c] bg-[#e6f4ea] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <MessageSquare className="w-3 h-3" />
              Handoff Active
            </span>
          ) : pendingClaimsCount > 0 ? (
            <span className="text-[11px] font-bold text-[#ea4335] bg-[#fce8e6] px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {pendingClaimsCount} Claim{pendingClaimsCount > 1 ? 's' : ''} Pending
            </span>
          ) : (
            <span className="text-[11px] font-medium text-[#5f6368] bg-[#f1f3f4] px-2 py-0.5 rounded-full">
              Open
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3
            onClick={() => onOpenDetails(item)}
            className="font-bold text-base text-[#1a1b1e] hover:text-[#1a73e8] cursor-pointer line-clamp-1 leading-snug"
          >
            {item.title}
          </h3>

          {/* Landmark & Time */}
          <div className="space-y-1 text-xs text-[#5f6368]">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1a73e8] shrink-0 mt-0.5" />
              <span className="font-semibold text-[#1a1b1e]">
                {item.venueCode} · <span className="text-[#5f6368] font-normal">{item.specificLocation}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#727785] shrink-0" />
              <span>{item.dateTime}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#3c4043] line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Secret Question Notice */}
          <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-lg p-2.5 text-xs space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#1a73e8]">
              <HelpCircle className="w-3 h-3 shrink-0" />
              <span>Finder's Verification Challenge:</span>
            </div>
            <p className="text-[11px] text-[#414754] italic line-clamp-1">
              "{item.verificationChallenge.question}"
            </p>
          </div>

          {/* Privacy Footnote */}
          <div className="flex items-center justify-between text-[11px] text-[#727785] pt-1 border-t border-[#efedf1]">
            <span className="flex items-center gap-1 text-[#006e2c] font-medium">
              <Lock className="w-3 h-3" />
              <span>
                Posted by {isReporter ? 'You' : maskStudentName(item.reporter.fullName)} (
                {maskRegNumber(item.reporter.regNumber)})
              </span>
            </span>
            <button
              type="button"
              onClick={() => onOpenDetails(item)}
              className="text-[#1a73e8] hover:underline font-semibold flex items-center gap-0.5"
            >
              <Eye className="w-3 h-3" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0">
        <div className="pt-2 border-t border-[#f1f3f4]">
          {item.status === 'resolved' ? (
            <div className="w-full py-2 bg-[#f1f3f4] text-[#5f6368] font-semibold text-xs rounded-lg text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#006e2c]" />
              <span>Resolved & Returned at Security Desk</span>
            </div>
          ) : isReporter ? (
            /* FINDER ACTIONS: DIRECT CHAT ACCESS & REVIEW */
            item.claims.length > 0 ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onOpenHandoff(item)}
                  className="flex-1 py-2 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  title="Open live chat with the claimant who answered"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Chat {hasMessages ? `(${item.handoffDetails?.messages?.length})` : ''}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenReviews(item)}
                  className={`px-3 py-2 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                    pendingClaimsCount > 0
                      ? 'bg-[#ea4335] text-white hover:bg-[#b81d17]'
                      : 'bg-[#f1f3f4] text-[#1a1b1e] hover:bg-[#e3e2e6]'
                  }`}
                  title="Review submitted verification answers"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Review ({item.claims.length})</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenReviews(item)}
                className="w-full py-2 bg-[#f1f3f4] hover:bg-[#e3e2e6] text-[#1a1b1e] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#727785]" />
                <span>Waiting for Claims (0 submitted)</span>
              </button>
            )
          ) : item.status === 'handoff_coordination' && isApprovedClaimant ? (
            <button
              type="button"
              onClick={() => onOpenHandoff(item)}
              className="w-full py-2 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Claim Approved · Open Handoff Chat</span>
            </button>
          ) : myClaim ? (
            /* CLAIMANT ACTIONS */
            <div>
              {myClaim.status === 'pending' && (
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenHandoff(item)}
                    className="w-full py-2 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat with Finder</span>
                  </button>
                  <div className="w-full py-1 text-[11px] text-[#b06000] bg-[#fef7e0] rounded text-center font-medium">
                    Answer Under Finder Review
                  </div>
                </div>
              )}
              {myClaim.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => onOpenHandoff(item)}
                  className="w-full py-2 bg-[#34a853] hover:bg-[#2d8e47] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Claim Approved · Meetup Details</span>
                </button>
              )}
              {myClaim.status === 'rejected' && (
                <div className="w-full py-2 bg-[#ffdad6] text-[#ba1a1a] font-semibold text-xs rounded-lg text-center">
                  Verification Mismatch
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenClaim(item)}
              className="w-full py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Answer Question to Claim</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
