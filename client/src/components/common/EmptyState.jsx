import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function EmptyState({ icon: Icon = FolderOpen, title, description, actionText, onAction }) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-[#E0E8E2] rounded-2xl bg-white shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto mb-3 text-[#087F5B] shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[#14251C] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#64736A] max-w-sm mx-auto mb-5 leading-relaxed">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
