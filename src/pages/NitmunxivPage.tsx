import { useState, useEffect, useRef } from 'react';
import nitmunxivvideo from '../assets/nitmunxiv/nitmunxiv-video.mp4';
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
    <div>
      <video
        src={nitmunxivvideo}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        style={{ width: "100%" }}
      />


      <NitmunRegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}