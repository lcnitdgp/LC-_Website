import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context';
import { HomePage, AuditionsPage, MembersDashboardPage, DejaVuPage, AlumniPage, MaintenancePage } from './pages';
import { migrateTeamMembersToFirestore } from './firebase/migrateTeam';

const MAINTENANCE_MODE = true;

function App() {
  useEffect(() => {
    migrateTeamMembersToFirestore();
  }, []);

  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auditions" element={<AuditionsPage />} />
          <Route path="/dejavu" element={<DejaVuPage />} />
          <Route path="/members" element={<MembersDashboardPage />} />
          <Route path="/alumni" element={<AlumniPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

