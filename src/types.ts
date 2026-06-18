export interface Site {
  id: string;
  name: string;
  location: string;
  progress: number;
  budgetedCost: number; // in PKR (Rs.)
  actualSpent: number;
  status: 'Active' | 'On Hold' | 'Completed';
  managerName: string;
  contact: string;
  startDate: string;
  areaSft: number;
  expectedEndDate: string;
}

export interface Laborer {
  id: string;
  name: string;
  role: 'Mason (Mistri)' | 'Laborer (Mazdoor)' | 'Electrician' | 'Plumber' | 'Supervisor' | 'Steel Fixer';
  dailyRate: number; // Dihari
  status: 'Present' | 'Absent' | 'Half Day';
  overtimeHours?: number;
}

export interface LaborAttendance {
  date: string;
  laborers: Laborer[];
}

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  available: number;
  budgetedRate: number; // standard rate expected
  actualRate: number; // average purchase rate
  minThreshold: number; // reorder level
}

export interface MaterialTransaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT'; // IN: supply arrived, OUT: construction consumption
  quantity: number;
  rate: number; // in Rs.
  vendor?: string;
  materialId: string;
  siteId: string;
}

export interface Expense {
  id: string;
  siteId: string;
  date: string;
  category: 'Labor' | 'Material' | 'Fuel/Machinery' | 'Permit/Tea/Misc';
  description: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Flagged';
  isLeak: boolean;
  leakReason?: string;
  leakAmount?: number;
}

export interface DailyProgress {
  id: string;
  siteId: string;
  date: string;
  summary: string;
  completedTasks: string[];
  issues: string[];
  weather: 'Sunny' | 'Rainy' | 'Extreme Heat' | 'Cloudy';
  laborCount: number;
  status: 'Excellent' | 'On Track' | 'Delayed';
}

export interface MockData {
  sites: Site[];
  attendance: { [siteId: string]: LaborAttendance[] };
  materials: { [siteId: string]: MaterialItem[] };
  transactions: MaterialTransaction[];
  expenses: { [siteId: string]: Expense[] };
  progressLogs: { [siteId: string]: DailyProgress[] };
}
