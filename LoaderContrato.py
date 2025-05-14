import os
import time
from docx import Document
import chromadb
from typing import List, Dict
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
from tqdm import tqdm
import logging
from datetime import datetime
import re
import requests

# Configuración
DOCS_DIR = "./HR/contrato_colectivo"
DB_DIR = "./chroma_db_contrato"
COLLECTION_NAME = "documentos_contrato"
CHUNK_SIZE = 3000 
CHUNK_OVERLAP = 500       
MIN_CHUNK_LENGTH = 150 
EMBEDDING_MODEL = "nomic-embed-text"
OLLAMA_URL = "http://localhost:11434"
MAX_RETRIES = 3
RETRY_DELAY = 5

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('loader_contrato.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def check_ollama_connection():
    """Verifica que Ollama esté disponible"""
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=10)
            if response.status_code == 200:
                return True
        except Exception as e:
            logger.warning(f"Intento {attempt + 1} - Ollama no disponible: {str(e)}")
            time.sleep(RETRY_DELAY)
    raise ConnectionError("No se pudo conectar con Ollama después de varios intentos")

def extraer_texto(file_path: str) -> str:
    """Extrae texto del documento preservando estructura"""
    try:
        doc = Document(file_path)
        return "\n".join(para.text.strip() for para in doc.paragraphs if para.text.strip())
    except Exception as e:
        logger.error(f"Error extrayendo {file_path}: {e}")
        raise

def crear_chunks(texto: str) -> List[str]:
    """Divide el texto en chunks semánticos"""
    chunks = []
    words = texto.split()
    
    start_idx = 0
    while start_idx < len(words):
        end_idx = min(start_idx + CHUNK_SIZE, len(words))
        chunk = " ".join(words[start_idx:end_idx])
        
        # Asegurar que no cortemos en medio de una oración importante
        if end_idx < len(words):
            last_period = chunk.rfind('.')
            if last_period > CHUNK_SIZE - 200:  # Si encontramos un punto cerca del final
                chunk = chunk[:last_period + 1]
                end_idx = start_idx + len(chunk.split())
        
        chunks.append(chunk)
        start_idx = end_idx - CHUNK_OVERLAP if (end_idx - CHUNK_OVERLAP) > start_idx else end_idx
    
    return [chunk for chunk in chunks if len(chunk) >= MIN_CHUNK_LENGTH]

def procesar_documentos():
    """Procesa documentos con reintentos y manejo de errores"""
    check_ollama_connection()
    
    client = chromadb.PersistentClient(path=DB_DIR)
    embedding_function = OllamaEmbeddingFunction(
        model_name=EMBEDDING_MODEL,
        url=f"{OLLAMA_URL}/api/embeddings"
    )
    
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_function,
        metadata={"hnsw:space": "cosine"}
    )
    
    files = [f for f in os.listdir(DOCS_DIR) if f.lower().endswith('.docx')]
    if not files:
        logger.warning("No se encontraron archivos .docx")
        return
    
    for filename in tqdm(files, desc="Procesando documentos"):
        filepath = os.path.join(DOCS_DIR, filename)
        try:
            text = extraer_texto(filepath)
            chunks = crear_chunks(text)
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{filename}_{i}"
                metadata = {
                    "fuente": filename,
                    "longitud": len(chunk),
                    "fecha": datetime.now().strftime("%Y-%m-%d")
                }
                
                for attempt in range(MAX_RETRIES):
                    try:
                        collection.upsert(
                            documents=[chunk],
                            metadatas=[metadata],
                            ids=[chunk_id]
                        )
                        break
                    except Exception as e:
                        if attempt == MAX_RETRIES - 1:
                            logger.error(f"Error persistente con {chunk_id}: {e}")
                        else:
                            logger.warning(f"Reintentando ({attempt + 1}) chunk {chunk_id}")
                            time.sleep(RETRY_DELAY)
            
            logger.info(f"Procesado {filename} - {len(chunks)} chunks")
            
        except Exception as e:
            logger.error(f"Error procesando {filename}: {e}")
            continue
    
    logger.info(f"Carga completada. Total chunks: {collection.count()}")

if __name__ == "__main__":
    logger.info("Iniciando carga de documentos")
    start_time = datetime.now()
    
    try:
        procesar_documentos()
    except Exception as e:
        logger.critical(f"Error fatal: {e}")
    finally:
        logger.info(f"Tiempo total: {datetime.now() - start_time}")