import React, { useRef, useEffect } from 'react';

const DocumentViewer = ({ text, highlightRange, onClearHighlight }) => {
  const highlightRef = useRef(null);

  useEffect(() => {
    if (highlightRange && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightRange]);

  const renderContent = () => {
    if (!text) return <p className="text-gray-500 italic">No document text available.</p>;
    
    if (!highlightRange) {
      return <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-serif">{text}</div>;
    }

    const { startIndex, endIndex } = highlightRange;
    
    // Ensure bounds are valid
    const safeStart = Math.max(0, startIndex);
    const safeEnd = Math.min(text.length, endIndex);
    
    const beforeText = text.substring(0, safeStart);
    const highlightedText = text.substring(safeStart, safeEnd);
    const afterText = text.substring(safeEnd);

    return (
      <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-serif">
        {beforeText}
        <mark ref={highlightRef} id="highlighted-section" className="bg-amber-200 py-0.5 rounded px-1 transition-all">
          {highlightedText}
        </mark>
        {afterText}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Original Document</h2>
        {highlightRange && (
          <button
            onClick={onClearHighlight}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Clear highlight
          </button>
        )}
      </div>
      <div className="p-6 overflow-y-auto flex-1 h-[600px] bg-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default DocumentViewer;
