import pdfParse from 'pdf-parse';

export const extractText = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Invalid or empty PDF buffer provided');
  }

  try {
    const data = await pdfParse(buffer);
    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }
    return {
      text: data.text,
      pageCount: data.numpages,
      info: data.info
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};
