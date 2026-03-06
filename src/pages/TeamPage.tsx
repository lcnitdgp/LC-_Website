import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Users } from 'lucide-react';
import { Header, Footer } from '../components/layout';
import { SEO } from '../components/SEO';
import { TeamCard, TeamFormModal } from '../components/team';
import { teamService } from '../services/teamService';
import { useAuth } from '../context';
import type { TeamMemberFirestore, YearGroup } from '../types/team';

const YEAR_GROUPS: YearGroup[] = ['Final Years', 'Third Years', 'Second Years'];

const GROUP_COLORS: Record<YearGroup, string> = {
    'Final Years': 'bg-primary-600',
    'Third Years': 'bg-gray-600',
    'Second Years': 'bg-gray-500'
};

export function TeamPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [membersByGroup, setMembersByGroup] = useState<Record<string, TeamMemberFirestore[]>>({});
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Final Years': true,
        'Third Years': true,
        'Second Years': true
    });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMemberFirestore | null>(null);
    const [selectedGroupForAdd, setSelectedGroupForAdd] = useState<YearGroup | undefined>(undefined);

    const canAdd = user && user.role !== 'student';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await teamService.getAllTeamMembers();
            setMembersByGroup(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const handleAddClick = () => {
        setEditingMember(null);
        setSelectedGroupForAdd(undefined);
        setIsFormOpen(true);
    };

    const handleEditClick = (member: TeamMemberFirestore) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleDeleteClick = async (member: TeamMemberFirestore) => {
        if (!confirm(`Are you sure you want to delete ${member.name}? This action cannot be undone.`)) return;

        try {
            await teamService.deleteTeamMember(member.yearGroup, member.id!);
            await fetchData();
        } catch (error) {
            alert("Failed to delete member.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <SEO
                title="Our Team - The Literary Circle"
                description="Meet the current members of The Literary Circle NIT Durgapur."
            />
            <Header />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-merriweather font-bold text-gray-900 mb-4">
                                Our Team
                            </h1>
                            <p className="text-lg text-gray-600 font-spectral max-w-2xl">
                                Meet the LC Family!
                            </p>
                        </motion.div>

                        {canAdd && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleAddClick}
                                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                            >
                                <Plus size={20} />
                                Add Member
                            </motion.button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {YEAR_GROUPS.map(group => {
                                const members = membersByGroup[group] || [];
                                const isExpanded = expandedGroups[group];

                                const FINAL_YEAR_ORDER = [
                                    'President',
                                    'General Secretary',
                                    'Vice President',
                                    'Treasurer',
                                    'Convenor',
                                    'Tech Head',
                                    'Assistant General Secretary',
                                    'Yearbook Coordinator',
                                    'Design Head',
                                    'Media Head',
                                    'Operations Head'
                                ];

                                const sortedMembers = [...members].sort((a, b) => {
                                    if (group === 'Final Years') {
                                        const aIdx = FINAL_YEAR_ORDER.indexOf(a.post || '');
                                        const bIdx = FINAL_YEAR_ORDER.indexOf(b.post || '');
                                        const aRank = aIdx === -1 ? FINAL_YEAR_ORDER.length : aIdx;
                                        const bRank = bIdx === -1 ? FINAL_YEAR_ORDER.length : bIdx;
                                        return aRank - bRank;
                                    }
                                    return a.name.localeCompare(b.name);
                                });

                                return (
                                    <motion.div
                                        key={group}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleGroup(group)}
                                            className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl ${GROUP_COLORS[group]} flex items-center justify-center`}>
                                                    <Users size={22} className="text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <h2 className="text-xl font-bold text-gray-900">{group}</h2>
                                                    <p className="text-sm text-gray-500">{members.length} Members</p>
                                                </div>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="text-gray-400" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 pt-0 border-t border-gray-100">
                                                        {sortedMembers.length === 0 && !canAdd ? (
                                                            <div className="text-center py-10 text-gray-400">
                                                                <Users size={40} className="mx-auto mb-3 opacity-30" />
                                                                <p>No members added yet.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-6 pt-6">
                                                                {sortedMembers.map((member) => (
                                                                    <TeamCard
                                                                        key={member.id}
                                                                        member={member}
                                                                        onEdit={handleEditClick}
                                                                        onDelete={handleDeleteClick}
                                                                    />
                                                                ))}

                                                                {canAdd && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedGroupForAdd(group);
                                                                            setEditingMember(null);
                                                                            setIsFormOpen(true);
                                                                        }}
                                                                        className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all group"
                                                                    >
                                                                        <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                                                                            <Plus size={24} />
                                                                        </div>
                                                                        <span className="font-medium text-sm">Add to {group}</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            <TeamFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                editMember={editingMember}
                yearGroup={selectedGroupForAdd}
                onSuccess={fetchData}
            />
        </div>
    );
}
