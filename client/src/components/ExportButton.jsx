import React, { useState } from 'react';
import { exportBrief } from '../services/api';
import { generateBriefPdf } from '../services/pdfExport';

const ExportButton = ({ documentId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleExport = async () => {
    if (!documentId || isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const briefData = await exportBrief(documentId);
      generateBriefPdf(briefData);
    } catch (err) {
      setExportError(err.message || 'Failed to generate lawyer brief.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleExport}
        disabled={isExporting || !documentId}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
        title="Download a structured summary prepared for consultation with a lawyer"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating Brief...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Prep for My Lawyer (PDF)</span>
          </>
        )}
      </button>
      {exportError && (
        <span className="text-xs text-red-600 mt-1 font-medium">{exportError}</span>
      )}
    </div>
  );
};

export default ExportButton;
