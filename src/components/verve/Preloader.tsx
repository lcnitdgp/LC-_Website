import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import verveLogoVideo from '../../assets/verve/verve_logo.webm';

interface PreloaderProps {
    onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
    const [isFadingOut, setIsFadingOut] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleVideoEnd = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            onComplete();
        }, 800); // Wait for fade out animation
    };

    // Fallback in case video fails to load or play
    useEffect(() => {
        const fallbackTimer = setTimeout(() => {
            if (videoRef.current && videoRef.current.readyState < 3) {
                handleVideoEnd();
            }
        }, 5000); // 5 second timeout fallback
        
        return () => clearTimeout(fallbackTimer);
    }, []);

    return (
        <AnimatePresence>
            {!isFadingOut && (
                <motion.div 
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <video
                        ref={videoRef}
                        src={verveLogoVideo}
                        autoPlay
                        muted
                        playsInline
                        onEnded={handleVideoEnd}
                        className="w-full h-full object-contain md:object-cover"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
