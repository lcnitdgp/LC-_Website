import { X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import groupPhoto from '../../assets/nitmunxiv/group_photo.webp';

// Use Vite's glob import to automatically pull all jpegs from the gallery folder
const galleryModules = import.meta.glob('../../assets/nitmunxiv/gallery/*.webp', { eager: true, import: 'default' });
const galleryImages = Object.values(galleryModules) as string[];

interface PhotoGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PhotoGalleryModal({ isOpen, onClose }: PhotoGalleryModalProps) {
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Main Gallery Container */}
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="relative w-full max-w-7xl max-h-[90vh] bg-[#232020] border-[6px] border-black shadow-[12px_15px_0_#974B60] flex flex-col pointer-events-auto overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-6 border-b-[6px] border-black bg-[#c58715] shrink-0 relative overflow-hidden">
                            {/* Brutalist Pattern Overlay */}
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

                            <h2 className="text-4xl md:text-5xl font-staatliches text-black uppercase tracking-wide drop-shadow-[2px_2px_0_#fff] z-10">
                                Photo Gallery
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-[#e08585] border-[4px] border-black shadow-[4px_4px_0_#000] text-black hover:bg-[#974B60] hover:text-white active:translate-y-1 active:translate-x-1 active:shadow-none transition-all z-10"
                            >
                                <X className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
                            </button>
                        </div>

                        {/* Scrollable Grid Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                            {/* Noise */}
                            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                            {/* Meet the Team Section */}
                            <div className="w-full max-w-6xl mx-auto bg-[#c58715] border-[5px] border-black shadow-[8px_10px_0_#000] p-6 md:p-10 relative group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_14px_0_#974B60] transition-all duration-300 mb-12 mt-4">
                                <div className="absolute top-0 right-0 py-2 px-4 bg-black text-white font-antonio font-bold text-lg transform rotate-[4deg] translate-x-2 -translate-y-4 shadow-[4px_4px_0_#974B60] z-10">
                                    OUR TEAM
                                </div>
                                <h2 className="text-4xl md:text-6xl font-staatliches text-black uppercase tracking-wide mb-6 relative z-10 drop-shadow-[2px_2px_0_#fff]">
                                    Meet The Team Behind NITMUN
                                </h2>
                                <div className="text-lg md:text-2xl font-mono text-zinc-300 mb-8 relative z-10">
                                    <span className="bg-[#974B60] text-white px-3 py-1 font-bold border-[2px] border-black shadow-[3px_3px_0_#000]">The Literary Circle</span>
                                </div>

                                {/* Image Container */}
                                <div className="relative w-full aspect-video border-[4px] border-black shadow-[6px_8px_0_#000] overflow-hidden group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[8px_10px_0_#000] transition-all duration-300">
                                    <img
                                        src={groupPhoto}
                                        alt="The Literary Circle Group Photo"
                                        className="absolute inset-0 w-full h-full object-cover filter grayscale-[10%] group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto relative z-10">
                                {galleryImages.map((src, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative aspect-square bg-zinc-800 border-[4px] border-black shadow-[6px_8px_0_#000] cursor-pointer hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_12px_0_#e08585] transition-all duration-300"
                                        onClick={() => setSelectedImg(src)}
                                    >
                                        <img
                                            src={src}
                                            alt={`Gallery Image ${index + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:grayscale-0 transition-all duration-300 filter grayscale-[20%]"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 border-[4px] border-transparent group-hover:border-[#e08585] transition-colors duration-300 pointer-events-none"></div>
                                    </motion.div>
                                ))}

                                {galleryImages.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-xl font-mono text-zinc-500 uppercase">
                                        No images found in gallery database.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Lightbox Overlay */}
                    <AnimatePresence>
                        {selectedImg && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 cursor-zoom-out"
                                onClick={() => setSelectedImg(null)}
                            >
                                <motion.img
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.9 }}
                                    src={selectedImg}
                                    alt="Expanded view"
                                    className="max-w-full max-h-[90vh] object-contain border-[8px] border-black shadow-[15px_20px_0_#c58715]"
                                />

                                <div className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 bg-white border-[4px] border-black flex items-center justify-center text-black pointer-events-none">
                                    <X className="w-8 h-8" strokeWidth={3} />
                                </div>
                                <div className="absolute top-4 left-4 md:top-8 md:left-8 w-12 h-12 bg-[#c58715] border-[4px] border-black shadow-[4px_4px_0_#000] flex items-center justify-center text-black cursor-pointer hover:bg-[#974B60] hover:text-white active:translate-y-1 active:translate-x-1 active:shadow-none transition-all pointer-events-auto" onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}>
                                    <ArrowLeft className="w-8 h-8" strokeWidth={3} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
