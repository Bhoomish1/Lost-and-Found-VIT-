import React, { useState } from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import { maskRegNumber } from '../utils/masking';
import {
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Building2,
  HelpCircle,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface MyActivityViewProps {
  onOpenDetails: (item: LostFoundItem) => void;
  onOpenReviews: (item: LostFoundItem) => void;
  onOpenHandoff: (item: LostFoundItem) => void;
}

export const MyActivityView: React.FC<MyActivityViewProps> = ({
  onOpenDetails,
  onOpenReviews,
  onOpenHandoff,
}) => {
  const { currentUser, items } = useApp();
  const [subFilter, setSubFilter] = useState<'all' | 'chats' | 'found' | 'lost' | 'claims' | 'resolved'>('all');

  // Items related to current user
  const myReportedItems = items.filter(
    (i) => i.reporter.studentId === currentUser.id && i.status !== 'resolved'
  );
  const myFoundItems = myReportedItems.filter((i) => i.type === 'found');
  const myLostItems = myReportedItems.filter((i) => i.type === 'lost');

  const myClaimedItems = items.filter(
    (i) =>
      i.claims.some((c) => c.claimantStudentId === currentUser.id) &&
      i.status !== 'resolved'
  );

  const myResolvedItems = items.filter((i) => {
    if (i.status !== 'resolved') return false;
    const isReporter = i.reporter.studentId === currentUser.id;
    const isClaimant = i.claims.some((c) => c.claimantStudentId === currentUser.id);
    return isReporter || isClaimant;
  });

  // Items with active handoff chats or submitted claims where current user is finder or claimant
  const myActiveChatItems = items.filter((i) => {
    if (i.status === 'resolved') return false;
    const isReporter = i.reporter.studentId === currentUser.id;
    const isClaimant = i.claims.some(
      (c) => c.claimantStudentId === currentUser.id
    );
    if (!isReporter && !isClaimant) return false;

    const hasMessages = i.handoffDetails && i.handoffDetails.messages.length > 0;
    const hasClaims = i.claims && i.claims.length > 0;
    return hasMessages || hasClaims || i.status === 'handoff_coordination';
  });

  // Total unique active items for the user
  const allMyActiveItems = items.filter((i) => {
    if (i.status === 'resolved') return false;
    const isReporter = i.reporter.studentId === currentUser.id;
    const isClaimant = i.claims.some((c) => c.claimantStudentId === currentUser.id);
    return isReporter || isClaimant;
  });

  // Filter items based on active subFilter
  const displayedItems = (() => {
    switch (subFilter) {
      case 'chats':
        return myActiveChatItems;
      case 'found':
        return myFoundItems;
      case 'lost':
        return myLostItems;
      case 'claims':
        return myClaimedItems;
      case 'resolved':
        return myResolvedItems;
      case 'all':
      default:
        return allMyActiveItems;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs for My Activity */}
      <div className="flex items-center gap-1.5 p-1 bg-[#f1f3f4] rounded-xl overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setSubFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subFilter === 'all'
              ? 'bg-white text-[#1a1b1e] shadow-xs'
              : 'text-[#414754] hover:text-[#1a1b1e]'
          }`}
        >
          All Active Activity ({allMyActiveItems.length})
        </button>

        <button
          type="button"
          onClick={() => setSubFilter('chats')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subFilter === 'chats'
              ? 'bg-white text-[#006e2c] shadow-xs'
              : 'text-[#414754] hover:text-[#1a1b1e]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#006e2c]" />
          <span>Active Chats & Conversations ({myActiveChatItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubFilter('found')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subFilter === 'found'
              ? 'bg-white text-[#006e2c] shadow-xs'
              : 'text-[#414754] hover:text-[#1a1b1e]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#34a853]" />
          <span>Things I Found ({myFoundItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubFilter('lost')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subFilter === 'lost'
              ? 'bg-white text-[#b81d17] shadow-xs'
              : 'text-[#414754] hover:text-[#1a1b1e]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#ea4335]" />
          <span>Things I Lost ({myLostItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubFilter('claims')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subFilter === 'claims'
              ? 'bg-white text-[#1a73e8] shadow-xs'
              : 'text-[#414754] hover:text-[#1a1b1e]'
          }`}
        >
          <span>My Claim Answers ({myClaimedItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubFilter('resolved')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            subFilter === 'resolved'
              ? 'bg-white text-[#006e2c] shadow-xs'
              : 'text-[#414754] hover:text-[#1a1b1e]'
          }`}
        >
          <span>Returned & Resolved ({myResolvedItems.length})</span>
        </button>
      </div>

      {/* HIGHLIGHTED SECTION: ACTIVE CHATS & PEOPLE YOU SPOKE TO */}
      {myActiveChatItems.length > 0 && (subFilter === 'all' || subFilter === 'chats') && (
        <div className="bg-[#f0f9f3] border border-[#a3e6b4] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#34a853] text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#004e1e]">
                  Active Conversations & Handoff Chats
                </h3>
                <p className="text-xs text-[#006e2c]">
                  Direct messaging with verified students to return items at security desks
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#006e2c] bg-white px-2.5 py-1 rounded-full border border-[#a3e6b4]">
              {myActiveChatItems.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {myActiveChatItems.map((item) => {
              const isFinder = item.reporter.studentId === currentUser.id;
              const approvedClaim = item.claims.find((c) => c.status === 'approved');
              const handoff = item.handoffDetails;

              // Identify the person spoken with
              const targetClaim = approvedClaim || item.claims[0];
              const partnerName = isFinder
                ? targetClaim?.claimantNameMasked || 'Verified Claimant'
                : item.reporter.fullName.split(' ')[0] + ' (Finder)';
              const partnerReg = isFinder
                ? targetClaim?.claimantRegMasked || 'VITian'
                : maskRegNumber(item.reporter.regNumber);

              // Recent message snippet
              const messages = handoff?.messages || [];
              const lastUserMessage = [...messages]
                .reverse()
                .find((m) => m.senderRole !== 'system') || messages[messages.length - 1];

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#a3e6b4] rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-[#34a853] transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#006e2c] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                        <span>{isFinder ? 'You Found This' : 'You Claimed This'}</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#5f6368]">{item.venueCode}</span>
                    </div>

                    {/* Item Title */}
                    <h4 className="text-sm font-bold text-[#1a1b1e] line-clamp-1">{item.title}</h4>

                    {/* Person you are speaking to */}
                    <div className="bg-[#faf9fd] border border-[#efedf1] rounded-lg p-2.5 text-xs space-y-1">
                      <div className="text-[11px] text-[#5f6368] font-semibold">
                        CHAT WITH {isFinder ? 'CLAIMANT' : 'FINDER'}:
                      </div>
                      <div className="font-bold text-[#1a1b1e] flex items-center gap-1.5">
                        <span>{partnerName}</span>
                        <span className="font-mono text-[11px] text-[#5f6368]">({partnerReg})</span>
                      </div>
                    </div>

                    {/* Agreed Meetup Checkpoint */}
                    <div className="flex items-start gap-1.5 text-xs text-[#3c4043]">
                      <MapPin className="w-3.5 h-3.5 text-[#1a73e8] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1a1b1e]">
                          {handoff?.agreedCheckpointName || 'SJT Ground Floor Reception'}
                        </span>
                        <div className="text-[11px] text-[#5f6368]">
                          Target Time: {handoff?.agreedTimeSlot || 'Agreed Time Slot'}
                        </div>
                      </div>
                    </div>

                    {/* Last Message Preview */}
                    {lastUserMessage && (
                      <div className="p-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-lg text-xs space-y-1">
                        <div className="text-[10px] text-[#727785] font-semibold flex items-center justify-between">
                          <span>LAST MESSAGE ({lastUserMessage.senderMaskedName}):</span>
                          <span className="font-mono text-[#414754] flex items-center gap-1 font-medium bg-white px-1.5 py-0.5 rounded border border-[#efedf1]">
                            <Clock className="w-2.5 h-2.5 text-[#5f6368]" />
                            {lastUserMessage.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-[#1a1b1e] italic line-clamp-2">
                          "{lastUserMessage.text}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-[#efedf1] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenHandoff(item)}
                      className="flex-1 py-2 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Live Chat</span>
                    </button>
                    {isFinder && item.claims.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onOpenReviews(item)}
                        className="px-3 py-2 bg-[#ea4335] hover:bg-[#b81d17] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Review ({item.claims.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="px-3 py-2 bg-[#f1f3f4] hover:bg-[#e3e2e6] text-[#1a1b1e] font-semibold text-xs rounded-lg cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ITEMS LISTING GRID */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1a1b1e]">
            {subFilter === 'chats'
              ? 'Active Meetup Chats'
              : subFilter === 'found'
              ? 'Items You Reported as Found'
              : subFilter === 'lost'
              ? 'Items You Reported as Lost'
              : subFilter === 'claims'
              ? 'Claims You Submitted for Other Items'
              : subFilter === 'resolved'
              ? 'Items You Successfully Returned & Handed Over'
              : 'All Your Items & Claims'}
          </h3>
          <span className="text-xs text-[#5f6368] font-mono">
            Showing {displayedItems.length} item{displayedItems.length === 1 ? '' : 's'}
          </span>
        </div>

        {displayedItems.length === 0 ? (
          <div className="bg-white border border-[#dadce0] rounded-xl p-10 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-[#727785] mx-auto" />
            <h4 className="text-sm font-bold text-[#1a1b1e]">No items found in this section</h4>
            <p className="text-xs text-[#5f6368] max-w-sm mx-auto">
              {subFilter === 'chats'
                ? 'You do not have any active handoff chats right now. Once an answer is submitted or approved, the chat room appears here.'
                : subFilter === 'lost'
                ? 'You have not reported any lost items.'
                : subFilter === 'found'
                ? 'You have not reported any found items.'
                : subFilter === 'resolved'
                ? 'You do not have any resolved items yet.'
                : 'No active activity matching this filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => {
              const isReporter = item.reporter.studentId === currentUser.id;
              const isFound = item.type === 'found';
              const myClaim = item.claims.find((c) => c.claimantStudentId === currentUser.id);
              const isHandoff = item.status === 'handoff_coordination';
              const isResolved = item.status === 'resolved';
              const pendingClaimsCount = item.claims.filter((c) => c.status === 'pending').length;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#dadce0] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#1a73e8]/50 hover:shadow-xs transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Role & Status Pill */}
                    <div className="flex items-center justify-between text-xs">
                      {isResolved ? (
                        <span className="font-bold text-[#006e2c] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Returned & Resolved</span>
                        </span>
                      ) : isReporter ? (
                        <span
                          className={`font-bold flex items-center gap-1.5 ${
                            isFound ? 'text-[#006e2c]' : 'text-[#b81d17]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isFound ? 'bg-[#34a853]' : 'bg-[#ea4335]'
                            }`}
                          />
                          <span>{isFound ? 'You Found This' : 'You Lost This'}</span>
                        </span>
                      ) : (
                        <span className="font-bold text-[#1a73e8] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1a73e8]" />
                          <span>You Submitted a Claim</span>
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-[#5f6368]">{item.dateTime}</span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => onOpenDetails(item)}
                      className="text-base font-bold text-[#1a1b1e] hover:text-[#1a73e8] cursor-pointer line-clamp-1"
                    >
                      {item.title}
                    </h4>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-[#414754]">
                      <MapPin className="w-3.5 h-3.5 text-[#1a73e8] shrink-0" />
                      <span className="font-semibold text-[#1a1b1e]">{item.venueCode}:</span>
                      <span className="truncate">{item.specificLocation}</span>
                    </div>

                    {/* Description note */}
                    <p className="text-xs text-[#5f6368] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Live chat banner if active */}
                    {isHandoff ? (
                      <div className="bg-[#e6f4ea] border border-[#a3e6b4] rounded-lg p-2.5 text-xs space-y-1">
                        <div className="font-bold text-[#006e2c] flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Active Chat & Meetup</span>
                        </div>
                        <div className="text-[11px] text-[#3c4043]">
                          Meetup: {item.handoffDetails?.agreedCheckpointName || 'Security Desk'}
                        </div>
                      </div>
                    ) : (
                      /* Secret Question Preview */
                      <div className="bg-[#f8f9fa] border border-[#efedf1] rounded-lg p-2.5 text-xs">
                        <div className="text-[11px] font-semibold text-[#1a73e8] flex items-center gap-1 mb-0.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Question:</span>
                        </div>
                        <p className="text-[#3c4043] italic text-xs truncate">
                          "{item.verificationChallenge.question}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button Footer */}
                  <div className="pt-3 mt-3 border-t border-[#efedf1] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#5f6368]">
                      <span>Category: <strong>{item.category}</strong></span>
                      <button
                        type="button"
                        onClick={() => onOpenDetails(item)}
                        className="text-[#1a73e8] hover:underline font-semibold cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>

                    <div>
                      {isResolved ? (
                        <button
                          type="button"
                          onClick={() => onOpenDetails(item)}
                          className="w-full py-2 bg-[#f1f3f4] text-[#5f6368] font-bold text-xs rounded-lg cursor-pointer"
                        >
                          View Resolved Record
                        </button>
                      ) : isHandoff ? (
                        <button
                          type="button"
                          onClick={() => onOpenHandoff(item)}
                          className="w-full py-2 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Handoff Chat</span>
                        </button>
                      ) : isReporter ? (
                        /* Finder dual action */
                        item.claims.length > 0 ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenHandoff(item)}
                              className="flex-1 py-2 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Open Chat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenReviews(item)}
                              className="px-3 py-2 bg-[#ea4335] hover:bg-[#b81d17] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Review ({item.claims.length})</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenReviews(item)}
                            className="w-full py-2 bg-[#f1f3f4] text-[#5f6368] font-semibold text-xs rounded-lg cursor-pointer"
                          >
                            Waiting for Claims (0)
                          </button>
                        )
                      ) : myClaim ? (
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
                              <div className="w-full py-1 bg-[#fef7e0] text-[#b06000] font-bold text-[11px] rounded text-center">
                                Your Claim Answer is Under Review
                              </div>
                            </div>
                          )}
                          {myClaim.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => onOpenHandoff(item)}
                              className="w-full py-2 bg-[#34a853] hover:bg-[#2d8e47] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Claim Approved · Meetup Details</span>
                            </button>
                          )}
                          {myClaim.status === 'rejected' && (
                            <div className="w-full py-2 bg-[#ffdad6] text-[#ba1a1a] font-bold text-xs rounded-lg text-center">
                              Verification Mismatch
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
