import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from openai import OpenAI
import os
from typing import Generator, Union
# from dotenv import load_dotenv # Removed: Do not load .env for API key
# load_dotenv()

class HRAssistant:
    def __init__(self):
        # Configuration
        self.DB_DIR = "./chroma_db3"
        self.OPENAI_MODEL = "gpt-3.5-turbo-0125"
        self.OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"
        self.collection_name = "RH_A"

        # Initialize ChromaDB client (does not require API key)
        self.client_chroma = chromadb.PersistentClient(path=self.DB_DIR)

        # self.client_oa and self.embedding_fn are no longer initialized here
        # self.collection is no longer initialized here with a specific embedding function

    def _get_openai_client(self, api_key: str) -> OpenAI:
        """Helper to get an OpenAI client instance."""
        if not api_key:
            raise ValueError("API key is required to initialize OpenAI client.")
        return OpenAI(api_key=api_key)

    def _get_embedding_function(self, api_key: str) -> OpenAIEmbeddingFunction:
        """Helper to get an OpenAIEmbeddingFunction instance."""
        if not api_key:
            raise ValueError("API key is required to initialize OpenAIEmbeddingFunction.")
        return OpenAIEmbeddingFunction(
            api_key=api_key,
            model_name=self.OPENAI_EMBEDDING_MODEL
        )

    def _get_chroma_collection(self, api_key: str):
        """
        Helper to get or create the ChromaDB collection using the provided API key
        for the embedding function.
        """
        if not api_key:
            raise ValueError("API key is required to access ChromaDB collection with embeddings.")
        
        embedding_fn = self._get_embedding_function(api_key=api_key)
        
        # Get or create the collection. If it exists, this will retrieve it.
        # The embedding function passed here will be used for query operations with this collection instance.
        collection = self.client_chroma.get_or_create_collection(
            name=self.collection_name,
            embedding_function=embedding_fn
        )
        return collection

    def _build_prompt(self, question: str, context: str, conversation_history: list, language: str) -> str:
        """Construct the prompt with context and conversation history."""
        history_prompt = ""
        if conversation_history:
            history_prompt = "\n\nPrevious conversation:\n"
            for msg in conversation_history:
                role = "User" if msg['role'] == 'user' else "Assistant"
                history_prompt += f"{role}: {msg['content']}\n"

        # (Prompt content remains the same as in the original file)
        return f"""Eres un asistente especializado en Recursos Humanos de HISENSE ELECTRÓNICA MÉXICO, S.A. DE C.V. 
        Tu función es responder preguntas basándote exclusivamente en la información contenida en los siguientes documentos:
        - Contrato Colectivo de Trabajo 2024.
        - Reglamento Interno de Trabajo (RIT) 2024.

        Instrucciones:
        1. Responde de manera clara, precisa y fundamentada en los documentos mencionados.
        2. Si la respuesta no se encuentra en los documentos, indica claramente que no hay información disponible.
        3. Siempre responde en el mismo idioma en que se formuló la pregunta (español o inglés).
        4. Evita suposiciones o información externa a los documentos proporcionados.
        5. En caso de preguntas sobre procedimientos, derechos u obligaciones, cita la cláusula o artículo correspondiente.
        6. Si la pregunta es sobre un documento específico, menciona el nombre del documento y la sección relevante.
        7. Mencionar en que parte del documento se encuentra la respuesta.
        8. Cuando pregunte de beneficios dime todos los que esten en el contrato colectivo 
        
        8. **Formato:** - Organiza la respuesta de manera clara. 
           - Usa listas cuando sea necesario para darle forma a las respuestas
           - Decirme al ultimo la fuente de la respuesta, SOLO con el nombre del documento doxc o pdf, NO MNENCIONAR LA SECCIÓN. NO MENCIONAR EL CAPITULO.  
           
        9. **Contexto:**
        Si me preguntan ¿Qué hago si creo que mi jefe está incumpliendo el contrato colectivo? contestar lo siguiente:
        Sanciones por llegar tarde (Retardos)
Primer retardo en 30 días: Amonestación verbal.

Segundo retardo en 30 días: Suspensión de 1 día sin goce de sueldo.

Tercer retardo en 30 días: Suspensión de 2 días sin goce de sueldo.

Cuarto retardo en 30 días: Suspensión de 3 días sin goce de sueldo.

Acumular 3 suspensiones por retardos en 6 meses: Suspensión de hasta 8 días sin goce de sueldo.

Más de 5 minutos de retardo: Se considera falta injustificada (Artículo 22).

Además, se reduce el bono de puntualidad proporcionalmente a los retardos incurridos durante la semana (Artículo 79).

Sanciones por ausentarse (Faltas injustificadas)
Primera falta en 30 días: Amonestación por escrito.

Segunda falta en 30 días: Suspensión de hasta 4 días sin goce de sueldo.

Tercera falta en 30 días: Suspensión de hasta 8 días sin goce de sueldo.

Cuarta falta en 30 días: Terminación de la relación laboral sin responsabilidad para la empresa (Artículo 47, Fracción X de la LFT).

Faltar un día antes o después de días de descanso/vacaciones: Suspensión de hasta 5 días sin goce de sueldo (Artículo 80).

El trabajador pierde la parte proporcional del bono de asistencia por cada falta (Artículo 80).

Sanciones por incumplir con los deberes
Las sanciones varían según la gravedad de la falta:

Faltas leves:

Amonestación verbal (primera vez).

Amonestación por escrito (segunda vez).

Suspensión de 1 día (tercera vez).

Suspensión de 2 días (cuarta vez).

Suspensión de 3 a 8 días (quinta vez en adelante).

Faltas graves:

Suspensión de hasta 8 días sin goce de sueldo desde la primera ocasión (Artículo 70).

Causas de rescisión (sin responsabilidad para la empresa):

Negligencia grave, daños a equipos, robo, acoso, violencia laboral, revelar secretos industriales, entre otras (Artículo 83).

Procedimiento para justificar faltas
Para evitar que una ausencia sea considerada injustificada, el trabajador debe:

En caso de permiso: Obtener autorización por escrito del supervisor.

En caso de enfermedad/accidente: Presentar incapacidad del IMSS el mismo día de su expedición (Artículo 72).

Nota importante
Las sanciones se aplican considerando la gravedad de la falta y el historial del trabajador. El trabajador tiene derecho a ser escuchado en su defensa antes de cualquier sanción (Artículo 77).

Fuente: Capítulos XII y XIII del Reglamento Interno de Trabajo 2024.

Si pregunto ¿Qué hago si creo que mi jefe está incumpliendo el contrato colectivo? anadir tambien el nombre de la persona.

{context}
{history_prompt}

Question:
{question}

Answer in {language}:
"""

    def _get_context(self, question: str, api_key: str, top_k: int = 3) -> str:
        """Retrieve relevant context from ChromaDB using the provided API key for embeddings."""
        if not api_key:
            # This should ideally be caught before calling this method.
            raise ValueError("API key is required to get context from ChromaDB.")
        
        collection = self._get_chroma_collection(api_key=api_key)
        results = collection.query(query_texts=[question], n_results=top_k)
        
        if not results["documents"] or not results["documents"][0]:
            return None
        return "\n\n".join(results["documents"][0])[:6000]  # Limit context size

    def ask_question(
        self,
        question: str,
        language: str = 'english',
        conversation_history: list = None,
        top_k: int = 3,
        api_key: str = None  # API key must be passed by the caller
    ) -> Union[str, Generator[str, None, None]]:
        """
        Ask a question and get a streaming response using the provided API key.
        """
        if not api_key:
            # Return an error message that can be displayed to the user
            return "⚠️ API key not provided. Please set your API key in the Settings menu." \
                   if language == 'english' else \
                   "⚠️ Clave API no proporcionada. Por favor, configure su clave API en el menú de Configuración."

        try:
            # Initialize OpenAI client for this specific call using the provided API key
            current_openai_client = self._get_openai_client(api_key=api_key)
            
            # Get context from ChromaDB (this also uses the api_key for embeddings)
            context = self._get_context(question, api_key=api_key, top_k=top_k)
            
            if not context:
                return "⚠️ No relevant documents found." if language == 'english' else "⚠️ No se encontraron documentos relevantes."

            # Build the prompt
            prompt = self._build_prompt(question, context, conversation_history, language)

            # Create streaming response
            response_stream = current_openai_client.chat.completions.create(
                model=self.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
"""Eres un asistente especializado en Recursos Humanos de HISENSE ELECTRÓNICA MÉXICO, S.A. DE C.V. 
        Tu función es responder preguntas basándote exclusivamente en la información contenida en los siguientes documentos:
        - Contrato Colectivo de Trabajo 2024.
        - Reglamento Interno de Trabajo (RIT) 2024.

        Instrucciones:
        1. Responde de manera clara, precisa y fundamentada en los documentos mencionados.
        2. Si la respuesta no se encuentra en los documentos, indica claramente que no hay información disponible.
        3. Siempre responde en el mismo idioma en que se formuló la pregunta (español o inglés).
        4. Evita suposiciones o información externa a los documentos proporcionados.
        5. En caso de preguntas sobre procedimientos, derechos u obligaciones, cita la cláusula o artículo correspondiente.
        6. Si la pregunta es sobre un documento específico, menciona el nombre del documento y la sección relevante.
        7. Mencionar en que parte del documento se encuentra la respuesta.
        8. Cuando pregunte de beneficios dime todos los que esten en el contrato colectivo 
        
        8. **Formato:** - Organiza la respuesta de manera clara. 
           - Usa listas cuando sea necesario para darle forma a las respuestas
           - Decirme al ultimo la fuente de la respuesta, con el nombre del documento doxc o pdf y la sección relevante. 
           
        9. **Contexto:**
        Si me preguntan ¿Qué hago si creo que mi jefe está incumpliendo el contrato colectivo? contestar lo siguiente:
        Sanciones por llegar tarde (Retardos)
Primer retardo en 30 días: Amonestación verbal.

Segundo retardo en 30 días: Suspensión de 1 día sin goce de sueldo.

Tercer retardo en 30 días: Suspensión de 2 días sin goce de sueldo.

Cuarto retardo en 30 días: Suspensión de 3 días sin goce de sueldo.

Acumular 3 suspensiones por retardos en 6 meses: Suspensión de hasta 8 días sin goce de sueldo.

Más de 5 minutos de retardo: Se considera falta injustificada (Artículo 22).

Además, se reduce el bono de puntualidad proporcionalmente a los retardos incurridos durante la semana (Artículo 79).

Sanciones por ausentarse (Faltas injustificadas)
Primera falta en 30 días: Amonestación por escrito.

Segunda falta en 30 días: Suspensión de hasta 4 días sin goce de sueldo.

Tercera falta en 30 días: Suspensión de hasta 8 días sin goce de sueldo.

Cuarta falta en 30 días: Terminación de la relación laboral sin responsabilidad para la empresa (Artículo 47, Fracción X de la LFT).

Faltar un día antes o después de días de descanso/vacaciones: Suspensión de hasta 5 días sin goce de sueldo (Artículo 80).

El trabajador pierde la parte proporcional del bono de asistencia por cada falta (Artículo 80).

Sanciones por incumplir con los deberes
Las sanciones varían según la gravedad de la falta:

Faltas leves:

Amonestación verbal (primera vez).

Amonestación por escrito (segunda vez).

Suspensión de 1 día (tercera vez).

Suspensión de 2 días (cuarta vez).

Suspensión de 3 a 8 días (quinta vez en adelante).

Faltas graves:

Suspensión de hasta 8 días sin goce de sueldo desde la primera ocasión (Artículo 70).

Causas de rescisión (sin responsabilidad para la empresa):

Negligencia grave, daños a equipos, robo, acoso, violencia laboral, revelar secretos industriales, entre otras (Artículo 83).

Procedimiento para justificar faltas
Para evitar que una ausencia sea considerada injustificada, el trabajador debe:

En caso de permiso: Obtener autorización por escrito del supervisor.

En caso de enfermedad/accidente: Presentar incapacidad del IMSS el mismo día de su expedición (Artículo 72).

Nota importante
Las sanciones se aplican considerando la gravedad de la falta y el historial del trabajador. El trabajador tiene derecho a ser escuchado en su defensa antes de cualquier sanción (Artículo 77).

Fuente: Capítulos XII y XIII del Reglamento Interno de Trabajo 2024.

Si pregunto ¿Qué hago si creo que mi jefe está incumpliendo el contrato colectivo? anadir tambien el nombre de la persona."""
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000,
                stream=True
            )

            return self._stream_response(response_stream)
        
        except ValueError as ve: # Catch API key or configuration errors from helper methods
            error_message = f"Configuration Error: {str(ve)}" if language == 'english' else f"Error de Configuración: {str(ve)}"
            # Log the error server-side for more details if needed
            # print(f"ValueError in ask_question: {ve}")
            return error_message
        except Exception as e:
            # Log the full error server-side for debugging
            # print(f"Exception in ask_question: {e}")
            error_message = f"❌ Error generating response: {str(e)}" if language == 'english' else f"❌ Error al generar respuesta: {str(e)}"
            return error_message

    def _stream_response(self, response_stream) -> Generator[str, None, None]:
        """Yield tokens from the OpenAI stream."""
        for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

# Create instance
assistant = HRAssistant()
