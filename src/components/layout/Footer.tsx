import { useState, useEffect } from 'react';
import { Facebook, Instagram, Youtube, Mail, MapPin } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { siteConfig } from '../../data/siteConfig';
import { useAuth } from '../../context';
import { EditableText } from '../common';

interface FooterContent {
    aboutHeading: string;
    aboutText: string;
    findUsLabel: string;
    headquartersHeading: string;
    address: string;
    email: string;
    copyrightText: string;
    lastUpdatedBy?: string;
    lastUpdatedAt?: Date;
}

const defaultContent: FooterContent = {
    aboutHeading: "About",
    aboutText: "Here at the Literary Circle, we like thinking out of the box and aiming sky high. Want to get to know more about us? Find us here:",
    findUsLabel: "Find us at:",
    headquartersHeading: "Our Headquarters",
    address: siteConfig.contact.address,
    email: siteConfig.contact.email,
    copyrightText: "© All rights reserved. Designed and Developed By The Literary Circle",
};

export function Footer() {
    const { user } = useAuth();
    const [content, setContent] = useState<FooterContent>(defaultContent);
    const [isLoading, setIsLoading] = useState(true);

    const canEdit = user !== null && user.admin === true;

    useEffect(() => {
        fetchFooterContent();
    }, []);

    const fetchFooterContent = async () => {
        try {
            const docRef = doc(db, 'SiteContent', 'footer');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as FooterContent;
                setContent({
                    aboutHeading: data.aboutHeading || defaultContent.aboutHeading,
                    aboutText: data.aboutText || defaultContent.aboutText,
                    findUsLabel: data.findUsLabel || defaultContent.findUsLabel,
                    headquartersHeading: data.headquartersHeading || defaultContent.headquartersHeading,
                    address: data.address || defaultContent.address,
                    email: data.email || defaultContent.email,
                    copyrightText: data.copyrightText || defaultContent.copyrightText,
                    lastUpdatedBy: data.lastUpdatedBy,
                });
            }
        } catch (error) {
            console.error('Error fetching footer content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (field: keyof FooterContent, newValue: string) => {
        const editorName = user?.name || user?.userId || 'unknown';
        const newContent = {
            ...content,
            [field]: newValue,
            lastUpdatedBy: editorName,
            lastUpdatedAt: new Date(),
        };

        const docRef = doc(db, 'SiteContent', 'footer');
        await setDoc(docRef, newContent);

        setContent(newContent);
    };

    return (
        <footer id="contact" className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div>
                        {isLoading ? (
                            <h3 className="font-cormorant text-2xl mb-4">Loading...</h3>
                        ) : (
                            <div className="mb-4">
                                <EditableText
                                    value={content.aboutHeading}
                                    onSave={(val) => handleSave('aboutHeading', val)}
                                    canEdit={canEdit}
                                    className="font-cormorant text-2xl"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            </div>
                        )}

                        {isLoading ? (
                            <p className="font-spectral text-gray-300 mb-6">Loading...</p>
                        ) : (
                            <div className="mb-6">
                                <EditableText
                                    value={content.aboutText}
                                    onSave={(val) => handleSave('aboutText', val)}
                                    canEdit={canEdit}
                                    className="font-spectral text-gray-300"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            </div>
                        )}

                        {isLoading ? (
                            <h4 className="font-cormorant text-xl mb-3">Loading...</h4>
                        ) : (
                            <div className="mb-3">
                                <EditableText
                                    value={content.findUsLabel}
                                    onSave={(val) => handleSave('findUsLabel', val)}
                                    canEdit={canEdit}
                                    className="font-cormorant text-xl"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            </div>
                        )}

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
                            <a
                                href={siteConfig.social.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/10 rounded-full hover:bg-primary-600 transition-colors duration-200"
                                aria-label="YouTube"
                            >
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>


                    <div>
                        {isLoading ? (
                            <h3 className="font-cormorant text-2xl mb-4">Loading...</h3>
                        ) : (
                            <div className="mb-4">
                                <EditableText
                                    value={content.headquartersHeading}
                                    onSave={(val) => handleSave('headquartersHeading', val)}
                                    canEdit={canEdit}
                                    className="font-cormorant text-2xl"
                                    lastEditedBy={content.lastUpdatedBy}
                                />
                            </div>
                        )}

                        <div className="space-y-3 font-spectral text-gray-300">
                            <div className="flex items-start gap-3">
                                <MapPin size={20} className="flex-shrink-0 mt-1" />
                                {isLoading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <EditableText
                                        value={content.address}
                                        onSave={(val) => handleSave('address', val)}
                                        canEdit={canEdit}
                                        className=""
                                        lastEditedBy={content.lastUpdatedBy}
                                    />
                                )}
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={20} className="flex-shrink-0 mt-1" />
                                {isLoading ? (
                                    <p>Loading...</p>
                                ) : canEdit ? (
                                    <EditableText
                                        value={content.email}
                                        onSave={(val) => handleSave('email', val)}
                                        canEdit={canEdit}
                                        className="hover:text-primary-400 transition-colors"
                                        lastEditedBy={content.lastUpdatedBy}
                                    />
                                ) : (
                                    <a
                                        href={`mailto:${content.email}`}
                                        className="hover:text-primary-400 transition-colors"
                                    >
                                        {content.email}
                                    </a>
                                )}
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
                        {isLoading ? (
                            <p className="text-gray-400 text-sm text-center">Loading...</p>
                        ) : (
                            <EditableText
                                value={content.copyrightText}
                                onSave={(val) => handleSave('copyrightText', val)}
                                canEdit={canEdit}
                                className="text-gray-400 text-sm text-center"
                                lastEditedBy={content.lastUpdatedBy}
                            />
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}
