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
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-5xl h-[85vh] bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                            <h3 className="text-xl font-merriweather text-white truncate max-w-[80%]">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-grow bg-gray-200 w-full h-full relative">
                            {isMobile ? (
                                <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(fullPdfUrl)}&embedded=true`}
                                    className="w-full h-full border-none"
                                    title="PDF Viewer"
                                />
                            ) : (
                                <object
                                    data={pdfUrl}
                                    type="application/pdf"
                                    className="w-full h-full"
                                >
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-600">
                                            Unable to display PDF.
                                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline ml-1">
                                                Download instead
                                            </a>
                                        </p>
                                    </div>
                                </object>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
