import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { EditableText } from '../components/common';
import nitmunxivvideo from '../assets/nitmunxiv/nitmunxiv-video.mp4';
import nitmunxivDesktopVideo from '../assets/nitmunxiv/nitmunxiv-desktop-video.mp4';
import { NitmunRegistrationModal } from '../components/nitmun/InorOut';
import { useAuth } from '../context';
import { NitmunAdminPanel } from '../components/nitmun/NitmunAdminPanel';
import { Shield, ChevronDown, BookOpen, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TARGET_DATE = new Date('2026-03-07T00:00:00+05:30').getTime();

export function NitmunxivPage() {
  const [showModal, setShowModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
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
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover md:hidden"
          />
          <video
            src={nitmunxivDesktopVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        </motion.div>

        {/* Scroll Prompt */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="relative z-10 flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors group cursor-pointer"
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
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl font-bold font-serif tracking-widest text-white">NITMUN<span className="text-blue-500">XIV</span></span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="flex items-center gap-2 px-2 md:px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-not-allowed" title="Study Guides (Coming Soon)">
              <BookOpen className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline">Study Guides</span>
            </button>
            <button className="flex items-center gap-2 px-2 md:px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-not-allowed" title="Gallery (Coming Soon)">
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

        {/* Action Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="flex justify-center"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <button
              className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all group opacity-70 hover:opacity-100 cursor-not-allowed"
              title="Coming Soon"
            >
              <BookOpen className="w-8 h-8 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              <span className="font-semibold text-white tracking-wide">Study Guides</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Coming Soon</span>
            </button>

            <button
              className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all group opacity-70 hover:opacity-100 cursor-not-allowed"
              title="Coming Soon"
            >
              <ImageIcon className="w-8 h-8 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <span className="font-semibold text-white tracking-wide">Photo Gallery</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Coming Soon</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => setShowAdminPanel(true)}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-primary-600 border border-primary-500 hover:bg-primary-500 hover:border-primary-400 transition-all group shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]"
              >
                <Shield className="w-8 h-8 text-white" />
                <span className="font-bold text-white tracking-wide text-lg text-center">View Registrations</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl bg-white border border-white hover:bg-zinc-200 hover:border-zinc-200 transition-all group shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                <LinkIcon className="w-8 h-8 text-black" />
                <span className="font-bold text-black tracking-wide text-lg text-center">Register Now</span>
              </button>
            )}
          </div>
        </motion.section>

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
    </div>
  );
}