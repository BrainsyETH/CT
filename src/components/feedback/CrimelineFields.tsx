"use client";

import { CRIMELINE_TYPES, OUTCOME_STATUSES } from "@/lib/constants";

interface CrimelineFieldsProps {
  crimelineType: string;
  fundsLost: string;
  status: string;
  rootCause: string;
  aftermath: string;
  onTypeChange: (value: string) => void;
  onFundsLostChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRootCauseChange: (value: string) => void;
  onAftermathChange: (value: string) => void;
  inputClassName: string;
  labelClassName: string;
  isCrimeline: boolean;
}

export function CrimelineFields({
  crimelineType,
  fundsLost,
  status,
  rootCause,
  aftermath,
  onTypeChange,
  onFundsLostChange,
  onStatusChange,
  onRootCauseChange,
  onAftermathChange,
  inputClassName,
  labelClassName,
  isCrimeline,
}: CrimelineFieldsProps) {
  return (
    <div
      className={`p-4 rounded-lg ${
        isCrimeline
          ? "bg-purple-950/30 border border-purple-900/40"
          : "bg-red-50 border border-red-200"
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-3 ${
          isCrimeline ? "text-purple-400" : "text-red-700"
        }`}
      >
        Crimeline Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="crimelineType" className={labelClassName}>
            Incident Type
          </label>
          <select
            id="crimelineType"
            value={crimelineType}
            onChange={(e) => onTypeChange(e.target.value)}
            className={inputClassName}
          >
            <option value="">Select type...</option>
            {CRIMELINE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="crimelineFundsLost" className={labelClassName}>
            Funds Lost (USD)
          </label>
          <input
            type="text"
            id="crimelineFundsLost"
            value={fundsLost}
            onChange={(e) => onFundsLostChange(e.target.value)}
            placeholder="e.g., 100000000"
            className={inputClassName}
          />
        </div>
        <div>
          <label htmlFor="crimelineStatus" className={labelClassName}>
            Outcome Status
          </label>
          <select
            id="crimelineStatus"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={inputClassName}
          >
            <option value="">Select status...</option>
            {OUTCOME_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="crimelineRootCause" className={labelClassName}>
            Root Cause(s)
          </label>
          <input
            type="text"
            id="crimelineRootCause"
            value={rootCause}
            onChange={(e) => onRootCauseChange(e.target.value)}
            placeholder="e.g., Smart contract bug, Poor security"
            className={inputClassName}
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="crimelineAftermath" className={labelClassName}>
          Aftermath
        </label>
        <textarea
          id="crimelineAftermath"
          rows={2}
          value={aftermath}
          onChange={(e) => onAftermathChange(e.target.value)}
          placeholder="What happened after the incident..."
          className={inputClassName}
        />
      </div>
    </div>
  );
}
