import { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Edit2, Trash2, User } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import type { AlumniMember } from '../../types/alumni';
import { useAuth } from '../../context';

interface AlumniCardProps {
    member: AlumniMember;
    onEdit: (member: AlumniMember) => void;
    onDelete: (member: AlumniMember) => void;
    onClick: (member: AlumniMember) => void;
    onShowPrivacyAlert: () => void;
}

export function AlumniCard({ member, onEdit, onDelete, onClick, onShowPrivacyAlert }: AlumniCardProps) {
    const { user } = useAuth();
    const isPresident = member.isPresident;
    const [showDetails, setShowDetails] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isStudent = !user || user.role === 'student';
    const canSeePhone = !isStudent;
    const canEdit = user && user.role !== 'student';
    const canDelete = user && user.admin === true;

    const handleCardClick = () => {
        setShowDetails(!showDetails);

        if (user?.admin) {
            onClick(member);
        }
    };

    const getWhatsAppLink = (phone: string) => {
        const digits = phone.replace(/\D/g, '');
        return `https://wa.me/${digits}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${isPresident ? 'ring-2 ring-yellow-400' : 'ring-2 ring-green-500'
                }`}
            onClick={handleCardClick}

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

                {isPresident && (
                    <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg z-10 uppercase tracking-wide">
                        President
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

                <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-16 pb-4 px-4 text-center transition-all duration-300"
                >
                    <div>
                        <h3 className="font-merriweather font-bold text-base md:text-lg text-white mb-0.5 shadow-black drop-shadow-md leading-tight">
                            {member.name}
                        </h3>

                        {member.workplace && (
                            <p className="text-primary-200 font-spectral text-[11px] md:text-xs line-clamp-1">
                                {member.workplace}
                            </p>
                        )}
                    </div>
                </div>

                <div className={`absolute inset-0 flex items-center justify-center gap-4 z-10 transition-all duration-300 ${showDetails ? 'opacity-100 bg-black/40 backdrop-blur-sm pointer-events-auto' : 'opacity-0 group-hover:opacity-100 group-hover:bg-black/40 group-hover:backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto'}`}>
                    {member.linkedinUrl && (
                        <a
                            href={member.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 bg-white/20 rounded-full hover:bg-primary-600 text-white transition-colors backdrop-blur-sm transform hover:scale-110 shadow-lg"
                            title="LinkedIn Profile"
                        >
                            <Linkedin size={24} className="w-6 h-6" />
                        </a>
                    )}

                    {member.phoneNumber && (
                        <div className="relative">
                            {canSeePhone ? (
                                <a
                                    href={getWhatsAppLink(member.phoneNumber)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-3 bg-white/20 rounded-full hover:bg-green-500 text-white transition-colors backdrop-blur-sm block transform hover:scale-110 shadow-lg"
                                    aria-label="Contact on WhatsApp"
                                >
                                    <FaWhatsapp size={24} className="w-6 h-6" />
                                </a>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onShowPrivacyAlert();
                                    }}
                                    className="p-3 bg-white/10 rounded-full text-white/50 hover:bg-white/20 hover:text-white transition-colors backdrop-blur-sm block transform hover:scale-110 shadow-lg cursor-pointer"
                                    title="Private Information"
                                >
                                    <FaWhatsapp size={24} className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
