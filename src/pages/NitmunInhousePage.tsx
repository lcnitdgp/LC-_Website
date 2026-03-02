import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { Mail, X } from 'lucide-react';

const extractRegNumber = (email: string) => {
    const match = email.match(/\.([^.@]+)@/);
    if (match && match[1]) {
        return match[1].toLowerCase();
    }
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

export function NitmunInhousePage() {
    const navigate = useNavigate();
    const { user, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showIntruderAlert, setShowIntruderAlert] = useState(false);

    // Check if the user is already registered to avoid re-registration
    const [hasRegistered, setHasRegistered] = useState(false);
    const [isCheckingRegistration, setIsCheckingRegistration] = useState(true);

    const [formData, setFormData] = useState({
        phoneNumber: '',
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Check if the authenticated user has already registered
    useEffect(() => {
        const checkRegistration = async () => {
            if (!user?.email) {
                setIsCheckingRegistration(false);
                return;
            }

            try {
                const userEmail = user.email.trim().toLowerCase();
                const regNumber = extractRegNumber(userEmail);
                const docRef = doc(db, 'inhouse_registrations', regNumber);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setHasRegistered(true);
                }
            } catch (err) {
                console.error("Error checking registration status", err);
            } finally {
                setIsCheckingRegistration(false);
            }
        };

        checkRegistration();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setError(null);

        const result = await loginWithGoogle();

        if (result.success) {
            // Successful login will naturally re-render with `user` object populated
        } else if (result.error?.includes('Intruder Alert')) {
            setShowIntruderAlert(true);
        } else {
            setError(result.error || 'Login failed. Please try again.');
        }

        setIsSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !user.email) {
            setError('You must be logged in to register.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const userEmail = user.email.trim().toLowerCase();
            const regNumber = extractRegNumber(userEmail);
            const yearDigits = regNumber.substring(0, 2);
            const calculatedYear = getYearOfStudy(regNumber);

            const docRef = doc(db, 'inhouse_registrations', regNumber);

            // 1. Double-check if already registered
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setError('You have already registered.');
                setIsSubmitting(false);
                return;
            }

            // 2. Check if phone number already exists
            const phoneQuery = query(
                collection(db, 'inhouse_registrations'),
                where('phoneNumber', '==', formData.phoneNumber)
            );
            const phoneSnapshot = await getDocs(phoneQuery);
            if (!phoneSnapshot.empty) {
                setError('This phone number is already registered and must be unique.');
                setIsSubmitting(false);
                return;
            }

            await setDoc(docRef, {
                ...formData,
                fullName: user.name, // Extracted from Auth Context
                email: userEmail,    // Extracted from Auth Context
                regNumber: regNumber,
                extractedYear: yearDigits,
                yearOfStudy: calculatedYear,
                timestamp: new Date().toISOString(),
            });

            setSuccess(true);
            setHasRegistered(true);
            setTimeout(() => {
                navigate('/nitmunxiv');
            }, 3000);

        } catch (err: any) {
            console.error('Error adding document: ', err);
            setError(err.message || 'An error occurred during registration. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 1. Success UI
    if (success || (hasRegistered && !isCheckingRegistration)) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Decorative background blurs */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative bg-gradient-to-br from-[#18181b] to-[#09090b] p-8 md:p-12 rounded-[2rem] border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] max-w-md w-full text-center overflow-hidden"
                >
                    {/* Inner glowing edge */}
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-50 pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                        className="w-24 h-24 mx-auto relative mb-8"
                    >
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 mb-3 tracking-tight">
                            {success ? 'Registration Successful!' : 'Already Registered!'}
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                            {success
                                ? 'Your credentials have been verified and you are officially registered for NITMUN XIV. See you there!'
                                : 'You have already successfully registered for NITMUN XIV.'}
                        </p>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-6" />

                        {success ? (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <p className="text-sm text-emerald-400/80 font-medium tracking-wide">
                                    Redirecting to Homepage...
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/nitmunxiv')}
                                className="w-full px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                            >
                                Return to Homepage
                            </button>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background ambient effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-900/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-900/10 blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-xl relative z-10"
            >
                <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 opacity-50 blur-[2px]"></div>

                <div className="bg-[#18181b] rounded-[23px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </motion.div>

                        <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 tracking-tight">
                            IN-House Registration
                        </h1>
                        <p className="mt-3 text-gray-400 text-lg">
                            NITMUN XIV • NIT Durgapur Delegate
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* 2. Authentication Wrapper */}
                    {isAuthLoading || isCheckingRegistration ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <svg className="animate-spin h-8 w-8 text-amber-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-gray-400">Loading your profile...</span>
                        </div>
                    ) : !user ? (
                        <div className="py-6 space-y-6">
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 text-center">
                                <p className="text-amber-100 mb-4">You must be logged in with your official institute ID to access the IN-House registration.</p>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-white/5 border border-amber-500/30 text-amber-400 font-semibold rounded-xl hover:bg-amber-500/10 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <svg className="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <Mail className="w-5 h-5 text-amber-500" />
                                )}
                                Sign in with Institute Email
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                Only @nitdgp.ac.in emails are allowed
                            </p>
                        </div>
                    ) : (
                        /* 3. The Registration Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Pre-filled Data Display */}
                            <div className="p-5 bg-black/40 border border-gray-800 rounded-xl space-y-3 mb-8">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Authenticated As</span>
                                    <span className="text-white font-medium">{user.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Email Address</span>
                                    <span className="text-gray-300">{user.email}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-300 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    required
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    pattern="[0-9]{10}"
                                    minLength={10}
                                    maxLength={10}
                                    title="Phone number must be exactly 10 digits"
                                    className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                                    placeholder="Enter your 10 digit WhatsApp number"
                                />
                            </div>

                            <div className="pt-6">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full relative group overflow-hidden rounded-xl bg-amber-600 px-8 py-4 text-center font-bold text-white shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all hover:bg-amber-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Registering...
                                        </span>
                                    ) : (
                                        "Complete IN-House Registration"
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div >

            {/* 4. Intruder Alert Modal */}
            <AnimatePresence>
                {
                    showIntruderAlert && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowIntruderAlert(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 30 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="relative w-full max-w-md bg-gradient-to-br from-red-950 via-red-900 to-black rounded-2xl shadow-2xl overflow-hidden border border-red-500/50"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="h-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

                                <button
                                    onClick={() => setShowIntruderAlert(false)}
                                    className="absolute top-4 right-4 p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-full transition-colors duration-200"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>

                                <div className="p-8 text-center">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h2 className="text-3xl font-bold text-red-400 mb-4">
                                        Access Denied!
                                    </h2>
                                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                        Only NIT Durgapur students have the permission to access IN-House Registration.
                                    </p>
                                    <p className="text-gray-400 text-base">
                                        You must sign-up with your College <strong className="text-white"> NITDGP Work Mail</strong>!
                                    </p>
                                    <button
                                        onClick={() => setShowIntruderAlert(false)}
                                        className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                                    >
                                        Got it
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
