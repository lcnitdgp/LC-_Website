import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, AlertCircle, CheckCircle, Hash, FileText, GraduationCap, Save, Users, Heart } from 'lucide-react';
import { useAuth } from '../context';
import { LoginModal } from '../components/auth';

const DEPARTMENTS = [
    'Biotechnology',
    'Chemical',
    'Chemistry',
    'Civil',
    'Computer Science',
    'Electronics and Communication',
    'Electrical',
    'Mathematics and Computing',
    'Mechanical',
    'Metallurgy',
] as const;

interface MissingField {
    label: string;
    field: string;
}

const TITLE_TEXT = "The Literary Circle";
const LETTER_DELAY = 120;

const FireEffect = () => (
    <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
    >
        <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[150%] -z-10 rounded-full"
            style={{
                background: 'radial-gradient(ellipse at bottom, rgba(255, 220, 0, 0.6) 0%, rgba(255, 69, 0, 0.3) 50%, transparent 80%)',
                filter: 'blur(5px)',
            }}
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
        />

        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute bottom-1 left-1/2 w-3 h-3 rounded-full"
                style={{
                    background: i % 2 === 0 ? '#ffcc00' : '#ff4500',
                    filter: 'blur(2px)',
                    marginLeft: '-6px'
                }}
                animate={{
                    y: [0, -35 - Math.random() * 15],
                    x: [0, (Math.random() - 0.5) * 30],
                    scale: [1, 0],
                    opacity: [1, 0]
                }}
                transition={{
                    duration: 0.5 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: Math.random() * 0.2,
                    ease: "easeOut"
                }}
            />
        ))}
    </motion.div>
);

function PersistentTitle() {
    return (
        <h1
            className="text-5xl md:text-7xl font-cormorant font-bold text-center px-8 py-4 flex flex-wrap justify-center absolute left-1/2 -translate-x-1/2"
            style={{ top: '80px', zIndex: 10 }}
        >
            {TITLE_TEXT.split('').map((char, index) => (
                <div key={index} className="relative inline-block">
                    <FireEffect />
                    <span
                        style={{
                            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 25%, #ff4500 50%, #ff6347 75%, #ffd700 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            display: 'inline-block',
                            whiteSpace: char === ' ' ? 'pre' : 'normal',
                            position: 'relative',
                            zIndex: 2,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                </div>
            ))}
        </h1>
    );
}


function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
    const [phase, setPhase] = useState<'rolling' | 'shooting' | 'burning' | 'falling' | 'complete'>('rolling');
    const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
    const [shotFired, setShotFired] = useState(false);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        timers.push(setTimeout(() => setPhase('shooting'), 2000));

        const totalShootingTime = TITLE_TEXT.length * LETTER_DELAY + 500;
        timers.push(setTimeout(() => setPhase('burning'), 2000 + totalShootingTime));
        timers.push(setTimeout(() => setPhase('falling'), 2000 + totalShootingTime + 1500));
        timers.push(setTimeout(() => {
            setPhase('complete');
            onComplete();
        }, 2000 + totalShootingTime + 3000));

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    useEffect(() => {
        if (phase === 'shooting') {
            const letterTimers: ReturnType<typeof setTimeout>[] = [];

            for (let i = 0; i < TITLE_TEXT.length; i++) {
                letterTimers.push(setTimeout(() => {
                    setShotFired(true);
                    setCurrentLetterIndex(i);
                    setTimeout(() => setShotFired(false), 80);
                }, i * LETTER_DELAY));
            }

            return () => letterTimers.forEach(clearTimeout);
        }
    }, [phase]);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <AnimatePresence>
                {(phase === 'rolling' || phase === 'shooting') && (
                    <motion.div
                        className="absolute"
                        style={{ top: '80px', right: '5%' }}
                        initial={{ rotate: 0, x: 300, scaleX: -1 }}
                        animate={phase === 'rolling' ? {
                            rotate: 2880,
                            x: 0,
                            scaleX: -1,
                        } : {
                            rotate: 2880 - 20,
                            x: shotFired ? 15 : 0,
                            scaleX: -1,
                        }}
                        transition={phase === 'rolling' ? {
                            duration: 2,
                            ease: "linear",
                        } : {
                            x: { duration: 0.05 },
                            rotate: { duration: 0.15 },
                        }}
                    >
                        <img
                            src="/images/auditions/gun.png"
                            alt="Gun"
                            className="w-40 h-40 object-contain drop-shadow-2xl"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 150, 50, 0.5))' }}
                        />
                        {shotFired && (
                            <motion.div
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"
                                initial={{ opacity: 1, scale: 1.5 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{ duration: 0.1 }}
                                key={currentLetterIndex}
                            >
                                <div
                                    className="w-16 h-16 rounded-full blur-sm"
                                    style={{
                                        background: 'radial-gradient(circle, #fff700 0%, #ff8c00 40%, #ff4500 70%, transparent 100%)'
                                    }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === 'falling' && (
                    <motion.div
                        className="absolute"
                        style={{ top: '80px', right: '5%', scaleX: -1 }}
                        initial={{ y: 0, rotate: 0, opacity: 1 }}
                        animate={{
                            y: [0, 50, 150, 400, 800],
                            rotate: [0, -45, -90, -180, -360],
                            opacity: [1, 1, 0.8, 0.5, 0],
                        }}
                        transition={{ duration: 1.5, ease: "easeIn" }}
                    >
                        <img
                            src="/images/auditions/gun.png"
                            alt="Gun"
                            className="w-40 h-40 object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(phase === 'shooting' || phase === 'burning' || phase === 'falling' || phase === 'complete') && (
                    <motion.div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: '80px' }}
                        initial={{ opacity: 0, scale: 0, x: 200 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                        }}
                    >


                        <h1
                            className="text-5xl md:text-7xl font-cormorant font-bold text-center px-8 py-4 flex flex-wrap justify-center"
                            style={{
                                filter: phase === 'burning' ? 'brightness(1.2)' : 'none',
                            }}
                        >
                            {TITLE_TEXT.split('').map((char, index) => (
                                <motion.div
                                    key={index}
                                    className="relative inline-block"
                                    initial={{ opacity: 0, x: 100, scale: 1.3 }}
                                    animate={index <= currentLetterIndex || phase === 'burning' || phase === 'falling' || phase === 'complete' ? {
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                    } : {
                                        opacity: 0,
                                        x: 100,
                                        scale: 1.3,
                                    }}
                                    transition={{
                                        duration: 0.15,
                                        ease: "easeOut",
                                    }}
                                >
                                    {(index <= currentLetterIndex || phase === 'burning' || phase === 'falling' || phase === 'complete') && (
                                        <FireEffect />
                                    )}
                                    <span
                                        style={{
                                            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 25%, #ff4500 50%, #ff6347 75%, #ffd700 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            display: 'inline-block',
                                            whiteSpace: char === ' ' ? 'pre' : 'normal',
                                            position: 'relative',
                                            zIndex: 2,
                                        }}
                                    >
                                        {char === ' ' ? '\u00A0' : char}
                                    </span>
                                </motion.div>
                            ))}
                        </h1>


                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AuditionsPage() {
    const { user, isLoading, updateUser } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [formData, setFormData] = useState({
        rollNumber: '',
        registrationNumber: '',
        department: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                rollNumber: user.rollNumber || '',
                registrationNumber: user.registrationNumber || '',
                department: user.department || '',
            });
        }
    }, [user]);

    const getMissingFields = (): MissingField[] => {
        if (!user) return [];

        const fields: MissingField[] = [];
        if (!user.rollNumber?.trim()) fields.push({ label: 'Roll Number', field: 'rollNumber' });
        if (!user.registrationNumber?.trim()) fields.push({ label: 'Registration Number', field: 'registrationNumber' });
        if (!user.department?.trim()) fields.push({ label: 'Department', field: 'department' });

        return fields;
    };

    const formatMissingFieldsMessage = (fields: MissingField[]): string => {
        if (fields.length === 0) return '';
        if (fields.length === 1) return fields[0].label;
        if (fields.length === 2) return `${fields[0].label} and ${fields[1].label}`;

        const allButLast = fields.slice(0, -1).map(f => f.label).join(', ');
        const last = fields[fields.length - 1].label;
        return `${allButLast}, and ${last}`;
    };

    const handleInputChange = (field: string, value: string) => {
        if (field === 'rollNumber' || field === 'registrationNumber') {
            value = value.toUpperCase();
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleSave = async () => {
        if (!formData.rollNumber.trim() || !formData.registrationNumber.trim() || !formData.department.trim()) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        const result = await updateUser({
            rollNumber: formData.rollNumber,
            registrationNumber: formData.registrationNumber,
            department: formData.department,
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setShowForm(false);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
        }

        setIsSubmitting(false);
    };

    const missingFields = getMissingFields();
    const isProfileComplete = user && missingFields.length === 0;
    const isNotStudent = user && user.role !== 'student';
    const isNotFirstYear = user && user.role === 'student' && !user.userId?.startsWith('25');

    if (isLoading || !animationComplete) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/auditions/bg-auditions.jpg')" }}
            >
                <div className="min-h-screen bg-black/40">
                    <LoadingAnimation onComplete={() => setAnimationComplete(true)} />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url('/images/auditions/bg-auditions.jpg')" }}
            >
                <div className="min-h-screen bg-black/50">
                    <PersistentTitle />
                    <div className="max-w-4xl mx-auto px-4 pt-48 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                                    <h2 className="text-2xl font-merriweather text-amber-100">
                                        Authentication Required
                                    </h2>
                                </div>
                                <p className="text-amber-200/80 font-spectral mb-8">
                                    You must be logged in to proceed with the auditions.
                                </p>
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-500/30"
                                >
                                    <LogIn size={20} />
                                    Login to Continue
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <LoginModal
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                    />
                </div>
            </div>
        );
    }

    if (isNotStudent) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url('/images/auditions/bg-auditions.jpg')" }}
            >
                <div className="min-h-screen bg-black/50">
                    <PersistentTitle />
                    <div className="max-w-4xl mx-auto px-4 pt-48 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <Users className="w-8 h-8 text-purple-400" />
                                    <h2 className="text-2xl font-merriweather text-amber-100">
                                        Wait a minute...
                                    </h2>
                                </div>
                                <p className="text-amber-200/90 font-spectral text-lg">
                                    Seriously <span className="text-orange-400 font-semibold">{user.name}</span>? Aren't you a member of the Circle already? Bring your juniors for auditions rather than wasting time here!
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    if (isNotFirstYear) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url('/images/auditions/bg-auditions.jpg')" }}
            >
                <div className="min-h-screen bg-black/50">
                    <PersistentTitle />
                    <div className="max-w-4xl mx-auto px-4 pt-48 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <Heart className="w-8 h-8 text-pink-400" />
                                    <h2 className="text-2xl font-merriweather text-amber-100">
                                        We Appreciate You!
                                    </h2>
                                </div>
                                <p className="text-amber-200/90 font-spectral text-lg leading-relaxed">
                                    Hey <span className="text-orange-400 font-semibold">{user.name}</span>. We really appreciate your interest in joining the Circle. However, we only take 1st years in our <span className="text-orange-400">Inner Circle</span>. But don't lose heart — you can still be a part of the bigger <span className="text-orange-400">Outer Circle</span> by actively participating in our events! Stay tuned for <span className="font-semibold text-amber-100">NITMUN</span> and <span className="font-semibold text-amber-100">Verve</span>!
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isProfileComplete) {
        return (
            <div
                className="min-h-screen bg-cover bg-center bg-no-repeat relative"
                style={{ backgroundImage: "url('/images/auditions/bg-auditions.jpg')" }}
            >
                <div className="min-h-screen bg-black/50">
                    <PersistentTitle />
                    <div className="max-w-4xl mx-auto px-4 pt-48 pb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >

                            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <AlertCircle className="w-8 h-8 text-orange-400" />
                                    <h2 className="text-2xl font-merriweather text-amber-100">
                                        Almost There!
                                    </h2>
                                </div>
                                <p className="text-amber-200/90 font-spectral mb-8 text-lg">
                                    Hey <span className="text-orange-400 font-semibold">{user.name || 'there'}</span>! We are glad you are so excited to join the circle but please add your{' '}
                                    <span className="text-orange-300">{formatMissingFieldsMessage(missingFields)}</span> first!
                                </p>

                                {!showForm ? (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-500/30"
                                    >
                                        Add Missing Information
                                    </button>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-black/30 rounded-xl p-6 mt-6 text-left border border-amber-500/10"
                                    >
                                        <h3 className="text-lg font-semibold text-amber-100 mb-6 text-center">Complete Your Information</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="flex items-center text-sm font-medium text-amber-200 mb-2">
                                                    <Hash className="w-4 h-4 mr-2 text-orange-400" />
                                                    Roll Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.rollNumber}
                                                    onChange={e => handleInputChange('rollNumber', e.target.value)}
                                                    placeholder="Enter roll number"
                                                    className="w-full px-4 py-3 border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-black/30 text-white font-spectral uppercase placeholder-amber-200/50"
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center text-sm font-medium text-amber-200 mb-2">
                                                    <FileText className="w-4 h-4 mr-2 text-orange-400" />
                                                    Registration Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.registrationNumber}
                                                    onChange={e => handleInputChange('registrationNumber', e.target.value)}
                                                    placeholder="Enter registration number"
                                                    className="w-full px-4 py-3 border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-black/30 text-white font-spectral uppercase placeholder-amber-200/50"
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center text-sm font-medium text-amber-200 mb-2">
                                                    <GraduationCap className="w-4 h-4 mr-2 text-orange-400" />
                                                    Department
                                                </label>
                                                <select
                                                    value={formData.department}
                                                    onChange={e => handleInputChange('department', e.target.value)}
                                                    className="w-full px-4 py-3 border border-amber-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 bg-black/30 text-white font-spectral appearance-none cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-900">Select department</option>
                                                    {DEPARTMENTS.map(dept => (
                                                        <option key={dept} value={dept} className="bg-gray-900">{dept}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {message && (
                                                <div className={`text-sm text-center py-2 rounded-lg ${message.type === 'success' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20'
                                                    }`}>
                                                    {message.text}
                                                </div>
                                            )}

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={() => setShowForm(false)}
                                                    className="flex-1 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-all duration-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSubmitting}
                                                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    <Save className="w-5 h-5" />
                                                    {isSubmitting ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/images/auditions/bg-auditions.jpg')" }}
        >
            <div className="min-h-screen bg-black/50">
                <PersistentTitle />
                <div className="max-w-4xl mx-auto px-4 pt-48 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >

                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                                <h2 className="text-2xl font-merriweather text-amber-100">
                                    Hey {user.name}!
                                </h2>
                            </div>
                            <p className="text-amber-200/90 font-spectral mb-8 text-lg">
                                Click the button below if you wish to join the Circle!
                            </p>

                            <button
                                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-orange-500/30 group transform hover:scale-105 duration-200"
                            >
                                <span className="font-merriweather text-lg">Join the Circle</span>
                                <CheckCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
