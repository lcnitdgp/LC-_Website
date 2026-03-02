import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, X, Users, GraduationCap, Building2, Phone, Mail, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mysteriousManImage from '../../assets/auditions/mysterious-man.webp';

interface CommonRegistration {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string; // From PhoneNumber in DB
    role: string;

    // Committees
    committeePref1?: string;
    committeePref2?: string;
    committeePref3?: string;

    // Portfolios
    portfolio1_1?: string;
    portfolio1_2?: string;
    portfolio1_3?: string;

    portfolio2_1?: string;
    portfolio2_2?: string;
    portfolio2_3?: string;

    portfolio3_1?: string;
    portfolio3_2?: string;
    portfolio3_3?: string;

    timestamp?: string; // Stored as ISO string

    rollNumber?: string;
    year?: string;
    collegeName?: string; // From college in DB
    yearOfStudy?: string;
    paymentReferenceNumber?: string;
    type: 'inhouse' | 'outhouse';
}

export function NitmunAdminPanel({ onClose }: { onClose: () => void }) {
    const [registrations, setRegistrations] = useState<CommonRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'inhouse' | 'outhouse'>('inhouse');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReg, setSelectedReg] = useState<CommonRegistration | null>(null);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const inhouseSnap = await getDocs(collection(db, 'inhouse_registrations'));
                const inhouseData = inhouseSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        phoneNumber: data.PhoneNumber || data.phoneNumber,
                        collegeName: data.college || data.collegeName,
                        timestamp: data.timestamp || data.submittedAt?.toDate?.()?.toISOString(), // Convert Firestore Timestamp to ISO string
                        type: 'inhouse' as const
                    };
                }) as CommonRegistration[];

                const outhouseSnap = await getDocs(collection(db, 'outhouse_registrations'));
                const outhouseData = outhouseSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        phoneNumber: data.PhoneNumber || data.phoneNumber,
                        collegeName: data.college || data.collegeName,
                        timestamp: data.timestamp || data.submittedAt?.toDate?.()?.toISOString(), // Convert Firestore Timestamp to ISO string
                        type: 'outhouse' as const
                    };
                }) as CommonRegistration[];

                setRegistrations([...inhouseData, ...outhouseData].sort((a, b) => {
                    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return timeB - timeA;
                }));
            } catch (error) {
                console.error("Error fetching registrations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    const filteredRegistrations = registrations.filter(reg => {
        const matchesTab = reg.type === activeTab;
        const matchesSearch = reg.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.phoneNumber?.includes(searchQuery);
        return matchesTab && matchesSearch;
    });

    return (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col font-inter overflow-hidden">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800 p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
                            <Users className="text-primary-400" />
                            NITMUN Records
                        </h2>

                        <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors sm:hidden">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-zinc-800 rounded-lg p-1 flex w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('inhouse')}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'inhouse'
                                ? 'bg-zinc-700 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                                }`}
                        >
                            In-house
                        </button>
                        <button
                            onClick={() => setActiveTab('outhouse')}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'outhouse'
                                ? 'bg-zinc-700 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
                                }`}
                        >
                            Out-house
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search name, phone, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-primary-500 w-full sm:w-64"
                        />
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-colors hidden sm:block">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredRegistrations.map((reg) => (
                                    <motion.div
                                        key={reg.id}
                                        layoutId={`card-${reg.id}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => setSelectedReg(reg)}
                                        className="group relative cursor-pointer bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/30 hover:-translate-y-2 hover:border-red-800/50"
                                    >
                                        <div className="absolute top-3 right-3 rotate-12 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none z-10">
                                            <div className="border-2 border-red-700 text-red-700 px-2 py-1 text-[10px] font-black uppercase tracking-tighter bg-zinc-900/80">
                                                {reg.type === 'inhouse' ? 'IN-HOUSE' : 'OUT-HOUSE'}
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-20 h-24 bg-zinc-800 border-2 border-red-900/50 flex-shrink-0 overflow-hidden relative">
                                                    <img
                                                        src={mysteriousManImage}
                                                        alt="Delegate"
                                                        className="w-full h-full object-cover grayscale contrast-125 opacity-90"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                </div>

                                                <div className="flex-1 space-y-2 overflow-hidden font-mono mt-1">
                                                    <div>
                                                        <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Name</p>
                                                        <p className="text-white font-bold truncate text-sm">
                                                            {reg.fullName}
                                                        </p>
                                                    </div>
                                                    <div className="h-px bg-zinc-700 w-full"></div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Role</p>
                                                        <p className="text-zinc-400 text-xs truncate">
                                                            {reg.role || 'Delegate'}
                                                        </p>
                                                    </div>
                                                    <div className="h-px bg-zinc-700 w-full"></div>
                                                    <div>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Phone</p>
                                                        <p className="text-zinc-400 text-xs truncate">
                                                            {reg.phoneNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-zinc-700 flex justify-between items-center">
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div key={i} className="w-1 h-4 bg-zinc-700 group-hover:bg-red-800/50 transition-colors"></div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                                                    ID: {reg.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {!loading && filteredRegistrations.length === 0 && (
                                <div className="col-span-full py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-4">
                                        <Search className="w-8 h-8 text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-medium text-zinc-400 mb-1">No registrations found</h3>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedReg && (
                    <RegistrationDetailsModal
                        reg={selectedReg}
                        onClose={() => setSelectedReg(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function RegistrationDetailsModal({ reg, onClose }: { reg: CommonRegistration, onClose: () => void }) {
    // Group portfolios into their respective preferences array
    const preferences = [
        {
            committee: reg.committeePref1,
            portfolios: [reg.portfolio1_1, reg.portfolio1_2, reg.portfolio1_3].filter(Boolean)
        },
        {
            committee: reg.committeePref2,
            portfolios: [reg.portfolio2_1, reg.portfolio2_2, reg.portfolio2_3].filter(Boolean)
        },
        {
            committee: reg.committeePref3,
            portfolios: [reg.portfolio3_1, reg.portfolio3_2, reg.portfolio3_3].filter(Boolean)
        }
    ].filter(pref => pref.committee); // Only map over actual selected preferences

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{reg.fullName}</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${reg.role === 'International Press'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                }`}>
                                {reg.role || 'Delegate'}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {reg.type === 'inhouse' ? 'NIT Durgapur' : 'Out-house'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* Personal Info */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Contact & Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-xs">Email</span>
                                </div>
                                <p className="text-zinc-200 font-medium">{reg.email}</p>
                            </div>
                            <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-xs">Phone</span>
                                </div>
                                <p className="text-zinc-200 font-medium">{reg.phoneNumber || "N/A"}</p>
                            </div>

                            {reg.type === 'inhouse' ? (
                                <>
                                    <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                        <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                            <GraduationCap className="w-4 h-4" />
                                            <span className="text-xs">Roll Number</span>
                                        </div>
                                        <p className="text-zinc-200 font-medium uppercase">{reg.rollNumber}</p>
                                    </div>
                                    <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                        <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                            <Building2 className="w-4 h-4" />
                                            <span className="text-xs">Year</span>
                                        </div>
                                        <p className="text-zinc-200 font-medium">{reg.year}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                        <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                            <Building2 className="w-4 h-4" />
                                            <span className="text-xs">College</span>
                                        </div>
                                        <p className="text-zinc-200 font-medium">{reg.collegeName}</p>
                                    </div>
                                    <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                        <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                            <GraduationCap className="w-4 h-4" />
                                            <span className="text-xs">Year of Study</span>
                                        </div>
                                        <p className="text-zinc-200 font-medium">{reg.yearOfStudy}</p>
                                    </div>
                                    {reg.paymentReferenceNumber && (
                                        <div className="md:col-span-2 bg-zinc-800/30 p-4 rounded-xl border border-zinc-800/50">
                                            <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-xs">Payment Reference</span>
                                            </div>
                                            <p className="text-zinc-200 font-mono text-sm">{reg.paymentReferenceNumber}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {/* Preferences */}
                    <section>
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Preferences</h3>
                        <div className="space-y-4">
                            {preferences.length > 0 ? preferences.map((pref, idx) => (
                                <div key={idx} className="bg-zinc-800/30 p-5 rounded-xl border border-zinc-800/50 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1 font-semibold">Committee</p>
                                            <p className="text-white text-lg font-bold">{pref.committee}</p>
                                        </div>
                                    </div>

                                    {reg.role !== 'International Press' && (
                                        <div className="pl-12">
                                            <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2 font-semibold">Portfolios / Characters</p>
                                            {pref.portfolios.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {pref.portfolios.map((portfolio, i) => (
                                                        <li key={i} className="text-sm px-3 py-2 bg-zinc-800/50 rounded flex items-center gap-3">
                                                            <span className="text-zinc-500 font-mono select-none">{i + 1}.</span>
                                                            <span className="text-zinc-300 font-medium">{portfolio as string}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-zinc-500 italic">None selected</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="text-center py-6 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                                    <p className="text-zinc-500">No preferences recorded.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </motion.div>
        </motion.div>
    );
}
