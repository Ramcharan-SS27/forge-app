export interface Profile {
  name: string;
  learning_style: string;
  primary_goal: string;
  biggest_block: string;
  daily_time: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface WorkLog {
  id: string;
  date: string;
  description: string;
  hours: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  created_at: string;
  progress: number;
  logs: WorkLog[];
  ai_analysis?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'done';
  tech_stack: string[];
  created_at: string;
  deadline?: string;
  ai_plan?: string;
  next_steps: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  curriculum?: string;
  daily_task?: string;
  created_at: string;
}

export interface DailyBrief {
  date: string;
  content: string;
}
