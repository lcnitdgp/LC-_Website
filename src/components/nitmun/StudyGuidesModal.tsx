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
        color: 'from-orange-500/20 to-orange-900/40',
        borderColor: 'border-orange-500/30 hover:border-orange-400',
        iconColor: 'text-orange-400'
    },
    {
        id: 'unga',
        name: 'United Nations General Assembly',
        shortName: 'UNGA',
        pdfFile: 'UNGA_Study_Guide.pdf',
        color: 'from-blue-500/20 to-blue-900/40',
        borderColor: 'border-blue-500/30 hover:border-blue-400',
        iconColor: 'text-blue-400'
    },
    {
        id: 'unhrc',
        name: 'United Nations Human Rights Council',
        shortName: 'UNHRC',
        pdfFile: 'UNHRC_Study_Guide.pdf',
        color: 'from-sky-500/20 to-sky-900/40',
        borderColor: 'border-sky-500/30 hover:border-sky-400',
        iconColor: 'text-sky-400'
    },
    {
        id: 'ip',
        name: 'International Press',
        shortName: 'IP',
        pdfFile: 'IP_Study_Guide.pdf',
        color: 'from-zinc-500/20 to-zinc-900/40',
        borderColor: 'border-zinc-500/30 hover:border-zinc-400',
        iconColor: 'text-zinc-400'
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
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
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
                            className="relative w-full max-w-4xl bg-zinc-950/80 backdrop-blur-xl rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-6 sm:px-8 bg-zinc-900/50 border-b border-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-500/10 rounded-xl">
                                        <BookOpen className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight">
                                            NITMUN XIV Study Guides
                                        </h3>
                                        <p className="text-sm text-zinc-400 mt-1">Select a committee to view its study guide</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Committees List */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {COMMITTEES.map((committee) => (
                                        <button
                                            key={committee.id}
                                            onClick={() => handleOpenPdf(committee.pdfFile, committee.shortName)}
                                            className={`flex flex-col items-start gap-4 p-6 rounded-2xl bg-gradient-to-br ${committee.color} border ${committee.borderColor} hover:scale-[1.02] transition-all group overflow-hidden relative text-left`}
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <FileText className="w-24 h-24 transform rotate-12" />
                                            </div>

                                            <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 group-hover:bg-black/60 transition-colors">
                                                <FileText className={`w-6 h-6 ${committee.iconColor}`} />
                                            </div>

                                            <div className="relative z-10 space-y-1">
                                                <h4 className="text-xl font-bold text-white group-hover:text-amber-50 transition-colors">
                                                    {committee.shortName}
                                                </h4>
                                                <p className="text-sm font-medium text-zinc-300">
                                                    {committee.name}
                                                </p>
                                            </div>

                                            <div className="relative z-10 mt-auto pt-4 flex items-center text-xs font-bold uppercase tracking-wider text-white/50 group-hover:text-white/80 transition-colors">
                                                Read Study Guide <span className="ml-2">→</span>
                                            </div>
                                        </button>
                                    ))}
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
