'use client';
import { useState, useEffect } from 'react';

const CATEGORIES = ['Groceries', 'Food', 'Transportasi', 'Pendidikan', 'Kesehatan', 'Lainnya'];
const METHODS = ['Cash', 'Qris', 'Bank', 'Kasbon'];
const FAMILY_MEMBERS = ['Idris', 'Abi', 'Umi' , 'Hanifah'];

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('Idris'); // State untuk identitas login
  
  const [activeTab, setActiveTab] = useState<'add' | 'history'>('add');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Filter State
  const [filterMember, setFilterMember] = useState('All');
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Form State
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    pembayar: 'Idris',
    namaBarang: '',
    kategori: '',
    berat: '',
    harga: '',
    metodePembayaran: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cek sesi saat aplikasi dibuka
  useEffect(() => {
    const loggedIn = localStorage.getItem('family_logged_in');
    const savedProfile = localStorage.getItem('family_profile');
    
    if (loggedIn === 'true' && savedProfile) {
      setIsAuth(true);
      setSelectedProfile(savedProfile);
      setFilterMember(savedProfile); // Langsung filter ke nama sendiri
      setFormData(prev => ({ ...prev, pembayar: savedProfile }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // Menambahkan timestamp agar browser tidak memakai cache
      const res = await fetch(`/api/expenses?t=${new Date().getTime()}`);
      const data = await res.json();
      setHistoryData(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoadingHistory(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === process.env.NEXT_PUBLIC_FAMILY_PIN) {
      setIsAuth(true);
      localStorage.setItem('family_logged_in', 'true');
      localStorage.setItem('family_profile', selectedProfile);
      
      setFilterMember(selectedProfile);
      setFormData(prev => ({ ...prev, pembayar: selectedProfile }));
      setActiveTab('history');
    } else {
      alert('PIN Salah!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('family_logged_in');
    localStorage.removeItem('family_profile');
    setIsAuth(false);
    setPinInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kategori || !formData.metodePembayaran) {
      alert('Pilih kategori dan metode pembayaran!'); return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setFormData({ ...formData, namaBarang: '', harga: '', berat: '', kategori: '', metodePembayaran: '' });
        setActiveTab('history'); 
      } else {
        alert('Terjadi kendala saat menyimpan ke Spreadsheet.');
      }
    } catch (error) {
      alert('Gagal menghubungi server.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (item: any) => {
    const konfirmasi = window.confirm(`Hapus catatan "${item.namaBarang}"?`);
    if (!konfirmasi) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: item.tanggal,
          namaBarang: item.namaBarang,
          harga: item.harga,
        }),
      });

      if (res.ok) {
        fetchHistory(); 
      } else {
        alert(`Gagal menghapus data.`);
      }
    } catch (e) {
      alert('Terjadi kesalahan sistem.');
    }
  };

  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ''); 
    setFormData({ ...formData, harga: rawValue });
  };

  const formatRupiah = (val: any) => {
    if (!val) return '0';
    let strVal = String(val);
    if (strVal.endsWith('.00')) strVal = strVal.slice(0, -3);
    const cleanNumber = strVal.replace(/[^0-9]/g, '');
    return Number(cleanNumber).toLocaleString('id-ID');
  };

  const filteredHistory = historyData.filter(item => {
    if (filterMember !== 'All' && item.pembayar !== filterMember) return false;
    if (item.tanggal) {
      if (item.tanggal.startsWith(filterMonth)) return true;
      const d = new Date(item.tanggal);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        if (`${yyyy}-${mm}` === filterMonth) return true;
      }
      return false; 
    }
    return true;
  });

  const totalPengeluaran = filteredHistory.reduce((sum, item) => {
    let strPrice = String(item.harga || '0');
    if (strPrice.endsWith('.00')) strPrice = strPrice.slice(0, -3);
    const cleanPrice = strPrice.replace(/[^0-9]/g, '');
    return sum + (Number(cleanPrice) || 0);
  }, 0);

  // --- HALAMAN LOGIN BARU DENGAN PROFIL ---
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">FinanceFamily</h1>
          <p className="text-slate-500 mb-6 text-sm">Pilih profil dan masukkan PIN</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block text-left">Saya Adalah:</label>
              <select 
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {FAMILY_MEMBERS.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block text-left">PIN Keluarga:</label>
              <input 
                type="password" 
                value={pinInput} 
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="••••"
                maxLength={6}
              />
            </div>
            
            <button type="submit" className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 mt-2 shadow-lg">Masuk Aplikasi</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {activeTab === 'add' && (
        <div className="max-w-md mx-auto bg-white min-h-screen p-5">
           <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-800">Catat Pengeluaran</h1>
            <input 
              type="date" 
              value={formData.tanggal} 
              onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
              className="bg-slate-100 text-sm py-1.5 px-3 rounded-lg text-slate-600 outline-none cursor-pointer"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center">
              <span className="text-slate-400 font-bold text-xl mr-3">Rp</span>
              <input 
                type="text" 
                inputMode="numeric"
                required 
                placeholder="0"
                value={formData.harga ? Number(formData.harga).toLocaleString('id-ID') : ''} 
                onChange={handleHargaChange}
                className="bg-transparent text-4xl font-bold text-slate-800 w-full outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Item / Barang</label>
              <input type="text" required placeholder="Apa yang kamu beli?" value={formData.namaBarang} onChange={(e) => setFormData({...formData, namaBarang: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-transparent text-slate-800"/>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setFormData({...formData, kategori: cat})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.kategori === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Metode Pembayaran</label>
              <div className="flex flex-wrap gap-2">
                {METHODS.map(met => (
                  <button key={met} type="button" onClick={() => setFormData({...formData, metodePembayaran: met})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.metodePembayaran === met ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {met}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Dibayar Oleh (Otomatis)</label>
              <div className="w-full bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-xl">
                {formData.pembayar}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl mt-4 shadow-lg disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="max-w-md mx-auto min-h-screen p-5">
          
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-bold text-slate-800">Riwayat</h1>
            <input 
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-100 text-sm py-1.5 px-3 rounded-lg text-slate-600 outline-none cursor-pointer"
            />
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 mb-4 shadow-xl shadow-slate-900/10">
            <div className="flex justify-between items-start">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Pengeluaran</p>
              <button onClick={handleLogout} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 hover:text-white">Ganti Profil</button>
            </div>
            <h2 className="text-3xl font-black mt-2 tracking-tight">
              IDR {formatRupiah(totalPengeluaran)}
            </h2>
            <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-800 pt-2.5">
              Filter aktif: <span className="font-bold text-slate-300">{filterMember}</span>
            </p>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button 
              onClick={() => setFilterMember('All')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filterMember === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            {FAMILY_MEMBERS.map(member => (
              <button 
                key={member}
                onClick={() => setFilterMember(member)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filterMember === member ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {member}
              </button>
            ))}
          </div>
          
          {isLoadingHistory ? (
            <p className="text-center text-slate-400 mt-10 font-medium">Memuat data...</p>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xl tracking-tight">
                        IDR {formatRupiah(item.harga)}
                      </h3>
                      <p className="text-slate-600 text-base font-medium mt-0.5">{item.namaBarang}</p>
                    </div>
                    
                    <div className="text-right flex flex-col items-end justify-between min-h-[50px]">
                      <span className="text-slate-800 font-bold text-sm">{item.tanggal}</span>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="text-red-500 hover:text-red-700 text-sm p-1 mt-1 font-bold transition-all"
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold">
                      {item.kategori}
                    </span>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">
                      {item.metode}
                    </span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                      {item.pembayar}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredHistory.length === 0 && (
                <div className="text-center mt-10">
                  <p className="text-slate-400 font-medium">Tidak ada pengeluaran.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe">
        <div className="max-w-md mx-auto flex">
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-4 text-sm font-bold flex flex-col items-center justify-center gap-1 ${activeTab === 'add' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className="text-2xl leading-none">⊕</span>
            <span className="text-[10px] uppercase tracking-wider">Add</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-sm font-bold flex flex-col items-center justify-center gap-1 ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className="text-xl leading-none">◷</span>
            <span className="text-[10px] uppercase tracking-wider">History</span>
          </button>
        </div>
      </div>

    </div>
  );
}