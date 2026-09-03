import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import TransactionsPage from '../pages/TransactionsPage.jsx';
import GoalsPage from '../pages/GoalsPage.jsx';
import InvestmentsPage from '../pages/InvestmentsPage.jsx';
import SimulatorPage from '../pages/SimulatorPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Main Layout Shell */}
      <Route element={<MainLayout />}>
        {/* Landing Page */}
        <Route path="/" element={<HomePage />} />

        {/* Protected Dashboard & Intelligence Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/simulate" element={<SimulatorPage />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
