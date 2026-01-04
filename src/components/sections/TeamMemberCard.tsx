import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram } from 'lucide-react';
import type { TeamMember } from '../../types/team';

interface TeamMemberCardProps {
    member: TeamMember;
    index: number;
}

const buildInstagramUrl = (handle?: string) => {
    if (!handle) return undefined;

    const sanitizedHandle = handle
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/\/$/, '')
        .replace(/^@/, '');

    return `https://www.instagram.com/${sanitizedHandle}`;
};

export function TeamMemberCard({ member, index }: TeamMemberCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const instagramUrl = buildInstagramUrl(member.social.instagram);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer">
                <img
                    src={member.image1}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: isHovered ? 0 : 1 }}
                />

                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                >
                    <img
                        src={member.image2}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover -z-10"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <div className="mb-1 w-full flex justify-center">
                            <h3 className="text-white font-merriweather text-lg md:text-xl">
                                {member.name}
                            </h3>
                        </div>

                        <div className="mb-4 w-full flex justify-center">
                            <p className="text-primary-300 font-spectral text-sm">
                                {member.role}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {member.social.facebook && (
                                <a
                                    href={member.social.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white/20 rounded-full hover:bg-primary-600 transition-colors duration-200"
                                    aria-label={`${member.name}'s Facebook`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Facebook size={18} className="text-white" />
                                </a>
                            )}
                            {instagramUrl && (
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white/20 rounded-full hover:bg-primary-600 transition-colors duration-200"
                                    aria-label={`${member.name}'s Instagram`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Instagram size={18} className="text-white" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
