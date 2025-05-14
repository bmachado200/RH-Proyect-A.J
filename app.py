# app.py
from flask import Flask, render_template, request, jsonify
from query import HRChatbot
import logging
from datetime import datetime
import requests

app = Flask(__name__)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['JSON_AS_ASCII'] = False  # For special characters

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize chatbot
try:
    chatbot = HRChatbot()
except Exception as e:
    logger.error(f"Error initializing chatbot: {str(e)}")
    raise

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/status')
def check_status():
    try:
        response = requests.get("http://localhost:11434/api/tags")
        return jsonify(response.status_code == 200)
    except:
        return jsonify(False)

@app.route('/ask', methods=['POST'])
def ask_question():
    start_time = datetime.now()
    data = request.get_json()
    question = data.get('question', '').strip()
    doc_type = data.get('doc_type', 'contrato')  # Default to contrato colectivo

    if not question:
        return jsonify({'error': 'No question provided'}), 400
    
    if doc_type not in ['internos', 'contrato']:
        return jsonify({'error': 'Invalid document type'}), 400

    try:
        logger.info(f"Processing question: '{question}' in {doc_type} documents")
        answer, sources = chatbot.ask(question, doc_type)
        
        response = {
            'response': answer,
            'sources': sources,
            'processing_time': str(datetime.now() - start_time)
        }
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An error occurred while processing your question',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)