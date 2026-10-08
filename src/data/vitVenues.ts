import { CategoryTag, CampusVenue, VenueZone } from '../types';

export const OFFICIAL_CATEGORIES: CategoryTag[] = [
  'ID Cards',
  'Room Keys',
  'Calculators',
  'Lab Equipment',
  'Earphones',
  'Wallets',
  'Backpacks & Bags',
  'Other Gadgets',
];

export const VENUE_ZONES: VenueZone[] = [
  'Academic Blocks',
  "Men's Hostel Blocks",
  "Ladies' Hostel Blocks",
  'Food Courts',
  'Central Library',
  'Sports Complex',
];

// Academic Blocks: SJT, TT, PRP, SMV, MB, GDN, CDMM
export const ACADEMIC_BLOCKS: CampusVenue[] = [
  { id: 'sjt', code: 'SJT', name: 'Silver Jubilee Tower (SJT)', zone: 'Academic Blocks', landmarkDetails: 'Floors 1-8, CSE & IT labs, Main Reception' },
  { id: 'tt', code: 'TT', name: 'Technology Tower (TT)', zone: 'Academic Blocks', landmarkDetails: 'Floors 1-7, Amphitheatre, Academic Offices' },
  { id: 'prp', code: 'PRP', name: 'Periyar EVR Central Block (PRP)', zone: 'Academic Blocks', landmarkDetails: 'ECE & EEE Labs, Smart Classrooms' },
  { id: 'smv', code: 'SMV', name: 'Sir M. Visvesvaraya Block (SMV)', zone: 'Academic Blocks', landmarkDetails: 'Mechanical & Civil Engineering Blocks' },
  { id: 'mb', code: 'MB', name: 'Main Building (MB)', zone: 'Academic Blocks', landmarkDetails: 'Administrative offices, Registrar, Auditorium' },
  { id: 'gdn', code: 'GDN', name: 'G.D. Naidu Block (GDN)', zone: 'Academic Blocks', landmarkDetails: 'Biotech Labs, Chemistry, Physics Research' },
  { id: 'cdmm', code: 'CDMM', name: 'CDMM Block', zone: 'Academic Blocks', landmarkDetails: 'Centre for Disaster Mitigation & Management' },
];

// Men's Hostel Blocks: MH-A through MH-T
// MH-A, MH-B, MH-C, MH-D, MH-E, MH-F, MH-G, MH-H, MH-J, MH-K, MH-L, MH-M, MH-N, MH-P, MH-Q, MH-R, MH-S, MH-T
const MENS_BLOCK_CODES = [
  'MH-A', 'MH-B', 'MH-C', 'MH-D', 'MH-E', 'MH-F', 'MH-G', 'MH-H',
  'MH-J', 'MH-K', 'MH-L', 'MH-M', 'MH-N', 'MH-P', 'MH-Q', 'MH-R',
  'MH-S', 'MH-T'
];

export const MENS_HOSTEL_BLOCKS: CampusVenue[] = MENS_BLOCK_CODES.map((code) => ({
  id: code.toLowerCase(),
  code,
  name: `Men's Hostel Block ${code.replace('MH-', '')} (${code})`,
  zone: "Men's Hostel Blocks",
  landmarkDetails: `${code} Quadrangle, Mess Ground, Common Hall`,
}));

// Ladies' Hostel Blocks: LH-A through LH-J
// LH-A, LH-B, LH-C, LH-D, LH-E, LH-F, LH-G, LH-H, LH-I, LH-J
const LADIES_BLOCK_CODES = [
  'LH-A', 'LH-B', 'LH-C', 'LH-D', 'LH-E', 'LH-F', 'LH-G', 'LH-H', 'LH-I', 'LH-J'
];

export const LADIES_HOSTEL_BLOCKS: CampusVenue[] = LADIES_BLOCK_CODES.map((code) => ({
  id: code.toLowerCase(),
  code,
  name: `Ladies' Hostel Block ${code.replace('LH-', '')} (${code})`,
  zone: "Ladies' Hostel Blocks",
  landmarkDetails: `${code} Courtyard, Reading Room, Security Foyer`,
}));

// Food Courts: Gazebo, Food Mall, DC
export const FOOD_COURTS: CampusVenue[] = [
  { id: 'gazebo', code: 'Gazebo', name: 'Gazebo Food Court', zone: 'Food Courts', landmarkDetails: 'Near TT / Central Library lawn, Nescafe Kiosk' },
  { id: 'food_mall', code: 'Food Mall', name: 'Food Mall (Near MH)', zone: 'Food Courts', landmarkDetails: 'Ground & 1st Floor Fast Food Stalls' },
  { id: 'dc', code: 'DC', name: 'DC Food Court (Darling Court)', zone: 'Food Courts', landmarkDetails: 'Behind SJT / Hexagon Court' },
];

// Central Library
export const CENTRAL_LIBRARY_VENUES: CampusVenue[] = [
  { id: 'central_lib', code: 'Central Library', name: 'Central Library (All Levels)', zone: 'Central Library', landmarkDetails: 'Ground Floor Circulation, 1st & 2nd Floor Reading Halls, Digital Library' },
];

// Sports Complex
export const SPORTS_COMPLEX_VENUES: CampusVenue[] = [
  { id: 'sports_complex', code: 'Sports Complex', name: 'VIT Sports Complex & Grounds', zone: 'Sports Complex', landmarkDetails: 'Indoor Badminton Stadium, Basketball Courts, Swimming Complex, Track' },
];

export const ALL_CAMPUS_VENUES: CampusVenue[] = [
  ...ACADEMIC_BLOCKS,
  ...MENS_HOSTEL_BLOCKS,
  ...LADIES_HOSTEL_BLOCKS,
  ...FOOD_COURTS,
  ...CENTRAL_LIBRARY_VENUES,
  ...SPORTS_COMPLEX_VENUES,
];

// Official safe meetup checkpoints for In-App Handoff Coordination
export interface MeetupCheckpoint {
  id: string;
  name: string;
  locationDescription: string;
  securityPresence: string;
  recommendedHours: string;
}

export const OFFICIAL_HANDOFF_CHECKPOINTS: MeetupCheckpoint[] = [
  {
    id: 'sjt_reception',
    name: 'SJT Ground Floor Reception Desk',
    locationDescription: 'Main entrance security guard cabin & inquiry counter, Silver Jubilee Tower',
    securityPresence: '24/7 VIT Security Officers on Duty',
    recommendedHours: '08:30 AM – 08:00 PM',
  },
  {
    id: 'library_security',
    name: 'Central Library Security Desk',
    locationDescription: 'Main turnstile bag check counter, Central Library entrance',
    securityPresence: 'Active Library Marshals and CCTV monitored',
    recommendedHours: '09:00 AM – 09:30 PM',
  },
  {
    id: 'tt_entrance',
    name: 'TT Main Entrance Security',
    locationDescription: 'Portico entrance near Technology Tower clock tower',
    securityPresence: 'Security post with campus surveillance',
    recommendedHours: '08:30 AM – 07:30 PM',
  },
  {
    id: 'gazebo_kiosk',
    name: 'Gazebo Nescafe Point',
    locationDescription: 'Open-air high-visibility benches near Gazebo center',
    securityPresence: 'High pedestrian student traffic & campus patrol',
    recommendedHours: '09:00 AM – 08:30 PM',
  },
  {
    id: 'mh_warden_office',
    name: "Men's Hostel Central Warden Office",
    locationDescription: 'D-Annex / Central Hostel Office Reception Desk',
    securityPresence: 'Hostel Wardens & Official Residential Staff',
    recommendedHours: '09:00 AM – 09:00 PM',
  },
  {
    id: 'lh_main_gate',
    name: "Ladies' Hostel Main Gate Security Desk",
    locationDescription: 'LH Main Arch Entrance Checkpoint',
    securityPresence: 'Female Security Personnel & Gate Registry Desk',
    recommendedHours: '08:30 AM – 08:30 PM',
  },
  {
    id: 'sports_helpdesk',
    name: 'Sports Complex Helpdesk & Reception',
    locationDescription: 'Indoor Stadium Main Lobby entrance',
    securityPresence: 'Sports Directorate staff on duty',
    recommendedHours: '06:00 AM – 08:30 PM',
  },
];
