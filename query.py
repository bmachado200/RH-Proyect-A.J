# query.py - Using Local Llama 3 Docker Image
import chromadb
import torch
from typing import Literal, Tuple, List, Dict
import logging
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HRChatbot:
    def __init__(self):
        # Configuration using local Docker containers
        self.DB_CONFIG = {
            "internos": {"path": "./chroma_db_internos", "collection": "documentos_internos"},
            "contrato": {"path": "./chroma_db_contrato", "collection": "documentos_contrato"}
        }
        
        # Local model configuration
        self.EMBEDDING_MODEL = "nomic-embed-text"  # Your local Nomic embedding model
        self.LLM_MODEL = "llama3"  # Your local Llama 3 Docker container
        
        # Initialize components
        self._initialize_embedding_model()
        self._initialize_databases()
        self._verify_llm_connection()

    def _initialize_embedding_model(self):
        """Initialize Nomic embedding function"""
        logger.info("Initializing Nomic embedding model...")
        self.embedding_function = OllamaEmbeddingFunction(
            model_name=self.EMBEDDING_MODEL,
            url="http://localhost:11434/api/embeddings"
        )
        
    def _initialize_databases(self):
        """Initialize ChromaDB connections with local embeddings"""
        self.collections = {}
        for db_type, config in self.DB_CONFIG.items():
            try:
                client = chromadb.PersistentClient(path=config["path"])
                self.collections[db_type] = client.get_or_create_collection(
                    name=config["collection"],
                    embedding_function=self.embedding_function,
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info(f"{db_type} DB ready with {self.collections[db_type].count()} docs")
            except Exception as e:
                logger.error(f"Failed to initialize {db_type} DB: {str(e)}")
                raise

    def _verify_llm_connection(self):
        """Verify Llama 3 Docker container is reachable"""
        try:
            import requests
            test_prompt = {
                "model": self.LLM_MODEL,
                "prompt": "Test",
                "stream": False
            }
            response = requests.post("http://localhost:11434/api/generate", json=test_prompt)
            if response.status_code != 200:
                raise ConnectionError(f"Llama 3 container returned status {response.status_code}")
            logger.info("Successfully connected to Llama 3 Docker container")
        except Exception as e:
            logger.error(f"Llama 3 connection failed: {str(e)}")
            raise

    def _format_prompt(self, context: str, question: str, doc_type: str) -> str:
        """Format prompt for Llama 3"""
        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
        Eres un experto en Recursos Humanos. Responde en español usando solo esta información:
        Contexto ({doc_type}):
        {context}<|eot_id|>
        <|start_header_id|>user<|end_header_id|>
        {question}<|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>"""

    def ask(self, question: str, doc_type: Literal["internos", "contrato"]) -> Tuple[str, List[Dict]]:
        """Process a question using local Docker containers"""
        try:
            # 1. Semantic search
            collection = self.collections[doc_type]
            available_docs = collection.count()
            n_results = min(3, max(1, available_docs))
            
            if available_docs == 0:
                return "No hay documentos en esta categoría.", []

            results = collection.query(
                query_texts=[question],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            if not results["documents"][0]:
                return "No encontré información relevante.", []

            # 2. Prepare context
            context = "\n\n".join(
                f"Documento {i+1} (Similitud: {1-dist:.2f}, {meta.get('clausula','General')}):\n{doc[:1000]}..."
                for i, (doc, meta, dist) in enumerate(zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0]
                ))
            )

            # 3. Generate response via Llama 3 API
            import requests
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": self.LLM_MODEL,
                    "prompt": self._format_prompt(context, question, doc_type),
                    "stream": False,
                    "options": {
                        "temperature": 0.3,
                        "num_ctx": 4096
                    }
                }
            )
            
            if response.status_code != 200:
                raise ConnectionError(f"Llama 3 API error: {response.text}")
                
            response_text = response.json()["response"]
            
            return response_text.strip(), [
                {
                    "fuente": meta.get("fuente", "Desconocido"),
                    "clausula": meta.get("clausula", "General"),
                    "similitud": float(1 - dist)
                }
                for meta, dist in zip(results["metadatas"][0], results["distances"][0])
            ]
            
        except Exception as e:
            logger.error(f"Error en ask: {str(e)}", exc_info=True)
            return f"Error procesando tu pregunta: {str(e)}", []

# Initialize with error handling
try:
    chatbot = HRChatbot()
    logger.info("HR chatbot initialized with local Llama 3 Docker container")
except Exception as e:
    logger.critical(f"Failed to initialize chatbot: {str(e)}")
    raise