import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, collection, onSnapshot, addDoc, doc, 
  updateDoc, serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { 
  Zap, Search, CheckCircle2, Sparkles, Loader2, LayoutDashboard,
  LogOut, Clock, Activity, UserCheck, MessageSquare, Send, 
  ShieldCheck, ChevronRight, Settings, Filter, Plus, Bell, ArrowRight
} from 'lucide-react';

// Production Environment Variable Mapping
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const appId = import.meta.env.VITE_APP_ID || '6th-sense-tech';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formStatus, setFormStatus] = useState('idle');
  const [issueDescription, setIssueDescription] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const msgEndRef = useRef(null);

  const serviceCatalog = [
    { cat: "MOBILE ESSENTIALS", name: "pSIM / eSIM Setup & Transfer", price: 15 },
    { cat: "MOBILE ESSENTIALS", name: "Simple Device Unlocking", price: 20 },
    { cat: "MOBILE ESSENTIALS", name: "Carrier Unlocking", price: 25, note: "Eligible devices only" },
    { cat: "MOBILE ESSENTIALS", name: "Mobile Activation / Porting", price: 30 },
    { cat: "DEVICE MAINTENANCE", name: "Device Factory Reset", price: 25, note: "Secure Wipe" },
    { cat: "DEVICE MAINTENANCE", name: "Initial Device Setup", price: 40 },
    { cat: "DEVICE MAINTENANCE", name: "Backup & Restore", price: 45 },
    { cat: "IDENTITY & SECURITY", name: "Account / Email / SSO Setup", price: 30 },
    { cat: "IDENTITY & SECURITY", name: "Password Manager Setup", price: 50 },
    { cat: "IDENTITY & SECURITY", name: "VOIP Service Setup", price: 60 },
    { cat: "DATA & CLOUD", name: "Cloud Storage Setup", price: 40 },
    { cat: "DATA & CLOUD", name: "File Structure / Tagging / Sync", price: 65 },
    { cat: "DATA & CLOUD", name: "Self-Hosted App Config", price: 100 },
    { cat: "DIGITAL STRATEGY", name: "Cost-Saving Audit", price: 35 },
    { cat: "DIGITAL STRATEGY", name: "Content Creation / Editing", price: 50 },
    { cat: "DIGITAL STRATEGY", name: "AI & Prompt Engineering", price: 75 },
    { cat: "DIGITAL STRATEGY", name: "Database Schema Management", price: 90 }
  ];

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error(err); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const path = view === 'tech_dashboard' 
      ? collection(db, 'artifacts', appId, 'public', 'data', 'all_tickets')
      : collection(db, 'artifacts', appId, 'users', user.uid, 'tickets');
    
    return onSnapshot(path, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    });
  }, [user, view]);

  useEffect(() => {
    if (!selectedTicket) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'chats', selectedTicket.id, 'messages'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [selectedTicket]);

  const runAiDiagnostic = async () => {
    if (!issueDescription || !GEMINI_API_KEY) return;
    setIsAiLoading(true);
    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: issueDescription }] }],
          systemInstruction: { parts: [{ text: "Analyze as a technical paramedic. Provide a 2-sentence triage summary and 2 priority-1 questions. Raw text." }] }
        })
      });
      const data = await resp.json();
      setAiInsight(data.candidates?.[0]?.content?.parts?.[0]?.text || "Triage failed.");
    } catch (err) { setAiInsight("AI Offline."); }
    finally { setIsAiLoading(false); }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setFormStatus('submitting');
    const fd = new FormData(e.target);
    const ticketData = {
      name: fd.get('name'),
      contact: fd.get('contact'),
      device: fd.get('device'),
      description: issueDescription,
      status: 'triage',
      aiDiagnostic: aiInsight || null,
      userId: user.uid,
      createdAt: serverTimestamp()
    };
    try {
      const userTicket = await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tickets'), ticketData);
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'all_tickets'), { ...ticketData, originalId: userTicket.id });
      setFormStatus('success');
      setIssueDescription('');
    } catch (err) { setFormStatus('idle'); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chats', selectedTicket.id, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      senderRole: view === 'tech_dashboard' ? 'tech' : 'client',
      createdAt: serverTimestamp()
    });
    setNewMessage('');
  };

  const updateStatus = async (ticketId, newStatus) => {
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'all_tickets', ticketId);
    await updateDoc(docRef, { status: newStatus });
  };

  const Logo = () => (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
      <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg">
        <Zap size={24} fill="currentColor" />
      </div>
      <div>
        <h1 className="text-white font-black text-xl tracking-tighter">6TH SENSE</h1>
        <p className="text-orange-500 text-[8px] font-bold uppercase tracking-widest">Tech Paramedic</p>
      </div>
    </div>
  );

  if (view === 'tech_dashboard' || view === 'client_portal') {
    return (
      <div className="flex h-screen bg-[#050505] text-neutral-300 overflow-hidden font-sans">
        <aside className="w-20 md:w-64 bg-[#0a0a0a] border-r border-neutral-800 flex flex-col py-8">
          <div className="px-6 mb-12 hidden md:block"><Logo /></div>
          <nav className="flex-1 space-y-2 px-4">
            <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold ${!selectedTicket ? 'bg-orange-500/10 text-orange-500' : 'text-neutral-500'}`} onClick={() => setSelectedTicket(null)}>
              <LayoutDashboard size={18} /> <span className="hidden md:inline">Dashboard</span>
            </button>
          </nav>
          <div className="px-4 mt-auto">
            <button onClick={() => setView(view === 'tech_dashboard' ? 'client_portal' : 'tech_dashboard')} className="w-full flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-white rounded-xl text-xs font-bold">
              <Filter size={16} /> <span className="hidden md:inline">Toggle View</span>
            </button>
            <button onClick={() => setView('landing')} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 rounded-xl text-xs font-bold">
              <LogOut size={16} /> <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </aside>

        <section className={`w-full md:w-96 bg-[#080808] border-r border-neutral-800 flex flex-col ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          <header className="p-6 border-b border-neutral-800"><h2 className="font-bold text-white uppercase text-xs tracking-widest">Active Intake</h2></header>
          <div className="flex-1 overflow-y-auto">
            {tickets.map(t => (
              <button key={t.id} onClick={() => setSelectedTicket(t)} className={`w-full p-6 text-left border-b border-neutral-900 transition-all ${selectedTicket?.id === t.id ? 'bg-neutral-900 border-l-4 border-l-orange-500' : ''}`}>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-orange-500 uppercase">{t.status}</span>
                  <span className="text-[9px] text-neutral-600">{t.id.slice(0,6)}</span>
                </div>
                <h4 className="text-white font-bold truncate">{t.device}</h4>
              </button>
            ))}
          </div>
        </section>

        <section className="flex-1 flex flex-col bg-[#050505]">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <MessageSquare size={32} className="text-neutral-800 mb-4" />
              <p className="text-xs text-neutral-600 uppercase font-bold tracking-widest">No Selection</p>
            </div>
          ) : (
            <>
              <header className="p-6 border-b border-neutral-800 bg-[#0a0a0a] flex justify-between items-center">
                <h3 className="text-white font-bold">{selectedTicket.device}</h3>
                {view === 'tech_dashboard' && (
                  <select value={selectedTicket.status} onChange={(e) => updateStatus(selectedTicket.id, e.target.value)} className="bg-black border border-neutral-800 text-[10px] font-bold uppercase p-2 rounded-lg text-orange-500">
                    <option value="triage">Triage</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                  </select>
                )}
              </header>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
                  <p className="text-sm text-neutral-400 italic">"{selectedTicket.description}"</p>
                  {selectedTicket.aiDiagnostic && (
                    <div className="mt-4 pt-4 border-t border-neutral-800 text-[11px] text-neutral-500 flex gap-3">
                      <Sparkles size={14} className="text-orange-500 shrink-0" />
                      <div>{selectedTicket.aiDiagnostic}</div>
                    </div>
                  )}
                </div>
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.senderRole === (view === 'tech_dashboard' ? 'tech' : 'client') ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-4 rounded-2xl text-sm ${m.senderRole === 'tech' ? 'bg-orange-600 text-white rounded-tr-none' : 'bg-neutral-800 text-neutral-200 rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={msgEndRef} />
              </div>
              <form onSubmit={sendMessage} className="p-6 bg-[#0a0a0a] border-t border-neutral-800 flex gap-4">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Send message..." className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white outline-none" />
                <button className="bg-orange-600 text-white p-3 rounded-xl"><Send size={20} /></button>
              </form>
            </>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-neutral-400 font-sans">
      <nav className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-neutral-800/50 px-8 py-5 flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-6">
          <button onClick={() => setView('client_portal')} className="text-sm font-bold text-white hover:text-orange-500">Portal</button>
          <button onClick={() => document.getElementById('intake')?.scrollIntoView({ behavior: 'smooth' })} className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest">Start Intake</button>
        </div>
      </nav>

      <header className="pt-32 pb-24 px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-8">
          <Activity size={12} /> Strategic Triage
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter mb-8 italic">Precision <br />Recovery.</h1>
      </header>

      <section id="intake" className="max-w-4xl mx-auto px-8 py-20">
        <div className="bg-[#121212] p-8 md:p-16 rounded-[3rem] border border-neutral-800 shadow-2xl">
          {formStatus === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle2 size={64} className="text-orange-600 mx-auto mb-6" />
              <button onClick={() => setView('client_portal')} className="bg-white text-black px-10 py-4 rounded-2xl font-bold">Open Portal</button>
            </div>
          ) : (
            <form onSubmit={handleTicketSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <input required name="name" className="w-full px-6 py-5 bg-black border border-neutral-800 rounded-2xl text-white" placeholder="Name" />
                <input required name="contact" className="w-full px-6 py-5 bg-black border border-neutral-800 rounded-2xl text-white" placeholder="Contact" />
              </div>
              <input required name="device" className="w-full px-6 py-5 bg-black border border-neutral-800 rounded-2xl text-white" placeholder="Device" />
              <div className="space-y-3">
                <div className="flex justify-between"><label className="text-[10px] uppercase tracking-widest">Description</label><button type="button" onClick={runAiDiagnostic} className="text-[10px] font-bold text-orange-500">AI ANALYZE</button></div>
                <textarea required value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} className="w-full px-6 py-5 bg-black border border-neutral-800 rounded-2xl text-white h-40 resize-none" placeholder="..." />
                {aiInsight && <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-xs text-neutral-300 italic">{aiInsight}</div>}
              </div>
              <button className="w-full py-6 bg-orange-600 text-white rounded-2xl font-bold text-lg">Transmit Request</button>
            </form>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 py-20">
        <h3 className="text-3xl font-bold text-white mb-12">Standard Rates</h3>
        <div className="grid lg:grid-cols-2 gap-8">
          {serviceCatalog.map((s, i) => (
            <div key={i} className="flex justify-between items-center p-6 bg-[#121212] border border-neutral-800 rounded-2xl">
              <span className="text-neutral-300 text-sm font-medium">{s.name}</span>
              <span className="font-mono text-orange-600 font-bold">${s.price}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
