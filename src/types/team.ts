export interface SocialLinks {
    facebook?: string;
    instagram?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    year: 'Final Year' | 'Third Year' | 'Second Year';
    image1: string;
    image2: string;
    social: SocialLinks;
    lastUpdatedBy?: string;
}

export type YearGroup = 'Final Years' | 'Third Years' | 'Second Years';

export interface TeamMemberFirestore {
    id?: string;
    name: string;
    yearGroup: YearGroup;
    facebookUrl?: string;
    instagramUrl?: string;
    post?: string;
    photoUrl?: string;
    createdAt: number;
    addedBy: string;
    editedBy: string | 'none';
}
