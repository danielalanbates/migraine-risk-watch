const express = require('express');
const path = require('path');
const { interpretConditions } = require('./engine/ai_service');

// Optional OCR dependencies (app still works without them)
let Tesseract = null;
let multer = null;
try {
  // eslint-disable-next-line global-require
  Tesseract = require('tesseract.js');
  // eslint-disable-next-line global-require
  multer = require('multer');
} catch (e) {
  Tesseract = null;
  multer = null;
}

const upload = multer ? multer({ storage: multer.memoryStorage() }) : null;

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('web'));

// API endpoint for condition parsing
app.post('/api/parse', async (req, res) => {
  try {
    const { text, jurisdiction = 'CA' } = req.body;
    const obligations = await interpretConditions(text, jurisdiction);
    res.json({ obligations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optional image OCR endpoint (requires tesseract.js and multer)
if (upload && Tesseract) {
  app.post('/api/parse-image', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded.' });
      }

      const jurisdiction = req.body?.jurisdiction || 'CA';

      const { data } = await Tesseract.recognize(req.file.buffer, 'eng');
      const text = (data && data.text) || '';
      const obligations = await interpretConditions(text, jurisdiction);

      return res.json({ obligations, text });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Failed to process image.' });
    }
  });
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Justice app running at http://localhost:${PORT}`);
});
