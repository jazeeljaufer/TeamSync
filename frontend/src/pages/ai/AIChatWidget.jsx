import React, { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../../services/aiService";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send as SendIcon, Trash2, Sparkles } from "lucide-react";
import "./AIChatWidget.css";

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("teamsync_chat_history");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Hello! I am your TeamSync AI Assistant. I can check live data from MongoDB and answer questions about your team, reports, blockers, and workflows.", sender: "ai" }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatBodyRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("teamsync_chat_history", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      const initialMessage = [
        { id: 1, text: "Hello! I am your TeamSync AI Assistant. I can check live data from MongoDB and answer questions about your team, reports, blockers, and workflows.", sender: "ai" }
      ];
      setMessages(initialMessage);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage = { id: Date.now(), text: query, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await chatWithAI(query, chatHistory);
      const aiText = response.response || "No response received from the assistant.";
      
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: "ai" }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: `Error: ${error.message || "Failed to communicate with AI server."}`, 
        sender: "ai",
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const suggestions = [
    { label: "Pending reports?", text: "Who has pending reports this week?" },
    { label: "Blockers", text: "Show all blockers this week." },
    { label: "Team Summary", text: "Summarize this week's team activity." },
    { label: "Reporting Workflow", text: "Explain the complete report submission workflow step by step." }
  ];

  const renderFormattedContent = (text) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements = [];
    let currentTable = null;
    let inTable = false;
    let currentList = null;
    let inList = false;

    const flushList = (key) => {
      if (currentList) {
        elements.push(<ul key={`ul-${key}`} className="chat-markdown-ul">{currentList}</ul>);
        currentList = null;
        inList = false;
      }
    };

    const flushTable = (key) => {
      if (currentTable) {
        elements.push(
          <div key={`table-wrapper-${key}`} className="chat-table-wrapper">
            <table className="chat-markdown-table">
              <thead>
                <tr>
                  {currentTable.headers.map((h, i) => <th key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {currentTable.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        currentTable = null;
        inTable = false;
      }
    };

    const inlineParse = (str) => {
      if (!str) return "";
      const parts = [];
      let lastIndex = 0;
      const regex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          parts.push(str.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
      }
      return parts.length > 0 ? parts : str;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("|")) {
        flushList(i);
        
        const cells = line.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        if (!inTable) {
          inTable = true;
          currentTable = { headers: cells, rows: [] };
        } else {
          const isSeparator = cells.every(c => /^:-*|-*:$/g.test(c) || /^-+$/g.test(c));
          if (!isSeparator) {
            currentTable.rows.push(cells.map(c => inlineParse(c)));
          }
        }
        continue;
      } else {
        flushTable(i);
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!inList) {
          inList = true;
          currentList = [];
        }
        const itemContent = line.replace(/^[-*]\s+/, "");
        currentList.push(<li key={`li-${i}`}>{inlineParse(itemContent)}</li>);
        continue;
      } else {
        flushList(i);
      }

      if (line.startsWith("###")) {
        elements.push(<h4 key={i} className="chat-markdown-h4">{inlineParse(line.replace(/^###\s+/, ""))}</h4>);
      } else if (line.startsWith("##")) {
        elements.push(<h3 key={i} className="chat-markdown-h3">{inlineParse(line.replace(/^##\s+/, ""))}</h3>);
      } else if (line.startsWith("#")) {
        elements.push(<h2 key={i} className="chat-markdown-h2">{inlineParse(line.replace(/^#\s+/, ""))}</h2>);
      } else if (line !== "") {
        elements.push(<p key={i} className="chat-markdown-p">{inlineParse(line)}</p>);
      }
    }

    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  return (
    <div className={`ai-chat-widget ${isOpen ? "open" : ""}`} id="teamsync-ai-chat-widget">
      {!isOpen && (
        <button 
          className="chat-toggle-btn" 
          onClick={toggleChat} 
          aria-label="Open AI Assistant"
          id="ai-widget-toggle-btn"
        >
          <Bot size={28} />
          <span className="notification-glowing-dot"></span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="chat-window"
            id="ai-chat-window-panel"
          >
            <div className="chat-header">
              <div className="chat-title">
                <Sparkles className="sparkle-icon" size={18} />
                <span>TeamSync AI</span>
                <span className="ai-badge">Gemini</span>
              </div>
              <div className="chat-header-actions">
                <button 
                  className="chat-action-btn" 
                  onClick={handleClearChat} 
                  title="Clear conversation"
                  aria-label="Clear chat history"
                  id="ai-chat-clear-btn"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  className="chat-action-btn close" 
                  onClick={toggleChat}
                  aria-label="Close panel"
                  id="ai-chat-close-btn"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="chat-body" ref={chatBodyRef} id="ai-chat-body-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.sender} ${msg.isError ? "error" : ""}`}>
                  <div className="message-avatar">
                    {msg.sender === "ai" ? <Bot size={16} /> : <div className="user-initial">M</div>}
                  </div>
                  <div className="message-bubble">
                    <div className="message-content">
                      {msg.sender === "ai" ? renderFormattedContent(msg.text) : msg.text}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="chat-message ai thinking-msg">
                  <div className="message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="message-bubble thinking-bubble">
                    <div className="thinking-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && !loading && (
              <div className="suggestion-chips" id="ai-chat-suggestions">
                <p className="suggestions-title">Common queries:</p>
                <div className="chips-container">
                  {suggestions.map((chip, idx) => (
                    <button 
                      key={idx} 
                      className="suggestion-chip" 
                      onClick={() => handleSend(chip.text)}
                      id={`ai-suggestion-chip-${idx}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form className="chat-input-area" onSubmit={handleSubmit} id="ai-chat-input-form">
              <input 
                type="text" 
                placeholder="Ask TeamSync AI about reports, blockers, or help..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                aria-label="Message prompt"
                id="ai-chat-input-field"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                aria-label="Send message"
                id="ai-chat-send-btn"
              >
                <SendIcon size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatWidget;
