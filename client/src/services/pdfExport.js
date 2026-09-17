import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DISCLAIMER = 'DISCLAIMER: This document is an AI-generated summary for informational purposes only. It is NOT legal advice. Always consult a qualified attorney for legal decisions.';

/**
 * Generates a professional PDF brief from structured brief data.
 */
export const generateBriefPdf = (briefData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const addPageIfNeeded = (requiredSpace = 30) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      yPos = 20;
    }
  };

  const addFooter = (pageNum) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(128, 128, 128);
    doc.text(DISCLAIMER, margin, pageHeight - 10, { maxWidth: contentWidth });
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
  };

  // Title
  doc.setFontSize(18);
  doc.setTextColor(55, 48, 163); // indigo-700
  doc.text(briefData.title || 'Legal Document Review Brief', margin, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
  yPos += 4;
  doc.text('Prepared by LexVeil — AI Document Analysis Tool', margin, yPos);
  yPos += 10;

  // Divider
  doc.setDrawColor(209, 213, 219); // gray-300
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Issue Summary
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39); // gray-900
  doc.text('Issue Summary', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81); // gray-700
  const summaryLines = doc.splitTextToSize(briefData.issueSummary || 'No summary available.', contentWidth);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * 5 + 8;

  // Flagged Clauses Table
  if (briefData.flaggedClauses && briefData.flaggedClauses.length > 0) {
    addPageIfNeeded(40);
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('Flagged Clauses', margin, yPos);
    yPos += 4;

    const tableData = briefData.flaggedClauses.map(clause => [
      clause.riskLevel?.toUpperCase() || 'N/A',
      clause.title || 'Untitled',
      clause.concern || '',
      `"${(clause.sourceText || '').substring(0, 120)}${(clause.sourceText || '').length > 120 ? '...' : ''}"`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Risk', 'Clause', 'Concern', 'Source Text']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [55, 48, 163], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: contentWidth - 98, fontStyle: 'italic' },
      },
      didParseCell: (data) => {
        if (data.column.index === 0 && data.section === 'body') {
          const risk = data.cell.raw;
          if (risk === 'HIGH') data.cell.styles.textColor = [185, 28, 28];
          else if (risk === 'MEDIUM') data.cell.styles.textColor = [180, 83, 9];
          else data.cell.styles.textColor = [21, 128, 61];
        }
      },
    });

    yPos = (doc.lastAutoTable?.finalY || yPos + 40) + 10;
  }

  // Questions Asked
  if (briefData.questionsAsked && briefData.questionsAsked.length > 0) {
    addPageIfNeeded(30);
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('Questions Reviewed', margin, yPos);
    yPos += 7;

    briefData.questionsAsked.forEach((qa, idx) => {
      addPageIfNeeded(20);
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39);
      doc.text(`${idx + 1}. ${qa.question}`, margin, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      const answerLines = doc.splitTextToSize(qa.answerSummary || '', contentWidth - 5);
      doc.text(answerLines, margin + 5, yPos);
      yPos += answerLines.length * 4.5 + 4;
    });

    yPos += 4;
  }

  // Suggested Questions for Lawyer
  if (briefData.suggestedLawyerQuestions && briefData.suggestedLawyerQuestions.length > 0) {
    addPageIfNeeded(30);
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text('Suggested Questions for Your Lawyer', margin, yPos);
    yPos += 7;

    briefData.suggestedLawyerQuestions.forEach((q, idx) => {
      addPageIfNeeded(12);
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const qLines = doc.splitTextToSize(`${idx + 1}. ${q}`, contentWidth - 5);
      doc.text(qLines, margin, yPos);
      yPos += qLines.length * 5 + 3;
    });
  }

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  doc.save('lexveil-legal-brief.pdf');
};
