import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Pencil, Check, X } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../context';

interface HeroContent {
    line1: string;
    line2: string;
    tagline: string;
    lastEditedBy?: string;
}

const defaultContent: HeroContent = {
    line1: "We are",
    line2: "The Literary Circle",
    tagline: "Welcome to Our Page!",
};

export function HeroSection() {
    const { user } = useAuth();
    const [content, setContent] = useState<HeroContent>(defaultContent);
    const [editField, setEditField] = useState<keyof HeroContent | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const canEdit = user !== null && user.admin === true;

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const docRef = doc(db, 'SiteContent', 'hero');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as HeroContent;
                setContent({
                    line1: data.line1 || defaultContent.line1,
                    line2: data.line2 || defaultContent.line2,
                    tagline: data.tagline || defaultContent.tagline,
                    lastEditedBy: data.lastEditedBy,
                });
            }
        } catch (error) {
            console.error('Error fetching hero content:', error);
        }
    };

    const handleEdit = (field: keyof HeroContent) => {
        setEditField(field);
        setEditValue(content[field] || '');
    };

    const handleSave = async () => {
        if (!editField || editValue.trim() === content[editField]) {
            setEditField(null);
            return;
        }

        setIsSaving(true);
        try {
            const newContent = {
                ...content,
                [editField]: editValue.trim(),
                lastEditedBy: user?.name || user?.userId || 'Unknown'
            };
            await setDoc(doc(db, 'SiteContent', 'hero'), newContent);
            setContent(newContent);
            setEditField(null);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditField(null);
        setEditValue('');
    };

    const renderEditableText = (field: keyof HeroContent, text: string, className: string) => {
        if (editField === field) {
            return (
                <div className="relative inline-block w-full">
                    <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        autoFocus
                        className={`bg-white/20 backdrop-blur-sm border-2 border-primary-400 rounded-lg px-4 py-2 outline-none focus:border-primary-300 text-center w-full ${className}`}
                        disabled={isSaving}
                        onKeyDown={e => {
                            if (e.key === 'Escape') handleCancel();
                            if (e.key === 'Enter') handleSave();
                        }}
                    />
                    <div className="flex gap-2 mt-2 justify-center">
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="p-2 bg-green-500/80 hover:bg-green-600 text-white rounded-full transition-colors"
                        >
                            <Check size={16} />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <span className="relative group inline-block">
                {text}
                {canEdit && (
                    <button
                        onClick={() => handleEdit(field)}
                        className="absolute -top-2 -right-8 p-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Edit"
                    >
                        <Pencil size={12} />
                    </button>
                )}
            </span>
        );
    };

    return (
        <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('images/slider/a8.jpg')`,
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-cormorant text-white leading-tight">
                        <motion.span
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            className="block"
                        >
                            {renderEditableText('line1', content.line1, 'text-5xl md:text-7xl lg:text-8xl font-cormorant text-white')}
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            className="block text-primary-300 italic"
                        >
                            {renderEditableText('line2', content.line2, 'text-5xl md:text-7xl lg:text-8xl font-cormorant text-primary-300 italic')}
                        </motion.span>
                    </h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="text-xl md:text-2xl font-spectral text-gray-200 mt-8"
                    >
                        {renderEditableText('tagline', content.tagline, 'text-xl md:text-2xl font-spectral text-gray-200')}
                    </motion.div>

                    {canEdit && content.lastEditedBy && (
                        <p className="text-xs text-white/40 italic">
                            (Last edited by - {content.lastEditedBy})
                        </p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </header>
    );
}
