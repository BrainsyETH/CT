export type Mode = "timeline" | "crimeline";

export type EventTag =
  | "TECH"
  | "ECONOMIC"
  | "REGULATORY"
  | "CULTURAL"
  | "SECURITY"
  | "FAILURE"
  | "MILESTONE"
  | "ATH"
  | "CT LORE";

export type CrimelineType =
  | "EXCHANGE HACK"
  | "PROTOCOL EXPLOIT"
  | "BRIDGE HACK"
  | "ORACLE MANIPULATION"
  | "RUG PULL"
  | "FRAUD"
  | "CUSTODY FAILURE"
  | "LEVERAGE COLLAPSE"
  | "GOVERNANCE ATTACK"
  | "REGULATORY SEIZURE"
  | "OTHER";

export type CrimelineCategory =
  | "Centralized Exchange"
  | "DeFi Protocol"
  | "Bridge"
  | "Wallet/Key Compromise"
  | "Stablecoin"
  | "Lending"
  | "Market Structure"
  | "Other";

export type OutcomeStatus =
  | "Funds recovered"
  | "Partial recovery"
  | "Total loss"
  | "Ongoing"
  | "Unknown";

export interface Event {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: string;
  tags: EventTag[];
  mode: Mode[];
  image?: string;
  links?: { label: string; url: string }[];
  metrics?: {
    btc_price_usd?: number;
    market_cap_usd?: number;
    tvl_usd?: number;
    volume_usd?: number;
  };
  crimeline?: {
    type: CrimelineType;
    funds_lost_usd?: number;
    victims_estimated?: string;
    root_cause?: string[];
    aftermath?: string;
    status?: OutcomeStatus;
  };
}
