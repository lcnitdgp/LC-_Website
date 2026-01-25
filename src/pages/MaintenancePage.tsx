import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-lg"
            >
                <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="inline-block mb-6"
                >
                    <Hammer size={64} className="text-yellow-500" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Under Maintenance
                </h1>

                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                    We're working hard to make things even better.
                    <br className="hidden md:block" />
                    The site will be back up shortly.
                </p>

                <div className="w-16 h-1 bg-yellow-500 mx-auto rounded-full opacity-50"></div>
            </motion.div>
        </div>
    );
};

export default MaintenancePage;
