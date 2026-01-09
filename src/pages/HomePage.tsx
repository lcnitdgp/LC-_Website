import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, Footer } from '../components/layout';
import { HeroSection, AboutSection, TeamSection } from '../components/sections';
import { SEO } from '../components/SEO';
import { useAuth } from '../context';
import { db } from '../firebase';

function AuditionsPromoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const navigate = useNavigate();

    const handleJoinCircle = () => {
        navigate('/auditions');
        onClose();
    };

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
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-green-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-100 rounded-full blur-3xl" />
                        </div>

                        <div className="relative p-8 text-center">
                            <h2 className="text-2xl md:text-3xl font-merriweather text-green-700 font-bold mb-8">
                                The Circle is Expanding!
                            </h2>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-gray-300"
                                >
                                    Never Mind
                                </button>
                                <button
                                    onClick={handleJoinCircle}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                                >
                                    Join the Circle
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function HomePage() {
    const { user, isLoading } = useAuth();
    const [showPromo, setShowPromo] = useState(false);
    const [checkingResponses, setCheckingResponses] = useState(true);

    useEffect(() => {
        const checkShouldShowPromo = async () => {
            if (isLoading) return;

            if (!user) {
                setShowPromo(true);
                setCheckingResponses(false);
                return;
            }

            if (user.userId?.startsWith('25')) {
                try {
                    const responseDoc = await getDoc(doc(db, 'responses', user.userId));
                    if (!responseDoc.exists()) {
                        setShowPromo(true);
                    }
                } catch (error) {
                    console.error('Error checking responses:', error);
                }
            }

            setCheckingResponses(false);
        };

        checkShouldShowPromo();
    }, [user, isLoading]);

    return (
        <div className="min-h-screen">
            <SEO
                title="The Literary Circle - NIT Durgapur"
                description="NIT Durgapur's premier literary society. Home of NITMUN, Verve, and Humans of NIT Durgapur."
                keywords={["Literary Circle", "LC", "LC NIT Durgapur", "NIT Durgapur", "Literary Society", "nit", "NIT", "nitdgp", "NITD", "National Institute of Technology Durgapur", "nit clubs", "nit dgp clubs", "best club in nit dgp", "official literary club", "nit durgapur site"]}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "The Literary Circle",
                    "alternateName": ["LC", "LC NIT Durgapur"],
                    "url": "https://www.lcnitd.co.in/",
                    "logo": "https://www.lcnitd.co.in/images/team/lcmeta.png",
                    "sameAs": [
                        "https://www.facebook.com/lcnitd/",
                        "https://www.instagram.com/lcnitd/"
                    ],
                    "location": {
                        "@type": "Place",
                        "name": "NIT Durgapur",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Durgapur",
                            "addressRegion": "West Bengal",
                            "addressCountry": "IN"
                        }
                    }
                }}
            />
            <Header />
            <main>
                <HeroSection />
                <AboutSection />
                <TeamSection />
            </main>
            <Footer />

            <AuditionsPromoModal
                isOpen={showPromo && !checkingResponses}
                onClose={() => setShowPromo(false)}
            />
        </div>
    );
}
