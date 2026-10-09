import React, { useState } from 'react';
import { LostFoundItem, ClaimVerification } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Clock,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Send,
  Camera,
} from 'lucide-react';
import { VoiceAudioPlayer } from './VoiceAudioPlayer';

interface ClaimsReviewModalProps {
  item: LostFoundItem;
  onClose: () => void;
  onOpenHandoff: (item: LostFoundItem) => void;
}

export const ClaimsReviewModal: React.FC<ClaimsReviewModalProps> = ({
  item: initialItem,
  onClose,
  onOpenHandoff,
}) => {
  const { items, approveClaim, rejectClaim, sendHandoffMessage, currentUser } = useApp();
  // Always use the latest live item from context
  const item = items.find((i) => i.id === initialItem.id) || initialItem;

  const [activeTab, setActiveTab] = useState<'claims' | 'chat'>('claims');
  const [rejectingClaimId, setRejectingClaimId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Answer does not match item markings');
  const [justApprovedClaim, setJustApprovedClaim] = useState<ClaimVerification | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleApprove = (claimId: string) => {
    const claimToApprove = item.claims.find((c) => c.id === claimId);
    approveClaim(item.id, claimId);
    if (claimToApprove) {
      setJustApprovedClaim({
        ...claimToApprove,
        status: 'approved',
      });
    }
  };

  const handleConfirmReject = (claimId: string) => {
    rejectClaim(item.id, claimId, rejectionReason);
    setRejectingClaimId(null);
  };

  const handleOpenHandoffChat = () => {
    const updated = items.find((i) => i.id === item.id) || item;
    onClose();
    onOpenHandoff(updated);
  };

  const handleSendQuickReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sendHandoffMessage(item.id, replyText.trim());
    setReplyText('');
  };

  const messages = item.handoffDetails?.messages || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#dadce0] w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1b1e]">Review Submitted Claims</h2>
              <p className="text-xs text-[#5f6368]">
                Check if the student's answer matches your item
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Item context banner */}
        <div className="px-6 py-3 bg-[#faf9fd] border-b border-[#dadce0] text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1a1b1e]">{item.title}</span>
            <span className="text-[#5f6368] font-mono">{item.venueCode}</span>
          </div>
          <div className="text-[#1a73e8] flex items-center gap-1.5 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Your secret question: "{item.verificationChallenge.question}"</span>
          </div>
        </div>

        {/* View Switcher: Claims vs Chat */}
        {!justApprovedClaim && (
          <div className="px-6 pt-3 flex items-center gap-2 border-b border-[#efedf1]">
            <button
              type="button"
              onClick={() => setActiveTab('claims')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'claims'
                  ? 'border-[#1a73e8] text-[#1a73e8]'
                  : 'border-transparent text-[#5f6368] hover:text-[#1a1b1e]'
              }`}
            >
              Verification Answers ({item.claims.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-[#006e2c] text-[#006e2c]'
                  : 'border-transparent text-[#5f6368] hover:text-[#1a1b1e]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Room ({messages.length})</span>
            </button>
          </div>
        )}

        {/* IMMEDIATE APPROVAL CONFIRMED SCREEN */}
        {justApprovedClaim ? (
          <div className="p-6 sm:p-8 text-center space-y-4 my-auto overflow-y-auto">
            <div className="w-16 h-16 bg-[#e6f4ea] text-[#006e2c] rounded-full flex items-center justify-center mx-auto shadow-xs ring-8 ring-[#e6f4ea]/60">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1a1b1e]">Approval Confirmed!</h3>
              <p className="text-xs text-[#5f6368] max-w-sm mx-auto">
                Ownership verified for <strong>{justApprovedClaim.claimantNameMasked}</strong> ({justApprovedClaim.claimantRegMasked}).
              </p>
            </div>

            <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3.5 text-xs text-left max-w-md mx-auto space-y-1.5">
              <div className="text-[11px] font-bold text-[#5f6368] uppercase">CONFIRMED ANSWER:</div>
              <p className="text-xs font-semibold text-[#1a1b1e] italic">
                "{justApprovedClaim.challengeAnswer}"
              </p>
              <div className="pt-2 border-t border-[#efedf1] text-[11px] text-[#006e2c] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>The private chat room is now open. Personal phone numbers remain masked.</span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={handleOpenHandoffChat}
                className="w-full py-2.5 px-5 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Safe Handoff Chat Room →</span>
              </button>
              <button
                type="button"
                onClick={() => setJustApprovedClaim(null)}
                className="w-full sm:w-auto py-2.5 px-4 bg-[#f1f3f4] hover:bg-[#e3e2e6] text-[#414754] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                View Claims List
              </button>
            </div>
          </div>
        ) : activeTab === 'chat' ? (
          /* Live Chat Tab inside Review Modal */
          <div className="p-6 flex flex-col flex-1 overflow-hidden space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1a1b1e]">Discussion with Claimant</span>
              <button
                type="button"
                onClick={handleOpenHandoffChat}
                className="text-xs text-[#006e2c] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Meetup Screen</span>
                <span>→</span>
              </button>
            </div>

            <div className="border border-[#dadce0] rounded-xl p-3 bg-white h-60 overflow-y-auto space-y-2.5 flex flex-col">
              {messages.length === 0 ? (
                <div className="text-center my-auto text-xs text-[#727785] py-8">
                  No messages yet. Send a message to ask the claimant for clarification.
                </div>
              ) : (
                messages.map((msg) => {
                  const isSystem = msg.senderRole === 'system';
                  const isMine = msg.senderId === currentUser.id;

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="p-2.5 bg-[#f1f3f4] text-[#414754] text-xs rounded-xl text-center mx-auto max-w-sm my-1 space-y-1 border border-[#e3e2e6]"
                      >
                        <div>{msg.text}</div>
                        <div className="text-[10px] text-[#727785] font-mono flex items-center justify-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#727785]" />
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-[#5f6368] mb-0.5 px-1 font-medium">
                        <span className="font-semibold text-[#1a1b1e]">{msg.senderMaskedName}</span>
                        <span>•</span>
                        <span className="font-mono text-[#414754] flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-[#5f6368]" />
                          {msg.timestamp}
                        </span>
                      </div>
                      <div
                        className={`p-3 text-xs rounded-2xl shadow-xs ${
                          isMine
                            ? 'bg-[#1a73e8] text-white rounded-tr-xs'
                            : 'bg-[#f1f3f4] text-[#1a1b1e] rounded-tl-xs border border-[#e3e2e6]'
                        }`}
                      >
                        {/* Attached Image */}
                        {msg.imageUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-black/10 bg-black/5">
                            <img
                              src={msg.imageUrl}
                              alt="Chat attachment"
                              className="w-full max-h-48 object-contain rounded-lg"
                            />
                          </div>
                        )}

                        {/* Voice Message */}
                        {msg.audioUrl && (
                          <div className="mb-1.5">
                            <VoiceAudioPlayer
                              audioUrl={msg.audioUrl}
                              duration={msg.audioDuration}
                              isMine={isMine}
                            />
                          </div>
                        )}

                        {msg.text && (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        )}
                        <div
                          className={`mt-1.5 pt-1 text-[10px] font-mono flex items-center gap-1 ${
                            isMine
                              ? 'text-white/80 border-t border-white/20 justify-end'
                              : 'text-[#5f6368] border-t border-[#dadce0]/60 justify-start'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendQuickReply} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ask the claimant a question or clarify details..."
                className="flex-1 px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        ) : (
          /* Normal Claims List */
          <div className="p-6 overflow-y-auto space-y-3.5">
            {item.claims.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Clock className="w-8 h-8 text-[#727785] mx-auto" />
                <div className="text-sm font-bold text-[#1a1b1e]">No claims yet</div>
                <p className="text-xs text-[#5f6368] max-w-xs mx-auto">
                  When someone submits an answer to your question, it will appear here so you can review it.
                </p>
              </div>
            ) : (
              item.claims.map((claim) => {
                const isApproved = claim.status === 'approved';
                const isRejected = claim.status === 'rejected';
                const isPending = claim.status === 'pending';

                return (
                  <div
                    key={claim.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isApproved
                        ? 'border-[#34a853] bg-[#f0f9f3]'
                        : isRejected
                        ? 'border-[#dadce0] bg-[#faf9fd] opacity-75'
                        : 'border-[#1a73e8]/40 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1b1e]">{claim.claimantNameMasked}</span>
                        <span className="font-mono text-[#5f6368] text-[11px] bg-[#f1f3f4] px-1.5 py-0.5 rounded">
                          {claim.claimantRegMasked}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#727785]">{claim.submittedAt}</span>
                    </div>

                    <div className="bg-white border border-[#dadce0] rounded-lg p-3 text-xs mb-3 space-y-1">
                      <div className="text-[11px] font-bold text-[#5f6368] uppercase">
                        Student's Answer:
                      </div>
                      <p className="text-sm text-[#1a1b1e] font-medium leading-relaxed">
                        "{claim.challengeAnswer}"
                      </p>
                      {claim.additionalProofNote && (
                        <div className="pt-1.5 border-t border-[#efedf1] text-xs text-[#5f6368]">
                          <span className="font-semibold text-[#414754]">Note: </span>
                          {claim.additionalProofNote}
                        </div>
                      )}

                      {claim.proofImageUrl && (
                        <div className="pt-2 border-t border-[#efedf1] space-y-1">
                          <div className="text-[11px] font-bold text-[#1a73e8] uppercase flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Attached Proof Photo:</span>
                          </div>
                          <div className="rounded-lg overflow-hidden border border-[#dadce0] bg-black/5 max-h-48 flex items-center justify-center">
                            <img
                              src={claim.proofImageUrl}
                              alt="Ownership proof photo"
                              className="w-full max-h-48 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="pt-1">
                        {rejectingClaimId === claim.id ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <select
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="text-xs border border-[#dadce0] rounded-lg px-2.5 py-1.5 bg-white text-[#1a1b1e]"
                            >
                              <option value="Answer does not match item markings">Answer does not match</option>
                              <option value="Incorrect initials or serial code">Incorrect initials/serial</option>
                              <option value="Different physical characteristics">Different model/color</option>
                              <option value="Insufficient details provided">Insufficient details</option>
                            </select>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleConfirmReject(claim.id)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-[#ba1a1a] rounded-lg cursor-pointer"
                              >
                                Confirm Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingClaimId(null)}
                                className="px-2.5 py-1.5 text-xs text-[#5f6368] hover:text-[#1a1b1e] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenHandoff(item);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat with Student</span>
                            </button>

                            <div className="flex items-center gap-2 ml-auto">
                              <button
                                type="button"
                                onClick={() => setRejectingClaimId(claim.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg border border-[#ffdad6] cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApprove(claim.id)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#006e2c] hover:bg-[#005320] rounded-lg shadow-xs cursor-pointer"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Yes, Approve & Chat</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {isApproved && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs text-[#006e2c] font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Approved — Ownership Verified</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenHandoff(item);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg shadow-xs cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Open Chat Room</span>
                        </button>
                      </div>
                    )}

                    {isRejected && (
                      <div className="text-xs text-[#ba1a1a] flex items-center gap-1.5 pt-1">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>Rejected: {claim.rejectionReason}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#414754] hover:bg-[#efedf1] rounded-md cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
