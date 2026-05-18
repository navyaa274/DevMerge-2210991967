import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, User, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import aiService from '../../services/api/aiService';

const AITutor = ({ tutorId, courseId, problemId, context = {} }) => {
  const [tutor, setTutor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadTutor();
    loadConversationHistory();
  }, [tutorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTutor = async () => {
    try {
      const response = await aiService.getTutorById(tutorId);
      setTutor(response.data);
    } catch (error) {
      console.error('Error loading tutor:', error);
    }
  };

  const loadConversationHistory = async () => {
    try {
      const response = await aiService.getConversationHistory({ tutorId });
      if (response.data.conversations.length > 0) {
        setConversation(response.data.conversations[0]);
        setMessages(aiService.formatConversationMessages(response.data.conversations[0].messages));
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: newMessage,
      timestamp: new Date(),
      formattedTimestamp: new Date().toLocaleString(),
      isUser: true,
      isAssistant: false
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.askQuestion(tutorId, {
        message: newMessage,
        context: {
          ...context,
          course_id: courseId,
          problem_id: problemId
        },
        session_id: conversation?.session_id
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        formattedTimestamp: new Date().toLocaleString(),
        isUser: false,
        isAssistant: true,
        confidence: response.data.confidence,
        suggestions: response.data.suggestions,
        hasMetadata: true,
        metadata: {
          confidence: response.data.confidence,
          suggestions: response.data.suggestions
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update conversation if this is the first message
      if (!conversation) {
        const newConversation = {
          session_id: response.data.session_id,
          ai_tutor_id: tutorId
        };
        setConversation(newConversation);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        formattedTimestamp: new Date().toLocaleString(),
        isUser: false,
        isAssistant: true,
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRateConversation = async () => {
    if (!conversation) return;

    try {
      await aiService.rateConversation(conversation._id || conversation.session_id, rating, feedback);
      setShowRating(false);
      setRating(0);
      setFeedback('');
    } catch (error) {
      console.error('Error rating conversation:', error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversation(null);
    setShowRating(false);
  };

  if (!tutor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">{tutor.name}</h3>
            <p className="text-sm opacity-90">{tutor.subject} Tutor</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={startNewConversation}
            className="px-3 py-1 bg-white bg-opacity-20 rounded-md text-sm hover:bg-opacity-30 transition-colors"
          >
            New Chat
          </button>
          <button
            onClick={() => setShowRating(true)}
            className="p-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors"
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Start a conversation with {tutor.name}</p>
            <p className="text-sm">Ask questions about {tutor.subject} or get help with your studies!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {message.isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-70">{message.formattedTimestamp}</span>
                </div>
                <p className="text-sm">{message.content}</p>
                {message.hasMetadata && message.suggestions && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Suggestions:</p>
                    <ul className="text-xs space-y-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-center space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Rate your conversation</h3>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="w-full h-full fill-current" />
                </button>
              ))}
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional feedback..."
              className="w-full p-2 border rounded-md mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRating(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRateConversation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${tutor.name} a question...`}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Press Enter to send</span>
          {conversation && (
            <span>Session: {conversation.session_id?.substring(0, 8)}...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITutor;
