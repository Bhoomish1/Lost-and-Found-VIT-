import React, { useState } from 'react';
import { LostFoundItem, HandoffMessage } from '../types';
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
  Clock,
  Camera,
  Image as ImageIcon,
  Mic,
  Trash2,
  Square,
  AlertCircle,
  Upload,
  CheckSquare,
  Pencil,
  Check,
  User,
  Users,
} from 'lucide-react';
import { CameraModal } from './CameraModal';
import { VoiceAudioPlayer } from './VoiceAudioPlayer';

interface HandoffCoordinationModalProps {
  item: LostFoundItem;
  onClose: () => void;
  onResolvedSuccess?: () => void;
}

// Helper to format clean timestamps without 'time:' prefix
function cleanTimestamp(ts: string): string {
  if (!ts) return '';
  return ts.replace(/^(time|live):\s*/i, '').trim();
}

// Lightweight 16-bit PCM WAV encoder for audio synthesis fallback
function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
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
    deleteHandoffMessage,
    deleteMultipleHandoffMessages,
    editHandoffMessage,
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

  // Filter messages that have not been deleted for the current user
  const visibleMessages = (handoff.messages || []).filter(
    (m) => !m.deletedForUserIds?.includes(currentUser.id)
  );

  const [selectedCheckpointId, setSelectedCheckpointId] = useState(
    handoff.agreedCheckpointId || 'sjt_reception'
  );
  const [timeSlotInput, setTimeSlotInput] = useState(
    handoff.agreedTimeSlot || suggestedTimes[0]
  );
  const [messageText, setMessageText] = useState('');
  const [pendingChatImage, setPendingChatImage] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [micPermissionStatus, setMicPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'checking'
  >('prompt');
  const [showResolveConfirm, setShowResolveConfirm] = useState(false);
  const [isEditingCheckpoint, setIsEditingCheckpoint] = useState(false);

  // Message selection, delete confirmation & edit states
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    messageIds: string[];
    isMultiple: boolean;
  }>({
    isOpen: false,
    messageIds: [],
    isMultiple: false,
  });

  const chatGalleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const chatAudioFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingTimerRef = React.useRef<number | null>(null);

  // Check microphone permissions on mount
  React.useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setMicPermissionStatus(res.state as 'prompt' | 'granted' | 'denied');
          res.onchange = () => {
            setMicPermissionStatus(res.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {});
    }
  }, []);

  const requestMicPermission = async (): Promise<boolean> => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionStatus('granted');
      setMicError(null);
      // Clean up test stream immediately
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err: unknown) {
      setMicPermissionStatus('denied');
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setMicError(msg);
      return false;
    }
  };

  const sendSampleVoiceNote = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const sampleRate = ctx.sampleRate;
      const duration = 3.5;
      const buffer = ctx.createBuffer(1, Math.floor(sampleRate * duration), sampleRate);
      const data = buffer.getChannelData(0);

      // Harmonious vocal synthesized wave
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate;
        const env = Math.sin((Math.PI * t) / duration);
        data[i] =
          env *
          (Math.sin(2 * Math.PI * 260 * t) * 0.35 +
            Math.sin(2 * Math.PI * 520 * t) * 0.2 +
            Math.sin(2 * Math.PI * 130 * t) * 0.1);
      }

      const wavBytes = encodeWAV(data, sampleRate);
      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      const reader = new FileReader();
      reader.onload = () => {
        const audioDataUrl = reader.result as string;
        sendHandoffMessage(item.id, '', {
          audioUrl: audioDataUrl,
          audioDuration: Math.round(duration),
        });
        setMicError(null);
      };
      reader.readAsDataURL(blob);
    } catch {
      // fallback
    }
  };

  const currentCheckpoint =
    OFFICIAL_HANDOFF_CHECKPOINTS.find((c) => c.id === selectedCheckpointId) ||
    OFFICIAL_HANDOFF_CHECKPOINTS[0];

  const handleChatGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (result) setPendingChatImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const audioDataUrl = reader.result as string;
        if (audioDataUrl) {
          const tempAudio = new Audio(audioDataUrl);
          tempAudio.onloadedmetadata = () => {
            const dur = Math.round(tempAudio.duration) || 5;
            sendHandoffMessage(item.id, '', {
              audioUrl: audioDataUrl,
              audioDuration: dur,
            });
            setMicError(null);
          };
          tempAudio.onerror = () => {
            sendHandoffMessage(item.id, '', {
              audioUrl: audioDataUrl,
              audioDuration: 5,
            });
            setMicError(null);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceRecording = async () => {
    setMicError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported on this browser.');
      }
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      const startTime = Date.now();
      recordingTimerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingSeconds(elapsed);
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setMicError(msg);
    }
  };

  const stopAndSendVoiceRecording = () => {
    if (!mediaRecorderRef.current) return;

    const duration = recordingSeconds || 1;
    const recorder = mediaRecorderRef.current;

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        const audioDataUrl = reader.result as string;
        if (audioDataUrl) {
          sendHandoffMessage(item.id, '', {
            audioUrl: audioDataUrl,
            audioDuration: duration,
          });
        }
      };
      reader.readAsDataURL(audioBlob);

      // Stop mic tracks
      recorder.stream.getTracks().forEach((track) => track.stop());
    };

    recorder.stop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !pendingChatImage) return;
    sendHandoffMessage(
      item.id,
      messageText.trim(),
      pendingChatImage ? { imageUrl: pendingChatImage } : undefined
    );
    setMessageText('');
    setPendingChatImage('');
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

  const toggleSelectMessage = (id: string) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessageIds.length === visibleMessages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(visibleMessages.map((m) => m.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedMessageIds.length === 0) return;
    setDeleteConfirmState({
      isOpen: true,
      messageIds: [...selectedMessageIds],
      isMultiple: true,
    });
  };

  const handleDeleteSingle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmState({
      isOpen: true,
      messageIds: [id],
      isMultiple: false,
    });
  };

  const executeConfirmedDelete = (scope: 'for_me' | 'for_everyone') => {
    if (deleteConfirmState.messageIds.length === 0) return;

    if (deleteConfirmState.isMultiple) {
      deleteMultipleHandoffMessages(
        item.id,
        deleteConfirmState.messageIds,
        scope,
        currentUser.id
      );
      setSelectedMessageIds([]);
      setIsSelectMode(false);
    } else {
      deleteHandoffMessage(
        item.id,
        deleteConfirmState.messageIds[0],
        scope,
        currentUser.id
      );
      if (editingMessageId === deleteConfirmState.messageIds[0]) {
        setEditingMessageId(null);
      }
    }

    setDeleteConfirmState({
      isOpen: false,
      messageIds: [],
      isMultiple: false,
    });
  };

  const handleStartEdit = (msg: HandoffMessage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMessageId(msg.id);
    setEditingMessageText(msg.text);
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editingMessageText.trim()) return;
    editHandoffMessage(item.id, msgId, editingMessageText.trim());
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingMessageText('');
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
                    <span>Target: <strong>{handoff.agreedTimeSlot}</strong></span>
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#006e2c] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                  Active Chat
                </span>
                {visibleMessages.length > 0 && !isResolved && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode(!isSelectMode);
                      setSelectedMessageIds([]);
                      setEditingMessageId(null);
                    }}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border flex items-center gap-1 transition-colors cursor-pointer ${
                      isSelectMode
                        ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-xs'
                        : 'bg-white border-[#dadce0] text-[#414754] hover:bg-[#f1f3f4]'
                    }`}
                    title={isSelectMode ? 'Exit select mode' : 'Select messages to delete'}
                  >
                    {isSelectMode ? (
                      <CheckSquare className="w-3 h-3" />
                    ) : (
                      <Square className="w-3 h-3" />
                    )}
                    <span>{isSelectMode ? 'Done' : 'Select'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Multi-select Action Bar */}
            {isSelectMode && visibleMessages.length > 0 && (
              <div className="p-2 bg-[#e8f0fe] border border-[#a8c7fa] rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1a73e8]">
                    {selectedMessageIds.length} of {visibleMessages.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-medium text-[#1a73e8] hover:underline cursor-pointer ml-1"
                  >
                    {selectedMessageIds.length === visibleMessages.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={selectedMessageIds.length === 0}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-[#ea4335] hover:bg-[#b81d17] disabled:bg-[#dadce0] rounded-lg flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedMessageIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectMode(false);
                      setSelectedMessageIds([]);
                    }}
                    className="px-2 py-1 text-xs text-[#5f6368] hover:text-[#1a1b1e] hover:bg-white rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border border-[#dadce0] rounded-xl p-3 bg-white h-72 overflow-y-auto space-y-2.5 flex flex-col">
              {visibleMessages.length === 0 ? (
                <div className="text-center my-auto text-xs text-[#727785] py-8">
                  No messages yet. Send a message, photo, or voice note to coordinate your meetup time at the checkpoint.
                </div>
              ) : (
                visibleMessages.map((msg) => {
                  const isSystem = msg.senderRole === 'system';
                  const isMine = msg.senderId === currentUser.id;
                  const isSelected = selectedMessageIds.includes(msg.id);
                  const isEditing = editingMessageId === msg.id;

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        onClick={isSelectMode ? () => toggleSelectMessage(msg.id) : undefined}
                        className={`p-2.5 text-xs rounded-xl text-center mx-auto max-w-sm my-1 space-y-1 border transition-all ${
                          isSelected
                            ? 'bg-[#e8f0fe] border-[#1a73e8] ring-2 ring-[#1a73e8]/30'
                            : 'bg-[#f1f3f4] text-[#414754] border-[#e3e2e6]'
                        } ${isSelectMode ? 'cursor-pointer hover:border-[#1a73e8]' : ''}`}
                      >
                        {isSelectMode && (
                          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#1a73e8] mb-1">
                            {isSelected ? (
                              <CheckSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-[#727785]" />
                            )}
                            <span>{isSelected ? 'Selected' : 'Click to select'}</span>
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div className="text-[10px] text-[#727785] font-mono flex items-center justify-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-[#727785]" />
                          <span>{cleanTimestamp(msg.timestamp)}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      onClick={isSelectMode ? () => toggleSelectMessage(msg.id) : undefined}
                      className={`flex items-start gap-2 max-w-[88%] group transition-all ${
                        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                      } ${isSelectMode ? 'cursor-pointer' : ''}`}
                    >
                      {/* Checkbox in select mode */}
                      {isSelectMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectMessage(msg.id);
                          }}
                          className="mt-2 shrink-0 p-0.5 text-[#1a73e8] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 fill-[#1a73e8] text-white" />
                          ) : (
                            <Square className="w-4 h-4 text-[#727785]" />
                          )}
                        </button>
                      )}

                      <div className={`flex flex-col flex-1 ${isMine ? 'items-end' : 'items-start'}`}>
                        {/* Header with sender and clean timestamp */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#5f6368] mb-0.5 px-1 font-medium">
                          <span className="font-semibold text-[#1a1b1e]">{msg.senderMaskedName}</span>
                          <span>•</span>
                          <span className="font-mono text-[#414754] flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-[#5f6368]" />
                            {cleanTimestamp(msg.timestamp)}
                          </span>
                          {msg.edited && (
                            <span className="text-[#1a73e8] font-medium text-[9px] italic ml-0.5">
                              (edited)
                            </span>
                          )}
                        </div>

                        {/* Inline edit mode OR Message bubble */}
                        {isEditing ? (
                          <div className="w-full min-w-[240px] p-2.5 bg-white rounded-xl border-2 border-[#1a73e8] shadow-md space-y-2 text-xs">
                            <div className="text-[11px] font-bold text-[#1a73e8] flex items-center gap-1">
                              <Pencil className="w-3 h-3" />
                              <span>Edit message</span>
                            </div>
                            <textarea
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(msg.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              rows={2}
                              autoFocus
                              className="w-full p-2 border border-[#dadce0] rounded-lg text-xs text-[#1a1b1e] focus:outline-none focus:border-[#1a73e8] resize-none"
                              placeholder="Edit your message..."
                            />
                            <div className="flex items-center justify-between text-[10px] text-[#727785]">
                              <span>Press Enter to save, Esc to cancel</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 text-xs font-semibold text-[#5f6368] hover:bg-[#f1f3f4] rounded-md cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  disabled={!editingMessageText.trim()}
                                  className="px-2.5 py-1 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative group/bubble max-w-full">
                            <div
                              className={`p-3 text-xs rounded-2xl shadow-xs transition-all ${
                                isMine
                                  ? 'bg-[#1a73e8] text-white rounded-tr-xs'
                                  : 'bg-[#f1f3f4] text-[#1a1b1e] rounded-tl-xs border border-[#e3e2e6]'
                              } ${
                                isSelected
                                  ? 'ring-2 ring-[#1a73e8] ring-offset-2 bg-[#d2e3fc] text-[#1a1b1e]'
                                  : ''
                              }`}
                            >
                              {/* Attached Image */}
                              {msg.imageUrl && (
                                <div className="mb-2 rounded-xl overflow-hidden border border-black/10 bg-black/5">
                                  <img
                                    src={msg.imageUrl}
                                    alt="Chat attachment"
                                    className="w-full max-h-52 object-contain rounded-lg"
                                  />
                                </div>
                              )}

                              {/* Voice Message Player */}
                              {msg.audioUrl && (
                                <div className="mb-1.5">
                                  <VoiceAudioPlayer
                                    audioUrl={msg.audioUrl}
                                    duration={msg.audioDuration}
                                    isMine={isMine && !isSelected}
                                  />
                                </div>
                              )}

                              {/* Text Content */}
                              {msg.text && (
                                <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                              )}

                              {/* Message footer with timestamp and edit indicator */}
                              <div
                                className={`mt-1.5 pt-1 text-[10px] font-mono flex items-center gap-1 ${
                                  isMine && !isSelected
                                    ? 'text-white/80 border-t border-white/20 justify-end'
                                    : 'text-[#5f6368] border-t border-[#dadce0]/60 justify-start'
                                }`}
                              >
                                <Clock className="w-2.5 h-2.5" />
                                <span>{cleanTimestamp(msg.timestamp)}</span>
                                {msg.edited && (
                                  <span className="italic opacity-80 text-[9px] ml-0.5">
                                    (edited)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Hover Action Buttons (Edit and Delete) when not in multi-select */}
                            {!isSelectMode && !isResolved && (
                              <div
                                className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-1 z-10 ${
                                  isMine ? '-left-16' : '-right-16'
                                }`}
                              >
                                {msg.text && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartEdit(msg, e)}
                                    title="Edit message"
                                    className="p-1.5 bg-white hover:bg-[#e8f0fe] text-[#5f6368] hover:text-[#1a73e8] border border-[#dadce0] rounded-lg shadow-xs cursor-pointer transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSingle(msg.id, e)}
                                  title="Delete message"
                                  className="p-1.5 bg-white hover:bg-[#fce8e6] text-[#5f6368] hover:text-[#ea4335] border border-[#dadce0] rounded-lg shadow-xs cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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

            {/* Mic error notice & permission guidance */}
            {micError && (
              <div className="p-3 bg-[#fff0ed] border border-[#ffdad6] text-[#ba1a1a] text-xs rounded-xl space-y-2 shadow-xs animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#b81d17]">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#ea4335]" />
                    <span>Microphone Permission & Access</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMicError(null)}
                    className="p-1 text-[#5f6368] hover:text-[#1a1b1e] rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#414754] leading-relaxed">
                  Your browser requires permission to use the microphone. Please click the <strong>lock / site settings icon (🔒)</strong> in your browser address bar and set <strong>Microphone</strong> to <strong>Allow</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={requestMicPermission}
                    className="px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Grant Permission Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => chatAudioFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white border border-[#dadce0] hover:bg-[#f1f3f4] text-[#1a1b1e] font-semibold text-[11px] rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5f6368]" />
                    <span>Upload Audio File</span>
                  </button>
                  <button
                    type="button"
                    onClick={sendSampleVoiceNote}
                    className="px-3 py-1.5 bg-[#e6f4ea] hover:bg-[#cdecd3] text-[#006e2c] border border-[#a3e6b4] font-semibold text-[11px] rounded-lg cursor-pointer flex items-center gap-1"
                    title="Send a generated voice note to test audio playback"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Send Demo Voice Note</span>
                  </button>
                </div>
              </div>
            )}

            {/* Pending Image Attachment Preview */}
            {pendingChatImage && (
              <div className="relative inline-flex items-center gap-2 p-1.5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl">
                <img
                  src={pendingChatImage}
                  alt="Attachment preview"
                  className="w-14 h-14 object-cover rounded-lg border border-[#dadce0]"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#1a1b1e] block">Photo attached</span>
                  <span className="text-[11px] text-[#5f6368]">Will send with your message</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingChatImage('')}
                  className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6]/50 rounded-full ml-auto cursor-pointer"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Action Bar */}
            {!isResolved && (
              isRecording ? (
                /* Active Voice Recording UI */
                <div className="flex items-center justify-between p-2.5 bg-[#fce8e6] border border-[#ea4335]/40 rounded-xl shadow-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#ea4335] animate-ping" />
                    <div className="flex items-center gap-1 text-xs font-bold text-[#b81d17]">
                      <Mic className="w-4 h-4" />
                      <span>Recording Voice Note...</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#b81d17] bg-white px-2 py-0.5 rounded-full border border-[#ea4335]/30">
                      {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelVoiceRecording}
                      className="px-2.5 py-1 text-xs font-semibold text-[#b81d17] hover:bg-[#ea4335]/15 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendVoiceRecording}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#ea4335] hover:bg-[#b81d17] rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Chat Input Form */
                <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-1">
                  {/* Photo from gallery */}
                  <button
                    type="button"
                    onClick={() => chatGalleryInputRef.current?.click()}
                    title="Import photo from gallery"
                    className="p-2 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Photo from camera */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    title="Take photo with camera"
                    className="p-2 text-[#5f6368] hover:text-[#006e2c] hover:bg-[#e6f4ea] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Voice message button */}
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    title={
                      micPermissionStatus === 'granted'
                        ? 'Record voice message (Microphone access ready)'
                        : 'Record voice message (Click to grant microphone access)'
                    }
                    className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      micPermissionStatus === 'granted'
                        ? 'text-[#ea4335] hover:bg-[#fce8e6]'
                        : 'text-[#5f6368] hover:text-[#ea4335] hover:bg-[#fce8e6]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Hidden file input */}
                  <input
                    ref={chatGalleryInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChatGallerySelect}
                    className="hidden"
                  />

                  {/* Hidden audio file input */}
                  <input
                    ref={chatAudioFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileSelect}
                    className="hidden"
                  />

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type message, snap photo, or record voice note..."
                    className="flex-1 px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8] bg-white"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim() && !pendingChatImage}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#dadce0] rounded-lg flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              )
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

        {/* Camera Capture Modal */}
        <CameraModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(dataUrl) => {
            setPendingChatImage(dataUrl);
          }}
          title="Take Photo to Send in Chat"
        />

        {/* Delete Confirmation Dialog: Delete for Me vs Delete for Everyone */}
        {deleteConfirmState.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#dadce0] w-full max-w-sm overflow-hidden p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fce8e6] text-[#ea4335] flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#1a1b1e]">
                    {deleteConfirmState.isMultiple
                      ? `Delete ${deleteConfirmState.messageIds.length} Messages?`
                      : 'Delete Message?'}
                  </h3>
                  <p className="text-xs text-[#5f6368] mt-1 leading-relaxed">
                    Choose whether you want to delete {deleteConfirmState.isMultiple ? 'these messages' : 'this message'} only from your own view, or remove {deleteConfirmState.isMultiple ? 'them' : 'it'} for everyone in this chat.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                {/* Option 1: Delete for Everyone */}
                <button
                  type="button"
                  onClick={() => executeConfirmedDelete('for_everyone')}
                  className="w-full py-2.5 px-3 bg-[#ea4335] hover:bg-[#b81d17] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Delete for Everyone</span>
                </button>

                {/* Option 2: Delete for Me */}
                <button
                  type="button"
                  onClick={() => executeConfirmedDelete('for_me')}
                  className="w-full py-2.5 px-3 bg-white hover:bg-[#f1f3f4] text-[#1a1b1e] border border-[#dadce0] font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-colors"
                >
                  <User className="w-4 h-4 text-[#5f6368] shrink-0" />
                  <span>Delete for Me</span>
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmState({ isOpen: false, messageIds: [], isMultiple: false })
                  }
                  className="w-full py-2 text-xs font-semibold text-[#5f6368] hover:text-[#1a1b1e] hover:bg-[#f1f3f4] rounded-xl cursor-pointer transition-colors text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
