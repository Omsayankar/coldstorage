import React, { useState, useEffect, useRef } from 'react';

const AiAgent = (props) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Neural Link Established. Good day, Sir. I am Smart Eco, your unrestricted AI companion. Ask me to scan the database, fetch full item details, or command me to directly insert items into the server via natural language." }
    ]);
    const [userInput, setUserInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const performTypingSim = async (text) => {
        setIsThinking(true);
        setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
        for (let i = 0; i <= text.length; i++) {
            await new Promise(r => setTimeout(r, 8));
            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = text.substring(0, i);
                return newMsgs;
            });
        }
        setIsThinking(false);
    };

    const askAI = async (e) => {
        if (e) e.preventDefault();
        if (!userInput.trim() || isThinking) return;

        const input = userInput.toLowerCase();
        setUserInput("");
        setMessages(prev => [...prev, { role: 'user', content: userInput }]);

        let responseText = "Sir, I do not understand that command. Try asking to 'list all items' or 'add 50 milk price 40 expiry 5 days rating 5'.";

        if (!props.inventoryData) {
             responseText = "Sir, I do not currently have access to the global asset database. The data stream appears to be offline.";
             performTypingSim(responseText);
             return;
        }

        const items = props.inventoryData;

        // 1. DATABASE LISTING / DETAILS REPORTING
        if (input.includes('detail') || input.includes('list') || input.includes('show') || input.includes('database') || input.includes('all items')) {
            if (items.length === 0) {
                responseText = "The database is entirely empty, Sir. We have 0 items logged.";
            } else {
                let lines = items.map(it => 
                    `► ${it.name.toUpperCase()} — Qty: ${it.qty} | Value: ₹${(it.price || 0)*(it.qty || 1)} (₹${it.price||0}/ea) | Expires in: ${it.days_left} Days | Quality: ${it.quality} (${it.rating||0}★)`
                );
                responseText = `Accessing Database... Found ${items.length} records. Here are the precise details:\n\n` + lines.join('\n');
            }
        } 
        
        // 2. ITEM DELETION
        else if (input.match(/(?:delete|remove|erase)\s+([a-z0-9\s]+)/i)) {
             const delMatch = input.match(/(?:delete|remove|erase)\s+([a-z0-9\s]+)/i);
             const targetName = delMatch[1].trim().toLowerCase();
             const targetItem = items.find(it => it.name && it.name.toLowerCase().includes(targetName));
             
             if (targetItem) {
                 responseText = `Target acquired. Executing permanent deletion sequence for "${targetItem.name}" from the core system.`;
                 fetch(`http://localhost:8080/api/items/${targetItem.id}`, { method: 'DELETE' }).then(() => { if (props.refreshData) props.refreshData(); });
             } else {
                 responseText = `I apologize, Sir. I could not locate any item matching "${targetName}" in the database to delete.`;
             }
        } 
        
        // 3. FULL NLP ITEM ADDITION
        else if (input.includes('add') || input.includes('insert') || input.includes('create')) {
             let qty = 1, price = 0, expiryDateStr = '', quality = 'Excellent', rating = 5;
             
             // Extract Qty
             const qtyMatch = input.match(/(\d+)\s*(?:units?|boxes|crates|pcs|pieces)?/i);
             if (qtyMatch) qty = parseInt(qtyMatch[1]);

             // Extract Price
             const priceMatch = input.match(/price(?: is)?\s*(\d+)|at\s*(\d+)/i);
             if (priceMatch) price = parseFloat(priceMatch[1] || priceMatch[2]);

             // Extract Expiry
             const expiryMatch = input.match(/expir(?:y|es)?\s*(?:in\s*)?(\d+)\s*day/i);
             if (expiryMatch) {
                 const ed = new Date(); ed.setDate(ed.getDate() + parseInt(expiryMatch[1]));
                 expiryDateStr = ed.toISOString().split('T')[0];
             }

             // Extract Rating
             const ratingMatch = input.match(/rating\s*(\d+)|(\d+)\s*star/i);
             if (ratingMatch) rating = parseInt(ratingMatch[1] || ratingMatch[2]);

             // Extract Quality
             if (input.includes('poor')) quality = 'Poor';
             else if (input.includes('average')) quality = 'Average';
             else if (input.includes('good')) quality = 'Good';

             // Extract Name intelligently
             let nameRaw = input.replace(/add|insert|create/gi, '')
                                .replace(new RegExp(`price(?: is)?\\s*${price}|at\\s*${price}`, 'gi'), '')
                                .replace(new RegExp(`expir(?:y|es)?\\s*(?:in\\s*)?${expiryMatch ? expiryMatch[1] : ''}\\s*days?`, 'gi'), '')
                                .replace(new RegExp(`rating\\s*${rating}|${rating}\\s*star`, 'gi'), '')
                                .replace(new RegExp(`${qty}\\s*(?:units?|boxes|crates|pcs|pieces)?`, 'gi'), '')
                                .replace(/excellent|good|average|poor/gi, '')
                                .replace(/food|category|item/gi, '')
                                .replace(/[^\w\s-]/gi, '')
                                .trim();
             
             // Condense spaces
             const name = nameRaw.replace(/\s+/g, ' ') || "System Item";

             const newItem = { name, qty, price, vendor: 'AI Sourced', stored: new Date().toISOString().split('T')[0], expiry: expiryDateStr, category: 'GENERAL', quality, rating };
             
             responseText = `Acknowleged, Sir. I have parsed the request and autonomously inserted "${name.toUpperCase()}" into the database.\n\n[INJECTED DATA] ► QTY: ${qty} | PRICE: ₹${price} | EXPIRY: ${expiryMatch ? expiryMatch[1] + " Days" : "N/A"} | SUPPLIER: ${quality} (${rating}★)`;
             
             fetch(`http://localhost:8080/api/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) })
                .then(() => { if (props.refreshData) props.refreshData(); });
        } 
        
        // 4. GENERAL STATUS AND STATS
        else if (input.includes('status') || input.includes('overall') || input.includes('report') || input.includes('value') || input.includes('worth')) {
             let totalValue = 0, expiringCount = 0;
             items.forEach(item => { totalValue += (item.price || 0) * (item.qty || 1); if (item.days_left <= 7) expiringCount++; });
             responseText = `System status: You have ${items.length} active SKUs. Total capital valuation is exactly ₹${totalValue.toLocaleString()}. We have ${expiringCount} item(s) currently sitting in the critical 7-day expiry zone. Operations are nominal.`;
        } 
        else if (input.includes('hello') || input.includes('hi')) {
             responseText = "Greetings, Sir. I am ready. You can command me like a true AI. Try asking to 'show database details' or 'add 100 mechanical keyboards price 2000 expiry 365 days rating 5 good'.";
        } 
        else {
             // Fallback search
             const searched = items.filter(it => it.name && it.name.toLowerCase().includes(input.replace(/[^\w\s]/gi, '')));
             if (searched.length > 0) {
                 const top = searched[0];
                 responseText = `I queried your intent and found a database record for "${top.name}". We currently have ${top.qty} unit(s) in stock valued at ₹${(top.price||0)*top.qty}. The supplier quality is rated as ${top.quality} (${top.rating || 0}-Stars) and it expires in ${top.days_left} Days.`;
             }
        }

        performTypingSim(responseText);
    };

    return (
        <div style={styles.pageContainer}>
            <style>{`
                .neural-orb { width: 50px; height: 50px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff, #00ff88 65%, #001a0e); animation: orb-glow 4s infinite ease-in-out; margin: 0 auto; }
                @keyframes orb-glow { 0% { transform: scale(1); box-shadow: 0 0 20px #00ff8833; } 50% { transform: scale(1.05); box-shadow: 0 0 50px #00ff8888; } 100% { transform: scale(1); box-shadow: 0 0 20px #00ff8833; } }
                .chat-scroll::-webkit-scrollbar { width: 0px; }
            `}</style>

            <div style={styles.header}>
                <div className="neural-orb"></div>
                <div style={styles.statusBadge}>SMART ECO // PURE_NLP_INTELLIGENCE</div>
            </div>

            <div className="chat-scroll" style={styles.chatWindow}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '20px', maxWidth: '85%', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ 
                            background: msg.role === 'user' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            border: msg.role === 'user' ? '1px solid #00ff8866' : '1px solid rgba(0,255,136,0.2)',
                            padding: '16px 24px', borderRadius: '24px', 
                            color: '#fff', fontSize: '1.05rem', lineHeight: '1.6',
                            backdropFilter: 'blur(15px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            whiteSpace: 'pre-line' // Important for parsing \n in reports
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
                        placeholder="Command me directly, Sir. E.g. 'Add 50 milk price 40 expiry 5 days rating 5' or 'List database details'"
                        disabled={isThinking}
                    />
                    <button type="submit" style={isThinking ? styles.btnDisabled : styles.btnChat}>
                        {isThinking ? "..." : "EXECUTE"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { height: '82vh', display: 'flex', flexDirection: 'column', padding: '10px', maxWidth: '1000px', margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '30px' },
    statusBadge: { fontSize: '0.65rem', color: '#00ff88', letterSpacing: '5px', fontWeight: '900', opacity: 0.6 },
    chatWindow: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '0 10px' },
    inputArea: { background: 'rgba(255,255,255,0.05)', borderRadius: '50px', padding: '8px 25px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', backdropFilter: 'blur(10px)' },
    inputForm: { display: 'flex', alignItems: 'center', gap: '15px' },
    input: { flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '1.1rem' },
    btnChat: { background: '#00ff88', border: 'none', color: '#000', fontWeight: '900', padding: '12px 30px', borderRadius: '30px', cursor: 'pointer', transition: '0.3s' },
    btnDisabled: { background: '#111', color: '#333', padding: '12px 30px', borderRadius: '30px', cursor: 'not-allowed' }
};

export default AiAgent;