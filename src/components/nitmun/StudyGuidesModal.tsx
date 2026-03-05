import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, FileText } from 'lucide-react';
import { PDFViewerModal } from '../dejavu/PDFViewerModal';

interface StudyGuidesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const COMMITTEES = [
    {
        id: 'aippm',
        name: 'All India Political Parties Meet',
        shortName: 'AIPPM',
        pdfFile: 'AIPPM_Study_Guide.pdf',
        color: 'bg-[#c58715]', // Darker Gold
        borderColor: 'border-black hover:border-black',
        iconColor: 'text-black'
    },
    {
        id: 'unga',
        name: 'United Nations General Assembly',
        shortName: 'UNGA',
        pdfFile: 'UNGA_Study_Guide.pdf',
        color: 'bg-[#974B60]', // Darker Pink/Red
        borderColor: 'border-black hover:border-black',
        iconColor: 'text-black'
    },
    {
        id: 'unhrc',
        name: 'United Nations Human Rights Council',
        shortName: 'UNHRC',
        pdfFile: 'UNHRC_Study_Guide.pdf',
        color: 'bg-[#d1d5db]', // Muted Gray-White
        borderColor: 'border-black hover:border-black',
        iconColor: 'text-black'
    },
    {
        id: 'ip',
        name: 'International Press',
        shortName: 'IP',
        pdfFile: 'IP_Study_Guide.pdf',
        color: 'bg-[#6e3545]', // Deepest Muted Red
        borderColor: 'border-black hover:border-black',
        iconColor: 'text-black'
    }
];

export function StudyGuidesModal({ isOpen, onClose }: StudyGuidesModalProps) {
    const [selectedPdf, setSelectedPdf] = useState<{ url: string, title: string } | null>(null);

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

    const handleOpenPdf = (file: string, name: string) => {
        setSelectedPdf({
            url: `/study-guides/${file}`,
            title: `${name} Study Guide`
        });
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
                        {/* Brutalist Noise Overlay */}
                        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#232020] border-[6px] border-black shadow-[12px_15px_0_#c58715] overflow-y-auto max-h-[90vh] z-10 p-2 sm:p-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-full h-full border-[3px] border-dashed border-black bg-white/5 relative">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-6 sm:px-8 bg-[#c58715] border-b-[6px] border-black shadow-[0_4px_0_#000]">
                                    <div className="flex items-center gap-4 text-center sm:text-left">
                                        <div className="p-3 bg-[#232020] text-white shrink-0 border-[3px] border-black shadow-[4px_4px_0_#fff]">
                                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-4xl md:text-5xl font-staatliches text-black tracking-wide uppercase drop-shadow-[2px_2px_0_#fff]">
                                                NITMUN XIV Study Guides
                                            </h3>
                                            <p className="text-base font-mono font-bold text-gray-900 mt-2 bg-white/60 inline-block px-2 border-2 border-black rotate-1">Select a committee to view its study guide</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="absolute top-2 right-2 md:-right-3 md:-top-3 w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-xl hover:bg-[#e08585] hover:text-black border-2 border-black transition-colors z-[60] cursor-pointer shadow-[3px_3px_0_#000]"
                                    >
                                        <X size={24} className="stroke-[3]" />
                                    </button>
                                </div>

                                {/* Committees List */}
                                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#232020]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                        {COMMITTEES.map((committee) => (
                                            <button
                                                key={committee.id}
                                                onClick={() => handleOpenPdf(committee.pdfFile, committee.shortName)}
                                                className={`flex flex-col items-start gap-4 p-6 ${committee.color} border-[5px] ${committee.borderColor} shadow-[6px_8px_0_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_12px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all group overflow-hidden relative text-left`}
                                            >
                                                <div className="absolute top-2 right-2 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                                    <FileText className="w-24 h-24 transform rotate-12 text-black" />
                                                </div>

                                                <div className="relative z-10 flex items-center justify-center p-3 bg-[#232020] border-[3px] border-[#000] shadow-[3px_3px_0_#fff] group-hover:-translate-y-1 transition-transform">
                                                    <FileText className="w-8 h-8 text-white" />
                                                </div>

                                                <div className="relative z-10 space-y-2 mt-2">
                                                    <h4 className="text-4xl font-staatliches text-black uppercase tracking-wider bg-white/80 inline-block px-2 -rotate-1 border-[2px] border-black">
                                                        {committee.shortName}
                                                    </h4>
                                                    <p className="text-base font-mono font-bold text-black bg-white/60 inline-block px-2 border-2 border-black">
                                                        {committee.name}
                                                    </p>
                                                </div>

                                                <div className="relative z-10 mt-auto pt-4 flex items-center text-sm font-antonio font-bold uppercase tracking-widest text-black group-hover:text-black/70 transition-colors bg-white/80 px-3 py-1 border-2 border-black rotate-1">
                                                    Read Study Guide <span className="ml-2">→</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PDFViewerModal
                isOpen={!!selectedPdf}
                onClose={() => setSelectedPdf(null)}
                pdfUrl={selectedPdf?.url || ''}
                title={selectedPdf?.title || ''}
            />
        </>
    );
}
