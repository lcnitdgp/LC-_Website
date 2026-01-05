import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context';
import { EditableText } from '../common';
import { TeamMemberCard } from './TeamMemberCard';
import { teamMembers as defaultMembers } from '../../data/teamMembers';
import type { TeamMember } from '../../types/team';

interface TeamContent {
    title: string;
    finalYearLabel: string;
    thirdYearLabel: string;
    secondYearLabel: string;
    lastUpdatedBy?: string;
}

const defaultContent: TeamContent = {
    title: "Meet the LC Family!",
    finalYearLabel: "Final Year",
    thirdYearLabel: "Third Year",
    secondYearLabel: "Second Year",
};

export function TeamSection() {
    const { user } = useAuth();
    const [content, setContent] = useState<TeamContent>(defaultContent);
    const [isLoading, setIsLoading] = useState(true);
    // User requested to revert to local only for team members
    const teamMembers: TeamMember[] = defaultMembers;

    const canEdit = user !== null && user.admin === true;

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const docRef = doc(db, 'SiteContent', 'team');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as TeamContent;
                setContent({
                    title: data.title || defaultContent.title,
                    finalYearLabel: data.finalYearLabel || defaultContent.finalYearLabel,
                    thirdYearLabel: data.thirdYearLabel || defaultContent.thirdYearLabel,
                    secondYearLabel: data.secondYearLabel || defaultContent.secondYearLabel,
                    lastUpdatedBy: data.lastUpdatedBy,
                });
            }
        } catch (error) {
            console.error('Error fetching team content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveTitle = async (field: keyof TeamContent, newValue: string) => {
        const editorName = user?.name || user?.userId || 'unknown';
        const newContent = {
            ...content,
            [field]: newValue,
            lastUpdatedBy: editorName
        };
        await setDoc(doc(db, 'SiteContent', 'team'), newContent);
        setContent(newContent);
    };

    const finalYear = teamMembers.filter(m => m.year === 'Final Year');
    const thirdYear = teamMembers.filter(m => m.year === 'Third Year');
    const secondYear = teamMembers.filter(m => m.year === 'Second Year');

    return (
        <section
            className="relative py-20 bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url('images/slider/201.jpg')`,
            }}
        >
            <div className="absolute inset-0 bg-white/80" />

            <div className="relative z-10 max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    {isLoading ? (
                        <h2 className="text-3xl md:text-4xl font-merriweather text-gray-900">Loading...</h2>
                    ) : (
                        <EditableText
                            value={content.title}
                            onSave={(val) => handleSaveTitle('title', val)}
                            canEdit={canEdit}
                            className="text-3xl md:text-4xl font-merriweather text-gray-900"
                            lastEditedBy={content.lastUpdatedBy}
                        />
                    )}
                </motion.div>

                <div className="mb-16">
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-xl font-cormorant text-gray-700 mb-6 flex items-center gap-4"
                    >
                        <span className="bg-primary-600 text-white px-4 py-1 rounded-full">
                            {isLoading ? "Loading..." : (
                                <EditableText
                                    value={content.finalYearLabel}
                                    onSave={(val) => handleSaveTitle('finalYearLabel', val)}
                                    canEdit={canEdit}
                                    showLastEdited={true}
                                    className="inline-block"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            )}
                        </span>
                        <span className="flex-1 h-px bg-gray-300" />
                    </motion.h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {finalYear.map((member, index) => (
                            <TeamMemberCard
                                key={member.id}
                                member={member}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                <div className="mb-16">
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-xl font-cormorant text-gray-700 mb-6 flex items-center gap-4"
                    >
                        <span className="bg-gray-600 text-white px-4 py-1 rounded-full">
                            {isLoading ? "Loading..." : (
                                <EditableText
                                    value={content.thirdYearLabel}
                                    onSave={(val) => handleSaveTitle('thirdYearLabel', val)}
                                    canEdit={canEdit}
                                    showLastEdited={true}
                                    className="inline-block"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            )}
                        </span>
                        <span className="flex-1 h-px bg-gray-300" />
                    </motion.h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {thirdYear.map((member, index) => (
                            <TeamMemberCard
                                key={member.id}
                                member={member}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-xl font-cormorant text-gray-700 mb-6 flex items-center gap-4"
                    >
                        <span className="bg-gray-500 text-white px-4 py-1 rounded-full">
                            {isLoading ? "Loading..." : (
                                <EditableText
                                    value={content.secondYearLabel}
                                    onSave={(val) => handleSaveTitle('secondYearLabel', val)}
                                    canEdit={canEdit}
                                    showLastEdited={true}
                                    className="inline-block"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            )}
                        </span>
                        <span className="flex-1 h-px bg-gray-300" />
                    </motion.h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {secondYear.map((member, index) => (
                            <TeamMemberCard
                                key={member.id}
                                member={member}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
