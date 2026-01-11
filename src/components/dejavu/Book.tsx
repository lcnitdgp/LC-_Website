import { motion } from 'framer-motion';

interface BookProps {
    id?: string;
    year?: string;
    title: string;
    coverImage: string;
    pdfUrl: string;
    onClick: () => void;
    color?: string;
}

export function Book({ title, coverImage, onClick, color = '#8b4513' }: BookProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, rotateY: -10, z: 20 }}
            className="relative cursor-pointer group perspective-1000"
            onClick={onClick}
        >
            <div
                className="absolute left-0 top-1 bottom-1 w-4 -translate-x-full origin-right transform-style-3d bg-gradient-to-r from-black/40 to-transparent z-0 brightness-75 rounded-l-sm"
                style={{ backgroundColor: color }}
            ></div>

            <div className="relative z-10 aspect-[1/1.4] rounded-r-md rounded-l-sm overflow-hidden shadow-xl transition-shadow duration-300 group-hover:shadow-2xl">
                <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>

                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
            </div>

            <div className="absolute right-1 top-2 bottom-2 w-3 -translate-x-[-100%] bg-[#f5f5dc] border-l border-gray-300 transform-style-3d origin-left rotate-y-[-90deg] shadow-inner"></div>
        </motion.div>
    );
}
