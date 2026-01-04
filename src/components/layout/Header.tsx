import { useState, useEffect } from 'react';
import { Menu, X, LogIn, User } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context';
import { LoginModal, SetPasswordModal, UserProfileModal } from '../auth';

export function Header() {
    const { user, needsPasswordSetup, isLoading } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

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
        </>
    );
}
