import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);  

const ChatBot = ({ session }) => {
  const [input, setInput] = useState(""); // Stores user input
  const [messages, setMessages] = useState([]); // Stores chat messages
  const chatEndRef = useRef(null); // Used to auto-scroll chat to the latest message
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Add this useEffect to create/get conversation when component mounts
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Get or create a conversation
        const { data: existingConversation, error: fetchError } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (existingConversation && existingConversation.length > 0) {
          setCurrentConversationId(existingConversation[0].id);
        } else {
          // Create new conversation
          const { data: newConversation, error: insertError } = await supabase
            .from('conversations')
            .insert({ user_id: session.user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          setCurrentConversationId(newConversation.id);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };

    initializeConversation();
  }, [session]);

  // Add this useEffect to load previous messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentConversationId) return;

      try {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', currentConversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages = messages.map(msg => ({
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'bot'
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [currentConversationId]);

  // Function to send user message to ChatGPT API
  const sendMessage = async () => {
    if (!input.trim() || !currentConversationId) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      // Store user message
      await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          user_id: session.user.id,
          content: input,
          role: 'user'
        });

      // Get ChatGPT response
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, 
        { prompt: input },
        { headers: { "Content-Type": "application/json" }}
      );

      const botMessage = { text: res.data, sender: "bot" };
      
      // Store bot response
      await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversationId,
          user_id: session.user.id,
          content: res.data,
          role: 'assistant'
        });

      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...messages, userMessage, { text: "Error fetching response", sender: "bot" }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.position-relative')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  // Add a sign out button in the header
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="card shadow-lg" style={{ maxWidth: '1200px', margin: '0 auto', borderRadius: '15px' }}>
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center" 
             style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px', padding: '1rem' }}>
          <div className="d-flex align-items-center">
            <i className="fas fa-robot me-2 fa-lg"></i>
            <h4 className="mb-0">SECURE CHATBOT</h4>
          </div>
          <div className="position-relative">
            <button 
              className="btn btn-light btn-sm rounded-circle"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ width: '40px', height: '40px' }}
            >
              <i className="fas fa-user-circle fa-lg"></i>
            </button>
            
            {showDropdown && (
              <div className="position-absolute end-0 mt-2 py-2 bg-white rounded-3 shadow-lg" 
                   style={{ 
                     minWidth: '200px', 
                     zIndex: 1000,
                     animation: 'fadeIn 0.2s ease-in-out'
                   }}>
                <div className="px-3 py-2 border-bottom">
                  <div className="text-dark fw-bold">{session.user.email}</div>
                  {session.user.user_metadata?.full_name && (
                    <small className="text-muted">{session.user.user_metadata.full_name}</small>
                  )}
                </div>
                <button 
                  className="btn btn-link text-danger text-decoration-none w-100 text-start px-3 py-2"
                  onClick={handleSignOut}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="message-box p-4" 
             style={{ 
               height: "600px", 
               overflowY: "auto",
               backgroundColor: '#f8f9fa',
               scrollBehavior: 'smooth'
             }}>
          {messages.map((msg, index) => (
            <div key={index} 
                 className={`d-flex ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"} mb-3`}>
              <div className={`message p-3 rounded-3 shadow-sm ${
                msg.sender === "user" 
                  ? "bg-primary text-white" 
                  : "bg-success-subtle"}`}
                   style={{
                     maxWidth: '60%',
                     position: 'relative',
                     animation: 'fadeIn 0.5s ease-in-out',
                     textAlign: 'left'
                   }}>
                {msg.text}
                <small className="d-block mt-1 text-end" 
                       style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                  {msg.sender === "user" ? "You" : "Bot"}
                </small>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="card-footer p-4" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
          <div className="input-group">
            <input
              type="text"
              className="form-control rounded-start py-2"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ border: '1px solid #dee2e6', fontSize: '1rem' }}
            />
            <button 
              className="btn btn-primary px-4 rounded-end"
              onClick={sendMessage}
              style={{ 
                transition: 'all 0.3s ease',
                minWidth: '120px'
              }}
            >
              <i className="fas fa-paper-plane me-2"></i>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;