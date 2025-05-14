import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chromadb from 'chromadb';
import fetch from 'node-fetch';
import { Document } from 'docx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DOCS_CONFIG = {
  contrato: {
    dir: './HR/contrato_colectivo',
    dbDir: './chroma_db_contrato',
    collection: 'documentos_contrato',
    chunkSize: 3000,
    chunkOverlap: 500,
    minChunkLength: 150
  },
  internos: {
    dir: './HR/documentos_internos',
    dbDir: './chroma_db_internos',
    collection: 'documentos_internos',
    chunkSize: 2000,
    chunkOverlap: 300,
    minChunkLength: 50
  }
};

async function checkOllamaConnection() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.status === 200;
  } catch (error) {
    console.error('Error connecting to Ollama:', error);
    return false;
  }
}

async function extractText(filePath) {
  try {
    const content = readFileSync(filePath);
    const doc = new Document(content);
    return doc.text;
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw error;
  }
}

function createChunks(text, config) {
  const chunks = [];
  const words = text.split(/\s+/);
  
  let startIdx = 0;
  while (startIdx < words.length) {
    const endIdx = Math.min(startIdx + config.chunkSize, words.length);
    let chunk = words.slice(startIdx, endIdx).join(' ');
    
    if (endIdx < words.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      if (lastPeriod > config.chunkSize - 200) {
        chunk = chunk.substring(0, lastPeriod + 1);
      }
    }
    
    if (chunk.length >= config.minChunkLength) {
      chunks.push(chunk);
    }
    
    startIdx = endIdx - config.chunkOverlap;
  }
  
  return chunks;
}

async function processDocuments(type) {
  const config = DOCS_CONFIG[type];
  
  if (!await checkOllamaConnection()) {
    throw new Error('Ollama is not available');
  }
  
  const client = new chromadb.PersistentClient({ path: config.dbDir });
  const embeddingFunction = async (texts) => {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: Array.isArray(texts) ? texts[0] : texts
      })
    });
    const data = await response.json();
    return data.embedding;
  };
  
  const collection = await client.getOrCreateCollection({
    name: config.collection,
    embeddingFunction,
    metadata: { "hnsw:space": "cosine" }
  });
  
  const files = readdirSync(config.dir)
    .filter(f => f.toLowerCase().endsWith('.docx'));
  
  if (!files.length) {
    console.warn(`No .docx files found in ${config.dir}`);
    return;
  }
  
  for (const filename of files) {
    try {
      const filepath = join(config.dir, filename);
      const text = await extractText(filepath);
      const chunks = createChunks(text, config);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${filename}_${i}`;
        const metadata = {
          source: filename,
          length: chunks[i].length,
          date: new Date().toISOString()
        };
        
        await collection.upsert({
          ids: [chunkId],
          documents: [chunks[i]],
          metadatas: [metadata]
        });
      }
      
      console.log(`Processed ${filename} - ${chunks.length} chunks`);
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }
  
  console.log(`Loading complete. Total chunks: ${await collection.count()}`);
}

// Process both document types
async function main() {
  console.log('Starting document loading process...');
  const startTime = new Date();
  
  try {
    await Promise.all([
      processDocuments('contrato'),
      processDocuments('internos')
    ]);
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    console.log(`Total time: ${new Date() - startTime}ms`);
  }
}

main();