import React, { useState } from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import { OFFICIAL_HANDOFF_CHECKPOINTS } from '../data/vitVenues';
import { getSuggestedMeetupTimes } from '../utils/time';
import {
  X,
  MapPin,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface HandoffCoordinationModalProps {
  item: LostFoundItem;
  onClose: () => void;
  onResolvedSuccess?: () => void;
}

export const HandoffCoordinationModal: React.FC<HandoffCoordinationModalProps> = ({
  item: initialItem,
  onClose,
  onResolvedSuccess,
}) => {
  const {
    currentUser,
    items,
    sendHandoffMessage,
    setHandoffCheckpoint,
    markResolved,
    approveClaim,
  } = useApp();

  // Use live item reference
  const item = items.find((i) => i.id === initialItem.id) || initialItem;

  const isFinder = item.reporter.studentId === currentUser.id;
  const isResolved = item.status === 'resolved';

  const pendingClaim = item.claims.find((c) => c.status === 'pending');
  const myClaim = item.claims.find((c) => c.claimantStudentId === currentUser.id);

  const suggestedTimes = getSuggestedMeetupTimes();

  const handoff = item.handoffDetails || {
    agreedCheckpointId: 'sjt_reception',
    agreedCheckpointName: 'SJT Ground Floor Reception Desk',
    agreedTimeSlot: suggestedTimes[0],
    messages: [],
  };

  const [selectedCheckpointId, setSelectedCheckpointId] = useState(
    handoff.agreedCheckpointId || 'sjt_reception'
  );
  const [timeSlotInput, setTimeSlotInput] = useState(
    handoff.agreedTimeSlot || suggestedTimes[0]
  );
  const [messageText, setMessageText] = useState('');
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [isEditingCheckpoint, setIsEditingCheckpoint] = useState(false);

  const currentCheckpoint =
    OFFICIAL_HANDOFF_CHECKPOINTS.find((c) => c.id === selectedCheckpointId) ||
    OFFICIAL_HANDOFF_CHECKPOINTS[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendHandoffMessage(item.id, messageText);
    setMessageText('');
  };

  const handleQuickSnippet = (snippet: string) => {
    setMessageText(snippet);
  };

  const handleSaveCheckpoint = () => {
    setHandoffCheckpoint(item.id, selectedCheckpointId, timeSlotInput);
    setIsEditingCheckpoint(false);
  };

  const handleMarkResolved = () => {
    markResolved(item.id);
    setShowResolveConfirm(false);
    if (onResolvedSuccess) onResolvedSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#dadce0] w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e6f4ea] text-[#006e2c] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1b1e]">Campus Pickup & Live Chat</h2>
              <p className="text-xs text-[#5f6368]">
                Returning {item.title} at an official security desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Quick claim approval banner if finder is viewing an unapproved claim in chat */}
          {isFinder && pendingClaim && (
            <div className="p-3.5 bg-[#e8f0fe] border border-[#a8c7fa] rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <span className="font-bold text-[#1a73e8] block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Answer Verification Pending</span>
                </span>
                <span className="text-[#3c4043] line-clamp-1">
                  {pendingClaim.claimantNameMasked} answered: "{pendingClaim.challengeAnswer}"
                </span>
              </div>
              <button
                type="button"
                onClick={() => approveClaim(item.id, pendingClaim.id)}
                className="px-3.5 py-1.5 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-lg whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve Claim</span>
              </button>
            </div>
          )}

          {/* Claimant status banner */}
          {!isFinder && myClaim && (
            <div className="p-3 bg-[#faf9fd] border border-[#dadce0] rounded-xl text-xs flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-[#5f6368] uppercase block">YOUR SUBMITTED ANSWER:</span>
                <span className="font-semibold text-[#1a1b1e] italic line-clamp-1">"{myClaim.challengeAnswer}"</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                myClaim.status === 'approved'
                  ? 'bg-[#e6f4ea] text-[#006e2c]'
                  : 'bg-[#fef7e0] text-[#b06000]'
              }`}>
                {myClaim.status === 'approved' ? 'Ownership Approved' : 'Review Pending'}
              </span>
            </div>
          )}

          {isResolved ? (
            <div className="p-4 bg-[#e6f4ea] border border-[#a3e6b4] rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#006e2c] shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#006e2c]">Item Returned Successfully!</h4>
                <p className="text-xs text-[#3c4043]">
                  Both students verified and completed the handoff. This item is now archived.
                </p>
              </div>
            </div>
          ) : (
            /* Meeting checkpoint summary */
            <div className="border border-[#dadce0] rounded-xl p-3.5 bg-[#faf9fd] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1a1b1e] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#1a73e8]" />
                  <span>Meeting Spot & Time:</span>
                </span>
                {!isEditingCheckpoint ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingCheckpoint(true)}
                    className="text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
                  >
                    Change Spot
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveCheckpoint}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                )}
              </div>

              {!isEditingCheckpoint ? (
                <div className="bg-white border border-[#dadce0] rounded-lg p-3 text-xs space-y-1">
                  <div className="font-bold text-sm text-[#1a1b1e] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#1a73e8]" />
                    <span>{handoff.agreedCheckpointName || currentCheckpoint.name}</span>
                  </div>
                  <div className="text-[#5f6368]">{currentCheckpoint.locationDescription}</div>
                  <div className="pt-1.5 border-t border-[#efedf1] text-[11px] text-[#3c4043] flex items-center justify-between">
                    <span>Target Time: <strong>{handoff.agreedTimeSlot}</strong></span>
                    <span className="text-[#006e2c] font-medium">{currentCheckpoint.securityPresence}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#1a73e8] rounded-lg p-3 space-y-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#1a1b1e] mb-1">Pick an official checkpoint:</label>
                    <select
                      value={selectedCheckpointId}
                      onChange={(e) => setSelectedCheckpointId(e.target.value)}
                      className="w-full p-2 border border-[#dadce0] rounded-lg bg-white"
                    >
                      {OFFICIAL_HANDOFF_CHECKPOINTS.map((cp) => (
                        <option key={cp.id} value={cp.id}>
                          {cp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1a1b1e] mb-1">Preferred Time:</label>
                    <input
                      type="text"
                      value={timeSlotInput}
                      onChange={(e) => setTimeSlotInput(e.target.value)}
                      className="w-full p-2 border border-[#dadce0] rounded-lg mb-1.5"
                      placeholder="e.g. Today 5:15 PM"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTimes.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setTimeSlotInput(sug)}
                          className="px-2 py-0.5 bg-[#f1f3f4] hover:bg-[#e3e2e6] text-[10px] font-medium rounded text-[#414754] cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat thread */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1a1b1e]">Private In-App Messages</span>
              <span className="text-[11px] text-[#006e2c] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                Live Relay
              </span>
            </div>

            <div className="border border-[#dadce0] rounded-xl p-3 bg-white h-56 overflow-y-auto space-y-2.5 flex flex-col">
              {handoff.messages.length === 0 ? (
                <div className="text-center my-auto text-xs text-[#727785] py-8">
                  No messages yet. Send a message to coordinate your meetup time at the checkpoint.
                </div>
              ) : (
                handoff.messages.map((msg) => {
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
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <div
                          className={`mt-1.5 pt-1 text-[10px] font-mono flex items-center gap-1 ${
                            isMine
                              ? 'text-white/80 border-t border-white/20 justify-end'
                              : 'text-[#5f6368] border-t border-[#dadce0]/60 justify-start'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>Time: {msg.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick snippet buttons */}
            {!isResolved && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'I am at the security desk now',
                  'When are you free today?',
                  'Can we meet at SJT Ground Reception?',
                  'I have my ID card to verify',
                ].map((snip) => (
                  <button
                    key={snip}
                    type="button"
                    onClick={() => handleQuickSnippet(snip)}
                    className="px-2 py-1 bg-[#f1f3f4] hover:bg-[#e3e2e6] text-[#414754] text-[10px] font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    "{snip}"
                  </button>
                ))}
              </div>
            )}

            {/* Input box */}
            {!isResolved && (
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Message the other student (e.g. 'I am at the security desk now')..."
                  className="flex-1 px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>

          {/* Mark resolved */}
          {!isResolved && (
            <div className="pt-2 border-t border-[#dadce0]">
              {!showResolveConfirm ? (
                <div className="flex items-center justify-between p-3 bg-[#e6f4ea]/40 border border-[#c1e7c4] rounded-xl">
                  <div className="text-xs text-[#006e2c]">
                    <span className="font-bold block">Did you meet and receive the item?</span>
                    <span className="text-[11px] text-[#5f6368]">Either student can mark it returned.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResolveConfirm(true)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#006e2c] hover:bg-[#005320] rounded-lg shadow-xs cursor-pointer"
                  >
                    Mark as Done & Returned
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-[#fff8e1] border border-[#ffe082] rounded-xl space-y-2 text-xs text-[#b06000]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Confirm Item Return</span>
                  </div>
                  <p>Has the item been safely handed back in person? This will archive the item from active feeds.</p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowResolveConfirm(false)}
                      className="px-3 py-1 text-xs text-[#414754] hover:bg-white rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkResolved}
                      className="px-3.5 py-1 text-xs font-bold text-white bg-[#006e2c] hover:bg-[#005320] rounded-lg cursor-pointer"
                    >
                      Yes, It's Returned
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between text-xs text-[#5f6368]">
          <span>Security desks provide campus CCTV monitoring and staff presence.</span>
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
