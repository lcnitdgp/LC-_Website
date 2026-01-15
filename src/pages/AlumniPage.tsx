import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Users } from 'lucide-react';
import { Header, Footer } from '../components/layout';
import { SEO } from '../components/SEO';
import { AlumniCard, AlumniFormModal, AlumniDetailsModal } from '../components/alumni';
import { alumniService } from '../services/alumniService';
import { useAuth } from '../context';
import type { AlumniMember } from '../types/alumni';

export function AlumniPage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [alumniByYear, setAlumniByYear] = useState<Record<number, AlumniMember[]>>({});
    const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<AlumniMember | null>(null);
    const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null);
    const [selectedYearForAdd, setSelectedYearForAdd] = useState<number | undefined>(undefined);

    const canAdd = user && user.role !== 'student';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await alumniService.getAllAlumni();
            setAlumniByYear(data);

            const years = Object.keys(data).map(Number).sort((a, b) => b - a);
            if (years.length > 0) {
                setExpandedYears(prev => ({ ...prev, [years[0]]: true }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleYear = (year: number) => {
        setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    };

    const handleAddClick = () => {
        setEditingMember(null);
        setSelectedYearForAdd(undefined);
        setIsFormOpen(true);
    };

    const handleEditClick = (member: AlumniMember) => {
        setEditingMember(member);
        setIsFormOpen(true);
    };

    const handleDeleteClick = async (member: AlumniMember) => {
        if (!confirm(`Are you sure you want to delete ${member.name}? This action cannot be undone.`)) return;

        try {
            await alumniService.deleteAlumni(member.graduatingYear, member.id!);
            await fetchData(); // Refresh
        } catch (error) {
            alert("Failed to delete member.");
        }
    };

    const handleCardClick = (member: AlumniMember) => {
        setSelectedMember(member);
        setIsDetailsOpen(true);
    };

    const sortedYears = Object.keys(alumniByYear)
        .map(Number)
        .sort((a, b) => b - a);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <SEO
                title="Alumni - The Literary Circle"
                description="Meet the past members of The Literary Circle NIT Durgapur."
            />
            <Header />

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-merriweather font-bold text-gray-900 mb-4">
                                Our Alumni
                            </h1>
                            <p className="text-lg text-gray-600 font-spectral max-w-2xl">
                                A Hall of Fame for the Forebears of the Circle
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
                    ) : sortedYears.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <Users size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-xl">No alumni records found yet.</p>
                            {canAdd && <p className="mt-2 text-sm">Be the first to add one!</p>}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {sortedYears.map(year => {
                                const members = alumniByYear[year];
                                const isExpanded = expandedYears[year];

                                const sortedMembers = [...members].sort((a, b) => {
                                    if (a.isPresident && !b.isPresident) return -1;
                                    if (!a.isPresident && b.isPresident) return 1;
                                    return a.name.localeCompare(b.name);
                                });

                                return (
                                    <motion.div
                                        key={year}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleYear(year)}
                                            className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-xl font-merriweather">
                                                    '{year.toString().slice(-2)}
                                                </div>
                                                <div className="text-left">
                                                    <h2 className="text-xl font-bold text-gray-900">Class of {year}</h2>
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
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 pt-6">
                                                            {sortedMembers.map((member) => (
                                                                <AlumniCard
                                                                    key={member.id}
                                                                    member={member}
                                                                    onClick={handleCardClick}
                                                                    onEdit={handleEditClick}
                                                                    onDelete={handleDeleteClick}
                                                                />
                                                            ))}

                                                            {canAdd && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedYearForAdd(year);
                                                                        setIsFormOpen(true);
                                                                    }}
                                                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all group"
                                                                >
                                                                    <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-2 transition-colors">
                                                                        <Plus size={24} />
                                                                    </div>
                                                                    <span className="font-medium text-sm">Add to {year}</span>
                                                                </button>
                                                            )}
                                                        </div>
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

            <AlumniFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                editMember={editingMember}
                year={selectedYearForAdd}
                onSuccess={fetchData}
            />

            <AlumniDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                member={selectedMember}
            />
        </div>
    );
}
