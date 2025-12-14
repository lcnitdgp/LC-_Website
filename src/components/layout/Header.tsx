import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
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
                            src="/images/team/LClogo.png"
                            alt="The Literary Circle Logo"
                            className="h-12 w-auto"
                        />
                    </a>

                    <ul className="hidden md:flex items-center space-x-8">
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
                    </div>
                )}
            </div>
        </nav>
    );
}
