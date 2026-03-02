import { useState, useEffect, useRef } from 'react';
import nitmunxivvideo from '../assets/nitmunxiv/nitmunxiv-video.mp4';
import nitmunxivDesktopVideo from '../assets/nitmunxiv/nitmunxiv-desktop-video.mp4';
import { NitmunRegistrationModal } from '../components/nitmun/InorOut';

export function NitmunxivPage() {
  const [showModal, setShowModal] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Show pop-up after 8 seconds
    timerRef.current = window.setTimeout(() => {
      setShowModal(true);
    }, 8000);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleVideoEnded = () => {
    setShowModal(true);
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

      <NitmunRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}