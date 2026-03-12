import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export interface EventData {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    venue: string;
    color: string;
    poster?: string;
}

export const EVENTS_DATA: EventData[] = [
    {
        id: "vocab",
        title: "Vocab",
        description: "A battle of vocabulary and wit! Prove your linguistic dominance in this intense vocabulary challenge.",
        date: "16th March",
        time: "TBD",
        venue: "SAC",
        color: "#e08585",
    },
    {
        id: "literati",
        title: "Literati",
        description: "Test your literary prowess. Dive into word games, literary quizzes, and trivia that will challenge the bibliophile in you.",
        date: "17th March",
        time: "TBD",
        venue: "Main Stage",
        color: "#fcc201",
    },
    {
        id: "wild-card",
        title: "Wild Card",
        description: "Expect the unexpected! A surprise event that will test your creativity, wit, and spontaneity.",
        date: "17th March",
        time: "TBD",
        venue: "TBD",
        color: "#ff3e3e",
    },
    {
        id: "treasure-hunt",
        title: "Treasure Hunt",
        description: "The most anticipated event of the fest! Solve cryptic clues and race across the campus to unearth the hidden treasure.",
        date: "18th March",
        time: "TBD",
        venue: "Oval Stands",
        color: "#c084fc",
    },
    {
        id: "public-speaking",
        title: "Public Speaking",
        description: "Step up to the podium and captivate the crowd! Showcase your oratory skills in this electrifying public speaking contest.",
        date: "18th March",
        time: "TBD",
        venue: "TBD",
        color: "#1dfa82",
    },
    {
        id: "open-mic",
        title: "Open Mic",
        description: "The stage is yours! Poetry, storytelling, stand-up, or anything in between — grab the mic and let your voice be heard.",
        date: "18th March",
        time: "TBD",
        venue: "TBD",
        color: "#38bdf8",
    }
];

interface EventsProps {
    onRegisterClick?: (eventId: string) => void;
}

export function Events({ onRegisterClick }: EventsProps) {
    const targetRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end end"]
    });

    const smoothScrollYProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const x = useTransform(smoothScrollYProgress, [0, 1], ["0%", "-100%"]);

    // Background parallax & marquees
    const marqueeX1 = useTransform(smoothScrollYProgress, [0, 1], ["0%", "-30%"]);
    const marqueeX2 = useTransform(smoothScrollYProgress, [0, 1], ["-30%", "0%"]);

    const [activeDateIndex, setActiveDateIndex] = useState(0);
    const uniqueDates = Array.from(new Set(EVENTS_DATA.map(e => e.date))).sort();

    useEffect(() => {
        return smoothScrollYProgress.onChange((latest) => {
            const index = Math.min(
                uniqueDates.length - 1,
                Math.floor(latest * uniqueDates.length)
            );
            setActiveDateIndex(index);
        });
    }, [smoothScrollYProgress, uniqueDates]);

    // Helper function to scroll to specific day
    const scrollToDay = (dayIndex: number) => {
        if (!targetRef.current || !scrollContainerRef.current) return;
        
        const targetDayElement = dayRefs.current[dayIndex];
        if (!targetDayElement) return;

        if (isMobile) {
            // For mobile, scroll the horizontal native container exactly to the start of the day
            const containerLeft = scrollContainerRef.current.getBoundingClientRect().left;
            const targetLeft = targetDayElement.getBoundingClientRect().left;
            scrollContainerRef.current.scrollTo({
                left: scrollContainerRef.current.scrollLeft + (targetLeft - containerLeft - 16),
                behavior: 'smooth'
            });
            return;
        }

        // Use the global Lenis instance from VervePage layout effect
        const lenis = (window as any).lenis;
        if (!lenis) return;

        // If it's the first day, just go to the start of the section
        if (dayIndex === 0) {
            lenis.scrollTo(targetRef.current.offsetTop, {
                duration: 1.5,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
            return;
        }

        // Calculate how far into the container this specific Day div starts horizontally
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        const targetRect = targetDayElement.getBoundingClientRect();
        
        // This is the relative pixel distance horizontally from the Start of the content to the Day's anchor
        const relativeHorizontalOffset = targetRect.left - containerRect.left;
        
        // This calculates the horizontal percentage the element sits at compared to the entire scroll track width
        const totalScrollableWidth = scrollContainerRef.current.scrollWidth - window.innerWidth;
        
        // Math.min/Math.max constraints guarantee it won't scroll over boundaries
        const targetProgress = Math.min(1, Math.max(0, relativeHorizontalOffset / totalScrollableWidth));
        
        // Math: top of section + (total traversal vertical height * target percentage)
        const startY = targetRef.current.offsetTop;
        const traverseHeight = targetRef.current.scrollHeight - window.innerHeight;
        const targetY = startY + (traverseHeight * targetProgress);

        lenis.scrollTo(targetY, {
            duration: 1.5,
            offset: 0,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
    };
    const groupedData: { date: string, times: { time: string, events: EventData[] }[] }[] = [];
    uniqueDates.forEach(date => {
        const eventsForDate = EVENTS_DATA.filter(event => event.date === date);
        const timeBlocks: { time: string, events: EventData[] }[] = [];

        eventsForDate.forEach((event, index) => {
            if (event.time.toLowerCase() === 'tbd') {
                // Each TBD event gets its own time block
                timeBlocks.push({
                    time: `TBD-${index}`, // Unique key for rendering, we'll strip the -index later
                    events: [event]
                });
            } else {
                // Group non-TBD events by time
                let existingBlock = timeBlocks.find(b => b.time === event.time);
                if (existingBlock) {
                    existingBlock.events.push(event);
                } else {
                    timeBlocks.push({
                        time: event.time,
                        events: [event]
                    });
                }
            }
        });

        groupedData.push({
            date,
            times: timeBlocks
        });
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!isMobile || dayRefs.current.every(ref => ref === null)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = dayRefs.current.findIndex(ref => ref === entry.target);
                        if (index !== -1) {
                            setActiveDateIndex(index);
                        }
                    }
                });
            },
            {
                root: scrollContainerRef.current,
                threshold: 0.5,
                rootMargin: '0px'
            }
        );

        dayRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [isMobile, groupedData]);

    return (
        <section ref={targetRef} id="events" className={`relative w-full ${isMobile ? 'min-h-[100dvh]' : 'h-[800vh] md:h-[1000vh]'} bg-verve-dark border-y-[12px] border-black text-white z-10`}>
            <div className={`flex flex-col pt-[100px] pb-8 overflow-hidden relative border-black ${isMobile ? 'min-h-[100dvh] justify-start' : 'sticky top-0 h-screen'}`}>

                {/* CYBER-BRUTALIST BACKGROUND NOISE & GRID */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none z-0" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:100px_100px] z-0 pointer-events-none" />

                {/* MASSIVE BACKGROUND PARALLAX TEXT MARQUEES */}
                <div className="absolute inset-0 z-0 flex flex-col justify-center overflow-hidden opacity-20 pointer-events-none mix-blend-difference h-full">
                    <motion.div style={{ x: marqueeX1, WebkitTextStroke: '6px #fcc201' }} className="whitespace-nowrap text-[15rem] md:text-[25rem] font-heading font-black text-verve-gold uppercase tracking-tighter leading-none">
                        CHAOS EVENTS MADNESS INSANITY CHAOS EVENTS MADNESS INSANITY
                    </motion.div>
                    <motion.div style={{ x: marqueeX2, WebkitTextStroke: '4px #e08585' }} className="whitespace-nowrap text-[15rem] md:text-[25rem] font-heading font-black text-transparent uppercase tracking-tighter leading-none -mt-16">
                        VERVE XXI VERVE XXI VERVE XXI VERVE XXI VERVE XXI
                    </motion.div>
                </div>

                {/* HEADERS & NAVIGATION */}
                <div className="relative z-20 px-4 md:px-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pointer-events-none mt-2">
                    <h2 className="text-6xl md:text-9xl font-heading font-black text-white uppercase tracking-tighter mix-blend-difference drop-shadow-[8px_8px_0_#fcc201] pointer-events-auto leading-none">
                        EVENTS
                    </h2>

                    <div className="flex gap-4 md:gap-8 pb-4 pointer-events-auto">
                        {uniqueDates.map((date, index) => {
                            const isActive = index === activeDateIndex;
                            return (
                                <button 
                                    key={date} 
                                    onClick={() => scrollToDay(index)}
                                    className={`flex flex-col items-start transition-all duration-300 interactive ${isActive ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-100'} text-left`}
                                >
                                    <span className="text-3xl md:text-5xl font-heading font-black uppercase text-white tracking-tighter">
                                        D.{index + 1}
                                    </span>
                                    <span className={`font-mono font-bold text-sm px-2 py-0.5 mt-1 border-[2px] border-black ${isActive ? 'bg-verve-gold text-black' : 'bg-transparent text-white'}`}>
                                        {date}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* HORIZONTAL SCROLL TRACK */}
                <div className={`w-full relative ${isMobile ? 'flex-1 flex flex-col justify-center mt-8 py-2' : 'flex-1 mt-[2vh] md:mt-[4vh]'}`}>
                    <motion.div 
                        ref={scrollContainerRef} 
                        style={isMobile ? undefined : { x, willChange: 'transform' }} 
                        className={`h-full flex items-center pointer-events-auto z-20 ${
                            isMobile 
                                ? 'relative w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex-nowrap hide-scrollbar px-6 gap-6 pt-2 pb-6' 
                                : 'absolute top-0 left-0 w-max gap-16 md:gap-32 px-8 pl-[50vw] md:pl-[30vw] md:px-24 pr-[100vw]'
                        }`}
                        onScroll={isMobile ? () => {
                            if (!scrollContainerRef.current) return;
                            const scrollLeft = scrollContainerRef.current.scrollLeft;
                            let newActiveIndex = 0;
                            // Approximate visible index natively when swiping
                            dayRefs.current.forEach((ref, index) => {
                                if (ref && scrollLeft >= (ref.offsetLeft - window.innerWidth / 2)) {
                                    newActiveIndex = index;
                                }
                            });
                            setActiveDateIndex(newActiveIndex);
                        } : undefined}
                    >
                        {groupedData.map((dayGroup, dayIdx) => (
                            <div 
                                key={dayGroup.date} 
                                ref={el => { dayRefs.current[dayIdx] = el; }}
                                className={`flex items-center shrink-0 snap-start ${isMobile ? 'gap-6 h-[55vh]' : 'h-[65vh] gap-16 md:gap-24 pb-8'}`}
                            >

                                <div className="hidden md:flex flex-col shrink-0 mx-16 lg:mx-24 opacity-80 mix-blend-screen pointer-events-none relative w-16 items-center justify-center">
                                    <span className="text-[10rem] lg:text-[12rem] font-heading font-black text-transparent leading-[0.8] -rotate-90 whitespace-nowrap" style={{ WebkitTextStroke: '3px white' }}>
                                        DAY {dayIdx + 1}
                                    </span>
                                </div>

                                {dayGroup.times.map((timeBlock) => (
                                    <div key={`${dayGroup.date}-${timeBlock.time}`} className="flex gap-8 md:gap-16 items-center shrink-0 h-full">

                                        {/* BRUTALIST TIME STAMP */}
                                        <div className="flex flex-col items-center justify-center bg-white text-black p-4 border-[4px] border-black shadow-[8px_8px_0_#e08585] shrink-0 rotate-[-4deg] hover:rotate-0 transition-transform duration-300 pointer-events-auto min-w-[120px] min-h-[120px]">
                                            {timeBlock.time.toLowerCase().startsWith('tbd') ? (
                                                <span className="text-5xl md:text-7xl font-sans font-black tracking-tighter leading-none">
                                                    TBD
                                                </span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl md:text-7xl font-sans font-black tracking-tighter leading-none">
                                                        {timeBlock.time.split(' ')[0]}
                                                    </span>
                                                    <span className="text-xl md:text-3xl font-mono font-bold uppercase mt-1">
                                                        {timeBlock.time.split(' ')[1] || '---'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className={`flex shrink-0 items-center h-full ${isMobile ? 'gap-4 py-4' : 'gap-8 md:gap-16'}`}>
                                            {timeBlock.events.map((event, eventIdx) => (
                                                <div key={event.id} className={`shrink-0 snap-center ${isMobile ? 'w-[75vw] h-[55vh] max-h-[420px]' : 'w-[85vw] md:w-[60vw] lg:w-[45vw] lg:max-w-[600px] h-[60vh] min-h-[400px] max-h-[500px]'}`}>
                                                    <EventCard event={event} index={eventIdx} isMobile={isMobile} onRegister={() => onRegisterClick?.(event.id)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20"
                >
                    <span className="text-white/50 font-mono text-xs uppercase tracking-widest font-bold">{isMobile ? 'Swipe Left' : 'Scroll Down'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-verve-gold ${isMobile ? 'animate-pulse' : 'animate-bounce'}`}>
                        {isMobile ? <path d="m14 5-7 7 7 7"/> : <path d="m6 9 6 6 6-6" />}
                    </svg>
                </motion.div>
            </div>
        </section>
    );
}

interface EventCardProps {
    event: EventData;
    index: number;
    isMobile?: boolean;
    onRegister: () => void;
}

function EventCard({ event, index, isMobile, onRegister }: EventCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: index % 2 === 0 ? 3 : 2 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="w-full h-full relative group perspective-1000"
        >
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 md:translate-x-6 md:translate-y-6 transition-transform duration-300 group-hover:translate-x-0 group-hover:translate-y-0 z-0" />
            <div className={`absolute inset-0 translate-x-4 translate-y-4 md:translate-x-10 md:translate-y-10 transition-transform duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 z-0`} style={{ backgroundColor: event.color, mixBlendMode: 'screen' }} />

            {/* MAIN CARD BODY */}
            <div className={`absolute inset-0 bg-verve-dark border-[4px] md:border-[8px] border-white flex flex-col overflow-hidden transition-all duration-300 z-10 ${isMobile ? 'p-4' : 'p-6 md:p-8'} hover:border-black`} style={{ backgroundColor: isHovered ? event.color : '#1a1a2e' }}>

                {/* Background Noise & Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-40 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" style={{ backgroundColor: event.color }} />

                {/* Tags Banner */}
                <div className="flex justify-between items-start z-10 pointer-events-none relative">
                    <div className={`text-black font-mono font-bold uppercase border-black ${isMobile ? 'text-[10px] px-2 py-0.5 border-[2px]' : 'border-[3px] px-4 py-1.5 text-sm md:text-xl'} -rotate-2 hover:rotate-3 transition-colors ${isHovered ? 'bg-white' : 'bg-white'}`}>
                        {event.venue}
                    </div>
                </div>

                {/* Title & Poster Space Wrapper */}
                <div className={`flex w-full ${isMobile ? 'h-28 mt-2' : 'mt-4 h-32 md:h-48'} gap-4 items-stretch`}>
                    {/* Title Area */}
                    <div className="flex-1 flex flex-col justify-end pb-1 md:pb-2">
                        <h3 className={`${isMobile ? 'text-[9vw] leading-none' : 'text-4xl md:text-5xl lg:text-6xl'} font-heading font-black uppercase tracking-tighter ${isHovered ? 'text-black' : 'text-white'}`} style={{ textShadow: isHovered ? 'none' : `3px 3px 0px ${event.color}` }}>
                            {event.title}
                        </h3>
                    </div>

                    {/* Poster Space */}
                    <div className={`w-[45%] h-full border-[2px] border-black overflow-hidden flex-shrink-0 relative transition-colors ${isHovered ? 'bg-black/10' : 'bg-white/5'}`}>
                        {event.poster ? (
                            <img src={event.poster} alt={`${event.title} poster`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                        ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center font-mono ${isMobile ? 'text-[8px]' : 'text-xs'} uppercase tracking-widest bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay ${isHovered ? 'text-black' : 'text-white/50'}`}>
                                <span className="opacity-70 text-center">POSTER</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className={`mt-auto z-10 flex flex-col justify-end h-full ${isMobile ? 'gap-3 pt-6 pb-2' : 'gap-4 pt-4'}`}>
                    <p className={`font-mono ${isMobile ? 'text-[11px] leading-relaxed p-3' : 'text-xs md:text-sm p-3'} border-[2px] mt-auto transition-colors ${isHovered ? 'bg-black/90 text-white border-black' : 'bg-black/50 text-white/90 border-white/20 backdrop-blur-md'}`}>
                        {event.description}
                    </p>

                    <button
                        onClick={onRegister}
                        className={`mt-2 w-full font-heading font-black ${isMobile ? 'text-xl py-2 border-[2px]' : 'text-xl md:text-3xl py-2 md:py-3 border-[4px]'} uppercase border-black transition-all duration-300 ${isHovered ? 'bg-black text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                        style={{ boxShadow: isHovered ? `${isMobile ? '3px 3px 0px #000' : '8px 8px 0px #000'}` : `${isMobile ? `3px 3px 0px ${event.color}` : `8px 8px 0px ${event.color}`}` }}
                    >
                        REGISTER NOW
                    </button>
                </div>

                {/* Cyber-Brutalist decorative index */}
                <div className={`absolute ${isMobile ? 'bottom-2 right-2 text-[4.5rem]' : 'bottom-4 right-4 text-[10rem]'} font-mono font-black leading-none pointer-events-none select-none mix-blend-overlay ${isHovered ? 'text-black opacity-40' : 'text-white/10 opacity-100'}`}>
                    0{index + 1}
                </div>
                {/* Neon Top Bar indicator */}
                {
                    !isHovered && (
                        <div className="absolute top-0 left-0 w-full h-[6px]" style={{ backgroundColor: event.color, boxShadow: `0 0 20px ${event.color}` }} />
                    )}
            </div>
        </motion.div>
    );
}
