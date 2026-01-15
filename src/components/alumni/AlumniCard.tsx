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
}

export function AlumniCard({ member, onEdit, onDelete, onClick }: AlumniCardProps) {
    const { user } = useAuth();
    const isPresident = member.isPresident;
    const [showPhoneTooltip, setShowPhoneTooltip] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isStudent = !user || user.role === 'student';
    const canSeePhone = !isStudent;
    const canEdit = user && user.role !== 'student';
    const canDelete = user && user.admin === true;

    const handleCardClick = () => {
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
                    <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {canEdit && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                                className="p-2 bg-white/90 text-gray-600 hover:text-primary-600 rounded-full shadow-md hover:shadow-lg transition-all"
                                title="Edit Member"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(member); }}
                                className="p-2 bg-white/90 text-red-500 hover:text-red-600 rounded-full shadow-md hover:shadow-lg transition-all"
                                title="Delete Member"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                )}

                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 flex flex-col justify-end p-5 text-center"
                >
                    <div className="transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                        <h3 className="font-merriweather font-bold text-xl text-white mb-1 shadow-black drop-shadow-md">
                            {member.name}
                        </h3>

                        {member.workplace && (
                            <p className="text-primary-200 font-spectral text-sm mb-3 line-clamp-2">
                                {member.workplace}
                            </p>
                        )}

                        <div className="flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 pb-2">
                            {member.linkedinUrl && (
                                <a
                                    href={member.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 bg-white/20 rounded-full hover:bg-primary-600 text-white transition-colors backdrop-blur-sm"
                                    title="LinkedIn Profile"
                                >
                                    <Linkedin size={18} />
                                </a>
                            )}

                            {member.phoneNumber && (
                                <div
                                    className="relative"
                                    onMouseEnter={() => setShowPhoneTooltip(true)}
                                    onMouseLeave={() => setShowPhoneTooltip(false)}
                                >
                                    {canSeePhone ? (
                                        <a
                                            href={getWhatsAppLink(member.phoneNumber)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-2 bg-white/20 rounded-full hover:bg-green-500 text-white transition-colors backdrop-blur-sm block"
                                            aria-label="Contact on WhatsApp"
                                        >
                                            <FaWhatsapp size={18} />
                                        </a>
                                    ) : (
                                        <div className="p-2 bg-white/10 rounded-full text-white/50 cursor-not-allowed">
                                            <FaWhatsapp size={18} />
                                        </div>
                                    )}

                                    {canSeePhone && showPhoneTooltip && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 bg-black/90 text-white text-xs rounded-lg shadow-xl pointer-events-none z-50 text-center border border-white/10">
                                            <div className="font-bold text-green-400 mb-1">Click to WhatsApp</div>
                                            <div className="mb-1 opacity-90">{member.phoneNumber}</div>
                                            <div className="text-[10px] text-gray-400 italic">
                                                (Not on WhatsApp? Use this number to call)
                                            </div>
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                                        </div>
                                    )}

                                    {!canSeePhone && showPhoneTooltip && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 text-white text-xs rounded shadow-lg pointer-events-none z-50 text-center">
                                            Private Information! Alumni phone numbers are reserved for members of the Circle.
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
