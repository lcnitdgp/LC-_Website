import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Mail, Key, User } from 'lucide-react';
import { useAuth } from '../../context';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { loginWithGoogle, loginWithCredentials, isLoading } = useAuth();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCredentialLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !password) return;

        setIsSubmitting(true);
        setError(null);

        const result = await loginWithCredentials(userId, password);

        if (result.success) {
            onClose();
            resetForm();
        } else {
            setError(result.error || 'Login failed');
        }

        setIsSubmitting(false);
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setError(null);

        const result = await loginWithGoogle();

        if (result.success) {
            onClose();
            resetForm();
        } else {
            setError(result.error || 'Login failed');
        }

        setIsSubmitting(false);
    };

    const resetForm = () => {
        setUserId('');
        setPassword('');
        setError(null);
    };

    const handleClose = () => {
        resetForm();
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
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative w-full max-w-md bg-gradient-to-br from-white via-gray-50 to-primary-50 rounded-2xl shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                                    <LogIn className="w-8 h-8 text-primary-600" />
                                </div>
                                <h2 className="text-2xl font-cormorant font-semibold text-gray-800">
                                    Welcome Back
                                </h2>
                                <p className="text-sm text-gray-500 mt-2 font-spectral">
                                    Log in to your Literary Circle account
                                </p>
                            </div>

                            <form onSubmit={handleCredentialLogin} className="space-y-5">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <User className="w-4 h-4 mr-2 text-primary-500" />
                                        User ID
                                    </label>
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={e => setUserId(e.target.value.toUpperCase())}
                                        placeholder="Enter your User ID"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Key className="w-4 h-4 mr-2 text-primary-500" />
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm text-center py-2 bg-red-50 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoading}
                                    className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gradient-to-br from-white via-gray-50 to-primary-50 text-gray-500">
                                        OR
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={isSubmitting || isLoading}
                                className="w-full py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Mail className="w-5 h-5 text-primary-600" />
                                Sign up with Institute Email
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Only @nitdgp.ac.in emails are allowed
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
