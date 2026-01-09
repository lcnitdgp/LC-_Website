import { useState } from 'react';
import { X, Building2, Hash, Phone, FileText, Mail, UserPlus, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { UserData } from '../../context/AuthContext';

interface MemberDetailsModalProps {
    member: UserData | null;
    isOpen: boolean;
    onClose: () => void;
    onRoleChange?: (userId: string, newRole: string) => void;
}

function formatName(name: string): string {
    if (!name) return 'Unknown';
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function FieldDisplay({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string | undefined }) {
    const displayValue = value?.trim() ? value : 'not set';
    const isEmpty = !value?.trim();

    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
            <Icon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-xs text-gray-500 font-spectral">{label}</p>
                <p className={`font-spectral ${isEmpty ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                    {displayValue}
                </p>
            </div>
        </div>
    );
}

export function MemberDetailsModal({ member, isOpen, onClose, onRoleChange }: MemberDetailsModalProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    if (!member) return null;

    const isLCite = member.role === 'LCite';
    const isStudent = member.role === 'student';
    const canChangeRole = isLCite || isStudent;
    const formattedName = formatName(member.name);

    const handleRoleChange = async () => {
        if (!member || isUpdating) return;

        setIsUpdating(true);
        const newRole = isStudent ? 'LCite' : 'student';

        try {
            await updateDoc(doc(db, 'Users', member.userId), {
                role: newRole
            });

            if (onRoleChange) {
                onRoleChange(member.userId, newRole);
            }

            onClose();
        } catch (error) {
            console.error('Error updating role:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`relative p-6 ${isLCite ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-primary-600 to-primary-700'}`}>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                                    <svg
                                        className="w-12 h-12 text-white"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-merriweather text-white text-center">
                                    {formattedName}
                                </h2>
                                {isLCite && (
                                    <span className="mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-sm font-spectral">
                                        LCite
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <FieldDisplay
                                icon={Building2}
                                label="Department"
                                value={member.department}
                            />
                            <FieldDisplay
                                icon={FileText}
                                label="Registration Number"
                                value={member.registrationNumber}
                            />
                            <FieldDisplay
                                icon={Phone}
                                label="Phone Number"
                                value={member.phoneNumber}
                            />
                            <FieldDisplay
                                icon={Hash}
                                label="Roll Number"
                                value={member.rollNumber}
                            />
                            <FieldDisplay
                                icon={Mail}
                                label="Email"
                                value={member.email}
                            />

                            {canChangeRole && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    {isStudent ? (
                                        <button
                                            onClick={handleRoleChange}
                                            disabled={isUpdating}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <UserPlus className="w-5 h-5" />
                                            {isUpdating ? 'Promoting...' : 'Promote to LCite'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleRoleChange}
                                            disabled={isUpdating}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <UserMinus className="w-5 h-5" />
                                            {isUpdating ? 'Removing...' : 'Kick from LC'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
