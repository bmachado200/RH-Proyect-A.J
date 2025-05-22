import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from dotenv import load_dotenv
import os
import argparse
from typing import List, Dict

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Database configuration
DB_DIR = "./chroma_db3"

def get_embedding_function():
    """Safely configure the embedding function"""
    return OpenAIEmbeddingFunction(
        api_key=OPENAI_API_KEY,
        model_name="text-embedding-3-large"
    )

def initialize_collection():
    """Initialize the ChromaDB collection"""
    client = chromadb.PersistentClient(path=DB_DIR)
    return client.get_or_create_collection(
        name="RH_A",
        embedding_function=get_embedding_function()
    )

def query_collection(query: str, n_results: int = 5) -> List[Dict]:
    """Query the collection and return formatted results"""
    collection = initialize_collection()
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    formatted_results = []
    for i in range(len(results['ids'][0])):
        formatted_results.append({
            'id': results['ids'][0][i],
            'document': results['documents'][0][i],
            'metadata': results['metadatas'][0][i],
            'distance': results['distances'][0][i]
        })
    
    return formatted_results

def display_results(results: List[Dict]):
    """Display query results in a user-friendly format"""
    if not results:
        print("No results found.")
        return
    
    print("\n=== SEARCH RESULTS ===\n")
    for i, result in enumerate(results, 1):
        print(f"Result #{i}")
        print(f"Source: {result['metadata']['source']}")
        print(f"Relevance Score: {1 - result['distance']:.2f}")
        print(f"Content Preview: {result['metadata']['chunk_content_preview']}")
        print("\n--- Full Content ---")
        print(result['document'][:500] + "..." if len(result['document']) > 500 else result['document'])
        print("\n" + "="*50 + "\n")

def interactive_mode():
    """Run in interactive query mode"""
    print("=== HR Document Query Terminal ===")
    print("Type 'exit' to quit\n")
    
    collection = initialize_collection()
    print(f"Database contains {collection.count()} document chunks.\n")
    
    while True:
        query = input("Enter your query: ").strip()
        if query.lower() in ['exit', 'quit']:
            break
            
        if not query:
            print("Please enter a query.")
            continue
            
        try:
            n_results = int(input("Number of results to return (default 5): ") or 5)
            results = query_collection(query, n_results)
            display_results(results)
        except Exception as e:
            print(f"Error: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description="Query HR documents from the terminal.")
    parser.add_argument('--query', type=str, help="Direct query to execute")
    parser.add_argument('--results', type=int, default=5, help="Number of results to return")
    
    args = parser.parse_args()
    
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    if args.query:
        # Command-line mode
        results = query_collection(args.query, args.results)
        display_results(results)
    else:
        # Interactive mode
        interactive_mode()

if __name__ == "__main__":
    main()