import React from 'react';

const ClauseList = ({ clauses, onSelectClause, selectedClauseId }) => {
  if (!clauses || clauses.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
        <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium text-gray-900">No significant clauses flagged</p>
        <p className="text-gray-500 mt-2">This document looks standard based on our analysis.</p>
      </div>
    );
  }

  const getRiskStyles = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLabel = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      default:
        return 'Unknown Risk';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg">
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">Analyzed Clauses</h2>
        <p className="text-sm text-gray-500 mt-1">{clauses.length} clauses flagged for review</p>
      </div>
      <div className="p-4 overflow-y-auto flex-1 h-[600px] space-y-4">
        {clauses.map((clause, idx) => {
          const isSelected = selectedClauseId === clause.id || selectedClauseId === idx;
          const riskStyle = getRiskStyles(clause.riskLevel);
          const riskLabel = getRiskLabel(clause.riskLevel);
          
          return (
            <button
              key={clause.id || idx}
              onClick={() => onSelectClause(clause)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                isSelected 
                  ? 'border-indigo-500 ring-2 ring-indigo-200 bg-white shadow-md' 
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${riskStyle}`}>
                  {riskLabel}
                </span>
                {clause.reviewRecommended && (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center">
                    <span className="mr-1">⚠️</span> Review Recommended
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-gray-900 mb-1">{clause.title || 'Clause'}</h3>
              <p className="text-sm text-gray-700 mb-3">{clause.explanation}</p>
              
              <details className="mt-2 group" onClick={(e) => e.stopPropagation()}>
                <summary className="text-xs font-medium text-indigo-600 cursor-pointer hover:text-indigo-800 list-none flex items-center">
                  <svg className="w-4 h-4 mr-1 transform group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  View original text
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 italic border border-gray-100">
                  "{clause.sourceText}"
                </div>
              </details>
              
              {clause.confidence === 'low' && (
                <div className="mt-3 text-xs text-amber-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Low confidence — verify with a professional
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClauseList;
