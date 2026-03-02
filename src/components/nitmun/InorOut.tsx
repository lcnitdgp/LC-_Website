import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const extractRegNumber = (email: string) => {
    const match = email.match(/\.([^.@]+)@/);
    if (match && match[1]) {
        return match[1].toLowerCase();
    }
    return email.split('@')[0].toLowerCase();
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export function NitmunRegistrationModal({ isOpen, onClose }: Props) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isRegisteredInhouse, setIsRegisteredInhouse] = useState(false);

    useEffect(() => {
        const checkRegistration = async () => {
            if (!user?.email || !isOpen) return;

            try {
                const userEmail = user.email.trim().toLowerCase();
                if (!userEmail.endsWith('@nitdgp.ac.in')) return;

                const regNumber = extractRegNumber(userEmail);
                const docRef = doc(db, 'inhouse_registrations', regNumber);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setIsRegisteredInhouse(true);
                }
            } catch (err) {
                console.error("Error checking registration status", err);
            }
        };

        checkRegistration();
    }, [user, isOpen]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-2xl z-10 my-8"
                    >
                        {/* Soft outer glow */}
                        <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 blur-xl opacity-50 animate-[pulse_3s_ease-in-out_infinite]"></div>

                        {/* Crisp border line */}
                        <div className="absolute -inset-[2px] rounded-[24px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>

                        {/* Main Content Card */}
                        <div className="relative bg-[#09090b] rounded-[22px] p-8 md:p-12 shadow-2xl overflow-hidden h-full w-full">
                            {/* Decorative subtle background grid or effects inside can go here */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.1),transparent_50%)]"></div>

                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full z-20 backdrop-blur-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="relative z-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-center"
                                >
                                    <h2 className="text-4xl md:text-5xl font-black bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-2 tracking-tight pb-1">
                                        Register for NITMUN XIV
                                    </h2>
                                    <p className="text-gray-400 mt-4 mb-10 text-lg font-medium">
                                        Select your delegation type to proceed with registration
                                    </p>
                                </motion.div>

                                <div className={`grid grid-cols-1 ${!isRegisteredInhouse ? 'md:grid-cols-2' : 'max-w-md mx-auto'} gap-6 w-full`}>
                                    {/* IN-House Option */}
                                    <motion.button
                                        onClick={() => {
                                            onClose();
                                            navigate('/nitmunxiv/inhouse');
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full flex flex-col items-center justify-center p-8 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-amber-500/50 rounded-2xl transition-all duration-300 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <div className="mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <div className="w-16 h-16 rounded-full bg-black/50 border border-gray-800 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.1)] group-hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:border-amber-500/50 transition-all duration-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        </div>

                                        <span className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors tracking-wide">IN-House</span>
                                        <span className="text-sm text-gray-400 mt-3 font-medium tracking-widest uppercase">NITD Students</span>
                                    </motion.button>

                                    {/* OUT-House Option */}
                                    {!isRegisteredInhouse && (
                                        <motion.button
                                            onClick={() => {
                                                onClose();
                                                navigate('/nitmunxiv/outhouse');
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex flex-col items-center justify-center p-8 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-blue-500/50 rounded-2xl transition-all duration-300 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            <div className="mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <div className="w-16 h-16 rounded-full bg-black/50 border border-gray-800 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:border-blue-500/50 transition-all duration-300">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <span className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">OUT-House</span>
                                            <span className="text-sm text-gray-400 mt-3 font-medium tracking-widest uppercase">Other Institutes</span>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
