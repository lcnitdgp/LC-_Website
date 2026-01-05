import { Header, Footer } from '../components/layout';
import { HeroSection, AboutSection, TeamSection } from '../components/sections';

export function HomePage() {
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
