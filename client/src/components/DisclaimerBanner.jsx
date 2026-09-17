import React from 'react';

const DisclaimerBanner = () => {
  return (
    <div
      role="alert"
      className="w-full bg-indigo-600 text-white text-center py-3 px-4 font-medium text-sm shadow-sm"
    >
      ⚖️ This tool explains what's in your document. It is not legal advice. Always consult a qualified attorney for legal decisions.
    </div>
  );
};

export default DisclaimerBanner;
