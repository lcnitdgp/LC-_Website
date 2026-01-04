import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Check, X } from 'lucide-react';
import { useAuth } from '../../context';

interface SetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SetPasswordModal({ isOpen, onClose }: SetPasswordModalProps) {
    const { setPassword } = useAuth();
    const [passwordValue, setPasswordValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!passwordValue.trim()) return;

        setIsSubmitting(true);
        setError(null);

        const result = await setPassword(passwordValue);

        if (result.success) {
            setPasswordValue('');
            onClose();
        } else {
            setError(result.error || 'Failed to set password');
        }

        setIsSubmitting(false);
    };

    const handleSetLater = () => {
        setPasswordValue('');
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative w-full max-w-md bg-gradient-to-br from-white via-gray-50 to-primary-50 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                                    <Key className="w-8 h-8 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-cormorant font-semibold text-gray-800">
                                    Set Your Password
                                </h2>
                                <p className="text-sm text-gray-500 mt-2 font-spectral">
                                    Your password is not set. Please type a password below to set it for this account.
                                </p>
                            </div>

                            <div className="mb-6">
                                <input
                                    type="password"
                                    value={passwordValue}
                                    onChange={e => setPasswordValue(e.target.value)}
                                    placeholder="Enter a password"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handleSave}
                                    disabled={!passwordValue.trim() || isSubmitting}
                                    className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Check className="w-5 h-5" />
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleSetLater}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                    Set Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
