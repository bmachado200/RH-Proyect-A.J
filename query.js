import * as chromadb from 'chromadb';
import fetch from 'node-fetch';

export class HRChatbot {
  constructor() {
    this.DB_CONFIG = {
      internos: { path: './chroma_db_internos', collection: 'documentos_internos' },
      contrato: { path: './chroma_db_contrato', collection: 'documentos_contrato' }
    };
    
    this.EMBEDDING_MODEL = 'nomic-embed-text';
    this.LLM_MODEL = 'llama3';
    
    this.initialize();
  }

  async initialize() {
    await this._initializeEmbeddingModel();
    await this._initializeDatabases();
    await this._verifyLlmConnection();
  }

  async _initializeEmbeddingModel() {
    console.log('Initializing Nomic embedding model...');
    this.embeddingFunction = async (texts) => {
      const response = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        body: JSON.stringify({
          model: this.EMBEDDING_MODEL,
          prompt: Array.isArray(texts) ? texts[0] : texts
        })
      });
      
      const data = await response.json();
      return data.embedding;
    };
  }

  async _initializeDatabases() {
    this.collections = {};
    for (const [dbType, config] of Object.entries(this.DB_CONFIG)) {
      try {
        const client = new chromadb.PersistentClient({ path: config.path });
        this.collections[dbType] = await client.getOrCreateCollection({
          name: config.collection,
          embeddingFunction: this.embeddingFunction,
          metadata: { "hnsw:space": "cosine" }
        });
        console.log(`${dbType} DB ready with ${await this.collections[dbType].count()} docs`);
      } catch (error) {
        console.error(`Failed to initialize ${dbType} DB:`, error);
        throw error;
      }
    }
  }

  async _verifyLlmConnection() {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          model: this.LLM_MODEL,
          prompt: 'Test',
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Llama 3 container returned status ${response.status}`);
      }
      console.log('Successfully connected to Llama 3');
    } catch (error) {
      console.error('Llama 3 connection failed:', error);
      throw error;
    }
  }

  _formatPrompt(context, question, docType) {
    return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
    Eres un experto en Recursos Humanos. Responde en español usando solo esta información:
    Contexto (${docType}):
    ${context}<|eot_id|>
    <|start_header_id|>user<|end_header_id|>
    ${question}<|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>`;
  }

  async ask(question, docType) {
    try {
      const collection = this.collections[docType];
      const availableDocs = await collection.count();
      const nResults = Math.min(3, Math.max(1, availableDocs));
      
      if (availableDocs === 0) {
        return ['No hay documentos en esta categoría.', []];
      }

      const results = await collection.query({
        queryTexts: [question],
        nResults,
        include: ['documents', 'metadatas', 'distances']
      });
      
      if (!results.documents[0]?.length) {
        return ['No encontré información relevante.', []];
      }

      const context = results.documents[0]
        .map((doc, i) => `Documento ${i + 1} (Similitud: ${1 - results.distances[0][i]}, ${results.metadatas[0][i].clausula || 'General'}):\n${doc.slice(0, 1000)}...`)
        .join('\n\n');

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({
          model: this.LLM_MODEL,
          prompt: this._formatPrompt(context, question, docType),
          stream: false,
          options: {
            temperature: 0.3,
            num_ctx: 4096
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Llama 3 API error: ${await response.text()}`);
      }
      
      const data = await response.json();
      const sources = results.metadatas[0].map((meta, i) => ({
        fuente: meta.fuente || 'Desconocido',
        clausula: meta.clausula || 'General',
        similitud: 1 - results.distances[0][i]
      }));
      
      return [data.response.trim(), sources];
    } catch (error) {
      console.error('Error in ask:', error);
      throw error;
    }
  }
}