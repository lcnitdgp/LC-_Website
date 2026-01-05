import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Pencil, Check, X } from 'lucide-react';
import { db } from '../../firebase';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context';
import { EditableText } from '../common';

interface AboutContent {
    title: string;
    text: string;
    lastUpdatedBy?: string;
    lastUpdatedAt?: Date;
}

const defaultAboutText = siteConfig.about.join('\n\n');

export function AboutSection() {
    const { user } = useAuth();
    const [title, setTitle] = useState<string>("About Us");
    const [aboutText, setAboutText] = useState<string>(defaultAboutText);
    const [lastEditedBy, setLastEditedBy] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const canEdit = user !== null && user.admin === true;

    useEffect(() => {
        fetchAboutContent();
    }, []);

    const fetchAboutContent = async () => {
        try {
            const docRef = doc(db, 'SiteContent', 'about');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as AboutContent;
                if (data.text) {
                    setAboutText(data.text);
                }
                if (data.title) {
                    setTitle(data.title);
                }
                setLastEditedBy(data.lastUpdatedBy);
            }
        } catch (error) {
            console.error('Error fetching about content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setEditValue(aboutText);
        setIsEditing(true);
    };

    const handleSaveText = async () => {
        if (editValue.trim() === aboutText) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            const editorName = user?.name || user?.userId || 'unknown';
            const docRef = doc(db, 'SiteContent', 'about');
            const newContent = {
                title,
                text: editValue.trim(),
                lastUpdatedBy: editorName,
                lastUpdatedAt: new Date(),
            };
            await setDoc(docRef, newContent);
            setAboutText(editValue.trim());
            setLastEditedBy(editorName);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTitle = async (newTitle: string) => {
        const editorName = user?.name || user?.userId || 'unknown';
        const docRef = doc(db, 'SiteContent', 'about');
        const newContent = {
            title: newTitle,
            text: aboutText,
            lastUpdatedBy: editorName,
            lastUpdatedAt: new Date(),
        };
        await setDoc(docRef, newContent);
        setTitle(newTitle);
        setLastEditedBy(editorName);
    };

    const handleCancel = () => {
        setEditValue('');
        setIsEditing(false);
    };

    return (
        <section
            className="relative py-20 bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url('images/slider/91.jpg')`,
            }}
        >
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    {isLoading ? (
                        <h2 className="text-3xl md:text-4xl font-merriweather text-white">Loading...</h2>
                    ) : (
                        <EditableText
                            value={title}
                            onSave={handleSaveTitle}
                            canEdit={canEdit}
                            className="text-3xl md:text-4xl font-merriweather text-white"
                            lastEditedBy={lastEditedBy}
                        />
                    )}

                    {canEdit && !isEditing && (
                        <p className="text-sm text-primary-300 mt-2">
                            ✏️ You can edit all text sections here
                        </p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 relative"
                >
                    {isLoading ? (
                        <div className="text-white/60 text-center py-8">Loading...</div>
                    ) : isEditing ? (
                        <div>
                            <textarea
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                autoFocus
                                rows={12}
                                placeholder="Enter text here. Use blank lines to create paragraphs."
                                className="w-full p-4 bg-white/20 backdrop-blur-sm border-2 border-primary-400 rounded-lg text-white resize-y outline-none focus:border-primary-300 font-spectral text-lg leading-relaxed"
                                disabled={isSaving}
                            />
                            <p className="text-sm text-white/60 mt-2 mb-4">
                                💡 Tip: Press Enter twice to create a new paragraph
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="flex items-center gap-1 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveText}
                                    disabled={isSaving || !editValue.trim()}
                                    className="flex items-center gap-1 px-4 py-2 bg-green-500/80 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Check size={16} />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative group">
                            <div className="font-spectral text-white/90 text-lg leading-relaxed whitespace-pre-wrap">
                                {aboutText}
                            </div>

                            {lastEditedBy && canEdit && (
                                <p className="text-xs text-white/40 italic mt-4">
                                    (Last edited by - {lastEditedBy})
                                </p>
                            )}

                            {canEdit && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    animate={{ opacity: 1 }}
                                    onClick={handleEdit}
                                    className="absolute -top-2 -right-2 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit About section"
                                >
                                    <Pencil size={18} />
                                </motion.button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
