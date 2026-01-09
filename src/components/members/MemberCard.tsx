import { motion } from 'framer-motion';
import type { UserData } from '../../context/AuthContext';

interface MemberCardProps {
    member: UserData;
    index: number;
    onClick: () => void;
}

function formatName(name: string): string {
    if (!name) return 'Unknown';
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function MemberCard({ member, index, onClick }: MemberCardProps) {
    const isLCite = member.role !== 'student';
    const formattedName = formatName(member.name);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
            onClick={onClick}
            className="group cursor-pointer"
        >
            <div
                className={`relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isLCite ? 'ring-3 ring-green-500' : ''
                    }`}
            >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg
                        className="w-2/3 h-2/3 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>

                <div className="p-4 text-center">
                    <h3 className="font-merriweather text-gray-800 text-sm md:text-base font-medium truncate">
                        {formattedName}
                    </h3>
                    {isLCite && (
                        <p className="text-green-600 font-spectral text-xs mt-1 font-semibold">
                            LCite
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
