import React from 'react';

interface BookshelfProps {
    children: React.ReactNode;
}

// User provided offsets for mobile calibration:
// 2013: X: 60.5, Y: -290.67
// 2014: X: 226.76, Y: -296.1
// 2015: X: -126.5, Y: -151.9
// 2016: X: -93.6, Y: -151.9
// 2017: X: 130.4, Y: -151.9

const MOBILE_OFFSETS = [
    { x: '60.5px', y: '-290.7px' },   // 2013 (Index 0)
    { x: '226.8px', y: '-296.1px' },  // 2014 (Index 1)
    { x: '-126.5px', y: '-151.9px' }, // 2015 (Index 2)
    { x: '-93.6px', y: '-151.9px' },  // 2016 (Index 3)
    { x: '-60.6px', y: '-151.9px' },  // 2017 (Index 4)
];

const MOBILE_OFFSETS_SHORT = [
     { x: '60.5px', y: '-284.7px' },   // 2013 (Index 0)
    { x: '226.8px', y: '-284.7px' },  // 2014 (Index 1)
    { x: '-126.5px', y: '-151.9px' }, // 2015 (Index 2)
    { x: '-93.6px', y: '-151.9px' },  // 2016 (Index 3)
    { x: '-60.6px', y: '-151.9px' },  // 2017 (Index 4)
];

export function Bookshelf({ children }: BookshelfProps) {
    return (
        <div className="relative w-full h-full min-h-[600px] overflow-hidden md:scale-125 lg:scale-135 md:origin-[center_35%] transition-transform duration-500">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-no-repeat bg-center"
                style={{
                    backgroundImage: 'url(/images/dejavu/empty_wooden_bookshelf_bg.png)',
                    // Mobile: '200% 100%' -> Zooms in horizontally to crop sides, fit height vertically.
                    // Laptop (md): '100% 135%' -> The calibrated full view.
                }}
            >
                <style>{`
                    .shelf-bg {
                        background-size: 200% 100%; /* Mobile: Zoomed in to hide sides */
                    }
                    @media (min-width: 768px) {
                        .shelf-bg {
                            background-size: 100% 135%; /* Laptop: Calibrated fit */
                        }
                    }
                `}</style>
                <div className="absolute inset-0 bg-no-repeat bg-center shelf-bg" style={{ backgroundImage: 'url(/images/dejavu/empty_wooden_bookshelf_bg.png)' }} />
            </div>

            {/* Book Container */}
            <style>{`
                @media (max-height: 720px) {
                    .book-container-adjust {
                        --books-top: calc(78% + 25px);
                    }
                }
            `}</style>
            <div
                className="absolute w-full flex items-end justify-center px-4 sm:px-8 gap-2 sm:gap-3 md:gap-4
                           transform translate-x-0 translate-y-[-100%]
                           md:translate-x-[-137px] md:translate-y-[calc(-100%-173px)] book-container-adjust"
                style={{
                    top: 'var(--books-top, 78%)',
                    height: '250px',
                    paddingBottom: '40px'
                }}
            >
                {React.Children.map(children, (child, index) => {
                    const mobileOffset = MOBILE_OFFSETS[index] || { x: '0px', y: '0px' };
                    const mobileOffsetShort = MOBILE_OFFSETS_SHORT[index] || mobileOffset;

                    return (
                        <div
                            key={index}
                            className="transition-transform duration-300 md:[--spacing-mult:20px] [--spacing-mult:0px]"
                            style={{
                                // Logic:
                                // Mobile: Apply specific unique offsets (mobileOffset.x / y)
                                // Laptop (md): Ignore specific offsets, use the standard progressive spacing (index * 20px)
                                // We use a CSS variable or directly override via media query style injection? 
                                // Direct style injection is hard with media queries inline.
                                // Instead, use CSS variables for X and Y that switch on breakpoint.

                                // Problem: inline styles override classes.
                                // We need a way to say: "Mobile = use hardcoded X/Y", "Laptop = use index * 20 / 0".
                                // Let's use CSS Custom Properties for the transform values.

                                // --tx: mobileOffset.x
                                // --ty: mobileOffset.y
                                // @media md: --tx: calc(index * 20px), --ty: 0
                            } as React.CSSProperties}
                        >
                            {/* Inner wrapper to handle the conditional transform logic cleanly without complex inline media queries */}
                            <style>{`
                                .book-wrapper-${index} {
                                    transform: translate(${mobileOffset.x}, ${mobileOffset.y});
                                }
                                @media (max-height: 747px) {
                                    .book-wrapper-${index} {
                                        transform: translate(${mobileOffsetShort.x}, ${mobileOffsetShort.y});
                                    }
                                }
                                @media (min-width: 768px) {
                                    .book-wrapper-${index} {
                                        transform: translateX(${index * 20}px) translateY(0px);
                                    }
                                }
                                  
        }
                            `}</style>
                            <div className={`transition-transform duration-300 book-wrapper-${index}`}>
                                <div className="relative transition-transform hover:-translate-y-2 duration-300 origin-bottom">
                                    {child}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
    