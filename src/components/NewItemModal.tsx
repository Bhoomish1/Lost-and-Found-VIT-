import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ItemType,
  CategoryTag,
  VenueZone,
} from '../types';
import {
  OFFICIAL_CATEGORIES,
  VENUE_ZONES,
  ACADEMIC_BLOCKS,
  MENS_HOSTEL_BLOCKS,
  LADIES_HOSTEL_BLOCKS,
  FOOD_COURTS,
  CENTRAL_LIBRARY_VENUES,
  SPORTS_COMPLEX_VENUES,
} from '../data/vitVenues';
import { maskRegNumber } from '../utils/masking';
import {
  X,
  PlusCircle,
  HelpCircle,
  Lock,
  Building2,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { CameraModal } from './CameraModal';

interface NewItemModalProps {
  initialType?: ItemType;
  onClose: () => void;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  initialType = 'found',
  onClose,
}) => {
  const { currentUser, reportNewItem, setActiveFeed } = useApp();

  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryTag>('ID Cards');
  const [venueZone, setVenueZone] = useState<VenueZone>('Academic Blocks');
  const [venueCode, setVenueCode] = useState('SJT');
  const [specificLocation, setSpecificLocation] = useState('');
  const [dateTime, setDateTime] = useState('Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [challengeQuestion, setChallengeQuestion] = useState('');
  const [challengeHint, setChallengeHint] = useState('');
  const [error, setError] = useState('');

  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setImageUrl(result);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoneChange = (zone: VenueZone) => {
    setVenueZone(zone);
    if (zone === 'Academic Blocks') setVenueCode(ACADEMIC_BLOCKS[0].code);
    else if (zone === "Men's Hostel Blocks") setVenueCode(MENS_HOSTEL_BLOCKS[0].code);
    else if (zone === "Ladies' Hostel Blocks") setVenueCode(LADIES_HOSTEL_BLOCKS[0].code);
    else if (zone === 'Food Courts') setVenueCode(FOOD_COURTS[0].code);
    else if (zone === 'Central Library') setVenueCode(CENTRAL_LIBRARY_VENUES[0].code);
    else if (zone === 'Sports Complex') setVenueCode(SPORTS_COMPLEX_VENUES[0].code);
  };

  const getVenueOptionsForZone = () => {
    switch (venueZone) {
      case 'Academic Blocks':
        return ACADEMIC_BLOCKS;
      case "Men's Hostel Blocks":
        return MENS_HOSTEL_BLOCKS;
      case "Ladies' Hostel Blocks":
        return LADIES_HOSTEL_BLOCKS;
      case 'Food Courts':
        return FOOD_COURTS;
      case 'Central Library':
        return CENTRAL_LIBRARY_VENUES;
      case 'Sports Complex':
        return SPORTS_COMPLEX_VENUES;
      default:
        return ACADEMIC_BLOCKS;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an item title.');
      return;
    }
    if (!specificLocation.trim()) {
      setError('Please provide a specific room or floor spot.');
      return;
    }
    if (!challengeQuestion.trim()) {
      setError('Please set a secret question for ownership verification.');
      return;
    }

    reportNewItem({
      type,
      title: title.trim(),
      category,
      venueZone,
      venueCode,
      specificLocation: specificLocation.trim(),
      dateTime: dateTime.trim(),
      description: description.trim() || 'Reported on VIT campus meridian portal.',
      imageUrl: imageUrl || undefined,
      verificationChallenge: {
        question: challengeQuestion.trim(),
        hint: challengeHint.trim() || undefined,
      },
    });

    setActiveFeed(type === 'found' ? 'found' : 'lost');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#dadce0] w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1b1e]">Report an Item</h2>
              <p className="text-xs text-[#5f6368]">Quick & private campus posting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Item Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#efedf1] rounded-lg">
            <button
              type="button"
              onClick={() => setType('found')}
              className={`py-2 text-xs font-bold rounded-md transition-colors ${
                type === 'found'
                  ? 'bg-white text-[#006e2c] shadow-xs'
                  : 'text-[#414754] hover:text-[#1a1b1e]'
              }`}
            >
              I Found an Item
            </button>
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`py-2 text-xs font-bold rounded-md transition-colors ${
                type === 'lost'
                  ? 'bg-white text-[#b81d17] shadow-xs'
                  : 'text-[#414754] hover:text-[#1a1b1e]'
              }`}
            >
              I Lost an Item
            </button>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1a1b1e] mb-1">
                Item Title <span className="text-[#ea4335]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio fx-991EX Calculator"
                className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1a1b1e] mb-1">
                Category <span className="text-[#ea4335]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryTag)}
                className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8] bg-white font-medium"
              >
                {OFFICIAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="p-3.5 bg-[#faf9fd] border border-[#dadce0] rounded-xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a1b1e]">
              <Building2 className="w-4 h-4 text-[#1a73e8]" />
              <span>Campus Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#5f6368] mb-1">Area</label>
                <select
                  value={venueZone}
                  onChange={(e) => handleZoneChange(e.target.value as VenueZone)}
                  className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg bg-white"
                >
                  {VENUE_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5f6368] mb-1">Building</label>
                <select
                  value={venueCode}
                  onChange={(e) => setVenueCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg bg-white"
                >
                  {getVenueOptionsForZone().map((ven) => (
                    <option key={ven.id} value={ven.code}>
                      {ven.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#5f6368] mb-1">
                Exact Spot or Classroom <span className="text-[#ea4335]">*</span>
              </label>
              <input
                type="text"
                required
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="e.g. 4th floor classroom 412, left corner bench"
                className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#1a1b1e] mb-1">Short Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Clean condition, found right after class"
              className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
            />
          </div>

          {/* Photo Upload: Gallery or Camera */}
          <div className="p-3.5 bg-[#faf9fd] border border-[#dadce0] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1a1b1e] flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1a73e8]" />
                <span>Upload Item Photo</span>
                <span className="text-[10px] font-normal text-[#5f6368]">(Recommended)</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] font-semibold text-[#ba1a1a] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#5f6368] leading-relaxed">
              Attach a clear picture of the {type === 'found' ? 'found' : 'lost'} item. You can import from your device gallery or capture live with your camera.
            </p>

            {imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-[#dadce0] bg-black/5 max-h-48 flex items-center justify-center group">
                <img
                  src={imageUrl}
                  alt="Item preview"
                  className="w-full h-44 object-cover sm:object-contain rounded-lg"
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
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-3 rounded-lg border-2 border-dashed border-[#dadce0] hover:border-[#1a73e8] bg-white hover:bg-[#e8f0fe]/30 text-xs font-semibold text-[#414754] hover:text-[#1a73e8] transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#1a73e8]" />
                  <span>Upload from Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex flex-col sm:flex-row items-center justify-center gap-1.5 p-3 rounded-lg border-2 border-dashed border-[#dadce0] hover:border-[#006e2c] bg-white hover:bg-[#e6f4ea]/30 text-xs font-semibold text-[#414754] hover:text-[#006e2c] transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#006e2c]" />
                  <span>Access Camera</span>
                </button>
              </div>
            )}

            {/* Hidden file input for gallery */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryFileSelect}
              className="hidden"
            />
          </div>

          {/* Secret Question */}
          <div className="p-3.5 bg-[#e8f0fe]/70 border border-[#c1c6d6] rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1a73e8]">
              <HelpCircle className="w-4 h-4" />
              <span>Secret Question to Verify the Owner</span>
            </div>
            <p className="text-[11px] text-[#5f6368]">
              Ask something only the owner knows so nobody else can take it.
            </p>

            <div>
              <input
                type="text"
                required
                value={challengeQuestion}
                onChange={(e) => setChallengeQuestion(e.target.value)}
                placeholder="e.g. What formula or name is written on the cover / keychain?"
                className="w-full px-3 py-2 text-xs border border-[#dadce0] rounded-lg bg-white"
              />
            </div>

            <div>
              <input
                type="text"
                value={challengeHint}
                onChange={(e) => setChallengeHint(e.target.value)}
                placeholder="Optional public hint (e.g. Check under the plastic slide)"
                className="w-full px-3 py-1.5 text-xs border border-[#dadce0] rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Privacy note */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#5f6368]">
            <Lock className="w-3.5 h-3.5 text-[#34a853] shrink-0" />
            <span>
              Your registration number (<span className="font-mono">{maskRegNumber(currentUser.regNumber)}</span>)
              and phone number stay masked from the public.
            </span>
          </div>

          {error && (
            <div className="p-2.5 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#dadce0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#414754] hover:bg-[#f1f3f4] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg shadow-sm"
            >
              Publish Item
            </button>
          </div>
        </form>
      </div>

      {/* In-Browser Live Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(capturedDataUrl) => {
          setImageUrl(capturedDataUrl);
          setError('');
        }}
        title={`Take Photo of ${type === 'found' ? 'Found' : 'Lost'} Item`}
      />
    </div>
  );
};
