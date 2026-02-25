import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, UserCog, MapPin, Building, Users, Save, 
  Lock, Camera, Trash2, Plus, AlertTriangle, Sun, Moon, LogOut, 
  Menu, X, ShieldCheck, Activity, Database, TrendingUp, Signal, 
  KeyRound, ChevronRight, GraduationCap, Layers, Box, CheckCircle, 
  XCircle, Loader2, Edit, ExternalLink, RefreshCw, Bell, Megaphone,
  Landmark, Calculator, FileDown, FileSpreadsheet, Printer, User, Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- MASUKKAN URL GOOGLE SCRIPT ANDA DI SINI ---
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyALLV9OE3FfyrTA2H92nbUdcVu1_tQfBYjidpgUizuJhSEzOvw46BAkl8wGbK8FxeXQg/exec"; 

// --- IKON TUGU MONAS KUSTOM ---
const MonasIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 5 C50 5, 55 15, 55 20 C55 25, 45 25, 45 20 C45 15, 50 5, 50 5 Z" fill="#f97316" className="animate-pulse"/>
    <path d="M50 25 L50 25 C52 25, 53 26, 53 28 L53 65 L47 65 L47 28 C47 26, 48 25, 50 25 Z" fill="#e2e8f0"/>
    <polygon points="40,65 60,65 55,75 45,75" fill="#94a3b8"/>
    <rect x="35" y="75" width="30" height="5" fill="#64748b" rx="2"/>
    <rect x="25" y="80" width="50" height="10" fill="#475569" rx="2"/>
  </svg>
);

// --- LATAR BELAKANG SKYLINE JAKARTA ---
const JakartaSkyline = () => (
  <svg className="absolute bottom-0 left-0 w-full h-auto opacity-10 pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none">
    <path d="M0,200 L0,150 L50,150 L50,120 L80,120 L80,80 L110,80 L110,130 L150,130 L150,90 L180,90 L180,160 L220,160 L220,100 L250,100 L250,140 L300,140 L300,60 L330,60 L330,120 L370,120 L370,50 L400,50 L400,150 L450,150 L450,90 L480,90 L480,140 L520,140 L520,70 L550,70 L550,130 L600,130 L600,100 L630,100 L630,150 L680,150 L680,80 L710,80 L710,140 L750,140 L750,60 L780,60 L780,160 L830,160 L830,90 L860,90 L860,130 L900,130 L900,110 L930,110 L930,150 L970,150 L970,130 L1000,130 L1000,200 Z" fill="currentColor"/>
  </svg>
);

const App = () => {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [runningText, setRunningText] = useState("Siaga Tanggap Galang - BPBD Provinsi DKI Jakarta");
  const [botUsername, setBotUsername] = useState(""); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); 
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const savedUser = localStorage.getItem('sijitupasna_user');
    if (savedUser) { try { setCurrentUser(JSON.parse(savedUser)); } catch (e) { localStorage.removeItem('sijitupasna_user'); } }
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    setIsLoadingInit(true);
    if(GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith("http")) {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_init_data`);
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                let fetchedUsers = Array.isArray(data.users) ? data.users : [];
                if (fetchedUsers.length === 0) fetchedUsers = [{ id: 999, username: 'admin', password: '123', role: 'admin', name: 'Emergency Admin', assignedKelurahan: '' }];
                setUsers(fetchedUsers); 
                if(data.notification) setRunningText(data.notification);
                if(data.botName) setBotUsername(data.botName); 
            } catch (e) {
                console.error("Format data init tidak valid:", text);
                setUsers([{ id: 1, username: 'admin', password: '123', role: 'admin', name: 'Admin Offline', assignedKelurahan: '' }]);
            }
            setIsLoadingInit(false); 
        } catch(err) {
            console.error("Gagal koneksi ke server", err);
            setUsers([{ id: 1, username: 'admin', password: '123', role: 'admin', name: 'Admin Offline', assignedKelurahan: '' }]);
            setIsLoadingInit(false);
        }
    } else {
        setUsers([{ id: 1, username: 'admin', password: '123', role: 'admin', name: 'Admin Demo', assignedKelurahan: '' }]);
        setIsLoadingInit(false);
    }
  };

  const fetchReports = async () => {
    setIsSyncing(true);
    if(GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith("http")) {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=get_reports&t=${Date.now()}`);
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setReports(Array.isArray(data) ? data : []); 
                setIsSyncing(false); 
                showToast("Data disinkronisasi", 'success');
            } catch(e) {
                console.error("Gagal memproses JSON:", text);
                setIsSyncing(false); 
                showToast("Terjadi kesalahan format data dari server", 'error');
            }
        } catch(err) {
            console.error(err); 
            setIsSyncing(false); 
            showToast("Gagal mengambil data", 'error');
        }
    } else { setTimeout(() => setIsSyncing(false), 1000); }
  };

  useEffect(() => { if (currentUser && currentView === 'dashboard') fetchReports(); }, [currentUser, currentView]);

  const showToast = (msg, type = 'success') => { setNotification({ show: true, message: msg, type }); setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000); };
  const handleLogin = (u) => { setCurrentUser(u); localStorage.setItem('sijitupasna_user', JSON.stringify(u)); showToast(`Selamat Datang, ${u.name}!`); };
  const handleLogout = () => { localStorage.removeItem('sijitupasna_user'); setCurrentUser(null); setCurrentView('dashboard'); };
  
  const handleUpdateRunningText = (newText) => {
    setRunningText(newText);
    if(GOOGLE_SCRIPT_URL) fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'update_notification', text: newText }) });
    showToast("Pengumuman diperbarui!", "success");
  };

  const handleChangePassword = (newPass) => {
    if (!newPass) return showToast("Password kosong", "error");
    const updatedUser = { ...currentUser, password: newPass };
    setCurrentUser(updatedUser); localStorage.setItem('sijitupasna_user', JSON.stringify(updatedUser));
    if(GOOGLE_SCRIPT_URL) fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'change_password', username: currentUser.username, newPassword: newPass }) });
    setShowPasswordModal(false); showToast("Password diubah!", "success");
  };

  const handleUpdateProfile = (newData) => {
    const updatedUser = { ...currentUser, ...newData };
    setCurrentUser(updatedUser); localStorage.setItem('sijitupasna_user', JSON.stringify(updatedUser));
    if(GOOGLE_SCRIPT_URL) fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'update_profile', username: currentUser.username, newName: newData.name, newPassword: newData.password }) });
    showToast("Profil diperbarui!", "success");
  };

  const stats = useMemo(() => {
    const totalData = reports.length;
    const totalLoss = reports.reduce((acc, curr) => acc + (parseInt(curr?.assets?.totalKerugian) || 0) + (parseInt(curr?.building?.totalKerugianBangunan) || 0), 0);
    return { totalData, totalLoss };
  }, [reports]);

  // --- EXPORT CSV ---
  const exportCSV = () => {
    if (reports.length === 0) return showToast("Tidak ada data", "error");
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,Surveyor,Nama Pemilik,Kelurahan,RT,RW,Latitude,Longitude,Legalitas,NJOP,Kerusakan,Persentase,Luas(m2),Lantai,Kerugian Bangunan,Aset Terdampak,Total Kerugian Aset,Link Foto\n";
    reports.forEach(row => {
      const b = row?.building || {};
      const s = row?.survivor || {};
      const photos = row?.photos ? row.photos.replace(/\n/g, " | ") : "";
      const clean = (text) => text ? `"${String(text).replace(/"/g, '""')}"` : "";
      const rowData = [row.timestamp, row.surveyor, clean(s.nama), s.kelurahan, s.rt, s.rw, s.lat, s.lng, b.legalitas, b.njop, b.kerusakan, b.persentase, b.luas, b.lantai, b.totalKerugianBangunan, clean(b.asetTerdampak), row?.assets?.totalKerugian, photos];
      csvContent += rowData.join(",") + "\n";
    });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `REKAP_JITUPASNA_${new Date().toLocaleDateString()}.csv`); document.body.appendChild(link); link.click();
  };

  // --- EXPORT PDF ---
  const generatePDF = (data) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(249, 115, 22); // Orange BPBD
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255); doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.text("LAPORAN SIJITUPASNA", pageWidth / 2, 12, null, null, "center");
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text("BPBD PROVINSI DKI JAKARTA", pageWidth / 2, 19, null, null, "center");
      
      const s = data?.survivor || {};
      doc.setTextColor(0, 0, 0); doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text(`PEMILIK: ${String(s.nama || 'Tanpa Nama').toUpperCase()}`, 14, 35);
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`Lokasi: Kel. ${s.kelurahan || '-'} RT ${s.rt || '-'}/${s.rw || '-'}`, 14, 41); doc.text(`Waktu Input: ${new Date(data.timestamp).toLocaleString()}`, 14, 47);
      
      let startY = 60;
      const b = data?.building || {}; const a = data?.assets || {};
      const tableRows = [['Surveyor', data.surveyor || '-'], ['Koordinat', `${s.lat || '-'}, ${s.lng || '-'}`], ['Alamat', s.alamat || '-'], [{ content: 'DATA BANGUNAN & ASET', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' } }], ['Legalitas', b.legalitas || '-'], ['Dimensi', `${b.panjang||0}m x ${b.lebar||0}m (Luas: ${b.luas||0} m²)`], ['Lantai', b.lantai || '-'], ['Kerusakan', `${b.kerusakan || '-'} (${b.persentase || '0'}%)`], ['Aset Terdampak', b.asetTerdampak || '-'], [{ content: 'VALUASI', colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', halign: 'center' } }], ['NJOP', `Rp ${parseInt(b.njop || 0).toLocaleString()}`], ['Kerugian Bangunan', `Rp ${parseInt(b.totalKerugianBangunan || 0).toLocaleString()}`], ['Kerugian Aset', `Rp ${parseInt(a.totalKerugian || 0).toLocaleString()}`], [{ content: `TOTAL: Rp ${(parseInt(b.totalKerugianBangunan || 0) + parseInt(a.totalKerugian || 0)).toLocaleString()}`, colSpan: 2, styles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold', halign: 'right' } }]];
      doc.autoTable({ startY: startY + 5, head: [['Parameter', 'Detail']], body: tableRows, theme: 'grid', headStyles: { fillColor: [15, 23, 42] }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } } });
      
      if (data?.families && data.families.length > 0) { doc.text("Daftar Keluarga Terdampak:", 14, doc.lastAutoTable.finalY + 10); const famRows = data.families.map(f => [f.nama, f.jmlAnggota, f.jmlSekolah, `Rp ${parseInt(f.rugi||0).toLocaleString()}`]); doc.autoTable({ startY: doc.lastAutoTable.finalY + 15, head: [['KK', 'Anggota', 'Sekolah', 'Loss']], body: famRows, theme: 'striped', headStyles: { fillColor: [37, 99, 235] } }); }
      if (data?.photos) { doc.setFontSize(10); doc.setTextColor(37, 99, 235); const links = data.photos.split('\n'); doc.text("Lampiran Foto Dokumentasi:", 14, doc.lastAutoTable.finalY + 15); links.forEach((link, i) => { if(link) doc.textWithLink(`- Lihat Foto ${i+1}`, 14, doc.lastAutoTable.finalY + 22 + (i*6), { url: link }); }); }
      doc.save(`Laporan_${s.nama || 'TanpaNama'}.pdf`);
    } catch (e) { console.error(e); showToast("Gagal membuat PDF", "error"); }
  };

  // ==========================================
  // VIEW: LANDING PAGE / LOGIN
  // ==========================================
  if (!currentUser) return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b1120] text-white font-sans relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/20 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="text-slate-700"><JakartaSkyline /></div>

      {/* Left Content (Hero) */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-20 z-10 relative">
        <div className="flex items-center gap-4 mb-8">
          <MonasIcon className="w-16 h-16" />
          <div>
            <h2 className="text-xl font-bold tracking-widest text-orange-500">BPBD DKI JAKARTA</h2>
            <p className="text-xs text-slate-400">Pusat Data dan Informasi Kebencanaan</p>
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-4">
          SIJITUPASNA <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
            BPBD DKI JAKARTA
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
          Sistem Informasi Pengkajian Kebutuhan Pasca Bencana. Merupakan portal terpadu untuk pendataan, valuasi kerugian, dan manajemen aset terdampak di wilayah DKI Jakarta secara Real-Time.
        </p>
        <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-400">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><MapPin className="text-orange-500" size={16}/> Pemetaan Akurat</div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><Calculator className="text-blue-500" size={16}/> Kalkulasi Otomatis</div>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"><ShieldCheck className="text-emerald-500" size={16}/> Tersertifikasi</div>
        </div>
      </div>

      {/* Right Content (Login Card) */}
      <div className="w-full md:w-[450px] bg-slate-900/80 backdrop-blur-2xl border-l border-white/10 flex flex-col justify-center p-8 md:p-12 z-10 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
            <Lock className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold">Portal Masuk</h2>
          <p className="text-sm text-slate-400 mt-1">Silakan otentikasi identitas Anda.</p>
        </div>
        
        {isLoadingInit ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="animate-spin text-orange-500 w-12 h-12 mb-4" />
            <p className="text-sm text-slate-400 animate-pulse">Menyambungkan ke Server Pusat...</p>
          </div>
        ) : (
          <LoginScreenLogic users={users} onLogin={handleLogin} onFail={() => showToast('Otentikasi Gagal. Periksa kembali kredensial Anda.', 'error')} />
        )}

        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Info size={12}/> Dukungan Teknis: Pusdatin BPBD DKI</p>
        </div>
      </div>
      
      <NotificationToast notification={notification} />
    </div>
  );

  // ==========================================
  // VIEW: MAIN APPLICATION (DASHBOARD)
  // ==========================================
  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 font-sans ${theme === 'dark' ? 'bg-[#0f172a] text-gray-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col border-r shadow-2xl ${theme === 'dark' ? 'bg-[#0b1120] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
          <MonasIcon className="w-10 h-10" />
          <div>
            <h1 className="font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500">SIJITUPASNA</h1>
            <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest">BPBD DKI JAKARTA</p>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden ml-auto"><X size={20}/></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase opacity-40 mb-2 mt-2">Menu Utama</p>
          <NavButton icon={LayoutDashboard} label="Dashboard Pusat" active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} isDark={theme==='dark'} />
          <NavButton icon={FileText} label="Input Assessment" active={currentView === 'input'} onClick={() => { setEditData(null); setCurrentView('input'); setMobileMenuOpen(false); }} isDark={theme==='dark'} />
          <NavButton icon={User} label="Profil Petugas" active={currentView === 'profile'} onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }} isDark={theme==='dark'} />
          
          {currentUser.role === 'admin' && (
            <>
              <div className="my-6 border-t border-white/5"></div>
              <p className="px-4 text-[10px] font-bold uppercase opacity-40 mb-2">Panel Admin</p>
              <NavButton icon={UserCog} label="Manajemen Akses" active={currentView === 'users'} onClick={() => { setCurrentView('users'); setMobileMenuOpen(false); }} isDark={theme==='dark'} />
              <NavButton icon={Megaphone} label="Siaran Pengumuman" active={currentView === 'notification'} onClick={() => { setCurrentView('notification'); setMobileMenuOpen(false); }} isDark={theme==='dark'} />
            </>
          )}
        </nav>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">{currentUser.name.charAt(0)}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{currentUser.name}</p>
              <p className="text-[10px] opacity-60 font-mono">{currentUser.assignedKelurahan || 'SUPER ADMIN'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="flex-1 p-2 rounded-lg bg-white/5 border border-white/5 flex justify-center hover:bg-white/10 transition">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button onClick={handleLogout} className="flex-1 p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex justify-center hover:bg-red-500 hover:text-white transition"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Dynamic Theme Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark' ? 'from-[#0f172a] via-[#1e293b] to-[#0f172a]' : 'from-slate-50 via-white to-slate-100'}`}></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-orange-500/5 blur-[120px]"></div>
          <div className="text-slate-500"><JakartaSkyline /></div>
        </div>

        {/* Running Text Alert Bar */}
        <div className="h-10 bg-[#0f172a] border-b border-white/10 flex items-center overflow-hidden relative z-20">
          <div className="bg-red-600 h-full px-4 flex items-center justify-center z-10 font-bold text-xs text-white tracking-widest shadow-lg gap-2">
            <AlertTriangle size={14} className="animate-pulse"/> INFO
          </div>
          <div className="whitespace-nowrap animate-marquee pl-4 text-sm font-medium text-orange-400 flex items-center">
            {runningText}
          </div>
        </div>
        
        {/* Mobile Navbar */}
        <div className={`md:hidden h-16 flex items-center px-4 border-b z-20 backdrop-blur-md ${theme === 'dark' ? 'border-white/10 bg-[#0f172a]/80' : 'border-slate-200 bg-white/80'}`}>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg bg-orange-500/10 text-orange-500"><Menu/></button>
          <span className="font-black text-lg ml-3 text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">SIJITUPASNA</span>
        </div>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide z-10 relative">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardView stats={stats} reports={reports} isSyncing={isSyncing} onSync={fetchReports} isDark={theme === 'dark'} currentUser={currentUser} onEdit={(row) => { setEditData(row); setCurrentView('input'); }} onExportCSV={exportCSV} onPrintPDF={generatePDF} botUsername={botUsername} />}
            {currentView === 'input' && <InputForm user={currentUser} isDark={theme === 'dark'} onSuccess={() => { setEditData(null); fetchReports(); setCurrentView('dashboard'); showToast(editData ? "Pembaruan Berhasil" : "Data Berhasil Disimpan", 'success'); }} googleScriptUrl={GOOGLE_SCRIPT_URL} editData={editData} onCancelEdit={() => { setEditData(null); setCurrentView('dashboard'); }} />}
            {currentView === 'users' && currentUser.role === 'admin' && <UserManagement users={users} setUsers={setUsers} isDark={theme === 'dark'} googleScriptUrl={GOOGLE_SCRIPT_URL} showToast={showToast} />}
            {currentView === 'notification' && currentUser.role === 'admin' && <NotificationSetting currentText={runningText} onSave={handleUpdateRunningText} isDark={theme === 'dark'} />}
            {currentView === 'profile' && <UserProfile user={currentUser} onUpdate={handleUpdateProfile} isDark={theme === 'dark'} />}
          </div>
        </main>
      </div>
      
      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} onChange={handleChangePassword} isDark={theme === 'dark'} />}
      <NotificationToast notification={notification} />
      <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 25s linear infinite; }`}</style>
    </div>
  );
};

// --- LOGIC COMPONENT FOR LOGIN SCREEN ---
const LoginScreenLogic = ({ users, onLogin, onFail }) => {
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    const user = users.find(x => String(x.username).toLowerCase()===u.toLowerCase() && String(x.password)===p); 
    if(user) onLogin(user); else onFail(); 
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <User className="absolute left-4 top-4 text-slate-500" size={18} />
        <input className="w-full bg-black/40 border border-white/10 text-white p-4 pl-12 rounded-xl outline-none focus:border-orange-500 transition" placeholder="ID Petugas (Username)" onChange={e=>setU(e.target.value)} required />
      </div>
      <div className="relative">
        <KeyRound className="absolute left-4 top-4 text-slate-500" size={18} />
        <input type="password" className="w-full bg-black/40 border border-white/10 text-white p-4 pl-12 rounded-xl outline-none focus:border-orange-500 transition" placeholder="Kata Sandi" onChange={e=>setP(e.target.value)} required />
      </div>
      <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition transform hover:scale-[1.02]">
        MASUK SISTEM
      </button>
    </form>
  );
};

// --- DASHBOARD VIEW (ENHANCED SAFE MAPPING) ---
const DashboardView = ({ stats, reports, isSyncing, onSync, isDark, currentUser, onEdit, onExportCSV, onPrintPDF }) => (
  <div className="space-y-8 animate-fadeIn">
    {/* Headings */}
    <div>
      <h2 className="text-3xl font-black tracking-tight">Dashboard Pemantauan</h2>
      <p className="opacity-60 mt-1">Ringkasan data assessment bencana secara real-time.</p>
    </div>

    {/* Stat Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Total Laporan" value={stats.totalData} icon={Database} color="blue" isDark={isDark} />
      <StatCard title="Total Valuasi Kerugian" value={`Rp ${(stats.totalLoss/1000000).toFixed(0)} Juta`} icon={Calculator} color="orange" isDark={isDark} />
      <StatCard title="Status Jaringan" value="Terhubung" icon={Signal} color="emerald" isDark={isDark} />
    </div>

    {/* Main Data Table */}
    <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#1e293b]/80 border-white/10 backdrop-blur-xl' : 'bg-white shadow-2xl border-slate-200'}`}>
      <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2"><Activity className="text-orange-500"/> Log Input Terkini</h3>
          <p className="text-xs opacity-50 mt-1">Menampilkan seluruh data masuk dari surveyor lapangan.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={onSync} disabled={isSyncing} className={`flex-1 md:flex-none flex justify-center items-center gap-2 text-sm bg-blue-500/10 text-blue-500 px-4 py-2.5 rounded-xl font-bold hover:bg-blue-500/20 transition ${isSyncing ? 'opacity-50' : ''}`}>
              {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Refresh
            </button>
            {currentUser.role === 'admin' && (
              <button onClick={onExportCSV} className="flex-1 md:flex-none flex justify-center items-center gap-2 text-sm bg-emerald-500/10 text-emerald-500 px-4 py-2.5 rounded-xl font-bold hover:bg-emerald-500/20 transition">
                <FileSpreadsheet size={16} /> Export Data (.csv)
              </button>
            )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'bg-black/30 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <tr>
              <th className="px-6 py-5">Identitas Pemilik</th>
              <th className="px-6 py-5">Lokasi Kejadian</th>
              <th className="px-6 py-5">Dimensi / Luas</th>
              <th className="px-6 py-5">Tingkat Kerusakan</th>
              <th className="px-6 py-5">Dokumentasi</th>
              <th className="px-6 py-5 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reports.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-10 text-center opacity-50 italic">Belum ada data laporan yang direkam.</td></tr>
            ) : reports.map((row, idx) => (
              <tr key={idx} className={`transition duration-200 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                <td className="px-6 py-4">
                  <div className="font-bold text-base">{row?.survivor?.nama || 'Tanpa Nama'}</div>
                  <div className="text-[10px] opacity-60 flex items-center gap-1 mt-1"><UserCog size={10}/> Petugas: {row?.surveyor || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-sm">Kel. {row?.survivor?.kelurahan || '-'}</div>
                  <div className="text-[11px] opacity-60 mt-1">RT {row?.survivor?.rt || '-'} / RW {row?.survivor?.rw || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono bg-slate-500/10 px-2 py-1 rounded text-xs inline-block border border-slate-500/20">{row?.building?.luas || 0} m²</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    row?.building?.kerusakan === 'rusak' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    row?.building?.kerusakan === 'sedang' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {row?.building?.kerusakan || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {row?.photos ? (
                    <a href={row.photos.split('\n')[0]} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:text-blue-400 font-semibold text-xs bg-blue-500/10 px-3 py-1.5 rounded-lg w-fit transition">
                      <Camera size={14}/> Lihat Foto
                    </a>
                  ) : <span className="text-xs opacity-30 italic">Tanpa Foto</span>}
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <button onClick={() => onPrintPDF(row)} className="p-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white transition" title="Unduh PDF Resmi">
                    <Printer size={18}/>
                  </button>
                  {(currentUser.role === 'admin' || currentUser.username === row?.surveyor) && (
                    <button onClick={() => onEdit(row)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition" title="Koreksi Data">
                      <Edit size={18}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// --- INPUT FORM (POLISHED UI) ---
const InputForm = ({ user, isDark, onSuccess, googleScriptUrl, editData, onCancelEdit }) => {
  const [activeTab, setActiveTab] = useState('A'); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [locked, setLocked] = useState(false); 
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [survivor, setSurvivor] = useState({ nama: '', alamat: '', kelurahan: '', rt: '', rw: '', lat: '', lng: '' });
  const [building, setBuilding] = useState({ panjang: '', lebar: '', luas: 0, lantai: '', kerusakan: 'sedang', persentase: '', asetTerdampak: '', foto: [], keterangan: '', legalitas: 'SHM', njop: '', totalKerugianBangunan: 0 });
  const [families, setFamilies] = useState([]); const [assetLoss, setAssetLoss] = useState(''); const [notes, setNotes] = useState('');
  
  useEffect(() => { if (editData) { setSurvivor(editData.survivor || { nama: '', alamat: '', kelurahan: '', rt: '', rw: '', lat: '', lng: '' }); setBuilding({ legalitas: 'SHM', njop: '', totalKerugianBangunan: 0, ...(editData.building||{}), foto: [] }); setFamilies(editData.families || []); setAssetLoss(editData.assets?.totalKerugian || ''); setLocked(true); } else if (user?.assignedKelurahan) { setSurvivor(prev => ({ ...prev, kelurahan: user.assignedKelurahan })); } }, [editData, user]);
  useEffect(() => { const p=parseFloat(building.panjang), l=parseFloat(building.lebar); setBuilding(prev=>({...prev, luas: (!isNaN(p)&&!isNaN(l)?(p*l).toFixed(2):0)})); }, [building.panjang, building.lebar]);
  useEffect(() => { const luas = parseFloat(building.luas)||0; const njop = parseFloat(building.njop)||0; setBuilding(prev => ({ ...prev, totalKerugianBangunan: luas * njop })); }, [building.luas, building.njop]);
  
  const handleGetLocation = () => { if(navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => { setSurvivor(prev => ({ ...prev, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })); setLocked(true); }, () => alert("Gagal mendapatkan GPS.")); };
  const addFamily = () => setFamilies([...families, { id: Date.now(), nama: '', kerja: '', jmlAnggota: '', jmlSekolah: '', gaji: '', hari: '', rugi: 0 }]);
  const updateFamily = (id, field, val) => { setFamilies(families.map(f => { if(f.id === id) { const up = { ...f, [field]: val }; if(field === 'gaji' || field === 'hari') up.rugi = (parseFloat(up.gaji)||0) * (parseFloat(up.hari)||0); return up; } return f; })); };
  const handleFileChange = async (e) => { const files = Array.from(e.target.files); const base64Files = await Promise.all(files.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result.split(',')[1] }); reader.onerror = reject; }))); setBuilding(prev => ({ ...prev, foto: [...prev.foto, ...base64Files] })); };
  const handleConfirmSubmit = () => { setShowConfirm(false); setIsSubmitting(true); const action = editData ? 'edit_report' : 'submit_report'; const payload = { action, originalTimestamp: editData?.timestamp, timestamp: editData?.timestamp || new Date().toISOString(), surveyor: user.username, survivor, building, families, assets: { totalKerugian: assetLoss, notes }, photos: building.foto }; if (googleScriptUrl) fetch(googleScriptUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) }).then(() => { setIsSubmitting(false); onSuccess(); }).catch(err => { console.error(err); setIsSubmitting(false); }); };
  
  const inputClass = `w-full p-4 rounded-xl border-2 outline-none transition duration-300 font-medium ${isDark ? 'bg-[#0b1120] border-white/10 focus:border-orange-500 text-white' : 'bg-slate-50 border-slate-200 focus:border-orange-500 text-slate-900'}`;
  const labelClass = "text-[11px] font-bold uppercase opacity-50 tracking-widest mb-2 block";

  return (
    <div className={`max-w-4xl mx-auto rounded-3xl border shadow-2xl overflow-hidden animate-slideIn ${isDark ? 'bg-[#1e293b]/90 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
      <div className={`p-8 border-b flex justify-between items-center ${isDark ? 'bg-orange-900/20 border-white/10' : 'bg-orange-50 border-orange-100'}`}>
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 text-orange-500">
            <FileText size={28}/> {editData ? 'KOREKSI LAPORAN' : 'FORMULIR ASSESSMENT'}
          </h2>
          <p className="text-sm opacity-60 mt-1 font-medium">Petugas: {user.name} | Area: {user.assignedKelurahan || 'Global'}</p>
        </div>
        {editData && <button onClick={onCancelEdit} className="text-sm bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition">Batal Edit</button>}
      </div>
      
      <div className="flex border-b border-white/10 overflow-x-auto">
        {['A. Identitas Penyintas', 'B. Kerusakan Fisik', 'C. Sosial Ekonomi'].map((t, i) => (
          <button key={i} onClick={() => setActiveTab(t.charAt(0))} className={`flex-1 min-w-[150px] py-5 text-sm font-bold border-b-4 transition duration-300 ${activeTab === t.charAt(0) ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-transparent opacity-40 hover:opacity-100'}`}>{t}</button>
        ))}
      </div>
      
      <div className="p-8 space-y-6">
        {activeTab === 'A' && (
          <div className="space-y-6 animate-fadeIn">
             <div className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isDark ? 'bg-blue-900/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                <div>
                  <h3 className="font-bold text-lg text-blue-500 flex items-center gap-2"><MapPin size={20}/> Koordinat Lokasi (Wajib)</h3>
                  <p className="text-sm opacity-70 mt-1 font-mono">{locked ? `${survivor.lat}, ${survivor.lng}` : 'Kunci lokasi Anda saat ini.'}</p>
                </div>
                <button type="button" onClick={handleGetLocation} className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition ${locked ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse'}`}>
                  {locked ? 'TERKUNCI ✓' : 'AMBIL GPS SEKARANG'}
                </button>
             </div>
             <div><label className={labelClass}>Nama Kepala Keluarga / Pemilik</label><input required value={survivor.nama} onChange={e => setSurvivor({...survivor, nama: e.target.value})} className={inputClass} placeholder="Masukkan Nama Lengkap"/></div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="md:col-span-1"><label className={labelClass}>Kelurahan</label><input required value={survivor.kelurahan} onChange={e => setSurvivor({...survivor, kelurahan: e.target.value.toUpperCase()})} className={`${inputClass} uppercase`} readOnly={!!user.assignedKelurahan && !editData} placeholder={user.assignedKelurahan ? "TERKUNCI" : "Nama Kelurahan"} /></div>
               <div><label className={labelClass}>RT</label><input placeholder="Misal: 001" type="number" value={survivor.rt} onChange={e => setSurvivor({...survivor, rt: e.target.value})} className={inputClass} /></div>
               <div><label className={labelClass}>RW</label><input placeholder="Misal: 012" type="number" value={survivor.rw} onChange={e => setSurvivor({...survivor, rw: e.target.value})} className={inputClass} /></div>
             </div>
             <div><label className={labelClass}>Alamat Lengkap</label><textarea value={survivor.alamat} onChange={e => setSurvivor({...survivor, alamat: e.target.value})} className={inputClass} rows="3" placeholder="Nama Jalan, Gang, Nomor Rumah..."></textarea></div>
          </div>
        )}

        {activeTab === 'B' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className={labelClass}>Panjang (Meter)</label><input type="number" value={building.panjang} onChange={e => setBuilding({...building, panjang: e.target.value})} className={inputClass} placeholder="0"/></div>
                <div><label className={labelClass}>Lebar (Meter)</label><input type="number" value={building.lebar} onChange={e => setBuilding({...building, lebar: e.target.value})} className={inputClass} placeholder="0"/></div>
                <div><label className={labelClass}>Luas Kalkulasi (m²)</label><input readOnly value={building.luas} className={`${inputClass} opacity-50 cursor-not-allowed bg-black/10`} /></div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div><label className={labelClass}>Status Kepemilikan (Legalitas)</label><select value={building.legalitas} onChange={e => setBuilding({...building, legalitas: e.target.value})} className={inputClass}>{['SHM', 'SHGB', 'SHGU', 'SHP', 'HPL', 'SHMSRS', 'GIRIK', 'Surat Lainnya'].map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
               <div><label className={labelClass}>Jumlah Lantai</label><input type="number" placeholder="Contoh: 2" value={building.lantai} onChange={e => setBuilding({...building, lantai: e.target.value})} className={inputClass} /></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border-2 border-orange-500/20 bg-orange-500/5 relative overflow-hidden">
               <Landmark className="absolute -right-4 -bottom-4 text-orange-500/10 w-32 h-32" />
               <div className="relative z-10"><label className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2 block">Estimasi Harga NJOP (Per m²)</label><input type="number" placeholder="Rp" value={building.njop} onChange={e => setBuilding({...building, njop: e.target.value})} className={`${inputClass} border-orange-500/30 focus:border-orange-500`} /></div>
               <div className="relative z-10"><label className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-2 block">Total Nilai Kerugian Bangunan</label><input readOnly value={`Rp ${parseFloat(building.totalKerugianBangunan||0).toLocaleString()}`} className={`${inputClass} font-mono font-bold text-orange-500 bg-orange-500/10 cursor-not-allowed border-orange-500/20`} /></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={labelClass}>Tingkat Kerusakan Fisik</label><select value={building.kerusakan} onChange={e => setBuilding({...building, kerusakan: e.target.value})} className={inputClass}><option value="baik">Rusak Ringan</option><option value="sedang">Rusak Sedang</option><option value="rusak">Rusak Berat</option></select></div>
                <div><label className={labelClass}>Persentase Kerusakan (%)</label><input type="number" max="100" value={building.persentase} onChange={e => setBuilding({...building, persentase: e.target.value})} className={inputClass} placeholder="0 - 100"/></div>
             </div>

             <div><label className={labelClass}>Rincian Aset Terdampak (Perabotan/Elektronik)</label><textarea value={building.asetTerdampak} onChange={e => setBuilding({...building, asetTerdampak: e.target.value})} className={inputClass} rows="3" placeholder="Sebutkan barang yang rusak (Contoh: Kulkas, 2 Kasur, Lemari Kayu)"/></div>
             
             <div>
               <label className={labelClass}>Unggah Dokumentasi Foto (Multiple)</label>
               <div className={`border-2 border-dashed rounded-2xl p-10 text-center hover:border-orange-500 cursor-pointer transition ${isDark?'border-white/20 bg-[#0b1120]':'border-slate-300 bg-slate-50'}`}>
                 <input type="file" multiple onChange={handleFileChange} className="hidden" id="fup"/>
                 <label htmlFor="fup" className="cursor-pointer flex flex-col items-center">
                   <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-4"><Camera size={32}/></div>
                   <p className="font-bold text-lg">{editData ? 'Timpa Dengan Foto Baru' : 'Sentuh untuk Unggah Foto'}</p>
                   <p className="text-xs opacity-50 mt-2">Dukung format JPG/PNG</p>
                   {building.foto.length>0 && <p className="text-sm text-emerald-500 font-bold mt-4 bg-emerald-500/10 px-4 py-2 rounded-full">{building.foto.length} Foto Siap Dikirim ✓</p>}
                 </label>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'C' && (
          <div className="space-y-6 animate-fadeIn">
             <div className={`p-6 rounded-2xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2"><Users className="text-blue-500"/> Data Keluarga Terdampak</h3>
                    <p className="text-xs opacity-50 mt-1">Satu bangunan bisa dihuni lebih dari 1 KK.</p>
                  </div>
                  <button type="button" onClick={addFamily} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition flex items-center gap-2"><Plus size={16}/> Tambah KK</button>
                </div>
                
                <div className="space-y-4">
                  {families.map((f, idx) => (
                    <div key={f.id} className={`p-5 rounded-xl border relative ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-300 shadow-sm'}`}>
                        <button type="button" onClick={() => setFamilies(families.filter(x => x.id !== f.id))} className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"><Trash2 size={14}/></button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div><label className="text-[10px] uppercase opacity-50 font-bold mb-1 block">Kepala Keluarga</label><input placeholder="Nama" value={f.nama} onChange={e => updateFamily(f.id, 'nama', e.target.value)} className={inputClass} /></div>
                          <div><label className="text-[10px] uppercase opacity-50 font-bold mb-1 block">Pekerjaan</label><input placeholder="Pekerjaan" value={f.kerja} onChange={e => updateFamily(f.id, 'kerja', e.target.value)} className={inputClass} /></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div><label className="text-[10px] uppercase opacity-50 font-bold mb-1 block">Jml Anggota</label><input type="number" placeholder="Jiwa" value={f.jmlAnggota} onChange={e => updateFamily(f.id, 'jmlAnggota', e.target.value)} className={inputClass} /></div>
                          <div><label className="text-[10px] uppercase opacity-50 font-bold mb-1 block">Anak Sekolah</label><input type="number" placeholder="Jiwa" value={f.jmlSekolah} onChange={e => updateFamily(f.id, 'jmlSekolah', e.target.value)} className={inputClass} /></div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                          <div><label className="text-[10px] uppercase text-orange-500 font-bold mb-1 block">Penghasilan/Hari</label><input type="number" placeholder="Rp" value={f.gaji} onChange={e => updateFamily(f.id, 'gaji', e.target.value)} className={inputClass} /></div>
                          <div><label className="text-[10px] uppercase text-orange-500 font-bold mb-1 block">Hari Terhenti</label><input type="number" placeholder="Hari" value={f.hari} onChange={e => updateFamily(f.id, 'hari', e.target.value)} className={inputClass} /></div>
                          <div><label className="text-[10px] uppercase text-orange-500 font-bold mb-1 block">Loss Ekonomi</label><input readOnly value={`Rp ${f.rugi.toLocaleString()}`} className={`${inputClass} font-mono font-bold bg-black/10`} /></div>
                        </div>
                    </div>
                  ))}
                  {families.length === 0 && <p className="text-center text-sm opacity-50 py-8 italic">Klik 'Tambah KK' jika ada data keluarga yang menempati.</p>}
                </div>
             </div>
             
             <div>
               <label className={labelClass}>Total Estimasi Kerugian Aset Isian (Di luar bangunan)</label>
               <div className="relative">
                 <span className="absolute left-4 top-4 font-bold opacity-50">Rp</span>
                 <input type="number" value={assetLoss} onChange={e => setAssetLoss(e.target.value)} className={`${inputClass} pl-12 text-lg font-bold`} placeholder="0" />
               </div>
               <p className="text-[10px] opacity-50 mt-2">Isi dengan akumulasi nilai perabotan/harta benda yang rusak.</p>
             </div>
          </div>
        )}
        
        {/* ACTION BUTTONS */}
        <div className="pt-8 mt-4 flex justify-between items-center border-t border-white/10">
           <button type="button" onClick={() => setActiveTab(prev => prev === 'C' ? 'B' : 'A')} className={`px-6 py-3 font-bold opacity-50 hover:opacity-100 transition ${activeTab === 'A' ? 'invisible' : ''}`}>&larr; KEMBALI</button>
           {activeTab !== 'C' ? (
             <button type="button" onClick={() => setActiveTab(prev => prev === 'A' ? 'B' : 'C')} className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition">LANJUTKAN &rarr;</button>
           ) : (
             <button type="button" onClick={() => setShowConfirm(true)} disabled={isSubmitting} className={`bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-4 rounded-xl font-black shadow-xl shadow-orange-500/30 flex items-center gap-3 transition ${isSubmitting ? 'opacity-50' : 'hover:scale-105'}`}>
                {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> MEMPROSES...</> : <><Save size={20}/> {editData ? 'SIMPAN PEMBARUAN' : 'KIRIM LAPORAN'}</>}
             </button>
           )}
        </div>
      </div>
      <ConfirmationModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={handleConfirmSubmit} isDark={isDark} />
    </div>
  );
};

// --- SUPPORTING UI COMPONENTS ---
const NavButton = ({ icon: Icon, label, active, onClick }) => <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 text-sm font-bold ${active ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={18} /> {label}</button>;
const NotificationSetting = ({ currentText, onSave, isDark }) => { const [txt, setTxt] = useState(currentText); return (<div className={`p-8 rounded-3xl border shadow-2xl ${isDark ? 'bg-[#1e293b]/90 border-white/10' : 'bg-white border-slate-200'}`}><h3 className="font-bold text-xl mb-6 flex items-center gap-2"><Megaphone className="text-orange-500"/> Siaran Pengumuman (Running Text)</h3><textarea className={`w-full p-5 rounded-2xl border-2 outline-none mb-6 font-medium ${isDark?'bg-black/20 border-white/10 focus:border-orange-500':'bg-slate-50 focus:border-orange-500'}`} rows="4" value={txt} onChange={e=>setTxt(e.target.value)}></textarea><button onClick={() => onSave(txt)} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-orange-600 transition">Update Siaran</button></div>); };
const NotificationToast = ({ notification }) => (!notification.show ? null : <div className={`fixed top-24 right-6 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-bounce-in border backdrop-blur-xl ${notification.type==='error'?'bg-red-900/95 border-red-500 text-white':'bg-emerald-900/95 border-emerald-500 text-white'}`}>{notification.type==='error'?<XCircle size={28}/>:<CheckCircle size={28}/>}<div><h4 className="font-black text-sm">{notification.type==='error'?'Peringatan':'Sukses'}</h4><p className="text-xs font-medium opacity-90 mt-0.5">{notification.message}</p></div></div>);
const ConfirmationModal = ({ isOpen, onClose, onConfirm, isDark }) => (!isOpen ? null : <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div><div className={`relative w-full max-w-md p-8 rounded-3xl shadow-2xl border animate-bounce-in text-center ${isDark ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}><div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck size={40} className="text-orange-500"/></div><h3 className="text-2xl font-black mb-2">Konfirmasi Data</h3><p className="text-sm opacity-60 mb-8 leading-relaxed">Apakah Anda yakin data yang dimasukkan sudah benar dan valid sesuai kondisi lapangan?</p><div className="flex gap-3"><button onClick={onClose} className={`flex-1 py-3.5 rounded-xl font-bold border-2 ${isDark?'border-white/10 hover:bg-white/5':'border-slate-200 hover:bg-slate-50'}`}>PERIKSA LAGI</button><button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg shadow-orange-500/30">YA, KIRIM DATA</button></div></div></div>);
const StatCard = ({ title, value, icon: Icon, color, isDark }) => <div className={`p-8 rounded-3xl border relative overflow-hidden group hover:-translate-y-1 transition duration-300 ${isDark ? 'bg-[#1e293b]/90 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-xl'}`}><div className={`absolute -right-10 -top-10 w-40 h-40 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition duration-500`}></div><div className="relative z-10 flex justify-between items-start"><div><p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2">{title}</p><h3 className="text-3xl lg:text-4xl font-black tracking-tight">{value}</h3></div><div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}><Icon size={24}/></div></div></div>;

const UserProfile = ({ user, onUpdate, isDark }) => { 
  const [name, setName] = useState(user.name); const [pass, setPass] = useState(''); 
  return (<div className={`max-w-md mx-auto p-8 rounded-3xl border shadow-2xl animate-slideIn mt-10 ${isDark ? 'bg-[#1e293b]/90 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200'}`}><div className="flex flex-col items-center mb-8"><div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-black text-white mb-4 shadow-xl border-4 border-[#0f172a]">{user.name.charAt(0)}</div><h2 className="text-2xl font-black">Profil Petugas</h2><p className="opacity-60 text-sm font-mono mt-1">ID: @{user.username} | {user.assignedKelurahan || 'Admin Pusat'}</p></div><div className="space-y-5"><div><label className="text-[11px] font-bold uppercase opacity-50 tracking-widest mb-2 block">Nama Lengkap</label><input className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark?'bg-black/20 border-white/10 focus:border-blue-500':'bg-slate-50 focus:border-blue-500'}`} value={name} onChange={e=>setName(e.target.value)} /></div><div><label className="text-[11px] font-bold uppercase opacity-50 tracking-widest mb-2 block">Ubah Kata Sandi (Opsional)</label><input type="password" placeholder="Kosongkan jika tidak ingin diubah" className={`w-full p-4 rounded-xl border-2 outline-none font-bold ${isDark?'bg-black/20 border-white/10 focus:border-blue-500':'bg-slate-50 focus:border-blue-500'}`} value={pass} onChange={e=>setPass(e.target.value)} /></div><button onClick={() => {onUpdate({ name, password: pass || user.password }); setPass('');}} className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 transition">SIMPAN PEMBARUAN</button></div></div>); 
};

// --- FIX: USER MANAGEMENT FORM WITH BACKEND COMMUNICATION ---
const UserManagement = ({ users, setUsers, isDark, googleScriptUrl, showToast }) => { 
  const [form, setForm] = useState({ id: null, originalUsername: '', name: '', username: '', password: '', assignedKelurahan: '', role: 'user' }); 
  
  const save = (e) => { 
    e.preventDefault(); 
    if(form.id) { 
      // Update local state for immediate feedback
      setUsers(users.map(u => u.id === form.id ? form : u)); 
      // Push update to backend
      if(googleScriptUrl) {
         fetch(googleScriptUrl, { 
             method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, 
             body: JSON.stringify({ action: 'edit_user', user: form }) 
         });
      }
      showToast("Data User Diperbarui", 'success');
    } else { 
      // Add new local state
      setUsers([...users, { ...form, id: Date.now() }]); 
      // Push addition to backend
      if(googleScriptUrl) { 
         fetch(googleScriptUrl, { 
             method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, 
             body: JSON.stringify({ action: 'manage_user', user: form }) 
         }); 
      } 
      showToast("User Baru Tersimpan", 'success');
    } 
    setForm({ id: null, originalUsername: '', name: '', username: '', password: '', assignedKelurahan: '', role: 'user' }); 
  }; 

  const handleDelete = (id) => {
    const userToDelete = users.find(u => u.id === id);
    setUsers(users.filter(x => x.id !== id));
    if(googleScriptUrl && userToDelete) {
        fetch(googleScriptUrl, { 
             method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, 
             body: JSON.stringify({ action: 'delete_user', username: userToDelete.username }) 
        });
    }
    showToast("User Dihapus", 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideIn">
        <div className={`p-8 rounded-3xl border h-fit shadow-2xl ${isDark ? 'bg-[#1e293b]/90 border-white/10' : 'bg-white border-slate-200'}`}>
            <h3 className="font-black text-xl mb-6 flex items-center gap-2">
                <UserCog className="text-blue-500"/> {form.id ? 'Edit Akses' : 'Buat Akses Baru'}
            </h3>
            <form onSubmit={save} className="space-y-4">
                <input required placeholder="Nama Lengkap Petugas" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className={`w-full p-3 rounded-xl border outline-none text-sm font-medium ${isDark?'bg-black/20 border-white/10':'bg-slate-50'}`} />
                <input required placeholder="Username (ID Login)" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className={`w-full p-3 rounded-xl border outline-none text-sm font-medium ${isDark?'bg-black/20 border-white/10':'bg-slate-50'}`} />
                <input required placeholder="Kata Sandi" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className={`w-full p-3 rounded-xl border outline-none text-sm font-medium ${isDark?'bg-black/20 border-white/10':'bg-slate-50'}`} />
                <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className={`w-full p-3 rounded-xl border outline-none text-sm font-medium ${isDark?'bg-black/20 border-white/10':'bg-slate-50'}`}>
                    <option value="user">Petugas Lapangan (User)</option>
                    <option value="admin">Administrator (Admin)</option>
                </select>
                <input placeholder="Kunci Area (Cth: PLUIT)" value={form.assignedKelurahan} onChange={e=>setForm({...form, assignedKelurahan:e.target.value.toUpperCase()})} className={`w-full p-3 rounded-xl border outline-none text-sm font-medium uppercase ${isDark?'bg-black/20 border-white/10':'bg-slate-50'}`} />
                <div className="flex gap-2">
                    {form.id && <button type="button" onClick={() => setForm({ id: null, originalUsername: '', name: '', username: '', password: '', assignedKelurahan: '', role: 'user' })} className="py-3 px-4 mt-2 bg-slate-500/20 text-slate-400 rounded-xl font-bold">Batal</button>}
                    <button type="submit" className="flex-1 py-3 mt-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg">SIMPAN AKSES</button>
                </div>
            </form>
        </div>
        <div className="lg:col-span-2 space-y-4">
            {users.map(u => (
                <div key={u.id} className={`p-5 rounded-2xl border flex justify-between items-center transition ${isDark ? 'bg-[#1e293b]/50 border-white/5 hover:bg-[#1e293b]' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{u.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${u.role === 'admin' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>{u.role}</span>
                        </div>
                        <p className="text-xs opacity-60 font-mono mt-1">@{u.username} | {u.assignedKelurahan || 'Akses Global'}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setForm({...u, originalUsername: u.username})} className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition"><Edit size={16}/></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  ); 
};

export default App;
