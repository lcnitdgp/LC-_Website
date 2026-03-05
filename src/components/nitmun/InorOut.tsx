import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Mail, X, ArrowLeft, Key, LogIn, Phone, User, Hash, Building2, GraduationCap, CheckCircle2, ChevronDown } from 'lucide-react';

const extractRegNumber = (email: string) => {
    const match = email.match(/\.([^.@]+)@/);
    if (match && match[1]) return match[1].toLowerCase();
    return email.split('@')[0].toLowerCase();
};

const getYearOfStudy = (regNum: string) => {
    const yearDigits = regNum.substring(0, 2);
    switch (yearDigits) {
        case '25': return '1st Year';
        case '24': return '2nd Year';
        case '23': return '3rd Year';
        case '22': return '4th Year';
        case '21': return '5th Year';
        default: return 'Other';
    }
};

type ModalView = 'selection' | 'inhouse-form' | 'outhouse-form' | 'login-form' | 'success' | 'already-registered';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialCommittee?: string;
}

const inputClass = "w-full px-4 py-3 border-[4px] border-black rounded-none focus:ring-0 focus:border-[#c58715] focus:bg-[#312e2e] transition-all duration-200 bg-[#312e2e] text-white shadow-[4px_4px_0_#000] font-mono font-bold placeholder-gray-400 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#000]";
const inputWithIconClass = "w-full pl-12 pr-4 py-3 border-[4px] border-black rounded-none focus:ring-0 focus:border-[#c58715] focus:bg-[#312e2e] transition-all duration-200 bg-[#312e2e] text-white shadow-[4px_4px_0_#000] font-mono font-bold placeholder-gray-400 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#000]";
const labelClass = "flex items-center text-sm font-bold font-antonio uppercase tracking-wide text-[#e0b0ac] mb-2";
const iconClass = "w-4 h-4 mr-2 text-white";
const fieldIconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-white pointer-events-none z-10 font-bold";

const AIPPM_PORTFOLIOS = [
    "Akhilesh Yadav", "Amit Shah", "Anurag Thakur", "Arvind Kejriwal", "Ashok Gehlot",
    "Ashwini Vaishnaw", "Asaduddin Owaisi", "Bhagwant Maan", "Bhajan Lal Sharma", "Bhupendra Patel",
    "Digvijaya Singh", "Devendra Fadnavis", "Dharmendra Pradhan", "Derek O’Brien", "Eknath Shinde",
    "Farooq Abdullah", "Himanta Biswa Sarma", "Jagan Mohan Reddy", "Jyotiraditya Scindia", "K. Annamalai",
    "K. Chandrashekar Rao", "K. T. Rama Rao", "Kapil Sibal", "Kiren Rijiju", "M. K. Stalin",
    "Mahua Moitra", "Mallikarjun Kharge", "Mamata Banerjee", "Manish Sisodia", "Manohar Lal Khattar",
    "Mohan Majhi", "Mohan Yadav", "Narendra Modi", "Nirmala Sitharaman", "Nitish Kumar",
    "Nitin Gadkari", "N. Chandrababu Naidu", "Omar Abdullah", "P. Chidambaram", "Pinarayi Vijayan",
    "Piyush Goyal", "Raghav Chadha", "Rahul Gandhi", "Rajnath Singh", "Revanth Reddy",
    "S. Jaishankar", "Sharad Pawar", "Shashi Tharoor", "Shivraj Singh Chauhan", "Smriti Irani",
    "Supriya Sule", "Tejashwi Yadav", "Uddhav Thackeray", "Yogi Adityanath"
].sort();

const UNHRC_PORTFOLIOS = [
    "Angola", "Benin", "Burundi", "Côte d’Ivoire", "Democratic Republic of the Congo", "Egypt", "Ethiopia", "Gambia", "Ghana", "Kenya", "Malawi", "Mauritius", "South Africa",
    "China (Major Actor)", "Iran (Islamic Republic of)", "India (Major Actor)", "Indonesia", "Iraq", "Japan", "Nepal", "Bangladesh (Major Actor)", "Pakistan (Major Actor)", "Sri Lanka", "Myanmar", "Thailand", "Viet Nam",
    "Albania", "Bulgaria", "Czechia", "Estonia", "Russian Federation (Major Actor)", "Slovenia",
    "Bolivia (Plurinational State of)", "Brazil", "Chile", "Colombia", "Cuba", "Dominican Republic", "Ecuador", "Mexico",
    "France (Major Actor)", "United States of America (Major Actor)", "Italy", "Israel", "Spain", "Switzerland", "United Kingdom of Great Britain and Northern Ireland (Major Actor)"
].sort();

const COMMITTEES = ["AIPPM", "UNGA", "UNHRC"];

export function NitmunRegistrationModal({ isOpen, onClose, initialCommittee }: Props) {
    const { user, loginWithGoogle, loginWithCredentials, isLoading: isAuthLoading } = useAuth();

    const [loginUserId, setLoginUserId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [view, setView] = useState<ModalView>('selection');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showIntruderAlert, setShowIntruderAlert] = useState(false);
    const [role, setRole] = useState<'Delegate' | 'International Press' | null>(null);
    const [inhousePhone, setInhousePhone] = useState('');
    const [outhouseData, setOuthouseData] = useState({
        fullName: '', rollNumber: '', college: '', PhoneNumber: '', yearOfStudy: '', email: '',
    });
    const [preferences, setPreferences] = useState({
        committeePref1: '', portfolio1_1: '', portfolio1_2: '', portfolio1_3: '',
        committeePref2: '', portfolio2_1: '', portfolio2_2: '', portfolio2_3: '',
        committeePref3: '', portfolio3_1: '', portfolio3_2: '', portfolio3_3: ''
    });

    const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setPreferences(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    useEffect(() => {
        if (initialCommittee) {
            setPreferences(prev => ({ ...prev, committeePref1: initialCommittee }));
        }
    }, [initialCommittee]);

    useEffect(() => {
        if (!isOpen) return;
        const determineView = async () => {
            if (!user?.email) { setView('selection'); return; }
            try {
                const userEmail = user.email.trim().toLowerCase();
                const regNumber = extractRegNumber(userEmail);
                const docRef = doc(db, 'inhouse_registrations', regNumber);
                const docSnap = await getDoc(docRef);
                setView(docSnap.exists() ? 'already-registered' : 'inhouse-form');
            } catch (err) {
                console.error("Error checking registration status", err);
                setView('inhouse-form');
            }
        };
        determineView();
    }, [user, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setIsSubmitting(false);
            setShowIntruderAlert(false);
            setRole(null);
            setInhousePhone('');
            setOuthouseData({ fullName: '', rollNumber: '', college: '', PhoneNumber: '', yearOfStudy: '', email: '' });
            setPreferences({
                committeePref1: '', portfolio1_1: '', portfolio1_2: '', portfolio1_3: '',
                committeePref2: '', portfolio2_1: '', portfolio2_2: '', portfolio2_3: '',
                committeePref3: '', portfolio3_1: '', portfolio3_2: '', portfolio3_3: ''
            });
            setLoginUserId('');
            setLoginPassword('');
        }
    }, [isOpen]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setError(null);
        const result = await loginWithGoogle();
        if (!result.success) {
            if (result.error?.includes('Intruder Alert')) setShowIntruderAlert(true);
            else setError(result.error || 'Login failed. Please try again.');
        }
        setIsSubmitting(false);
    };

    const handleCredentialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginUserId || !loginPassword) return;
        setIsSubmitting(true);
        setError(null);
        const result = await loginWithCredentials(loginUserId, loginPassword);
        if (!result.success) setError(result.error || 'Login failed. Please check your credentials.');
        setIsSubmitting(false);
    };

    const handleInhouseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.email) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const userEmail = user.email.trim().toLowerCase();
            const regNumber = extractRegNumber(userEmail);
            const yearDigits = regNumber.substring(0, 2);
            const calculatedYear = getYearOfStudy(regNumber);
            const docRef = doc(db, 'inhouse_registrations', regNumber);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) { setView('already-registered'); setIsSubmitting(false); return; }
            const phoneQuery = query(collection(db, 'inhouse_registrations'), where('phoneNumber', '==', inhousePhone));
            const phoneSnapshot = await getDocs(phoneQuery);
            if (!phoneSnapshot.empty) { setError('This phone number is already registered.'); setIsSubmitting(false); return; }
            await setDoc(docRef, {
                phoneNumber: inhousePhone, fullName: user.name, email: userEmail,
                regNumber, extractedYear: yearDigits, yearOfStudy: calculatedYear,
                timestamp: new Date().toISOString(),
                role,
                ...preferences
            });
            setView('success');
        } catch (err: any) {
            console.error('Error adding document: ', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally { setIsSubmitting(false); }
    };

    const handleOuthouseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const userEmail = outhouseData.email.trim().toLowerCase();
            const docRef = doc(db, 'outhouse_registrations', userEmail);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) { setError('This email is already registered.'); setIsSubmitting(false); return; }
            const phoneQuery = query(collection(db, 'outhouse_registrations'), where('PhoneNumber', '==', outhouseData.PhoneNumber));
            const phoneSnapshot = await getDocs(phoneQuery);
            if (!phoneSnapshot.empty) { setError('This phone number is already registered.'); setIsSubmitting(false); return; }
            await setDoc(docRef, { ...outhouseData, ...preferences, role, email: userEmail, timestamp: new Date().toISOString() });
            setView('success');
        } catch (err: any) {
            console.error('Error adding document: ', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally { setIsSubmitting(false); }
    };

    const handleOuthouseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setOuthouseData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    /* ─── Render Helpers ─── */

    const renderPreferencesSection = () => (
        <div className="space-y-6 mt-6 border-t-[4px] border-white/20 pt-6">
            <h3 className="text-2xl font-staatliches tracking-wide uppercase text-white">Committee Preferences</h3>

            {[1, 2, 3].map((prefNum) => {
                const committeeKey = `committeePref${prefNum}` as keyof typeof preferences;
                const selectedCommittee = preferences[committeeKey];
                const isAIPPM = selectedCommittee === 'AIPPM';
                const isUNHRC = selectedCommittee === 'UNHRC';

                return (
                    <div key={prefNum} className="space-y-4 p-4 md:p-6 bg-[#e0b0ac]/20 border-[4px] border-black shadow-[4px_4px_0_#000]">
                        <h4 className="font-bold font-antonio text-xl tracking-wider uppercase text-gray-900 bg-black text-white inline-block px-3 py-1 -mt-8 -ml-4 md:-ml-6 shadow-[2px_2px_0_#bb943a]">Preference {prefNum}</h4>

                        <div>
                            <label className={labelClass}>Committee</label>
                            <div className="relative">
                                <select
                                    name={committeeKey} required
                                    value={selectedCommittee} onChange={handlePreferenceChange}
                                    className={`${inputClass} appearance-none cursor-pointer ${!selectedCommittee ? 'text-gray-400' : ''}`}
                                >
                                    <option value="" disabled>Select Committee</option>
                                    {COMMITTEES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {selectedCommittee && role !== 'International Press' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[1, 2, 3].map((portNum) => {
                                    const portKey = `portfolio${prefNum}_${portNum}` as keyof typeof preferences;
                                    return (
                                        <div key={portKey}>
                                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                                                Portfolio {portNum}
                                            </label>
                                            {isAIPPM ? (
                                                <div className="relative">
                                                    <select
                                                        name={portKey} required
                                                        value={preferences[portKey]} onChange={handlePreferenceChange}
                                                        className={`${inputClass} text-sm py-2 px-3 appearance-none cursor-pointer ${!preferences[portKey] ? 'text-gray-400' : ''}`}
                                                    >
                                                        <option value="" disabled>Select Portfolio</option>
                                                        {AIPPM_PORTFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            ) : isUNHRC ? (
                                                <div className="relative">
                                                    <select
                                                        name={portKey} required
                                                        value={preferences[portKey]} onChange={handlePreferenceChange}
                                                        className={`${inputClass} text-sm py-2 px-3 appearance-none cursor-pointer ${!preferences[portKey] ? 'text-gray-400' : ''}`}
                                                    >
                                                        <option value="" disabled>Select State</option>
                                                        {UNHRC_PORTFOLIOS.map(p => <option key={p} value={p}>{p}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </div>
                                            ) : (
                                                <input
                                                    type="text" name={portKey} required
                                                    value={preferences[portKey]} onChange={handlePreferenceChange}
                                                    className={`${inputClass} text-sm py-2 px-3`}
                                                    placeholder={`Portfolio ${portNum}`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderSuccess = () => (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#bb943a] border-[4px] border-black shadow-[4px_4px_0_#000] mb-6 transform rotate-3">
                <CheckCircle2 className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-4xl font-staatliches uppercase tracking-wider text-black mb-2">Registration Successful!</h3>
            <p className="text-lg text-gray-700 font-mono font-bold mb-8">
                You are officially registered for NITMUN XIV. See you there!
            </p>
            <button onClick={onClose}
                className="w-full sm:w-auto px-8 py-4 bg-[#232020] text-white font-bold font-antonio tracking-widest text-lg uppercase border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_5px_0_#000] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all">
                Done
            </button>
        </motion.div>
    );

    const renderAlreadyRegistered = () => (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#e08585] border-[4px] border-black shadow-[4px_4px_0_#000] mb-6 transform -rotate-3">
                <CheckCircle2 className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-4xl font-staatliches uppercase tracking-wider text-black mb-2">Already Registered</h3>
            <p className="text-lg text-gray-700 font-mono font-bold mb-8">
                You've already registered for NITMUN{user?.name ? `, ${user.name}` : ''}! See you at the MUN.
            </p>
            <button onClick={onClose}
                className="w-full sm:w-auto px-8 py-4 bg-[#232020] text-white font-bold font-antonio tracking-widest text-lg uppercase border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_5px_0_#000] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all">
                Done
            </button>
        </motion.div>
    );

    const renderInhouseForm = () => (
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            {isAuthLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-12 h-12 border-[4px] border-black border-t-[#bb943a] animate-spin" />
                    <span className="text-xl font-antonio uppercase tracking-widest text-[#bb943a] drop-shadow-[1px_1px_0_#000]">Loading...</span>
                </div>
            ) : !user ? (
                <div className="py-2 space-y-6">
                    <div className="bg-[#bb943a] border-[4px] border-black p-4 shadow-[4px_4px_0_#000] -rotate-1 mb-6">
                        <p className="text-base text-black font-mono font-bold leading-relaxed text-center">
                            Please Sign Up with your institute email to register. If you had already signed up at{' '}
                            <span className="underline decoration-4 underline-offset-4 decoration-white">lcnitd.co.in</span> before, use your login credentials to login.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => { setError(null); setView('login-form'); }}
                            className="flex-1 py-4 bg-[#232020] text-white font-antonio font-bold text-lg uppercase tracking-wider border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_5px_0_#000] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5 stroke-[3]" />
                            Log In
                        </button>
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isSubmitting}
                            className="flex-1 py-4 bg-[#bb943a] text-black font-antonio font-bold text-lg uppercase tracking-wider border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#c58715] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_5px_0_#000] active:translate-x-3 active:translate-y-3 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Mail className="w-5 h-5 stroke-[3]" />
                            )}
                            Sign Up
                        </button>
                    </div>
                </div>
            ) : !role ? (
                <div className="text-center py-4 space-y-8">
                    <p className="text-2xl font-staatliches tracking-wide uppercase text-white drop-shadow-[2px_2px_0_#000] border-b-[4px] border-black pb-4">
                        Select Registration Capacity
                    </p>
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        <button
                            onClick={() => setRole('Delegate')}
                            className="w-full py-5 bg-[#c58715] text-black font-staatliches text-3xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#bb943a] hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                        >
                            Delegate
                        </button>
                        <button
                            onClick={() => setRole('International Press')}
                            className="w-full py-5 bg-[#312e2e] text-white font-staatliches text-2xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-black hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                        >
                            International Press
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleInhouseSubmit} className="space-y-6">
                    <div className="bg-[#e0b0ac] border-[4px] border-black p-4 shadow-[4px_4px_0_#000] rotate-1">
                        <p className="text-base text-black font-mono font-bold text-center">
                            Welcome onboard, <span className="underline decoration-[3px] decoration-white">{user.name}</span>. Enter your phone number below to proceed.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="inhousePhone" className={labelClass}>
                            <Phone className={iconClass} />
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className={fieldIconClass} />
                            <input
                                type="tel" id="inhousePhone" required
                                value={inhousePhone} onChange={(e) => setInhousePhone(e.target.value)}
                                pattern="[0-9]{10}" minLength={10} maxLength={10}
                                className={inputWithIconClass}
                                placeholder="10-digit WhatsApp number"
                            />
                        </div>
                    </div>

                    {renderPreferencesSection()}

                    <button
                        type="submit" disabled={isSubmitting}
                        className="w-full py-5 bg-[#974B60] text-white font-staatliches text-3xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#b05871] hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all disabled:opacity-50 mt-6"
                    >
                        {isSubmitting ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>
            )}
        </motion.div>
    );

    const renderOuthouseForm = () => (
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            {!role ? (
                <div className="text-center py-4 space-y-8">
                    <p className="text-2xl font-staatliches tracking-wide uppercase text-white drop-shadow-[2px_2px_0_#000] border-b-[4px] border-black pb-4">
                        Select Registration Capacity
                    </p>
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        <button
                            onClick={() => setRole('Delegate')}
                            className="w-full py-5 bg-[#c58715] text-black font-staatliches text-3xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#bb943a] hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                        >
                            Delegate
                        </button>
                        <button
                            onClick={() => setRole('International Press')}
                            className="w-full py-5 bg-[#312e2e] text-white font-staatliches text-2xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-black hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                        >
                            International Press
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleOuthouseSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className={labelClass}>
                                <User className={iconClass} />
                                Full Name
                            </label>
                            <input type="text" id="fullName" name="fullName" required
                                value={outhouseData.fullName} onChange={handleOuthouseChange}
                                className={inputClass} placeholder="Your full name" />
                        </div>
                        <div>
                            <label htmlFor="rollNumber" className={labelClass}>
                                <Hash className={iconClass} />
                                Roll Number / ID
                            </label>
                            <input type="text" id="rollNumber" name="rollNumber" required
                                value={outhouseData.rollNumber} onChange={handleOuthouseChange}
                                className={inputClass} placeholder="e.g. 24CS101" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="outhousePhone" className={labelClass}>
                                <Phone className={iconClass} />
                                Phone Number
                            </label>
                            <input type="tel" id="outhousePhone" name="PhoneNumber" required
                                value={outhouseData.PhoneNumber} onChange={handleOuthouseChange}
                                pattern="[0-9]{10}" minLength={10} maxLength={10}
                                className={inputClass} placeholder="10-digit number" />
                        </div>
                        <div>
                            <label htmlFor="outhouseEmail" className={labelClass}>
                                <Mail className={iconClass} />
                                Email Address
                            </label>
                            <input type="email" id="outhouseEmail" name="email" required
                                value={outhouseData.email} onChange={handleOuthouseChange}
                                className={inputClass} placeholder="you@college.edu" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="college" className={labelClass}>
                            <Building2 className={iconClass} />
                            College / Institute
                        </label>
                        <input type="text" id="college" name="college" required
                            value={outhouseData.college} onChange={handleOuthouseChange}
                            className={inputClass} placeholder="Your college name" />
                    </div>

                    <div>
                        <label htmlFor="yearOfStudy" className={labelClass}>
                            <GraduationCap className={iconClass} />
                            Year of Study
                        </label>
                        <div className="relative">
                            <select id="yearOfStudy" name="yearOfStudy" required
                                value={outhouseData.yearOfStudy} onChange={handleOuthouseChange}
                                className={`${inputClass} appearance-none cursor-pointer ${!outhouseData.yearOfStudy ? 'text-gray-400' : ''}`}
                            >
                                <option value="" disabled>Select your year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                                <option value="Postgraduate">Postgraduate</option>
                                <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {renderPreferencesSection()}

                    <div className="pt-4">
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full py-5 bg-[#e08585] text-black font-staatliches text-3xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#ec9696] hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            )}
        </motion.div>
    );

    const renderSelection = () => (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
            <h3 className="text-3xl font-staatliches uppercase tracking-wider text-black border-y-[4px] border-black py-4 mb-8 bg-[#bb943a]">
                Are you a student of NIT Durgapur?
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 max-w-sm mx-auto">
                <button
                    onClick={() => { setError(null); setView('inhouse-form'); }}
                    className="flex-1 py-4 bg-[#6e3545] text-white font-staatliches text-2xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#b05871] hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                >
                    Yes
                </button>
                <button
                    onClick={() => { setError(null); setView('outhouse-form'); }}
                    className="flex-1 py-4 bg-[#232020] text-white font-staatliches text-2xl uppercase tracking-widest border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#312e2e] hover:-translate-y-1 hover:shadow-[8px_10px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                >
                    No
                </button>
            </div>
        </motion.div>
    );

    const renderLoginForm = () => (
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
            <form onSubmit={handleCredentialLogin} className="space-y-5">
                <div>
                    <label htmlFor="loginUserId" className={labelClass}>
                        <User className={iconClass} />
                        User ID
                    </label>
                    <input
                        type="text" id="loginUserId" required
                        value={loginUserId} onChange={(e) => setLoginUserId(e.target.value.toUpperCase())}
                        className={`${inputClass} uppercase`} placeholder="Enter your User ID"
                    />
                </div>

                <div>
                    <label htmlFor="loginPassword" className={labelClass}>
                        <Key className={iconClass} />
                        Password
                    </label>
                    <input
                        type="password" id="loginPassword" required
                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        className={inputClass} placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit" disabled={isSubmitting}
                    className="w-full py-5 bg-[#c58715] text-black font-staatliches tracking-widest text-3xl uppercase border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#bb943a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </motion.div>
    );

    const getTitle = () => {
        if (view === 'success') return 'NITMUN XIV';
        if (view === 'already-registered') return 'NITMUN XIV';
        if (view === 'inhouse-form' || view === 'outhouse-form') return 'Registration for NITMUN';
        if (view === 'login-form') return 'Welcome Back';
        return 'Register for NITMUN XIV';
    };

    const getSubtitle = () => {
        if (view === 'inhouse-form') return 'NIT Durgapur Delegate';
        if (view === 'outhouse-form') return 'Other Institutes';
        if (view === 'login-form') return 'Log in with your existing credentials';
        if (view === 'success' || view === 'already-registered') return '';
        return user ? 'Complete your registration' : '';
    };

    const showBackButton = view !== 'selection' && view !== 'success' && view !== 'already-registered';

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    >
                        {/* Brutalist Noise Overlay */}
                        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="relative w-full max-w-2xl bg-[#232020] border-[6px] border-black shadow-[12px_15px_0_#000] overflow-y-auto max-h-[90vh] z-10 p-2 sm:p-4"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Inner Brutalist Border Frame */}
                            <div className="w-full h-full border-[3px] border-dashed border-black p-4 sm:p-8 relative">

                                {/* Close button */}
                                <button type="button" onClick={onClose}
                                    className="absolute top-2 right-2 md:top-6 md:right-6 w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl hover:bg-[#e08585] hover:text-black border-2 border-black transition-colors z-[60]"
                                    aria-label="Close modal">
                                    <X size={24} className="stroke-[3]" />
                                </button>

                                {showBackButton && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError(null);
                                            if (role) {
                                                setRole(null);
                                            } else {
                                                setView(view === 'login-form' ? 'inhouse-form' : 'selection');
                                            }
                                        }}
                                        className="absolute top-2 left-2 md:top-6 md:left-6 w-10 h-10 bg-[#bb943a] text-black border-2 border-black shadow-[3px_3px_0_#000] flex items-center justify-center hover:bg-[#c58715] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all z-[60]"
                                    >
                                        <ArrowLeft size={20} className="stroke-[3] -ml-1" />
                                    </button>
                                )}

                                <div className="pt-14 md:pt-4">
                                    {/* Header */}
                                    <div className="text-center mb-8 relative px-4 md:px-12">
                                        <h2 className="text-4xl md:text-6xl font-staatliches uppercase text-white drop-shadow-[2px_2px_0_#000] tracking-wide mx-auto">
                                            {getTitle()}
                                        </h2>
                                        {getSubtitle() && (
                                            <p className="inline-block bg-[#312e2e] text-white px-4 py-1 mt-3 font-antonio font-bold tracking-widest text-sm md:text-base uppercase shadow-[4px_4px_0_#000] border-2 border-black transform -rotate-1">
                                                {getSubtitle()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div className="text-red-500 text-sm text-center py-2 px-4 bg-red-50 rounded-lg mb-5">
                                            {error}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <AnimatePresence mode="wait">
                                        {view === 'success' && renderSuccess()}
                                        {view === 'already-registered' && renderAlreadyRegistered()}
                                        {view === 'selection' && renderSelection()}
                                        {view === 'inhouse-form' && renderInhouseForm()}
                                        {view === 'outhouse-form' && renderOuthouseForm()}
                                        {view === 'login-form' && renderLoginForm()}
                                    </AnimatePresence>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Intruder Alert */}
            <AnimatePresence>
                {showIntruderAlert && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowIntruderAlert(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 30 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="relative w-full max-w-md bg-black border-[6px] border-[#e08585] shadow-[10px_10px_0_#974B60] overflow-hidden p-2"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="border-[3px] border-dashed border-[#e08585] p-8 text-center relative h-full">
                                <button onClick={() => setShowIntruderAlert(false)}
                                    className="absolute top-4 right-4 p-2 bg-black text-[#e08585] hover:text-white hover:bg-[#e08585] border-2 border-[#e08585] transition-colors duration-200"
                                    aria-label="Close">
                                    <X size={20} className="stroke-[3]" />
                                </button>

                                <div className="text-7xl mb-6 filter drop-shadow-[4px_4px_0_#e08585]">⚠️</div>
                                <h2 className="text-5xl font-staatliches uppercase tracking-wide text-[#e08585] mb-4">Intruder Alert!</h2>

                                <div className="bg-[#e08585]/10 p-4 border-l-[4px] border-[#e08585] mb-6 inline-block text-left">
                                    <p className="text-zinc-200 font-mono font-bold leading-relaxed mb-2 text-sm">
                                        {">"} ERROR: Unauthorized Access Pattern Detected.
                                    </p>
                                    <p className="text-white font-mono text-xs">
                                        Only NIT Durgapur students have the permission to access this internal portal.
                                    </p>
                                </div>

                                <p className="text-gray-400 font-antonio text-lg tracking-wide uppercase">
                                    Prove your clearance by authenticating via your <strong className="text-white border-b-2 border-[#e08585]">institute workspace profile</strong>!
                                </p>

                                <button onClick={() => setShowIntruderAlert(false)}
                                    className="mt-8 px-8 py-3 bg-[#e08585] text-black font-staatliches text-2xl uppercase tracking-widest border-[4px] border-black shadow-[4px_4px_0_#bb943a] hover:bg-[#ec9696] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all w-full">
                                    Acknowledge
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
