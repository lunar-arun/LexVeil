import React from 'react';
import DisclaimerBanner from './components/DisclaimerBanner';
import DocumentUpload from './components/DocumentUpload';
import AnalysisView from './components/AnalysisView';
import { useDocumentAnalysis } from './hooks/useDocumentAnalysis';

function App() {
  const {
    analysis,
    originalText,
    documentId,
    isLoading,
    error,
    uploadFile,
    uploadText,
    reset,
  } = useDocumentAnalysis();

  return (
    <div className="min-h-screen flex flex-col">
      <DisclaimerBanner />
      
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700 tracking-tight">LexVeil</h1>
            <p className="text-sm text-gray-500 font-medium">Understand your legal documents</p>
          </div>
          {analysis && (
            <button 
              onClick={reset}
              className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              New Document
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 bg-gray-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div role="alert" className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm flex justify-between items-start">
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700 mt-1 text-sm">{error}</p>
              </div>
              <button 
                onClick={reset}
                className="text-red-600 hover:text-red-800 text-sm font-medium p-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {!analysis ? (
            <div className="mt-10">
              <DocumentUpload 
                onUploadFile={uploadFile} 
                onUploadText={uploadText} 
                isLoading={isLoading} 
              />
            </div>
          ) : (
            <AnalysisView 
              analysis={analysis} 
              originalText={originalText} 
              documentId={documentId} 
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
