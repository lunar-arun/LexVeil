import { useState } from 'react';
import { uploadDocument, uploadText as uploadTextApi } from '../services/api';

export const useDocumentAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadDocument(file);
      setAnalysis({ summary: data.summary, documentType: data.documentType, clauses: data.clauses });
      setOriginalText(data.originalText);
      setDocumentId(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadText = async (text) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadTextApi(text);
      setAnalysis({ summary: data.summary, documentType: data.documentType, clauses: data.clauses });
      setOriginalText(data.originalText);
      setDocumentId(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setOriginalText('');
    setDocumentId(null);
    setError(null);
  };

  return {
    analysis,
    originalText,
    documentId,
    isLoading,
    error,
    uploadFile,
    uploadText,
    reset,
  };
};
