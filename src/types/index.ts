export interface Poll {
  id: string;
  question: string;
  options: string[];
  status: 'active' | 'closed';
  createdAt: Date;
  closedAt?: Date;
  timeLimit: number;
  responses: Record<string, string>;
  results: Record<string, number>;
}

export interface Student {
  id: string;
  name: string;
  connected: boolean;
  joinedAt: Date;
}

export interface PollResponse {
  studentId: string;
  studentName: string;
  answer: string;
  timestamp: Date;
}