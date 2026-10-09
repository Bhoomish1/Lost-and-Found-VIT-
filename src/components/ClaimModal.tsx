import React, { useState, useRef } from 'react';
import { LostFoundItem } from '../types';
import { useApp } from '../context/AppContext';
import { maskRegNumber } from '../utils/masking';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { CameraModal } from './CameraModal';

interface ClaimModalProps {
  item: LostFoundItem;
  onClose: () => void;
  onSuccess: () => void;
  onOpenChat?: (item: LostFoundItem) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ item, onClose, onSuccess, onOpenChat }) => {
  const { currentUser, submitClaim, items } = useApp();
  const [answer, setAnswer] = useState('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProofImageUrl(result);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please answer the verification question to prove ownership.');
      return;
    }

    submitClaim(item.id, answer.trim(), additionalNote.trim(), proofImageUrl || undefined);
    setSubmitted(true);
  };

  const handleOpenChatNow = () => {
    const updated = items.find((i) => i.id === item.id) || item;
    onClose();
    if (onOpenChat) {
      onOpenChat(updated);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#dadce0] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1b1e]">Prove Ownership to Claim</h2>
              <p className="text-xs text-[#5f6368]">Answer the finder's secret question</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 bg-[#e6f4ea] text-[#006e2c] rounded-full flex items-center justify-center mx-auto shadow-xs ring-8 ring-[#e6f4ea]/60">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1a1b1e]">Answer Sent & Chat Room Open!</h3>
              <p className="text-xs text-[#5f6368] max-w-sm mx-auto leading-relaxed">
                Your verification answer has been sent to the finder. A private, secure chat room is now active so you can converse and coordinate pickup.
              </p>
            </div>

            <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-xs text-left max-w-sm mx-auto space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#5f6368]">YOUR ANSWER:</div>
              <p className="font-semibold text-[#1a1b1e] italic">"{answer}"</p>
              {additionalNote && (
                <p className="text-[#5f6368] text-[11px]">Note: {additionalNote}</p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleOpenChatNow}
                className="w-full py-2.5 px-4 bg-[#006e2c] hover:bg-[#005320] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Chat with Finder Now →</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSuccess();
                }}
                className="w-full sm:w-auto py-2.5 px-4 bg-[#f1f3f4] hover:bg-[#e3e2e6] text-[#414754] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Simple Privacy Banner */}
            <div className="p-3 bg-[#e8f0fe]/60 border border-[#c1c6d6] rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1a73e8]">
                <Lock className="w-3.5 h-3.5 text-[#34a853]" />
                <span>Your Privacy is Protected</span>
              </div>
              <p className="text-[#3c4043] leading-relaxed">
                The finder will only see your answer and your masked student ID (
                <span className="font-mono font-medium">{maskRegNumber(currentUser.regNumber)}</span>). No phone
                numbers or emails are shared.
              </p>
            </div>

            {/* Target Item */}
            <div className="border border-[#dadce0] rounded-lg p-3 bg-white text-xs">
              <div className="text-[11px] text-[#727785] font-semibold">CLAIMING ITEM:</div>
              <div className="font-bold text-sm text-[#1a1b1e] mt-0.5">{item.title}</div>
              <div className="text-[#5f6368] mt-0.5">Found at {item.venueCode} ({item.specificLocation})</div>
            </div>

            {/* Secret Question */}
            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-2">
              <div className="text-xs font-bold text-[#1a73e8] uppercase tracking-wide flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Finder's Secret Question:</span>
              </div>
              <p className="text-sm font-bold text-[#1a1b1e]">
                "{item.verificationChallenge.question}"
              </p>
              {item.verificationChallenge.hint && (
                <p className="text-xs text-[#5f6368] italic">
                  Hint: {item.verificationChallenge.hint}
                </p>
              )}
            </div>

            {/* Your Answer */}
            <div>
              <label className="block text-xs font-bold text-[#1a1b1e] mb-1">
                Your Answer <span className="text-[#ea4335]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setError('');
                }}
                placeholder="Give details only the owner knows (e.g. markings, stickers, pencil formula, or key number)..."
                className="w-full p-3 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            {/* Additional note */}
            <div>
              <label className="block text-xs font-medium text-[#414754] mb-1">
                Extra Details <span className="text-[#727785] font-normal">(Optional, e.g. class slot or table)</span>
              </label>
              <input
                type="text"
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                placeholder="e.g. Lost during morning FAT exam slot in room 412"
                className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
              />
            </div>

            {/* Photo Proof Upload: Gallery or Camera */}
            <div className="p-3.5 bg-[#faf9fd] border border-[#dadce0] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1a1b1e] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#1a73e8]" />
                  <span>Attach Ownership Proof Photo</span>
                  <span className="text-[10px] font-normal text-[#5f6368]">(Optional)</span>
                </label>
                {proofImageUrl && (
                  <button
                    type="button"
                    onClick={() => setProofImageUrl('')}
                    className="text-[11px] font-semibold text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#5f6368] leading-relaxed">
                Add a picture showing proof of ownership (bill/receipt, previous photo of item, ID card, or distinctive markings).
              </p>

              {proofImageUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-[#dadce0] bg-black/5 max-h-44 flex items-center justify-center">
                  <img
                    src={proofImageUrl}
                    alt="Proof preview"
                    className="w-full h-36 object-contain rounded-lg"
                  />
                  <div className="absolute bottom-2 right-2 flex gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="px-2 py-1 text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 rounded cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="px-2 py-1 text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 rounded cursor-pointer"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-lg border-2 border-dashed border-[#dadce0] hover:border-[#1a73e8] bg-white hover:bg-[#e8f0fe]/30 text-xs font-semibold text-[#414754] hover:text-[#1a73e8] transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-[#1a73e8]" />
                    <span>Photo Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-2.5 rounded-lg border-2 border-dashed border-[#dadce0] hover:border-[#006e2c] bg-white hover:bg-[#e6f4ea]/30 text-xs font-semibold text-[#414754] hover:text-[#006e2c] transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-[#006e2c]" />
                    <span>Take with Camera</span>
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="hidden"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#dadce0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#414754] hover:bg-[#f1f3f4] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg shadow-sm cursor-pointer"
              >
                Submit My Answer & Chat
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          setProofImageUrl(dataUrl);
          setError('');
        }}
        title="Take Photo of Ownership Proof"
      />
    </div>
  );
};
