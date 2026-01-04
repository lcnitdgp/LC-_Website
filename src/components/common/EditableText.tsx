import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, X } from 'lucide-react';

interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => Promise<void>;
    canEdit: boolean;
    className?: string;
    lastEditedBy?: string;
    showLastEdited?: boolean;
}

export function EditableText({
    value,
    onSave,
    canEdit,
    className = '',
    lastEditedBy,
    showLastEdited = true
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSave = async () => {
        if (editValue.trim() === value) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(editValue.trim());
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div className="relative">
                <textarea
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className={`w-full min-h-[80px] p-4 bg-white/20 backdrop-blur-sm border-2 border-primary-400 rounded-lg text-white resize-y outline-none focus:border-primary-300 ${className}`}
                    disabled={isSaving}
                />
                <div className="flex gap-2 mt-3 justify-end">
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={16} />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !editValue.trim()}
                        className="flex items-center gap-1 px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Check size={16} />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <p className={`whitespace-pre-wrap ${className}`}>{value}</p>

            {showLastEdited && lastEditedBy && canEdit && (
                <span className="text-xs text-white/40 italic mt-1 block">
                    (Last edited by - {lastEditedBy})
                </span>
            )}

            {canEdit && isHovered && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setIsEditing(true)}
                    className="absolute -top-2 -right-2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors z-10"
                    title="Edit this text"
                >
                    <Pencil size={14} />
                </motion.button>
            )}
        </div>
    );
}
