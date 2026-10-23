import React, { useState } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import api from '../services/api.js';
import SimulationForm from '../components/simulator/SimulationForm.jsx';
import BeforeAfterComparison from '../components/simulator/BeforeAfterComparison.jsx';
import AISimulationExplanationPanel from '../components/simulator/AISimulationExplanationPanel.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function SimulatorPage() {
  const [simulationResult, setSimulationResult] = useState(null);
  const [currentDecision, setCurrentDecision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunSimulation = async (decision) => {
    setLoading(true);
    setError(null);
    setCurrentDecision(decision);

    try {
      const response = await api.simulations.run(decision);
      if (response?.data) {
        setSimulationResult(response.data);
      }
    } catch (err) {
      console.error('[Simulator] Failed to execute simulation:', err);
      setError(err.message || 'Error executing financial simulation.');
      setSimulationResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-6 h-6 text-[#087F5B]" />
          <h1 className="text-2xl font-bold text-[#14251C] tracking-tight">Financial Decision Simulator</h1>
        </div>
        <p className="text-xs text-[#64736A] mt-1">
          Simulate choices before you make them — Forecast cash flow shifts, emergency buffer changes, and health score deltas.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Decision Configuration Form */}
      <SimulationForm onRunSimulation={handleRunSimulation} loading={loading} />

      {/* Results Section */}
      {simulationResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Deterministic Before vs After Consequence Matrix */}
          <BeforeAfterComparison simulationResult={simulationResult} />

          {/* AI Decision Explanation Layer */}
          <AISimulationExplanationPanel decision={currentDecision} />
        </div>
      )}
    </div>
  );
}
