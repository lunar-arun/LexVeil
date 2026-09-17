import { useState } from 'react';
import { askQuestion } from '../services/api';

export const useChat = (documentId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendQuestion = async (question) => {
    if (!documentId || !question.trim()) return;

    setIsLoading(true);
    setError(null);

    const userMessage = { role: 'user', content: question, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await askQuestion(documentId, question);

      const assistantMessage = {
        role: 'assistant',
        content: result.answer,
        citations: result.citations || [],
        confidence: result.confidence,
        canAnswer: result.canAnswer,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    isLoading,
    error,
    sendQuestion,
    clearChat,
  };
};
