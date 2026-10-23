import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Delete', onConfirm, onCancel, isDestructive = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E0E8E2] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]' : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#14251C]">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-[#859188] hover:text-[#17251D] p-1 rounded-lg hover:bg-[#F4F8F5] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#64736A] leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E8E2]">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white hover:bg-[#F4F8F5] text-[#64736A] hover:text-[#17251D] text-sm font-semibold rounded-xl border border-[#E0E8E2] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-white text-sm font-bold rounded-xl transition-all shadow-sm ${
              isDestructive ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#087F5B] hover:bg-[#066649]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
