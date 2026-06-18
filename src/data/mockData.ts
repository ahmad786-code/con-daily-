import { Site, LaborAttendance, MaterialItem, MaterialTransaction, Expense, DailyProgress } from '../types';

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'DHA Phase 6 - Plot 412 (Villa)',
    location: 'Lahore, Punjab',
    progress: 68,
    budgetedCost: 15000000, // 1.5 Crore
    actualSpent: 10450000, // ~1 Crore
    status: 'Active',
    managerName: 'Sajid Ali',
    contact: '0300-1234567',
    startDate: '2026-03-01',
    expectedEndDate: '2026-09-15',
    areaSft: 4500,
  },
  {
    id: 'site-2',
    name: 'Gulberg Commercial Plaza (4th Floor)',
    location: 'Gulberg III, Lahore',
    progress: 42,
    budgetedCost: 32000000, // 3.2 Crore
    actualSpent: 16800000,
    status: 'Active',
    managerName: 'Fahad Sheikh',
    contact: '0321-7654321',
    startDate: '2026-01-10',
    expectedEndDate: '2026-12-01',
    areaSft: 8200,
  },
  {
    id: 'site-3',
    name: 'Bahria Town Heights - Block C',
    location: 'Rawalpindi, Islamabad',
    progress: 18,
    budgetedCost: 12000000, // 1.2 Crore
    actualSpent: 2650000,
    status: 'On Hold',
    managerName: 'Imran Shah',
    contact: '0333-9876543',
    startDate: '2026-05-01',
    expectedEndDate: '2027-02-28',
    areaSft: 3200,
  }
];

export const INITIAL_MATERIALS: { [siteId: string]: MaterialItem[] } = {
  'site-1': [
    { id: 'm-1', name: 'Cement (Bags)', unit: 'Bags', available: 145, budgetedRate: 1420, actualRate: 1450, minThreshold: 50 },
    { id: 'm-2', name: 'Steel / Sariya (Ton)', unit: 'Tons', available: 3.2, budgetedRate: 265000, actualRate: 278000, minThreshold: 1.5 },
    { id: 'm-3', name: 'Bricks (Eent)', unit: 'Pcs', available: 18000, budgetedRate: 16, actualRate: 18, minThreshold: 5000 },
    { id: 'm-4', name: 'Sand (Ravi Cent)', unit: 'Trolley', available: 4, budgetedRate: 7500, actualRate: 8500, minThreshold: 2 },
    { id: 'm-5', name: 'Crush / Bajri (Sargodha)', unit: 'Trolley', available: 6, budgetedRate: 16500, actualRate: 17200, minThreshold: 2 },
  ],
  'site-2': [
    { id: 'm-6', name: 'Cement (Bags)', unit: 'Bags', available: 320, budgetedRate: 1420, actualRate: 1435, minThreshold: 100 },
    { id: 'm-7', name: 'Steel / Sariya (Ton)', unit: 'Tons', available: 8.5, budgetedRate: 265000, actualRate: 272000, minThreshold: 3.0 },
    { id: 'm-8', name: 'Bricks (Eent)', unit: 'Pcs', available: 45000, budgetedRate: 16, actualRate: 17.5, minThreshold: 10000 },
    { id: 'm-9', name: 'Sand (Chenab Cent)', unit: 'Trolley', available: 8, budgetedRate: 8500, actualRate: 9200, minThreshold: 3 },
  ],
  'site-3': [
    { id: 'm-10', name: 'Cement (Bags)', unit: 'Bags', available: 45, budgetedRate: 1450, actualRate: 1480, minThreshold: 40 },
    { id: 'm-11', name: 'Steel / Sariya (Ton)', unit: 'Tons', available: 0.8, budgetedRate: 265000, actualRate: 282000, minThreshold: 1.0 },
    { id: 'm-12', name: 'Bricks (Eent)', unit: 'Pcs', available: 2000, budgetedRate: 16, actualRate: 19, minThreshold: 3000 },
  ]
};

export const INITIAL_ATTENDANCE: { [siteId: string]: LaborAttendance[] } = {
  'site-1': [
    {
      date: '2026-06-17',
      laborers: [
        { id: 'l-1', name: 'Mistri Shaukat', role: 'Mason (Mistri)', dailyRate: 1800, status: 'Present' },
        { id: 'l-2', name: 'Mistri Ameen', role: 'Mason (Mistri)', dailyRate: 1800, status: 'Present' },
        { id: 'l-3', name: 'Mazdoor Aslam', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Present' },
        { id: 'l-4', name: 'Mazdoor Kamran', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Present' },
        { id: 'l-5', name: 'Mazdoor Liaqat', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Present' },
        { id: 'l-6', name: 'Babar Ali', role: 'Steel Fixer', dailyRate: 1500, status: 'Present' },
        { id: 'l-7', name: 'Riaz Mahmood', role: 'Supervisor', dailyRate: 2200, status: 'Present' },
      ]
    },
    {
      date: '2026-06-18', // Today
      laborers: [
        { id: 'l-1', name: 'Mistri Shaukat', role: 'Mason (Mistri)', dailyRate: 1800, status: 'Present' },
        { id: 'l-2', name: 'Mistri Ameen', role: 'Mason (Mistri)', dailyRate: 1800, status: 'Present' },
        { id: 'l-3', name: 'Mazdoor Aslam', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Present' },
        { id: 'l-4', name: 'Mazdoor Kamran', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Absent' }, // Absent today
        { id: 'l-5', name: 'Mazdoor Liaqat', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Present' },
        { id: 'l-6', name: 'Babar Ali', role: 'Steel Fixer', dailyRate: 1500, status: 'Half Day' }, // Half Day
        { id: 'l-7', name: 'Riaz Mahmood', role: 'Supervisor', dailyRate: 2200, status: 'Present' },
      ]
    }
  ],
  'site-2': [
    {
      date: '2026-06-18',
      laborers: [
        { id: 'la-1', name: 'Mistri Naeem', role: 'Mason (Mistri)', dailyRate: 1900, status: 'Present' },
        { id: 'la-2', name: 'Mistri Rashid', role: 'Mason (Mistri)', dailyRate: 1900, status: 'Present' },
        { id: 'la-3', name: 'Mazdoor Majeed', role: 'Laborer (Mazdoor)', dailyRate: 1200, status: 'Present' },
        { id: 'la-4', name: 'Mazdoor Sajjad', role: 'Laborer (Mazdoor)', dailyRate: 1200, status: 'Present' },
        { id: 'la-5', name: 'Mazdoor Younas', role: 'Laborer (Mazdoor)', dailyRate: 1200, status: 'Present' },
        { id: 'la-6', name: 'Mazdoor Naveed', role: 'Laborer (Mazdoor)', dailyRate: 1200, status: 'Present' },
        { id: 'la-7', name: 'Irfan Plumber', role: 'Plumber', dailyRate: 1600, status: 'Absent' },
      ]
    }
  ],
  'site-3': [
    {
      date: '2026-06-18',
      laborers: [
        { id: 'lb-1', name: 'Mistri Hameed', role: 'Mason (Mistri)', dailyRate: 1800, status: 'Absent' },
        { id: 'lb-2', name: 'Mazdoor Shakeel', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Absent' },
      ]
    }
  ]
};

export const INITIAL_EXPENSES: { [siteId: string]: Expense[] } = {
  'site-1': [
    {
      id: 'exp-101',
      siteId: 'site-1',
      date: '2026-06-15',
      category: 'Material',
      description: 'Purchased 80 Bags Cement from local suburban shop due to sudden demand',
      amount: 116000,
      status: 'Flagged',
      isLeak: true,
      leakAmount: 4800, // bought at 1450 instead of 1390 wholesale
      leakReason: 'Emergency local buy (Rs. 60 profit leak per bag) due to delayed main supply.'
    },
    {
      id: 'exp-102',
      siteId: 'site-1',
      date: '2026-06-16',
      category: 'Fuel/Machinery',
      description: 'Water pump Diesel & Generator rent',
      amount: 12500,
      status: 'Approved',
      isLeak: false
    },
    {
      id: 'exp-103',
      siteId: 'site-1',
      date: '2026-06-17',
      category: 'Labor',
      description: 'Daily labor wages paid (Dihari register)',
      amount: 10600,
      status: 'Approved',
      isLeak: false
    },
    {
      id: 'exp-104',
      siteId: 'site-1',
      date: '2026-06-17',
      category: 'Permit/Tea/Misc',
      description: 'Site tea & Samosa for labor + urgent map correction fee',
      amount: 4500,
      status: 'Approved',
      isLeak: true,
      leakAmount: 1500,
      leakReason: 'Irregular tea/food bill without voucher or supervision'
    },
    {
      id: 'exp-105',
      siteId: 'site-1',
      date: '2026-06-18', // Today
      category: 'Material',
      description: '1 sand trolley (Ravi Sand) emergency urgent delivery',
      amount: 9500,
      status: 'Flagged',
      isLeak: true,
      leakAmount: 2000, // budgeted Rs. 7500
      leakReason: 'Premium delivery rate charged by local dealer for immediate arrival.'
    }
  ],
  'site-2': [
    {
      id: 'exp-201',
      siteId: 'site-2',
      date: '2026-06-17',
      category: 'Material',
      description: 'Bricks (Awal Class Eent) 10,000 Pcs delivered',
      amount: 175000,
      status: 'Approved',
      isLeak: false
    },
    {
      id: 'exp-202',
      siteId: 'site-2',
      date: '2026-06-18',
      category: 'Labor',
      description: 'Double shifts supervisor overtime premium',
      amount: 18000,
      status: 'Pending',
      isLeak: true,
      leakAmount: 6000,
      leakReason: 'Unapproved supervisor overtime hours claimed.'
    }
  ],
  'site-3': [
    {
      id: 'exp-301',
      siteId: 'site-3',
      date: '2026-06-15',
      category: 'Permit/Tea/Misc',
      description: 'Excavation NOC Fees paid to society office',
      amount: 45000,
      status: 'Approved',
      isLeak: false
    }
  ]
};

export const INITIAL_PROGRESS_LOGS: { [siteId: string]: DailyProgress[] } = {
  'site-1': [
    {
      id: 'prog-101',
      siteId: 'site-1',
      date: '2026-06-17',
      summary: 'Steel layout of the secondary floor roof beams completed. Electric conduits laid down by team.',
      completedTasks: [
        'Conduits laid out for roof slab',
        'Shuttering verified by structure engineer Sajid Ali',
        'Sariya binding 100% completed'
      ],
      issues: ['Mild rain in evening slightly delayed electrician wiring verification.'],
      weather: 'Sunny',
      laborCount: 7,
      status: 'On Track'
    },
    {
      id: 'prog-102',
      siteId: 'site-1',
      date: '2026-06-18', // Today
      summary: 'Slab concrete pouring (Lanter ki bharai) started at 9 AM. Heavy diesel mixer functioning.',
      completedTasks: [
        'Roof slab concrete pouring in progress (30% completed)',
        'Vibrator rental delivered and active'
      ],
      issues: [
        'Sariya fixing labor shortage (1 steel fixer babar ali left early due to injury)',
        'Urgent diesel purchased due to backup generator failure'
      ],
      weather: 'Sunny',
      laborCount: 6,
      status: 'Excellent'
    }
  ],
  'site-2': [
    {
      id: 'prog-201',
      siteId: 'site-2',
      date: '2026-06-18',
      summary: 'Internal plastering on the 4th floor master rooms (East Side) initiated. Block masonry completed.',
      completedTasks: [
        'Block wall masonry work checked and cured',
        'Plaster raw mix prepared (1:4 ratio cement sand)'
      ],
      issues: ['Plumber Irfan was absent today, toilet layout marking delayed.'],
      weather: 'Sunny',
      laborCount: 6,
      status: 'On Track'
    }
  ],
  'site-3': [
    {
      id: 'prog-301',
      siteId: 'site-3',
      date: '2026-06-18',
      summary: 'Excavation work temporarily stopped by Bahria Society due to verification of NOC boundary clearance.',
      completedTasks: [
        'Boundary demarcation layout set'
      ],
      issues: [
        'Society surveyor delayed clearance inspection',
        'Heavy dust storm stopped outdoor mapping at noon'
      ],
      weather: 'Cloudy',
      laborCount: 0,
      status: 'Delayed'
    }
  ]
};

export const INITIAL_TRANSACTIONS: MaterialTransaction[] = [
  {
    id: 'tx-101',
    siteId: 'site-1',
    materialId: 'm-1', // Cement
    date: '2026-06-15',
    type: 'IN',
    quantity: 80,
    rate: 1450,
    vendor: 'Bismillah Traders, DHA'
  },
  {
    id: 'tx-102',
    siteId: 'site-1',
    materialId: 'm-1', // Cement
    date: '2026-06-17',
    type: 'OUT',
    quantity: 35,
    rate: 1450
  },
  {
    id: 'tx-103',
    siteId: 'site-1',
    materialId: 'm-4', // Sand
    date: '2026-06-18',
    type: 'IN',
    quantity: 1,
    rate: 9500,
    vendor: 'Shahid Bhatti & Sons'
  }
];
