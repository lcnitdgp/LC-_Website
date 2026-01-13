import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Search, MessageSquare, FileText, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context';
import mysteriousManImage from '../../assets/auditions/mysterious-man.webp';

interface MemberComment {
    memberName: string;
    memberComment: string;
}

interface MemberComments {
    round1?: Record<string, MemberComment>;
    round2?: Record<string, MemberComment>;
    round3?: Record<string, MemberComment>;
}

interface ResponseData {
    userId: string;
    questions: {
        [key: string]: {
            text: string;
            response: string | null;
        };
    };
    completedAt?: any;
    memberComments?: MemberComments;
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

type RoundKey = 'round1' | 'round2' | 'round3';

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

    const refreshDossier = async (userId: string) => {
        try {
            const responsesRef = collection(db, 'responses');
            const responseSnap = await getDocs(responsesRef);
            const responseList: ResponseData[] = responseSnap.docs.map(d => ({
                userId: d.id,
                ...d.data()
            } as ResponseData));

            const usersRef = collection(db, 'Users');
            const usersSnap = await getDocs(usersRef);
            const userProfilesMap: Record<string, UserProfile> = {};

            usersSnap.docs.forEach(d => {
                const data = d.data();
                userProfilesMap[data.userId] = {
                    userId: data.userId,
                    name: data.name,
                    department: data.department,
                    phoneNumber: data.phoneNumber || ''
                };
            });

            const merged: Dossier[] = responseList.map(r => ({
                ...r,
                userProfile: userProfilesMap[r.userId]
            }));

            setDossiers(merged);
            const updated = merged.find(d => d.userId === userId);
            if (updated) setSelectedDossier(updated);
        } catch (err) {
            console.error("Error refreshing dossier:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responsesRef = collection(db, 'responses');
                const responseSnap = await getDocs(responsesRef);
                const responseList: ResponseData[] = responseSnap.docs.map(d => ({
                    userId: d.id,
                    ...d.data()
                } as ResponseData));

                const userIds = responseList.map(r => r.userId);
                const userProfilesMap: Record<string, UserProfile> = {};

                const usersRef = collection(db, 'Users');
                const usersSnap = await getDocs(usersRef);

                usersSnap.docs.forEach(d => {
                    const data = d.data();
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
                    <DossierReader
                        dossier={selectedDossier}
                        onClose={() => setSelectedDossier(null)}
                        onRefresh={() => refreshDossier(selectedDossier.userId)}
                    />
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


function DossierReader({ dossier, onClose, onRefresh }: { dossier: Dossier, onClose: () => void, onRefresh: () => void }) {
    const { user } = useAuth();
    const questionKeys = Object.keys(dossier.questions || {});
    const totalPages = questionKeys.length;
    const [pageIndex, setPageIndex] = useState(0);
    const [viewMode, setViewMode] = useState<'questions' | 'review' | 'report'>('questions');
    const [selectedRound, setSelectedRound] = useState<RoundKey | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reportPage, setReportPage] = useState(0);

    const currentKey = questionKeys[pageIndex];
    const currentQ = dossier.questions[currentKey];

    const candidateName = dossier.userProfile?.name
        ? dossier.userProfile.name.split(' ')[0].charAt(0).toUpperCase() + dossier.userProfile.name.split(' ')[0].slice(1).toLowerCase()
        : 'this person';

    const getExistingReview = (round: RoundKey): MemberComment | null => {
        if (!user || !dossier.memberComments?.[round]) return null;
        return dossier.memberComments[round]?.[user.userId] || null;
    };

    const handleSaveComment = async () => {
        if (!user || !selectedRound || !commentText.trim()) return;
        setSaving(true);
        try {
            const reviewerName = user.name?.split(' ')[0] || 'Anonymous';
            await updateDoc(doc(db, 'responses', dossier.userId), {
                [`memberComments.${selectedRound}.${user.userId}`]: {
                    memberName: reviewerName,
                    memberComment: commentText.trim()
                }
            });
            await onRefresh();
            setCommentText('');
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving comment:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteComment = async () => {
        if (!user || !selectedRound) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'responses', dossier.userId), {
                [`memberComments.${selectedRound}.${user.userId}`]: deleteField()
            });
            await onRefresh();
            setCommentText('');
            setIsEditing(false);
        } catch (err) {
            console.error("Error deleting comment:", err);
        } finally {
            setSaving(false);
        }
    };

    const nextPage = () => {
        if (pageIndex < totalPages - 1) setPageIndex(p => p + 1);
    };

    const prevPage = () => {
        if (pageIndex > 0) setPageIndex(p => p - 1);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode === 'questions') {
                if (e.key === 'ArrowRight') nextPage();
                if (e.key === 'ArrowLeft') prevPage();
            }
            if (e.key === 'Escape') {
                if (viewMode !== 'questions') {
                    setViewMode('questions');
                    setSelectedRound(null);
                    setCommentText('');
                    setIsEditing(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageIndex, totalPages, viewMode]);

    const roundLabels: Record<RoundKey, string> = {
        round1: 'First Semester',
        round2: 'Second Semester',
        round3: 'Third Semester'
    };

    const roundNumbers: Record<RoundKey, number> = {
        round1: 1,
        round2: 2,
        round3: 3
    };

    const reportRounds: RoundKey[] = ['round1', 'round2', 'round3'];

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
                className="w-full max-w-6xl h-[550px] md:h-[600px] bg-[#f4e4bc] rounded-sm shadow-2xl flex flex-col overflow-hidden relative border-4 border-[#8c7b5b] font-[Special_Elite]"
                style={{
                    backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')",
                    boxShadow: "0 0 50px rgba(0,0,0,0.8)"
                }}
            >
                <div className="flex flex-wrap gap-1 md:gap-2 p-2 md:p-3 border-b-2 border-dashed border-[#8c7b5b]/50 bg-[#d4c5a6]">
                    <button
                        onClick={() => { setViewMode('questions'); setSelectedRound(null); setCommentText(''); setIsEditing(false); }}
                        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${viewMode === 'questions' ? 'bg-[#5c4b2b] text-[#f4e4bc]' : 'bg-[#f4e4bc] text-[#5c4b2b] hover:bg-[#e8dec8]'}`}
                    >
                        <FileText size={14} className="hidden md:block" />
                        <FileText size={12} className="md:hidden" />
                        <span className="hidden md:inline">Responses</span>
                        <span className="md:hidden">Q&A</span>
                    </button>
                    <button
                        onClick={() => { setViewMode('review'); setSelectedRound(null); setCommentText(''); setIsEditing(false); }}
                        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${viewMode === 'review' ? 'bg-[#5c4b2b] text-[#f4e4bc]' : 'bg-[#f4e4bc] text-[#5c4b2b] hover:bg-[#e8dec8]'}`}
                    >
                        <MessageSquare size={14} className="hidden md:block" />
                        <MessageSquare size={12} className="md:hidden" />
                        Review
                    </button>
                    <button
                        onClick={() => { setViewMode('report'); setReportPage(0); }}
                        className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded text-xs md:text-sm font-bold uppercase tracking-wider transition-all ${viewMode === 'report' ? 'bg-[#5c4b2b] text-[#f4e4bc]' : 'bg-[#f4e4bc] text-[#5c4b2b] hover:bg-[#e8dec8]'}`}
                    >
                        <FileText size={14} className="hidden md:block" />
                        <FileText size={12} className="md:hidden" />
                        Report
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 bg-gradient-to-r from-[#c4b48a] via-[#a89566] to-[#c4b48a] opacity-50 z-10 shadow-inner pointer-events-none hidden md:block"></div>

                    {viewMode === 'questions' && (
                        <>
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
                        </>
                    )}

                    {viewMode === 'review' && (
                        <div className="flex-1 p-4 md:p-12 flex flex-col bg-[#e8dec8] overflow-y-auto">
                            <h3 className="text-lg md:text-xl font-bold text-[#3d2e1a] mb-4 md:mb-6">
                                Review {candidateName}
                            </h3>

                            <div className="mb-4 md:mb-6">
                                <p className="text-xs md:text-sm text-[#5c4b2b] mb-2 md:mb-3 font-bold uppercase tracking-wider">Select Round:</p>
                                <div className="flex gap-2 md:gap-3 flex-wrap">
                                    {(['round1', 'round2', 'round3'] as RoundKey[]).map(round => (
                                        <button
                                            key={round}
                                            onClick={() => {
                                                setSelectedRound(round);
                                                const existing = getExistingReview(round);
                                                if (existing) {
                                                    setCommentText(existing.memberComment);
                                                    setIsEditing(false);
                                                } else {
                                                    setCommentText('');
                                                    setIsEditing(true);
                                                }
                                            }}
                                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded font-bold uppercase tracking-wider text-xs md:text-sm transition-all ${selectedRound === round ? 'bg-[#5c4b2b] text-[#f4e4bc]' : 'bg-[#f4e4bc] text-[#5c4b2b] hover:bg-[#d4c5a6]'}`}
                                        >
                                            Round {roundNumbers[round]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!selectedRound && (
                                <div className="flex-1 flex items-center justify-center">
                                    <p className="text-[#8c7b5b] italic text-sm md:text-lg text-center px-4">Please select the round you are reviewing them for.</p>
                                </div>
                            )}

                            {selectedRound && (
                                <div className="flex-1 flex flex-col">
                                    {getExistingReview(selectedRound) && !isEditing ? (
                                        <div className="bg-[#f4e4bc] p-6 rounded border-2 border-[#8c7b5b]/50">
                                            <p className="text-sm text-[#8c7b5b] mb-2 font-bold uppercase tracking-wider">
                                                You have already reviewed {candidateName} for Round {roundNumbers[selectedRound]}.
                                            </p>
                                            <div className="text-lg text-[#3d2e1a] mb-4 leading-relaxed" style={{ fontFamily: '"Delicious Handrawn", cursive' }}>
                                                {getExistingReview(selectedRound)?.memberComment}
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#5c4b2b] text-[#f4e4bc] rounded font-bold uppercase tracking-wider text-sm hover:bg-[#3d2e1a] transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={handleDeleteComment}
                                                    disabled={saving}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded font-bold uppercase tracking-wider text-sm hover:bg-red-900 transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder={`Write your review for ${candidateName} (Round ${roundNumbers[selectedRound]})...`}
                                                className="flex-1 min-h-[200px] bg-[#f4e4bc] border-2 border-[#8c7b5b]/50 rounded p-4 text-[#3d2e1a] text-lg resize-none focus:outline-none focus:border-[#5c4b2b] placeholder-[#8c7b5b]/50"
                                                style={{ fontFamily: '"Delicious Handrawn", cursive' }}
                                            />
                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={handleSaveComment}
                                                    disabled={!commentText.trim() || saving}
                                                    className="px-6 py-3 bg-[#5c4b2b] text-[#f4e4bc] rounded font-bold uppercase tracking-wider hover:bg-[#3d2e1a] transition-colors disabled:opacity-50"
                                                >
                                                    {saving ? 'Saving...' : (getExistingReview(selectedRound) ? 'Update Review' : 'Submit Review')}
                                                </button>
                                                {getExistingReview(selectedRound) && (
                                                    <button
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setCommentText(getExistingReview(selectedRound)?.memberComment || '');
                                                        }}
                                                        className="px-6 py-3 bg-[#f4e4bc] text-[#5c4b2b] rounded font-bold uppercase tracking-wider hover:bg-[#d4c5a6] transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'report' && (
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            <div className="flex-1 p-4 md:p-12 flex flex-col bg-[#fffbf0] relative min-h-0" style={{ backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
                                <div className="text-xs text-red-800/60 font-bold mb-4 uppercase flex justify-between tracking-wider font-mono">
                                    <span>Official Report Card</span>
                                    <span>Page {reportPage + 1} / 3</span>
                                </div>

                                <div className="border-b-2 border-red-800/80 mb-6 pb-2">
                                    <h3 className="text-xl md:text-3xl font-black text-red-900 uppercase tracking-widest" style={{ fontFamily: '"Special Elite", cursive' }}>
                                        {roundLabels[reportRounds[reportPage]]}
                                    </h3>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                                    {(() => {
                                        const roundKey = reportRounds[reportPage];
                                        const comments = dossier.memberComments?.[roundKey];
                                        if (!comments || Object.keys(comments).length === 0) {
                                            return (
                                                <div className="flex items-center justify-center p-8 border-2 border-dashed border-red-800/20 rounded">
                                                    <p className="text-red-800/40 italic font-mono uppercase">No reviews so far</p>
                                                </div>
                                            );
                                        }
                                        return Object.entries(comments).map(([reviewerId, comment]) => (
                                            <div key={reviewerId} className="mb-6 pb-4 border-b border-blue-900/10 last:border-b-0">
                                                <div className="flex items-baseline gap-2 mb-1">
                                                    <span className="text-xs font-mono text-red-800/60 uppercase">evaluator:</span>
                                                    <p className="text-base font-bold text-red-800 uppercase tracking-wider" style={{ fontFamily: '"Special Elite", cursive' }}>
                                                        Prof. {comment.memberName}
                                                    </p>
                                                </div>
                                                <div className="pl-4 border-l-2 border-blue-600/20">
                                                    <p className="text-lg md:text-xl text-blue-900 leading-relaxed" style={{ fontFamily: '"Delicious Handrawn", cursive', transform: 'rotate(-0.5deg)' }}>
                                                        {comment.memberComment}
                                                    </p>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>

                                <div className="mt-4 pt-4 border-t-2 border-red-800/80 flex justify-between items-center">
                                    <div className="text-[10px] text-red-800/40 font-mono uppercase tracking-widest hidden md:block">
                                        LC-AUDITION-REPORT-{new Date().getFullYear()}
                                    </div>
                                    <div className="flex gap-4">
                                        {reportPage > 0 && (
                                            <button
                                                onClick={() => setReportPage(p => p - 1)}
                                                className="flex items-center gap-2 text-red-800 hover:text-red-600 font-bold uppercase tracking-widest transition-colors group text-sm"
                                            >
                                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                                Prev
                                            </button>
                                        )}
                                        {reportPage < 2 && (
                                            <button
                                                onClick={() => setReportPage(p => p + 1)}
                                                className="flex items-center gap-2 text-red-800 hover:text-red-600 font-bold uppercase tracking-widest transition-colors group text-sm"
                                            >
                                                Next
                                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
