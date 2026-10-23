import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Receipt,
  Target,
  TrendingUp,
  SlidersHorizontal,
  LogOut,
  Menu,
  X,
  Compass,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export default function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Financial Profile', icon: UserCheck },
    { to: '/transactions', label: 'Transactions', icon: Receipt },
    { to: '/goals', label: 'Financial Goals', icon: Target },
    { to: '/investments', label: 'Investments', icon: TrendingUp },
    { to: '/simulate', label: 'Decision Simulator', icon: SlidersHorizontal }
  ];

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
      isActive
        ? 'bg-[#ECFDF5] text-[#087F5B] border border-[#A7F3D0] font-bold shadow-xs'
        : 'text-[#64736A] hover:text-[#14251C] hover:bg-[#F4F8F5] font-semibold border border-transparent'
    }`;

  return (
    <div className="min-h-screen flex bg-[#F4F8F5] text-[#17251D] font-sans antialiased">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-[#E0E8E2] bg-white p-4 justify-between fixed inset-y-0 left-0 z-30 shadow-xs">
        <div className="space-y-6">
          {/* Logo & Brand */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[#087F5B] flex items-center justify-center text-white font-black shadow-md shadow-[#087F5B]/25">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#14251C] tracking-tight">MoneyPilot</span>
              <span className="text-[10px] text-[#087F5B] font-bold block uppercase tracking-wider -mt-0.5">
                Decision Intelligence
              </span>
            </div>
          </NavLink>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={getNavLinkClass}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Account / Footer */}
        {isAuthenticated && user && (
          <div className="pt-4 border-t border-[#E0E8E2] space-y-3">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#087F5B] font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#14251C] truncate">{user.name || 'User'}</p>
                <p className="text-[10px] text-[#64736A] truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold rounded-xl border border-[#E0E8E2] hover:border-[#FECACA] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Header & Slide-over Menu */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white/90 border-b border-[#E0E8E2] backdrop-blur-md px-4 h-16 flex items-center justify-between">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#087F5B] flex items-center justify-center text-white font-black shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-[#14251C] tracking-tight">MoneyPilot</span>
        </NavLink>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[#FAFCFA] text-[#64736A] hover:text-[#14251C] border border-[#E0E8E2]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-64 bg-white border-r border-[#E0E8E2] p-5 flex flex-col justify-between h-full shadow-2xl animate-slideIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#087F5B] flex items-center justify-center text-white font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-[#14251C] text-base">MoneyPilot</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-[#859188] hover:text-[#17251D] p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={getNavLinkClass}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {isAuthenticated && user && (
              <div className="pt-4 border-t border-[#E0E8E2] space-y-3">
                <div className="px-2">
                  <p className="text-xs font-bold text-[#14251C] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#64736A] truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold rounded-xl border border-[#E0E8E2] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Page Body Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="hidden lg:flex h-16 border-b border-[#E0E8E2] bg-white/80 backdrop-blur-md px-8 items-center justify-between sticky top-0 z-20">
          <div className="text-xs text-[#64736A] font-medium">
            Financial Decision Intelligence — <span className="text-[#14251C] font-semibold italic">"AI can suggest. The system checks. The user decides."</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
            <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-pulse"></span>
            <span className="text-xs text-[#087F5B] font-bold">Engine Connected</span>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto mt-16 lg:mt-0">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#E0E8E2] py-5 text-center text-xs text-[#859188] bg-white">
          MoneyPilot &copy; 2026 — AI-Powered Financial Decision Intelligence Platform
        </footer>
      </div>
    </div>
  );
}
