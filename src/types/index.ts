export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  category_id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  notes?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CategoryStats {
  average: number;
  fastest: number;
  slowest: number;
  totalSessions: number;
  progressData: ProgressDataPoint[];
}

export interface ProgressDataPoint {
  session: number;
  duration: number;
  date: string;
}

export interface TimerState {
  isRunning: boolean;
  startedAt?: Date;
  duration: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface CreateSessionData {
  name: string;
  notes?: string;
  tags?: string[];
}
