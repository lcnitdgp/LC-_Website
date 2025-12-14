import { motion } from 'framer-motion';
import { siteConfig } from '../../data/siteConfig';

export function AboutSection() {
    return (
        <section
            className="relative py-20 bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url('/images/slider/91.jpg')`,
            }}
        >
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 max-w-4xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h2 className="text-3xl md:text-4xl font-merriweather text-white">
                        About Us
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12"
                >
                    <div className="space-y-6">
                        {siteConfig.about.map((paragraph, index) => (
                            <motion.p
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className="font-spectral text-white/90 text-lg leading-relaxed"
                            >
                                {paragraph}
                            </motion.p>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
