import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentProfile } from '../types';
import { X, Check, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { maskRegNumber, maskEmail, maskPhone } from '../utils/masking';

interface UserSwitcherModalProps {
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({ onClose }) => {
  const { currentUser, allStudents, switchUser, updateCurrentUserProfile } = useApp();

  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customName, setCustomName] = useState(currentUser.name);
  const [customReg, setCustomReg] = useState(currentUser.regNumber);
  const [customEmail, setCustomEmail] = useState(currentUser.email);
  const [customPhone, setCustomPhone] = useState(currentUser.phone);
  const [customBlock, setCustomBlock] = useState(currentUser.block);

  const handleSelectStudent = (studentId: string) => {
    switchUser(studentId);
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customReg.trim()) return;
    updateCurrentUserProfile({
      name: customName.trim(),
      regNumber: customReg.trim().toUpperCase(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '')}@vitstudent.ac.in`,
      phone: customPhone.trim() || '+91 99999 00000',
      block: customBlock.trim() || 'Day Scholar',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-[#dadce0] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#dadce0] flex items-center justify-between bg-[#f8f9fa]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a1b1e]">VIT Student Profile Switcher</h2>
              <p className="text-xs text-[#5f6368]">Select your student account to post, claim, or chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#1a1b1e] rounded-md hover:bg-[#efedf1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Privacy Guarantee Banner */}
          <div className="p-3.5 bg-[#e8f0fe]/60 border border-[#c1c6d6] rounded-lg text-xs space-y-1">
            <div className="font-semibold text-[#1a73e8] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Student Privacy Guard Active
            </div>
            <p className="text-[#3c4043] leading-relaxed">
              When you post or claim items, your Registration Number is masked (e.g.{' '}
              <span className="font-mono font-medium">{maskRegNumber(currentUser.regNumber)}</span>), and your direct
              email & phone are protected from public view to eliminate unsolicited calls and spam.
            </p>
          </div>

          {!isEditingCustom ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#5f6368]">SWITCH ACTIVE STUDENT IDENTITY</span>
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(true)}
                  className="text-xs text-[#1a73e8] hover:underline font-medium"
                >
                  Customize Credentials
                </button>
              </div>

              <div className="space-y-2">
                {allStudents.map((student) => {
                  const isCurrent = student.id === currentUser.id;
                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSelectStudent(student.id)}
                      className={`w-full p-3.5 rounded-lg border text-left transition-all flex items-start justify-between ${
                        isCurrent
                          ? 'border-[#1a73e8] bg-[#f1f6fd] ring-1 ring-[#1a73e8]'
                          : 'border-[#dadce0] hover:border-[#1a73e8]/50 hover:bg-[#faf9fd]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1a1b1e]">{student.name}</span>
                          <span className="font-mono text-xs px-1.5 py-0.5 bg-white border border-[#dadce0] rounded text-[#414754]">
                            {student.regNumber}
                          </span>
                        </div>
                        <div className="text-xs text-[#5f6368] space-x-2">
                          <span>{student.block}</span>
                          <span>·</span>
                          <span className="font-mono text-[11px]">{maskEmail(student.email)}</span>
                        </div>
                        <div className="text-[11px] text-[#727785]">
                          Public view:{' '}
                          <span className="font-medium text-[#1a1b1e]">
                            {student.name.split(' ')[0]} ({maskRegNumber(student.regNumber)})
                          </span>
                        </div>
                      </div>

                      <div className="pt-0.5">
                        {isCurrent ? (
                          <span className="w-5 h-5 rounded-full bg-[#1a73e8] text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-xs text-[#1a73e8] font-medium">Select</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#dadce0]">
                <span className="text-xs font-semibold text-[#1a1b1e]">CUSTOM STUDENT CREDENTIALS</span>
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(false)}
                  className="text-xs text-[#5f6368] hover:text-[#1a1b1e]"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#414754] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
                  placeholder="e.g. Siddharth Rao"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#414754] mb-1">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={customReg}
                    onChange={(e) => setCustomReg(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono uppercase border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
                    placeholder="22BCE0000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#414754] mb-1">Hostel Block / Day Scholar</label>
                  <input
                    type="text"
                    value={customBlock}
                    onChange={(e) => setCustomBlock(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
                    placeholder="e.g. MH-D 315"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#414754] mb-1">Official Student Email</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
                  placeholder="name2022@vitstudent.ac.in"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#414754] mb-1">Phone Number (Private)</label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#dadce0] rounded-lg focus:outline-none focus:border-[#1a73e8]"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCustom(false)}
                  className="px-3 py-2 text-xs font-medium text-[#414754] hover:bg-[#f1f3f4] rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-lg shadow-sm"
                >
                  Save Active Session
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between text-xs text-[#5f6368]">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#34a853]" />
            <span>Active: {currentUser.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-[#414754] hover:bg-[#efedf1] rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
