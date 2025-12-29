import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';

export function Footer() {
    return (
        <footer id="contact" className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div>
                        <h3 className="font-cormorant text-2xl mb-4">About</h3>
                        <p className="font-spectral text-gray-300 mb-6">
                            Here at the Literary Circle, we like thinking out of the box and aiming sky high.
                            Want to get to know more about us? Find us here:
                        </p>


                        <h4 className="font-cormorant text-xl mb-3">Find us at:</h4>
                        <div className="flex space-x-4">
                            <a
                                href={siteConfig.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-primary-600 transition-colors duration-200"
                                aria-label="Facebook"
                            >
                                <Facebook size={20} />
                            </a>
                            <a
                                href={siteConfig.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-primary-600 transition-colors duration-200"
                                aria-label="Instagram"
                            >
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>


                    <div>
                        <h3 className="font-cormorant text-2xl mb-4">Our Headquarters</h3>
                        <div className="space-y-3 font-spectral text-gray-300">
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="flex-shrink-0 mt-1" />
                                <p>{siteConfig.contact.address}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={20} className="flex-shrink-0 mt-1" />
                                <a
                                    href={`mailto:${siteConfig.contact.email}`}
                                    className="hover:text-primary-400 transition-colors"
                                >
                                    {siteConfig.contact.email}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="mt-12 pt-8 border-t border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <nav className="flex flex-wrap justify-center gap-6">
                            {siteConfig.navigation.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target={item.external ? '_blank' : undefined}
                                    rel={item.external ? 'noopener noreferrer' : undefined}
                                    className="text-gray-400 hover:text-white transition-colors uppercase text-sm tracking-wider"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                        <p className="text-gray-400 text-sm text-center">
                            © All rights reserved. Designed and Developed By The Literary Circle
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
