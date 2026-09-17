import React, { useState, useRef } from 'react';

const DocumentUpload = ({ onUploadFile, onUploadText, isLoading }) => {
  const [activeTab, setActiveTab] = useState('pdf');
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUploadFile(selectedFile);
    }
  };

  const handleAnalyzeTextClick = () => {
    if (text.trim()) {
      onUploadText(text);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-gray-700">Analyzing your document...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'pdf' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('pdf')}
        >
          Upload PDF
        </button>
        <button
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'text' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('text')}
        >
          Paste Text
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'pdf' ? (
          <div className="flex flex-col items-center">
            <div
              className={`w-full p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                aria-label="Upload PDF file"
              />
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 mb-2">Drag and drop your PDF here, or click to browse</p>
              <p className="text-sm text-gray-500">Only PDF files are supported</p>
            </div>
            
            {selectedFile && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200 w-full flex justify-between items-center">
                <span className="text-sm text-gray-700 font-medium truncate pr-4">{selectedFile.name}</span>
                <button
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            <button
              className={`mt-6 w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                selectedFile ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
              onClick={handleUploadClick}
              disabled={!selectedFile}
            >
              Analyze Document
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            <label htmlFor="text-upload" className="sr-only">Paste your document text</label>
            <textarea
              id="text-upload"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px] resize-y"
              placeholder="Paste your legal document text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
            <div className="mt-2 text-right text-sm text-gray-500">
              {text.length} characters
            </div>
            <button
              className={`mt-4 w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                text.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 cursor-not-allowed'
              }`}
              onClick={handleAnalyzeTextClick}
              disabled={!text.trim()}
            >
              Analyze Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
