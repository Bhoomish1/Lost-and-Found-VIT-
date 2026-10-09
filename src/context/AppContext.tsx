import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  LostFoundItem,
  StudentProfile,
  ClaimVerification,
  HandoffMessage,
  CategoryTag,
  VenueZone,
  AppNotification,
} from '../types';
import { getFreshInitialItems, MOCK_STUDENTS } from '../data/mockItems';
import { OFFICIAL_HANDOFF_CHECKPOINTS } from '../data/vitVenues';
import { maskRegNumber } from '../utils/masking';
import {
  getCurrentLiveTimeString,
  getCurrentLiveDateTimeString,
  getSuggestedMeetupTimes,
  playCampusNotificationChime,
} from '../utils/time';

interface AppContextType {
  currentUser: StudentProfile;
  allStudents: StudentProfile[];
  switchUser: (studentId: string) => void;
  updateCurrentUserProfile: (profile: Partial<StudentProfile>) => void;

  items: LostFoundItem[];
  activeFeed: 'lost' | 'found' | 'all' | 'my-reports' | 'my-claims' | 'resolved';
  setActiveFeed: (feed: 'lost' | 'found' | 'all' | 'my-reports' | 'my-claims' | 'resolved') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: CategoryTag | 'all';
  setSelectedCategory: (cat: CategoryTag | 'all') => void;
  selectedVenueZone: VenueZone | 'all';
  setSelectedVenueZone: (zone: VenueZone | 'all') => void;

  reportNewItem: (itemData: Omit<LostFoundItem, 'id' | 'claims' | 'status' | 'reporter'>) => string;
  submitClaim: (itemId: string, challengeAnswer: string, additionalProofNote?: string, proofImageUrl?: string) => void;
  approveClaim: (itemId: string, claimId: string) => void;
  rejectClaim: (itemId: string, claimId: string, reason: string) => void;
  sendHandoffMessage: (
    itemId: string,
    text: string,
    attachments?: { imageUrl?: string; audioUrl?: string; audioDuration?: number }
  ) => void;
  deleteHandoffMessage: (
    itemId: string,
    messageId: string,
    deleteScope?: 'for_me' | 'for_everyone',
    userId?: string
  ) => void;
  deleteMultipleHandoffMessages: (
    itemId: string,
    messageIds: string[],
    deleteScope?: 'for_me' | 'for_everyone',
    userId?: string
  ) => void;
  editHandoffMessage: (itemId: string, messageId: string, newText: string) => void;
  setHandoffCheckpoint: (itemId: string, checkpointId: string, timeSlot: string) => void;
  markResolved: (itemId: string) => void;
  resetDemoData: () => void;

  // Notification management
  notifications: AppNotification[];
  activeToast: AppNotification | null;
  dismissToast: () => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationsCount: number;

  pendingClaimsCountForMe: number;
  activeHandoffsCountForMe: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_ITEMS_KEY = 'vit_lost_found_items_v12';
const LOCAL_STORAGE_USER_KEY = 'vit_lost_found_user_v12';
const LOCAL_STORAGE_NOTIFS_KEY = 'vit_lost_found_notifs_v12';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allStudents] = useState<StudentProfile[]>(MOCK_STUDENTS);

  const [currentUser, setCurrentUser] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (MOCK_STUDENTS.some((s) => s.regNumber === parsed.regNumber)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return MOCK_STUDENTS[0]; // Default: Bhoomish Yadav (25BAI0218)
  });

  const [items, setItems] = useState<LostFoundItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean out any unwanted stock photos from prior sessions
          return parsed.map((item: LostFoundItem) => {
            if (item.imageUrl && !item.imageUrl.startsWith('data:image/')) {
              const { imageUrl, ...rest } = item;
              return rest as LostFoundItem;
            }
            return item;
          });
        }
      }
    } catch {
      // fallback
    }
    return getFreshInitialItems();
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'notif-init-1',
        recipientId: 'student_1', // Bhoomish Yadav
        recipientName: 'Bhoomish Yadav',
        senderName: 'Krishna Vishal (Claimant)',
        title: 'New Verification Answer on Casio fx-991EX',
        message: 'Krishna Vishal submitted an answer to your question. Chat is active!',
        timestamp: getCurrentLiveTimeString(),
        itemId: 'item-101',
        itemTitle: 'Casio fx-991EX ClassWiz Scientific Calculator',
        type: 'new_claim',
        read: false,
      },
    ];
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const [activeFeed, setActiveFeed] = useState<'lost' | 'found' | 'all' | 'my-reports' | 'my-claims' | 'resolved'>('found');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryTag | 'all'>('all');
  const [selectedVenueZone, setSelectedVenueZone] = useState<VenueZone | 'all'>('all');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
    } catch {
      // silent
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
    } catch {
      // silent
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
    } catch {
      // silent
    }
  }, [notifications]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const dismissToast = () => setActiveToast(null);

  const triggerNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const liveTime = getCurrentLiveTimeString();
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: liveTime,
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Show toast if notification belongs to currently active logged-in user
    if (newNotif.recipientId === currentUser.id) {
      setActiveToast(newNotif);
      playCampusNotificationChime();
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const switchUser = (studentId: string) => {
    const found = allStudents.find((s) => s.id === studentId);
    if (found) {
      setCurrentUser(found);
      // If there are unread notifications for this student, trigger toast & alert
      const studentUnread = notifications.filter((n) => n.recipientId === studentId && !n.read);
      if (studentUnread.length > 0) {
        setActiveToast(studentUnread[0]);
        playCampusNotificationChime();
      }
    }
  };

  const updateCurrentUserProfile = (profile: Partial<StudentProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...profile }));
  };

  const reportNewItem = (itemData: Omit<LostFoundItem, 'id' | 'claims' | 'status' | 'reporter'>) => {
    const newItemId = `item-${Date.now()}`;
    const liveTime = getCurrentLiveDateTimeString();

    const newItem: LostFoundItem = {
      ...itemData,
      id: newItemId,
      dateTime: liveTime,
      status: 'open',
      claims: [],
      reporter: {
        studentId: currentUser.id,
        fullName: currentUser.name,
        regNumber: currentUser.regNumber,
        email: currentUser.email,
        phone: currentUser.phone,
      },
    };

    setItems((prev) => [newItem, ...prev]);
    return newItemId;
  };

  const submitClaim = (
    itemId: string,
    challengeAnswer: string,
    additionalProofNote?: string,
    proofImageUrl?: string
  ) => {
    const liveTime = getCurrentLiveTimeString();

    const newClaim: ClaimVerification = {
      id: `claim-${Date.now()}`,
      itemId,
      claimantStudentId: currentUser.id,
      claimantNameMasked: `${currentUser.name.split(' ')[0]} (VITian)`,
      claimantRegMasked: maskRegNumber(currentUser.regNumber),
      challengeAnswer,
      additionalProofNote,
      proofImageUrl,
      submittedAt: liveTime,
      status: 'pending',
    };

    let targetItemTitle = '';
    let finderStudentId = '';
    let finderName = '';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          targetItemTitle = item.title;
          finderStudentId = item.reporter.studentId;
          finderName = item.reporter.fullName;

          const updatedClaims = [...item.claims, newClaim];

          // Initialize immediate chat thread between claimant and finder
          const openingClaimantMessage: HandoffMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderRole: 'claimant',
            senderMaskedName: `${currentUser.name.split(' ')[0]} (Claimant)`,
            text: `Hi! I answered your verification question: "${challengeAnswer}". ${
              additionalProofNote ? `Note: ${additionalProofNote}` : ''
            }`,
            imageUrl: proofImageUrl,
            timestamp: liveTime,
          };

          const systemNotice: HandoffMessage = {
            id: `msg-sys-${Date.now()}`,
            senderId: 'system',
            senderRole: 'system',
            senderMaskedName: 'Campus Relay',
            text: `${currentUser.name.split(' ')[0]} (${maskRegNumber(
              currentUser.regNumber
            )}) submitted an answer to the verification question. You can chat directly to verify or clarify details.`,
            timestamp: liveTime,
          };

          const existingMessages = item.handoffDetails?.messages || [];
          const suggestedTimes = getSuggestedMeetupTimes();

          return {
            ...item,
            status: item.status === 'open' ? 'claim_pending' : item.status,
            claims: updatedClaims,
            handoffDetails: {
              agreedCheckpointId: item.handoffDetails?.agreedCheckpointId || 'sjt_reception',
              agreedCheckpointName:
                item.handoffDetails?.agreedCheckpointName || 'SJT Ground Floor Reception Desk',
              agreedTimeSlot: item.handoffDetails?.agreedTimeSlot || suggestedTimes[0],
              messages: [...existingMessages, systemNotice, openingClaimantMessage],
              finderConfirmed: item.handoffDetails?.finderConfirmed || false,
              claimantConfirmed: item.handoffDetails?.claimantConfirmed || false,
            },
          };
        }
        return item;
      })
    );

    // NOTIFY FINDER IMMEDIATELY
    if (finderStudentId) {
      triggerNotification({
        recipientId: finderStudentId,
        recipientName: finderName,
        senderName: `${currentUser.name.split(' ')[0]} (${maskRegNumber(currentUser.regNumber)})`,
        title: `New Verification Answer: ${targetItemTitle}`,
        message: `${currentUser.name} answered: "${challengeAnswer}". Chat room is active!`,
        itemId,
        itemTitle: targetItemTitle,
        type: 'new_claim',
      });
    }
  };

  const approveClaim = (itemId: string, claimId: string) => {
    const liveTime = getCurrentLiveTimeString();
    let targetItemTitle = '';
    let claimantId = '';
    let claimantName = '';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          targetItemTitle = item.title;
          const targetClaim = item.claims.find((c) => c.id === claimId);
          if (targetClaim) {
            claimantId = targetClaim.claimantStudentId;
            claimantName = targetClaim.claimantNameMasked;
          }

          const updatedClaims = item.claims.map((c) =>
            c.id === claimId ? { ...c, status: 'approved' as const, reviewedAt: liveTime } : c
          );

          const approvalNotice: HandoffMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderRole: 'system',
            senderMaskedName: 'Campus Relay',
            text: 'Claim verified and APPROVED by finder! Ownership verified. Agree on a campus security desk to complete physical handoff.',
            timestamp: liveTime,
          };

          const existingMessages = item.handoffDetails?.messages || [];
          const suggestedTimes = getSuggestedMeetupTimes();

          return {
            ...item,
            status: 'handoff_coordination',
            approvedClaimId: claimId,
            claims: updatedClaims,
            handoffDetails: {
              agreedCheckpointId: item.handoffDetails?.agreedCheckpointId || 'sjt_reception',
              agreedCheckpointName:
                item.handoffDetails?.agreedCheckpointName || 'SJT Ground Floor Reception Desk',
              agreedTimeSlot:
                item.handoffDetails?.agreedTimeSlot || suggestedTimes[0],
              messages: [...existingMessages, approvalNotice],
              finderConfirmed: true,
              claimantConfirmed: false,
            },
          };
        }
        return item;
      })
    );

    // NOTIFY CLAIMANT IMMEDIATELY
    if (claimantId) {
      triggerNotification({
        recipientId: claimantId,
        recipientName: claimantName,
        senderName: `${currentUser.name.split(' ')[0]} (Finder)`,
        title: `Claim Approved! ${targetItemTitle}`,
        message: `Your answer was verified by the finder. Safe handoff chat & checkpoint unlocked!`,
        itemId,
        itemTitle: targetItemTitle,
        type: 'claim_approved',
      });
    }
  };

  const rejectClaim = (itemId: string, claimId: string, reason: string) => {
    const liveTime = getCurrentLiveTimeString();
    let claimantId = '';
    let claimantName = '';
    let targetItemTitle = '';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          targetItemTitle = item.title;
          const targetClaim = item.claims.find((c) => c.id === claimId);
          if (targetClaim) {
            claimantId = targetClaim.claimantStudentId;
            claimantName = targetClaim.claimantNameMasked;
          }

          const updatedClaims = item.claims.map((c) =>
            c.id === claimId
              ? { ...c, status: 'rejected' as const, rejectionReason: reason, reviewedAt: liveTime }
              : c
          );
          const hasOtherPending = updatedClaims.some((c) => c.status === 'pending');
          const nextStatus =
            item.status === 'handoff_coordination'
              ? 'handoff_coordination'
              : hasOtherPending
              ? 'claim_pending'
              : 'open';

          return {
            ...item,
            status: nextStatus,
            claims: updatedClaims,
          };
        }
        return item;
      })
    );

    // NOTIFY CLAIMANT OF REJECTION
    if (claimantId) {
      triggerNotification({
        recipientId: claimantId,
        recipientName: claimantName,
        senderName: `${currentUser.name.split(' ')[0]} (Finder)`,
        title: `Verification Notice: ${targetItemTitle}`,
        message: `Answer could not be confirmed: ${reason}`,
        itemId,
        itemTitle: targetItemTitle,
        type: 'claim_rejected',
      });
    }
  };

  const sendHandoffMessage = (
    itemId: string,
    text: string,
    attachments?: { imageUrl?: string; audioUrl?: string; audioDuration?: number }
  ) => {
    if (!text.trim() && !attachments?.imageUrl && !attachments?.audioUrl) return;
    const liveTime = getCurrentLiveTimeString();

    let targetItemTitle = '';
    let recipientStudentId = '';
    let recipientName = '';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          targetItemTitle = item.title;
          const isFinder = item.reporter.studentId === currentUser.id;

          // Find the partner student
          if (isFinder) {
            // Recipient is the claimant
            const targetClaim =
              (item.approvedClaimId && item.claims.find((c) => c.id === item.approvedClaimId)) ||
              item.claims[0];
            if (targetClaim) {
              recipientStudentId = targetClaim.claimantStudentId;
              recipientName = targetClaim.claimantNameMasked;
            }
          } else {
            // Recipient is the finder
            recipientStudentId = item.reporter.studentId;
            recipientName = item.reporter.fullName;
          }

          const fallbackText = attachments?.audioUrl
            ? `🎤 Voice message (${Math.round(attachments.audioDuration || 0)}s)`
            : attachments?.imageUrl
            ? '📷 Photo attached'
            : '';

          const newMessage: HandoffMessage = {
            id: `msg-${Date.now()}`,
            senderId: currentUser.id,
            senderRole: isFinder ? 'finder' : 'claimant',
            senderMaskedName: `${currentUser.name.split(' ')[0]} (${isFinder ? 'Finder' : 'Claimant'})`,
            text: text.trim() || fallbackText,
            imageUrl: attachments?.imageUrl,
            audioUrl: attachments?.audioUrl,
            audioDuration: attachments?.audioDuration,
            timestamp: liveTime,
          };

          const suggestedTimes = getSuggestedMeetupTimes();
          const handoff = item.handoffDetails || {
            agreedCheckpointId: 'sjt_reception',
            agreedCheckpointName: 'SJT Ground Floor Reception Desk',
            agreedTimeSlot: suggestedTimes[0],
            messages: [],
          };

          return {
            ...item,
            handoffDetails: {
              ...handoff,
              messages: [...handoff.messages, newMessage],
            },
          };
        }
        return item;
      })
    );

    // DISPATCH NOTIFICATION TO RECIPIENT
    if (recipientStudentId) {
      const isFinder = items.find((i) => i.id === itemId)?.reporter.studentId === currentUser.id;
      const notifSnippet =
        text.trim() ||
        (attachments?.audioUrl
          ? 'Sent a voice message'
          : attachments?.imageUrl
          ? 'Shared a photo'
          : 'New message');

      triggerNotification({
        recipientId: recipientStudentId,
        recipientName: recipientName,
        senderName: `${currentUser.name.split(' ')[0]} (${isFinder ? 'Finder' : 'Claimant'})`,
        title: `New Message on ${targetItemTitle}`,
        message: notifSnippet,
        itemId,
        itemTitle: targetItemTitle,
        type: 'chat_message',
      });
    }
  };

  const deleteHandoffMessage = (
    itemId: string,
    messageId: string,
    deleteScope: 'for_me' | 'for_everyone' = 'for_everyone',
    userId?: string
  ) => {
    const targetUserId = userId || currentUser.id;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.handoffDetails) {
          if (deleteScope === 'for_me') {
            return {
              ...item,
              handoffDetails: {
                ...item.handoffDetails,
                messages: item.handoffDetails.messages.map((m) => {
                  if (m.id === messageId) {
                    const currentDeletedFor = m.deletedForUserIds || [];
                    if (!currentDeletedFor.includes(targetUserId)) {
                      return { ...m, deletedForUserIds: [...currentDeletedFor, targetUserId] };
                    }
                  }
                  return m;
                }),
              },
            };
          } else {
            // Delete for everyone
            return {
              ...item,
              handoffDetails: {
                ...item.handoffDetails,
                messages: item.handoffDetails.messages.filter((m) => m.id !== messageId),
              },
            };
          }
        }
        return item;
      })
    );
  };

  const deleteMultipleHandoffMessages = (
    itemId: string,
    messageIds: string[],
    deleteScope: 'for_me' | 'for_everyone' = 'for_everyone',
    userId?: string
  ) => {
    const idSet = new Set(messageIds);
    const targetUserId = userId || currentUser.id;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.handoffDetails) {
          if (deleteScope === 'for_me') {
            return {
              ...item,
              handoffDetails: {
                ...item.handoffDetails,
                messages: item.handoffDetails.messages.map((m) => {
                  if (idSet.has(m.id)) {
                    const currentDeletedFor = m.deletedForUserIds || [];
                    if (!currentDeletedFor.includes(targetUserId)) {
                      return { ...m, deletedForUserIds: [...currentDeletedFor, targetUserId] };
                    }
                  }
                  return m;
                }),
              },
            };
          } else {
            // Delete for everyone
            return {
              ...item,
              handoffDetails: {
                ...item.handoffDetails,
                messages: item.handoffDetails.messages.filter((m) => !idSet.has(m.id)),
              },
            };
          }
        }
        return item;
      })
    );
  };

  const editHandoffMessage = (itemId: string, messageId: string, newText: string) => {
    if (!newText.trim()) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.handoffDetails) {
          return {
            ...item,
            handoffDetails: {
              ...item.handoffDetails,
              messages: item.handoffDetails.messages.map((m) =>
                m.id === messageId ? { ...m, text: newText.trim(), edited: true } : m
              ),
            },
          };
        }
        return item;
      })
    );
  };

  const setHandoffCheckpoint = (itemId: string, checkpointId: string, timeSlot: string) => {
    const checkpoint = OFFICIAL_HANDOFF_CHECKPOINTS.find((c) => c.id === checkpointId);
    if (!checkpoint) return;
    const liveTime = getCurrentLiveTimeString();

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId && item.handoffDetails) {
          const updateNotice: HandoffMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderRole: 'system',
            senderMaskedName: 'Campus Relay',
            text: `Meetup checkpoint set to "${checkpoint.name}". Target time: ${timeSlot}. Security presence: ${checkpoint.securityPresence}.`,
            timestamp: liveTime,
          };

          return {
            ...item,
            handoffDetails: {
              ...item.handoffDetails,
              agreedCheckpointId: checkpoint.id,
              agreedCheckpointName: checkpoint.name,
              agreedTimeSlot: timeSlot,
              messages: [...item.handoffDetails.messages, updateNotice],
            },
          };
        }
        return item;
      })
    );
  };

  const markResolved = (itemId: string) => {
    const liveTime = getCurrentLiveDateTimeString();
    let targetItemTitle = '';
    let partnerStudentId = '';
    let partnerName = '';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          targetItemTitle = item.title;
          const isFinder = item.reporter.studentId === currentUser.id;
          const targetClaim =
            (item.approvedClaimId && item.claims.find((c) => c.id === item.approvedClaimId)) ||
            item.claims[0];

          if (isFinder && targetClaim) {
            partnerStudentId = targetClaim.claimantStudentId;
            partnerName = targetClaim.claimantNameMasked;
          } else {
            partnerStudentId = item.reporter.studentId;
            partnerName = item.reporter.fullName;
          }

          const completionNotice: HandoffMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'system',
            senderRole: 'system',
            senderMaskedName: 'Campus Relay',
            text: `Item successfully marked as RETURNED & RESOLVED by ${
              currentUser.name.split(' ')[0]
            }. Moved to campus archive.`,
            timestamp: getCurrentLiveTimeString(),
          };

          const existingMessages = item.handoffDetails?.messages || [];

          return {
            ...item,
            status: 'resolved',
            resolvedAt: liveTime,
            resolvedByRole: isFinder ? 'finder' : 'claimant',
            resolvedByStudentId: currentUser.id,
            handoffDetails: {
              ...item.handoffDetails!,
              messages: [...existingMessages, completionNotice],
              finderConfirmed: true,
              claimantConfirmed: true,
            },
          };
        }
        return item;
      })
    );

    if (partnerStudentId) {
      triggerNotification({
        recipientId: partnerStudentId,
        recipientName: partnerName,
        senderName: `${currentUser.name.split(' ')[0]}`,
        title: `Item Resolved & Returned: ${targetItemTitle}`,
        message: `Handoff complete! Item has been safely returned at campus security desk.`,
        itemId,
        itemTitle: targetItemTitle,
        type: 'item_resolved',
      });
    }
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_ITEMS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_NOTIFS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch {
      // silent
    }
    setItems(getFreshInitialItems());
    setCurrentUser(MOCK_STUDENTS[0]);
    setNotifications([
      {
        id: 'notif-init-1',
        recipientId: 'student_1', // Bhoomish Yadav
        recipientName: 'Bhoomish Yadav',
        senderName: 'Krishna Vishal (Claimant)',
        title: 'New Verification Answer on Casio fx-991EX',
        message: 'Krishna Vishal submitted an answer to your question. Chat is active!',
        timestamp: getCurrentLiveTimeString(),
        itemId: 'item-101',
        itemTitle: 'Casio fx-991EX ClassWiz Scientific Calculator',
        type: 'new_claim',
        read: false,
      },
    ]);
    setActiveToast(null);
  };

  // Compute counts for active user
  const pendingClaimsCountForMe = items.reduce((acc, item) => {
    if (item.reporter.studentId === currentUser.id && item.status !== 'resolved') {
      const pending = item.claims.filter((c) => c.status === 'pending').length;
      return acc + pending;
    }
    return acc;
  }, 0);

  const activeHandoffsCountForMe = items.reduce((acc, item) => {
    if (item.status === 'handoff_coordination') {
      const isMine =
        item.reporter.studentId === currentUser.id ||
        item.claims.some(
          (c) => c.claimantStudentId === currentUser.id && c.status === 'approved'
        );
      if (isMine) return acc + 1;
    }
    return acc;
  }, 0);

  const unreadNotificationsCount = notifications.filter(
    (n) => n.recipientId === currentUser.id && !n.read
  ).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allStudents,
        switchUser,
        updateCurrentUserProfile,
        items,
        activeFeed,
        setActiveFeed,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedVenueZone,
        setSelectedVenueZone,
        reportNewItem,
        submitClaim,
        approveClaim,
        rejectClaim,
        sendHandoffMessage,
        deleteHandoffMessage,
        deleteMultipleHandoffMessages,
        editHandoffMessage,
        setHandoffCheckpoint,
        markResolved,
        resetDemoData,
        notifications,
        activeToast,
        dismissToast,
        markNotificationAsRead,
        clearAllNotifications,
        unreadNotificationsCount,
        pendingClaimsCountForMe,
        activeHandoffsCountForMe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
