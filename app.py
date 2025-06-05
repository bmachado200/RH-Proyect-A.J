from flask import Flask, render_template, request, jsonify, session, Response
from query import assistant # assistant instance from query.py
import os
import secrets
from datetime import timedelta
import json
from openai import OpenAI

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", secrets.token_hex(32))

app.config.update(
    SESSION_COOKIE_SECURE=False, # True if using HTTPS
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
    SESSION_REFRESH_EACH_REQUEST=True
)

@app.before_request
def before_request_func(): # Renamed to avoid conflict with flask.before_request decorator usage
    if 'conversation' not in session:
        session['conversation'] = []
    if 'openai_api_key' not in session:
        session['openai_api_key'] = None
    session.modified = True

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    question_text = data.get('question', '').strip()
    language = data.get('language', 'english')
    api_key_from_session = session.get('openai_api_key')

    if not question_text:
        error_msg = "No question provided" if language == 'english' else \
                    "No se proporcionó pregunta" if language == 'spanish' else \
                    "未提供问题" # Mandarin
        return jsonify({'error': error_msg}), 400
    
    if not api_key_from_session:
        error_msg = "API key not configured. Please set it in Settings." if language == 'english' else \
                    "Clave API no configurada. Por favor, configúrela en Ajustes." if language == 'spanish' else \
                    "API 密钥未配置。请在“设置”中进行设置。" # Mandarin
        return jsonify({'error': error_msg}), 401

    try:
        session['conversation'].append({
            'role': 'user', 'content': question_text, 'language': language
        })
        if len(session['conversation']) > 20:
            session['conversation'] = session['conversation'][-20:]
        session.modified = True
        
        response_stream = assistant.ask_question(
            question=question_text,
            language=language,
            conversation_history=session['conversation'][-4:],
            api_key=api_key_from_session
        )
        
        if isinstance(response_stream, str): # Error string returned
            if "API key not provided" in response_stream or "Clave API no proporcionada" in response_stream or "API 密钥未提供" in response_stream:
                 return jsonify({'error': response_stream}), 401
            return jsonify({'error': response_stream}), 500
            
        def generate():
            full_response = ""
            try:
                for token in response_stream:
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                
                with app.app_context():
                    current_session = session
                    current_session['conversation'].append({
                        'role': 'assistant', 'content': full_response, 'language': language
                    })
                    if len(current_session['conversation']) > 20:
                        current_session['conversation'] = current_session['conversation'][-20:]
                    current_session.modified = True
            except GeneratorExit:
                app.logger.info("Client disconnected during stream.")
            except Exception as stream_ex:
                app.logger.error(f"Error during streaming: {str(stream_ex)}")
                # yield f"data: {json.dumps({'error': 'Stream error'})}\n\n" # Optionally inform client
            finally:
                yield f"data: [DONE]\n\n"


        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        error_msg_server = f"Error generating response: {str(e)}" if language == 'english' else \
                           f"Error al generar respuesta: {str(e)}" if language == 'spanish' else \
                           f"生成响应时出错：{str(e)}" # Mandarin
        app.logger.error(f"API Error in /ask route: {str(e)}")
        return jsonify({'error': error_msg_server}), 500

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text_to_translate = data.get('text', '').strip()
    target_language_key = data.get('target_language', 'english') # e.g., 'english', 'spanish', 'mandarin'
    source_language_key = data.get('source_language') # e.g., 'english', 'spanish', 'mandarin'
    
    api_key_from_session = session.get('openai_api_key')

    if not text_to_translate:
        return jsonify({'error': 'No text provided'}), 400 # Keep this generic or use appLanguage for error
    
    if not api_key_from_session:
        # Determine error language based on target_language_key or a default
        error_lang_map = {
            'english': "API key not configured. Please set it in Settings.",
            'spanish': "Clave API no configurada. Por favor, configúrela en Ajustes.",
            'mandarin': "API 密钥未配置。请在“设置”中进行设置。"
        }
        return jsonify({'error': error_lang_map.get(target_language_key, error_lang_map['english'])}), 401

    try:
        translation_client = OpenAI(api_key=api_key_from_session)
        
        # Map keys to full language names for the prompt if needed, or use codes if model prefers
        language_names_for_prompt = {
            "english": "English",
            "spanish": "Spanish",
            "mandarin": "Chinese" # OpenAI often prefers "Chinese" for Mandarin
        }
        
        prompt_target_language = language_names_for_prompt.get(target_language_key, target_language_key.capitalize())
        
        if source_language_key and source_language_key in language_names_for_prompt:
            prompt_source_language = language_names_for_prompt[source_language_key]
            prompt_content = (
                f"Translate the following text from {prompt_source_language} to {prompt_target_language}. "
                f"Preserve all original formatting, markdown, lists, and special characters. "
                f"Respond ONLY with the translated text, without any additional explanations or conversation.\n\n"
                f"{text_to_translate}"
            )
        else: # If source language is not provided or unknown, ask the model to detect
            prompt_content = (
                f"Detect the language of the following text and then translate it to {prompt_target_language}. "
                f"Preserve all original formatting, markdown, lists, and special characters. "
                f"Respond ONLY with the translated text, without any additional explanations or conversation.\n\n"
                f"{text_to_translate}"
            )
        
        response = translation_client.chat.completions.create(
            model=assistant.OPENAI_MODEL, # Use the same model as the main assistant for consistency
            messages=[
                {
                    "role": "system",
                    "content": "You are a highly proficient translator. Your task is to translate the given text accurately, maintaining all original formatting. Respond only with the translation."
                },
                {"role": "user", "content": prompt_content}
            ],
            temperature=0.1, # Low temperature for more deterministic translation
            max_tokens=3000 # Adjust based on expected length of text to translate
        )
        
        translated_text_content = response.choices[0].message.content.strip()
        return jsonify({'translated_text': translated_text_content})
        
    except Exception as e:
        app.logger.error(f"Translation API Error: {str(e)}")
        # Provide a more generic error, or one based on target_language_key
        error_msg_server = f"Translation error: {str(e)}"
        if "authentication" in str(e).lower() or "api key" in str(e).lower():
             error_msg_server = "Translation failed: Invalid API key or authentication issue."
        return jsonify({'error': error_msg_server}), 500


@app.route('/set_api_key', methods=['POST'])
def set_api_key():
    data = request.get_json()
    api_key_value = data.get('api_key', '').strip()
    
    try:
        if api_key_value:
            test_client = OpenAI(api_key=api_key_value)
            test_client.models.list() 
            session['openai_api_key'] = api_key_value
            session.modified = True
            return jsonify({'status': 'success', 'message': 'API key validated and stored successfully'})
        else:
            session.pop('openai_api_key', None)
            session.modified = True
            return jsonify({'status': 'success', 'message': 'API key cleared'})
    except Exception as e:
        session.pop('openai_api_key', None)
        session.modified = True
        error_msg_server = f"Invalid API key: {str(e)}"
        if "authentication" in str(e).lower():
            error_msg_server = "Invalid API key. Please check your key and try again."
        app.logger.error(f"API Key Validation Error: {str(e)}")
        return jsonify({'error': error_msg_server}), 400

@app.route('/clear', methods=['POST']) # Not directly requested but good to have
def clear_conversation():
    session['conversation'] = []
    session.modified = True
    # Determine language for response message from request or default
    language = request.json.get('language', 'english') if request.is_json else 'english'
    message_map = {
        'english': 'Conversation cleared',
        'spanish': 'Historial reiniciado',
        'mandarin': '对话已清除'
    }
    return jsonify({'status': 'success', 'message': message_map.get(language, message_map['english'])})

if __name__ == '__main__':
    app.run(
        debug=os.getenv("FLASK_ENV", 'development').lower() == 'development',
        host=os.getenv("FLASK_HOST", '0.0.0.0'),
        port=int(os.getenv("FLASK_PORT", 8000)),
        threaded=True
    )
