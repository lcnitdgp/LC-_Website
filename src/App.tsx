import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context';
import { HomePage, AuditionsPage } from './pages';
import { migrateTeamMembersToFirestore } from './firebase/migrateTeam';

function App() {
  useEffect(() => {
    migrateTeamMembersToFirestore();
  }, []);

  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auditions" element={<AuditionsPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

