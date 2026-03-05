import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useAuth } from '../../context';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';

const extractRegNumber = (email: string) => {
    const match = email.match(/\.([^.@]+)@/);
    if (match) {
        return match[1].toLowerCase();
    } else {
        return email.split('@')[0].toLowerCase();
    }
};

interface Props {
    onBack: () => void;
    onSelectCommittee: (committee: string) => void;
    initialCommittee?: string;
}

// Ensure the API key exists
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// The specific questions user requested
const ALL_QUESTIONS = [
    { id: 0, text: "In MUN, a delegate represents a country and talks on behalf of them. The International Press (reporters) questions those delegates and reports everything. Which sounds better?" },
    { id: 1, text: "Have you participated in MUN before? If yes, give the count?" },
    { id: 2, text: "Are you more interested in world politics or Indian politics?" },
    { id: 3, text: "Have you heard about the conflict in Iran?" },
    { id: 4, text: "Did you hear about the protests in Bangladesh last year or about its Prime Minister fleeing to India?" },
    { id: 5, text: "Do you like talking about human rights? About how some people are being oppressed by others?" },
    { id: 6, text: "Or are you more interested in wars and security?" },
    // Conditional AIPPM 
    { id: 7, text: "Would you like to favour the Government side or the Opposition?", condition: (ans: string[]) => ans[2]?.toLowerCase().includes("indian") },
    { id: 8, text: "Any state you want to represent from?", condition: (ans: string[]) => ans[2]?.toLowerCase().includes("indian") },
    { id: 9, text: "Do you want to play a major, potentially controversial politician from everyday news? Or would you like a more minor politician?", condition: (ans: string[]) => ans[2]?.toLowerCase().includes("indian") },
    // Conditional UNGA / UNHRC
    { id: 10, text: "Do you want to play a major world power, a regional nation affected by the topic of the committee, or a minor nation?", condition: (ans: string[]) => !ans[2]?.toLowerCase().includes("indian") },
    { id: 11, text: "Any region of the world you want to play from?", condition: (ans: string[]) => !ans[2]?.toLowerCase().includes("indian") },
    { id: 12, text: "As a nation, do you want to be seen as good or controversial?", condition: (ans: string[]) => !ans[2]?.toLowerCase().includes("indian") }
];

export function CommitteeAIAssistant({ onBack, onSelectCommittee }: Props) {
    const [answers, setAnswers] = useState<string[]>([]);
    const [chatHistory, setChatHistory] = useState<{ role: 'model' | 'user', text: string }[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);

    // Rate Limiting State
    const { user } = useAuth();
    const [isLimitExhausted, setIsLimitExhausted] = useState(false);
    const [isLoadingLimit, setIsLoadingLimit] = useState(true);

    // Initial DB Fetch to check limits
    useEffect(() => {
        const checkLimit = async () => {
            if (!user?.email) {
                setIsLoadingLimit(false);
                return;
            }
            try {
                const userEmail = user.email.trim().toLowerCase();
                const regNumber = extractRegNumber(userEmail);
                const docRef = doc(db, 'ai_recommendations', regNumber);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.user_count && data.user_count >= 3) {
                        setIsLimitExhausted(true);
                        setIsDone(true);
                        if (data.last_response) {
                            setChatHistory([{ role: 'model', text: data.last_response }]);
                        } else {
                            setChatHistory([{ role: 'model', text: "You have exhausted your 3 attempts." }]);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching AI limits:", err);
            } finally {
                setIsLoadingLimit(false);
            }
        };
        checkLimit();
    }, [user]);

    // We start with the first question in the log if limit not exhausted
    useEffect(() => {
        if (!isLoadingLimit && !isLimitExhausted && chatHistory.length === 0) {
            setChatHistory([{ role: 'model', text: ALL_QUESTIONS[0].text }]);
        }
    }, [isLoadingLimit, isLimitExhausted, chatHistory.length]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isProcessing]);

    // Find the next question based on conditions
    const getNextQuestionIndex = (currentAns: string[], currentHistory: { role: 'model' | 'user', text: string }[]) => {
        const botMessages = currentHistory.filter(msg => msg.role === 'model');
        const lastMsgText = botMessages.length > 0 ? botMessages[botMessages.length - 1].text : '';
        const lastQIdx = ALL_QUESTIONS.findIndex(q => q.text === lastMsgText);

        const nextIdx = lastQIdx >= 0 ? lastQIdx + 1 : currentAns.length;

        for (let i = nextIdx; i < ALL_QUESTIONS.length; i++) {
            if (!ALL_QUESTIONS[i].condition || ALL_QUESTIONS[i].condition!(currentAns)) {
                return i;
            }
        }
        return -1; // No more questions
    };

    const handleSend = async () => {
        if (!currentInput.trim() || isProcessing) return;

        const userText = currentInput.trim();
        setCurrentInput('');

        const newAnswers = [...answers, userText];
        setAnswers(newAnswers);

        const newHistory: { role: 'model' | 'user', text: string }[] = [
            ...chatHistory,
            { role: 'user' as const, text: userText }
        ];

        setChatHistory(newHistory);

        const nextQIdx = getNextQuestionIndex(newAnswers, chatHistory);

        if (nextQIdx !== -1) {
            // Add next question to chat
            setTimeout(() => {
                setChatHistory(prev => [...prev, { role: 'model', text: ALL_QUESTIONS[nextQIdx].text }]);
            }, 600);
        } else {
            // All questions answered, formulate Prompt and hit LLM
            calculateResult(newAnswers);
        }
    };

    const calculateResult = async (finalAnswers: string[]) => {
        setIsProcessing(true);
        setIsDone(true);

        try {
            const systemPrompt = `
You are an expert Model United Nations (MUN) Advisor. We have exactly 3 committees available:

1. UNHRC (United Nations Human Rights Council)
AGENDA: DELIBERATION ON THE ONGOING POLITICAL CRISIS IN BANGLADESH, FOCUSING ON ITS IMPACT ON DEMOCRATIC GOVERNANCE, RULE OF LAW, AND THE PROTECTION OF FUNDAMENTAL HUMAN RIGHTS.

2. UNGA (United Nations General Assembly)
AGENDA: Deliberation on the concerning risks in Iran, particularly focusing on human rights violations, nuclear proliferation, and regional security threats.

3. AIPPM (All India Political Parties Meet)
AGENDA: DELIBERATION ON ELECTORAL REFORMS IN INDIA EMPHASIZING ONE NATION, ONE ELECTION, POLITICAL FUNDING TRANSPARENCY GAPS AND ELECTORAL ROLL INTEGRITY CONCERNS.

The user has just completed an interview. Based on their answers, analyze their profile against the agendas and roles (Delegate representing a nation/politician vs International Press reporter).

INSTRUCTIONS:
1. Assess the user's responses.
2. Suggest the BEST single committee for them based on their profile and interests.
3. Provide valid reasons for your choice that reference their answers AND the specific agenda of the chosen committee.
4. Keep your entire response STRICTLY under 300 words. Format it beautifully into a readable paragraph. 
5. Do NOT use markdown bold headers, just write a conversational but professional assessment.
            `;

            let conversationContext = "USER INTERVIEW TRANSCRIPT:\n";
            // We map the ALL_QUESTIONS array against finalAnswers because history includes previous bot msgs
            for (let i = 0; i < finalAnswers.length; i++) {
                // Find what question this was
                const qText = chatHistory.filter(c => c.role === 'model')[i]?.text || ALL_QUESTIONS[i]?.text || "Question";
                conversationContext += `\nQUESTION: ${qText}\nANSWER: ${finalAnswers[i]}`;
            }

            const finalPrompt = `${systemPrompt}\n\n${conversationContext}\n\nASSESSMENT:`;

            const result = await model.generateContent(finalPrompt);
            const textResponse = result.response.text();

            setChatHistory(prev => [...prev, { role: 'model', text: textResponse }]);

            // Save to DB
            if (user?.email) {
                try {
                    const userEmail = user.email.trim().toLowerCase();
                    const regNumber = extractRegNumber(userEmail);
                    const docRef = doc(db, 'ai_recommendations', regNumber);
                    await setDoc(docRef, {
                        user_count: increment(1),
                        last_response: textResponse,
                        last_updated: new Date().toISOString()
                    }, { merge: true });
                } catch (dbErr) {
                    console.error("Failed to update AI DB record:", dbErr);
                }
            }

            setIsProcessing(false);

        } catch (error) {
            console.error("Gemini AI Error:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error while analyzing your profile. Please select a committee manually or try again later." }]);
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full mx-auto relative z-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-[#bb943a] border-b-[4px] border-black z-20 py-4 px-6 shadow-[0_4px_0_#000]">
                <button
                    onClick={onBack}
                    className="p-2 bg-black text-white hover:bg-[#e08585] hover:text-black border-[2px] border-black shadow-[2px_2px_0_#000] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all duration-200"
                >
                    <ArrowLeft size={20} strokeWidth={3} />
                </button>
                <div className="flex flex-col">
                    <h3 className="font-staatliches text-3xl uppercase tracking-wider text-black drop-shadow-[1px_1px_0_#fff]">NITMUN AI</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-6 pt-4 pb-8 custom-scrollbar relative">
        <div className="flex flex-col h-full w-full max-w-2xl mx-auto mt-2">
            <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 py-2">
                <button
                    onClick={onBack}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-cormorant font-bold text-xl text-gray-900">Committee Matchmaker</h3>
                       
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-24 custom-scrollbar relative min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {isLoadingLimit ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-center h-40"
                        >
                            <Loader2 className="w-10 h-10 text-[#e08585] animate-spin" />
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </motion.div>
                    ) : (
                        <>
                            {isLimitExhausted && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-4 bg-[#c58715] border-[4px] border-black shadow-[4px_4px_0_#000] text-black text-sm font-mono font-bold flex items-center gap-3"
                                >
                                    <div className="p-2 bg-black rounded-none shrink-0 border-[2px] border-black">
                                        <Sparkles className="w-5 h-5 text-[#c58715]" />
                                    </div>
                                    <p className="uppercase tracking-wide">You have exhausted all your attempts. View your last response below.</p>
                                    className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm font-medium flex items-center gap-3 shadow-sm"
                                >
                                    <div className="p-2 bg-orange-100 rounded-full shrink-0">
                                        <Sparkles className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <p>You have exhausted all your attempts. View your last response below.</p>
                                </motion.div>
                            )}

                            {chatHistory.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 font-mono font-bold text-[15px] leading-relaxed border-[3px] border-black ${msg.role === 'user'
                                        ? 'bg-[#232020] text-white shadow-[6px_6px_0_#bb943a] ml-8'
                                        : 'bg-[#e0b0ac] text-black shadow-[6px_6px_0_#974B60] whitespace-pre-line mr-8'
                                    <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm font-spectral text-[15px] leading-relaxed ${msg.role === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-sm'
                                        : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-tl-sm whitespace-pre-line'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </>
                    )}

                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-[#111] border-[3px] border-black shadow-[4px_4px_0_#e08585] p-4 flex items-center gap-3 text-white mr-8">
                                <Loader2 className="w-5 h-5 text-[#e08585] animate-spin" />
                                <span className="font-mono font-bold text-sm tracking-widest uppercase">Analyzing...</span>
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                                <span className="font-spectral text-sm text-gray-500">Analyzing your profile...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </AnimatePresence>
            </div>

            {/* Input Area or Selection Buttons */}
            <div className="pt-4 mt-auto sticky bottom-0 z-10 w-full pb-6 px-4 md:px-6 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent">
            <div className="pt-4 border-t border-gray-100 mt-auto bg-white sticky bottom-0 z-10 w-full pb-4">
                {isDone && !isProcessing ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 bg-[#232020] p-6 border-[4px] border-black shadow-[8px_10px_0_#000]"
                    >
                        <p className="text-center font-staatliches text-2xl text-[#bb943a] mb-2 uppercase tracking-wide">Select Your Committee Role:</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                        className="space-y-3"
                    >
                        <p className="text-center font-spectral text-sm text-gray-500 mb-2">Select your recommended committee to continue:</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {['AIPPM', 'UNGA', 'UNHRC'].map((com) => (
                                <button
                                    key={com}
                                    onClick={() => onSelectCommittee(com)}
                                    className="flex-1 py-4 px-4 bg-[#e08585] border-[4px] border-black font-antonio font-bold text-black uppercase tracking-widest text-lg shadow-[4px_4px_0_#000] hover:bg-[#c58715] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:translate-y-2 active:translate-x-2 transition-all"
                                >
                                    Proceed to {com}
                                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all text-sm"
                                >
                                    Choose {com}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : !isDone && !isLimitExhausted && !isLoadingLimit && (
                    <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 px-2 py-1 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 transition-all">
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            placeholder="Type your response..."
                            className="flex-1 bg-white border-[4px] border-black shadow-[6px_8px_0_#000] px-6 py-4 font-mono font-bold text-lg text-black placeholder:text-gray-500 focus:outline-none focus:bg-[#f0f0f0] transition-colors"
                            placeholder="Type your answer..."
                            className="flex-1 bg-transparent border-none focus:outline-none px-4 py-3 font-spectral text-[15px] text-gray-900 placeholder:text-gray-400"
                            disabled={isProcessing}
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!currentInput.trim() || isProcessing}
                            className="p-4 bg-[#c58715] text-black border-[4px] border-black shadow-[6px_8px_0_#000] hover:bg-[#bb943a] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_#000] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <Send size={24} strokeWidth={3} className={isProcessing ? "opacity-0" : ""} />
                            className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-sm"
                        >
                            <Send size={18} className={isProcessing ? "opacity-0" : ""} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
