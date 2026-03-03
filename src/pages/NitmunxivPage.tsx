import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { EditableText } from '../components/common';
import nitmunxivvideo from '../assets/nitmunxiv/nitmunxiv-video.mp4';
import nitmunxivDesktopVideo from '../assets/nitmunxiv/nitmunxiv-desktop-video.mp4';
import nitmunxivLogo from '../assets/nitmunxiv/nitmunxiv-logo.png';
import { NitmunRegistrationModal } from '../components/nitmun/InorOut';
import { useAuth } from '../context';
import { NitmunAdminPanel } from '../components/nitmun/NitmunAdminPanel';
import { StudyGuidesModal } from '../components/nitmun/StudyGuidesModal';
import { Shield, ChevronDown, BookOpen, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

const TARGET_DATE = new Date('2026-03-07T00:00:00+05:30').getTime();

export function NitmunxivPage() {
  const [showModal, setShowModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showStudyGuides, setShowStudyGuides] = useState(false);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const isAdmin = user && user.role !== 'student';
  const { scrollYProgress } = useScroll();
  const videoOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const bgLogoOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  // Dynamic Content States
  const defaultTlcText = `Literary Circle is the oldest club of NIT Durgapur, which gives the college an extra dimension of creative expression in the midst of technical unilateralism and gives the students of the college an opportunity to transcend the ordinary and mundane.

The Literary Circle conducts various events throughout the year: Verve, Literary cum Youth Festival of the college and the biggest of its kind in Eastern India. The Literary Circle successfully pulled off the 20th edition of Verve in 2025. Flagship events in the fest, like the Treasure Hunt, have become a matter of college folklore.

The club maintains a blog, The Darkest White, as the culmination of myriad pen strokes from the collective literary expression of the college. The club publishes the yearbook, so each student graduating out of college can reminisce about their days in the college, their hostel life and take with them a part of it.

Humans of NIT Durgapur, by The Literary Circle, captures the untold stories, legends, and experiences of individuals, showing our readers how ordinary people can be unique, inspirational and relatable. The TEDx is an initiative where influential speakers are invited in order to realise TED's overall mission to research and discover "Touchstones". TEDxNITDurgapur was co-organised by The Literary Circle and was a confluence of ideas and innovation.

The club is known to be highly selective in its admission of new members, with only about 10-15 students inducted out of the entire batch of 900 each year. Great believers of the phrase 'quality over quantity', the members selected every year are the best in the field of expression and creativity.`;

  const defaultNitmunText = `NITMUN is a forum convened by the members of the Literary Circle for discussion and analysis of global issues. It seeks to bring out motivated delegates from all over the country for a meaningful debate on significant international issues.

Currently, in its 14th edition, NITMUN has been extremely successful in providing the perfect experience to each delegate. Over the years, we have entertained more than 2000 delegates totalling all the editions. Delegates arrive from all corners of India for an experience they will never forget.`;

  const [aboutTlcText, setAboutTlcText] = useState(defaultTlcText);
  const [lastEditedTlcBy, setLastEditedTlcBy] = useState<string | undefined>();
  const [aboutNitmunText, setAboutNitmunText] = useState(defaultNitmunText);
  const [lastEditedNitmunBy, setLastEditedNitmunBy] = useState<string | undefined>();
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      // Fetch TLC About Text
      const tlcDocRef = doc(db, 'SiteContent', 'nitmun_about_tlc');
      const tlcDocSnap = await getDoc(tlcDocRef);
      if (tlcDocSnap.exists()) {
        const data = tlcDocSnap.data();
        if (data.text) setAboutTlcText(data.text);
        setLastEditedTlcBy(data.lastUpdatedBy);
      }

      // Fetch NITMUN About Text
      const nitmunDocRef = doc(db, 'SiteContent', 'nitmun_about');
      const nitmunDocSnap = await getDoc(nitmunDocRef);
      if (nitmunDocSnap.exists()) {
        const data = nitmunDocSnap.data();
        if (data.text) setAboutNitmunText(data.text);
        setLastEditedNitmunBy(data.lastUpdatedBy);
      }
    } catch (error) {
      console.error('Error fetching dynamic content:', error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleSaveTlcText = async (newText: string) => {
    const editorName = user?.name || user?.userId || 'unknown admin';
    const docRef = doc(db, 'SiteContent', 'nitmun_about_tlc');
    await setDoc(docRef, {
      text: newText,
      lastUpdatedBy: editorName,
      lastUpdatedAt: new Date(),
    }, { merge: true });
    setAboutTlcText(newText);
    setLastEditedTlcBy(editorName);
  };

  const handleSaveNitmunText = async (newText: string) => {
    const editorName = user?.name || user?.userId || 'unknown admin';
    const docRef = doc(db, 'SiteContent', 'nitmun_about');
    await setDoc(docRef, {
      text: newText,
      lastUpdatedBy: editorName,
      lastUpdatedAt: new Date(),
    }, { merge: true });
    setAboutNitmunText(newText);
    setLastEditedNitmunBy(editorName);
  };
  // No duplicate videoOpacity here

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isVideoFinished) {
      const scrollTimer = setTimeout(() => {
        if (actionButtonsRef.current) {
          // Detect if it's mobile view to adjust scroll coordinate
          const isMobile = window.innerWidth < 768;
          // Desktop uses -100 to clear the sticky nav properly, mobile uses 20 to push further down revealing buttons
          const scrollOffset = isMobile ? 20 : -100;

          const y = actionButtonsRef.current.getBoundingClientRect().top + window.scrollY + scrollOffset;
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
        }
      }, 3500); // Wait for the text animations to complete
      return () => clearTimeout(scrollTimer);
    }
  }, [isVideoFinished]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="bg-black min-h-screen text-zinc-300 font-sans selection:bg-primary-500/30">
      {/* Hero Section */}
      <div className="relative w-full h-screen h-[100dvh] overflow-hidden flex flex-col items-center justify-end pb-32 md:pb-12">
        <motion.div style={{ opacity: videoOpacity }} className="absolute inset-0 z-0">
          <video
            src={nitmunxivvideo}
            autoPlay
            muted
            playsInline
            onEnded={() => setIsVideoFinished(true)}
            id="mobile-bg-video"
            className="absolute inset-0 w-full h-full object-cover md:hidden"
          />
          <video
            src={nitmunxivDesktopVideo}
            autoPlay
            muted
            playsInline
            onEnded={() => setIsVideoFinished(true)}
            id="desktop-bg-video"
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        </motion.div>

        {/* Hero Content Overlay */}
        <AnimatePresence>
          {isVideoFinished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative z-10 flex flex-col items-center justify-center w-full px-4 mb-8 md:mb-16"
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-widest text-center drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                NITMUN<span className="text-blue-500">XIV</span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-4 md:mt-6 text-xl md:text-2xl lg:text-3xl font-medium text-zinc-300 tracking-wide font-serif h-10 flex items-center justify-center"
              >
                <div className="relative inline-block">
                  <motion.span
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "linear", delay: 1 }}
                    className="inline-block overflow-hidden whitespace-nowrap"
                  >
                    A Forum for the Formidable
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="absolute -right-[4px] top-[10%] h-[80%] w-[3px] bg-white inline-block"
                  />
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="mt-6 md:mt-8 flex items-center gap-2 text-sm md:text-base font-medium uppercase tracking-[0.2em] text-blue-400 bg-blue-950/30 px-6 py-2 rounded-full border border-blue-500/20 backdrop-blur-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                7th and 8th of March 2026
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll Prompt */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 1 }}
          className="relative z-10 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group cursor-pointer mt-4"
        >
          <span className="text-sm font-medium tracking-widest uppercase">Scroll Below</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 opacity-70 group-hover:opacity-100 group-hover:text-primary-400" />
          </motion.div>
        </motion.button>
      </div>

      {/* Sticky Navigation Tab */}
      <motion.div
        style={{
          opacity: scrollYProgress,
          y: useTransform(scrollYProgress, [0, 0.1], [-50, 0]),
          pointerEvents: useTransform(scrollYProgress, (v) => v > 0.05 ? "auto" : "none")
        }}
        className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 py-3 md:py-4 px-4 md:px-6"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <img src={nitmunxivLogo} alt="NITMUN Logo" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain drop-shadow-md" />
            <span className="text-base sm:text-lg md:text-xl font-bold font-serif tracking-widest text-white">NITMUN<span className="text-blue-500">XIV</span></span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setShowStudyGuides(true)}
              className="flex items-center gap-2 px-2 md:px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              title="Study Guides"
            >
              <BookOpen className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline">Study Guides</span>
            </button>
            <button
              onClick={() => alert("Photo Gallery will be available soon!")}
              className="flex items-center gap-2 px-2 md:px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              title="Gallery"
            >
              <ImageIcon className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline">Gallery</span>
            </button>
            {isAdmin ? (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="flex items-center gap-2 px-4 md:px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-full text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">View Registrations</span>
                <span className="sm:hidden">View</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 md:px-6 py-2 bg-white hover:bg-zinc-200 text-black rounded-full text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Register Now</span>
                <span className="sm:hidden">Register</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Background Logo Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-5 md:opacity-[0.07]">
        <motion.img style={{ opacity: bgLogoOpacity }} src={nitmunxivLogo} alt="" className="w-[150%] md:w-full max-w-4xl object-contain" />
      </div>

      {/* Content Sections */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 space-y-32">

        {/* About TLC */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">About <span className="text-primary-500">Literary Circle</span></h2>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-zinc-400 leading-relaxed font-serif relative group">
            {isLoadingContent ? (
              <p className="animate-pulse">Loading content...</p>
            ) : (
              <EditableText
                value={aboutTlcText}
                onSave={handleSaveTlcText}
                canEdit={Boolean(isAdmin)}
                className="font-spectral"
                showLastEdited={Boolean(isAdmin)}
                lastEditedBy={lastEditedTlcBy}
              />
            )}
            {isAdmin && !isLoadingContent && (
              <p className="text-xs text-primary-300/60 mt-2 block italic border-l-2 border-primary-500 pl-2">
                ✏️ Note: As an admin, you can hover and edit this paragraph. Your edits will instantly update the main database.
              </p>
            )}
          </div>
        </motion.section>

        {/* About NITMUN XIV */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">About <span className="text-blue-500">NITMUN XIV</span></h2>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-zinc-400 leading-relaxed font-serif relative group">
            {isLoadingContent ? (
              <p className="animate-pulse">Loading content...</p>
            ) : (
              <EditableText
                value={aboutNitmunText}
                onSave={handleSaveNitmunText}
                canEdit={Boolean(isAdmin)}
                className="font-spectral text-xl md:text-2xl text-zinc-300 leading-normal"
                showLastEdited={Boolean(isAdmin)}
                lastEditedBy={lastEditedNitmunBy}
              />
            )}
          </div>
        </motion.section>

        {/* Countdown Timer */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          <h3 className="text-sm font-bold tracking-[0.2em] text-primary-400 uppercase mb-8">Commencing In</h3>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((unit) => (
              <div key={unit.label} className="flex flex-col items-center">
                <div className="w-20 h-24 md:w-32 md:h-36 bg-black/50 border border-zinc-800 flex items-center justify-center rounded-2xl shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-4xl md:text-7xl font-light text-white font-mono tracking-tighter">
                    {unit.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs md:text-sm text-zinc-500 font-medium uppercase tracking-widest mt-4">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Grouped Bottom Sections */}
        <div className="space-y-8 md:space-y-12 w-full max-w-4xl mx-auto">
          {/* Action Buttons */}
          <motion.section
            ref={actionButtonsRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {/* Study Guides Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95, filter: "brightness(0.9)" }}
                onClick={() => setShowStudyGuides(true)}
                className="flex flex-col items-start gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-900/20 border border-blue-500/20 hover:border-blue-400/50 transition-colors group overflow-hidden relative text-left"
                title="Study Guides"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BookOpen className="w-32 h-32 transform rotate-12" />
                </div>
                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                  <BookOpen className="w-7 h-7 text-blue-400" />
                </div>
                <div className="relative z-10 space-y-2 mt-2">
                  <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-50 transition-colors">
                    Study Guides
                  </h4>
                  <p className="text-sm sm:text-base font-medium text-zinc-400 group-hover:text-zinc-300">
                    Access comprehensive preparation materials for all committees
                  </p>
                </div>
                <div className="relative z-10 mt-auto pt-4 flex items-center text-sm font-bold uppercase tracking-wider text-blue-400/70 group-hover:text-blue-400 transition-colors">
                  Open Guides <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>

              {/* Photo Gallery Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95, filter: "brightness(0.9)" }}
                onClick={() => alert("Photo Gallery will be available soon!")}
                className="flex flex-col items-start gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-900/20 border border-amber-500/20 hover:border-amber-400/50 transition-colors group overflow-hidden relative text-left"
                title="Photo Gallery"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ImageIcon className="w-32 h-32 transform rotate-12" />
                </div>
                <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                  <ImageIcon className="w-7 h-7 text-amber-400" />
                </div>
                <div className="relative z-10 space-y-2 mt-2">
                  <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-50 transition-colors">
                    Photo Gallery
                  </h4>
                  <p className="text-sm sm:text-base font-medium text-zinc-400 group-hover:text-zinc-300">
                    Relive the most memorable moments and highlights of NITMUN
                  </p>
                </div>
                <div className="relative z-10 mt-auto pt-4 flex items-center text-sm font-bold uppercase tracking-wider text-amber-400/70 group-hover:text-amber-400 transition-colors">
                  View Gallery <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>

              {/* Register/Admin Button */}
              {isAdmin ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95, filter: "brightness(0.9)" }}
                  onClick={() => setShowAdminPanel(true)}
                  className="flex flex-col items-start gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary-600/20 to-primary-900/30 border border-primary-500/30 hover:border-primary-400/60 transition-colors group overflow-hidden relative text-left shadow-[0_0_40px_-15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-32 h-32 transform rotate-12" />
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                    <Shield className="w-7 h-7 text-primary-400" />
                  </div>
                  <div className="relative z-10 space-y-2 mt-2">
                    <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-50 transition-colors">
                      View Registrations
                    </h4>
                    <p className="text-sm sm:text-base font-medium text-zinc-400 group-hover:text-zinc-300">
                      Manage and review all delegate registrations for the conference
                    </p>
                  </div>
                  <div className="relative z-10 mt-auto pt-4 flex items-center text-sm font-bold uppercase tracking-wider text-primary-400/70 group-hover:text-primary-400 transition-colors">
                    Open Dashboard <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95, filter: "brightness(0.9)" }}
                  onClick={() => setShowModal(true)}
                  className="flex flex-col items-start gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 hover:border-emerald-400/50 transition-colors group overflow-hidden relative text-left shadow-[0_0_40px_-15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <LinkIcon className="w-32 h-32 transform rotate-12" />
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-xl bg-black/40 backdrop-blur-md border border-white/5 group-hover:bg-black/60 transition-colors">
                    <LinkIcon className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="relative z-10 space-y-2 mt-2">
                    <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-amber-50 transition-colors">
                      Register Now
                    </h4>
                    <p className="text-sm sm:text-base font-medium text-zinc-400 group-hover:text-zinc-300">
                      Secure your spot and participate in the upcoming conference
                    </p>
                  </div>
                  <div className="relative z-10 mt-auto pt-4 flex items-center text-sm font-bold uppercase tracking-wider text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                    Register Here <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.button>
              )}
            </div>
          </motion.section>

          {/* New to MUN Video Link */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center w-full max-w-4xl"
          >
            <a
              href="https://www.youtube.com/watch?v=9EhrOk2mWXI"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 p-6 md:p-8 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-rose-500/5 to-rose-900/10 hover:from-rose-500/10 hover:to-rose-900/20 hover:border-rose-500/40 transition-all cursor-pointer relative overflow-hidden backdrop-blur-md w-full shadow-[0_0_30px_-15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_40px_-10px_rgba(244,63,94,0.5)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-1 text-center md:text-left">
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] transform group-hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-rose-50 transition-colors">
                    New to MUN?
                  </h4>
                  <p className="text-sm md:text-base text-rose-200/70 group-hover:text-rose-200 transition-colors font-medium tracking-wide">
                    Click Here to know the rules!
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose-400 group-hover:text-rose-300 transition-colors shrink-0">
                Watch Video <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          </motion.section>
        </div>

      </div>

      {/* Modals */}
      {!isAdmin && (
        <NitmunRegistrationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {isAdmin && showAdminPanel && (
        <NitmunAdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      <StudyGuidesModal
        isOpen={showStudyGuides}
        onClose={() => setShowStudyGuides(false)}
      />
    </div>
  );
}