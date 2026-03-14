import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Target, CheckCircle2 } from 'lucide-react';

// Reverse lookup: URL code → human-readable checkpoint label
// Must match checkpointCodes in VerveAdminDashboardModal.tsx
const CODE_TO_CHECKPOINT: Record<string, string> = {
    'vT3mK9xR': '1',
    'pQ7nJ2wL': '2',
    'zH5bY8cF': '3',
    'dN6sA1eG': '4a',
    'kU4rP0mB': '4b',
    'gX2tW7qZ': '5a',
    'yC9fE5hD': '5b',
    'nR1kM3vT': '6',
    'jS8bL6uY': '7',
    'wF4pQ2xN': '8',
    'hA7cJ9rK': '9',
    'eZ5gD8wP': '10',
};

export function CheckpointCompletedPage() {
    const { id } = useParams<{ id: string }>();
    const [teamName, setTeamName] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Resolve the URL code to a readable checkpoint label
    const checkpointLabel = id ? (CODE_TO_CHECKPOINT[id] ?? null) : null;

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const [isVerifying, setIsVerifying] = useState(false);
    const [teamError, setTeamError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim()) return;

        setIsVerifying(true);
        setTeamError(null);

        // Normalize for flexible matching
        const normalizedTeamName = teamName.trim().toLowerCase().replace(/\s+/g, ' ');

        try {
            const { doc, setDoc, getDocs, getDoc, collection } = await import('firebase/firestore');
            const { db } = await import('../firebase');

            // --- Step 1: Validate team name against registered teams ---
            const teamsSnapshot = await getDocs(collection(db, 'treasure_hunt_teams'));
            const isRegistered = teamsSnapshot.docs.some(teamDoc => {
                const data = teamDoc.data();
                const storedName = (data.teamName as string ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
                return storedName === normalizedTeamName;
            });

            if (!isRegistered) {
                setTeamError("Team not found! Please cross-check your team name spelling — it must match exactly what was registered.");
                setIsVerifying(false);
                return;
            }

            const teamDocId = normalizedTeamName.replace(/[^a-z0-9]/g, '-');

            // --- Step 1.5: Enforce sequential order ---
            const cpOrder = ['1', '2', '3', '4a', '4b', '5a', '5b', '6', '7', '8', '9', '10'];
            const currentIndex = cpOrder.indexOf(checkpointLabel!);
            if (currentIndex > 0) {
                const prerequisite = cpOrder[currentIndex - 1];
                const prereqDoc = await getDoc(doc(db, 'passed_checkpoints', teamDocId, 'checkpoints', prerequisite));
                if (!prereqDoc.exists()) {
                    setTeamError(
                        `You must complete Checkpoint ${prerequisite} before attempting Checkpoint ${checkpointLabel}. Please complete them in the correct order.`
                    );
                    setIsVerifying(false);
                    return;
                }
            }

            // --- Step 2: Team verified & order confirmed — record the checkpoint scan ---
            await setDoc(doc(db, 'passed_checkpoints', teamDocId), {
                teamName: teamName.trim(),
                normalizedTeamName,
            }, { merge: true });

            await setDoc(doc(db, 'passed_checkpoints', teamDocId, 'checkpoints', checkpointLabel!), {
                checkpointId: checkpointLabel,
                completedAt: new Date().toISOString(),
            });

        } catch (err) {
            console.error('Checkpoint verification/write failed:', err);
            // Still allow success if write fails after successful validation
        }

        setIsVerifying(false);
        setIsSubmitted(true);
        triggerConfetti();
    };

    return (
        <div className="min-h-screen bg-verve-dark flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono">
            {/* Cyber-Brutalist Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-verve-pink/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-verve-gold/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

            {checkpointLabel === null ? (
                // Invalid / unrecognized QR code guard
                <div className="relative z-10 w-full max-w-md text-center">
                    <div className="bg-[#2a2828] border-[4px] border-red-500 p-8 shadow-[12px_12px_0_#000]">
                        <div className="text-6xl mb-4">⛔</div>
                        <h1 className="text-3xl font-heading uppercase text-red-400 tracking-widest mb-2">Invalid QR Code</h1>
                        <p className="text-gray-400 font-mono text-sm">This checkpoint link is not recognized. Please scan the correct QR code provided by the organizers.</p>
                    </div>
                </div>
            ) : (
            <div className="relative z-10 w-full max-w-md">
                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#2a2828] border-[4px] border-black p-8 shadow-[12px_12px_0_#000]"
                        >
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-verve-gold rounded-full flex items-center justify-center border-[4px] border-black shadow-[4px_4px_0_#fff]">
                                    <Target className="w-8 h-8 text-black" />
                                </div>
                            </div>
                            
                            <div className="text-center mb-8">
                                <h1 className="text-4xl font-heading uppercase text-white tracking-widest leading-none mb-2">Checkpoint <span className="text-verve-pink">{checkpointLabel}</span></h1>
                                <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Treasure Hunt Verification</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase font-bold text-gray-400 mb-2 tracking-widest">Enter Team Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={teamName}
                                        onChange={(e) => { setTeamName(e.target.value); setTeamError(null); }}
                                        placeholder="Team Name..."
                                        className={`w-full bg-[#1e1c1c] border-[3px] p-4 text-white placeholder-gray-600 focus:outline-none transition-colors text-lg ${
                                            teamError ? 'border-red-500 focus:border-red-400' : 'border-black focus:border-verve-gold'
                                        }`}
                                    />
                                    {teamError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 bg-red-950/60 border-[2px] border-red-500 p-3 flex gap-2"
                                        >
                                            <span className="text-lg shrink-0">⚠️</span>
                                            <p className="text-red-300 text-xs font-mono leading-relaxed">{teamError}</p>
                                        </motion.div>
                                    )}
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="w-full bg-verve-gold text-black font-heading font-black text-2xl uppercase tracking-widest py-4 border-[4px] border-black shadow-[6px_6px_0_#fff] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0_#fff] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:translate-x-0 disabled:shadow-none"
                                >
                                    {isVerifying ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <span className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                                            Verifying...
                                        </span>
                                    ) : 'Verify Team'}
                                </button>
                            </form>
                        </motion.div>

                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-[6px] border-black p-8 shadow-[16px_16px_0_#e08585] text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-[8px] bg-verve-gold" />
                            
                            <div className="flex justify-center mb-6">
                                <CheckCircle2 className="w-20 h-20 text-verve-pink drop-shadow-[2px_2px_0_#000]" />
                            </div>
                            
                            <h2 className="text-3xl md:text-4xl font-heading font-black text-black uppercase tracking-tighter leading-tight mb-4">
                                Congratulations<br/>
                                <span className="text-verve-pink break-words">{teamName}</span>!
                            </h2>
                            
                            <p className="text-xl font-bold font-mono text-gray-800 mb-6">
                                You have successfully completed checkpoint <span className="bg-black text-white px-3 py-1 ml-1 text-2xl">{checkpointLabel}</span>
                            </p>
                            
                            <div className="border-t-[3px] border-dashed border-gray-300 py-6 my-6">
                                <p className="text-xl font-heading uppercase text-gray-600 tracking-widest">
                                    Best wishes for <br/> further rounds!
                                </p>
                            </div>

                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-8">
                                Presented to you by<br/>
                                <span className="text-black text-sm">Literary Circle Verve XXI</span>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            )}
        </div>
    );
}
