import os
from docx import Document
import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from dotenv import load_dotenv
from typing import List, Dict
import PyPDF2
from pdfminer.high_level import extract_text as pdfminer_extract
import warnings
from pathlib import Path
import re
import tiktoken

# SKIPPPP PDFMiner warnings
warnings.filterwarnings("ignore", category=UserWarning)

# ========= SECURE CONFIGURATION =========
load_dotenv()
DOCS_DIR = "./HR"
DB_DIR = "./chroma_db3"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
MAX_TOKENS_PER_CHUNK = 8192

# ========= EMBEDDING FUNCTION =========
def get_embedding_function():
    return OpenAIEmbeddingFunction(
        api_key=OPENAI_API_KEY,
        model_name="text-embedding-3-large"
    )

client = chromadb.PersistentClient(path=DB_DIR)
collection = client.get_or_create_collection(
    name="RH_A",
    embedding_function=get_embedding_function()
)

# ========= TOKENIZER =========
encoding = tiktoken.encoding_for_model("text-embedding-3-large")

def count_tokens(text: str) -> int:
    return len(encoding.encode(text))

# ========= TEXT EXTRACTION =========
def extract_pdf_text(file_path: str) -> str:
    try:
        text = pdfminer_extract(file_path)
        if len(text.strip()) > 100:
            return text
        text = ""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"PDF extraction error for {file_path}: {str(e)}")
        return ""

def extract_docx_text(file_path: str) -> str:
    try:
        doc = Document(file_path)
        full_text = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        return "\n".join(full_text)
    except Exception as e:
        print(f"DOCX extraction error for {file_path}: {str(e)}")
        return ""

# ========= TEXT PROCESSING =========
def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def split_by_tokens(text: str, max_tokens: int) -> List[str]:
    tokens = encoding.encode(text)
    chunks = []
    for i in range(0, len(tokens), max_tokens):
        chunk_tokens = tokens[i:i + max_tokens]
        chunk_text = encoding.decode(chunk_tokens)
        chunks.append(chunk_text)
    return chunks

def smart_text_splitter(text: str) -> List[str]:
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    chunks = []
    current_chunk = []
    current_length = 0

    for para in paragraphs:
        para_length = len(para)
        if current_length + para_length > CHUNK_SIZE and current_chunk:
            chunk_text = "\n".join(current_chunk)
            if count_tokens(chunk_text) > MAX_TOKENS_PER_CHUNK:
                sub_chunks = split_by_tokens(chunk_text, MAX_TOKENS_PER_CHUNK)
                chunks.extend(sub_chunks)
            else:
                chunks.append(chunk_text)
            current_chunk = current_chunk[-int(CHUNK_OVERLAP/50):]
            current_length = sum(len(p) for p in current_chunk)
        current_chunk.append(para)
        current_length += para_length

    if current_chunk:
        chunk_text = "\n".join(current_chunk)
        if count_tokens(chunk_text) > MAX_TOKENS_PER_CHUNK:
            sub_chunks = split_by_tokens(chunk_text, MAX_TOKENS_PER_CHUNK)
            chunks.extend(sub_chunks)
        else:
            chunks.append(chunk_text)
    return chunks

def get_file_metadata(file_path: str) -> Dict:
    path = Path(file_path)
    stat = path.stat()
    return {
        "file_name": path.name,
        "file_path": str(path.absolute()),
        "file_type": path.suffix.lower(),
        "file_size": stat.st_size,
        "created": stat.st_ctime,
        "modified": stat.st_mtime,
        "absolute_path": str(path.absolute())
    }

# ========= LOADING DOCUMENTS =========
def load_documents():
    existing_ids = {id_ for id_ in collection.get()['ids']} if collection.count() > 0 else set()
    new_documents = 0

    for file_name in os.listdir(DOCS_DIR):
        file_path = os.path.join(DOCS_DIR, file_name)
        print(f"Processing: {file_name}")

        try:
            if not (file_name.lower().endswith(".pdf") or file_name.lower().endswith(".docx")):
                continue

            file_meta = get_file_metadata(file_path)

            if file_name.lower().endswith(".pdf"):
                full_text = extract_pdf_text(file_path)
            else:
                full_text = extract_docx_text(file_path)

            if not full_text.strip():
                print(f"⚠️ Empty content in {file_name}")
                continue

            cleaned_text = clean_text(full_text)
            chunks = smart_text_splitter(cleaned_text)

            batch_documents = []
            batch_metadatas = []
            batch_ids = []

            for i, chunk in enumerate(chunks):
                chunk_id = f"{file_name}_chunk_{i}"
                if chunk_id not in existing_ids:
                    batch_documents.append(chunk)
                    metadata = {
                        "source": file_name,
                        "chunk": i,
                        "full_document": file_name,
                        "file_type": file_meta["file_type"],
                        "file_size": file_meta["file_size"],
                        "created": file_meta["created"],
                        "modified": file_meta["modified"],
                        "absolute_path": file_meta["absolute_path"],
                        "chunk_content_preview": chunk[:100] + "..." if len(chunk) > 100 else chunk
                    }
                    batch_metadatas.append(metadata)
                    batch_ids.append(chunk_id)
                    new_documents += 1

            if batch_documents:
                try:
                    collection.add(
                        documents=batch_documents,
                        metadatas=batch_metadatas,
                        ids=batch_ids
                    )
                except Exception as e:
                    print(f"❌ Error uploading chunks for {file_name}: {e}")

        except Exception as e:
            print(f"Error processing {file_name}: {e}")
            continue

    print(f"✅ Load complete. New documents added: {new_documents}")
    print(f"📊 Total chunks in database: {collection.count()}")

if __name__ == "__main__":
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    if not os.path.exists(DOCS_DIR):
        raise FileNotFoundError(f"Document directory not found: {DOCS_DIR}")
    load_documents()