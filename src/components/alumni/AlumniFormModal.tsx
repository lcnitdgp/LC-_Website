import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AlumniMember } from '../../types/alumni';
import { alumniService } from '../../services/alumniService';
import { useAuth } from '../../context';

interface AlumniFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editMember?: AlumniMember | null;
    year?: number;
    onSuccess: () => void;
}

export function AlumniFormModal({ isOpen, onClose, editMember, year, onSuccess }: AlumniFormModalProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [driveWarning, setDriveWarning] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        graduatingYear: year || 2025,
        linkedinUrl: '',
        workplace: '',
        phoneNumber: '',
        photoUrl: '',
        isPresident: false
    });

    useEffect(() => {
        if (editMember) {
            setFormData({
                name: editMember.name,
                graduatingYear: editMember.graduatingYear,
                linkedinUrl: editMember.linkedinUrl || '',
                workplace: editMember.workplace || '',
                phoneNumber: editMember.phoneNumber || '',
                photoUrl: editMember.photoUrl || '',
                isPresident: editMember.isPresident
            });
        } else {
            setFormData({
                name: '',
                graduatingYear: year || 2025,
                linkedinUrl: '',
                workplace: '',
                phoneNumber: '',
                photoUrl: '',
                isPresident: false
            });
        }
        setDriveWarning(null);
    }, [editMember, year, isOpen]);

    const handlePhotoUrlChange = (url: string) => {
        setFormData(prev => ({ ...prev, photoUrl: url }));
        setDriveWarning(null);
        setError(null);

        if (!url) return;

        if (!url.includes('drive.google.com')) {
            setDriveWarning("Please upload a Google Drive link.");
            return;
        }

        if (url.includes('/folders/')) {
            setDriveWarning("This appears to be a Drive Folder link. Please use a link to a specific image file.");
            return;
        }

        const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!fileIdMatch) {
            setDriveWarning("This doesn't look like a valid file link. Please ensure it's a specific file URL.");
            return;
        }

        const fileId = fileIdMatch[1];

        const newUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;

        if (url !== newUrl) {
            setFormData(prev => ({ ...prev, photoUrl: newUrl }));
            setDriveWarning("IMPORTANT: Please ensure the file permission in Drive is set to 'Anyone with the link'.");
        } else {
            setDriveWarning("IMPORTANT: Please ensure the file permission in Drive is set to 'Anyone with the link'.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!user) throw new Error("You must be logged in.");

            if (driveWarning && driveWarning.includes('Folder')) {
                throw new Error("Cannot save with a Folder link.");
            }

            const dataToSave = {
                ...formData,
                graduatingYear: Number(formData.graduatingYear)
            };

            if (editMember && editMember.id) {
                await alumniService.updateAlumni(
                    editMember.graduatingYear,
                    editMember.id,
                    dataToSave,
                    user.name || user.userId
                );
            } else {
                await alumniService.addAlumni(
                    dataToSave.graduatingYear,
                    {
                        ...dataToSave,
                        addedBy: user.name || user.userId,
                        editedBy: 'none'
                    }
                );
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to save alumni details.");
        } finally {
            setIsSubmitting(false);
        }
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
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-merriweather font-bold text-gray-800">
                                {editMember ? 'Edit Alumni' : 'Add New Alumni'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <form id="alumni-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Graduating Year *</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.graduatingYear}
                                            onChange={e => setFormData({ ...formData, graduatingYear: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            placeholder="2025"
                                            disabled={!!editMember}
                                        />
                                        {editMember && <p className="text-xs text-gray-400 mt-1">Year cannot be changed</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Workplace / College</label>
                                    <input
                                        type="text"
                                        value={formData.workplace}
                                        onChange={e => setFormData({ ...formData, workplace: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Current Company/College name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        value={formData.linkedinUrl}
                                        onChange={e => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="+91 ...."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.photoUrl}
                                            onChange={e => handlePhotoUrlChange(e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${driveWarning && driveWarning.includes('Folder') ? 'border-red-300 focus:ring-red-200 bg-red-50' :
                                                driveWarning && driveWarning.includes('IMPORTANT') ? 'border-green-300 focus:ring-green-200 bg-green-50' :
                                                    'border-gray-300 focus:ring-primary-500'
                                                }`}
                                            placeholder="Google Drive Link of the Image."
                                        />
                                    </div>

                                    {driveWarning && (
                                        <div className={`mt-2 text-xs flex items-start gap-1.5 ${driveWarning.includes('IMPORTANT') ? 'text-green-600' : 'text-amber-600'
                                            }`}>
                                            {driveWarning.includes('IMPORTANT') ? (
                                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                            ) : (
                                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                            )}
                                            <span>{driveWarning}</span>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500 mt-1">
                                        Only Google Drive links are supported.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isPresident"
                                        checked={formData.isPresident}
                                        onChange={e => setFormData({ ...formData, isPresident: e.target.checked })}
                                        className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                                    />
                                    <label htmlFor="isPresident" className="text-sm font-medium text-gray-900 cursor-pointer select-none">
                                        Mark as President (Batch Representative)
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="alumni-form"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Member
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
