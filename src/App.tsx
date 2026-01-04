import { Header, Footer } from './components/layout';
import { HeroSection, AboutSection, TeamSection } from './components/sections';
import { AuthProvider } from './context';

function App() {
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
