import { useState, useEffect, useRef } from 'react';
import nitmunxivvideo from '../assets/nitmunxiv/nitmunxiv-video.mp4';
import nitmunxivDesktopVideo from '../assets/nitmunxiv/nitmunxiv-desktop-video.mp4';
import { NitmunRegistrationModal } from '../components/nitmun/InorOut';
import { useAuth } from '../context';
import { NitmunAdminPanel } from '../components/nitmun/NitmunAdminPanel';
import { Shield } from 'lucide-react';

export function NitmunxivPage() {
  const [showModal, setShowModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { user } = useAuth();

  const isLCite = user && user.role !== 'student';

  useEffect(() => {
    // Show pop-up after 8 seconds, but only if not an LCite and admin panel is not open
    if (!isLCite) {
      timerRef.current = window.setTimeout(() => {
        setShowModal(true);
      }, 8000);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isLCite]);

  const handleVideoEnded = () => {
    if (!isLCite) {
      setShowModal(true);
    }
  };

  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden bg-black">
      {/* Mobile Video: visible on small screens, hidden on md and above */}
      <video
        src={nitmunxivvideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover md:hidden"
      />

      {/* Desktop Video: hidden on small screens, visible on md and above */}
      <video
        src={nitmunxivDesktopVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      />

      {/* Optional subtle overlay to ensure content or modal stands out */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* LCite Admin Control */}
      {isLCite && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setShowAdminPanel(true)}
            className="flex items-center gap-3 px-8 py-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 hover:border-primary-500/50 hover:bg-zinc-800 transition-all rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-primary-500/30"
          >
            <Shield className="w-6 h-6 text-primary-400" />
            View Registrations
          </button>
        </div>
      )}

      {/* Standard Registration Modal */}
      {!isLCite && (
        <NitmunRegistrationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Admin Panel Modal */}
      {isLCite && showAdminPanel && (
        <NitmunAdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}