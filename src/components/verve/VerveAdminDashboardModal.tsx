import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Users, Users2, Shield, Search, Target, Mail, Phone, Calendar, UserCircle, Download, QrCode, Trophy, CheckCircle2 } from 'lucide-react';
import { EVENTS_DATA } from './Events';
import { useAuth } from '../../context';
import type { EventData } from './Events';

interface VerveRegistration {
    email: string;
    extractedYear: string;
    fullName: string;
    lastUpdated: string;
    phoneNumber: string;
    regNumber: string;
    rollNumber?: string;
    registeredEvents: string[];
    yearOfStudy: string;
}

interface TeamMember {
    name: string;
    regNumber: string;
    rollNumber?: string;
    phone: string;
}

interface TeamLeader {
    name: string;
    regNumber: string;
    rollNumber?: string;
    phone: string;
    email: string;
}

interface TeamEntry {
    teamName: string;
    eventId: string;
    registeredAt: string;
    onSpot?: boolean;
    leader: TeamLeader;
    members: TeamMember[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface TeamProgressEntry {
    teamName: string;
    normalizedTeamName: string;
    checkpoints: { id: string; completedAt: string }[];
}

function RegistrationDetailsView({ reg, onClose }: { reg: VerveRegistration, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-2xl bg-[#e08585] border-[6px] border-black shadow-[12px_12px_0_#fff] p-6 sm:p-10 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <button type="button" onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl hover:bg-white hover:text-black border-[3px] border-black transition-colors z-[120]"
                >
                    <X size={24} className="stroke-[3]" />
                </button>

                <div className="flex items-center gap-4 border-b-[4px] border-black pb-6 mb-6 relative z-10">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shrink-0">
                        <UserCircle className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-heading uppercase text-black font-black leading-none break-words pr-8">{reg.fullName}</h2>
                        <span className="inline-block px-3 py-1 bg-white border-[2px] border-black font-mono font-bold text-sm text-black mt-2">{reg.regNumber}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 font-mono relative z-10">
                    <div className="bg-white border-[3px] border-black p-4 flex flex-col justify-center shadow-[4px_4px_0_#000]">
                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold"><Mail className="w-4 h-4" /> Email</div>
                        <div className="font-bold text-black break-all">{reg.email}</div>
                    </div>
                    <div className="bg-white border-[3px] border-black p-4 flex flex-col justify-center shadow-[4px_4px_0_#000]">
                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold"><Phone className="w-4 h-4" /> Phone Number</div>
                        <div className="font-bold text-black">{reg.phoneNumber || 'N/A'}</div>
                    </div>
                    <div className="bg-white border-[3px] border-black p-4 flex flex-col justify-center shadow-[4px_4px_0_#000] sm:col-span-2">
                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold"><Calendar className="w-4 h-4" /> Year of Study</div>
                        <div className="font-bold text-black">{reg.yearOfStudy}</div>
                    </div>
                </div>

                <div className="bg-[#312e2e] p-6 border-[4px] border-black shadow-[6px_6px_0_#000] relative z-10">
                    <h3 className="font-heading uppercase text-white tracking-widest mb-4 border-b border-white/20 pb-2 flex items-center gap-2">
                        <Target className="w-5 h-5 text-verve-gold" /> Registered Events
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {reg.registeredEvents && reg.registeredEvents.length > 0 ? (
                            reg.registeredEvents.map(eventId => {
                                const eventRef = EVENTS_DATA.find(e => e.id === eventId);
                                return (
                                    <span
                                        key={eventId}
                                        className="px-4 py-2 font-heading tracking-widest text-sm uppercase text-black border-[3px] border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-default"
                                        style={{ backgroundColor: eventRef?.color || '#fff' }}
                                    >
                                        {eventRef?.title || eventId}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-gray-400 font-mono italic">No events registered</span>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function VerveAdminDashboardModal({ isOpen, onClose }: Props) {
    const [registrations, setRegistrations] = useState<VerveRegistration[]>([]);
    const [teamData, setTeamData] = useState<TeamEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeamLoading, setIsTeamLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReg, setSelectedReg] = useState<VerveRegistration | null>(null);
    const [showOnSpotForm, setShowOnSpotForm] = useState(false);
    const [onSpotSubmitting, setOnSpotSubmitting] = useState(false);
    
    // On-Spot Form State
    const [onSpotData, setOnSpotData] = useState<{
        teamName: string;
        leader: TeamLeader;
        members: TeamMember[];
    }>({
        teamName: '',
        leader: { name: '', regNumber: '', rollNumber: '', phone: '', email: '' },
        members: [{ name: '', regNumber: '', rollNumber: '', phone: '' }]
    });

    const { user } = useAuth();
    
    // Admin guard — same check used by QR Code button and Manual Entry tab
    const isCheckpointAdmin = !!(
        user?.userId?.toUpperCase()?.includes('25M80041') ||
        user?.email?.toUpperCase()?.includes('25M80041') ||
        user?.registrationNumber?.toUpperCase()?.includes('25M80041')
    );

    // Checkpoints State for 25M80041
    const [showQrModal, setShowQrModal] = useState(false);
    const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);
    
    // Fixed unique codes for each checkpoint — prevents URL guessing
    const checkpointCodes: Record<string, string> = {
        '1':  'vT3mK9xR',
        '2':  'pQ7nJ2wL',
        '3':  'zH5bY8cF',
        '4a': 'dN6sA1eG',
        '4b': 'kU4rP0mB',
        '5a': 'gX2tW7qZ',
        '5b': 'yC9fE5hD',
        '6':  'nR1kM3vT',
        '7':  'jS8bL6uY',
        '8':  'wF4pQ2xN',
        '9':  'hA7cJ9rK',
        '10': 'eZ5gD8wP',
    };
    const checkpointsList = Object.keys(checkpointCodes);

    // Passed Checkpoints State — one entry per team with their checkpoints embedded
    const [passedCheckpoints, setPassedCheckpoints] = useState<TeamProgressEntry[]>([]);
    const [isPassedLoading, setIsPassedLoading] = useState(false);

    // Sorted by most checkpoints cleared first (leaderboard order)
    const cpOrder = ['1','2','3','4a','4b','5a','5b','6','7','8','9','10'];
    const sortedTeamProgress = [...passedCheckpoints].sort((a, b) => b.checkpoints.length - a.checkpoints.length);

    // Manual Entry State (admin 25M80041 only)
    const [manualTeamName, setManualTeamName] = useState('');
    const [manualCheckpoint, setManualCheckpoint] = useState('');
    const [manualError, setManualError] = useState<string | null>(null);
    const [manualSuccess, setManualSuccess] = useState<string | null>(null);
    const [isManualSubmitting, setIsManualSubmitting] = useState(false);

    const handleManualEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualTeamName.trim() || !manualCheckpoint) return;
        setIsManualSubmitting(true);
        setManualError(null);
        setManualSuccess(null);

        const normalizedTeamName = manualTeamName.trim().toLowerCase().replace(/\s+/g, ' ');

        try {
            const { doc, setDoc, getDocs, getDoc, collection } = await import('firebase/firestore');

            // Step 1: Validate team name against registered teams
            const teamsSnapshot = await getDocs(collection(db, 'treasure_hunt_teams'));
            const matchedDoc = teamsSnapshot.docs.find(d => {
                const stored = (d.data().teamName as string ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
                return stored === normalizedTeamName;
            });

            if (!matchedDoc) {
                setManualError('Team not found! Please cross-check the team name spelling — it must match exactly what was registered.');
                setIsManualSubmitting(false);
                return;
            }

            // Use the original casing from the registered record
            const registeredTeamName = (matchedDoc.data().teamName as string).trim();
            const teamDocId = normalizedTeamName.replace(/[^a-z0-9]/g, '-');

            // Step 2: Check for duplicate — don't overwrite an existing checkpoint
            const cpDocRef = doc(db, 'passed_checkpoints', teamDocId, 'checkpoints', manualCheckpoint);
            const cpDocSnap = await getDoc(cpDocRef);

            if (cpDocSnap.exists()) {
                setManualError(`Checkpoint ${manualCheckpoint} is already recorded for "${registeredTeamName}". No changes made.`);
                setIsManualSubmitting(false);
                return;
            }

            // Step 3: Write team doc (merge) + new checkpoint subcollection doc
            await setDoc(doc(db, 'passed_checkpoints', teamDocId), {
                teamName: registeredTeamName,
                normalizedTeamName,
            }, { merge: true });

            await setDoc(cpDocRef, {
                checkpointId: manualCheckpoint,
                completedAt: new Date().toISOString(),
                manualEntry: true,
            });

            setManualSuccess(`✅ Checkpoint ${manualCheckpoint} recorded for "${registeredTeamName}"`);
            setManualTeamName('');
            setManualCheckpoint('');
        } catch (err) {
            console.error('Manual entry write failed:', err);
            setManualError('An error occurred. Please try again.');
        } finally {
            setIsManualSubmitting(false);
        }
    };

    const resetOnSpotForm = () => {
        setOnSpotData({
            teamName: '',
            leader: { name: '', regNumber: '', rollNumber: '', phone: '', email: '' },
            members: [{ name: '', regNumber: '', rollNumber: '', phone: '' }]
        });
        setShowOnSpotForm(false);
    };

    const handleOnSpotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOnSpotSubmitting(true);
        try {
            const { setDoc, doc } = await import('firebase/firestore');
            
            const eventDef = EVENTS_DATA.find(e => e.id === 'treasure-hunt');
            const minMembers = eventDef?.teamSize?.min || 2;
            const validMembers = onSpotData.members.filter(m => m.name.trim() !== '');
            const totalMembers = 1 + validMembers.length;
            
            if (totalMembers < minMembers) {
                alert(`Treasure Hunt requires at least ${minMembers} members.`);
                setOnSpotSubmitting(false);
                return;
            }

            const teamId = `onspot-${onSpotData.teamName.trim().toLowerCase().replace(/\\s+/g, '-')}-${Date.now()}`;
            const teamDocRef = doc(db, 'treasure_hunt_teams', teamId);
            
            await setDoc(teamDocRef, {
                teamName: onSpotData.teamName,
                eventId: 'treasure-hunt',
                registeredAt: new Date().toISOString(),
                onSpot: true,
                leader: onSpotData.leader,
                members: validMembers
            });
            
            alert('On-spot registration successful!');
            resetOnSpotForm();
            // refreshing team data
            setActiveTab('treasure-hunt'); 
            const querySnapshot = await getDocs(collection(db, 'treasure_hunt_teams'));
            const teams: TeamEntry[] = [];
            querySnapshot.forEach((doc) => teams.push(doc.data() as TeamEntry));
            teams.sort((a, b) => a.teamName.localeCompare(b.teamName));
            setTeamData(teams);
        } catch (error) {
            console.error("Error creating on-spot registration:", error);
            alert("Failed to save on-spot registration.");
        } finally {
            setOnSpotSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        const fetchRegistrations = async () => {
            setIsLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, 'verve_registrations'));
                const regs: VerveRegistration[] = [];
                querySnapshot.forEach((doc) => {
                    regs.push(doc.data() as VerveRegistration);
                });
                // Sort by name by default
                regs.sort((a, b) => a.fullName.localeCompare(b.fullName));
                setRegistrations(regs);
            } catch (error) {
                console.error("Error fetching registrations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrations();
    }, [isOpen]);

    // Always fetch team data for the active tab (handles legacy team data for converted events)
    useEffect(() => {
        if (activeTab === 'all') {
            setTeamData([]);
            return;
        }
        const fetchTeamData = async () => {
            setIsTeamLoading(true);
            try {
                const collectionName = `${activeTab.replace(/-/g, '_')}_teams`;
                console.log(`[AdminDashboard] Fetching teams from collection: "${collectionName}"`);
                const querySnapshot = await getDocs(collection(db, collectionName));
                console.log(`[AdminDashboard] Found ${querySnapshot.size} team documents in "${collectionName}"`);
                const teams: TeamEntry[] = [];
                querySnapshot.forEach((doc) => {
                    console.log(`[AdminDashboard] Team doc id: ${doc.id}`, doc.data());
                    teams.push(doc.data() as TeamEntry);
                });
                teams.sort((a, b) => a.teamName.localeCompare(b.teamName));
                setTeamData(teams);
            } catch (error) {
                console.error(`[AdminDashboard] Error fetching teams for tab "${activeTab}":`, error);
                setTeamData([]);
            } finally {
                setIsTeamLoading(false);
            }
        };
        fetchTeamData();
    }, [activeTab]);

    // Fetch passed checkpoints ONLY when that tab is active; clear state otherwise
    useEffect(() => {
        if (activeTab !== 'passed-checkpoints') {
            // Clear stale data so it never bleeds into other tab views
            setPassedCheckpoints([]);
            return;
        }
        // Also reset manual entry state when leaving that tab
        setManualTeamName('');
        setManualCheckpoint('');
        setManualError(null);
        setManualSuccess(null);
        const fetchPassed = async () => {
            setIsPassedLoading(true);
            try {
                // Get all team documents
                const teamsSnapshot = await getDocs(collection(db, 'passed_checkpoints'));

                // For each team, fetch their checkpoints subcollection in parallel
                const teamEntries = await Promise.all(
                    teamsSnapshot.docs.map(async (teamDoc) => {
                        const data = teamDoc.data();
                        const cpSnapshot = await getDocs(collection(db, 'passed_checkpoints', teamDoc.id, 'checkpoints'));
                        const checkpoints = cpSnapshot.docs.map(cpDoc => ({
                            id: cpDoc.data().checkpointId as string,
                            completedAt: cpDoc.data().completedAt as string,
                        }));
                        // sort checkpoints by canonical order
                        checkpoints.sort((a, b) => cpOrder.indexOf(a.id) - cpOrder.indexOf(b.id));
                        return {
                            teamName: data.teamName as string,
                            normalizedTeamName: data.normalizedTeamName as string,
                            checkpoints,
                        } as TeamProgressEntry;
                    })
                );
                setPassedCheckpoints(teamEntries);
            } catch (err) {
                console.error('Error fetching passed checkpoints:', err);
                setPassedCheckpoints([]);
            } finally {
                setIsPassedLoading(false);
            }
        };
        fetchPassed();
    }, [activeTab]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // @ts-ignore
            if (window.lenis) window.lenis.stop();
        } else {
            document.body.style.overflow = 'unset';
            // @ts-ignore
            if (window.lenis) window.lenis.start();
        }
        return () => {
            document.body.style.overflow = 'unset';
            // @ts-ignore
            if (window.lenis) window.lenis.start();
        };
    }, [isOpen]);


    if (!isOpen) return null;

    const filteredRegistrations = registrations.filter(reg => {
        const matchesTab = activeTab === 'all' || (reg.registeredEvents && reg.registeredEvents.includes(activeTab));
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            reg.fullName.toLowerCase().includes(searchLower) ||
            reg.regNumber.toLowerCase().includes(searchLower) ||
            reg.email.toLowerCase().includes(searchLower) ||
            (reg.phoneNumber && reg.phoneNumber.includes(searchLower));

        return matchesTab && matchesSearch;
    });

    const handleExportCSV = async () => {
        if (activeTab === 'passed-checkpoints') {
            const headers = ['Team Name', 'Total Checkpoints Passed', 'Checkpoints (in order)', 'Completion Times'];
            const rows = sortedTeamProgress.map((team) => {
                const cpIds = team.checkpoints.map(c => `CP ${c.id}`).join('; ');
                const cpTimes = team.checkpoints.map(c => new Date(c.completedAt).toLocaleString()).join('; ');
                return [
                    `"${team.teamName}"`,
                    team.checkpoints.length,
                    `"${cpIds}"`,
                    `"${cpTimes}"`
                ].join(',');
            });
            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.setAttribute('href', URL.createObjectURL(blob));
            link.setAttribute('download', `verve_passed_checkpoints_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const currentEventDef = EVENTS_DATA.find(e => e.id === activeTab);
        
        if (currentEventDef?.teamSize) {
            try {
                const collectionName = `${activeTab.replace(/-/g, '_')}_teams`;
                const querySnapshot = await getDocs(collection(db, collectionName));
                
                const maxMembers = currentEventDef.teamSize.max - 1; // excluding leader
                
                const baseHeaders = [
                    "Team Name", "Registered At",
                    "Leader Name", "Leader Reg No", "Leader Roll No", "Leader Phone", "Leader Email"
                ];
                
                const memberHeaders: string[] = [];
                for (let i = 1; i <= maxMembers; i++) {
                    memberHeaders.push(`Member ${i} Name`, `Member ${i} Reg No`, `Member ${i} Roll No`, `Member ${i} Phone`);
                }
                
                const headers = [...baseHeaders, ...memberHeaders];

                const rows: string[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const mems = data.members || [];
                    
                    const baseRow = [
                        `"${data.teamName || ''}"`,
                        data.registeredAt ? `"${new Date(data.registeredAt).toLocaleString()}"` : 'N/A',
                        `"${data.leader?.name || ''}"`,
                        data.leader?.regNumber || '',
                        data.leader?.rollNumber || '',
                        data.leader?.phone || '',
                        data.leader?.email || ''
                    ];
                    
                    const memberRowData: string[] = [];
                    for (let i = 0; i < maxMembers; i++) {
                        memberRowData.push(
                            `"${mems[i]?.name || ''}"`,
                            mems[i]?.regNumber || '',
                            mems[i]?.rollNumber || '',
                            mems[i]?.phone || ''
                        );
                    }
                    
                    rows.push([...baseRow, ...memberRowData].join(','));
                });

                const csvContent = [headers.join(','), ...rows].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `verve_${collectionName}_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error(`Error exporting teams for ${activeTab}:`, error);
            }
            return;
        }

        const headers = ["Registration Number", "Full Name", "Email", "Phone Number", "Year of Study", "Extracted Year", "Registered Events", "Last Updated"];
        const rows = filteredRegistrations.map(reg => {
            const events = reg.registeredEvents
                ? reg.registeredEvents.map(eId => {
                    const eventDef = EVENTS_DATA.find(e => e.id === eId);
                    return eventDef ? eventDef.title : eId;
                }).join('; ')
                : 'None';

            return [
                reg.regNumber,
                `"${reg.fullName}"`,
                reg.email,
                reg.phoneNumber || 'N/A',
                reg.yearOfStudy,
                reg.extractedYear,
                `"${events}"`,
                reg.lastUpdated ? `"${new Date(reg.lastUpdated).toLocaleString()}"` : 'N/A'
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `verve_registrations_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    data-lenis-prevent
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed inset-0 z-[100] flex flex-col bg-verve-dark overflow-hidden verve-root"
                >
                    {/* Brutalist Noise Overlay */}
                    <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* Header */}
                    <div className="bg-[#e08585] px-6 py-4 md:px-8 md:py-6 border-b-[6px] border-black flex flex-col md:flex-row md:justify-between md:items-center shrink-0 z-10 gap-4">
                        <div>
                            <h2 className="text-4xl md:text-6xl font-heading uppercase text-black drop-shadow-[2px_2px_0_#fff] tracking-wide m-0 leading-none">
                                Admin Dashboard
                            </h2>
                            <p className="font-mono text-black/80 font-bold uppercase tracking-widest text-sm mt-2 flex items-center gap-4">
                                <span>Total Participants: {filteredRegistrations.length} {searchQuery && ' (Filtered)'}</span>
                                <span className="opacity-40 text-xs">(Admin: {user?.userId || user?.email || 'Unknown'})</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3 self-end md:self-auto shrink-0 z-[60]">
                            {isCheckpointAdmin && (
                                <button type="button" onClick={() => setShowQrModal(true)}
                                    className="h-12 px-4 bg-verve-pink text-black flex items-center justify-center gap-2 font-heading tracking-widest text-sm uppercase hover:bg-white hover:text-black border-[3px] border-black shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#fff] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                                >
                                    <QrCode size={20} className="stroke-[3]" />
                                    <span className="hidden sm:inline">Checkpoints QR Code</span>
                                    <span className="sm:hidden">QR</span>
                                </button>
                            )}
                            <button type="button" onClick={handleExportCSV}
                                className="h-12 px-4 bg-black text-white flex items-center justify-center gap-2 font-heading tracking-widest text-sm uppercase hover:bg-verve-gold hover:text-black border-[3px] border-black shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#fff] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                            >
                                <Download size={20} className="stroke-[3]" />
                                <span className="hidden sm:inline">Export CSV</span>
                            </button>
                            {activeTab === 'treasure-hunt' && isCheckpointAdmin && (
                                <button type="button" onClick={() => setShowOnSpotForm(true)}
                                    className="h-12 px-4 bg-verve-gold text-black flex items-center justify-center gap-2 font-heading tracking-widest text-sm uppercase hover:bg-white hover:text-black border-[3px] border-black shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#fff] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                                >
                                    <span className="hidden sm:inline">+ On-Spot Reg</span>
                                    <span className="sm:hidden">+ On-Spot</span>
                                </button>
                            )}
                            <button type="button" onClick={onClose}
                                className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl hover:bg-white hover:text-black border-[3px] border-black shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0_#fff] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
                            >
                                <X size={28} className="stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    {/* Controls / Tabs */}
                    <div className="px-6 py-4 md:px-8 bg-[#312e2e] border-b-[4px] border-black shrink-0 space-y-4 z-10 shadow-xl">

                        {/* Search */}
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, reg no..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-[3px] border-black rounded-none focus:ring-0 focus:border-verve-gold focus:bg-[#201f1f] transition-all bg-[#423f3f] text-white shadow-[4px_4px_0_#000] font-mono placeholder-gray-400"
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`shrink-0 px-6 py-2 font-heading tracking-widest uppercase border-[3px] border-black transition-all ${activeTab === 'all'
                                    ? 'bg-verve-gold text-black shadow-[4px_4px_0_#000]'
                                    : 'bg-[#201f1f] text-white hover:bg-verve-pink hover:text-black'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4" /> All ({registrations.length})
                                </span>
                            </button>

                            {EVENTS_DATA.map((event: EventData) => {
                                const eventCount = registrations.filter(r => r.registeredEvents && r.registeredEvents.includes(event.id)).length;
                                const isActive = activeTab === event.id;
                    const isTeamEvent = !!event.teamSize;

                                return (
                                    <button
                                        key={event.id}
                                        onClick={() => setActiveTab(event.id)}
                                        className={`shrink-0 px-6 py-2 font-heading tracking-widest uppercase border-[3px] border-black transition-all flex items-center gap-2`}
                                        style={{
                                            backgroundColor: isActive ? event.color : '#201f1f',
                                            color: isActive ? '#000' : '#fff',
                                            boxShadow: isActive ? '4px 4px 0 #000' : 'none',
                                        }}
                                    >
                                        {isTeamEvent ? <Users2 className="w-4 h-4" /> : <Target className="w-4 h-4" />} {event.title} ({eventCount})
                                    </button>
                                );
                            })}

                            {/* Passed Checkpoints Tab */}
                            <button
                                onClick={() => setActiveTab('passed-checkpoints')}
                                className={`shrink-0 px-6 py-2 font-heading tracking-widest uppercase border-[3px] border-black transition-all flex items-center gap-2 ${
                                    activeTab === 'passed-checkpoints'
                                        ? 'text-black shadow-[4px_4px_0_#000]'
                                        : 'bg-[#201f1f] text-white hover:text-black'
                                }`}
                                style={{
                                    backgroundColor: activeTab === 'passed-checkpoints' ? '#4ade80' : undefined,
                                }}
                            >
                                <Trophy className="w-4 h-4" /> Passed Checkpoints ({sortedTeamProgress.length})
                            </button>

                            {/* Manual Entry Tab — admin 25M80041 only */}
                            {isCheckpointAdmin && (
                                <button
                                    onClick={() => setActiveTab('manual-entry')}
                                    className={`shrink-0 px-6 py-2 font-heading tracking-widest uppercase border-[3px] border-black transition-all flex items-center gap-2 ${
                                        activeTab === 'manual-entry'
                                            ? 'text-black shadow-[4px_4px_0_#000]'
                                            : 'bg-[#201f1f] text-white hover:text-black'
                                    }`}
                                    style={{
                                        backgroundColor: activeTab === 'manual-entry' ? '#fb923c' : undefined,
                                    }}
                                >
                                    ✏️ Manual Entry
                                </button>
                            )}
                        </div>
                    </div>


                    {/* Data Grid */}
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10 bg-verve-dark">
                        {(isLoading || isTeamLoading || isPassedLoading) ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-6 h-full">
                                <div className="w-16 h-16 border-[6px] border-black border-t-verve-gold animate-spin" />
                                <span className="text-2xl font-heading uppercase tracking-widest text-[#e08585] drop-shadow-[2px_2px_0_#000]">Gathering Intel...</span>
                            </div>
                        ) : activeTab === 'manual-entry' ? (
                            // --- MANUAL CHECKPOINT ENTRY VIEW ---
                            <div className="flex items-start justify-center pt-6">
                                <div className="w-full max-w-lg bg-[#2a2828] border-[4px] border-black shadow-[8px_8px_0_#fb923c] p-8">
                                    <div className="flex items-center gap-3 mb-6 border-b-2 border-dashed border-gray-600 pb-4">
                                        <span className="text-3xl">✏️</span>
                                        <div>
                                            <h2 className="text-2xl font-heading text-white uppercase tracking-widest">Manual Checkpoint Entry</h2>
                                            <p className="text-gray-400 font-mono text-xs mt-1">For cases where QR scan fails. Validates team name and prevents duplicate entries.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleManualEntry} className="space-y-5">
                                        {/* Team Name */}
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-400 mb-2 tracking-widest">Team Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={manualTeamName}
                                                onChange={e => { setManualTeamName(e.target.value); setManualError(null); setManualSuccess(null); }}
                                                placeholder="Enter registered team name..."
                                                className={`w-full bg-[#1e1c1c] border-[3px] p-3 text-white placeholder-gray-600 focus:outline-none transition-colors font-mono ${
                                                    manualError ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-orange-400'
                                                }`}
                                            />
                                        </div>

                                        {/* Checkpoint Dropdown */}
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-400 mb-2 tracking-widest">Select Checkpoint</label>
                                            <select
                                                required
                                                value={manualCheckpoint}
                                                onChange={e => { setManualCheckpoint(e.target.value); setManualError(null); setManualSuccess(null); }}
                                                className="w-full bg-[#1e1c1c] border-[3px] border-gray-600 p-3 text-white focus:border-orange-400 focus:outline-none transition-colors font-mono appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>-- Select checkpoint --</option>
                                                {cpOrder.map(cp => (
                                                    <option key={cp} value={cp}>Checkpoint {cp}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Error */}
                                        {manualError && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-red-950/60 border-[2px] border-red-500 p-3 flex gap-2"
                                            >
                                                <span className="shrink-0">⚠️</span>
                                                <p className="text-red-300 text-xs font-mono leading-relaxed">{manualError}</p>
                                            </motion.div>
                                        )}

                                        {/* Success */}
                                        {manualSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-green-950/60 border-[2px] border-green-400 p-3 flex gap-2"
                                            >
                                                <p className="text-green-300 text-xs font-mono leading-relaxed font-bold">{manualSuccess}</p>
                                            </motion.div>
                                        )}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={isManualSubmitting}
                                            className="w-full bg-orange-400 text-black font-heading font-black text-xl uppercase tracking-widest py-3 border-[3px] border-black shadow-[4px_4px_0_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:translate-x-0 disabled:shadow-none"
                                        >
                                            {isManualSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-[2px] border-black border-t-transparent rounded-full animate-spin" />
                                                    Recording...
                                                </span>
                                            ) : 'Record Checkpoint'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : activeTab === 'passed-checkpoints' ? (
                            // --- PASSED CHECKPOINTS VIEW ---
                            sortedTeamProgress.length === 0 ? (
                                <div className="text-center p-20 border-[4px] border-dashed border-gray-600 bg-black/20 h-full flex flex-col items-center justify-center gap-4">
                                    <Trophy className="w-16 h-16 text-gray-600" />
                                    <p className="text-2xl font-heading text-gray-400 uppercase tracking-widest">No Checkpoints Cleared Yet</p>
                                    <p className="text-gray-500 font-mono text-sm">Teams will appear here after scanning a QR code and submitting their name.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                    {sortedTeamProgress.map((team, index) => (
                                        <div
                                            key={team.normalizedTeamName}
                                            className="bg-[#2a2828] border-[4px] border-black p-5 shadow-[6px_6px_0_#4ade80] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0_#4ade80] transition-all flex flex-col gap-4 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-[4px] bg-green-400" />
                                            <div className="flex justify-between items-start border-b-2 border-dashed border-gray-600 pb-3 relative z-10">
                                                <div>
                                                    <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest">Team</p>
                                                    <h3 className="text-xl md:text-2xl font-heading text-white uppercase tracking-wider break-words">{team.teamName}</h3>
                                                </div>
                                                <div className="bg-green-400 text-black border-2 border-black px-2 py-1 font-mono font-bold text-sm shrink-0">
                                                    {team.checkpoints.length}/{checkpointsList.length}
                                                </div>
                                            </div>

                                            {/* Checkpoint Badges */}
                                            <div className="relative z-10">
                                                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Cleared Checkpoints
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {team.checkpoints.map((cp: { id: string; completedAt: string }) => (
                                                        <div key={cp.id} className="group relative">
                                                            <span className="bg-black text-green-400 border-2 border-green-400 px-3 py-1 font-heading font-black text-sm uppercase tracking-widest cursor-default">CP {cp.id}</span>
                                                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[10px] font-mono px-2 py-1 border border-green-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                                {new Date(cp.completedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="relative z-10">
                                                <div className="w-full h-2 bg-gray-700 border border-gray-600">
                                                    <div
                                                        className="h-full bg-green-400 transition-all"
                                                        style={{ width: `${(team.checkpoints.length / checkpointsList.length) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] font-mono text-gray-500 mt-1">{Math.round((team.checkpoints.length / checkpointsList.length) * 100)}% complete</p>
                                            </div>

                                            <div className="absolute bottom-[-10px] right-2 font-mono font-black text-7xl text-white/5 pointer-events-none select-none mix-blend-overlay">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : EVENTS_DATA.find(e => e.id === activeTab)?.teamSize ? (
                            // --- CURRENT TEAM EVENT VIEW ---
                            teamData.length === 0 ? (
                                <div className="text-center p-20 border-[4px] border-dashed border-gray-600 bg-black/20 h-full flex items-center justify-center">
                                    <p className="text-2xl font-heading text-gray-400 uppercase tracking-widest">No Teams Registered Yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                    {teamData.map((team, index) => {
                                        return (
                                            <div
                                                key={`${team.teamName}-${index}`}
                                                className="bg-[#2a2828] border-[4px] border-black p-5 shadow-[6px_6px_0_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0_#e08585] transition-all flex flex-col gap-4 relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-verve-gold/5 pointer-events-none" />

                                                {/* Team Header */}
                                                <div className="flex justify-between items-start border-b-2 border-dashed border-gray-600 pb-3 relative z-10">
                                                    <div>
                                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                                                            Team {team.onSpot && <span className="ml-2 inline-block px-2 py-0.5 bg-verve-pink text-black font-bold">ON-SPOT REG.</span>}
                                                        </p>
                                                        <h3 className="text-xl md:text-2xl font-heading text-verve-gold uppercase tracking-wider break-words">{team.teamName}</h3>
                                                    </div>
                                                    <div className="bg-black text-white border-2 border-white px-2 py-1 font-mono font-bold text-[10px] shrink-0 rotate-2">
                                                        {(team.members?.length || 0) + 1} MEMBERS
                                                    </div>
                                                </div>

                                                {/* Leader */}
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Shield className="w-4 h-4 text-verve-gold" />
                                                        <span className="text-[10px] font-mono text-verve-gold uppercase font-bold tracking-widest">Leader</span>
                                                    </div>
                                                    <div className="bg-[#312e2e] border-[2px] border-verve-gold/40 p-3 font-mono text-xs space-y-1">
                                                        <p className="text-white font-bold text-sm">{team.leader?.name}</p>
                                                        <p className="text-gray-400">Reg: <span className="text-white uppercase">{team.leader?.regNumber}</span></p>
                                                        {team.leader?.rollNumber && <p className="text-gray-400">Roll: <span className="text-white uppercase">{team.leader.rollNumber}</span></p>}
                                                        <p className="text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {team.leader?.phone || 'N/A'}</p>
                                                        <p className="text-gray-400 flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {team.leader?.email}</p>
                                                    </div>
                                                </div>

                                                {/* Members */}
                                                {team.members && team.members.length > 0 && (
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Users className="w-4 h-4 text-verve-pink" />
                                                            <span className="text-[10px] font-mono text-verve-pink uppercase font-bold tracking-widest">Members</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {team.members.map((member, mIdx) => (
                                                                <div key={mIdx} className="bg-[#1e1c1c] border-[2px] border-gray-700 p-3 font-mono text-xs space-y-1">
                                                                    <p className="text-white font-bold">{member.name || <span className="text-gray-500 italic">Unnamed</span>}</p>
                                                                    <p className="text-gray-400">Reg: <span className="text-white uppercase">{member.regNumber}</span></p>
                                                                    {member.rollNumber && <p className="text-gray-400">Roll: <span className="text-white uppercase">{member.rollNumber}</span></p>}
                                                                    <p className="text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {member.phone || 'N/A'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Timestamp */}
                                                {team.registeredAt && (
                                                    <p className="text-gray-600 font-mono text-[10px] mt-auto relative z-10">
                                                        Registered: {new Date(team.registeredAt).toLocaleString()}
                                                    </p>
                                                )}

                                                <div className="absolute bottom-[-10px] right-2 font-mono font-black text-7xl text-white/5 pointer-events-none select-none mix-blend-overlay">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            // --- SOLO (or converted) EVENT VIEW ---
                            <div className="flex flex-col gap-8 pb-20">
                                {/* Legacy Team Registrations Section (for events converted from team → solo) */}
                                {teamData.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4 border-b-[3px] border-dashed border-yellow-600/40 pb-3">
                                            <Users2 className="w-5 h-5 text-verve-gold" />
                                            <h3 className="font-heading text-verve-gold uppercase tracking-widest text-lg">Legacy Team Registrations</h3>
                                            <span className="px-2 py-0.5 bg-verve-gold/20 text-verve-gold font-mono text-xs border border-verve-gold/40">{teamData.length} teams</span>
                                            <span className="text-gray-500 font-mono text-[10px] ml-auto">From when this event was team-based</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {teamData.map((team, index) => (
                                                <div
                                                    key={`${team.teamName}-${index}`}
                                                    className="bg-[#2a2828] border-[4px] border-verve-gold/30 p-5 shadow-[6px_6px_0_#fcc20155] flex flex-col gap-4 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-full h-[3px] bg-verve-gold/50" />
                                                    <div className="flex justify-between items-start border-b-2 border-dashed border-gray-600 pb-3 relative z-10">
                                                        <div>
                                                            <p className="text-[10px] font-mono text-verve-gold/60 uppercase tracking-widest">Legacy Team</p>
                                                            <h3 className="text-xl font-heading text-verve-gold uppercase tracking-wider break-words">{team.teamName}</h3>
                                                        </div>
                                                        <div className="bg-verve-gold/20 text-verve-gold border border-verve-gold/40 px-2 py-1 font-mono font-bold text-[10px] shrink-0">
                                                            {(team.members?.length || 0) + 1} MEMBERS
                                                        </div>
                                                    </div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Shield className="w-4 h-4 text-verve-gold" />
                                                            <span className="text-[10px] font-mono text-verve-gold uppercase font-bold tracking-widest">Leader</span>
                                                        </div>
                                                        <div className="bg-[#312e2e] border-[2px] border-verve-gold/30 p-3 font-mono text-xs space-y-1">
                                                            <p className="text-white font-bold text-sm">{team.leader?.name}</p>
                                                            <p className="text-gray-400">Reg: <span className="text-white uppercase">{team.leader?.regNumber}</span></p>
                                                            {team.leader?.rollNumber && <p className="text-gray-400">Roll: <span className="text-white uppercase">{team.leader.rollNumber}</span></p>}
                                                            <p className="text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {team.leader?.phone || 'N/A'}</p>
                                                            <p className="text-gray-400 flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {team.leader?.email}</p>
                                                        </div>
                                                    </div>
                                                    {team.members && team.members.length > 0 && (
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Users className="w-4 h-4 text-verve-pink" />
                                                                <span className="text-[10px] font-mono text-verve-pink uppercase font-bold tracking-widest">Members</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {team.members.map((member, mIdx) => (
                                                                    <div key={mIdx} className="bg-[#1e1c1c] border-[2px] border-gray-700 p-3 font-mono text-xs space-y-1">
                                                                        <p className="text-white font-bold">{member.name || <span className="text-gray-500 italic">Unnamed</span>}</p>
                                                                        <p className="text-gray-400">Reg: <span className="text-white uppercase">{member.regNumber}</span></p>
                                                                        {member.rollNumber && <p className="text-gray-400">Roll: <span className="text-white uppercase">{member.rollNumber}</span></p>}
                                                                        <p className="text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> {member.phone || 'N/A'}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {team.registeredAt && (
                                                        <p className="text-gray-600 font-mono text-[10px] mt-auto relative z-10">
                                                            Registered: {new Date(team.registeredAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Individual Registrations */}
                                {filteredRegistrations.length > 0 && (
                                    <div>
                                        {teamData.length > 0 && (
                                            <div className="flex items-center gap-3 mb-4 border-b-[3px] border-dashed border-gray-600 pb-3">
                                                <UserCircle className="w-5 h-5 text-white" />
                                                <h3 className="font-heading text-white uppercase tracking-widest text-lg">Individual Registrations</h3>
                                                <span className="px-2 py-0.5 bg-white/10 text-white font-mono text-xs border border-white/20">{filteredRegistrations.length}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredRegistrations.map((reg, index) => (
                                    <div
                                        key={reg.regNumber}
                                        onClick={() => setSelectedReg(reg)}
                                        className="bg-[#2a2828] border-[4px] border-black p-5 shadow-[6px_6px_0_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0_#e08585] transition-all flex flex-col h-full group cursor-pointer relative overflow-hidden"
                                    >
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-verve-gold/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-4 border-b-2 border-dashed border-gray-600 pb-4 relative z-10">
                                            <div>
                                                <h3 className="text-xl font-heading text-white uppercase tracking-wider group-hover:text-verve-gold transition-colors break-words line-clamp-2">{reg.fullName}</h3>
                                                <p className="text-xs font-mono text-gray-400 uppercase mt-1">{reg.regNumber}</p>
                                            </div>
                                            <div className="bg-black text-white border-2 border-white px-2 py-1 font-mono font-bold text-[10px] shrink-0 transform rotate-2">
                                                {reg.yearOfStudy}
                                            </div>
                                        </div>

                                        {/* Basic Info */}
                                        <div className="font-mono text-xs text-gray-300 space-y-1 mb-6 relative z-10">
                                            <div className="flex items-center gap-2 truncate"><Mail className="w-3 h-3 text-verve-pink" /> <span className="truncate">{reg.email}</span></div>
                                            <div className="flex items-center gap-2 truncate"><Phone className="w-3 h-3 text-verve-pink" /> <span>{reg.phoneNumber || 'N/A'}</span></div>
                                        </div>

                                        {/* Events Pill Tags */}
                                        <div className="mt-auto relative z-10">
                                            <span className="text-gray-500 uppercase text-[10px] font-bold font-mono block mb-2 tracking-widest">Registered Events ({reg.registeredEvents?.length || 0})</span>
                                            <div className="flex flex-wrap gap-2">
                                                {reg.registeredEvents && reg.registeredEvents.length > 0 ? (
                                                    reg.registeredEvents.map(eventId => {
                                                        const eventRef = EVENTS_DATA.find(e => e.id === eventId);
                                                        return (
                                                            <span
                                                                key={eventId}
                                                                className="px-2 py-1 text-[10px] font-mono font-bold uppercase text-black border-2 border-black"
                                                                style={{ backgroundColor: eventRef?.color || '#fff' }}
                                                            >
                                                                {eventRef?.title || eventId}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-gray-600 font-mono text-xs italic">None</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Index Decorative */}
                                        <div className="absolute bottom-[-10px] right-2 font-mono font-black text-7xl text-white/5 pointer-events-none select-none mix-blend-overlay">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                    </div>
                                 ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {selectedReg && (
                            <RegistrationDetailsView
                                reg={selectedReg}
                                onClose={() => setSelectedReg(null)}
                            />
                        )}
                        {showOnSpotForm && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-3xl bg-verve-dark border-[4px] border-white p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                                >
                                    <button onClick={resetOnSpotForm} className="absolute top-4 right-4 bg-white text-black p-2 border-[2px] border-black hover:bg-verve-pink transition-colors z-50">
                                        <X size={20} />
                                    </button>
                                    
                                    <h2 className="text-3xl font-heading text-verve-gold uppercase mb-6 drop-shadow-[2px_2px_0_#fff]">Add On-Spot Registration</h2>
                                    <form onSubmit={handleOnSpotSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="font-heading tracking-widest text-[#fff] uppercase border-b border-gray-600 pb-2">Team Details</h3>
                                            <div>
                                                <label className="text-xs uppercase font-mono text-gray-400 block mb-1">Team Name</label>
                                                <input type="text" required value={onSpotData.teamName} onChange={e => setOnSpotData({...onSpotData, teamName: e.target.value})} className="w-full bg-[#312e2e] border-2 border-gray-600 p-2 text-white font-mono focus:border-verve-gold outline-none" placeholder="Enter Team Name" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-heading tracking-widest text-verve-gold uppercase border-b border-verve-gold/40 pb-2">Leader Info</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs uppercase font-mono text-gray-400 block mb-1">Full Name</label>
                                                    <input type="text" required value={onSpotData.leader.name} onChange={e => setOnSpotData({...onSpotData, leader: {...onSpotData.leader, name: e.target.value}})} className="w-full bg-[#312e2e] border-2 border-gray-600 p-2 text-white font-mono" />
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-mono text-gray-400 block mb-1">Reg No.</label>
                                                    <input type="text" required value={onSpotData.leader.regNumber} onChange={e => setOnSpotData({...onSpotData, leader: {...onSpotData.leader, regNumber: e.target.value}})} className="w-full bg-[#312e2e] border-2 border-gray-600 p-2 text-white font-mono uppercase" />
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-mono text-gray-400 block mb-1">Phone</label>
                                                    <input type="text" required value={onSpotData.leader.phone} onChange={e => setOnSpotData({...onSpotData, leader: {...onSpotData.leader, phone: e.target.value}})} className="w-full bg-[#312e2e] border-2 border-gray-600 p-2 text-white font-mono" />
                                                </div>
                                                <div>
                                                    <label className="text-xs uppercase font-mono text-gray-400 block mb-1">Email</label>
                                                    <input type="email" required value={onSpotData.leader.email} onChange={e => setOnSpotData({...onSpotData, leader: {...onSpotData.leader, email: e.target.value}})} className="w-full bg-[#312e2e] border-2 border-gray-600 p-2 text-white font-mono" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-heading tracking-widest text-verve-pink uppercase border-b border-verve-pink/40 pb-2 flex justify-between items-center">
                                                Members ({onSpotData.members.length}/3)
                                                {onSpotData.members.length < 3 && (
                                                    <button type="button" onClick={() => setOnSpotData({...onSpotData, members: [...onSpotData.members, { name: '', regNumber: '', rollNumber: '', phone: '' }]})} className="text-xs border-[2px] border-verve-pink px-2 py-1 text-verve-pink hover:bg-verve-pink hover:text-black">
                                                        + ADD MEMBER
                                                    </button>
                                                )}
                                            </h3>
                                            
                                            {onSpotData.members.map((member, idx) => (
                                                <div key={idx} className="bg-[#1e1c1c] p-4 border-2 border-gray-700 relative">
                                                    <button type="button" onClick={() => {
                                                        const newMembers = [...onSpotData.members];
                                                        newMembers.splice(idx, 1);
                                                        setOnSpotData({...onSpotData, members: newMembers});
                                                    }} className="absolute top-2 right-2 text-red-500 hover:bg-red-500 hover:text-white p-1">
                                                        <X size={16} />
                                                    </button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Name</label>
                                                            <input type="text" required value={member.name} onChange={e => {
                                                                const nm = [...onSpotData.members]; nm[idx].name = e.target.value; setOnSpotData({...onSpotData, members: nm});
                                                            }} className="w-full bg-[#312e2e] border border-gray-600 p-1.5 text-white font-mono text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Reg No.</label>
                                                            <input type="text" required value={member.regNumber} onChange={e => {
                                                                const nm = [...onSpotData.members]; nm[idx].regNumber = e.target.value; setOnSpotData({...onSpotData, members: nm});
                                                            }} className="w-full bg-[#312e2e] border border-gray-600 p-1.5 text-white font-mono text-sm uppercase" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Phone</label>
                                                            <input type="text" required value={member.phone} onChange={e => {
                                                                const nm = [...onSpotData.members]; nm[idx].phone = e.target.value; setOnSpotData({...onSpotData, members: nm});
                                                            }} className="w-full bg-[#312e2e] border border-gray-600 p-1.5 text-white font-mono text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button type="submit" disabled={onSpotSubmitting} className="w-full bg-verve-gold text-black font-heading tracking-widest uppercase py-4 border-[4px] border-black shadow-[6px_6px_0_#fff] hover:bg-white transition-all text-xl disabled:opacity-50 mt-6">
                                            {onSpotSubmitting ? 'Saving...' : 'Submit On-Spot Registration'}
                                        </button>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                        {showQrModal && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                                    className="relative w-full max-w-4xl bg-[#312e2e] border-[4px] border-black p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[12px_12px_0_#fff]"
                                >
                                    <button onClick={() => { setShowQrModal(false); setSelectedCheckpoint(null); }} className="absolute top-4 right-4 bg-white text-black p-2 border-[2px] border-black hover:bg-verve-pink transition-colors z-50">
                                        <X size={20} />
                                    </button>
                                    
                                    <h2 className="text-3xl md:text-5xl font-heading text-verve-gold uppercase mb-8 drop-shadow-[2px_2px_0_#000] text-center">Checkpoints QR Codes</h2>
                                    
                                    {!selectedCheckpoint ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {checkpointsList.map((cp) => (
                                                <button
                                                    key={cp}
                                                    onClick={() => setSelectedCheckpoint(cp)}
                                                    className="bg-verve-dark border-[3px] border-gray-600 p-6 flex flex-col items-center justify-center hover:border-verve-gold hover:bg-[#1e1c1c] transition-colors relative group"
                                                >
                                                    <QrCode className="w-12 h-12 text-gray-400 group-hover:text-verve-gold mb-3 transition-colors" />
                                                    <span className="font-heading text-xl md:text-2xl text-white">CP {cp}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <button onClick={() => setSelectedCheckpoint(null)} className="self-start text-verve-pink hover:text-white font-mono uppercase text-sm mb-4 border-[2px] border-verve-pink hover:border-white px-3 py-1">
                                                ← Back to Grid
                                            </button>
                                            <div className="bg-white p-4 border-[4px] border-black shadow-[8px_8px_0_#000] mb-6">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + window.location.pathname + '#/checkpoint-completed/' + checkpointCodes[selectedCheckpoint])}`} 
                                                    alt={`QR Code for Checkpoint ${selectedCheckpoint}`}
                                                    className="w-48 h-48 md:w-64 md:h-64 object-contain"
                                                />
                                            </div>
                                            <h3 className="text-4xl font-heading text-white uppercase tracking-widest bg-black px-6 py-2 border-[2px] border-white">
                                                CHECKPOINT {selectedCheckpoint}
                                            </h3>
                                            <p className="mt-3 font-mono text-gray-500 text-xs uppercase tracking-widest">Code: {checkpointCodes[selectedCheckpoint]}</p>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
