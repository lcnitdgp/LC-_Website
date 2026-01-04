import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from './config';
import { teamMembers } from '../data/teamMembers';

export const migrateTeamMembersToFirestore = async () => {
    try {
        console.log('Starting team member migration...');
        const migrationDocRef = doc(db, 'System', 'migrations');
        const migrationDoc = await getDoc(migrationDocRef);

        if (migrationDoc.exists() && migrationDoc.data().teamMembersMigrated) {
            console.log('Team members already migrated.');
            return;
        }

        const batch = writeBatch(db);

        teamMembers.forEach(member => {
            const memberRef = doc(db, 'TeamMembers', member.id);
            batch.set(memberRef, {
                ...member,
                lastUpdatedBy: 'System Migration',
                lastUpdatedAt: new Date()
            });
        });

        // Mark migration as complete
        batch.set(migrationDocRef, { teamMembersMigrated: true }, { merge: true });

        await batch.commit();
        console.log('Team members migration completed successfully!');
    } catch (error) {
        console.error('Error migrating team members:', error);
    }
};
