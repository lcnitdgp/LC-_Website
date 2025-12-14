import { motion } from 'framer-motion';
import { teamMembers } from '../../data/teamMembers';
import { TeamMemberCard } from './TeamMemberCard';

export function TeamSection() {
    const coreTeam = teamMembers.filter(m => m.year === 'Core');
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
                    <h2 className="text-3xl md:text-4xl font-merriweather text-gray-900">
                        Meet the LC Family!
                    </h2>
                </motion.div>

                <div className="mb-16">
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-xl font-cormorant text-gray-700 mb-6 flex items-center gap-4"
                    >
                        <span className="bg-primary-600 text-white px-4 py-1 rounded-full">
                            Core Team
                        </span>
                        <span className="flex-1 h-px bg-gray-300" />
                    </motion.h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {coreTeam.map((member, index) => (
                            <TeamMemberCard key={member.id} member={member} index={index} />
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
                            Third Year
                        </span>
                        <span className="flex-1 h-px bg-gray-300" />
                    </motion.h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {thirdYear.map((member, index) => (
                            <TeamMemberCard key={member.id} member={member} index={index} />
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
                            Second Year
                        </span>
                        <span className="flex-1 h-px bg-gray-300" />
                    </motion.h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {secondYear.map((member, index) => (
                            <TeamMemberCard key={member.id} member={member} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
