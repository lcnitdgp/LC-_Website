import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import mysteriousManImage from '../../assets/auditions/mysterious-man.webp';

interface ResponseData {
    userId: string;
    questions: {
        [key: string]: {
            text: string;
            response: string | null;
        };
    };
    completedAt?: any;
}

interface UserProfile {
    userId: string;
    name: string;
    department: string;
    phoneNumber: string;
}

interface Dossier extends ResponseData {
    userProfile?: UserProfile;
}

export function ResponseLibrary({ onClose }: { onClose: () => void }) {
    const [dossiers, setDossiers] = useState<Dossier[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDossiers = dossiers.filter(dossier => {
        if (!searchQuery.trim()) return true;
        const name = dossier.userProfile?.name?.toLowerCase() || '';
        return name.includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responsesRef = collection(db, 'responses');
                const responseSnap = await getDocs(responsesRef);
                const responseList: ResponseData[] = responseSnap.docs.map(doc => ({
                    userId: doc.id,
                    ...doc.data()
                } as ResponseData));

                const userIds = responseList.map(r => r.userId);
                const userProfilesMap: Record<string, UserProfile> = {};

                const usersRef = collection(db, 'Users');
                const usersSnap = await getDocs(usersRef);

                usersSnap.docs.forEach(doc => {
                    const data = doc.data();
                    if (userIds.includes(data.userId)) {
                        userProfilesMap[data.userId] = {
                            userId: data.userId,
                            name: data.name,
                            department: data.department,
                            phoneNumber: data.phoneNumber || ''
                        };
                    }
                });

                const merged: Dossier[] = responseList.map(r => ({
                    ...r,
                    userProfile: userProfilesMap[r.userId]
                }));

                setDossiers(merged);
            } catch (err) {
                console.error("Error fetching dossiers:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto font-special-elite">
            <div className="sticky top-0 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center z-10">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-600 transition-colors"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white ml-4"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="p-8 max-w-7xl mx-auto min-h-screen">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredDossiers.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-zinc-500">
                                No results found for "{searchQuery}"
                            </div>
                        ) : (
                            filteredDossiers.map(dossier => (
                                <DossierCard
                                    key={dossier.userId}
                                    dossier={dossier}
                                    onClick={() => setSelectedDossier(dossier)}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedDossier && (
                    <DossierReader dossier={selectedDossier} onClose={() => setSelectedDossier(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function DossierCard({ dossier, onClick }: { dossier: Dossier, onClick: () => void }) {
    const unknownName = "Unknown";
    const unknownDept = "[REDACTED]";

    const toTitleCase = (str: string) => {
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const displayName = dossier.userProfile?.name
        ? toTitleCase(dossier.userProfile.name)
        : unknownName;

    return (
        <motion.div
            layoutId={`card-${dossier.userId}`}
            onClick={onClick}
            className="group relative cursor-pointer bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/30 hover:-translate-y-2 hover:border-red-800/50"
        >
            <div className="absolute top-3 right-3 rotate-12 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none z-10">
                <div className="border-2 border-red-700 text-red-700 px-2 py-1 text-[10px] font-black uppercase tracking-tighter">
                    Classified
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start gap-4">
                    <div className="w-20 h-24 bg-zinc-800 border-2 border-red-900/50 flex-shrink-0 overflow-hidden relative">
                        <img
                            src={mysteriousManImage}
                            alt="Agent"
                            className="w-full h-full object-cover grayscale contrast-125 opacity-90"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    <div className="flex-1 space-y-2 overflow-hidden font-mono">
                        <div>
                            <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Agent</p>
                            <p className="text-white font-bold truncate text-sm">
                                {displayName}
                            </p>
                        </div>
                        <div className="h-px bg-zinc-700 w-full"></div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Department</p>
                            <p className="text-zinc-400 text-xs truncate">
                                {dossier.userProfile?.department || unknownDept}
                            </p>
                        </div>
                        <div className="h-px bg-zinc-700 w-full"></div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Phone</p>
                            <p className="text-zinc-400 text-xs truncate">
                                {dossier.userProfile?.phoneNumber || 'N/A'}
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
                        ID: {dossier.userId.slice(0, 8)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}


function DossierReader({ dossier, onClose }: { dossier: Dossier, onClose: () => void }) {
    const questionKeys = Object.keys(dossier.questions || {});
    const totalPages = questionKeys.length;
    const [pageIndex, setPageIndex] = useState(0);

    const currentKey = questionKeys[pageIndex];
    const currentQ = dossier.questions[currentKey];

    const nextPage = () => {
        if (pageIndex < totalPages - 1) setPageIndex(p => p + 1);
    };

    const prevPage = () => {
        if (pageIndex > 0) setPageIndex(p => p - 1);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextPage();
            if (e.key === 'ArrowLeft') prevPage();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageIndex, totalPages]);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm"
        >
            <div className="absolute top-4 right-4">
                <button onClick={onClose} className="text-white hover:text-amber-500 transition-colors">
                    <X size={32} />
                </button>
            </div>

            <motion.div
                layoutId={`card-${dossier.userId}`}
                className="w-full max-w-6xl h-[550px] md:h-[600px] bg-[#f4e4bc] rounded-sm shadow-2xl flex flex-col md:flex-row overflow-hidden relative border-4 border-[#8c7b5b] font-[Special_Elite]"
                style={{
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')",
                    boxShadow: "0 0 50px rgba(0,0,0,0.8)"
                }}
            >
                <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-[#c4b48a] via-[#a89566] to-[#c4b48a] opacity-50 z-10 shadow-inner pointer-events-none hidden md:block"></div>

                {totalPages === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[#5c4b2b] italic">
                        No records found for this subject.
                    </div>
                ) : (
                    <>
                        <div className="flex-1 p-6 md:p-12 md:pr-16 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-dashed border-[#8c7b5b]/50 relative bg-[#e8dec8] overflow-y-auto">
                            <div className="text-xs text-[#8c7b5b] font-bold mb-4 uppercase flex justify-between tracking-wider">
                                <span>Case File: {dossier.userId.slice(0, 8)}...</span>
                                <span>Pg {pageIndex + 1} / {totalPages}</span>
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-[#3d2e1a] leading-relaxed mb-8">
                                Q: {currentQ?.text || "Unknown Question"}
                            </h3>

                            <div className="mt-auto">
                                {pageIndex > 0 && (
                                    <button
                                        onClick={prevPage}
                                        className="flex items-center gap-2 text-[#8c7b5b] hover:text-[#5c4b2b] font-bold uppercase tracking-widest transition-colors group"
                                    >
                                        <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                                        Previous
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 p-6 md:p-12 md:pl-16 flex flex-col justify-center relative bg-[#f4e4bc] overflow-y-auto">
                            <div className="text-xs text-[#8c7b5b] font-bold mb-4 uppercase text-right tracking-wider">
                                <span>Response</span>
                            </div>

                            <div className="text-2xl md:text-3xl text-[#2a4a6a] leading-loose max-h-[60%] overflow-y-auto relative">
                                {currentQ?.response ? (
                                    <span style={{ fontFamily: '"Delicious Handrawn", cursive' }}>
                                        {currentQ.response}
                                    </span>
                                ) : (
                                    <div className="rotate-12 opacity-80 border-4 border-red-800 text-red-800 px-4 py-2 text-4xl font-black uppercase tracking-tighter inline-block">
                                        SKIPPED
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto flex justify-end">
                                {pageIndex < totalPages - 1 && (
                                    <button
                                        onClick={nextPage}
                                        className="flex items-center gap-2 text-[#8c7b5b] hover:text-[#5c4b2b] font-bold uppercase tracking-widest transition-colors group"
                                    >
                                        Next
                                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                            </div>

                        </div>
                    </>
                )}

            </motion.div>
        </motion.div>
    );
}

