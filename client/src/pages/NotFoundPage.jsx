import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]/60 flex items-center justify-center text-[#087F5B] mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-[#087F5B] tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-[#14251C] mb-2">Page Not Found</h2>
      <p className="text-[#64736A] text-sm max-w-sm mb-6">The requested route does not exist or has been relocated.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-[#087F5B] hover:bg-[#066649] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
