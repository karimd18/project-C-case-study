import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import ReactMarkdown from 'react-markdown';
import SlidePreview from './SlidePreview';

const ChatInterface = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { theme } = useTheme();
    const { triggerRefresh } = useChat();
    
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [currentSlideId, setCurrentSlideId] = useState(null);

    // Simulated Loading State
    const [loadingStep, setLoadingStep] = useState(0);
    const loadingMessages = [
        "Analyzing your request...",
        "Structuring the narrative...",
        "Drafting content points...",
        "Designing visual layout...",
        "Finalizing styles..."
    ];

    const isDark = theme === 'dark';

    // Theme Colors
    const bgApp = isDark ? 'bg-slate-950' : 'bg-white';
    const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
    const inputBg = isDark ? 'bg-slate-900' : 'bg-gray-100';
    const inputBorder = isDark ? 'border-white/10' : 'border-transparent';
    const msgUserBg = isDark ? 'bg-indigo-600 text-white' : 'bg-primary text-white';
    const msgAiBg = isDark ? 'bg-slate-900' : 'bg-white border border-gray-100 shadow-sm';

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
        }
    }, [input]);

    useEffect(() => {
        loadChatSession();
    }, [sessionId, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]); // Added loading to scroll to bottom when loading starts

    // Simulated Loading Interval
    useEffect(() => {
        let interval;
        if (loading) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
            }, 3000); 
        }
        return () => clearInterval(interval);
    }, [loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatSession = async () => {
        if (!sessionId || !user) {
            setMessages([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/chats/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const session = await res.json();
                
                // Parallel fetch for history items
                const history = await Promise.all(session.messages.map(async msg => {
                    let slideData = null;
                    let slideId = null;
                    let content = msg.content;
                    
                    const match = content.match(/#SLIDE_ID:([a-f\d]+)/);
                    if (match) {
                         slideId = match[1];
                         content = content.replace(match[0], '').trim();
                         try {
                             const hRes = await fetch(`http://localhost:8080/api/history/${slideId}`);
                             if (hRes.ok) {
                                 const hItem = await hRes.json();
                                 slideData = JSON.parse(hItem.jsonOutput);
                             }
                         } catch(e) { console.error("Failed to load slide history", e); }
                    } else if (content.includes("Generated slide:")) {
                         // Fallback for legacy messages
                         slideId = 1; 
                    }

                    // Strict check: Only treat as slide if we have valid HTML content (or legacy data with explicit title)
                    // The user specifically requested "normal response when there is no slide design which is an html code"
                    const isValidSlide = slideId && slideData && (slideData.htmlCode || (slideData.title && slideData.title !== 'Unexpected Error'));

                    return {
                        role: msg.role === 'user' ? 'user' : 'ai',
                        content: content,
                        type: isValidSlide ? 'slide' : 'text',
                        slideId: isValidSlide ? slideId : null,
                        slideData: isValidSlide ? slideData : null
                    };
                }));

                // Handle OPTIMISTIC INITIAL MESSAGE from Navigation State
                // If history is empty but we have an initial message in location state, show it
                if (history.length === 0 && location.state?.initialMessage) {
                    setMessages([{ role: 'user', content: location.state.initialMessage }]);
                    setLoading(true);
                } else {
                     setMessages(history);
                }
            }
        } catch (err) {
            console.error("Failed to load chat", err);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        // Lazy Session Creation
        let activeSessionId = sessionId;
        if (!activeSessionId) {
            try {
                const token = localStorage.getItem('token');
                // 1. Create Session
                const res = await fetch('http://localhost:8080/api/chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ userId: user.email, title: "New Conversation" })
                });
                const newSession = await res.json();
                activeSessionId = newSession.id;
                
                // 2. Notify Sidebar
                triggerRefresh(); 
                
                // 3. Navigate immediately? 
                // If we navigate now, we unmount.
                // We should probably start the generation first?
                // But we want the UI to update.
                
                // STRATEGY: Navigate immediately. Pass 'startGeneration' flag.
                navigate(`/chat/${newSession.id}`, { 
                    replace: true, 
                    state: { 
                        initialMessage: input,
                        shouldGenerate: true // Flag to tell the new instance to run generation
                    } 
                });
                return; // Stop here, the new instance will handle generation

            } catch (err) {
                console.error("Failed to create session", err);
                return;
            }
        }

        // Standard Send (Existing Session)
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        performGeneration(activeSessionId, input);
    };
    
    // Helper for generation (called by handleSend or by effect)
    const performGeneration = async (sid, text) => {
        try {
            const token = localStorage.getItem('token');
            const genRes = await fetch('http://localhost:8080/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ rawText: text, sessionId: sid })
            });

            if (!genRes.ok) throw new Error("Generation failed");

            const slideData = await genRes.json();
            
            // Check validity before deciding it's a slide
            const isValidSlide = slideData && (slideData.htmlCode || (slideData.title && slideData.title !== 'Unexpected Error'));

            setMessages(prev => [...prev, { 
                role: 'ai', 
                content: isValidSlide 
                    ? "I've generated a slide for you based on that." 
                    : (slideData.actionTitle || "I analyzed your request but couldn't generate a visual design."),
                type: isValidSlide ? 'slide' : 'text',
                slideId: isValidSlide ? slideData.id : null,
                slideData: isValidSlide ? slideData : null
            }]);
            
            if (isValidSlide) {
                setCurrentSlideId(slideData);
            }

        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error processing that." }]);
        } finally {
            setLoading(false);
        }
    };
    
    // EFFECT to handle "shouldGenerate" from navigation state
    useEffect(() => {
        if (location.state?.shouldGenerate && location.state?.initialMessage && sessionId) {
            // Clean up state so we don't re-run on refresh
            window.history.replaceState({}, document.title);
            
            // Set initial UI state
            setMessages([{ role: 'user', content: location.state.initialMessage }]);
            setInput(''); // Clear input just in case
            setLoading(true);
            
            // Trigger Generation logic
            performGeneration(sessionId, location.state.initialMessage);
        }
    }, [location.state, sessionId]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`flex flex-col h-full ${bgApp} transition-colors duration-300`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-fade-in-up">
                         <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary to-accent mb-8 flex items-center justify-center shadow-xl shadow-primary/20`}>
                             <Sparkles className="text-white w-10 h-10" />
                         </div>
                         <h2 className={`text-4xl font-display font-bold ${textPrimary} mb-4 tracking-tight`}>
                             How can I help today?
                         </h2>
                         <p className={`max-w-md ${textSecondary} text-lg font-light leading-relaxed`}>
                             I can help you design beautiful slides, write content, or just brainstorm ideas.
                         </p>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-8 pb-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`animate-fade-in flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`
                                    max-w-[85%] rounded-2xl px-5 py-3.5 text-base leading-relaxed shadow-sm
                                    ${msg.role === 'user' ? `${msgUserBg} rounded-br-none` : `${msgAiBg} ${textPrimary} rounded-bl-none`}
                                `}>
                                    {msg.type === 'slide' ? (
                                        <div>
                                            <p className="mb-2">{msg.content}</p>
                                            {msg.slideData && (
                                                <div className="mt-4 border rounded-lg overflow-hidden border-white/10 group cursor-pointer hover:ring-2 ring-primary transition-all">
                                                     <div className="aspect-video bg-gray-800 relative">
                                                         {/* Mini Preview Placeholder */}
                                                         <SlidePreview data={msg.slideData} small />
                                                     </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <ReactMarkdown 
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-0" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-3 text-gray-400 pl-1 mt-2">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></div>
                                </div>
                                <span className={`text-xs font-medium tracking-wide ${textSecondary} animate-pulse`}>
                                    {loadingMessages[loadingStep]}
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
                <div className={`
                    relative flex items-end gap-2 p-2 rounded-2xl shadow-lg transition-all ring-1 ring-black/5
                    ${inputBg}
                    ${inputBorder}
                    focus-within:ring-2 focus-within:ring-primary/50
                `}>
                    <textarea 
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message Project C..."
                        className={`
                            w-full bg-transparent border-none focus:ring-0 resize-none max-h-[150px]
                            py-3 px-4 text-base ${textPrimary} placeholder-gray-400
                            custom-scrollbar
                        `}
                        rows={1}
                        style={{ minHeight: '52px' }}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className={`
                            p-3 rounded-xl mb-1 flex-shrink-0 transition-all
                            ${input.trim() ? 'bg-primary text-white shadow-md hover:bg-primary-light active:scale-95' : 'bg-transparent text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="text-center mt-3">
                     <p className="text-xs text-gray-400">
                         Project C can make mistakes. Consider checking important information.
                     </p>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
