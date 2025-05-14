import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { HRChatbot } from './query.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(join(__dirname, 'static')));

// Initialize chatbot
const chatbot = new HRChatbot();

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'static', 'index.html'));
});

app.get('/status', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    res.json(response.status === 200);
  } catch (error) {
    res.json(false);
  }
});

app.post('/ask', async (req, res) => {
  const startTime = new Date();
  const { question, doc_type = 'contrato' } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ error: 'No question provided' });
  }

  if (!['internos', 'contrato'].includes(doc_type)) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  try {
    const [answer, sources] = await chatbot.ask(question, doc_type);
    res.json({
      response: answer,
      sources,
      processing_time: new Date() - startTime
    });
  } catch (error) {
    console.error('Error processing question:', error);
    res.status(500).json({
      error: 'An error occurred while processing your question',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});