export type ItemType = 'lost' | 'found';

export type ItemStatus = 'open' | 'claim_pending' | 'handoff_coordination' | 'resolved';

export type CategoryTag =
  | 'ID Cards'
  | 'Room Keys'
  | 'Calculators'
  | 'Lab Equipment'
  | 'Earphones'
  | 'Wallets'
  | 'Backpacks & Bags'
  | 'Other Gadgets';

export type VenueZone =
  | 'Academic Blocks'
  | "Men's Hostel Blocks"
  | "Ladies' Hostel Blocks"
  | 'Food Courts'
  | 'Central Library'
  | 'Sports Complex';

export interface CampusVenue {
  id: string;
  name: string;
  zone: VenueZone;
  code: string;
  landmarkDetails?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  regNumber: string; // e.g. "21BCE1429"
  email: string; // e.g. "rohan.sharma2021@vitstudent.ac.in"
  phone: string; // e.g. "+91 98765 43210"
  block: string; // e.g. "MH-K 412" or "Day Scholar"
  role: 'student';
}

export interface ClaimVerification {
  id: string;
  itemId: string;
  claimantStudentId: string;
  claimantNameMasked: string; // e.g. "Student (23BCS****)"
  claimantRegMasked: string;
  challengeAnswer: string;
  additionalProofNote?: string;
  proofImageUrl?: string; // photo proof of ownership (bill, invoice, wallpaper, previous photo)
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
}

export interface HandoffMessage {
  id: string;
  senderId: string; // studentId
  senderRole: 'finder' | 'claimant' | 'system';
  senderMaskedName: string;
  text: string;
  imageUrl?: string; // photo sent in chat
  audioUrl?: string; // voice message audio data URL
  audioDuration?: number; // duration in seconds
  edited?: boolean; // whether message was edited
  deletedForUserIds?: string[]; // IDs of users who deleted this message for themselves
  timestamp: string;
}

export interface HandoffDetails {
  agreedCheckpointId?: string;
  agreedCheckpointName?: string;
  agreedTimeSlot?: string;
  messages: HandoffMessage[];
  finderConfirmed?: boolean;
  claimantConfirmed?: boolean;
}

export interface LostFoundItem {
  id: string;
  type: ItemType; // 'lost' or 'found'
  title: string;
  category: CategoryTag;
  venueZone: VenueZone;
  venueCode: string; // e.g. "SJT", "MH-K", "Gazebo"
  specificLocation: string; // e.g. "SJT 4th floor lab hallway, near water cooler"
  dateTime: string; // e.g. "2026-10-07 14:30"
  description: string;
  imageUrl?: string; // photo of the item (from camera or gallery)
  status: ItemStatus;

  // Custom ownership verification challenge created by reporter/finder
  verificationChallenge: {
    question: string; // e.g. "What name is printed on the ID card and what is the school code?"
    hint?: string;
  };

  // Reporter / Finder identity (PROTECTED - MUST BE MASKED IN PUBLIC VIEWS)
  reporter: {
    studentId: string;
    fullName: string;
    regNumber: string; // "21BCE1042"
    email: string; // "aarav.sharma2021@vitstudent.ac.in"
    phone: string; // "+91 98765 43210"
  };

  claims: ClaimVerification[];
  approvedClaimId?: string;
  handoffDetails?: HandoffDetails;

  resolvedAt?: string;
  resolvedByRole?: 'finder' | 'claimant';
  resolvedByStudentId?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  recipientName: string;
  senderName: string;
  title: string;
  message: string;
  timestamp: string;
  itemId: string;
  itemTitle: string;
  type: 'new_claim' | 'chat_message' | 'claim_approved' | 'claim_rejected' | 'handoff_update' | 'item_resolved';
  read: boolean;
}
