import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { useAuth } from '../context';

import { QuestionsList } from '../components/auditions/QuestionsList';
import { ResponseLibrary } from '../components/auditions/ResponseLibrary';
import { SEO } from '../components/SEO';
// @ts-ignore 
import '@fontsource/delicious-handrawn';
import auditionsBgVideo from '../assets/auditions/auditions-bg.webm';
import auditionsBgPoster from '../assets/auditions/auditions-bg-poster.webp';
import gunImage from '../assets/auditions/gun.webp';
import gunshotSound from '../assets/sounds/gunshot.mp3';

const playGunshot = () => {
    const audio = new Audio(gunshotSound);
    audio.volume = 0.24;
    audio.play().catch(() => { });
};

function VideoBackground() {
    return (
        <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={auditionsBgPoster}
            className="absolute inset-0 w-full h-full object-cover -z-10"
        >
            <source src={auditionsBgVideo} type="video/webm" />
        </video>
    );
}



const TITLE_LINES = ["LITERARY", "CIRCLE", "AUDITIONS"];
const TITLE_TEXT = TITLE_LINES.join("");
const LETTER_DELAY = 120;



function PersistentTitle() {
    return (
        <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 md:gap-8 w-full px-4"
            style={{ top: '50px', zIndex: 10 }}
        >
            {TITLE_LINES.map((line, lineIndex) => (
                <div key={lineIndex} className="text-4xl sm:text-5xl md:text-8xl text-center flex justify-center leading-none" style={{ fontFamily: "'Alfa Slab One', cursive" }}>
                    {line.split('').map((char, charIndex) => (
                        <div key={charIndex} className="relative inline-block mx-[1px] md:mx-[2px]">
                            <span
                                style={{
                                    color: '#fcc201',
                                    textShadow: '1px 1px 0 #aa1100, 2px 2px 0 #aa1100, 3px 3px 0 #aa1100, 4px 4px 0 #aa1100, 5px 5px 0 #aa1100, 6px 6px 0 #000000',
                                    display: 'inline-block',
                                    position: 'relative',
                                    zIndex: 2,
                                    letterSpacing: '0.05em',
                                    transform: 'scaleY(1.5)'
                                }}
                            >
                                {char}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}


function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
    const [phase, setPhase] = useState<'rolling' | 'shooting' | 'burning' | 'falling' | 'complete'>('rolling');
    const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
    const [shotFired, setShotFired] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = gunImage;

        const audio = new Audio(gunshotSound);
        audio.preload = 'auto';
    }, []);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        timers.push(setTimeout(() => setPhase('shooting'), 2000));

        const totalShootingTime = TITLE_TEXT.length * LETTER_DELAY + 500;
        timers.push(setTimeout(() => setPhase('burning'), 2000 + totalShootingTime));
        timers.push(setTimeout(() => setPhase('falling'), 2000 + totalShootingTime));
        timers.push(setTimeout(() => {
            setPhase('complete');
            onComplete();
        }, 2000 + totalShootingTime + 2000));

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    useEffect(() => {
        if (phase === 'shooting') {
            const letterTimers: ReturnType<typeof setTimeout>[] = [];

            for (let i = 0; i < TITLE_TEXT.length; i++) {
                letterTimers.push(setTimeout(() => {
                    setShotFired(true);
                    setCurrentLetterIndex(i);
                    playGunshot();
                    setTimeout(() => setShotFired(false), 80);
                }, i * LETTER_DELAY));
            }

            return () => letterTimers.forEach(clearTimeout);
        }
    }, [phase]);

    const gunLineIndex = currentLetterIndex === -1 ? 0 : (() => {
        let count = 0;
        for (let i = 0; i < TITLE_LINES.length; i++) {
            count += TITLE_LINES[i].length;
            if (currentLetterIndex < count) return i;
        }
        return TITLE_LINES.length - 1;
    })();

    const gunBaseTop = 40;
    const lineHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 40 : 80;
    const gunTop = gunBaseTop + (gunLineIndex * lineHeight);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <AnimatePresence>
                {(phase === 'rolling' || phase === 'shooting' || phase === 'burning') && (
                    <motion.div
                        className="absolute"
                        style={{ top: `${phase === 'shooting' || phase === 'burning' ? gunTop : 50}px`, right: '5%' }}
                        initial={{ rotate: 0, x: 300, scaleX: -1 }}
                        animate={phase === 'rolling' ? {
                            rotate: 2880,
                            x: 0,
                            scaleX: -1,
                            top: 50,
                        } : {
                            rotate: 2880 - 20,
                            x: shotFired ? 15 : 0,
                            scaleX: -1,
                            top: gunTop,
                        }}
                        transition={phase === 'rolling' ? {
                            duration: 2,
                            ease: "linear",
                        } : {
                            x: { duration: 0.05 },
                            rotate: { duration: 0.15 },
                            top: { duration: 0.2, ease: "easeOut" }
                        }}
                    >
                        <img
                            src={gunImage}
                            alt="Gun"
                            className="w-20 h-20 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                            style={{ filter: 'drop-shadow(0 0 20px rgba(255, 150, 50, 0.5))' }}
                        />
                        {shotFired && (
                            <motion.div
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"
                                initial={{ opacity: 1, scale: 1.5 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{ duration: 0.1 }}
                                key={currentLetterIndex}
                            >
                                <div
                                    className="w-10 h-10 md:w-16 md:h-16 rounded-full blur-sm"
                                    style={{
                                        background: 'radial-gradient(circle, #fff700 0%, #ff8c00 40%, #ff4500 70%, transparent 100%)'
                                    }}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === 'falling' && (
                    <motion.div
                        className="absolute"
                        style={{ top: '80px', right: '5%', scaleX: -1 }}
                        initial={{ y: 0, rotate: 0, opacity: 1 }}
                        animate={{
                            y: [0, 50, 150, 400, 800],
                            rotate: [0, -45, -90, -180, -360],
                            opacity: [1, 1, 0.8, 0.5, 0],
                        }}
                        transition={{ duration: 1.5, ease: "easeIn" }}
                    >
                        <img
                            src={gunImage}
                            alt="Gun"
                            className="w-20 h-20 md:w-40 md:h-40 object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(phase === 'shooting' || phase === 'burning' || phase === 'falling' || phase === 'complete') && (
                    <motion.div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ top: '50px' }}
                        initial={{ opacity: 0, scale: 0, x: 200 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 0.5,
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                        }}
                    >


                        <div className="flex flex-col items-center gap-3 md:gap-8 w-full px-4">
                            {TITLE_LINES.map((line, lineIndex) => (
                                <div key={lineIndex} className="text-4xl sm:text-5xl md:text-8xl text-center flex justify-center leading-none" style={{ fontFamily: "'Alfa Slab One', cursive" }}>
                                    {line.split('').map((char, charIndex) => {
                                        const globalIndex = TITLE_LINES.slice(0, lineIndex).join("").length + charIndex;
                                        return (
                                            <motion.div
                                                key={globalIndex}
                                                className="relative inline-block mx-[1px] md:mx-[2px]"
                                                initial={{ opacity: 0, x: 100, scale: 1.3 }}
                                                animate={globalIndex <= currentLetterIndex || phase === 'burning' || phase === 'falling' || phase === 'complete' ? {
                                                    opacity: 1,
                                                    x: 0,
                                                    scale: 1,
                                                } : {
                                                    opacity: 0,
                                                    x: 100,
                                                    scale: 1.3,
                                                }}
                                                transition={{
                                                    duration: 0.15,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: '#fcc201',
                                                        textShadow: '1px 1px 0 #aa1100, 2px 2px 0 #aa1100, 3px 3px 0 #aa1100, 4px 4px 0 #aa1100, 5px 5px 0 #aa1100, 6px 6px 0 #000000',
                                                        display: 'inline-block',
                                                        position: 'relative',
                                                        zIndex: 2,
                                                        letterSpacing: '0.05em',
                                                        transform: 'scaleY(1.5)'
                                                    }}
                                                >
                                                    {char}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>


                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AuditionsPage() {
    const { user, isLoading } = useAuth();
    const [animationComplete, setAnimationComplete] = useState(false);
    const [showQuestions, setShowQuestions] = useState(false);
    const [showResponses, setShowResponses] = useState(false);

    useEffect(() => {
        // Document title and meta tags are now handled by the SEO component
    }, []);

    const formatFirstName = (fullName: string | undefined): string => {
        if (!fullName) return 'there';
        const firstName = fullName.split(' ')[0];
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    };

    const isNotStudent = user && user.role !== 'student';


    if (isLoading || !animationComplete) {
        return (
            <>

                <div className="min-h-screen relative overflow-hidden">
                    <VideoBackground />
                    <div className="min-h-screen bg-black/40 relative z-10">
                        <SEO
                            title="Join the Circle"
                            description="Auditions for The Literary Circle, NIT Durgapur. Join the premier literary society!"
                            url="https://www.lcnitd.co.in/#/auditions"
                        />
                        <LoadingAnimation onComplete={() => setAnimationComplete(true)} />
                    </div>
                </div>
            </>
        );
    }

    if (isNotStudent) {
        const isLCite = user.role === 'LCite';

        return (
            <div className="min-h-screen relative overflow-hidden">
                <VideoBackground />
                <div className="min-h-screen bg-black/50 relative z-10">
                    <SEO
                        title="Join the Circle"
                        description="Auditions for The Literary Circle, NIT Durgapur. Join the premier literary society!"
                        url="https://www.lcnitd.co.in/#/auditions"
                    />
                    <PersistentTitle />
                    <div className="max-w-4xl mx-auto px-4 pt-[280px] md:pt-[700px] pb-20">
                        {showQuestions ? (
                            <QuestionsList user={user!} onClose={() => setShowQuestions(false)} />
                        ) : showResponses ? (
                            <ResponseLibrary onClose={() => setShowResponses(false)} />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-center"
                            >
                                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <Users className="w-8 h-8 text-purple-400" />
                                        <h2 className="text-2xl font-merriweather text-amber-100">
                                            {isLCite ? `Welcome Comrade ${formatFirstName(user.name)}` : `Welcome ${user.role} ${formatFirstName(user.name)}!`}
                                        </h2>
                                    </div>
                                    <p className="text-amber-200/90 font-spectral text-lg mb-8">
                                        {isLCite
                                            ? "Click the button below to view the questions we have for the contenders. Since you are already a part of the Circle, you have the authority to add more questions of your choice. But don't be too harsh! We don't have to scare them away in Round 1 itself! Alternatively, you can also click view responses and try to guess who would eventually end up in expanding the Circle!"
                                            : "The Circle is delighted to have your presence here! Click the button below to see the questions your juniors have added to induct the fresh lot into the Circle. But you know how naive kids can be! So unlike them, you have additional powers of being able to Edit and Delete the questions as well! You have carried the burden of the Circle for 4 freaking years so you completely deserve the authority to edit and delete their questions! Alternatively, you can also click view responses and try to guess who would eventually end up in expanding the Circle!"
                                        }
                                    </p>

                                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => setShowQuestions(true)}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30 group transform hover:scale-105 duration-200"
                                        >
                                            <span className="font-merriweather text-lg">View Questions</span>
                                        </button>

                                        <button
                                            onClick={() => setShowResponses(true)}
                                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-amber-500/30 group transform hover:scale-105 duration-200"
                                        >
                                            <span className="font-merriweather text-lg">View Responses</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Default view (for students, logged out users, etc.): Display the generic "Auditions Over" message
    return (
        <div className="min-h-screen relative overflow-hidden">
            <VideoBackground />
            <div className="min-h-screen bg-black/50 relative z-10">
                <SEO
                    title="Auditions Closed - The Literary Circle"
                    description="Auditions for The Literary Circle, NIT Durgapur are now closed. Stay tuned for our upcoming events!"
                    url="https://www.lcnitd.co.in/#/auditions"
                />
                <PersistentTitle />
                <div className="max-w-4xl mx-auto px-4 pt-[280px] md:pt-[700px] pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-amber-500/20">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <h2 className="text-2xl font-merriweather text-amber-100">
                                    {user ? `Hey ${formatFirstName(user?.name)}!` : 'Hello there!'}
                                </h2>
                            </div>
                            <p className="text-amber-200/90 font-spectral mb-8 text-lg leading-relaxed">
                                The Circle has expanded. Auditions are over. But don't lose heart! We can be connected through our events. Hope to see you there!
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
