import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context';
import { LoginModal, SetPasswordModal, UserProfileModal } from '../auth';

function AccessDeniedModal({ isOpen, onClose, role }: { isOpen: boolean; onClose: () => void; role: string }) {
    const isLCite = role === 'LCite';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-red-500/20 rounded-full">
                                    <X className="w-10 h-10 text-red-400" />
                                </div>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-merriweather text-white font-bold mb-4">
                                Stop there!
                            </h2>

                            <p className="text-gray-300 font-spectral leading-relaxed mb-6">
                                {isLCite
                                    ? "This section is reserved for the most elite members of the Circle. You aren't elite enough yet."
                                    : "Only the members of the Circle are allowed beyond this."
                                }
                            </p>

                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function Header() {
    const navigate = useNavigate();
    const { user, needsPasswordSetup, isLoading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAccessDenied, setShowAccessDenied] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (user && needsPasswordSetup) {
            setShowPasswordModal(true);
        }
    }, [user, needsPasswordSetup]);

    const handleAuthButtonClick = () => {
        if (user) {
            setIsProfileModalOpen(true);
        } else {
            setIsLoginModalOpen(true);
        }
        setIsMobileMenuOpen(false);
    };

    const handleMembersClick = () => {
        setIsMobileMenuOpen(false);

        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }

        if (user.admin) {
            navigate('/members');
        } else {
            setShowAccessDenied(true);
        }
    };

    return (
        <>
            <nav
                className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300 rounded-2xl ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm'
                    }`}
            >
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <a href="#" className="flex items-center">
                            <img
                                src="images/team/LClogo.png"
                                alt="The Literary Circle Logo"
                                className="h-12 w-auto"
                            />
                        </a>

                        <div className="hidden md:flex items-center space-x-8">
                            <ul className="flex items-center space-x-8">
                                {siteConfig.navigation.map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noopener noreferrer' : undefined}
                                            className="font-spectral text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={handleMembersClick}
                                        className="flex items-center gap-1.5 font-spectral text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                    >
                                        <Users size={16} />
                                        Admin
                                    </button>
                                </li>
                            </ul>

                            {!isLoading && (
                                <button
                                    onClick={handleAuthButtonClick}
                                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${user
                                        ? 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                                        : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
                                        }`}
                                >
                                    {user ? (
                                        <>
                                            <User size={18} />
                                            {user.userId}
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={18} />
                                            Login
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-700 hover:text-primary-600"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
                            <ul className="flex flex-col space-y-4 pt-4">
                                {siteConfig.navigation.map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            target={item.external ? '_blank' : undefined}
                                            rel={item.external ? 'noopener noreferrer' : undefined}
                                            className="block font-spectral text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={handleMembersClick}
                                        className="flex items-center gap-1.5 font-spectral text-gray-700 hover:text-primary-600 transition-colors duration-200"
                                    >
                                        <Users size={16} />
                                        Admin
                                    </button>
                                </li>
                            </ul>

                            {!isLoading && (
                                <button
                                    onClick={handleAuthButtonClick}
                                    className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-lg transition-all duration-200 ${user
                                        ? 'bg-white border-2 border-primary-600 text-primary-600'
                                        : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                                        }`}
                                >
                                    {user ? (
                                        <>
                                            <User size={18} />
                                            {user.userId}
                                        </>
                                    ) : (
                                        <>
                                            <LogIn size={18} />
                                            Login
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />

            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <SetPasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            <AccessDeniedModal
                isOpen={showAccessDenied}
                onClose={() => setShowAccessDenied(false)}
                role={user?.role || 'student'}
            />
        </>
    );
}
