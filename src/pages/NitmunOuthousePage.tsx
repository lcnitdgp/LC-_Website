import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export function NitmunOuthousePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        fullName: '',
        rollNumber: '',
        college: '',
        PhoneNumber: '',
        yearOfStudy: '',
        email: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Create a document using the entered email as the document ID
            const userEmail = formData.email.trim().toLowerCase();
            const docRef = doc(db, 'outhouse_registrations', userEmail);

            // 1. Check if email already exists
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setError('This email is already registered.');
                setIsSubmitting(false);
                return;
            }

            // 2. Check if phone number already exists
            const phoneQuery = query(
                collection(db, 'outhouse_registrations'),
                where('PhoneNumber', '==', formData.PhoneNumber)
            );
            const phoneSnapshot = await getDocs(phoneQuery);
            if (!phoneSnapshot.empty) {
                setError('This phone number is already registered and must be unique.');
                setIsSubmitting(false);
                return;
            }

            await setDoc(docRef, {
                ...formData,
                email: userEmail, // Ensure the email in the document is the cleaned version
                timestamp: new Date().toISOString(),
            });

            setSuccess(true);
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

    if (success) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#18181b] p-8 md:p-12 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Registration Successful!</h2>
                    <p className="text-gray-400 mb-6">Thank you for registering for NITMUN XIV. We have received your details.</p>
                    <p className="text-sm text-blue-400">Redirecting back to NITMUN XIV in a few seconds...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background ambient effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]"></div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 opacity-50 blur-[2px]"></div>

                <div className="bg-[#18181b] rounded-[23px] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>

                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </motion.div>

                        <h1 className="text-3xl sm:text-4xl font-black bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 tracking-tight">
                            OUT-House Registration
                        </h1>
                        <p className="mt-3 text-gray-400 text-lg">
                            NITMUN XIV • Other Institutes Delegate
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="fullName" className="text-sm font-semibold text-gray-300 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"

                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="rollNumber" className="text-sm font-semibold text-gray-300 ml-1">Roll Number / ID</label>
                                <input
                                    type="text"
                                    id="rollNumber"
                                    name="rollNumber"
                                    required
                                    value={formData.rollNumber}
                                    onChange={handleChange}
                                    className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"

                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="PhoneNumber" className="text-sm font-semibold text-gray-300 ml-1">Phone Number</label>
                            <input
                                type="tel"
                                id="PhoneNumber"
                                name="PhoneNumber"
                                required
                                value={formData.PhoneNumber}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                minLength={10}
                                maxLength={10}
                                title="Phone number must be exactly 10 digits"

                                className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"

                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                                title="Please enter a valid email address (example: name@example.com)"
                                onChange={handleChange}
                                className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"

                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="college" className="text-sm font-semibold text-gray-300 ml-1">College / Institute Name</label>
                            <input
                                type="text"
                                id="college"
                                name="college"
                                required
                                value={formData.college}
                                onChange={handleChange}
                                className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"

                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="yearOfStudy" className="text-sm font-semibold text-gray-300 ml-1">Year of Study</label>
                            <select
                                id="yearOfStudy"
                                name="yearOfStudy"
                                required
                                value={formData.yearOfStudy}
                                onChange={handleChange}
                                className="w-full bg-[#09090b] border border-gray-800 rounded-xl px-4 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            >
                                <option value="" disabled className="text-gray-600">Select your year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                                <option value="Postgraduate">Postgraduate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="pt-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full relative group overflow-hidden rounded-xl bg-blue-600 px-8 py-4 text-center font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </span>
                                ) : (
                                    "Complete Registration"
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
