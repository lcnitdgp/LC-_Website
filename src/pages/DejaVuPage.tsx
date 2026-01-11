import { useState } from 'react';
import { DejaVuSection } from '../components/dejavu/DejaVuSection';
import { Header } from '../components/layout/Header';
import { Book } from '../components/dejavu/Book';
import { Bookshelf } from '../components/dejavu/Bookshelf';
import { PDFViewerModal } from '../components/dejavu/PDFViewerModal';

const BOOKS = [
    {
        id: '2013',
        year: '2013',
        title: 'Déjà Vu 2013',
        coverImage: '/images/dejavu/2013.png',
        pdfUrl: '/pdfs/dejavu/2013_compressed.pdf',
        color: '#5d4037'
    },
    {
        id: '2014',
        year: '2014',
        title: 'Déjà Vu 2014',
        coverImage: '/images/dejavu/2014.png',
        pdfUrl: '/pdfs/dejavu/2014_compressed.pdf',
        color: '#4e342e'
    },
    {
        id: '2015',
        year: '2015',
        title: 'Déjà Vu 2015',
        coverImage: '/images/dejavu/2015.png',
        pdfUrl: '/pdfs/dejavu/2015_compressed.pdf',
        color: '#3e2723'
    },
    {
        id: '2016',
        year: '2016',
        title: 'Déjà Vu 2016',
        coverImage: '/images/dejavu/2016.png',
        pdfUrl: '/pdfs/dejavu/2016_compressed.pdf',
        color: '#5d4037'
    },
    {
        id: '2017',
        year: '2017',
        title: 'Déjà Vu 2017',
        coverImage: '/images/dejavu/2017.png',
        pdfUrl: '/pdfs/dejavu/2017_compressed.pdf',
        color: '#4e342e'
    }
];

export function DejaVuPage() {
    const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);

    return (
        <div className="h-screen flex flex-col bg-[#1a0f0a] overflow-hidden">
            <Header />

            <main className="flex-grow pt-24 relative">
                <div className="absolute top-[71px] left-0 right-0 z-20 pointer-events-none scale-[0.7] origin-top">
                    <DejaVuSection />
                </div>

                <div className="h-full w-full">
                    <Bookshelf>
                        {BOOKS.map(book => (
                            <div key={book.id} className="w-22 sm:w-26 md:w-32 lg:w-36 book-container">
                                <Book
                                    {...book}
                                    onClick={() => setSelectedBook(book)}
                                />
                            </div>
                        ))}
                    </Bookshelf>
                </div>

                <PDFViewerModal
                    isOpen={!!selectedBook}
                    onClose={() => setSelectedBook(null)}
                    pdfUrl={selectedBook?.pdfUrl || ''}
                    title={selectedBook?.title || ''}
                />
            </main>
        </div>
    );
}
