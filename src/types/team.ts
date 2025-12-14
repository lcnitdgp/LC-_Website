export interface SocialLinks {
    facebook?: string;
    instagram?: string; // Instagram username only
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    year: 'Final Year' | 'Third Year' | 'Second Year';
    image1: string;
    image2: string;
    social: SocialLinks;
}
