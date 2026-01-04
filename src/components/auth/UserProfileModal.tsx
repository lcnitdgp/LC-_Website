import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Hash, FileText, GraduationCap, Key, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../context';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEPARTMENTS = [
    'Biotechnology',
    'Chemical',
    'Chemistry',
    'Civil',
    'Computer Science',
    'Electronics and Communication',
    'Electrical',
    'Mathematics and Computing',
    'Mechanical',
    'Metallurgy',
] as const;

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    const { user, updateUser, logout } = useAuth();
    const [formData, setFormData] = useState({
        rollNumber: '',
        registrationNumber: '',
        department: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                rollNumber: user.rollNumber || '',
                registrationNumber: user.registrationNumber || '',
                department: user.department || '',
                password: '',
            });
        }
    }, [user, isOpen]);

    const handleInputChange = (field: string, value: string) => {
        if (field === 'rollNumber' || field === 'registrationNumber') {
            value = value.toUpperCase();
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        setMessage(null);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        setMessage(null);

        const updateData: Record<string, string> = {
            rollNumber: formData.rollNumber,
            registrationNumber: formData.registrationNumber,
            department: formData.department,
        };

        if (formData.password.trim()) {
            updateData.password = formData.password;
        }

        const result = await updateUser(updateData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setFormData(prev => ({ ...prev, password: '' }));
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
        }

        setIsSubmitting(false);
    };

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    const handleClose = () => {
        setMessage(null);
        setFormData(prev => ({ ...prev, password: '' }));
        onClose();
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative w-full max-w-md bg-gradient-to-br from-white via-gray-50 to-primary-50 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700" />

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                                    <User className="w-8 h-8 text-primary-600" />
                                </div>
                                <h2 className="text-2xl font-cormorant font-semibold text-gray-800">
                                    Your Profile
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User ID</p>
                                    <p className="font-semibold text-gray-800">{user.userId}</p>
                                </div>

                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                </div>

                                <div className="bg-gray-100 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                                    <p className="font-semibold text-gray-800 break-all">{user.email}</p>
                                </div>

                                <div className="border-t border-gray-200 my-4 pt-4">
                                    <p className="text-sm text-gray-600 mb-4 font-spectral">Editable Information</p>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Hash className="w-4 h-4 mr-2 text-primary-500" />
                                        Roll Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.rollNumber}
                                        onChange={e => handleInputChange('rollNumber', e.target.value)}
                                        placeholder="Enter roll number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <FileText className="w-4 h-4 mr-2 text-primary-500" />
                                        Registration Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.registrationNumber}
                                        onChange={e => handleInputChange('registrationNumber', e.target.value)}
                                        placeholder="Enter registration number"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral uppercase"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <GraduationCap className="w-4 h-4 mr-2 text-primary-500" />
                                        Department
                                    </label>
                                    <select
                                        value={formData.department}
                                        onChange={e => handleInputChange('department', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral appearance-none cursor-pointer"
                                    >
                                        <option value="">Select department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Key className="w-4 h-4 mr-2 text-primary-500" />
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => handleInputChange('password', e.target.value)}
                                        placeholder="Leave blank to keep current password"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 font-spectral"
                                    />
                                </div>

                                {message && (
                                    <div className={`text-sm text-center py-2 rounded-lg ${message.type === 'success' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
