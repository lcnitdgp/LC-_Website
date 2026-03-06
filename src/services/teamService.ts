import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query
} from 'firebase/firestore';
import { db } from '../firebase';
import type { TeamMemberFirestore, YearGroup } from '../types/team';

const YEAR_GROUPS: YearGroup[] = ['Final Years', 'Third Years', 'Second Years'];

export const teamService = {
    getAllTeamMembers: async (): Promise<Record<string, TeamMemberFirestore[]>> => {
        const membersByGroup: Record<string, TeamMemberFirestore[]> = {};

        try {
            for (const group of YEAR_GROUPS) {
                const membersRef = collection(db, `team_members/${group}/members`);
                const q = query(membersRef);
                const snapshot = await getDocs(q);

                const members = snapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                } as TeamMemberFirestore));

                if (members.length > 0) {
                    membersByGroup[group] = members;
                }
            }

            return membersByGroup;
        } catch (error) {
            console.error('Error fetching team members:', error);
            throw error;
        }
    },

    addTeamMember: async (yearGroup: YearGroup, data: Omit<TeamMemberFirestore, 'id' | 'createdAt'>) => {
        try {
            const membersRef = collection(db, `team_members/${yearGroup}/members`);

            const yearDocRef = doc(db, 'team_members', yearGroup);
            await setDoc(yearDocRef, { hasMembers: true }, { merge: true });

            await addDoc(membersRef, {
                ...data,
                createdAt: Date.now()
            });
        } catch (error) {
            console.error('Error adding team member:', error);
            throw error;
        }
    },

    updateTeamMember: async (yearGroup: YearGroup, id: string, data: Partial<TeamMemberFirestore>, editorName: string) => {
        try {
            const docRef = doc(db, `team_members/${yearGroup}/members`, id);
            await updateDoc(docRef, {
                ...data,
                editedBy: editorName
            });
        } catch (error) {
            console.error('Error updating team member:', error);
            throw error;
        }
    },

    deleteTeamMember: async (yearGroup: YearGroup, id: string) => {
        try {
            const docRef = doc(db, `team_members/${yearGroup}/members`, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting team member:', error);
            throw error;
        }
    }
};
