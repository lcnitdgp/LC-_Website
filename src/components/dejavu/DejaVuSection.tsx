import { motion } from 'framer-motion';

export function DejaVuSection() {
    return (
        <div className="w-full flex justify-center pt-8 pb-12 relative z-10">
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
            >
                <div className="relative px-12 py-4 bg-gradient-to-br from-[#c4a059] via-[#e6cf8b] to-[#8a6e3e] rounded shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] border border-[#70522a]">

                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-[#5c4033] to-[#2b1d18] shadow-[0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#1a0f0a] rotate-45"></div>
                    </div>
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-[#5c4033] to-[#2b1d18] shadow-[0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#1a0f0a] rotate-12"></div>
                    </div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gradient-to-br from-[#5c4033] to-[#2b1d18] shadow-[0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#1a0f0a] rotate-90"></div>
                    </div>
                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gradient-to-br from-[#5c4033] to-[#2b1d18] shadow-[0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#1a0f0a] -rotate-45"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-3xl md:text-5xl font-merriweather font-bold text-[#3e2c1c] tracking-widest uppercase text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]" style={{ textShadow: '-1px -1px 1px rgba(0,0,0,0.2), 1px 1px 1px rgba(255,255,255,0.5)' }}>
                            Déjà Vu
                        </h2>

                        <div className="flex items-center justify-center gap-3 mt-1 opacity-80">
                            <div className="h-[1px] w-8 bg-[#3e2c1c]"></div>
                            <span className="text-[#3e2c1c] text-xs uppercase tracking-[0.2em] font-spectral font-bold">Archives</span>
                            <div className="h-[1px] w-8 bg-[#3e2c1c]"></div>
                        </div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none rounded"></div>
                </div>
            </motion.div>
        </div>
    );
}
