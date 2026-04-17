import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
} from "firebase/firestore";
import {
  Heart,
  LogOut,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ChevronLeft,
  Scale,
  Ruler,
  Activity,
  Droplets,
  Save,
  User as UserIcon,
  LayoutDashboard,
} from "lucide-react";

// --- Firebase Configuration ---
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {
        apiKey: "AIzaSyBTGIGxrnCHU8Q3cO1I1MrPVKGfGudEsoI",
        authDomain: "shushastho-point.firebaseapp.com",
        projectId: "shushastho-point",
        storageBucket: "shushastho-point.firebasestorage.app",
        messagingSenderId: "339749833973",
        appId: "1:339749833973:web:eaac52314af523ebad89bc",
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId =
  typeof __app_id !== "undefined" ? __app_id : "shushastho-point-v1";

// --- Dictionary ---
const dict = {
  bn: {
    app_title: "সুস্বাস্থ্য পয়েন্ট",
    login: "লগইন",
    logout: "বের হন",
    welcome: "স্বাগতম!",
    username: "ইউজারনেম",
    password: "পাসওয়ার্ড",
    invalid_login: "ভুল ইউজারনেম বা পাসওয়ার্ড!",
    admin_panel: "অ্যাডমিন প্যানেল",
    user_panel: "ব্যক্তিগত ড্যাশবোর্ড",
    master_table: "মাস্টার টেবিল",
    data_entry: "ডাটা এন্ট্রি",
    user_mgmt: "ইউজার ম্যানেজমেন্ট",
    name: "পুরো নাম",
    age: "বয়স",
    height: "উচ্চতা",
    ft: "ফুট",
    in: "ইঞ্চি",
    weight: "ওজন",
    bmi_status: "BMI স্ট্যাটাস",
    bp: "ব্লাড প্রেশার",
    sugar: "সুগার",
    pulse: "হার্ট রেট",
    oxygen: "অক্সিজেন",
    date: "তারিখ",
    save: "সেভ করুন",
    cancel: "বাতিল",
    delete: "ডিলিট",
    edit: "এডিট",
    update: "আপডেট",
    confirm_del: "ডিলিট নিশ্চিত করুন",
    search: "ইউজার খুঁজুন...",
    history: "রেকর্ড ইতিহাস",
    profile: "প্রোফাইল",
    edit_profile: "প্রোফাইল এডিট করুন",
    cm: "সেমি",
    kg: "কেজি",
    smart_entry: "স্মার্ট ডাটা এন্ট্রি",
    updating: "রেকর্ড আপডেট করা হচ্ছে",
    new_entry: "নতুন রেকর্ড যোগ করা হচ্ছে",
    dashboard: "ড্যাশবোর্ড",
    select: "নির্বাচন করুন",
    actions: "অ্যাকশন",
    back: "ফিরে যান",
    success: "সফল হয়েছে",
  },
  en: {
    app_title: "Shushastho Point",
    login: "Login",
    logout: "Logout",
    welcome: "Welcome!",
    username: "Username",
    password: "Password",
    invalid_login: "Invalid username or password!",
    admin_panel: "Admin Panel",
    user_panel: "User Dashboard",
    master_table: "Master Table",
    data_entry: "Data Entry",
    user_mgmt: "User Management",
    name: "Full Name",
    age: "Age",
    height: "Height",
    ft: "ft",
    in: "in",
    weight: "Weight",
    bmi_status: "BMI Status",
    bp: "Blood Pressure",
    sugar: "Sugar",
    pulse: "Heart Rate",
    oxygen: "Oxygen",
    date: "Date",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    update: "Update",
    confirm_del: "Confirm Delete",
    search: "Search users...",
    history: "Record History",
    profile: "Profile",
    edit_profile: "Edit Profile",
    cm: "cm",
    kg: "kg",
    smart_entry: "Smart Data Entry",
    updating: "Updating record",
    new_entry: "Adding new record",
    dashboard: "Dashboard",
    select: "Select",
    actions: "Actions",
    back: "Back",
    success: "Success",
  },
};

// --- Helper Functions ---
const ftInToCm = (ft, inc) => {
  const totalInches = parseFloat(ft || 0) * 12 + parseFloat(inc || 0);
  return (totalInches * 2.54).toFixed(2);
};

const cmToFtIn = (cm) => {
  if (!cm) return { ft: "", in: "" };
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inc = Math.round(totalInches % 12);
  return { ft, in: inc };
};

const calcBMI = (w, h) =>
  w && h && h > 0
    ? (parseFloat(w) / (parseFloat(h) / 100) ** 2).toFixed(1)
    : null;

const getBMIInfo = (bmi, lang) => {
  if (!bmi)
    return {
      label: "—",
      bg: "bg-slate-100",
      text: "text-slate-400",
      ring: "ring-slate-200",
    };
  const b = parseFloat(bmi);
  if (b < 18.5)
    return {
      label: lang === "en" ? "Underweight" : "ওজন কম",
      bg: "bg-sky-50",
      text: "text-sky-600",
      ring: "ring-sky-200",
    };
  if (b < 25)
    return {
      label: lang === "en" ? "Normal" : "স্বাভাবিক",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      ring: "ring-emerald-200",
    };
  if (b < 30)
    return {
      label: lang === "en" ? "Overweight" : "অতিরিক্ত ওজন",
      bg: "bg-amber-50",
      text: "text-amber-600",
      ring: "ring-amber-200",
    };
  return {
    label: lang === "en" ? "Obesity" : "স্থূলতা",
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-200",
  };
};

export default function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [lang, setLang] = useState("bn");
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState("table");
  const [userTab, setUserTab] = useState("dashboard");
  const [adminSearch, setAdminSearch] = useState("");
  const [viewingUserHistory, setViewingUserHistory] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    id: null,
  });

  const t = useMemo(() => dict[lang], [lang]);

  // Initial Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Sync Firestore Data
  useEffect(() => {
    if (!user) return;

    const usersRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "users",
    );
    const recordsRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "records",
    );

    const unsubUsers = onSnapshot(
      usersRef,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => console.error("Users Sync Error:", err),
    );

    const unsubRecords = onSnapshot(
      recordsRef,
      (snap) => {
        setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("Records Sync Error:", err),
    );

    return () => {
      unsubUsers();
      unsubRecords();
    };
  }, [user]);

  // --- Actions ---
  const handleLogin = (u, p) => {
    if (u === "admin" && p === "admin123") {
      setSession({ role: "admin", username: "admin", name: "Admin" });
    } else {
      const found = users.find((x) => x.username === u && x.password === p);
      if (found) {
        setSession({
          role: "user",
          userId: found.id,
          username: found.username,
          name: found.name,
        });
      } else {
        return t.invalid_login;
      }
    }
    return null;
  };

  const handleLogout = () => setSession(null);

  const handleDelete = async () => {
    const { type, id } = confirmModal;
    if (type === "user") {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "users", id),
      );
      // Cleanup records for this user (Frontend filtering since we fetch all anyway)
      const userRecords = records.filter((r) => r.userId === id);
      for (const r of userRecords) {
        await deleteDoc(
          doc(db, "artifacts", appId, "public", "data", "records", r.id),
        );
      }
    } else {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "records", id),
      );
    }
    setConfirmModal({ isOpen: false, type: null, id: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Heart className="w-12 h-12 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <LoginView t={t} onLogin={handleLogin} lang={lang} setLang={setLang} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header
        t={t}
        session={session}
        lang={lang}
        setLang={setLang}
        onLogout={handleLogout}
      />

      <main className="animate-in pb-20">
        {session.role === "admin" ? (
          <AdminPanel
            t={t}
            users={users}
            records={records}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            viewingUserHistory={viewingUserHistory}
            setViewingUserHistory={setViewingUserHistory}
            editingRecordId={editingRecordId}
            setEditingRecordId={setEditingRecordId}
            editingUserId={editingUserId}
            setEditingUserId={setEditingUserId}
            setConfirmModal={setConfirmModal}
            lang={lang}
          />
        ) : (
          <UserPanel
            t={t}
            users={users}
            records={records}
            session={session}
            userTab={userTab}
            setUserTab={setUserTab}
            lang={lang}
          />
        )}
      </main>

      {confirmModal.isOpen && (
        <ConfirmModal
          t={t}
          type={confirmModal.type}
          onCancel={() =>
            setConfirmModal({ isOpen: false, type: null, id: null })
          }
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// --- Components ---

function Header({ t, session, lang, setLang, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-black leading-tight">
              {t.app_title}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {session.role === "admin" ? t.admin_panel : t.user_panel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-colors"
          >
            {lang === "bn" ? "English" : "বাংলা"}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 px-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function LoginView({ t, onLogin, lang, setLang }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    const error = onLogin(u, p);
    if (error) setErr(error);
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase transition-all"
          >
            {lang === "bn" ? "English" : "বাংলা"}
          </button>
        </div>
        <div className="text-center mb-10">
          <Heart className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white">{t.app_title}</h1>
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold">{t.welcome}</h2>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              {t.username}
            </label>
            <input
              value={u}
              onChange={(e) => setU(e.target.value)}
              className="w-full p-4 bg-slate-50 border rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500">
              {t.password}
            </label>
            <input
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              className="w-full p-4 bg-slate-50 border rounded-2xl mt-1 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          {err && (
            <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg">
              {err}
            </div>
          )}
          <button
            onClick={submit}
            className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-lg active:scale-[0.98] transition-all"
          >
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({
  t,
  users,
  records,
  adminTab,
  setAdminTab,
  adminSearch,
  setAdminSearch,
  viewingUserHistory,
  setViewingUserHistory,
  editingRecordId,
  setEditingRecordId,
  editingUserId,
  setEditingUserId,
  setConfirmModal,
  lang,
}) {
  if (viewingUserHistory) {
    const user = users.find((u) => u.id === viewingUserHistory);
    return (
      <AdminUserHistory
        t={t}
        user={user}
        records={records.filter((r) => r.userId === viewingUserHistory)}
        onBack={() => setViewingUserHistory(null)}
        editingRecordId={editingRecordId}
        setEditingRecordId={setEditingRecordId}
        setConfirmModal={setConfirmModal}
      />
    );
  }

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(adminSearch.toLowerCase()),
  );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[500px] border border-slate-200">
        <div className="flex border-b bg-slate-50/50 px-4 pt-2 overflow-x-auto scrollbar-hide">
          {["table", "entry", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setAdminTab(tab);
                setEditingUserId(null);
              }}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-t-2xl transition-all whitespace-nowrap ${adminTab === tab ? "bg-white text-indigo-700 border-x border-t" : "text-slate-400"}`}
            >
              {tab === "table"
                ? t.master_table
                : tab === "entry"
                  ? t.data_entry
                  : t.user_mgmt}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6">
          {adminTab === "table" && (
            <MasterTable
              t={t}
              users={filteredUsers}
              records={records}
              adminSearch={adminSearch}
              setAdminSearch={setAdminSearch}
              onViewHistory={setViewingUserHistory}
              editingRecordId={editingRecordId}
              setEditingRecordId={setEditingRecordId}
              setConfirmModal={setConfirmModal}
            />
          )}
          {adminTab === "entry" && (
            <DataEntryForm t={t} users={users} records={records} />
          )}
          {adminTab === "users" && (
            <UserManagement
              t={t}
              users={users}
              editingUserId={editingUserId}
              setEditingUserId={setEditingUserId}
              setConfirmModal={setConfirmModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MasterTable({
  t,
  users,
  records,
  adminSearch,
  setAdminSearch,
  onViewHistory,
  editingRecordId,
  setEditingRecordId,
  setConfirmModal,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h2 className="text-xl font-black">{t.master_table}</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder={t.search}
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="text-left py-4 px-4">{t.name}</th>
              <th className="text-left py-4 px-4">{t.weight}</th>
              <th className="text-left py-4 px-4">{t.bp}</th>
              <th className="text-left py-4 px-4">{t.sugar}</th>
              <th className="text-left py-4 px-4">{t.pulse}</th>
              <th className="text-left py-4 px-4">{t.date}</th>
              <th className="text-right py-4 px-4">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => {
              const userRecs = records
                .filter((r) => r.userId === u.id)
                .sort((a, b) => b.date.localeCompare(a.date));
              const latest = userRecs[0];
              return (
                <RecordRow
                  key={u.id}
                  t={t}
                  user={u}
                  record={latest}
                  onViewHistory={() => onViewHistory(u.id)}
                  isEditing={editingRecordId === latest?.id}
                  setEditingRecordId={setEditingRecordId}
                  setConfirmModal={setConfirmModal}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordRow({
  t,
  user,
  record,
  onViewHistory,
  isEditing,
  setEditingRecordId,
  setConfirmModal,
}) {
  const [local, setLocal] = useState(record || {});

  useEffect(() => {
    setLocal(record || {});
  }, [record]);

  const save = async () => {
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "records", record.id),
      {
        weight: parseFloat(local.weight) || 0,
        bpSys: parseInt(local.bpSys) || 0,
        bpDia: parseInt(local.bpDia) || 0,
        sugar: parseFloat(local.sugar) || 0,
        heartRate: parseInt(local.heartRate) || 0,
      },
    );
    setEditingRecordId(null);
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="py-4 px-4">
        <button
          onClick={onViewHistory}
          className="font-bold text-indigo-600 hover:underline text-left"
        >
          {user.name}
        </button>
      </td>
      <td className="py-4 px-4">
        {isEditing ? (
          <input
            type="number"
            step="0.1"
            className="w-16 p-1 border rounded"
            value={local.weight}
            onChange={(e) => setLocal({ ...local, weight: e.target.value })}
          />
        ) : record ? (
          record.weight + t.kg
        ) : (
          "—"
        )}
      </td>
      <td className="py-4 px-4 font-mono">
        {isEditing ? (
          <div className="flex gap-1 items-center">
            <input
              type="number"
              className="w-12 p-1 border rounded"
              value={local.bpSys}
              onChange={(e) => setLocal({ ...local, bpSys: e.target.value })}
            />
            <span>/</span>
            <input
              type="number"
              className="w-12 p-1 border rounded"
              value={local.bpDia}
              onChange={(e) => setLocal({ ...local, bpDia: e.target.value })}
            />
          </div>
        ) : record ? (
          `${record.bpSys}/${record.bpDia}`
        ) : (
          "—"
        )}
      </td>
      <td className="py-4 px-4">
        {isEditing ? (
          <input
            type="number"
            step="0.1"
            className="w-16 p-1 border rounded"
            value={local.sugar}
            onChange={(e) => setLocal({ ...local, sugar: e.target.value })}
          />
        ) : (
          record?.sugar || "—"
        )}
      </td>
      <td className="py-4 px-4">
        {isEditing ? (
          <input
            type="number"
            className="w-16 p-1 border rounded"
            value={local.heartRate}
            onChange={(e) => setLocal({ ...local, heartRate: e.target.value })}
          />
        ) : (
          record?.heartRate || "—"
        )}
      </td>
      <td className="py-4 px-4 text-xs text-slate-400">
        {record ? record.date : "—"}
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex justify-end gap-1">
          {isEditing ? (
            <>
              <button
                onClick={save}
                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingRecordId(null)}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : record ? (
            <>
              <button
                onClick={() => setEditingRecordId(record.id)}
                className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: true,
                    type: "record",
                    id: record.id,
                  })
                }
                className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function DataEntryForm({ t, users, records }) {
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState({
    weight: "",
    bpSys: "",
    bpDia: "",
    sugar: "",
    heartRate: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const existing = records.find(
      (r) => r.userId === userId && r.date === date,
    );
    if (existing) {
      setForm({
        weight: existing.weight || "",
        bpSys: existing.bpSys || "",
        bpDia: existing.bpDia || "",
        sugar: existing.sugar || "",
        heartRate: existing.heartRate || "",
      });
    } else {
      setForm({ weight: "", bpSys: "", bpDia: "", sugar: "", heartRate: "" });
    }
  }, [userId, date, records]);

  const save = async () => {
    if (!userId || !date) return;
    const payload = {
      userId,
      date,
      weight: parseFloat(form.weight) || 0,
      bpSys: parseInt(form.bpSys) || 0,
      bpDia: parseInt(form.bpDia) || 0,
      sugar: parseFloat(form.sugar) || 0,
      heartRate: parseInt(form.heartRate) || 0,
    };
    const existing = records.find(
      (r) => r.userId === userId && r.date === date,
    );
    if (existing) {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "records", existing.id),
        payload,
      );
    } else {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "records"),
        payload,
      );
    }
    setMsg(t.success);
    setTimeout(() => setMsg(""), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-black">{t.smart_entry}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {t.name} *
          </label>
          <select
            className="w-full p-3 rounded-xl border mt-1 outline-none"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">— {t.select} —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {t.date}
          </label>
          <input
            type="date"
            className="w-full p-3 rounded-xl border mt-1 outline-none"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {t.weight}
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full p-3 rounded-xl border mt-1 outline-none"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {t.bp}
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              className="w-20 p-3 rounded-xl border text-center outline-none"
              placeholder="SYS"
              value={form.bpSys}
              onChange={(e) => setForm({ ...form, bpSys: e.target.value })}
            />
            <span className="font-black text-slate-300 text-xl">/</span>
            <input
              className="w-20 p-3 rounded-xl border text-center outline-none"
              placeholder="DIA"
              value={form.bpDia}
              onChange={(e) => setForm({ ...form, bpDia: e.target.value })}
            />
            <span className="text-xs font-bold text-slate-400 uppercase ml-2">
              mmHg
            </span>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {t.sugar}
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full p-3 rounded-xl border mt-1 outline-none"
            value={form.sugar}
            onChange={(e) => setForm({ ...form, sugar: e.target.value })}
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
            {t.pulse}
          </label>
          <input
            type="number"
            className="w-full p-3 rounded-xl border mt-1 outline-none"
            value={form.heartRate}
            onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
          />
        </div>
      </div>
      {msg && (
        <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-center">
          {msg}
        </div>
      )}
      <button
        onClick={save}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
      >
        {t.save}
      </button>
    </div>
  );
}

function UserManagement({
  t,
  users,
  editingUserId,
  setEditingUserId,
  setConfirmModal,
}) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    age: "",
    ft: "",
    in: "",
  });

  useEffect(() => {
    if (editingUserId) {
      const u = users.find((x) => x.id === editingUserId);
      const h = cmToFtIn(u.height);
      setForm({
        name: u.name,
        username: u.username,
        password: u.password,
        age: u.age,
        ft: h.ft,
        in: h.in,
      });
    } else {
      setForm({
        name: "",
        username: "",
        password: "",
        age: "",
        ft: "",
        in: "",
      });
    }
  }, [editingUserId, users]);

  const save = async () => {
    const payload = {
      name: form.name,
      username: form.username,
      password: form.password,
      age: parseInt(form.age) || 0,
      height: parseFloat(ftInToCm(form.ft, form.in)),
    };
    if (!payload.name || !payload.username) return;

    if (editingUserId) {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "users", editingUserId),
        payload,
      );
      setEditingUserId(null);
    } else {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "users"),
        payload,
      );
    }
    setForm({ name: "", username: "", password: "", age: "", ft: "", in: "" });
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-50 p-6 rounded-3xl border">
        <h3 className="text-[10px] font-black uppercase mb-6 text-indigo-500 tracking-widest">
          {editingUserId ? "ইউজার আপডেট করুন" : "নতুন ইউজার রেজিস্ট্রেশন"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
              {t.name}
            </label>
            <input
              className="w-full p-3 rounded-xl border mt-1 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
              {t.username}
            </label>
            <input
              className="w-full p-3 rounded-xl border mt-1 outline-none"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
              {t.password}
            </label>
            <input
              type="password"
              className="w-full p-3 rounded-xl border mt-1 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
              {t.age}
            </label>
            <input
              type="number"
              className="w-full p-3 rounded-xl border mt-1 outline-none"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div className="lg:col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
              {t.height}
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                className="w-16 p-3 rounded-xl border text-center outline-none"
                placeholder="0"
                value={form.ft}
                onChange={(e) => setForm({ ...form, ft: e.target.value })}
              />
              <span className="text-xs font-bold text-slate-500">{t.ft}</span>
              <input
                className="w-16 p-3 rounded-xl border text-center outline-none"
                placeholder="0"
                value={form.in}
                onChange={(e) => setForm({ ...form, in: e.target.value })}
              />
              <span className="text-xs font-bold text-slate-500">{t.in}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={save}
            className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-xl uppercase text-xs shadow-md active:scale-95 transition-all"
          >
            {editingUserId ? t.update : t.save}
          </button>
          {editingUserId && (
            <button
              onClick={() => setEditingUserId(null)}
              className="px-6 py-4 bg-slate-200 text-slate-600 font-black rounded-xl uppercase text-xs"
            >
              {t.cancel}
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const hu = cmToFtIn(u.height);
          return (
            <div
              key={u.id}
              className="p-4 bg-white border border-slate-100 rounded-2xl flex justify-between items-center hover:shadow-md transition-all"
            >
              <div>
                <p className="font-black text-slate-700">{u.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  @{u.username} • {hu.ft}
                  {t.ft} {hu.in}
                  {t.in}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingUserId(u.id)}
                  className="p-2 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setConfirmModal({ isOpen: true, type: "user", id: u.id })
                  }
                  className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminUserHistory({
  t,
  user,
  records,
  onBack,
  editingRecordId,
  setEditingRecordId,
  setConfirmModal,
}) {
  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  );
  const hu = cmToFtIn(user?.height);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden p-4 sm:p-6 animate-in border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h2 className="text-xl font-black">
                {user?.name} - {t.history}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                @{user?.username} • {hu.ft}
                {t.ft} {hu.in}
                {t.in}
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            {t.back}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left py-4 px-6">{t.date}</th>
                <th className="text-left py-4 px-6">{t.weight}</th>
                <th className="text-left py-4 px-6">BMI</th>
                <th className="text-left py-4 px-6">{t.bp}</th>
                <th className="text-left py-4 px-6">{t.sugar}</th>
                <th className="text-left py-4 px-6">{t.pulse}</th>
                <th className="text-right py-4 px-6">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.map((r) => (
                <RecordRow
                  key={r.id}
                  t={t}
                  user={user}
                  record={r}
                  isEditing={editingRecordId === r.id}
                  setEditingRecordId={setEditingRecordId}
                  setConfirmModal={setConfirmModal}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserPanel({ t, users, records, session, userTab, setUserTab, lang }) {
  const user = users.find((u) => u.id === session.userId);
  const userRecs = records
    .filter((r) => r.userId === session.userId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latest = userRecs[0];
  const bmi = latest ? calcBMI(latest.weight, user?.height) : null;
  const info = getBMIInfo(bmi, lang);
  const hu = cmToFtIn(user?.height);

  const [profileForm, setProfileForm] = useState(user || {});
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (user) setProfileForm(user);
  }, [user]);

  const updateProfile = async () => {
    const payload = {
      name: profileForm.name,
      age: parseInt(profileForm.age) || 0,
      height: parseFloat(ftInToCm(profileForm.ft, profileForm.in)),
      password: profileForm.password,
    };
    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "users", user.id),
      payload,
    );
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <div className="flex p-1 bg-white border rounded-2xl w-max mx-auto shadow-sm sticky top-20 z-40">
        <button
          onClick={() => setUserTab("dashboard")}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${userTab === "dashboard" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            {t.dashboard}
          </div>
        </button>
        <button
          onClick={() => setUserTab("profile")}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${userTab === "profile" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}
        >
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            {t.profile}
          </div>
        </button>
      </div>

      {userTab === "dashboard" ? (
        <div className="space-y-10 animate-in">
          <section
            className={`rounded-[3rem] p-8 sm:p-12 ring-1 shadow-2xl ${info.ring} ${info.bg} relative overflow-hidden transition-all duration-500`}
          >
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter mb-8">
                {user?.name}
              </h2>
              <div className="flex items-end gap-6">
                <span
                  className={`text-7xl sm:text-9xl font-black leading-none tracking-tighter ${info.text}`}
                >
                  {bmi || "—"}
                </span>
                <div className="pb-2 sm:pb-4">
                  <p className="text-lg sm:text-2xl font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    BMI SCORE
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    {info.label}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              label={t.weight}
              value={latest?.weight || "—"}
              unit={t.kg}
              icon={<Scale className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              label={t.height}
              value={`${hu.ft}${t.ft} ${hu.in}${t.in}`}
              unit=""
              icon={<Ruler className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              label={t.pulse}
              value={latest?.heartRate || "—"}
              unit="bpm"
              icon={<Activity className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              label={t.sugar}
              value={latest?.sugar || "—"}
              unit="mmol/L"
              icon={<Droplets className="w-5 h-5 text-indigo-400" />}
            />
            <StatCard
              label={t.bp}
              value={latest ? `${latest.bpSys}/${latest.bpDia}` : "—"}
              unit="mmHg"
              icon={<Activity className="w-5 h-5 text-indigo-400" />}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border shadow-xl p-8 sm:p-12 animate-in">
          <h2 className="text-3xl font-black text-center mb-10">{t.profile}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                {t.name}
              </label>
              <input
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                value={profileForm.name || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                {t.age}
              </label>
              <input
                type="number"
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                value={profileForm.age || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, age: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                {t.height}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  className="w-16 p-4 rounded-2xl bg-slate-50 border font-bold text-center outline-none"
                  value={cmToFtIn(profileForm.height).ft}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      height: ftInToCm(
                        e.target.value,
                        cmToFtIn(profileForm.height).in,
                      ),
                    })
                  }
                />
                <span className="text-xs font-bold text-slate-500">{t.ft}</span>
                <input
                  className="w-16 p-4 rounded-2xl bg-slate-50 border font-bold text-center outline-none"
                  value={cmToFtIn(profileForm.height).in}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      height: ftInToCm(
                        cmToFtIn(profileForm.height).ft,
                        e.target.value,
                      ),
                    })
                  }
                />
                <span className="text-xs font-bold text-slate-500">{t.in}</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">
                {t.password}
              </label>
              <input
                type="password"
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                value={profileForm.password || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, password: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={updateProfile}
              className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" /> {t.save}
            </button>
            {successMsg && (
              <div className="text-emerald-500 font-black uppercase text-[10px] animate-bounce">
                {t.success}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="bg-white rounded-[2rem] p-6 border transition-all hover:shadow-lg">
      <div className="w-10 h-10 bg-slate-50 rounded-xl mb-4 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-2xl font-black">
        {value}
        <span className="text-[10px] text-slate-300 ml-1">{unit}</span>
      </p>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">
        {label}
      </p>
    </div>
  );
}

function ConfirmModal({ t, type, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in">
        <h3 className="text-lg font-bold mb-2">{t.confirm_del}</h3>
        <p className="text-slate-500 text-sm mb-6">
          {type === "user"
            ? "ইউজার এবং তার সব রেকর্ড ডিলিট হবে।"
            : "এই রেকর্ডটি ডিলিট হবে।"}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-white bg-red-500 rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
