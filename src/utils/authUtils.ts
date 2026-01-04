export function extractUserId(email: string): string {
    const localPart = email.split('@')[0];
    const parts = localPart.split('.');

    if (parts.length >= 2) {
        return parts[1].toUpperCase();
    }
    return parts[0].toUpperCase();
}

export function isInstituteEmail(email: string): boolean {
    return email.toLowerCase().endsWith('nitdgp.ac.in');
}

export function generateEmail(name: string, registrationNumber: string, department: string): string {
    const nameParts = name.trim().split(/\s+/).filter(part => part.length > 0);
    const initials = nameParts.map(part => part.charAt(0).toLowerCase()).join('');

    if (department === 'Chemistry') {
        const regNo = registrationNumber.toLowerCase();
        return `${initials}.${regNo}@nitdgp.ac.in`;
    } else {
        const regNo = registrationNumber.toLowerCase();
        return `${initials}.${regNo}@btech.nitdgp.ac.in`;
    }
}
