import { motion, AnimatePresence } from 'framer-motion';
import { X, Linkedin, Phone, Building2, User, Info } from 'lucide-react';
import type { AlumniMember } from '../../types/alumni';

interface AlumniDetailsModalProps {
    member: AlumniMember | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AlumniDetailsModal({ member, isOpen, onClose }: AlumniDetailsModalProps) {
    if (!member) return null;

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Image/Gradient */}
                        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Image - Overlapping */}
                        <div className="px-8 -mt-16 flex justify-between items-end">
                            <div className="relative">
                                <div className={`w-32 h-32 rounded-xl overflow-hidden border-4 bg-white shadow-lg ${member.isPresident ? 'border-yellow-400' : 'border-white'
                                    }`}>
                                    {member.photoUrl ? (
                                        <img
                                            src={member.photoUrl}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <User size={48} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                {member.isPresident && (
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                                        President
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto">
                            <div className="mb-6">
                                <h2 className="text-2xl font-merriweather text-gray-900 font-bold">
                                    {member.name}
                                </h2>
                                <p className="text-primary-600 font-medium font-spectral text-lg">
                                    Class of {member.graduatingYear}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {member.workplace && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Building2 size={20} className="text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Current Role</p>
                                            <p className="font-medium">{member.workplace}</p>
                                        </div>
                                    </div>
                                )}

                                {member.linkedinUrl && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Linkedin size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">LinkedIn</p>
                                            <a
                                                href={member.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-600 hover:underline truncate block max-w-[250px]"
                                            >
                                                {member.linkedinUrl}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {member.phoneNumber && (
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Phone size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Contact</p>
                                            <p className="font-medium">{member.phoneNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Admin Metadata Section */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info size={16} className="text-gray-400" />
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                        Record Metadata
                                    </h3>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Added By:</span>
                                        <span className="font-medium text-gray-700">{member.addedBy || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Last Edited By:</span>
                                        <span className="font-medium text-gray-700">{member.editedBy || 'None'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Created On:</span>
                                        <span className="font-medium text-gray-700">{formatDate(member.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
