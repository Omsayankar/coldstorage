import React, { useState, useEffect, useRef } from 'react';

const AiAgent = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Neural Link Established. Good day, Sir. I am Smart Eco, your unrestricted AI companion. I am fully synchronized and ready to assist you with any inquiry, logic, or task. How may I serve you today?" }
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

        const input = userInput;
        setUserInput("");
        
        // Add User Message
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        setIsThinking(true);

        try {
            const contextPrompt = `You are Smart Eco, a brilliant, polite AI assistant. Always address the user as 'Sir'. User Input: ${input}`;

            // Initialize the AI Response placeholder
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            // CALL PUTER AI WITH STREAMING ENABLED
            const response = await window.puter.ai.chat(contextPrompt, { 
                model: 'gpt-4o', 
                stream: true 
            });

            let fullResponse = "";

            // LOOP THROUGH THE STREAM (This makes it respond as it thinks)
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].content = fullResponse;
                        return newMsgs;
                    });
                }
            }

        } catch (err) {
            console.error("Neural Link Error:", err);
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = "I apologize, Sir. My neural link is experiencing a bridge timeout. Please ensure you are logged into Puter.js.";
                return newMsgs;
            });
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            <style>{`
                @keyframes orb-glow {
                    0% { transform: scale(1); box-shadow: 0 0 20px #00ff8833; }
                    50% { transform: scale(1.05); box-shadow: 0 0 50px #00ff8888; }
                    100% { transform: scale(1); box-shadow: 0 0 20px #00ff8833; }
                }
                .neural-orb {
                    width: 70px; height: 70px; border-radius: 50%;
                    background: radial-gradient(circle at 30% 30%, #fff, #00ff88 65%, #001a0e);
                    animation: orb-glow 4s infinite ease-in-out;
                    margin: 0 auto 15px auto;
                }
                .chat-scroll::-webkit-scrollbar { width: 0px; }
            `}</style>

            <div style={styles.header}>
                <div className="neural-orb"></div>
                <div style={styles.statusBadge}>SMART ECO // NEURAL_INTERFACE_V4</div>
            </div>

            <div className="chat-scroll" style={styles.chatWindow}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '20px', maxWidth: '85%', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ 
                            background: msg.role === 'user' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: msg.role === 'user' ? '1px solid #00ff8866' : '1px solid rgba(255,255,255,0.1)',
                            padding: '16px 24px', borderRadius: '24px', 
                            color: '#fff', fontSize: '1.05rem', lineHeight: '1.6',
                            backdropFilter: 'blur(15px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}>
                            {msg.content || (msg.role === 'assistant' && i === messages.length-1 ? "● ● ●" : "")}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <div style={styles.inputArea}>
                <form onSubmit={askAI} style={styles.inputForm}>
                    <input 
                        style={styles.input}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Inquire about anything, Sir..."
                        disabled={isThinking}
                    />
                    <button type="submit" style={isThinking ? styles.btnDisabled : styles.btn}>
                        {isThinking ? "..." : "SEND"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { height: '82vh', display: 'flex', flexDirection: 'column', padding: '10px' },
    header: { textAlign: 'center', marginBottom: '30px' },
    statusBadge: { fontSize: '0.65rem', color: '#00ff88', letterSpacing: '5px', fontWeight: '900', opacity: 0.6 },
    chatWindow: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '0 10px' },
    inputArea: { background: 'rgba(255,255,255,0.05)', borderRadius: '50px', padding: '8px 25px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', backdropFilter: 'blur(10px)' },
    inputForm: { display: 'flex', alignItems: 'center', gap: '15px' },
    input: { flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '1.1rem' },
    btn: { background: '#00ff88', border: 'none', color: '#000', fontWeight: '900', padding: '12px 30px', borderRadius: '30px', cursor: 'pointer', transition: '0.3s' },
    btnDisabled: { background: '#111', color: '#333', padding: '12px 30px', borderRadius: '30px', cursor: 'not-allowed' }
};

export default AiAgent;