import { motion } from 'framer-motion';

export function HeroSection() {
    return (
        <header className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/images/slider/a8.jpg')`,
                }}
            >
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-6"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-cormorant text-white leading-tight">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="block"
                        >
                            We are
                        </motion.span>
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="block text-primary-300 italic"
                        >
                            The Literary Circle
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.5 }}
                        className="text-xl md:text-2xl font-spectral text-gray-200 mt-8"
                    >
                        Welcome to Our Page!
                    </motion.p>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-white rounded-full"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </header>
    );
}
