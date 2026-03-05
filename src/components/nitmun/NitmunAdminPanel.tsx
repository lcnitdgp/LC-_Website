import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, X, Users, GraduationCap, Building2, Phone, Mail, FileText, Download } from 'lucide-react';
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
                        year: data.yearOfStudy || data.year,
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
                        yearOfStudy: data.yearOfStudy,
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

    const exportToCsv = () => {
        const dataToExport = registrations.filter(reg => reg.type === activeTab);
        if (dataToExport.length === 0) return;

        const headers = [
            'ID', 'Full Name', 'Email', 'Phone Number', 'Role', 'Type',
            'College/NIT', 'Roll Number', 'Year/Year of Study',
            'Committee Pref 1', 'Portfolio 1.1', 'Portfolio 1.2', 'Portfolio 1.3',
            'Committee Pref 2', 'Portfolio 2.1', 'Portfolio 2.2', 'Portfolio 2.3',
            'Committee Pref 3', 'Portfolio 3.1', 'Portfolio 3.2', 'Portfolio 3.3',
            'Payment Ref', 'Timestamp'
        ];

        const escapeCSV = (str: any) => {
            if (str === null || str === undefined) return '';
            const stringified = String(str).replace(/"/g, '""');
            return `"${stringified}"`;
        };

        const csvRows = [headers.join(',')];

        dataToExport.forEach(reg => {
            const row = [
                reg.id,
                reg.fullName,
                reg.email,
                reg.phoneNumber,
                reg.role,
                reg.type,
                reg.type === 'inhouse' ? 'NIT Durgapur' : reg.collegeName,
                reg.rollNumber || '',
                reg.type === 'inhouse' ? reg.year : reg.yearOfStudy,
                reg.committeePref1 || '',
                reg.portfolio1_1 || '', reg.portfolio1_2 || '', reg.portfolio1_3 || '',
                reg.committeePref2 || '',
                reg.portfolio2_1 || '', reg.portfolio2_2 || '', reg.portfolio2_3 || '',
                reg.committeePref3 || '',
                reg.portfolio3_1 || '', reg.portfolio3_2 || '', reg.portfolio3_3 || '',
                reg.paymentReferenceNumber || '',
                reg.timestamp ? new Date(reg.timestamp).toLocaleString() : ''
            ].map(escapeCSV);

            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `nitmun_${activeTab}_registrations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-[#232020] z-50 flex flex-col font-inter overflow-hidden border-[8px] border-black shadow-[inset_0_0_0_4px_#bb943a]">
            {/* Header */}
            <div className="bg-[#bb943a] border-b-[6px] border-black p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_0_#000] z-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                        <h2 className="text-3xl font-staatliches uppercase text-white flex items-center gap-3 drop-shadow-[2px_2px_0_#000] tracking-wider">
                            <div className="bg-[#232020] p-2 border-[3px] border-black shadow-[3px_3px_0_#fff]">
                                <Users className="text-white w-6 h-6" />
                            </div>
                            NITMUN Records
                        </h2>

                        <div className="flex gap-2 sm:hidden">
                            <button onClick={exportToCsv} className="h-10 px-3 bg-[#bb943a] text-black flex items-center justify-center gap-2 border-[3px] border-black shadow-[3px_3px_0_#000] hover:bg-white hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all font-antonio font-bold uppercase tracking-widest text-xs whitespace-nowrap" title="Export to CSV">
                                <span>Export to CSV</span>
                                <Download size={16} className="stroke-[3]" />
                            </button>
                            <button onClick={onClose} className="w-10 h-10 bg-black text-white flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0_#fff] hover:bg-white hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all">
                                <X size={24} className="stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('inhouse')}
                            className={`flex-1 sm:flex-none px-6 py-2 border-[4px] border-black font-antonio font-bold uppercase tracking-widest transition-all ${activeTab === 'inhouse'
                                ? 'bg-[#974B60] text-white shadow-[4px_4px_0_#000] translate-x-1 translate-y-1'
                                : 'bg-[#e0b0ac] text-black shadow-[4px_4px_0_#000] hover:bg-[#c89894] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#000]'
                                }`}
                        >
                            In-house
                        </button>
                        <button
                            onClick={() => setActiveTab('outhouse')}
                            className={`flex-1 sm:flex-none px-6 py-2 border-[4px] border-black font-antonio font-bold uppercase tracking-widest transition-all ${activeTab === 'outhouse'
                                ? 'bg-[#974B60] text-white shadow-[4px_4px_0_#000] translate-x-1 translate-y-1'
                                : 'bg-[#e0b0ac] text-black shadow-[4px_4px_0_#000] hover:bg-[#c89894] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#000]'
                                }`}
                        >
                            Out-house
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black stroke-[3]" />
                        <input
                            type="text"
                            placeholder="SEARCH NAME, PHONE..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#e0b0ac] border-[4px] border-black shadow-[4px_4px_0_#000] rounded-none pl-12 pr-4 py-3 text-black font-mono font-bold placeholder-black/60 focus:outline-none focus:bg-[#c89894] focus:border-black transition-colors w-full sm:w-72 uppercase"
                        />
                    </div>
                    <button onClick={exportToCsv} className="h-12 px-4 bg-[#232020] text-white hidden sm:flex items-center justify-center gap-2 border-[4px] border-black shadow-[4px_4px_0_#bb943a] hover:bg-[#bb943a] hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all font-antonio font-bold uppercase tracking-widest whitespace-nowrap" title="Export to CSV">
                        <span>Export to CSV</span>
                        <Download size={20} className="stroke-[3]" />
                    </button>
                    <button onClick={onClose} className="w-12 h-12 bg-[#232020] text-white hidden sm:flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0_#fff] hover:bg-black hover:text-[#bb943a] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all">
                        <X size={24} className="stroke-[3]" />
                    </button>
                </div>
            </div>

            {/* List View */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#232020] relative">
                {/* Brutalist Noise Overlay */}
                <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-16 h-16 border-[6px] border-black border-t-[#bb943a] animate-spin shadow-[4px_4px_0_#000]"></div>
                            <span className="text-2xl font-staatliches uppercase tracking-widest text-white drop-shadow-[2px_2px_0_#bb943a]">Loading Records...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {filteredRegistrations.map((reg) => (
                                    <motion.div
                                        key={reg.id}
                                        layoutId={`card-${reg.id}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => setSelectedReg(reg)}
                                        className="group relative cursor-pointer bg-[#312e2e] border-[5px] border-black shadow-[8px_10px_0_#000] transition-all duration-200 hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_14px_0_#bb943a] active:translate-y-2 active:translate-x-2 active:shadow-none"
                                    >
                                        <div className="absolute top-2 right-2 rotate-6 pointer-events-none z-10">
                                            <div className="border-[3px] border-black text-black px-2 py-1 text-xs font-mono font-bold uppercase tracking-widest bg-[#bb943a] shadow-[2px_2px_0_#000]">
                                                {reg.type === 'inhouse' ? 'IN-HOUSE' : 'OUT-HOUSE'}
                                            </div>
                                        </div>

                                        <div className="p-5 flex flex-col h-full">
                                            <div className="flex items-start gap-5">
                                                <div className="w-24 h-28 bg-[#c58715] border-[4px] border-black flex-shrink-0 overflow-hidden relative shadow-[4px_4px_0_#000] rotate-1 group-hover:-rotate-2 transition-transform">
                                                    <img
                                                        src={mysteriousManImage}
                                                        alt="Delegate"
                                                        className="w-full h-full object-cover grayscale contrast-150 mix-blend-multiply opacity-80"
                                                    />
                                                </div>

                                                <div className="flex-1 space-y-3 font-mono mt-1 overflow-visible">
                                                    <div>
                                                        <p className="text-xs text-[#e0b0ac] border-b-2 border-black inline-block uppercase font-bold mb-1">Name</p>
                                                        <p className="text-white font-bold text-lg leading-tight truncate px-1 bg-[#232020] border-2 border-transparent">
                                                            {reg.fullName}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Role</p>
                                                        <p className="text-white font-bold text-sm bg-[#232020] px-1 inline-block truncate max-w-full">
                                                            {reg.role || 'Delegate'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Phone</p>
                                                        <p className="text-white font-bold text-sm bg-[#232020] px-1 inline-block truncate max-w-full">
                                                            {reg.phoneNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t-[4px] border-dashed border-black flex justify-between items-center bg-[#232020] -mx-5 -mb-5 px-5 py-3">
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div key={i} className="w-2 h-4 bg-black group-hover:bg-[#bb943a] transition-colors border-2 border-transparent group-hover:border-black"></div>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-white font-mono font-bold uppercase tracking-widest bg-[#312e2e] border-2 border-black px-2 shadow-[2px_2px_0_#000] rotate-1">
                                                    ID: {reg.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {!loading && filteredRegistrations.length === 0 && (
                                <div className="col-span-full py-20 text-center flex flex-col items-center">
                                    <div className="w-24 h-24 mb-6 bg-[#6e3545] border-[5px] border-black shadow-[6px_6px_0_#000] flex items-center justify-center transform -rotate-6">
                                        <Search className="w-12 h-12 text-black stroke-[3]" />
                                    </div>
                                    <h3 className="text-4xl font-staatliches uppercase text-white tracking-widest drop-shadow-[2px_2px_0_#000]">No matching records</h3>
                                    <p className="text-white font-mono font-bold mt-2 bg-[#312e2e] px-4 border-[3px] border-black shadow-[4px_4px_0_#bb943a] inline-block">Try a different search query...</p>
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-3xl bg-[#232020] border-[6px] border-black shadow-[15px_15px_0_#000] max-h-[90vh] flex flex-col p-2"
            >
                <div className="w-full flex-1 flex flex-col min-h-0 border-[3px] border-dashed border-black bg-[#312e2e]">
                    <div className="flex justify-between items-center shrink-0 p-6 sm:p-8 border-b-[5px] border-black bg-[#6e3545]">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-staatliches uppercase text-white drop-shadow-[2px_2px_0_#000]">{reg.fullName}</h2>
                            <div className="flex items-center gap-3 mt-3">
                                <span className="px-3 py-1 bg-[#312e2e] border-[3px] border-black font-antonio font-bold uppercase tracking-widest text-white shadow-[2px_2px_0_#000] text-sm">
                                    {reg.role || 'Delegate'}
                                </span>
                                <span className="px-3 py-1 bg-black text-[#e0b0ac] border-[3px] border-black font-antonio font-bold uppercase tracking-widest shadow-[2px_2px_0_#ea9a9a] text-sm">
                                    {reg.type === 'inhouse' ? 'NIT Durgapur' : 'Out-house'}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 bg-black text-white flex items-center justify-center border-[3px] border-black shadow-[3px_3px_0_#fff] hover:bg-white hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all">
                            <X size={28} className="stroke-[3]" />
                        </button>
                    </div>

                    <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-10 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.15%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3Ccircle cx=%2213%22 cy=%2213%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E')]">
                        {/* Personal Info */}
                        <section>
                            <h3 className="text-3xl font-staatliches text-white uppercase tracking-widest mb-6 inline-block border-b-4 border-[#e08585] pb-1">Contact & Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#232020] p-5 border-[4px] border-black shadow-[6px_6px_0_#000] rotate-1">
                                    <div className="flex items-center gap-2 text-[#e0b0ac] mb-2 font-mono font-bold text-xs uppercase">
                                        <Mail className="w-4 h-4 text-white" />
                                        <span>Email</span>
                                    </div>
                                    <p className="text-white font-mono font-bold text-lg break-all">{reg.email}</p>
                                </div>
                                <div className="bg-[#232020] p-5 border-[4px] border-black shadow-[6px_6px_0_#000] -rotate-1">
                                    <div className="flex items-center gap-2 text-[#e0b0ac] mb-2 font-mono font-bold text-xs uppercase">
                                        <Phone className="w-4 h-4 text-white" />
                                        <span>Phone</span>
                                    </div>
                                    <p className="text-white font-mono font-bold text-xl">{reg.phoneNumber || "N/A"}</p>
                                </div>

                                {reg.type === 'inhouse' ? (
                                    <>
                                        <div className="bg-[#bb943a] p-5 border-[4px] border-black shadow-[6px_6px_0_#000] rotate-1">
                                            <div className="flex items-center gap-2 text-black/70 mb-2 font-mono font-bold text-xs uppercase">
                                                <GraduationCap className="w-5 h-5 text-black" />
                                                <span>Roll Number</span>
                                            </div>
                                            <p className="text-black font-staatliches text-2xl uppercase tracking-widest">{reg.rollNumber}</p>
                                        </div>
                                        <div className="bg-[#e0b0ac] p-5 border-[4px] border-black shadow-[6px_6px_0_#000] -rotate-1">
                                            <div className="flex items-center gap-2 text-black/70 mb-2 font-mono font-bold text-xs uppercase">
                                                <Building2 className="w-4 h-4 text-black" />
                                                <span>Year</span>
                                            </div>
                                            <p className="text-black font-staatliches text-3xl">{reg.year}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-[#bb943a] p-5 border-[4px] border-black shadow-[6px_6px_0_#000] rotate-1">
                                            <div className="flex items-center gap-2 text-black/70 mb-2 font-mono font-bold text-xs uppercase">
                                                <Building2 className="w-4 h-4 text-black" />
                                                <span>College</span>
                                            </div>
                                            <p className="text-black font-staatliches text-2xl uppercase tracking-wider line-clamp-2">{reg.collegeName}</p>
                                        </div>
                                        <div className="bg-[#e0b0ac] p-5 border-[4px] border-black shadow-[6px_6px_0_#000] -rotate-1">
                                            <div className="flex items-center gap-2 text-black/70 mb-2 font-mono font-bold text-xs uppercase">
                                                <GraduationCap className="w-4 h-4 text-black" />
                                                <span>Year of Study</span>
                                            </div>
                                            <p className="text-black font-staatliches text-3xl text-left">{reg.yearOfStudy}</p>
                                        </div>
                                        {reg.paymentReferenceNumber && (
                                            <div className="md:col-span-2 bg-[#232020] p-5 text-white border-[4px] border-black shadow-[6px_6px_0_#000] translate-x-1">
                                                <div className="flex items-center gap-2 text-gray-400 mb-2 font-mono font-bold text-xs uppercase">
                                                    <FileText className="w-4 h-4 text-white" />
                                                    <span>Payment Reference</span>
                                                </div>
                                                <p className="text-white font-mono font-bold text-xl">{reg.paymentReferenceNumber}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Preferences */}
                        <section>
                            <h3 className="text-3xl font-staatliches text-white uppercase tracking-widest mb-6 inline-block border-b-4 border-[#e08585] pb-1">Preferences</h3>
                            <div className="space-y-6">
                                {preferences.length > 0 ? preferences.map((pref, idx) => (
                                    <div key={idx} className="bg-[#232020] p-6 border-[5px] border-black shadow-[8px_8px_0_#000] flex flex-col gap-6">
                                        <div className="flex items-center gap-5 border-b-[3px] border-dashed border-black pb-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-black flex items-center justify-center font-staatliches text-white text-3xl shadow-[3px_3px_0_#bb943a] rotate-3">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[#e0b0ac] font-mono font-bold text-xs uppercase tracking-widest mb-1">Committee</p>
                                                <p className="text-white text-3xl font-staatliches uppercase tracking-wide">{pref.committee}</p>
                                            </div>
                                        </div>

                                        {reg.role !== 'International Press' && (
                                            <div className="pl-2">
                                                <p className="text-gray-400 font-mono font-bold text-xs uppercase border-l-4 border-[#974B60] pl-2 mb-3">Portfolios / Characters</p>
                                                {pref.portfolios.length > 0 ? (
                                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                        {pref.portfolios.map((portfolio, i) => (
                                                            <li key={i} className="px-4 py-3 bg-[#312e2e] border-[3px] border-black flex items-start gap-3 shadow-[3px_3px_0_#000]">
                                                                <span className="text-[#e0b0ac] font-staatliches text-xl inline-block mt-0.5">{i + 1}.</span>
                                                                <span className="text-white font-mono font-bold pt-1">{portfolio as string}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500 font-mono font-bold italic bg-[#312e2e] p-3 border-2 border-black">None selected</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <div className="text-center py-10 bg-[#232020] border-[5px] border-black border-dashed">
                                        <p className="text-gray-400 font-staatliches text-2xl uppercase tracking-widest opacity-50">No preferences recorded.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
