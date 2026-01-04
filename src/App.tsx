import { useEffect } from 'react';
import { Header, Footer } from './components/layout';
import { HeroSection, AboutSection, TeamSection } from './components/sections';
import { AuthProvider } from './context';
import { migrateTeamMembersToFirestore } from './firebase/migrateTeam';

function App() {
  useEffect(() => {
    // Run migration once on mount
    migrateTeamMembersToFirestore();
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <TeamSection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
