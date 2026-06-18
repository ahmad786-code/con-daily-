import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Boxes, 
  FileText, 
  Wallet, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  X, 
  Check, 
  Smartphone, 
  Grid, 
  FileDown, 
  Share2, 
  AlertCircle, 
  TrendingDown, 
  RefreshCw, 
  Sliders, 
  MessageSquare,
  HelpCircle,
  Clock,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Site, Laborer, LaborAttendance, MaterialItem, MaterialTransaction, Expense, DailyProgress } from './types';
import { INITIAL_SITES, INITIAL_ATTENDANCE, INITIAL_MATERIALS, INITIAL_EXPENSES, INITIAL_PROGRESS_LOGS } from './data/mockData';

export default function App() {
  // Primary database state initialized with mock data on first load, falling back to localStorage
  const [sites, setSites] = useState<Site[]>(() => {
    const saved = localStorage.getItem('bunyad_sites');
    return saved ? JSON.parse(saved) : INITIAL_SITES;
  });

  const [attendance, setAttendance] = useState<{ [siteId: string]: LaborAttendance[] }>(() => {
    const saved = localStorage.getItem('bunyad_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [materials, setMaterials] = useState<{ [siteId: string]: MaterialItem[] }>(() => {
    const saved = localStorage.getItem('bunyad_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [expenses, setExpenses] = useState<{ [siteId: string]: Expense[] }>(() => {
    const saved = localStorage.getItem('bunyad_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [progressLogs, setProgressLogs] = useState<{ [siteId: string]: DailyProgress[] }>(() => {
    const saved = localStorage.getItem('bunyad_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_LOGS;
  });

  // Navigation & Slices State
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-1');
  const [appMode, setAppMode] = useState<'dashboard' | 'simulator'>('dashboard');
  const [simulatorTab, setSimulatorTab] = useState<'overview' | 'labor' | 'material' | 'expense' | 'diary'>('overview');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true); // For mock mobile device frame in dashboard

  // Quick Action Modals / Form toggle states
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [showAddLaborerModal, setShowAddLaborerModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddProgressModal, setShowAddProgressModal] = useState(false);

  // Forms state
  const [newSite, setNewSite] = useState({ name: '', location: '', managerName: '', contact: '', budget: '', area: '' });
  const [newLaborer, setNewLaborer] = useState({ name: '', role: 'Mason (Mistri)', dailyRate: '1500' });
  const [newMaterialTx, setNewMaterialTx] = useState({ materialId: '', type: 'IN' as 'IN' | 'OUT', quantity: '', rate: '', vendor: '' });
  const [newExpense, setNewExpense] = useState({ category: 'Material' as Expense['category'], description: '', amount: '', isLeak: false, leakReason: '', leakAmount: '' });
  const [newProgress, setNewProgress] = useState({ summary: '', completedTaskInput: '', completedTasks: [] as string[], issueInput: '', issues: [] as string[], weather: 'Sunny' as DailyProgress['weather'], status: 'On Track' as DailyProgress['status'] });

  // Status Alerts state (feedback to user)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist State to Local Storage
  useEffect(() => {
    localStorage.setItem('bunyad_sites', JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem('bunyad_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('bunyad_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('bunyad_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bunyad_progress', JSON.stringify(progressLogs));
  }, [progressLogs]);

  // Toast notifier helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset demo back to defaults
  const resetDemoData = () => {
    if (confirm('Kya aap demo reset karna chahte hain? Sabhi changes remove ho jayenge.')) {
      setSites(INITIAL_SITES);
      setAttendance(INITIAL_ATTENDANCE);
      setMaterials(INITIAL_MATERIALS);
      setExpenses(INITIAL_EXPENSES);
      setProgressLogs(INITIAL_PROGRESS_LOGS);
      setSelectedSiteId('site-1');
      showToast('Demo data back to factory defaults! 🔄');
    }
  };

  // Quick Stats Computations
  const getSiteStats = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return { totalExpenses: 0, totalLeaks: 0, laborCount: 0, activeLaborExpense: 0, lowStockAlerts: 0 };
    
    // total expense from list
    const siteExpenses = expenses[siteId] || [];
    const totalExpenses = siteExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalLeaks = siteExpenses.reduce((sum, e) => sum + (e.isLeak ? (e.leakAmount || 0) : 0), 0);

    // active laborers for today (most recent attendance sheet)
    const siteAttendance = attendance[siteId] || [];
    const todayAttendance = siteAttendance[siteAttendance.length - 1];
    const laborers = todayAttendance ? todayAttendance.laborers : [];
    const presentCount = laborers.filter(l => l.status === 'Present' || l.status === 'Half Day').length;
    
    // today active labor expense calculation
    const activeLaborExpense = laborers.reduce((sum, l) => {
      if (l.status === 'Present') return sum + l.dailyRate;
      if (l.status === 'Half Day') return sum + (l.dailyRate * 0.5);
      return sum;
    }, 0);

    // low stock materials alert
    const siteMaterials = materials[siteId] || [];
    const lowStockAlerts = siteMaterials.filter(m => m.available <= m.minThreshold).length;

    return {
      totalExpenses,
      totalLeaks,
      laborCount: presentCount,
      activeLaborExpense,
      lowStockAlerts
    };
  };

  // Portfolio-wide dynamic stats
  const totalPortfolioBudget = sites.reduce((sum, s) => sum + s.budgetedCost, 0);
  const totalPortfolioSpent = sites.reduce((sum, s) => sum + s.actualSpent, 0);
  const totalPortfolioExpensesLogged = (Object.values(expenses).flat() as Expense[]).reduce((sum, e) => sum + e.amount, 0);
  const totalPortfolioLeaks = (Object.values(expenses).flat() as Expense[]).reduce((sum, e) => sum + (e.isLeak ? (e.leakAmount || 0) : 0), 0);
  const totalActiveLaborCount = sites.reduce((sum, s) => sum + getSiteStats(s.id).laborCount, 0);

  // Active Site Details
  const activeSite = sites.find(s => s.id === selectedSiteId) || sites[0];
  const activeStats = getSiteStats(activeSite.id);

  // Handle Labor Attendance Toggle
  const toggleAttendance = (laborerId: string, nextStatus: 'Present' | 'Absent' | 'Half Day') => {
    const siteId = activeSite.id;
    const siteAttendance = [...(attendance[siteId] || [])];
    if (siteAttendance.length === 0) return;

    // Mutate today's log (last entry)
    const todayLogIndex = siteAttendance.length - 1;
    const updatedLaborers = siteAttendance[todayLogIndex].laborers.map(lab => {
      if (lab.id === laborerId) {
        return { ...lab, status: nextStatus };
      }
      return lab;
    });

    siteAttendance[todayLogIndex] = {
      ...siteAttendance[todayLogIndex],
      laborers: updatedLaborers
    };

    setAttendance({
      ...attendance,
      [siteId]: siteAttendance
    });

    // Automatically recalculate and add/modify daily labor cost into site expenses to show dynamic leak/saving logs!
    const laborCostToday = updatedLaborers.reduce((sum, l) => {
      if (l.status === 'Present') return sum + l.dailyRate;
      if (l.status === 'Half Day') return sum + (l.dailyRate * 0.5);
      return sum;
    }, 0);

    // Find if today's labor expense exists in site expenses list, or create one
    const siteExpensesList = [...(expenses[siteId] || [])];
    const todayStr = '2026-06-18';
    const existingIndex = siteExpensesList.findIndex(e => e.date === todayStr && e.category === 'Labor');

    if (existingIndex > -1) {
      siteExpensesList[existingIndex] = {
        ...siteExpensesList[existingIndex],
        amount: laborCostToday,
        description: `Today's updated auto-calculated labor wages (${updatedLaborers.filter(l => l.status === 'Present').length} Present, ${updatedLaborers.filter(l => l.status === 'Half Day').length} Half-day)`
      };
    } else {
      siteExpensesList.push({
        id: `exp-auto-${Date.now()}`,
        siteId,
        date: todayStr,
        category: 'Labor',
        description: `Auto-calculated labor wages for today (${updatedLaborers.filter(l => l.status === 'Present').length} Present)`,
        amount: laborCostToday,
        status: 'Approved',
        isLeak: false
      });
    }

    setExpenses({
      ...expenses,
      [siteId]: siteExpensesList
    });

    // Update historical spent of site to keep portfolio charts consistent
    updateSiteActualSpent(siteId, siteExpensesList);
    showToast(`Attendance updated! Daily wage set to Rs. ${laborCostToday.toLocaleString()}`);
  };

  const updateSiteActualSpent = (siteId: string, customExpenses?: Expense[]) => {
    const sExpenses = customExpenses || expenses[siteId] || [];
    const totalExp = sExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          actualSpent: totalExp + (siteId === 'site-1' ? 10000000 : siteId === 'site-2' ? 15000000 : 2000000) // add pre-loaded base value
        };
      }
      return s;
    }));
  };

  // Add a new Site
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.name || !newSite.location || !newSite.budget) {
      alert('Tmam zruri fields fill kren!');
      return;
    }

    const id = `site-${Date.now()}`;
    const budgetNum = parseFloat(newSite.budget.replace(/,/g, ''));
    const newlyCreatedSite: Site = {
      id,
      name: newSite.name,
      location: newSite.location,
      managerName: newSite.managerName || 'Urgent Assignment Needed',
      contact: newSite.contact || 'N/A',
      budgetedCost: budgetNum,
      actualSpent: 0,
      progress: 5,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: '2027-01-01',
      areaSft: parseFloat(newSite.area) || 2000
    };

    // Initialize list states for this new site
    setSites([...sites, newlyCreatedSite]);
    setMaterials({
      ...materials,
      [id]: [
        { id: `m-n1-${Date.now()}`, name: 'Cement (Bags)', unit: 'Bags', available: 50, budgetedRate: 1450, actualRate: 1450, minThreshold: 15 },
        { id: `m-n2-${Date.now()}`, name: 'Steel / Sariya (Ton)', unit: 'Tons', available: 1.0, budgetedRate: 270000, actualRate: 270000, minThreshold: 0.5 },
        { id: `m-n3-${Date.now()}`, name: 'Bricks (Eent)', unit: 'Pcs', available: 5000, budgetedRate: 18, actualRate: 18, minThreshold: 2000 }
      ]
    });
    setAttendance({
      ...attendance,
      [id]: [
        {
          date: '2026-06-18',
          laborers: [
            { id: `l-n1-${Date.now()}`, name: 'Supervisor Riaz', role: 'Supervisor', dailyRate: 2000, status: 'Present' },
            { id: `l-n2-${Date.now()}`, name: 'Mistri Altaf', role: 'Mason (Mistri)', dailyRate: 1800, status: 'Present' },
            { id: `l-n3-${Date.now()}`, name: 'Mazdoor Sadiq', role: 'Laborer (Mazdoor)', dailyRate: 1100, status: 'Present' }
          ]
        }
      ]
    });
    setExpenses({
      ...expenses,
      [id]: []
    });
    setProgressLogs({
      ...progressLogs,
      [id]: [
        {
          id: `prog-n1-${Date.now()}`,
          siteId: id,
          date: '2026-06-18',
          summary: 'Naya site setup complete. Boundary layouts verified.',
          completedTasks: ['Site setup', 'Demarcation layout'],
          issues: [],
          weather: 'Sunny',
          laborCount: 3,
          status: 'On Track'
        }
      ]
    });

    setSelectedSiteId(id);
    setShowAddSiteModal(false);
    setNewSite({ name: '', location: '', managerName: '', contact: '', budget: '', area: '' });
    showToast(`Naya site "${newlyCreatedSite.name}" saksasfully add hogya! 🎉`);
  };

  // Add Laborer to site roster
  const handleAddLaborer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaborer.name || !newLaborer.dailyRate) return;

    const siteId = activeSite.id;
    const siteAttendance = [...(attendance[siteId] || [])];
    if (siteAttendance.length === 0) return;

    const newLab: Laborer = {
      id: `lab-${Date.now()}`,
      name: newLaborer.name,
      role: newLaborer.role as Laborer['role'],
      dailyRate: parseFloat(newLaborer.dailyRate),
      status: 'Present'
    };

    const lastLogIndex = siteAttendance.length - 1;
    siteAttendance[lastLogIndex] = {
      ...siteAttendance[lastLogIndex],
      laborers: [...siteAttendance[lastLogIndex].laborers, newLab]
    };

    setAttendance({
      ...attendance,
      [siteId]: siteAttendance
    });

    setShowAddLaborerModal(false);
    setNewLaborer({ name: '', role: 'Mason (Mistri)', dailyRate: '1500' });
    showToast(`${newLab.name} (${newLab.role}) today roster pr shamil kiya gya!`);
  };

  // Add Expense to active site (computes and highlights cost leaks)
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    const siteId = activeSite.id;
    const amt = parseFloat(newExpense.amount);
    
    // Automatically identify or verify cost leaks for direct interactive demonstration!
    let detectedLeak = newExpense.isLeak;
    let reason = newExpense.leakReason;
    let leakAmt = parseFloat(newExpense.leakAmount) || 0;

    if (!detectedLeak) {
      // Intelligent rule-engine simulated for demo
      if (newExpense.category === 'Material' && amt > 100000) {
        // Assume 5% leak flag
        detectedLeak = true;
        leakAmt = Math.round(amt * 0.04);
        reason = "Retail purchase markup. Saving alert: Wholesale direct purchase saves 4% cost.";
      } else if (newExpense.category === 'Permit/Tea/Misc' && amt > 3000) {
        detectedLeak = true;
        leakAmt = Math.round(amt * 0.25);
        reason = "Non-itemized builder allowance. Exceeded standard diet-allowance rate.";
      }
    }

    const createdExpense: Expense = {
      id: `exp-${Date.now()}`,
      siteId,
      date: '2026-06-18', // Today
      category: newExpense.category,
      description: newExpense.description,
      amount: amt,
      status: detectedLeak ? 'Flagged' : 'Approved',
      isLeak: detectedLeak,
      leakReason: reason || undefined,
      leakAmount: detectedLeak ? (leakAmt || Math.round(amt * 0.1)) : undefined
    };

    const siteExpensesList = [createdExpense, ...(expenses[siteId] || [])];
    setExpenses({
      ...expenses,
      [siteId]: siteExpensesList
    });

    updateSiteActualSpent(siteId, siteExpensesList);
    setShowAddExpenseModal(false);
    // Reset form
    setNewExpense({ category: 'Material', description: '', amount: '', isLeak: false, leakReason: '', leakAmount: '' });
    
    if (detectedLeak) {
      showToast('⚠️ WARNING: Automatic audit script flagged a COST LEAK on this entry!');
    } else {
      showToast('Naya Expense record complete ho gya!');
    }
  };

  // Register Material stock adjustment (IN / OUT)
  const handleMaterialTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialTx.materialId || !newMaterialTx.quantity) return;

    const siteId = activeSite.id;
    const qty = parseFloat(newMaterialTx.quantity);
    const rateVal = parseFloat(newMaterialTx.rate) || 0;
    const targetMat = materials[siteId]?.find(m => m.id === newMaterialTx.materialId);

    if (!targetMat) return;

    // Mutate internal stock level
    const updatedMaterials = materials[siteId].map(m => {
      if (m.id === newMaterialTx.materialId) {
        const nextQty = newMaterialTx.type === 'IN' 
          ? m.available + qty 
          : Math.max(0, m.available - qty);

        return {
          ...m,
          available: Number(nextQty.toFixed(2)),
          actualRate: newMaterialTx.type === 'IN' && rateVal ? rateVal : m.actualRate
        };
      }
      return m;
    });

    setMaterials({
      ...materials,
      [siteId]: updatedMaterials
    });

    // If stock IN has a higher purchase rate than budgeted, auto-generate a cost leak Log!
    if (newMaterialTx.type === 'IN' && rateVal > targetMat.budgetedRate) {
      const perUnitLeak = rateVal - targetMat.budgetedRate;
      const totalLeak = perUnitLeak * qty;

      const leakExpense: Expense = {
        id: `exp-leak-mat-${Date.now()}`,
        siteId,
        date: '2026-06-18',
        category: 'Material',
        description: `Premium paid for ${targetMat.name} (${qty} ${targetMat.unit} purchased @ Rs. ${rateVal} vs budgeted Rs. ${targetMat.budgetedRate})`,
        amount: rateVal * qty,
        status: 'Flagged',
        isLeak: true,
        leakAmount: totalLeak,
        leakReason: `Market inflation or local emergency buy. Over-budget markup rate is Rs. ${perUnitLeak.toLocaleString()}/${targetMat.unit}.`
      };

      const nextExpenses = [leakExpense, ...(expenses[siteId] || [])];
      setExpenses({
        ...expenses,
        [siteId]: nextExpenses
      });
      updateSiteActualSpent(siteId, nextExpenses);
    } 
    // Otherwise standard expense if Stock IN
    else if (newMaterialTx.type === 'IN' && rateVal > 0) {
      const normalExpense: Expense = {
        id: `exp-mat-tx-${Date.now()}`,
        siteId,
        date: '2026-06-18',
        category: 'Material',
        description: `Delivered ${qty} ${targetMat.unit} of ${targetMat.name} from vendor ${newMaterialTx.vendor || 'Local Depot'}`,
        amount: rateVal * qty,
        status: 'Approved',
        isLeak: false
      };

      const nextExpenses = [normalExpense, ...(expenses[siteId] || [])];
      setExpenses({
        ...expenses,
        [siteId]: nextExpenses
      });
      updateSiteActualSpent(siteId, nextExpenses);
    }

    setShowAddMaterialModal(false);
    setNewMaterialTx({ materialId: '', type: 'IN', quantity: '', rate: '', vendor: '' });
    showToast(`Stock levels updated successfully! ${newMaterialTx.type === 'IN' ? 'Maal dakhil ho gya' : 'Stock consume ho gya'}.`);
  };

  // Add Progress log today
  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgress.summary) return;

    const siteId = activeSite.id;
    const newLog: DailyProgress = {
      id: `prog-${Date.now()}`,
      siteId,
      date: '2026-06-18',
      summary: newProgress.summary,
      completedTasks: newProgress.completedTasks.length > 0 ? newProgress.completedTasks : ['Daily routine supervision performed'],
      issues: newProgress.issues,
      weather: newProgress.weather,
      laborCount: activeStats.laborCount,
      status: newProgress.status
    };

    setProgressLogs({
      ...progressLogs,
      [siteId]: [newLog, ...(progressLogs[siteId] || [])]
    });

    // Slightly increment progress percentage of the construction site to simulate visual feedback!
    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          progress: Math.min(100, s.progress + 2)
        };
      }
      return s;
    }));

    setShowAddProgressModal(false);
    setNewProgress({ summary: '', completedTaskInput: '', completedTasks: [], issueInput: '', issues: [], weather: 'Sunny', status: 'On Track' });
    showToast("Today's Progress diary recorded & Site Progress incremented +2%!");
  };

  // Generate WhatsApp report clipboard text
  const getWhatsAppReportBody = () => {
    let report = `*🏢 BUNYAD CONTROL - DAILY EXECUTIVE SUMMARY*\n`;
    report += `📅 *Date:* 18-Jun-2026 | *Time:* 10:45 AM (Daily Field Update)\n`;
    report += `==================================\n\n`;

    sites.forEach((st, idx) => {
      const stats = getSiteStats(st.id);
      const todayProg = progressLogs[st.id]?.[0];
      
      report += `*${idx + 1}. SITE: ${st.name}* (${st.location})\n`;
      report += `📈 *Progress:* ${st.progress}% completed\n`;
      report += `👷 *Today Labor Roster:* ${stats.laborCount} workers active (Cost: Rs. ${stats.activeLaborExpense.toLocaleString()})\n`;
      if (todayProg) {
        report += `📝 *Update:* "${todayProg.summary}"\n`;
        if (todayProg.issues.length > 0) {
          report += `⚠️ *Issues:* ${todayProg.issues.join(', ')}\n`;
        }
      }
      
      const siteLeaks = expenses[st.id]?.filter(e => e.isLeak) || [];
      if (siteLeaks.length > 0) {
        report += `🚨 *COST LEAKS DETECTED:* Rs. ${stats.totalLeaks.toLocaleString()} total zaya\n`;
        siteLeaks.forEach(le => {
          report += `   - Rs. ${le.leakAmount?.toLocaleString()} zaya in: _"${le.description}"_\n`;
          report += `     *Reason:* ${le.leakReason}\n`;
        });
      } else {
        report += `✅ *No Cost Leaks Flagged today!*\n`;
      }
      report += `----------------------------------\n\n`;
    });

    report += `💰 *PORTFOLIO TOTAL SUMMARY:*\n`;
    report += `👉 *Total Portfolio Spend:* Rs. ${totalPortfolioSpent.toLocaleString()}\n`;
    report += `👉 *Cumulative Leaked Budget:* Rs. ${totalPortfolioLeaks.toLocaleString()}\n`;
    report += `💡 *System AI Recommendation:* Standardized directly-sourced supply chains for Ravi sand & DHA site cement will instantly plug the Rs. 14,000 weekly leak.`;

    return report;
  };

  const copyToClipboard = () => {
    const text = getWhatsAppReportBody();
    navigator.clipboard.writeText(text);
    showToast('WhatsApp Report copied to clipboard successfully! 📱📲');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-900">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-semibold px-6 py-3 rounded-full flex items-center shadow-2xl space-x-2 border border-amber-400"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Header section and interactive toolbar */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Logo & Romanized Urdu Title info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-mono">BUNYAD</span>
                <span className="text-xs bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 px-2 py-0.5 rounded uppercase">Control</span>
              </div>
              <p className="text-xs text-slate-400">Construction cost leak preventer demo (بنیاد کنٹرول)</p>
            </div>
          </div>

          {/* Core App View mode switch selector */}
          <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => { setAppMode('dashboard'); }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${appMode === 'dashboard' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
              <span>Owner Remote Control</span>
            </button>
            <button 
              onClick={() => { 
                setAppMode('simulator'); 
                setSimulatorTab('overview'); 
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${appMode === 'simulator' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Manager Site Simulator</span>
            </button>
          </div>

          {/* Reset button & quick guide trigger on the top-right toolbar */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={resetDemoData}
              title="Reset Simulated Data"
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => showToast("💡 Click on any worker to log dihari instantly, add materials or expenses to test automatic cost leak logging!")} 
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">How To Demo?</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main core layout grid (responsive viewport toggler wrapper) */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* Dynamic Quick Header showing portfolio stats at a glance */}
        <section className="mb-8 grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white font-mono">{sites.length}</span>
              <span className="text-xs text-slate-400">Total Sites Active</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[15px] sm:text-lg font-bold text-white font-mono truncate">Rs. {(totalPortfolioBudget / 10000000).toFixed(2)} Cr</span>
              <span className="text-xs text-slate-400">Portfolio Budget</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[15px] sm:text-lg font-bold text-white font-mono truncate">Rs. {(totalPortfolioSpent / 10000000).toFixed(2)} Cr</span>
              <span className="text-xs text-slate-400">Actual Outflow</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-rose-400 font-mono">Rs. {totalPortfolioLeaks.toLocaleString()}</span>
              <span className="text-xs text-slate-400 font-medium text-rose-500">Zaya Shuda Leaks</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 col-span-2 lg:col-span-1 flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white font-mono">{totalActiveLaborCount}</span>
              <span className="text-xs text-slate-400">Total Labor Present</span>
            </div>
          </div>
        </section>

        {/* MODE 1: OWNER REMOTE MASTER DASHBOARD */}
        {appMode === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Promo Header describing the core pain: Spreading information, site managers hiding facts */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <span className="text-xs text-amber-500 uppercase tracking-widest font-bold">Real-time Site Audit Monitor</span>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Owner ka Direct Mobile control: No more scattered field registers!</h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Site managers often make emergency local purchases or hire extra idle helper shifts which leaks valuable cash. 
                  Bunyad tracking script analyzes site inputs to flag unapproved expenses instantly!
                </p>
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-green-600/10"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Report Copy</span>
                </button>
                <button 
                  onClick={() => setShowAddSiteModal(true)}
                  className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 rounded-xl text-sm font-semibold transition shadow-lg shadow-amber-500/10"
                >
                  <Plus className="w-4 h-4" />
                  <span>Naya Site Add Krein</span>
                </button>
              </div>
            </div>

            {/* Layout Split: Left Portfolio & Auditor Panel, Right Live Smartphone Frame Sync */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 7 Columns: Site portfolio details, Interactive tracker panels */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Active site list selection feed */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Active sites list ({sites.length})</h2>
                    <span className="text-xs text-slate-500">Click site below to inspect audit trail</span>
                  </div>

                  <div className="grid gap-3">
                    {sites.map(st => {
                      const stats = getSiteStats(st.id);
                      const isSelected = selectedSiteId === st.id;
                      
                      return (
                        <div 
                          key={st.id}
                          onClick={() => setSelectedSiteId(st.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-slate-950 border-amber-500 shadow-md shadow-amber-500/5' 
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-bold text-white text-base leading-snug">{st.name}</h3>
                                {isSelected && (
                                  <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 font-bold uppercase rounded border border-amber-400/20">Selected</span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 flex items-center mt-1">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                {st.location}
                              </span>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                              st.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {st.status}
                            </span>
                          </div>

                          {/* Progress bar visualizer */}
                          <div className="space-y-1 mb-4">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">Today concrete/masonry progress</span>
                              <span className="font-bold text-amber-500">{st.progress}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-550"
                                style={{ width: `${st.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Sites micro analytics summary */}
                          <div className="grid grid-cols-3 gap-2 border-t border-slate-900/80 pt-3">
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Outflow Spent</span>
                              <span className="text-xs font-bold text-slate-200">Rs. {st.actualSpent.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Today Labor</span>
                              <span className="text-xs font-bold text-slate-200">{stats.laborCount} workers present</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Cost leaks</span>
                              <span className={`text-xs font-bold ${stats.totalLeaks > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                {stats.totalLeaks > 0 ? `Rs. ${stats.totalLeaks.toLocaleString()}` : 'Rs. 0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit trail details for selected site */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs text-amber-500 font-bold uppercase tracking-widest">Selected Site Audit Trail</span>
                      <h2 className="text-lg font-bold text-white">{activeSite.name}</h2>
                    </div>
                    <button 
                      onClick={() => setAppMode('simulator')} 
                      className="text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-1 transition"
                    >
                      <span>Simulate Field Entries</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* High Alert Cost Leaks Box (Highlighted prominently in Red/Amber) */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1.5" />
                      Cost Leaks Caught at this site (Zaya Shuda Expense Logs)
                    </h3>

                    {expenses[activeSite.id]?.filter(e => e.isLeak).length === 0 ? (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center text-xs text-emerald-400/90 py-6">
                        🎉 Behtareen! No cost leaks detected at this site today. Every rupee is justified!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {expenses[activeSite.id]?.filter(e => e.isLeak).map(lk => (
                          <div key={lk.id} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start space-x-3">
                            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg mt-0.5">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between">
                                <h4 className="font-bold text-sm text-white">{lk.description}</h4>
                                <span className="text-xs font-bold text-rose-400 font-mono">-Rs. {lk.leakAmount?.toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-slate-300">
                                <span className="font-bold text-rose-400/80">Audit Check: </span>
                                {lk.leakReason}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900/50 mt-2">
                                <span>Category: {lk.category}</span>
                                <span>Date logged: {lk.date}</span>
                                <span className="bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-bold">Unapproved Outflow</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Standard Expense Logs of current site */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">All Site Outflow Logs</h3>
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {expenses[activeSite.id]?.map(exp => (
                        <div key={exp.id} className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg text-xs ${
                              exp.category === 'Material' ? 'bg-blue-500/10 text-blue-400' :
                              exp.category === 'Labor' ? 'bg-amber-500/10 text-amber-400' :
                              exp.category === 'Fuel/Machinery' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-slate-500/10 text-slate-400'
                            }`}>
                              {exp.category === 'Material' && <Boxes className="w-4 h-4" />}
                              {exp.category === 'Labor' && <Users className="w-4 h-4" />}
                              {exp.category === 'Fuel/Machinery' && <Sliders className="w-4 h-4" />}
                              {exp.category === 'Permit/Tea/Misc' && <FileText className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white leading-tight">{exp.description}</h4>
                              <span className="text-[10px] text-slate-400">{exp.date} • {exp.category}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-100 block">Rs. {exp.amount.toLocaleString()}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                              exp.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                              exp.status === 'Flagged' ? 'bg-rose-500/10 text-rose-400 font-bold' :
                              'bg-amber-500/10 text-amber-400'
                            }`}>{exp.status}</span>
                          </div>
                        </div>
                      ))}

                      {(!expenses[activeSite.id] || expenses[activeSite.id].length === 0) && (
                        <p className="text-xs text-slate-500 text-center py-6">Abhi tak koi expense logged nahi hai.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right 5 Columns: Immersive Simulated smartphone mock */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Live Field App (Field simulator)</h2>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs text-slate-400">Live Syncing</span>
                  </div>
                </div>

                {/* Smartphone Mock Case Container */}
                <div className="relative mx-auto max-w-[340px] border-4 border-slate-700 bg-slate-950 rounded-[40px] shadow-2xl overflow-hidden aspect-[9/18.5] flex flex-col">
                  
                  {/* Smartphone Top Speaker and Notch */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-slate-950 z-30 flex justify-center items-center">
                    <div className="w-20 h-4 bg-slate-900 rounded-b-xl absolute top-0 flex items-center justify-center">
                      <div className="w-6 h-1 bg-slate-700 rounded-full mb-1" />
                    </div>
                  </div>

                  {/* Phone Status Bar area */}
                  <div className="pt-7 px-4 pb-2 bg-slate-950 flex justify-between items-center text-[11px] text-slate-400 font-medium z-20">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      10:45 AM
                    </span>
                    <span className="text-amber-500 uppercase tracking-widest font-bold text-[9px] bg-amber-500/10 px-1 border border-amber-500/20 rounded">
                      Site Supervisor App
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-1.5 bg-slate-400 rounded-sm inline-block" />
                      <span>4G LTE</span>
                    </span>
                  </div>

                  {/* Embedded Mobile App View Simulator */}
                  <div className="flex-1 bg-slate-900 flex flex-col overflow-y-auto custom-scrollbar relative">
                    
                    {/* Header profile info inside field mobile screen */}
                    <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-amber-500 uppercase tracking-wider block font-bold">Logged in: supervisor</span>
                          <h3 className="font-bold text-white text-xs">{activeSite.managerName}</h3>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-400 py-0.5 px-2 rounded-full font-mono">{activeSite.id}</span>
                      </div>
                      
                      {/* Interactive Field App Title switcher */}
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                        <div className="truncate">
                          <span className="text-[9px] text-slate-400 font-normal">Active Project Field Register:</span>
                          <p className="text-xs font-bold text-white truncate font-mono">{activeSite.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Smartphone Screen Core Navigation Menu */}
                    <div className="flex justify-around bg-slate-950 border-b border-slate-800 p-2 shrink-0">
                      {[
                        { id: 'overview', label: 'Feeds', count: 0 },
                        { id: 'labor', label: 'Dihari', count: activeStats.laborCount },
                        { id: 'material', label: 'Maal', count: activeStats.lowStockAlerts },
                        { id: 'expense', label: 'Kharcha', count: 0 },
                        { id: 'diary', label: 'Report', count: 0 }
                      ].map(tb => (
                        <button
                          key={tb.id}
                          onClick={() => {
                            setSimulatorTab(tb.id as any);
                            setAppMode('simulator');
                          }}
                          className={`flex flex-col items-center py-1.5 px-2 rounded-lg transition text-[10px] font-bold ${
                            simulatorTab === tb.id ? 'text-amber-500 bg-slate-900' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-mono">{tb.label}</span>
                          {tb.count > 0 && (
                            <span className="absolute transform translate-x-2 -translate-y-1 w-2.5 h-2.5 bg-rose-500 rounded-full block" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Smartphone Screen active state simulator (micro layout of Mobile View) */}
                    <div className="p-3.5 space-y-4">
                      
                      {/* SNEAK PEEK VIEW ACCORDING TO CURRENT TAB */}
                      {simulatorTab === 'overview' && (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-left">
                            <span className="text-[9px] text-slate-400 block uppercase">Project Info & Status</span>
                            <h4 className="font-bold text-xs text-white uppercase">{activeSite.name}</h4>
                            <p className="text-[10px] text-slate-300">Start date: {activeSite.startDate}</p>
                            <p className="text-[10px] text-slate-300">Manager contact: {activeSite.contact}</p>
                            <div className="flex items-center space-x-1.5 py-1 text-[10px] text-slate-400 border-t border-slate-900">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" />
                              <span>Site in progress</span>
                            </div>
                          </div>

                          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-amber-500 font-mono">👷 Rapid Attendance</span>
                              <span className="text-[10px] text-slate-400">{activeStats.laborCount} present today</span>
                            </div>
                            <p className="text-[10px] text-slate-300 leading-snug">Tap to mark who showed up today on dihari registration.</p>
                            <button 
                              onClick={() => { setSimulatorTab('labor'); setAppMode('simulator'); }}
                              className="w-full text-center py-1.5 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded-lg text-[10px] uppercase transition-all"
                            >
                              Open Dihari Register
                            </button>
                          </div>

                          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-bold text-white font-mono">🧱 Stock Shortages</span>
                              <span className="text-[10px] bg-red-500/10 text-red-400 px-1 rounded uppercase font-bold">{activeStats.lowStockAlerts} urgent</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">Ensure supply doesn't delay work, preventing paid-idle labor hours.</p>
                            <button 
                              onClick={() => { setSimulatorTab('material'); setAppMode('simulator'); }}
                              className="w-full text-center py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-lg text-[10px] uppercase transition-all"
                            >
                              Check Materials Stock
                            </button>
                          </div>
                        </div>
                      )}

                      {simulatorTab === 'labor' && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400">Attendance Sheet</span>
                            <span className="text-[10px] text-amber-500 font-bold font-mono">18-Jun-2026</span>
                          </div>

                          <div className="space-y-1.5">
                            {(attendance[activeSite.id]?.[attendance[activeSite.id].length - 1]?.laborers || []).slice(0, 4).map(lb => (
                              <div key={lb.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center text-left">
                                <div>
                                  <h4 className="font-bold text-xs text-white">{lb.name}</h4>
                                  <p className="text-[9px] text-slate-400">{lb.role} • Rs. {lb.dailyRate}/day</p>
                                </div>
                                <div className="flex space-x-1">
                                  {['Present', 'Half Day', 'Absent'].map(st => {
                                    const isCurrent = lb.status === st;
                                    return (
                                      <button
                                        key={st}
                                        onClick={() => toggleAttendance(lb.id, st as any)}
                                        className={`px-1.5 py-0.5 text-[8px] rounded font-bold transition-all ${
                                          isCurrent 
                                            ? st === 'Present' ? 'bg-emerald-500 text-slate-950 shadow-sm' :
                                              st === 'Half Day' ? 'bg-amber-500 text-slate-950 shadow-sm' :
                                              'bg-rose-500 text-white shadow-sm'
                                            : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                                        }`}
                                      >
                                        {st === 'Present' ? 'P' : st === 'Half Day' ? 'H' : 'A'}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <button 
                            onClick={() => { setSimulatorTab('labor'); setAppMode('simulator'); }}
                            className="w-full text-center py-1.5 bg-slate-950 hover:bg-slate-900 text-[10px] font-bold text-slate-300 rounded border border-slate-800 uppercase"
                          >
                            Manage Complete Roster
                          </button>
                        </div>
                      )}

                      {simulatorTab === 'material' && (
                        <div className="space-y-3 text-left">
                          <span className="text-xs font-bold text-slate-400 block">Stock Summary Feed</span>
                          <div className="space-y-1.5">
                            {materials[activeSite.id]?.slice(0, 3).map(mt => {
                              const isLow = mt.available <= mt.minThreshold;
                              return (
                                <div key={mt.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                                  <div>
                                    <h4 className="font-bold text-xs text-white">{mt.name}</h4>
                                    <p className="text-[9px] text-slate-400 font-mono">Rate: Rs. {mt.actualRate.toLocaleString()}/{mt.unit}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xs font-mono font-bold block ${isLow ? 'text-red-400' : 'text-slate-300'}`}>
                                      {mt.available} {mt.unit}
                                    </span>
                                    {isLow && (
                                      <span className="text-[8px] block text-rose-500 font-bold">REORDER INSTANTLY</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <button 
                            onClick={() => { setSimulatorTab('material'); setAppMode('simulator'); }}
                            className="w-full text-center py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold rounded uppercase"
                          >
                            Record Material Supply
                          </button>
                        </div>
                      )}

                      {simulatorTab === 'expense' && (
                        <div className="space-y-3 text-left">
                          <span className="text-xs font-bold text-slate-400 block">Recent Site Claims</span>
                          <div className="space-y-1.5">
                            {expenses[activeSite.id]?.slice(0, 2).map(ex => (
                              <div key={ex.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                                <div className="flex justify-between">
                                  <span className="font-bold text-xs text-white truncate max-w-[150px]">{ex.description}</span>
                                  <span className="text-xs font-bold text-slate-300 font-mono">Rs. {ex.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1 text-[8px] text-slate-400">
                                  <span>{ex.category}</span>
                                  <span className={ex.isLeak ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}>
                                    {ex.isLeak ? '⚠️ LEAK CAPTURED' : 'APPROVED'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button 
                            onClick={() => { setSimulatorTab('expense'); setAppMode('simulator'); }}
                            className="w-full text-center py-2 bg-slate-950 text-xs hover:bg-slate-900 text-amber-500 select-none cursor-pointer rounded border border-slate-800 uppercase font-bold"
                          >
                            Claim New Expenses
                          </button>
                        </div>
                      )}

                      {simulatorTab === 'diary' && (
                        <div className="space-y-3 text-left">
                          <span className="text-xs font-bold text-slate-400 block">Today's Site Progress Dairy</span>
                          {progressLogs[activeSite.id]?.[0] ? (
                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                              <p className="text-xs text-white italic">"{progressLogs[activeSite.id][0].summary}"</p>
                              {progressLogs[activeSite.id][0].issues.length > 0 && (
                                <p className="text-[9px] text-rose-400">🚨 Issue: {progressLogs[activeSite.id][0].issues[0]}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No diaries available for today.</p>
                          )}
                          <button 
                            onClick={() => { setSimulatorTab('diary'); setAppMode('simulator'); }}
                            className="w-full text-center py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 font-bold rounded text-xs uppercase text-slate-300"
                          >
                            Update Daily Diary
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Quick simulator workflow helper bottom callout banner */}
                    <div className="mt-auto bg-slate-950 p-2 text-center text-[9px] text-slate-500 border-t border-slate-800">
                      Site supervisors update this during shifts. 
                    </div>
                  </div>

                  {/* Smartphone Home Bar */}
                  <div className="h-4 bg-slate-950 shrink-0 flex justify-center items-center pb-1">
                    <div className="w-24 h-1 bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* MODE 2: FULL COMPREHENSIVE MANAGER SITE SIMULATOR */}
        {appMode === 'simulator' && (
          <div className="space-y-6">
            
            {/* Top Back selector grid */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3.5">
                <button 
                  onClick={() => setAppMode('dashboard')}
                  className="bg-slate-900 hover:bg-slate-800 p-2 inline-block rounded-lg text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="font-bold text-lg text-white">Manager Site Simulator Panel</h1>
                  <p className="text-xs text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Simulating supervisor logs for: <span className="text-amber-400 font-semibold ml-1">{activeSite.name}</span>
                  </p>
                </div>
              </div>

              {/* Site selector dropdown directly inside toolbar */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 whitespace-nowrap">Change Site:</span>
                <select 
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none focus:border-amber-500 w-full sm:w-auto"
                >
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inner Simulator view switcher tabs */}
            <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
              {[
                { id: 'overview', label: '🏠 Site Overview' },
                { id: 'labor', label: '👷 Labor Attendance (Dihari)' },
                { id: 'material', label: '🧱 Material Stock flow & rates' },
                { id: 'expense', label: '💰 Site Expenses' },
                { id: 'diary', label: '📝 Daily Progress Diary' }
              ].map(tb => (
                <button
                  key={tb.id}
                  onClick={() => setSimulatorTab(tb.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all ${
                    simulatorTab === tb.id 
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANEL */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              
              {/* TAB 1: OVERVIEW */}
              {simulatorTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Site specific KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-medium">Site Budget Allocation</span>
                      <span className="text-xl font-bold font-mono text-white">Rs. {activeSite.budgetedCost.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 mt-1">Area: {activeSite.areaSft} Sft</p>
                    </div>
                    <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-medium">Logged Expense Outflow</span>
                      <span className="text-xl font-bold font-mono text-amber-500">Rs. {activeStats.totalExpenses.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 mt-1">Remaining: Rs. {(activeSite.budgetedCost - activeStats.totalExpenses).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-medium">Total Registered Workers</span>
                      <span className="text-xl font-bold font-mono text-white">{activeStats.laborCount} present</span>
                      <p className="text-[10px] text-slate-400 mt-1">Daily wage cost: Rs. {activeStats.activeLaborExpense.toLocaleString()}/day</p>
                    </div>
                    <div className="bg-slate-900 p-4.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-500 block font-bold text-rose-400">Total Leaks Handled</span>
                      <span className="text-xl font-bold font-mono text-rose-500">Rs. {activeStats.totalLeaks.toLocaleString()}</span>
                      <p className="text-[10px] text-rose-400 mt-1">{expenses[activeSite.id]?.filter(e => e.isLeak).length || 0} leakages caught</p>
                    </div>
                  </div>

                  {/* Manager details and description card */}
                  <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-white">Site Supervisor Information</h3>
                      <p className="text-xs text-slate-300">Responsible Person: <strong className="text-slate-100">{activeSite.managerName}</strong></p>
                      <p className="text-xs text-slate-300">Ph: {activeSite.contact} • Email verified</p>
                    </div>
                    <div className="space-y-1 text-left md:text-right">
                      <p className="text-xs text-slate-300">Project Started on: {activeSite.startDate}</p>
                      <p className="text-xs text-slate-400">Projected Turnover: {activeSite.expectedEndDate}</p>
                    </div>
                  </div>

                  {/* Audit Trail Simulation Tip */}
                  <div className="bg-amber-500/10 p-5 rounded-xl border border-amber-500/20 text-slate-300 space-y-2 text-sm">
                    <h4 className="font-bold text-amber-400 flex items-center">
                      <AlertCircle className="w-4.5 h-4.5 mr-2" />
                      Auditorial Control Tip when Pitching Leads:
                    </h4>
                    <p className="text-xs leading-relaxed">
                      "Aap is demo main labor key tabs par aakar attendance markup update karein aur Material par custom locally priced IN supply enter karein. 
                      Aap dekhenge ke Owner Master Dashboard main real-time alert, cost-overruns, aur unapproved wage claims automatically compile ho jayenge take leak pinpoint hoskay!"
                    </p>
                  </div>

                </div>
              )}

              {/* TAB 2: LABOR ATTENDANCE TRACKER */}
              {simulatorTab === 'labor' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Labor Roster & Daily Attendance (Dihari)</h2>
                      <p className="text-xs text-slate-400">Click on any worker's dihari status button to mark them dynamically.</p>
                    </div>
                    
                    <button 
                      onClick={() => setShowAddLaborerModal(true)}
                      className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Roster Rasta Shamil Krein</span>
                    </button>
                  </div>

                  {/* Active list grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(attendance[activeSite.id]?.[attendance[activeSite.id].length - 1]?.laborers || []).map(lab => {
                      return (
                        <div key={lab.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">{lab.role}</span>
                            <h3 className="font-bold text-white text-sm">{lab.name}</h3>
                            <p className="text-xs font-mono text-slate-400 mt-1">Rate: Rs. {lab.dailyRate}/day</p>
                          </div>
                          
                          {/* Attendance action controls */}
                          <div className="flex flex-col space-y-1">
                            {[
                              { key: 'Present', label: 'Present ✔️', pyColor: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30' },
                              { key: 'Half Day', label: 'Half Day 🌙', pyColor: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30' },
                              { key: 'Absent', label: 'Absent ❌', pyColor: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30' }
                            ].map(btn => {
                              const isActive = lab.status === btn.key;
                              return (
                                <button
                                  key={btn.key}
                                  onClick={() => toggleAttendance(lab.id, btn.key as any)}
                                  className={`px-3 py-1 text-[11px] font-semibold rounded-lg text-center transition-all border ${
                                    isActive 
                                      ? btn.key === 'Present' ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-md shadow-emerald-500/10' :
                                        btn.key === 'Half Day' ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/10' :
                                        'bg-rose-600 text-white border-rose-500 font-bold shadow-md'
                                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* TAB 3: MATERIAL STOCK FLOW */}
              {simulatorTab === 'material' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Materials Inventory Control</h2>
                      <p className="text-xs text-slate-400">Track raw-materials availability. Over-budget stock purchases instantly raise alert logs.</p>
                    </div>
                    
                    <button 
                      onClick={() => setShowAddMaterialModal(true)}
                      className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Supply IN/OUT</span>
                    </button>
                  </div>

                  {/* Stock table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Material Name</th>
                          <th className="p-4">Current Stock Level</th>
                          <th className="p-4">Standard Budgeted Rate</th>
                          <th className="p-4">Last Purchase Rate</th>
                          <th className="p-4">Status Alert</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {materials[activeSite.id]?.map(mt => {
                          const isLow = mt.available <= mt.minThreshold;
                          const hasRateLeak = mt.actualRate > mt.budgetedRate;
                          
                          return (
                            <tr key={mt.id} className="hover:bg-slate-900/40 transition">
                              <td className="p-4 font-bold text-white">{mt.name}</td>
                              <td className="p-4">
                                <span className={`font-mono font-bold ${isLow ? 'text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded' : 'text-slate-200'}`}>
                                  {mt.available} {mt.unit}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-slate-400">Rs. {mt.budgetedRate.toLocaleString()}/{mt.unit}</td>
                              <td className="p-4 font-mono">
                                <span className={hasRateLeak ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                                  Rs. {mt.actualRate.toLocaleString()}/{mt.unit}
                                </span>
                              </td>
                              <td className="p-4 select-none">
                                {isLow ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">LOW STOCK TRIGGER</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Healthy stock</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 4: EXPENSE MANAGEMENT AND LEAK CONTROLS */}
              {simulatorTab === 'expense' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Daily Outflow & Expense Vouchers</h2>
                      <p className="text-xs text-slate-400">Every cash voucher claimed by supervisor is logged. Excess expenditures are flagged by system rule checks.</p>
                    </div>
                    
                    <button 
                      onClick={() => setShowAddExpenseModal(true)}
                      className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Record Expense Slip</span>
                    </button>
                  </div>

                  {/* Expenses Grid */}
                  <div className="space-y-2.5">
                    {expenses[activeSite.id]?.map(ex => {
                      return (
                        <div key={ex.id} className={`p-4.5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                          ex.isLeak ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-900 border-slate-800/80'
                        }`}>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2.5">
                              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                ex.category === 'Material' ? 'bg-blue-500/10 text-blue-400' :
                                ex.category === 'Labor' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-purple-500/10 text-purple-400'
                              }`}>{ex.category}</span>
                              <span className="text-xs text-slate-500">{ex.date}</span>
                              {ex.isLeak && (
                                <span className="bg-rose-500/15 text-rose-400 px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-rose-500/25 animate-pulse">COST LEAK</span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-slate-100">{ex.description}</h3>
                            {ex.isLeak && (
                              <p className="text-xs text-rose-300 italic">
                                <strong>System Audit Check: </strong> {ex.leakReason}
                              </p>
                            )}
                          </div>

                          <div className="text-left md:text-right space-y-1.5 min-w-[120px]">
                            <span className="block text-base font-mono font-bold text-white">Rs. {ex.amount.toLocaleString()}</span>
                            {ex.isLeak && ex.leakAmount && (
                              <span className="block text-xs font-bold text-rose-400 font-mono">Excess chunk: Rs. {ex.leakAmount.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {(!expenses[activeSite.id] || expenses[activeSite.id].length === 0) && (
                      <p className="text-xs text-slate-500 text-center py-6">Abhi tak koi expense log nahi kiya gya.</p>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 5: DAILY DIARY PROGRESS LOGS */}
              {simulatorTab === 'diary' && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">Supervisor's Daily Work Diary</h2>
                      <p className="text-xs text-slate-400">Daily reports with accomplishments, weather hurdles, and blockages.</p>
                    </div>
                    
                    <button 
                      onClick={() => setShowAddProgressModal(true)}
                      className="flex items-center space-x-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Today's Diary</span>
                    </button>
                  </div>

                  {/* Progress Logs list */}
                  <div className="space-y-4">
                    {progressLogs[activeSite.id]?.map(log => {
                      return (
                        <div key={log.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between border-b border-slate-800/60 pb-3 gap-2">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-none">Simulated site update</span>
                              <h3 className="text-xs text-slate-400">Date Logged: <strong className="text-slate-100 font-mono">{log.date}</strong></h3>
                            </div>
                            <div className="flex space-x-2 text-xs">
                              <span className="px-2.5 py-1 bg-slate-950 text-slate-300 rounded-lg">Weather: {log.weather}</span>
                              <span className={`px-2.5 py-1 font-bold rounded-lg ${
                                log.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400' :
                                log.status === 'On Track' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-rose-500/10 text-rose-400'
                              }`}>Status: {log.status}</span>
                            </div>
                          </div>

                          <div className="space-y-1 text-left">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Shift Summary Remarks</span>
                            <p className="text-sm text-slate-200 leading-relaxed font-sans">{log.summary}</p>
                          </div>

                          {/* Completed tasks bullets */}
                          {log.completedTasks.length > 0 && (
                            <div className="space-y-1.5 text-left bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Completed tasks today:</span>
                              <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                                {log.completedTasks.map((t, i) => (
                                  <li key={i}>{t}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Log issues */}
                          {log.issues.length > 0 && (
                            <div className="space-y-1 px-3 py-2 bg-rose-500/10 border border-rose-500/15 rounded-lg text-left">
                              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Hurdles / Issues recorded:</span>
                              <p className="text-xs text-rose-300">{log.issues.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(!progressLogs[activeSite.id] || progressLogs[activeSite.id].length === 0) && (
                      <p className="text-xs text-slate-500 text-center py-6">Abhi tak is site key updates blank hain.</p>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-semibold text-slate-400">© 2026 Bunyad Control System. Built to protect contractor margins & cost leaks.</p>
          <p className="max-w-2xl mx-auto text-[11px] leading-relaxed">
            This tracking dashboard demo is ready to present to qualified leads. Real-time updates utilize localStorage cache to allow continuous interactive modifications without losing progress.
          </p>
          <div className="pt-2 flex justify-center space-x-4">
            <span className="text-[11px] hover:text-white transition cursor-pointer" onClick={() => alert("Bunyad Control v1.4 - Mobile-first prototype ready.")}>Version v1.4</span>
            <span>•</span>
            <span className="text-[11px] hover:text-white transition cursor-pointer" onClick={resetDemoData}>Reset Data Roster</span>
          </div>
        </div>
      </footer>

      {/* --- ADD NEW SITE MODAL DIALOG --- */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Add Naya Construction Site</h3>
              <button 
                onClick={() => setShowAddSiteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSite} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Project / Site Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. DHA Phase 6 - Plot 412"
                  value={newSite.name}
                  onChange={e => setNewSite({...newSite, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Location (City / Area) *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lahore, Punjab"
                  value={newSite.location}
                  onChange={e => setNewSite({...newSite, location: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Initial Budget (PKR Rs.) *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 15,000,000"
                    value={newSite.budget}
                    onChange={e => setNewSite({...newSite, budget: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Area Size (Sft)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 4500"
                    value={newSite.area}
                    onChange={e => setNewSite({...newSite, area: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <hr className="border-slate-800" />

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Supervisor / Manager Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Riaz Mahmood"
                  value={newSite.managerName}
                  onChange={e => setNewSite({...newSite, managerName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Manager Contact Info</label>
                <input 
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={newSite.contact}
                  onChange={e => setNewSite({...newSite, contact: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 rounded-xl text-xs uppercase transition tracking-wider"
              >
                Add Site & Initialize Systems
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD NEW LABORER MODAL DIALOG --- */}
      {showAddLaborerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Roster Shamil Krein</h3>
              <button 
                onClick={() => setShowAddLaborerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLaborer} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Worker Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Mistri Shaban"
                  value={newLaborer.name}
                  onChange={e => setNewLaborer({...newLaborer, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Worker Role / Designation *</label>
                <select 
                  value={newLaborer.role}
                  onChange={e => setNewLaborer({...newLaborer, role: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="Mason (Mistri)">Mason (Mistri)</option>
                  <option value="Laborer (Mazdoor)">Laborer (Mazdoor)</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Steel Fixer">Steel Fixer</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Daily Wage / Dihari Rate (PKR Rs.) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={newLaborer.dailyRate}
                  onChange={e => setNewLaborer({...newLaborer, dailyRate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 rounded-xl text-xs uppercase transition tracking-wider"
              >
                Add worker & Verify shifts
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD MATERIAL TRANSACTION MODAL DIALOG --- */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Record Material Transaction</h3>
              <button 
                onClick={() => setShowAddMaterialModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleMaterialTransaction} className="p-5 space-y-4">
              
              <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewMaterialTx({...newMaterialTx, type: 'IN'})}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded ${newMaterialTx.type === 'IN' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  📥 Maal Aya (Stock IN)
                </button>
                <button
                  type="button"
                  onClick={() => setNewMaterialTx({...newMaterialTx, type: 'OUT'})}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded ${newMaterialTx.type === 'OUT' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
                >
                  📤 Maal Laga (Stock OUT)
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Select Material *</label>
                <select 
                  required
                  value={newMaterialTx.materialId}
                  onChange={e => setNewMaterialTx({...newMaterialTx, materialId: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose target item --</option>
                  {materials[activeSite.id]?.map(m => (
                    <option key={m.id} value={m.id}>{m.name} [Available: {m.available} {m.unit}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Quantity *</label>
                  <input 
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 50"
                    value={newMaterialTx.quantity}
                    onChange={e => setNewMaterialTx({...newMaterialTx, quantity: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Purchase Rate (per unit)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 1390"
                    disabled={newMaterialTx.type === 'OUT'}
                    value={newMaterialTx.rate}
                    onChange={e => setNewMaterialTx({...newMaterialTx, rate: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500 disabled:opacity-40"
                  />
                </div>
              </div>

              {newMaterialTx.type === 'IN' && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-450 block">Vendor / Supplier Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Bismillah Traders DHA"
                    value={newMaterialTx.vendor}
                    onChange={e => setNewMaterialTx({...newMaterialTx, vendor: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none"
                  />
                </div>
              )}

              <div className="p-3.5 bg-slate-950/80 rounded-lg text-[11px] text-slate-400 border border-slate-800 leading-normal">
                💡 <strong>Demo tip:</strong> Agar app purchase rate standard rate se zyada likhenge (e.g. Cement bag buy @ 1490 vs budget 1420), design automatic audit trail main rate-leak display krayga.
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 rounded-xl text-xs uppercase transition tracking-wider"
              >
                Save transaction slip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD EXPENSE VOUCHER MODAL DIALOG --- */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Record Expense Voucher</h3>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Expense Category *</label>
                <select 
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="Material">Material</option>
                  <option value="Labor">Labor (Extra shifts etc)</option>
                  <option value="Fuel/Machinery">Fuel / Generator / Machinery Rental</option>
                  <option value="Permit/Tea/Misc">Permit Office / Tea allowances / Miscellaneous</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Amount (PKR Rs.) *</label>
                <input 
                  type="number"
                  required
                  placeholder="e.g. 15000"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Voucher Description *</label>
                <textarea 
                  required
                  rows={2}
                  placeholder="e.g. Paid local hardware supplier for urgent cutter machine blade"
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <hr className="border-slate-800" />

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="isLeak"
                    checked={newExpense.isLeak}
                    onChange={e => setNewExpense({...newExpense, isLeak: e.target.checked})}
                    className="rounded border-slate-800 bg-slate-950 text-amber-550 focus:ring-0"
                  />
                  <label htmlFor="isLeak" className="text-xs font-bold text-amber-500 cursor-pointer">
                    Flag as a Cost Leakage? (Zaya Shuda)
                  </label>
                </div>

                {newExpense.isLeak && (
                  <div className="space-y-3.5 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="text-[11px] text-rose-400 block font-semibold">Leak Amount (Loss share)</label>
                      <input 
                        type="number"
                        placeholder="What part was wastage? e.g. 3000"
                        value={newExpense.leakAmount}
                        onChange={e => setNewExpense({...newExpense, leakAmount: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-slate-100 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-rose-400 block font-semibold">Audit Leak Reason / Remedy</label>
                      <input 
                        type="text"
                        placeholder="e.g. Overprice of Rs. 35 per liter charged by field labor"
                        value={newExpense.leakReason}
                        onChange={e => setNewExpense({...newExpense, leakReason: e.target.value})}
                        className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-slate-100 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 rounded-xl text-xs uppercase transition tracking-wider"
              >
                Log Outflow Slip
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD PROGRESS LOG/DIARY MODAL DIALOG --- */}
      {showAddProgressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm uppercase font-mono tracking-wider">Log Today's Work Progress</h3>
              <button 
                onClick={() => setShowAddProgressModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProgress} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Work Summary (Brief description) *</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="e.g. Plaster work on the main ground rooms completed. Excavation started on water underground tank."
                  value={newProgress.summary}
                  onChange={e => setNewProgress({...newProgress, summary: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Weathers Conditions</label>
                  <select
                    value={newProgress.weather}
                    onChange={e => setNewProgress({...newProgress, weather: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="Sunny">Sunny</option>
                    <option value="Rainy">Rainy (Barish)</option>
                    <option value="Extreme Heat">Severe Heat</option>
                    <option value="Cloudy">Cloudy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-semibold">Work Efficiency Status</label>
                  <select
                    value={newProgress.status}
                    onChange={e => setNewProgress({...newProgress, status: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 outline-none"
                  >
                    <option value="Excellent">Excellent Progress</option>
                    <option value="On Track">On Track</option>
                    <option value="Delayed">Delayed / Blocked</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 block font-semibold">Record Any Site Hurdles / Issues (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Delayed concrete mix delivery, labor dispute"
                  value={newProgress.issueInput}
                  onChange={e => setNewProgress({...newProgress, issueInput: e.target.value, issues: e.target.value ? [e.target.value] : []})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 rounded-xl text-xs uppercase transition tracking-wider"
              >
                Publish today's diary
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
