import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Edit2, Trash2, User } from 'lucide-react';
import type { TeamMemberFirestore } from '../../types/team';
import { useAuth } from '../../context';

interface TeamCardProps {
    member: TeamMemberFirestore;
    onEdit: (member: TeamMemberFirestore) => void;
    onDelete: (member: TeamMemberFirestore) => void;
}

const buildInstagramUrl = (handle?: string) => {
    if (!handle) return undefined;
    const sanitized = handle
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/\/$/, '')
        .replace(/^@/, '');
    return `https://www.instagram.com/${sanitized}`;
};

export function TeamCard({ member, onEdit, onDelete }: TeamCardProps) {
    const { user } = useAuth();
    const [showDetails, setShowDetails] = useState(false);
    const [imageError, setImageError] = useState(false);

    const canEdit = user && user.role !== 'student';
    const canDelete = user && user.role !== 'student' && user.role !== 'LCite';

    const instagramUrl = buildInstagramUrl(member.instagramUrl);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ring-2 ring-primary-400`}
            onClick={() => setShowDetails(!showDetails)}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                {!imageError && member.photoUrl ? (
                    <img
                        src={member.photoUrl}
                        alt={member.name}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                        <User size={64} />
                    </div>
                )}

                {(canEdit || canDelete) && (
                    <div className={`absolute top-3 right-3 z-20 flex gap-2 transition-opacity duration-200 ${showDetails ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {canEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                                className="p-1.5 md:p-2 bg-white/90 text-gray-600 hover:text-primary-600 rounded-full shadow-md hover:shadow-lg transition-all"
                                title="Edit Member"
                            >
                                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                                className="p-1.5 md:p-2 bg-white/90 text-red-500 hover:text-red-600 rounded-full shadow-md hover:shadow-lg transition-all"
                                title="Delete Member"
                            >
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                        )}
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-16 pb-4 px-4 text-center transition-all duration-300">
                    <div>
                        <h3 className="font-merriweather font-bold text-base md:text-lg text-white mb-0.5 shadow-black drop-shadow-md leading-tight w-full break-words">
                            {member.name}
                        </h3>
                        {member.post && (
                            <p className="text-primary-200 font-spectral text-[11px] md:text-xs line-clamp-3 w-full break-words leading-tight px-1">
                                {member.post}
                            </p>
                        )}
                    </div>
                </div>

                <div className={`absolute inset-0 flex items-center justify-center gap-4 z-10 transition-all duration-300 ${showDetails ? 'opacity-100 bg-black/40 backdrop-blur-sm pointer-events-auto' : 'opacity-0 group-hover:opacity-100 group-hover:bg-black/40 group-hover:backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto'}`}>
                    {member.facebookUrl && (
                        <a
                            href={member.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-white/20 rounded-full hover:bg-blue-600 text-white transition-colors backdrop-blur-sm transform hover:scale-110 shadow-lg"
                            title="Facebook Profile"
                        >
                            <Facebook size={24} className="w-6 h-6" />
                        </a>
                    )}

                    {instagramUrl && (
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-white/20 rounded-full hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 text-white transition-colors backdrop-blur-sm transform hover:scale-110 shadow-lg"
                            title="Instagram Profile"
                        >
                            <Instagram size={24} className="w-6 h-6" />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
