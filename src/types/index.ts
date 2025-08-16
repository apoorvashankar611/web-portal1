export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  linkedin_url?: string;
  skills: string[];
  wallet_address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget_min?: number;
  budget_max?: number;
  salary?: number;
  location?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  company: string;
  posted_by: string;
  payment_confirmed: boolean;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  post_type: 'update' | 'advice' | 'announcement';
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface JobMatch {
  job: Job;
  match_score: number;
  matching_skills: string[];
}

export interface WalletConnection {
  connected: boolean;
  publicKey: string | null;
  balance: number;
}