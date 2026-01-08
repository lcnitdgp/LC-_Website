import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Send, SkipForward } from 'lucide-react';
import type { UserData } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import gunImage from '../../assets/auditions/gun.png';

interface Question {
    id: string;
    text: string;
}

interface ResponseData {
    questions: Record<string, { text: string; response: string | null }>;
    completedAt: Timestamp | null;
}

interface AuditionResponseProps {
    user: UserData;
    onClose: () => void;
}

const GUN_ANGLE = -15;

const Gun = ({ firing }: { firing: boolean }) => (
    <div className="absolute top-1/2 -right-16 md:right-10 transform -translate-y-1/2 z-40 pointer-events-none origin-right">
        <motion.img
            src={gunImage}
            alt="Revolver"
            initial={{ scaleX: -1, rotate: GUN_ANGLE }}
            animate={firing ? {
                x: [0, 15, 0],
                rotate: [GUN_ANGLE, GUN_ANGLE + 5, GUN_ANGLE],
                scaleX: -1
            } : {
                scaleX: -1,
                rotate: GUN_ANGLE
            }}
            transition={{ duration: 0.15, ease: "circOut" }}
            className="w-36 md:w-80 opacity-90 drop-shadow-2xl"
        />
        <AnimatePresence>
            {firing && (
                <motion.div
                    initial={{ opacity: 1, scale: 0.5 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[28%] left-[-20%] w-32 h-32 z-50 rounded-full blur-md"
                    style={{
                        background: 'radial-gradient(circle, #fff700 0%, #ff8c00 40%, #ff4500 70%, transparent 100%)'
                    }}
                />
            )}
        </AnimatePresence>
    </div>
);

export function AuditionResponse({ user, onClose }: AuditionResponseProps) {
    const [loading, setLoading] = useState(true);
    const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showInput, setShowInput] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [allAnswered, setAllAnswered] = useState(false);
    const [saving, setSaving] = useState(false);

    const [animState, setAnimState] = useState<'idle' | 'entering' | 'tossing' | 'cracking'>('entering');
    const [firing, setFiring] = useState(false);

    useEffect(() => {
        initializeSession();
    }, []);

    useEffect(() => {
        if (!loading && unansweredQuestions.length > 0 && !isComplete) {
            setAnimState('entering');

            const timer = setTimeout(() => {
                triggerGunshot();

                setTimeout(() => {
                    setAnimState('idle');
                }, 100);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, loading]);

    const triggerGunshot = () => {
        setFiring(true);
        setTimeout(() => setFiring(false), 150);
    };

    const initializeSession = async () => {
        try {
            const responseDocRef = doc(db, 'responses', user.userId);
            const responseDoc = await getDoc(responseDocRef);

            const questionsQuery = query(collection(db, 'audition_questions'), orderBy('createdAt', 'desc'));
            const questionsSnapshot = await getDocs(questionsQuery);
            const allQuestions = questionsSnapshot.docs.map(d => ({
                id: d.id,
                text: d.data().text as string
            }));

            if (!responseDoc.exists()) {
                const initialData: ResponseData = {
                    questions: {},
                    completedAt: null
                };
                allQuestions.forEach(q => {
                    initialData.questions[q.id] = { text: q.text, response: null };
                });
                await setDoc(responseDocRef, initialData);
                setUnansweredQuestions(allQuestions);
            } else {
                const data = responseDoc.data() as ResponseData;
                const unanswered = allQuestions.filter(q => {
                    const existing = data.questions?.[q.id];
                    return !existing || existing.response === null;
                });

                for (const q of unanswered) {
                    if (!data.questions?.[q.id]) {
                        await updateDoc(responseDocRef, {
                            [`questions.${q.id}`]: { text: q.text, response: null }
                        });
                    }
                }

                setUnansweredQuestions(unanswered);
            }
        } catch (error) {
            console.error('Error initializing session:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async () => {
        if (!currentAnswer.trim()) return;
        setSaving(true);

        try {
            const currentQ = unansweredQuestions[currentIndex];
            await updateDoc(doc(db, 'responses', user.userId), {
                [`questions.${currentQ.id}.response`]: currentAnswer.trim()
            });

            setAnimState('tossing');
            setTimeout(() => {
                setSaving(false);
                setCurrentAnswer('');
                setShowInput(false);
                moveToNext();
            }, 400);

        } catch (error) {
            console.error('Error saving answer:', error);
            setSaving(false);
        }
    };

    const handleSkip = () => {
        triggerGunshot();
        setAnimState('cracking');

        setTimeout(() => {
            moveToNext();
        }, 1600);
    };

    const moveToNext = () => {
        if (currentIndex >= unansweredQuestions.length - 1) {
            checkCompletion();
        } else {
            setAnimState('entering');
            setCurrentIndex(prev => prev + 1);
        }
    };

    const checkCompletion = async () => {
        try {
            const responseDoc = await getDoc(doc(db, 'responses', user.userId));
            if (responseDoc.exists()) {
                const data = responseDoc.data() as ResponseData;
                const hasSkipped = Object.values(data.questions).some(q => q.response === null);
                setAllAnswered(!hasSkipped);
                await updateDoc(doc(db, 'responses', user.userId), {
                    completedAt: Timestamp.now()
                });
            }
        } catch (error) {
            console.error('Error checking completion:', error);
        }
        setIsComplete(true);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
                <div className="text-amber-100 text-2xl font-merriweather animate-pulse">
                    Preparing your questions...
                </div>
            </div>
        );
    }

    if (unansweredQuestions.length === 0 || isComplete) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border-2 border-amber-600 rounded-lg p-8 md:p-12 max-w-2xl text-center"
                >
                    {(isComplete ? allAnswered : true) ? (
                        <>
                            <h2 className="text-2xl md:text-3xl font-merriweather text-amber-50 mb-4">Bravo!</h2>
                            <p className="text-amber-200/80 font-spectral text-lg mb-6">
                                The Circle has to admit you are a person with some real guts to answer them all! Strong fit for the next round it seems. As a final task, you have to join our whatsapp group to know when the Circle calls for you in person.
                            </p>
                            <a
                                href="https://chat.whatsapp.com/DKr7OmBsKZdBrz5DUKRc8R"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-500/30 mb-6"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Join the Circle
                            </a>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl md:text-3xl font-merriweather text-amber-50 mb-4">That's All For Today</h2>
                            <p className="text-amber-200/80 font-spectral text-lg mb-6">
                                We see you have skipped some questions and we respect your decision. Don't worry the Circle doesn't penalize this in any way. However, just in case you change your mind, just reload the page and those skipped ones will appear again. As a final task, you have to join our whatsapp group to know when the Circle calls for you in person.
                            </p>
                            <a
                                href="https://chat.whatsapp.com/DKr7OmBsKZdBrz5DUKRc8R"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-500/30 mb-6"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Join the Circle
                            </a>
                        </>
                    )}
                </motion.div>
            </div>
        );
    }

    const currentQuestion = unansweredQuestions[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-hidden">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-8 md:right-8 w-12 h-12 bg-red-800/80 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors z-50"
            >
                <X size={24} />
            </button>

            <Gun firing={firing} />

            <div className="relative w-full max-w-2xl min-h-[400px] flex items-center justify-center">

                <AnimatePresence>
                    {animState === 'cracking' && (
                        <>
                            <motion.div
                                key="crack-top"
                                initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 55%)' }}
                                animate={{
                                    y: 1500,
                                    rotate: -15,
                                    x: -300,
                                    opacity: 0
                                }}
                                transition={{ duration: 1.6, ease: "easeIn" }}
                                className="absolute inset-0 bg-zinc-900 border-2 border-amber-600 rounded-lg p-6 md:p-10 pointer-events-none z-20"
                            >
                                <Content question={currentQuestion} currentIndex={currentIndex} total={unansweredQuestions.length} />
                            </motion.div>

                            <motion.div
                                key="crack-bottom"
                                initial={{ clipPath: 'polygon(0 55%, 100% 45%, 100% 100%, 0 100%)' }}
                                animate={{
                                    y: 1500,
                                    rotate: 25,
                                    x: 300,
                                    opacity: 0
                                }}
                                transition={{ duration: 1.6, ease: "easeIn" }}
                                className="absolute inset-0 bg-zinc-900 border-2 border-amber-600 rounded-lg p-6 md:p-10 pointer-events-none z-20"
                            >
                                <Content question={currentQuestion} currentIndex={currentIndex} total={unansweredQuestions.length} showInput={showInput} currentAnswer={currentAnswer} />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>


                <AnimatePresence mode="wait">
                    {(animState !== 'entering') && (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 500, rotate: 10, scale: 0.8 }}
                            animate={
                                animState === 'tossing' ? { x: -800, rotate: -45, opacity: 0, scale: 0.9 } :
                                    animState === 'cracking' ? { opacity: 0, transition: { duration: 0 } } :
                                        { opacity: 1, x: 0, rotate: 0, scale: 1 }
                            }
                            exit={{ opacity: 0 }}
                            transition={
                                animState === 'tossing' ? { duration: 0.4, ease: "easeIn" } :
                                    animState === 'cracking' ? { duration: 0 } :
                                        { type: "spring", stiffness: 300, damping: 25 }
                            }
                            className="bg-zinc-900 border-2 border-amber-600 rounded-lg p-6 md:p-10 w-full relative z-10"
                        >
                            <Content
                                question={currentQuestion}
                                currentIndex={currentIndex}
                                total={unansweredQuestions.length}
                                showInput={showInput}
                                currentAnswer={currentAnswer}
                                onAnswerChange={setCurrentAnswer}
                                onShowInput={setShowInput}
                                onAnswer={handleAnswer}
                                onSkip={handleSkip}
                                saving={saving}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const Content = ({ question, currentIndex, total, showInput, currentAnswer, onAnswerChange, onShowInput, onAnswer, onSkip, saving }: any) => (
    <>
        <div className="text-amber-600 text-sm font-bold mb-2 uppercase tracking-widest">
            Question {currentIndex + 1} of {total}
        </div>

        <h2 className="text-xl md:text-2xl font-merriweather text-amber-50 mb-8 leading-relaxed">
            {question.text}
        </h2>

        {onShowInput ? (
            showInput ? (
                <div className="space-y-4">
                    <textarea
                        value={currentAnswer}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-40 bg-black border-2 border-amber-700/50 rounded-md p-4 text-amber-50 font-spectral text-lg focus:outline-none focus:border-amber-500 resize-none placeholder:text-amber-700/50"
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                onShowInput(false);
                                onAnswerChange('');
                            }}
                            className="px-6 py-3 text-amber-600 hover:text-amber-500 font-bold uppercase tracking-wider transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onAnswer}
                            disabled={!currentAnswer.trim() || saving}
                            className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-800"
                        >
                            <Send size={18} />
                            {saving ? 'Saving...' : 'Next'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onShowInput(true)}
                        className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white rounded-md font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-900/40 text-lg border-2 border-amber-800"
                    >
                        Answer
                    </button>
                    <button
                        onClick={onSkip}
                        className="px-8 py-4 bg-zinc-700 hover:bg-zinc-600 text-amber-50 rounded-md font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-lg border-2 border-zinc-800"
                    >
                        <SkipForward size={20} />
                        Skip
                    </button>
                </div>
            )
        ) : (
            <div className="h-40 w-full opacity-0"></div>
        )}
    </>
);
