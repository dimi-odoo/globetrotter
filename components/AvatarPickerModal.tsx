'use client';

import Image from 'next/image';
import { useEffect } from 'react';

type Avatar = {
  id: string | number;
  name: string;
  url: string;
};

type AvatarPickerModalProps = {
  isOpen: boolean;
  avatars: Avatar[];
  selectedUrl?: string;
  onClose: () => void;
  onSelect: (url: string) => void;
};
#this line is the for the testing by the dimi 222
export default function AvatarPickerModal({
  isOpen,
  avatars,
  selectedUrl,
  onClose,
  onSelect,
}: AvatarPickerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Choose an avatar</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close avatar picker"
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-black"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {avatars.map((avatar) => {
            const isSelected = selectedUrl === avatar.url;
            return (
              <button
                key={avatar.id}
                type="button"
                onClick={() => onSelect(avatar.url)}
                className={`relative h-16 w-16 rounded-full overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                }`}
                title={avatar.name}
              >
                <Image src={avatar.url} alt={avatar.name} fill className="object-cover" />
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
