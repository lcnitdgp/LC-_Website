import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query
} from 'firebase/firestore';
import { db } from '../firebase';
import type { AlumniMember } from '../types/alumni';

export const alumniService = {
    getAllAlumni: async (): Promise<Record<number, AlumniMember[]>> => {
        const alumniByYear: Record<number, AlumniMember[]> = {};

        try {
            const alumniRef = collection(db, 'alumni');
            const yearDocs = await getDocs(alumniRef);

            for (const yearDoc of yearDocs.docs) {
                const year = parseInt(yearDoc.id);
                if (isNaN(year)) continue;

                const membersRef = collection(db, `alumni/${yearDoc.id}/members`);
                const q = query(membersRef);
                const snapshot = await getDocs(q);

                const members = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as AlumniMember));

                if (members.length > 0) {
                    alumniByYear[year] = members;
                }
            }

            return alumniByYear;
        } catch (error) {
            console.error('Error fetching alumni:', error);
            throw error;
        }
    },

    addAlumni: async (year: number, data: Omit<AlumniMember, 'id' | 'createdAt'>) => {
        try {
            const membersRef = collection(db, `alumni/${year}/members`);

            // Ensure parent doc exists logic if needed, but subcollection writes are independent in Firestore
            const yearDocRef = doc(db, 'alumni', year.toString());
            // We use a dynamic import for setDoc if we want to be safe about circular deps, 
            // but standard import is fine here if available. 
            // To keep it simple and avoid import errors, we can skip forcing the parent doc 
            // creation if we trust the loop in getAllAlumni handles it (it iterates existing docs).
            // BUT getAllAlumni iterates `yearDocs`. If `yearDoc` doesn't exist, it won't find the subcollection.
            // So we MUST create the year doc.

            const { setDoc } = await import('firebase/firestore');
            await setDoc(yearDocRef, { hasMembers: true }, { merge: true });

            await addDoc(membersRef, {
                ...data,
                createdAt: Date.now()
            });

        } catch (error) {
            console.error('Error adding alumni:', error);
            throw error;
        }
    },

    updateAlumni: async (year: number, id: string, data: Partial<AlumniMember>, editorName: string) => {
        try {
            const docRef = doc(db, `alumni/${year}/members`, id);
            await updateDoc(docRef, {
                ...data,
                editedBy: editorName
            });
        } catch (error) {
            console.error('Error updating alumni:', error);
            throw error;
        }
    },

    deleteAlumni: async (year: number, id: string) => {
        try {
            const docRef = doc(db, `alumni/${year}/members`, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting alumni:', error);
            throw error;
        }
    }
};
