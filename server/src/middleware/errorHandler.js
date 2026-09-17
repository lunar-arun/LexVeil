export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Max size is 10MB.', code: 400 });
    }
    return res.status(400).json({ error: err.message, code: 400 });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message, code: 400 });
  }
  
  if (err.status) {
      return res.status(err.status).json({ error: 'Gemini API Error: ' + err.message, code: err.status });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message, code: statusCode });
};
