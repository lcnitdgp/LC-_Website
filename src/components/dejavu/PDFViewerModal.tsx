import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PDFViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    title: string;
}

export function PDFViewerModal({ isOpen, onClose, pdfUrl, title }: PDFViewerModalProps) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fullPdfUrl = pdfUrl.startsWith('http')
        ? pdfUrl
        : `${window.location.origin}${pdfUrl}`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-5xl h-[85vh] bg-[#f4f4f4] border-[6px] border-black shadow-[15px_15px_0_#974B60] overflow-hidden flex flex-col p-2"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-full h-full border-[3px] border-dashed border-black flex flex-col relative">
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-black border-b-[4px] border-black shadow-[0_4px_0_#bb943a] z-10">
                                <h3 className="text-3xl font-staatliches tracking-wider text-white truncate max-w-[80%] uppercase drop-shadow-[2px_2px_0_#e08585]">
                                    {title}
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute top-2 right-2 md:-right-3 md:-top-3 w-10 h-10 bg-[#e08585] text-black flex items-center justify-center font-bold text-xl hover:bg-white hover:text-black border-[3px] border-black transition-colors z-[60] cursor-pointer shadow-[4px_4px_0_#000]"
                                >
                                    <X size={24} className="stroke-[3]" />
                                </button>
                            </div>

                            <div className="flex-grow bg-[#232020] w-full h-full relative border-t-4 border-black border-dashed">
                                {isMobile ? (
                                    <div className="flex flex-col h-full w-full">
                                        <iframe
                                            src={pdfUrl}
                                            className="flex-grow w-full border-none"
                                            title="PDF Viewer"
                                        />
                                        <div className="bg-[#bb943a] border-t-[4px] border-black p-4 flex justify-center shrink-0">
                                            <a
                                                href={fullPdfUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-black text-white hover:bg-[#232020] font-antonio text-xl uppercase tracking-widest py-3 px-8 border-[4px] border-black shadow-[4px_4px_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_#fff] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all flex items-center gap-2"
                                            >
                                                Download {title} (PDF)
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <object
                                        data={pdfUrl}
                                        type="application/pdf"
                                        className="w-full h-full"
                                    >
                                        <div className="flex items-center justify-center h-full bg-[#f4f4f4]">
                                            <p className="text-black font-mono font-bold text-center border-[4px] border-black shadow-[6px_6px_0_#e08585] p-6 bg-white rotate-2 max-w-md">
                                                Unable to display PDF.
                                                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#bb943a] hover:text-[#c58715] underline ml-2 decoration-4">
                                                    Download instead
                                                </a>
                                            </p>
                                        </div>
                                    </object>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
