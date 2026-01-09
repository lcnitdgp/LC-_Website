import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { ChevronDown, Users, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { useAuth } from '../context';
import type { UserData } from '../context/AuthContext';
import { Header, Footer } from '../components/layout';
import { MemberCard, MemberDetailsModal } from '../components/members';
import { SEO } from '../components/SEO';

const DUMMY_USER_IDS = ['25A80000', '25M80041', '25S69696'];



function AccessDenied({ role }: { role: string }) {
    const isLCite = role === 'LCite';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Header />
            <SEO
                title="Access Denied - The Literary Circle"
                description="Members dashboard access restricted."
            />
            <main className="pt-32 pb-20">
                <div className="max-w-2xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/20 text-center"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-400" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-merriweather text-white font-bold mb-4">
                            Stop there!
                        </h1>

                        <p className="text-lg text-gray-300 font-spectral leading-relaxed">
                            {isLCite
                                ? "This section is reserved for the most elite members of the circle. You aren't elite enough yet."
                                : "Only the most members of the Circle can go past this."
                            }
                        </p>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

function SectionHeader({
    title,
    count,
    isOpen,
    onToggle
}: {
    title: string;
    count: number;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group"
        >
            <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-merriweather text-gray-800">{title}</h2>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-sm rounded-full">
                    {count}
                </span>
            </div>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <ChevronDown className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" />
            </motion.div>
        </button>
    );
}

export function MembersDashboardPage() {
    const { user, isLoading } = useAuth();
    const [allMembers, setAllMembers] = useState<UserData[]>([]);
    const [sections, setSections] = useState<Record<string, boolean>>({
        dummy: true,
        finalYears: true,
        thirdYears: true,
        secondYears: true,
        firstYears: true,
    });
    const [selectedMember, setSelectedMember] = useState<UserData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, 'Users'));
                const members: UserData[] = [];
                usersSnapshot.forEach((doc) => {
                    members.push(doc.data() as UserData);
                });
                setAllMembers(members);
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoadingMembers(false);
            }
        };

        if (user?.admin) {
            fetchMembers();
        } else {
            setLoadingMembers(false);
        }
    }, [user]);

    const toggleSection = (key: string) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleMemberClick = (member: UserData) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <AccessDenied role="student" />;
    }

    if (!user.admin) {
        return <AccessDenied role={user.role} />;
    }

    const dummyMembers = allMembers.filter(m => DUMMY_USER_IDS.includes(m.userId));
    const finalYears = allMembers.filter(m => m.userId?.startsWith('22') && !DUMMY_USER_IDS.includes(m.userId));
    const thirdYears = allMembers.filter(m => m.userId?.startsWith('23') && !DUMMY_USER_IDS.includes(m.userId));
    const secondYears = allMembers.filter(m => m.userId?.startsWith('24') && !DUMMY_USER_IDS.includes(m.userId));
    const firstYears = allMembers.filter(m => m.userId?.startsWith('25') && !DUMMY_USER_IDS.includes(m.userId));

    const memberSections = [
        { key: 'dummy', title: 'Dummy Accounts', members: dummyMembers },
        { key: 'finalYears', title: 'Final Years', members: finalYears },
        { key: 'thirdYears', title: 'Third Years', members: thirdYears },
        { key: 'secondYears', title: 'Second Years', members: secondYears },
        { key: 'firstYears', title: 'First Years', members: firstYears },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="Members Dashboard - The Literary Circle"
                description="Admin dashboard for managing Literary Circle members."
            />
            <Header />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-4xl font-merriweather text-gray-800">
                                Admin Panel
                            </h1>
                        </div>
                        <p className="text-gray-600 font-spectral">
                            View and manage all registered users of our website.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Total Members: {allMembers.length}
                        </p>
                    </motion.div>

                    {loadingMembers ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {memberSections.map((section) => (
                                <motion.div
                                    key={section.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <SectionHeader
                                        title={section.title}
                                        count={section.members.length}
                                        isOpen={sections[section.key]}
                                        onToggle={() => toggleSection(section.key)}
                                    />

                                    <AnimatePresence>
                                        {sections[section.key] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                {section.members.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500 font-spectral">
                                                        No members in this category
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                                                        {section.members.map((member, index) => (
                                                            <MemberCard
                                                                key={member.userId}
                                                                member={member}
                                                                index={index}
                                                                onClick={() => handleMemberClick(member)}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            <MemberDetailsModal
                member={selectedMember}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedMember(null);
                }}
            />
        </div>
    );
}
