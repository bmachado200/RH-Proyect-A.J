# app.py
from flask import Flask, render_template, request, jsonify
from query import HRChatbot
import logging
from datetime import datetime

app = Flask(__name__)

# Configuración
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
app.config['JSON_AS_ASCII'] = False  # Para soportar caracteres especiales

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar el chatbot
try:
    chatbot = HRChatbot()
except Exception as e:
    logger.error(f"Error al iniciar el chatbot: {str(e)}")
    raise

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask_question():
    start_time = datetime.now()
    data = request.get_json()
    question = data.get('question', '').strip()
    doc_type = data.get('doc_type', 'contrato')  # Default to contrato colectivo

    if not question:
        return jsonify({'error': 'No se proporcionó pregunta'}), 400
    
    if doc_type not in ['internos', 'contrato']:
        return jsonify({'error': 'Tipo de documento no válido'}), 400

    try:
        logger.info(f"Procesando pregunta: '{question}' en documentos {doc_type}")
        answer, sources = chatbot.ask(question, doc_type)
        
        response = {
            'response': answer,
            'sources': sources,
            'processing_time': str(datetime.now() - start_time)
        }
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error procesando pregunta: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Ocurrió un error al procesar tu pregunta',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)  # Change to False
