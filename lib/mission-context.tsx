'use client';

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { nanoid } from 'nanoid';
import type {
  ProcurementMission, ProcurementRequirement, DiscoveredSupplier,
  SearchActivity, DecisionPolicy, DecisionScore, MarketPriceRange,
  FirewallCheck, AuditEvent, SimulationScenario, EvidenceNode,
} from './types';

// Default policy
const DEFAULT_POLICY: DecisionPolicy = { cost: 30, delivery: 25, quality: 20, reliability: 15, risk: 10 };

// Mission state
const initialMission: ProcurementMission = {
  id: '',
  status: 'draft',
  createdAt: '',
  rawInput: '',
  requirement: null,
  searchActivities: [],
  discoveredSuppliers: [],
  marketRange: null,
  uploadedQuotations: [],
  evidence: [],
  decisionPolicy: DEFAULT_POLICY,
  decisionScores: [],
  selectedSupplierId: null,
  firewallChecks: [],
  riskSignals: [],
  simulations: [],
  approvedAt: null,
  approvedBy: null,
  auditLog: [],
  isLive: false,
  lastSearchAt: null,
};

type MissionAction =
  | { type: 'START_MISSION'; rawInput: string }
  | { type: 'SET_REQUIREMENT'; requirement: ProcurementRequirement }
  | { type: 'SET_SEARCHING' }
  | { type: 'ADD_SEARCH_ACTIVITY'; activity: SearchActivity }
  | { type: 'SET_SUPPLIERS'; suppliers: DiscoveredSupplier[]; activities: SearchActivity[] }
  | { type: 'SET_MARKET_RANGE'; marketRange: MarketPriceRange | null }
  | { type: 'SET_SCORES'; scores: DecisionScore[] }
  | { type: 'UPDATE_POLICY'; policy: DecisionPolicy }
  | { type: 'SELECT_SUPPLIER'; supplierId: string }
  | { type: 'SET_FIREWALL'; checks: FirewallCheck[] }
  | { type: 'ADD_SIMULATION'; simulation: SimulationScenario }
  | { type: 'ADD_EVIDENCE'; evidence: EvidenceNode[] }
  | { type: 'APPROVE'; approvedBy: string }
  | { type: 'ADD_AUDIT'; event: AuditEvent }
  | { type: 'SET_STATUS'; status: ProcurementMission['status'] }
  | { type: 'SET_LIVE'; isLive: boolean }
  | { type: 'RESET' };

function missionReducer(state: ProcurementMission, action: MissionAction): ProcurementMission {
  switch (action.type) {
    case 'START_MISSION':
      return {
        ...initialMission,
        id: `MISS-${new Date().getFullYear()}-${nanoid(4).toUpperCase()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        rawInput: action.rawInput,
        auditLog: [{ id: nanoid(6), timestamp: new Date().toISOString(), action: 'Mission Started', detail: action.rawInput, sourcesUsed: 0, dataLabel: 'user-input' }],
      };
    case 'SET_REQUIREMENT':
      return {
        ...state,
        requirement: action.requirement,
        auditLog: [...state.auditLog, { id: nanoid(6), timestamp: new Date().toISOString(), action: 'Requirement Compiled', detail: `${action.requirement.allConstraints.filter(c => c.source === 'explicit').length} explicit, ${action.requirement.allConstraints.filter(c => c.source === 'inferred').length} inferred fields`, sourcesUsed: 0, dataLabel: 'calculated' }],
      };
    case 'SET_SEARCHING':
      return { ...state, status: 'searching' };
    case 'ADD_SEARCH_ACTIVITY':
      return { ...state, searchActivities: [...state.searchActivities, action.activity] };
    case 'SET_SUPPLIERS':
      return {
        ...state,
        status: 'discovered',
        discoveredSuppliers: action.suppliers,
        searchActivities: action.activities,
        isLive: action.suppliers.length > 0,
        lastSearchAt: new Date().toISOString(),
        auditLog: [...state.auditLog, { id: nanoid(6), timestamp: new Date().toISOString(), action: 'Suppliers Discovered', detail: `${action.suppliers.length} supplier(s) from ${action.activities.length} search(es)`, sourcesUsed: action.activities.reduce((sum, a) => sum + a.resultsFound, 0), dataLabel: 'live-web' }],
      };
    case 'SET_MARKET_RANGE':
      return { ...state, marketRange: action.marketRange };
    case 'SET_SCORES':
      return {
        ...state,
        status: 'analyzing',
        decisionScores: action.scores,
        auditLog: [...state.auditLog, { id: nanoid(6), timestamp: new Date().toISOString(), action: 'Decision Scored', detail: `${action.scores.length} suppliers scored`, sourcesUsed: 0, dataLabel: 'calculated' }],
      };
    case 'UPDATE_POLICY':
      return { ...state, decisionPolicy: action.policy };
    case 'SELECT_SUPPLIER':
      return {
        ...state,
        status: 'decided',
        selectedSupplierId: action.supplierId,
        auditLog: [...state.auditLog, { id: nanoid(6), timestamp: new Date().toISOString(), action: 'Supplier Selected', detail: action.supplierId, sourcesUsed: 0, dataLabel: 'user-input' }],
      };
    case 'SET_FIREWALL':
      return { ...state, firewallChecks: action.checks };
    case 'ADD_SIMULATION':
      return { ...state, simulations: [...state.simulations, action.simulation] };
    case 'ADD_EVIDENCE':
      return { ...state, evidence: [...state.evidence, ...action.evidence] };
    case 'APPROVE':
      return {
        ...state,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: action.approvedBy,
        auditLog: [...state.auditLog, { id: nanoid(6), timestamp: new Date().toISOString(), action: 'Approved', detail: `By ${action.approvedBy}`, sourcesUsed: 0, dataLabel: 'user-input' }],
      };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SET_LIVE':
      return { ...state, isLive: action.isLive };
    case 'RESET':
      return initialMission;
    default:
      return state;
  }
}

interface MissionContextType {
  mission: ProcurementMission;
  dispatch: React.Dispatch<MissionAction>;
  // Convenience methods
  submitRequirement: (text: string) => Promise<void>;
  discoverSuppliers: (forceRefresh?: boolean) => Promise<void>;
  scoreSuppliers: () => Promise<void>;
  updatePolicy: (policy: DecisionPolicy) => Promise<void>;
  runFirewall: (supplierId: string) => Promise<void>;
  runSimulation: (type: string, params: Record<string, unknown>) => Promise<void>;
  approve: (approvedBy: string) => void;
  isLoading: boolean;
  error: string | null;
}

const MissionContext = createContext<MissionContextType | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [mission, dispatch] = useReducer(missionReducer, initialMission);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submitRequirement = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    dispatch({ type: 'START_MISSION', rawInput: text });

    try {
      const res = await fetch('/api/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Intent parsing failed');
      dispatch({ type: 'SET_REQUIREMENT', requirement: data.requirement });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse requirement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const discoverSuppliersAction = useCallback(async (forceRefresh = false) => {
    if (!mission.rawInput) return;
    setIsLoading(true);
    setError(null);
    dispatch({ type: 'SET_SEARCHING' });

    try {
      const res = await fetch('/api/suppliers/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementText: mission.rawInput,
          forceRefresh,
        }),
      });
      const data = await res.json();

      if (data.error === 'LIVE_INTELLIGENCE_OFFLINE') {
        dispatch({ type: 'SET_LIVE', isLive: false });
        setError(data.message);
        dispatch({ type: 'SET_SUPPLIERS', suppliers: [], activities: data.activities || [] });
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Discovery failed');

      dispatch({ type: 'SET_SUPPLIERS', suppliers: data.suppliers, activities: data.activities });
      if (data.marketRange) dispatch({ type: 'SET_MARKET_RANGE', marketRange: data.marketRange });
      if (data.requirement) dispatch({ type: 'SET_REQUIREMENT', requirement: data.requirement });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Discovery failed');
    } finally {
      setIsLoading(false);
    }
  }, [mission.rawInput]);

  const scoreSuppliers = useCallback(async () => {
    if (mission.discoveredSuppliers.length === 0) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/decision/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suppliers: mission.discoveredSuppliers,
          policy: mission.decisionPolicy,
          requirement: mission.requirement,
          marketRange: mission.marketRange,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      dispatch({ type: 'SET_SCORES', scores: data.scores });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setIsLoading(false);
    }
  }, [mission.discoveredSuppliers, mission.decisionPolicy, mission.requirement, mission.marketRange]);

  const updatePolicy = useCallback(async (policy: DecisionPolicy) => {
    dispatch({ type: 'UPDATE_POLICY', policy });
    // Re-score with new policy
    if (mission.discoveredSuppliers.length > 0 && mission.requirement) {
      try {
        const res = await fetch('/api/decision/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suppliers: mission.discoveredSuppliers,
            policy,
            requirement: mission.requirement,
            marketRange: mission.marketRange,
          }),
        });
        const data = await res.json();
        if (res.ok) dispatch({ type: 'SET_SCORES', scores: data.scores });
      } catch {}
    }
  }, [mission.discoveredSuppliers, mission.requirement, mission.marketRange]);

  const runFirewall = useCallback(async (supplierId: string) => {
    const supplier = mission.discoveredSuppliers.find(s => s.id === supplierId);
    const score = mission.decisionScores.find(s => s.supplierId === supplierId);
    if (!supplier || !score || !mission.requirement) return;

    try {
      const res = await fetch('/api/firewall/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier, requirement: mission.requirement, score, marketRange: mission.marketRange }),
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: 'SET_FIREWALL', checks: data.checks });
    } catch {}
  }, [mission.discoveredSuppliers, mission.decisionScores, mission.requirement, mission.marketRange]);

  const runSimulation = useCallback(async (type: string, params: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/decision/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          suppliers: mission.discoveredSuppliers,
          policy: mission.decisionPolicy,
          requirement: mission.requirement,
          baselineScores: mission.decisionScores,
          ...params,
        }),
      });
      const data = await res.json();
      if (res.ok) dispatch({ type: 'ADD_SIMULATION', simulation: data.scenario });
    } catch {}
  }, [mission.discoveredSuppliers, mission.decisionPolicy, mission.requirement, mission.decisionScores]);

  const approve = useCallback((approvedBy: string) => {
    dispatch({ type: 'APPROVE', approvedBy });
  }, []);

  return (
    <MissionContext.Provider value={{
      mission, dispatch,
      submitRequirement,
      discoverSuppliers: discoverSuppliersAction,
      scoreSuppliers,
      updatePolicy,
      runFirewall,
      runSimulation,
      approve,
      isLoading,
      error,
    }}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMission must be used within MissionProvider');
  return ctx;
}
