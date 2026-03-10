import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
    onComplete: () => void;
}

const TITLE_LINES = ["VERVE", "2026"];
const TITLE_TEXT = TITLE_LINES.join("");
const LETTER_DELAY = 120;

export function Preloader({ onComplete }: PreloaderProps) {
    const [phase, setPhase] = useState<'rolling' | 'shooting' | 'burning' | 'falling' | 'complete'>('rolling');
    const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
    const [shotFired, setShotFired] = useState(false);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        // Phase 1: Rolling in
        timers.push(setTimeout(() => setPhase('shooting'), 2000));

        // Phase 2: Shooting each letter
        const totalShootingTime = TITLE_TEXT.length * LETTER_DELAY + 500;
        timers.push(setTimeout(() => setPhase('burning'), 2000 + totalShootingTime));

        // Phase 3: Falling away
        timers.push(setTimeout(() => setPhase('falling'), 2000 + totalShootingTime));

        // Phase 4: Complete
        timers.push(setTimeout(() => {
            setPhase('complete');
            onComplete();
        }, 2000 + totalShootingTime + 1500));

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    useEffect(() => {
        if (phase === 'shooting') {
            const letterTimers: ReturnType<typeof setTimeout>[] = [];

            for (let i = 0; i < TITLE_TEXT.length; i++) {
                letterTimers.push(setTimeout(() => {
                    setShotFired(true);
                    setCurrentLetterIndex(i);
                    // Assuming we play a sound here, omitting for simplicity
                    setTimeout(() => setShotFired(false), 80);
                }, i * LETTER_DELAY));
            }

            return () => letterTimers.forEach(clearTimeout);
        }
    }, [phase]);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-verve-dark flex items-center justify-center">
            {/* Background ambient light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-verve-red/20 via-verve-dark to-verve-dark pointer-events-none" />

            <AnimatePresence>
                {(phase === 'rolling' || phase === 'shooting' || phase === 'burning' || phase === 'falling') && (
                    <motion.div
                        className="absolute z-20 flex flex-col items-center justify-center w-full px-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: phase === 'falling' ? 0 : 1,
                            scale: phase === 'falling' ? 1.5 : 1,
                            filter: phase === 'falling' ? 'blur(10px)' : 'blur(0px)'
                        }}
                        transition={{
                            duration: phase === 'falling' ? 1.5 : 0.5,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="flex flex-col items-center gap-4 md:gap-8 w-full px-4">
                            {TITLE_LINES.map((line, lineIndex) => (
                                <div key={lineIndex} className="text-6xl sm:text-8xl md:text-[12rem] text-center flex justify-center leading-none font-accent">
                                    {line.split('').map((char, charIndex) => {
                                        const globalIndex = TITLE_LINES.slice(0, lineIndex).join("").length + charIndex;
                                        const isVisible = globalIndex <= currentLetterIndex || phase === 'burning' || phase === 'falling';

                                        return (
                                            <motion.div
                                                key={globalIndex}
                                                className="relative inline-block mx-1 md:mx-2"
                                                initial={{ opacity: 0, x: 50, scale: 1.5 }}
                                                animate={isVisible ? {
                                                    opacity: 1,
                                                    x: 0,
                                                    scale: 1,
                                                } : {
                                                    opacity: 0,
                                                    x: 50,
                                                    scale: 1.5,
                                                }}
                                                transition={{
                                                    duration: 0.2,
                                                    ease: "easeOut",
                                                }}
                                            >
                                                <span className={`inline-block relative z-10 transition-colors duration-200 ${isVisible ? 'text-verve-gold text-glow-gold' : 'text-transparent'}`}>
                                                    {char}
                                                </span>

                                                {/* Bullet impact flash effect */}
                                                {shotFired && currentLetterIndex === globalIndex && (
                                                    <motion.div
                                                        className="absolute inset-0 z-20"
                                                        initial={{ opacity: 1, scale: 1.5 }}
                                                        animate={{ opacity: 0, scale: 3 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div className="w-full h-full rounded-full blur-md bg-[radial-gradient(circle,_#fff700_0%,_#ff8c00_40%,_transparent_100%)]" />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {phase === 'burning' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 pointer-events-none mix-blend-color-dodge z-30 opacity-50 bg-[url('https://media.giphy.com/media/Lopx9eUi34rbq/giphy.gif')] bg-cover bg-center"
                            />
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
