import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, getDocs, writeBatch, deleteField } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Save, Stamp, PenTool, Flame } from 'lucide-react';
import type { UserData } from '../../context/AuthContext';
// @ts-ignore
import '@fontsource/special-elite';

interface Question {
    id: string;
    text: string;
    addedBy: string;
    addedById: string;
    lastEditedBy?: string;
    type: 'add' | 'edit';
    createdAt: Timestamp;
}

interface QuestionsListProps {
    user: UserData;
    onClose: () => void;
}

export function QuestionsList({ user, onClose }: QuestionsListProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'audition_questions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Question[];
            setQuestions(data);
        });

        return () => unsubscribe();
    }, []);

    const handleAdd = async () => {
        if (!newQuestion.trim()) return;

        try {
            const questionText = newQuestion.trim();
            const docRef = await addDoc(collection(db, 'audition_questions'), {
                text: questionText,
                addedBy: user.name,
                addedById: user.userId,
                type: 'add',
                createdAt: serverTimestamp()
            });

            const responsesSnapshot = await getDocs(collection(db, 'responses'));
            const batch = writeBatch(db);
            responsesSnapshot.docs.forEach(responseDoc => {
                batch.update(responseDoc.ref, {
                    [`questions.${docRef.id}`]: { text: questionText, response: null }
                });
            });
            await batch.commit();

            setNewQuestion('');
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding question:", error);
            alert("Error adding question: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const handleEdit = async (id: string) => {
        if (!editText.trim()) return;

        const question = questions.find(q => q.id === id);
        if (!question) return;

        try {
            const isLCiteOwner = user.role === 'LCite' && question.addedById === user.userId;
            const newType = (isLCiteOwner && question.type === 'add') ? 'add' : 'edit';
            const updatedText = editText.trim();

            await updateDoc(doc(db, 'audition_questions', id), {
                text: updatedText,
                lastEditedBy: newType === 'edit' ? user.name : undefined,
                type: newType
            });

            const responsesSnapshot = await getDocs(collection(db, 'responses'));
            const batch = writeBatch(db);
            responsesSnapshot.docs.forEach(responseDoc => {
                const data = responseDoc.data();
                if (data.questions && data.questions[id]) {
                    batch.update(responseDoc.ref, {
                        [`questions.${id}.text`]: updatedText
                    });
                }
            });
            await batch.commit();

            setEditingId(null);
            setEditText('');
        } catch (error) {
            console.error("Error updating question:", error);
            alert("Error updating question: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    const [burningId, setBurningId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm('CONFIDENTIAL: Burn this evidence?')) {
            setBurningId(id);
            setTimeout(async () => {
                try {
                    await deleteDoc(doc(db, 'audition_questions', id));

                    const responsesSnapshot = await getDocs(collection(db, 'responses'));
                    const batch = writeBatch(db);
                    responsesSnapshot.docs.forEach(responseDoc => {
                        batch.update(responseDoc.ref, {
                            [`questions.${id}`]: deleteField()
                        });
                    });
                    await batch.commit();

                    setBurningId(null);
                } catch (error) {
                    console.error("Error deleting question:", error);
                    setBurningId(null);
                }
            }, 2000);
        }
    };

    const canModify = (q: Question) => {
        if (user.role !== 'student' && user.role !== 'LCite') return true;
        if (user.role === 'LCite') {
            return q.addedById === user.userId && q.type === 'add';
        }
        return false;
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 font-[Special_Elite]">
            <div className="w-full max-w-5xl rounded-sm p-1 relative flex flex-col max-h-[90vh] bg-[#d4c5a6] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#8c7b5b] transform rotate-1">
                <div className="absolute -top-12 left-10 w-48 h-12 bg-[#d4c5a6] rounded-t-lg border-t-4 border-l-4 border-r-4 border-[#8c7b5b] flex items-center justify-center">
                    <span className="text-xl font-bold text-[#5c4b2b] tracking-widest">CONFIDENTIAL</span>
                </div>

                <button
                    onClick={onClose}
                    className="absolute -top-6 -right-6 z-20 group transform rotate-12 hover:scale-110 transition-transform"
                    title="Close Case"
                >
                    <div className="w-16 h-16 rounded-full border-4 border-red-800 flex items-center justify-center bg-[#e8dec8] shadow-lg">
                        <X className="w-10 h-10 text-red-800" />
                    </div>
                </button>

                <div className="w-full h-full bg-[#f4e4bc] relative flex flex-col rounded-sm overflow-hidden border border-[#bfa87e]">
                    <div className="p-6 border-b-2 border-dashed border-[#8c7b5b] bg-[#e8dec8]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-xl md:text-3xl text-black font-bold tracking-tighter uppercase mb-1">
                                    Subject: Audition Protocol
                                </h1>
                                <p className="text-[#5c4b2b] text-xs md:text-sm tracking-widest">
                                    REF: AQ-{new Date().getFullYear()}-LC // TOP SECRET
                                </p>
                            </div>
                            <div className="hidden md:block opacity-30 transform rotate-[-10deg]">
                                <Stamp className="w-24 h-24 text-red-900" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
                        {questions.map((q, index) => (
                            <div
                                key={q.id}
                                className={`relative bg-[#fffbf0] p-6 shadow-md max-w-3xl mx-auto transform transition-all duration-[2000ms] ${burningId === q.id ? 'scale-95 grayscale brightness-50 contrast-150 rotate-2' : 'hover:scale-[1.01]'
                                    }`}
                                style={{
                                    transform: `rotate(${index % 2 === 0 ? '-1deg' : '1deg'})`,
                                    boxShadow: '2px 4px 10px rgba(0,0,0,0.2)'
                                }}
                            >
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-16 border-4 border-[#888] rounded-full z-10 border-b-0 h-8 opacity-70"></div>

                                {burningId === q.id && (
                                    <div className="absolute inset-0 z-20 pointer-events-none rounded-sm overflow-hidden flex items-center justify-center">
                                        <img
                                            src="https://media.giphy.com/media/3o72FfM5HJydzafgUE/giphy.gif"
                                            alt="Fire"
                                            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-0 animate-[fadeInFire_0.2s_ease-out_forwards]"
                                            style={{ filter: 'contrast(1.2) brightness(1.2)' }}
                                        />

                                        <div
                                            className="absolute inset-0 bg-black mix-blend-multiply"
                                            style={{
                                                animation: 'charToBlack 2s ease-in forwards'
                                            }}
                                        ></div>

                                        <style>{`
                                            @keyframes fadeInFire {
                                                from { opacity: 0; transform: scale(1.1); }
                                                to { opacity: 1; transform: scale(1.2); }
                                            }
                                            @keyframes charToBlack {
                                                0% { opacity: 0; }
                                                40% { opacity: 0.8; }
                                                100% { opacity: 1; }
                                            }
                                        `}</style>
                                    </div>
                                )}

                                {editingId === q.id ? (
                                    <div className="space-y-4">
                                        <div className="text-xs text-red-800 uppercase tracking-widest mb-2 font-bold">[ EDITING IN PROGRESS ]</div>
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="w-full bg-[#f0f0f0] border-2 border-black/20 p-4 text-black text-xl font-[Special_Elite] leading-relaxed focus:outline-none focus:border-black min-h-[150px] resize-none"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-4 py-2 text-[#5c4b2b] hover:underline uppercase tracking-wider text-sm font-bold"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEdit(q.id)}
                                                disabled={!editText.trim()}
                                                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm flex items-center gap-2"
                                            >
                                                <Save size={16} />
                                                Submit Update
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-4 border-b border-black/10 pb-2">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-[#5c4b2b] uppercase tracking-widest">
                                                    Evidence #{q.id.slice(0, 6)}
                                                </span>
                                                <span className="text-sm font-bold text-black mt-1">
                                                    Agent: {q.addedBy}
                                                </span>
                                            </div>

                                            {q.type === 'edit' && (
                                                <div className="border-2 border-red-800 text-red-800 px-2 py-1 text-xs font-bold uppercase transform -rotate-6 mask-image-grunge">
                                                    REVISED BY {q.lastEditedBy}
                                                </div>
                                            )}

                                            {canModify(q) && (
                                                <div className="absolute top-2 right-2 flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(q.id);
                                                            setEditText(q.text);
                                                        }}
                                                        className="w-8 h-8 bg-black/10 text-black hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all"
                                                        title="Modify Record"
                                                    >
                                                        <PenTool size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        className="w-8 h-8 bg-red-900/10 text-red-900 hover:bg-red-900 hover:text-white rounded-full flex items-center justify-center transition-all"
                                                        title="Burn Evidence"
                                                    >
                                                        <Flame size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xl text-black leading-relaxed whitespace-pre-wrap">
                                            {q.text}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <div className="text-center py-20 opacity-50">
                                <p className="text-2xl text-[#5c4b2b]">No evidence collected yet.</p>
                                <p className="text-sm uppercase tracking-widest mt-2">Dossier Empty</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-[#e8dec8] border-t-2 border-dashed border-[#8c7b5b] flex justify-center">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-black text-white px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl tracking-widest hover:bg-[#222] transition-all transform hover:-translate-y-1 shadow-lg border-2 border-transparent hover:border-[#5c4b2b] flex items-center gap-3 w-full md:w-auto justify-center"
                        >
                            <span className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full animate-pulse"></span>
                            ADD NEW EVIDENCE
                        </button>
                    </div>

                </div>
            </div>

            {showAddModal && (
                <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#f0f0f0] w-full max-w-2xl p-4 md:p-8 shadow-[0_0_100px_rgba(255,255,255,0.1)] transform rotate-1 border-4 md:border-8 border-[#333] relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute -top-6 -right-6 w-12 h-12 bg-red-800 text-white flex items-center justify-center rounded-full shadow-lg hover:bg-red-900 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold uppercase mb-6 tracking-tighter border-b-4 border-black pb-2">
                            Type New Query
                        </h3>

                        <div className="relative">
                            <textarea
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Start typing..."
                                className="w-full h-48 md:h-64 bg-white border-2 border-black p-4 md:p-6 text-xl md:text-2xl font-[Special_Elite] leading-relaxed focus:outline-none focus:ring-4 focus:ring-black/10 resize-none"
                                autoFocus
                            />
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-3 uppercase font-bold tracking-widest hover:bg-gray-200"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={!newQuestion.trim()}
                                className="bg-black text-white px-8 py-3 uppercase font-bold tracking-widest hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                            >
                                [ SUBMIT TO RECORD ]
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
