import React, { useState, useEffect, useRef } from 'react';

const AiAgent = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "FreshFlow Neural Link: v4.2 Online. I am ready to audit your logistics data." }
    ]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const askAI = async (e) => {
        if (e) e.preventDefault();
        if (!userInput.trim() || isThinking) return;

        const currentInput = userInput;
        setUserInput("");
        setMessages(prev => [...prev, { role: 'user', content: currentInput }]);
        setIsThinking(true);

        try {
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
            let fullResponse = "";
            const chatResponse = await window.puter.ai.chat(
                `You are FreshFlow AI. Tactical inventory assistant. Context: ${currentInput}`,
                { model: 'x-ai/grok-4.20-beta', stream: true }
            );

            for await (const part of chatResponse) {
                if (part?.text) {
                    fullResponse += part.text;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].content = fullResponse;
                        return newMsgs;
                    });
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "SYSTEM_OFFLINE: Please refresh your browser bridge." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <style>{`
                /* Breathing AI Orb Animation */
                @keyframes orb-glow {
                    0% { transform: scale(1); box-shadow: 0 0 20px #0ef, inset 0 0 10px #0ef; opacity: 0.8; }
                    50% { transform: scale(1.1); box-shadow: 0 0 50px #0ef, inset 0 0 20px #0ef; opacity: 1; }
                    100% { transform: scale(1); box-shadow: 0 0 20px #0ef, inset 0 0 10px #0ef; opacity: 0.8; }
                }
                @keyframes orb-rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .neural-orb {
                    width: 60px; height: 60px; border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #fff, #0ef 60%, #002);
                    animation: orb-glow 3s infinite ease-in-out;
                    position: relative; margin: 0 auto 20px auto;
                }
                .orb-ring {
                    position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px;
                    border: 1px dashed #0ef; border-radius: 50%;
                    animation: orb-rotate 10s linear infinite; opacity: 0.4;
                }
                .chat-scroll::-webkit-scrollbar { width: 0px; }
            `}</style>

            {/* AI INTERACTIVE HEAD */}
            <div style={styles.headerArea}>
                <div className="neural-orb">
                    <div className="orb-ring"></div>
                </div>
                <div style={styles.badge}>FRESHFLOW SMART AGENT</div>
            </div>

            {/* CHAT WINDOW (Adjustable/Flexible) */}
            <div className="chat-scroll" style={styles.chatWindow}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ 
                        marginBottom: '15px', 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%' 
                    }}>
                        <div style={{ 
                            background: msg.role === 'user' ? 'rgba(0, 238, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            border: msg.role === 'user' ? '1px solid #0ef' : '1px solid rgba(255,255,255,0.1)',
                            padding: '15px 20px', borderRadius: '15px', color: '#fff',
                            fontSize: '0.95rem', lineHeight: '1.5', backdropFilter: 'blur(10px)'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isThinking && <div style={{ color: '#0ef', fontSize: '0.8rem', letterSpacing: '2px' }}>AI IS ANALYZING...</div>}
                <div ref={chatEndRef} />
            </div>

            {/* FLOATING INPUT COMMAND BAR */}
            <div style={styles.inputArea}>
                <form onSubmit={askAI} style={styles.form}>
                    <input 
                        style={styles.input}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Message FreshFlow AI..."
                        disabled={isThinking}
                    />
                    <button type="submit" style={isThinking ? styles.btnDisabled : styles.btn}>
                        {isThinking ? "●" : "→"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { 
        height: '80vh', width: '100%', display: 'flex', flexDirection: 'column', 
        padding: '20px', boxSizing: 'border-box' 
    },
    headerArea: { textAlign: 'center', marginBottom: '20px' },
    badge: { 
        fontSize: '0.6rem', color: '#0ef', letterSpacing: '4px', fontWeight: '900', 
        background: 'rgba(0,238,255,0.1)', padding: '5px 15px', borderRadius: '50px',
        display: 'inline-block', border: '1px solid rgba(0,238,255,0.3)' 
    },
    chatWindow: { 
        flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', 
        padding: '10px', marginBottom: '20px' 
    },
    inputArea: { 
        background: 'rgba(255,255,255,0.05)', borderRadius: '25px', padding: '10px 15px',
        border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' 
    },
    form: { display: 'flex', alignItems: 'center', gap: '10px' },
    input: { 
        flex: 1, background: 'transparent', border: 'none', color: '#fff', 
        padding: '10px', outline: 'none', fontSize: '1rem' 
    },
    btn: { 
        width: '45px', height: '45px', borderRadius: '50%', background: '#0ef', 
        border: 'none', color: '#000', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' 
    },
    btnDisabled: { 
        width: '45px', height: '45px', borderRadius: '50%', background: '#1a1a1a', 
        border: 'none', color: '#444', cursor: 'not-allowed' 
    }
};

export default AiAgent;