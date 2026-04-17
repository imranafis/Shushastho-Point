import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  User,
  Users,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Scale,
  Ruler,
  Droplets,
  Wind,
  TrendingUp,
  Calendar,
  Lock,
  UserPlus,
  BarChart2,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  FileText,
  Search,
  Languages,
} from "lucide-react";

// Firebase এর প্রয়োজনীয় ফাংশনগুলো ইমপোর্ট করা
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
  setDoc,
  getDoc,
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

// ============================================================
// ১. Firebase Configuration
// ============================================================
// এই অংশটি বর্তমান এনভায়রনমেন্ট অনুযায়ী কাজ করবে।
// পাবলিশ করার সময় আপনি myFirebaseConfig এর জায়গায় আপনার নিজের তথ্য বসাতে পারবেন।

const getFirebaseConfig = () => {
  // যদি ক্যানভাস এনভায়রনমেন্টে থাকে তবে সিস্টেম কনফিগ ব্যবহার করবে
  if (typeof __firebase_config !== "undefined") {
    return JSON.parse(__firebase_config);
  }
  // আপনার নিজের প্রোডাকশন কনফিগ এখানে বসান
  return {
    apiKey: "AIzaSyBTGIGxrnCHU8Q3cO1I1MrPVKGfGudEsoI",
    authDomain: "shushastho-point.firebaseapp.com",
    projectId: "shushastho-point",
    storageBucket: "shushastho-point.firebasestorage.app",
    messagingSenderId: "339749833973",
    appId: "1:339749833973:web:eaac52314af523ebad89bc",
    measurementId: "G-MWSVJCWTDV",
  };
};

const appId =
  typeof __app_id !== "undefined" ? __app_id : "shushastho-point-v1";
const firebaseConfig = getFirebaseConfig();

// Firebase ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================================
// TRANSLATIONS (বাংলা ও ইংরেজি ডিকশনারি)
// ============================================================
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
    weight: "ওজন",
    bmi_status: "BMI স্ট্যাটাস",
    bp: "রক্তচাপ",
    sugar: "সুগার",
    pulse: "হার্ট রেট",
    oxygen: "অক্সিজেন",
    date: "তারিখ",
    save: "সেভ করুন",
    cancel: "বাতিল",
    delete: "ডিলিট",
    edit: "এডিট",
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
  },
};

// ============================================================
// UTILITIES
// ============================================================
const calcBMI = (weight, height) => {
  if (!weight || !height || parseFloat(height) === 0) return null;
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  return (w / (h * h)).toFixed(1);
};

const getBMIInfo = (bmi, lang) => {
  if (!bmi)
    return {
      label: "—",
      bg: "bg-slate-100",
      text: "text-slate-400",
      ring: "ring-slate-200",
      badge: "bg-slate-100 text-slate-500",
    };
  const b = parseFloat(bmi);
  const isEn = lang === "en";
  if (b < 18.5)
    return {
      label: isEn ? "Underweight" : "ওজন কম",
      bg: "bg-sky-50",
      text: "text-sky-600",
      ring: "ring-sky-200",
      badge: "bg-sky-100 text-sky-700",
    };
  if (b < 25)
    return {
      label: isEn ? "Normal" : "স্বাভাবিক",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      ring: "ring-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
    };
  if (b < 30)
    return {
      label: isEn ? "Overweight" : "অতিরিক্ত ওজন",
      bg: "bg-amber-50",
      text: "text-amber-600",
      ring: "ring-amber-200",
      badge: "bg-amber-100 text-amber-700",
    };
  return {
    label: isEn ? "Obesity" : "স্থূলতা",
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-200",
    badge: "bg-red-100 text-red-700",
  };
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
  const [lang, setLang] = useState("bn");
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [session, setSession] = useState(null);
  const [fbUser, setFbUser] = useState(null);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    error: "",
  });
  const [loading, setLoading] = useState(true);

  const t = dict[lang];

  // ১. ফায়ারবেস অথেন্টিকেশন
  useEffect(() => {
    const startAuth = async () => {
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
        console.error("Firebase Auth failed:", err);
      }
    };
    startAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFbUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ২. ফায়ারস্টোর থেকে রিয়েল-টাইম ডাটা সিঙ্ক
  useEffect(() => {
    if (!fbUser) return;

    const usersCol = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "users",
    );
    const unsubUsers = onSnapshot(
      usersCol,
      (snapshot) => {
        const uData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(uData);
        setLoading(false);
      },
      (err) => console.error("Users Sync Error:", err),
    );

    const recordsCol = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "records",
    );
    const unsubRecords = onSnapshot(
      recordsCol,
      (snapshot) => {
        const rData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(rData);
      },
      (err) => console.error("Records Sync Error:", err),
    );

    return () => {
      unsubUsers();
      unsubRecords();
    };
  }, [fbUser]);

  const handleLogin = () => {
    const { username, password } = loginForm;
    if (username === "admin" && password === "admin123") {
      setSession({ role: "admin", username: "admin", name: t.admin_panel });
      return;
    }
    const found = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (found) {
      setSession({
        role: "user",
        userId: found.id,
        username: found.username,
        name: found.name,
      });
      return;
    }
    setLoginForm((f) => ({ ...f, error: t.invalid_login }));
  };

  const handleLogout = () => setSession(null);

  const handleUpdateProfile = async (userId, updatedData) => {
    if (!fbUser) return;
    try {
      const userDoc = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "users",
        userId,
      );
      await updateDoc(userDoc, updatedData);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Heart className="w-12 h-12 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  if (!session)
    return (
      <LoginPage
        t={t}
        lang={lang}
        setLang={setLang}
        form={loginForm}
        onChange={(f, v) => setLoginForm((p) => ({ ...p, [f]: v, error: "" }))}
        onLogin={handleLogin}
      />
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-red leading-tight">
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
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase transition-all"
            >
              {lang === "bn" ? "English" : "বাংলা"}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 px-2 py-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {session.role === "admin" ? (
        <AdminDashboard
          t={t}
          lang={lang}
          users={users}
          records={records}
          fbUser={fbUser}
        />
      ) : (
        <UserDashboard
          t={t}
          lang={lang}
          session={session}
          user={users.find((u) => u.id === session.userId)}
          records={records.filter((r) => r.userId === session.userId)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
}

// ============================================================
// ADMIN DASHBOARD
// ============================================================
function AdminDashboard({ t, lang, users, records, fbUser }) {
  const [tab, setTab] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    id: null,
  });
  const [entryForm, setEntryForm] = useState({
    userId: "",
    date: new Date().toISOString().split("T")[0],
    weight: "",
    bpSys: "",
    bpDia: "",
    sugar: "",
    heartRate: "",
    oxygen: "",
  });
  const [entryMsg, setEntryMsg] = useState(null);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    name: "",
    age: "",
    height: "",
  });

  useEffect(() => {
    if (entryForm.userId && entryForm.date) {
      const existing = records.find(
        (r) => r.userId === entryForm.userId && r.date === entryForm.date,
      );
      if (existing) {
        setEntryForm((prev) => ({
          ...prev,
          weight: existing.weight || "",
          bpSys: existing.bpSys || "",
          bpDia: existing.bpDia || "",
          sugar: existing.sugar || "",
          heartRate: existing.heartRate || "",
          oxygen: existing.oxygen || "",
        }));
      } else {
        setEntryForm((prev) => ({
          ...prev,
          weight: "",
          bpSys: "",
          bpDia: "",
          sugar: "",
          heartRate: "",
          oxygen: "",
        }));
      }
    }
  }, [entryForm.userId, entryForm.date, records]);

  const handleEntrySubmit = async () => {
    if (!fbUser || !entryForm.userId) return;
    const payload = {
      weight: parseFloat(entryForm.weight) || 0,
      bpSys: parseFloat(entryForm.bpSys) || 0,
      bpDia: parseFloat(entryForm.bpDia) || 0,
      sugar: parseFloat(entryForm.sugar) || 0,
      heartRate: parseFloat(entryForm.heartRate) || 0,
      oxygen: parseFloat(entryForm.oxygen) || 0,
    };
    const existing = records.find(
      (r) => r.userId === entryForm.userId && r.date === entryForm.date,
    );
    try {
      if (existing) {
        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "records", existing.id),
          payload,
        );
        setEntryMsg({ text: t.updating });
      } else {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "records"),
          { userId: entryForm.userId, date: entryForm.date, ...payload },
        );
        setEntryMsg({ text: t.new_entry });
      }
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setEntryMsg(null), 3000);
  };

  const executeDelete = async () => {
    if (!fbUser) return;
    const { type, id } = confirmState;
    try {
      if (type === "record")
        await deleteDoc(
          doc(db, "artifacts", appId, "public", "data", "records", id),
        );
      if (type === "user") {
        await deleteDoc(
          doc(db, "artifacts", appId, "public", "data", "users", id),
        );
        records
          .filter((r) => r.userId === id)
          .forEach(async (r) => {
            await deleteDoc(
              doc(db, "artifacts", appId, "public", "data", "records", r.id),
            );
          });
      }
    } catch (e) {
      console.error(e);
    }
    setConfirmState({ isOpen: false, type: null, id: null });
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={t.confirm_del}
        message="ডিলিট নিশ্চিত করুন?"
        onConfirm={executeDelete}
        onCancel={() => setConfirmState({ isOpen: false })}
        t={t}
      />

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
        <div className="flex border-b bg-slate-50/20 px-4 pt-2 overflow-x-auto no-scrollbar">
          {["table", "entry", "users"].map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-t-2xl transition-all ${tab === id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400"}`}
            >
              {id === "table"
                ? t.master_table
                : id === "entry"
                  ? t.data_entry
                  : t.user_mgmt}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "table" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-xl font-black">{t.master_table}</h2>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      <th className="text-left py-4 px-4">{t.date}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const latest = records
                        .filter((r) => r.userId === u.id)
                        .sort((a, b) => b.date.localeCompare(a.date))[0];
                      return (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-4 px-4 font-bold text-indigo-600">
                            {u.name}
                          </td>
                          <td className="py-4 px-4">
                            {latest ? `${latest.weight} ${t.kg}` : "—"}
                          </td>
                          <td className="py-4 px-4 font-mono">
                            {latest ? `${latest.bpSys}/${latest.bpDia}` : "—"}
                          </td>
                          <td className="py-4 px-4">
                            {latest ? latest.sugar : "—"}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400">
                            {latest ? latest.date : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "entry" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-xl font-black">{t.smart_entry}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border">
                <div className="sm:col-span-2">
                  <FLabel label={t.name} req>
                    <select
                      className="w-full p-3 rounded-xl border"
                      value={entryForm.userId}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, userId: e.target.value })
                      }
                    >
                      <option value="">— {t.select} —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </FLabel>
                </div>
                <FLabel label={t.date}>
                  <input
                    type="date"
                    className="w-full p-3 rounded-xl border"
                    value={entryForm.date}
                    onChange={(e) =>
                      setEntryForm({ ...entryForm, date: e.target.value })
                    }
                  />
                </FLabel>
                {[
                  { k: "weight", l: t.weight },
                  { k: "bpSys", l: "BP Systolic" },
                  { k: "bpDia", l: "BP Diastolic" },
                  { k: "sugar", l: t.sugar },
                  { k: "heartRate", l: t.pulse },
                  { k: "oxygen", l: t.oxygen },
                ].map((f) => (
                  <FLabel key={f.k} label={f.l}>
                    <input
                      type="number"
                      className="w-full p-3 rounded-xl border"
                      value={entryForm[f.k]}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, [f.k]: e.target.value })
                      }
                    />
                  </FLabel>
                ))}
              </div>
              {entryMsg && (
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                  {entryMsg.text}
                </div>
              )}
              <button
                onClick={handleEntrySubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs shadow-lg"
              >
                {t.save}
              </button>
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-8">
              <div className="bg-slate-50 p-6 rounded-3xl border">
                <h3 className="text-[10px] font-black uppercase mb-6 text-indigo-500 tracking-widest">
                  নতুন ইউজার রেজিস্ট্রেশন
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { k: "name", l: t.name },
                    { k: "username", l: t.username },
                    { k: "password", l: t.password },
                    { k: "age", l: t.age },
                    { k: "height", l: t.height },
                  ].map((f) => (
                    <FLabel key={f.k} label={f.l}>
                      <input
                        className="w-full p-3 rounded-xl border"
                        value={userForm[f.k]}
                        onChange={(e) =>
                          setUserForm({ ...userForm, [f.k]: e.target.value })
                        }
                      />
                    </FLabel>
                  ))}
                </div>
                <button
                  onClick={async () => {
                    if (!userForm.name || !userForm.username) return;
                    await addDoc(
                      collection(
                        db,
                        "artifacts",
                        appId,
                        "public",
                        "data",
                        "users",
                      ),
                      {
                        ...userForm,
                        height: parseFloat(userForm.height) || 0,
                        age: parseInt(userForm.age) || 0,
                      },
                    );
                    setUserForm({
                      username: "",
                      password: "",
                      name: "",
                      age: "",
                      height: "",
                    });
                  }}
                  className="mt-6 w-full py-4 bg-indigo-600 text-white font-black rounded-xl uppercase text-xs shadow-md"
                >
                  {t.save}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 bg-white border rounded-2xl flex justify-between items-center hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-black text-slate-700">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        @{u.username} • {u.height}
                        {t.cm}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfirmState({
                          isOpen: true,
                          type: "user",
                          id: u.id,
                        })
                      }
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USER DASHBOARD
// ============================================================
function UserDashboard({ t, lang, user, records, onUpdateProfile }) {
  const [view, setView] = useState("dashboard");
  const [profileForm, setProfileForm] = useState(user || {});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) setProfileForm(user);
  }, [user]);

  if (!user)
    return (
      <div className="p-10 text-center font-bold">ইউজার খুঁজে পাওয়া যায়নি</div>
    );

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const bmi = latest ? calcBMI(latest.weight, user.height) : null;
  const info = getBMIInfo(bmi, lang);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
      <div className="flex p-1 bg-white border rounded-2xl w-max mx-auto shadow-sm sticky top-16 z-40">
        <button
          onClick={() => setView("dashboard")}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "dashboard" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}
        >
          {t.dashboard}
        </button>
        <button
          onClick={() => setView("profile")}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "profile" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400"}`}
        >
          {t.profile}
        </button>
      </div>

      {view === "dashboard" ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <section
            className={`rounded-[3rem] p-12 ring-1 shadow-2xl ${info.ring} ${info.bg} relative overflow-hidden`}
          >
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight mb-8">
              {user.name}
            </h2>
            <div className="flex items-end gap-6">
              <span
                className={`text-9xl font-black leading-none tracking-tighter ${info.text}`}
              >
                {bmi || "—"}
              </span>
              <div className="pb-4">
                <p className="text-2xl font-black text-slate-400 tracking-widest">
                  BMI SCORE
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {info.label}
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {statCardsData(t, user, latest).map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl mb-4 flex items-center justify-center">
                  <c.i className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-3xl font-black text-slate-800">
                  {c.v}
                  <span className="text-xs text-slate-300 ml-1 uppercase">
                    {c.u}
                  </span>
                </p>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">
                  {c.l}
                </p>
              </div>
            ))}
          </div>

          <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-10 py-6 border-b flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest">
                {t.history}
              </h3>
              <span className="text-[10px] font-bold text-slate-400">
                {sorted.length} টি এন্ট্রি
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <tr>
                    <th className="text-left py-4 px-10">{t.date}</th>
                    <th className="text-left py-4 px-10">{t.weight}</th>
                    <th className="text-left py-4 px-10">BMI</th>
                    <th className="text-left py-4 px-10">{t.bp}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-bold">
                  {sorted.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-6 px-10">{r.date}</td>
                      <td className="py-6 px-10">
                        {r.weight}
                        {t.kg}
                      </td>
                      <td className="py-6 px-10">
                        {calcBMI(r.weight, user.height)}
                      </td>
                      <td className="py-6 px-10 font-mono text-xs">
                        {r.bpSys}/{r.bpDia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border shadow-xl p-12 animate-in zoom-in-95">
          <h2 className="text-3xl font-black text-center mb-10">{t.profile}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <FLabel label={t.name}>
              <input
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
              />
            </FLabel>
            <FLabel label={t.age}>
              <input
                type="number"
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold"
                value={profileForm.age}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, age: e.target.value })
                }
              />
            </FLabel>
            <FLabel label={t.height}>
              <input
                type="number"
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold"
                value={profileForm.height}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, height: e.target.value })
                }
              />
            </FLabel>
            <FLabel label={t.password}>
              <input
                type="password"
                className="w-full p-4 rounded-2xl bg-slate-50 border font-bold"
                value={profileForm.password}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, password: e.target.value })
                }
              />
            </FLabel>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                onUpdateProfile(user.id, profileForm);
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
              }}
              className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {t.save}
            </button>
            {isSaved && (
              <p className="text-emerald-500 font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Success
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// UI COMPONENTS
// ============================================================
function LoginPage({ t, lang, setLang, form, onChange, onLogin }) {
  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="text-white text-[10px] font-black uppercase px-4 py-2 border border-white/20 rounded-xl"
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
          <FLabel label={t.username}>
            <input
              className="w-full p-4 border rounded-2xl outline-none"
              value={form.username}
              onChange={(e) => onChange("username", e.target.value)}
            />
          </FLabel>
          <FLabel label={t.password}>
            <input
              type="password"
              className="w-full p-4 border rounded-2xl outline-none"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
            />
          </FLabel>
          {form.error && (
            <div className="text-red-500 text-xs font-bold">{form.error}</div>
          )}
          <button
            onClick={onLogin}
            className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-lg"
          >
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, t }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold bg-slate-100 rounded-xl"
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-sm font-bold text-white bg-red-500 rounded-xl shadow-lg"
          >
            ডিলিট
          </button>
        </div>
      </div>
    </div>
  );
}

function FLabel({ label, req, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
        {label} {req && "*"}
      </label>
      {children}
    </div>
  );
}

const statCardsData = (t, user, latest) => [
  { l: t.weight, v: latest ? latest.weight : "—", u: t.kg, i: Scale },
  { l: t.height, v: user.height, u: t.cm, i: Ruler },
  { l: t.pulse, v: latest ? latest.heartRate : "—", u: "bpm", i: Activity },
  { l: t.sugar, v: latest ? latest.sugar : "—", u: "mmol/L", i: Droplets },
  {
    l: t.bp,
    v: latest ? `${latest.bpSys}/${latest.bpDia}` : "—",
    u: "mmHg",
    i: Activity,
  },
  { l: t.oxygen, v: latest ? latest.oxygen : "—", u: "%", i: Wind },
];
