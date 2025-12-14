import { Header, Footer } from './components/layout';
import { HeroSection, AboutSection, TeamSection } from './components/sections';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
