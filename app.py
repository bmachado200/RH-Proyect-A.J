from flask import Flask, render_template, request, jsonify, session
from query import assistant
from dotenv import load_dotenv
import os
import secrets
from flask import Response
import json
from datetime import timedelta

# Load environment variables FIRST
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(32))

# Configure session
app.config.update(
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
    SESSION_REFRESH_EACH_REQUEST=True
)

@app.before_request
def before_request():
    if 'conversation' not in session:
        session['conversation'] = []
    session.modified = True

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    question = data.get('question', '').strip()
    language = data.get('language', 'english')
    
    if not question:
        error_msg = "No question provided" if language == 'english' else "No se proporcionó pregunta"
        return jsonify({'error': error_msg}), 400
    
    try:
        # Initialize or update conversation history BEFORE streaming
        if 'conversation' not in session:
            session['conversation'] = []
        
        session['conversation'].append({
            'role': 'user',
            'content': question,
            'language': language
        })
        
        if len(session['conversation']) > 20:
            session['conversation'] = session['conversation'][-20:]
        
        # Save the modified session BEFORE starting the response
        session.modified = True
        
        # Get streaming response
        response_stream = assistant.ask_question(
            question=question,
            language=language,
            conversation_history=session['conversation'][-4:]
        )
        
        if isinstance(response_stream, str):
            return jsonify({'error': response_stream}), 500
            
        def generate():
            full_response = ""
            try:
                for token in response_stream:
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                
                # Store the conversation after streaming completes
                with app.test_request_context():
                    session['conversation'].append({
                        'role': 'assistant',
                        'content': full_response,
                        'language': language
                    })
                    session.modified = True
            except GeneratorExit:
                # Handle client disconnection
                pass
            
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        error_msg = f"❌ Error generating response: {str(e)}" if language == 'english' else f"❌ Error al generar respuesta: {str(e)}"
        app.logger.error(f"API Error: {str(e)}")
        return jsonify({'error': error_msg}), 500

@app.route('/clear', methods=['POST'])
def clear_conversation():
    """Reset conversation history"""
    session['conversation'] = []
    return jsonify({
        'status': 'success',
        'message': 'Historial reiniciado' if request.json.get('language', 'es') == 'es' else 'Conversation cleared'
    })

if __name__ == '__main__':
    app.run(
        debug=os.getenv("FLASK_ENV") == 'development',
        host='0.0.0.0',  # Allow connections from any IP
        port=int(os.getenv("FLASK_PORT", 5000)),
        threaded=True
    )