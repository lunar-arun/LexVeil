import React, { useState } from 'react';
import DocumentViewer from './DocumentViewer';
import ClauseList from './ClauseList';
import ChatPanel from './ChatPanel';
import ExportButton from './ExportButton';
import { useChat } from '../hooks/useChat';

const AnalysisView = ({ analysis, originalText, documentId }) => {
  const [highlightRange, setHighlightRange] = useState(null);
  const [selectedClauseId, setSelectedClauseId] = useState(null);
  const { messages, isLoading, error, sendQuestion } = useChat(documentId);

  const handleSelectClause = (clause) => {
    setSelectedClauseId(clause.id);
    if (clause.startIndex !== undefined && clause.endIndex !== undefined) {
      setHighlightRange({ startIndex: clause.startIndex, endIndex: clause.endIndex });
    }
  };

  const handleCitationClick = (citation) => {
    if (citation.startIndex !== undefined && citation.endIndex !== undefined) {
      setHighlightRange({ startIndex: citation.startIndex, endIndex: citation.endIndex });
    }
  };

  const handleClearHighlight = () => {
    setHighlightRange(null);
    setSelectedClauseId(null);
  };

  const clauses = analysis?.clauses || [];
  const highRiskCount = clauses.filter(c => c.riskLevel?.toLowerCase() === 'high').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Analysis Complete</h1>
            {analysis?.documentType && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                {analysis.documentType}
              </span>
            )}
          </div>
          <p className="text-gray-700 max-w-3xl">{analysis?.summary || 'Document analysis has been completed.'}</p>
        </div>
        <div className="flex flex-col md:items-end gap-3">
          <div className="text-sm text-gray-500 md:text-right">
            <div className="font-medium text-gray-900">{clauses.length} clauses analyzed</div>
            <div>{highRiskCount} flagged as high risk</div>
          </div>
          <ExportButton documentId={documentId} />
        </div>
      </div>

      {/* Document viewer + clause list */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        <div className="w-full lg:w-3/5 h-[600px]">
          <DocumentViewer 
            text={originalText} 
            highlightRange={highlightRange}
            onClearHighlight={handleClearHighlight}
          />
        </div>
        <div className="w-full lg:w-2/5 h-[600px]">
          <ClauseList 
            clauses={clauses} 
            onSelectClause={handleSelectClause}
            selectedClauseId={selectedClauseId}
          />
        </div>
      </div>

      {/* Q&A Chat panel */}
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendQuestion={sendQuestion}
        onCitationClick={handleCitationClick}
      />
    </div>
  );
};

export default AnalysisView;
