from flask import Flask, render_template, request, jsonify, session, Response
from query import assistant # assistant instance from query.py
# from dotenv import load_dotenv # Removed: Do not load .env for API key
import os
import secrets
from datetime import timedelta
import json
from openai import OpenAI # Keep for /set_api_key validation and /translate

# Load environment variables FIRST (e.g., for FLASK_SECRET_KEY, FLASK_ENV, FLASK_PORT if set in .env)
# However, OPENAI_API_KEY from .env will NOT be used by the core logic anymore.
# load_dotenv() # Commented out as per request to not load .env for API key.
              # Ensure FLASK_SECRET_KEY is set as an environment variable.

# Create Flask app
app = Flask(__name__)
# Secret key should ideally be set as an environment variable directly
app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(32))


# Configure session
app.config.update(
    SESSION_COOKIE_SECURE=False, # Set to True if using HTTPS in production
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
    SESSION_REFRESH_EACH_REQUEST=True
)

@app.before_request
def before_request():
    if 'conversation' not in session:
        session['conversation'] = []
    if 'openai_api_key' not in session:
        session['openai_api_key'] = None # Explicitly None if not set
    session.modified = True

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    question_text = data.get('question', '').strip() # Renamed to avoid conflict
    language = data.get('language', 'english')
    
    api_key_from_session = session.get('openai_api_key')

    if not question_text:
        error_msg = "No question provided" if language == 'english' else "No se proporcionó pregunta"
        return jsonify({'error': error_msg}), 400
    
    # API key check is now primarily handled inside assistant.ask_question
    # but good to have a session check here too for early exit or specific UI feedback if desired.
    if not api_key_from_session:
        error_msg = "API key not configured. Please set it in Settings." \
                    if language == 'english' else \
                    "Clave API no configurada. Por favor, configúrela en Ajustes."
        return jsonify({'error': error_msg}), 401 # Unauthorized or Bad Request

    try:
        if 'conversation' not in session: # Should be handled by before_request
            session['conversation'] = []
        
        session['conversation'].append({
            'role': 'user',
            'content': question_text,
            'language': language
        })
        
        if len(session['conversation']) > 20:
            session['conversation'] = session['conversation'][-20:]
        
        session.modified = True # Save session changes
        
        # Pass the API key from the session to the assistant's method
        response_stream = assistant.ask_question(
            question=question_text,
            language=language,
            conversation_history=session['conversation'][-4:], # Pass recent history
            api_key=api_key_from_session # Crucial: Pass the user's API key
        )
        
        # If ask_question returns a string, it's an error message (e.g., API key missing)
        if isinstance(response_stream, str):
            # Check if it's an API key specific error message from HRAssistant
            if "API key not provided" in response_stream or "Clave API no proporcionada" in response_stream:
                 return jsonify({'error': response_stream}), 401 # Unauthorized if API key issue
            return jsonify({'error': response_stream}), 500 # General server error
            
        def generate():
            full_response = ""
            try:
                for token in response_stream:
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                
                # Store the assistant's full response in conversation
                # This context needs to be careful with concurrent requests if session wasn't saved before yielding.
                # Using app.test_request_context() might be complex here.
                # It's better to ensure session is saved before streaming begins if possible,
                # or handle session updates carefully. For now, this might lead to race conditions
                # if multiple 'ask' requests from the same session happen nearly simultaneously.
                # However, typical usage is sequential.
                
                # Ensure we are in a request context to modify the session
                with app.app_context(): # Or app.test_request_context() if outside a real request flow
                                        # but since generate() is part of a request, app_context might be sufficient.
                                        # However, session is typically tied to request_context.
                    # Re-fetch session to be safe, though it should be the same object within the same thread/request
                    current_session = session
                    current_session['conversation'].append({
                        'role': 'assistant',
                        'content': full_response,
                        'language': language
                    })
                    if len(current_session['conversation']) > 20: # Prune again if needed
                        current_session['conversation'] = current_session['conversation'][-20:]
                    current_session.modified = True
            except GeneratorExit:
                # Handle client disconnection if necessary
                app.logger.info("Client disconnected during stream.")
                pass
            except Exception as stream_ex:
                app.logger.error(f"Error during streaming: {str(stream_ex)}")
                # Optionally yield an error message to the client if the stream breaks
                # yield f"data: {json.dumps({'error': 'Stream error'})}\n\n"
                pass

        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        error_msg_server = f"Error generating response: {str(e)}" \
                           if language == 'english' else \
                           f"Error al generar respuesta: {str(e)}"
        app.logger.error(f"API Error in /ask route: {str(e)}")
        return jsonify({'error': error_msg_server}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text_to_translate = data.get('text', '').strip() # Renamed
    target_language = data.get('target_language', 'english')
    
    api_key_from_session = session.get('openai_api_key')

    if not text_to_translate:
        return jsonify({'error': 'No text provided'}), 400
    
    if not api_key_from_session:
        # Consistent error message with /ask route for API key missing
        error_msg = "API key not configured. Please set it in Settings." \
                    if target_language == 'english' or target_language == 'spanish' else \
                    "API key not configured." # Fallback generic message
        # Determine language for error message based on target_language if possible
        if target_language == 'spanish':
             error_msg = "Clave API no configurada. Por favor, configúrela en Ajustes."
        return jsonify({'error': error_msg}), 401 # Unauthorized

    try:
        # Initialize OpenAI client directly with the user's API key for this translation
        try:
            translation_client = OpenAI(api_key=api_key_from_session)
        except Exception as client_init_e:
            app.logger.error(f"Translate: OpenAI client initialization error: {str(client_init_e)}")
            # This could be due to a malformed key format, though set_api_key should catch most.
            return jsonify({'error': f'Invalid API key format or configuration error: {str(client_init_e)}'}), 400

        source_language = 'spanish' if target_language == 'english' else 'english'
        
        prompt_content = f"Translate the following text from {source_language} to {target_language} while preserving all formatting, markdown, lists, and special characters. Only respond with the translated text:\n\n{text_to_translate}"
        
        # Use the assistant's configured model name, but the client is specific to this request
        response = translation_client.chat.completions.create(
            model=assistant.OPENAI_MODEL, # Use model from HRAssistant config
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional translator. Translate the text exactly as requested, preserving all formatting."
                },
                {"role": "user", "content": prompt_content}
            ],
            temperature=0.1,
            max_tokens=2000 # Adjust as needed
        )
        
        translated_text_content = response.choices[0].message.content
        return jsonify({'translated_text': translated_text_content})
        
    except Exception as e:
        # Catch errors from the OpenAI API call itself (e.g., invalid key, quota issues)
        error_msg_server = f"Translation error: {str(e)}"
        app.logger.error(f"Translation API Error: {str(e)}")
        # Check if the error message indicates an authentication problem
        if "authentication" in str(e).lower() or "api key" in str(e).lower():
             return jsonify({'error': f"Translation failed: Invalid API key or authentication issue."}), 401
        return jsonify({'error': error_msg_server}), 500


@app.route('/set_api_key', methods=['POST'])
def set_api_key():
    data = request.get_json()
    api_key_value = data.get('api_key', '').strip() # Renamed
    
    try:
        if api_key_value:
            # Test the key by making a simple request
            # This client is temporary, just for validation
            test_client = OpenAI(api_key=api_key_value)
            test_client.models.list()  # Simple request to validate key; can raise openai.AuthenticationError
            
            # Store the API key in the session
            session['openai_api_key'] = api_key_value
            session.modified = True
            return jsonify({
                'status': 'success',
                'message': 'API key validated and stored successfully'
            })
        else:
            # Clear the API key
            session.pop('openai_api_key', None)
            session.modified = True
            return jsonify({
                'status': 'success',
                'message': 'API key cleared'
            })
    except Exception as e: # Catches errors from OpenAI client init or models.list()
        session.pop('openai_api_key', None) # Ensure invalid key is not stored
        session.modified = True
        error_msg_server = f"Invalid API key: {str(e)}"
        app.logger.error(f"API Key Validation Error: {str(e)}")
        # Provide a slightly more user-friendly message for common auth errors
        if "authentication" in str(e).lower():
            error_msg_server = "Invalid API key. Please check your key and try again."
        return jsonify({'error': error_msg_server}), 400

@app.route('/clear', methods=['POST'])
def clear_conversation():
    """Reset conversation history"""
    session['conversation'] = []
    session.modified = True
    language = request.json.get('language', 'english') if request.is_json else 'english'
    message = 'Historial reiniciado' if language == 'spanish' else 'Conversation cleared'
    return jsonify({
        'status': 'success',
        'message': message
    })

if __name__ == '__main__':
    # FLASK_ENV, FLASK_PORT should be set as environment variables for production
    # For development, os.getenv can provide defaults.
    app.run(
        debug=os.getenv("FLASK_ENV", 'development').lower() == 'development',
        host=os.getenv("FLASK_HOST", '0.0.0.0'),
        port=int(os.getenv("FLASK_PORT", 8000)),
        threaded=True # Good for handling multiple requests, ensure session management is thread-safe (Flask session is by default)
    )
