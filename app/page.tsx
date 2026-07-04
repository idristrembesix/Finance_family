'use client';
import { useState, useEffect } from 'react';

const CATEGORIES_EXPENSE = ['Groceries', 'Food', 'Transportasi', 'Pendidikan', 'Kesehatan', 'Lainnya'];
const CATEGORIES_INCOME = ['Uang Saku / Jajan', 'Gaji / Nafkah', 'Pemberian', 'Lainnya'];
const METHODS = ['Cash', 'Qris', 'BCA Debit', 'Kasbon'];
const FAMILY_MEMBERS = ['Idris', 'Abi', 'Umi', 'Hanifah'];

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('Idris');
  
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
  const [formTipe, setFormTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    pembayar: 'Idris',
    namaBarang: '',
    kategori: '',
    harga: '',
    metodePembayaran: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('family_logged_in');
    const savedProfile = localStorage.getItem('family_profile');
    
    if (loggedIn === 'true' && savedProfile) {
      setIsAuth(true);
      setSelectedProfile(savedProfile);
      setFilterMember(savedProfile);
      setFormData(prev => ({ ...prev, pembayar: savedProfile }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
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
      alert('Pilih kategori dan metode!'); return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, tipe: formTipe }),
      });
      
      if (res.ok) {
        setFormData({ ...formData, namaBarang: '', harga: '', kategori: '', metodePembayaran: '' });
        setActiveTab('history'); 
      } else {
        alert('Gagal menyimpan data.');
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
          tipe: item.tipe
        }),
      });

      if (res.ok) fetchHistory(); 
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

  // 1. Filter Data Hanya Berdasarkan Bulan (Untuk keperluan hitung "All")
  const monthFilteredHistory = historyData.filter(item => {
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

  // 2. Filter Lanjutan Berdasarkan Nama Anggota (Untuk Detail History)
  const filteredHistory = monthFilteredHistory.filter(item => {
    if (filterMember !== 'All' && item.pembayar !== filterMember) return false;
    return true;
  });

  // 3. Hitung Nilai Finansial Otomatis untuk Kartu Hitam Atas
  const totalPemasukan = filteredHistory.filter(i => i.tipe === 'Pemasukan').reduce((sum, item) => {
    const price = String(item.harga || '0').replace(/[^0-9]/g, '');
    return sum + (Number(price) || 0);
  }, 0);

  const totalPengeluaran = filteredHistory.filter(i => i.tipe === 'Pengeluaran' || !i.tipe).reduce((sum, item) => {
    const price = String(item.harga || '0').replace(/[^0-9]/g, '');
    return sum + (Number(price) || 0);
  }, 0);

  const sisaSaldo = totalPemasukan - totalPengeluaran;

  // 4. Hitung Ringkasan Per Individu (Khusus saat tab "All" aktif)
  const ringkasanPerOrang = FAMILY_MEMBERS.map(member => {
    const dataOrang = monthFilteredHistory.filter(item => item.pembayar === member);
    const masuk = dataOrang.filter(i => i.tipe === 'Pemasukan').reduce((sum, item) => sum + (Number(String(item.harga || '0').replace(/[^0-9]/g, '')) || 0), 0);
    const keluar = dataOrang.filter(i => i.tipe === 'Pengeluaran' || !i.tipe).reduce((sum, item) => sum + (Number(String(item.harga || '0').replace(/[^0-9]/g, '')) || 0), 0);
    return {
      nama: member,
      pemasukan: masuk,
      pengeluaran: keluar,
      saldo: masuk - keluar
    };
  });

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">FinanceFamily</h1>
          <p className="text-slate-500 mb-6 text-sm">Pilih profil dan masukkan PIN</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block text-left">Saya Adalah:</label>
              <select value={selectedProfile} onChange={(e) => setSelectedProfile(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                {FAMILY_MEMBERS.map(member => <option key={member} value={member}>{member}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block text-left">PIN Keluarga:</label>
              <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••" maxLength={6}/>
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
            <h1 className="text-xl font-bold text-slate-800">Catat Transaksi</h1>
            <input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="bg-slate-100 text-sm py-1.5 px-3 rounded-lg text-slate-600 outline-none cursor-pointer"/>
          </div>

          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6">
            <button type="button" onClick={() => { setFormTipe('Pemasukan'); setFormData({...formData, kategori: ''}); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formTipe === 'Pemasukan' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500'}`}>
              💰 Pemasukan
            </button>
            <button type="button" onClick={() => { setFormTipe('Pengeluaran'); setFormData({...formData, kategori: ''}); }} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${formTipe === 'Pengeluaran' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}>
              💸 Pengeluaran
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`rounded-2xl p-4 border flex items-center ${formTipe === 'Pemasukan' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <span className={`font-bold text-xl mr-3 ${formTipe === 'Pemasukan' ? 'text-emerald-600' : 'text-slate-400'}`}>Rp</span>
              <input type="text" inputMode="numeric" required placeholder="0" value={formData.harga ? Number(formData.harga).toLocaleString('id-ID') : ''} onChange={handleHargaChange} className="bg-transparent text-4xl font-bold text-slate-800 w-full outline-none"/>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                {formTipe === 'Pemasukan' ? 'Sumber Pemasukan (Keterangan)' : 'Item / Nama Barang'}
              </label>
              <input type="text" required placeholder={formTipe === 'Pemasukan' ? 'Contoh: Uang Saku Hanifah, Gaji, dll' : 'Apa yang kamu beli?'} value={formData.namaBarang} onChange={(e) => setFormData({...formData, namaBarang: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-transparent text-slate-800"/>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Kategori</label>
              <div className="flex flex-wrap gap-2">
                {(formTipe === 'Pemasukan' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(cat => (
                  <button key={cat} type="button" onClick={() => setFormData({...formData, kategori: cat})} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.kategori === cat ? (formTipe === 'Pemasukan' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                {formTipe === 'Pemasukan' ? 'Disimpan ke' : 'Metode Pembayaran'}
              </label>
              <div className="flex flex-wrap gap-2">
                {METHODS.map(met => (
                  <button key={met} type="button" onClick={() => setFormData({...formData, metodePembayaran: met})} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.metodePembayaran === met ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {met}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Anggota Keluarga</label>
              <div className="w-full bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl">
                {formData.pembayar}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={`w-full text-white font-bold py-4 rounded-2xl mt-4 shadow-lg disabled:opacity-50 transition-all ${formTipe === 'Pemasukan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
              {isSubmitting ? 'Menyimpan...' : `Simpan ${formTipe}`}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="max-w-md mx-auto min-h-screen p-5">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-xl font-bold text-slate-800">Riwayat</h1>
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="bg-slate-100 text-sm py-1.5 px-3 rounded-lg text-slate-600 outline-none cursor-pointer"/>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 mb-4 shadow-xl shadow-slate-900/10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                  {filterMember === 'All' ? 'Sisa Kas Keluarga' : `Sisa Dompet (${filterMember})`}
                </p>
                <h2 className={`text-3xl font-black mt-1 tracking-tight ${sisaSaldo < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  IDR {formatRupiah(sisaSaldo)}
                </h2>
              </div>
              <button onClick={handleLogout} className="text-xs bg-slate-800 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white font-semibold">Ganti Profil</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-sm">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Total Masuk</p>
                <p className="text-emerald-400 font-extrabold text-base mt-0.5">+ {formatRupiah(totalPemasukan)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase">Total Keluar</p>
                <p className="text-slate-300 font-extrabold text-base mt-0.5">- {formatRupiah(totalPengeluaran)}</p>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button onClick={() => setFilterMember('All')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filterMember === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
            {FAMILY_MEMBERS.map(member => (
              <button key={member} onClick={() => setFilterMember(member)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${filterMember === member ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}>{member}</button>
            ))}
          </div>
          
          {isLoadingHistory ? (
            <p className="text-center text-slate-400 mt-10 font-medium">Memuat data...</p>
          ) : filterMember === 'All' ? (
            /* TAMPILAN DASHBOARD PER ORANG JIKA 'ALL' DIPILIH */
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1">Ringkasan Per Individu</h3>
              {ringkasanPerOrang.map((ringkasan) => (
                <div key={ringkasan.nama} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                    <span className="font-extrabold text-slate-800 text-lg">{ringkasan.nama}</span>
                    <span className={`font-black text-lg tracking-tight ${ringkasan.saldo < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      IDR {formatRupiah(ringkasan.saldo)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-slate-400 font-semibold block text-xs uppercase tracking-wider">Pemasukan</span>
                      <span className="text-emerald-600 font-bold mt-0.5 block">+{formatRupiah(ringkasan.pemasukan)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 font-semibold block text-xs uppercase tracking-wider">Pengeluaran</span>
                      <span className="text-slate-700 font-bold mt-0.5 block">-{formatRupiah(ringkasan.pengeluaran)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TAMPILAN DETAIL TRANSAKSI JIKA PROFIL INDIVIDU DIPILIH */
            <div className="space-y-3">
              {filteredHistory.map((item, index) => (
                <div key={index} className={`bg-white p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border ${item.tipe === 'Pemasukan' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-extrabold text-xl tracking-tight ${item.tipe === 'Pemasukan' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        IDR {item.tipe === 'Pemasukan' ? '+' : ''} {formatRupiah(item.harga)}
                      </h3>
                      <p className="text-slate-600 text-base font-medium mt-0.5">{item.namaBarang}</p>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between min-h-[50px]">
                      <span className="text-slate-800 font-bold text-sm">{item.tanggal}</span>
                      <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700 text-sm p-1 mt-1 font-bold">🗑 Hapus</button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${item.tipe === 'Pemasukan' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.kategori}
                    </span>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">{item.metode}</span>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">{item.pembayar}</span>
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && <p className="text-center text-slate-400 mt-10 font-medium">Tidak ada transaksi.</p>}
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe">
        <div className="max-w-md mx-auto flex">
          <button onClick={() => setActiveTab('add')} className={`flex-1 py-4 text-sm font-bold flex flex-col items-center justify-center gap-1 ${activeTab === 'add' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className="text-2xl leading-none">⊕</span><span className="text-[10px] uppercase tracking-wider">Add</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-sm font-bold flex flex-col items-center justify-center gap-1 ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-400'}`}>
            <span className="text-xl leading-none">◷</span><span className="text-[10px] uppercase tracking-wider">History</span>
          </button>
        </div>
      </div>

    </div>
  );
}