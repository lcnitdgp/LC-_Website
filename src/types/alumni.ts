export interface AlumniMember {
    id?: string;
    name: string;
    graduatingYear: number;
    linkedinUrl?: string;
    workplace?: string;
    phoneNumber?: string;
    photoUrl?: string;
    isPresident: boolean;
    createdAt: number;
    addedBy: string;
    editedBy: string | 'none';
}
