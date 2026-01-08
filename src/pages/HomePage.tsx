import { Header, Footer } from '../components/layout';
import { HeroSection, AboutSection, TeamSection } from '../components/sections';
import { SEO } from '../components/SEO';

export function HomePage() {
    return (
        <div className="min-h-screen">
            <SEO
                title="The Literary Circle - NIT Durgapur"
                description="NIT Durgapur's premier literary society. Home of NITMUN, Verve, and Humans of NIT Durgapur."
                keywords={["Literary Circle", "LC", "LC NIT Durgapur", "NIT Durgapur", "Literary Society", "nit", "NIT", "nitdgp", "NITD", "National Institute of Technology Durgapur", "nit clubs", "nit dgp clubs", "best club in nit dgp", "official literary club", "nit durgapur site"]}
                schema={{
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "The Literary Circle",
                    "alternateName": ["LC", "LC NIT Durgapur"],
                    "url": "https://www.lcnitd.co.in/",
                    "logo": "https://www.lcnitd.co.in/images/team/lcmeta.png",
                    "sameAs": [
                        "https://www.facebook.com/lcnitd/",
                        "https://www.instagram.com/lcnitd/"
                    ],
                    "location": {
                        "@type": "Place",
                        "name": "NIT Durgapur",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Durgapur",
                            "addressRegion": "West Bengal",
                            "addressCountry": "IN"
                        }
                    }
                }}
            />
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
