import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from openai import OpenAI
import os
from typing import Generator, Union
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env

class HRAssistant:
    def __init__(self):
        # Configuration
        self.DB_DIR = "./chroma_db3"
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.OPENAI_MODEL = "gpt-3.5-turbo-0125"
        self.OPENAI_EMBEDDING_MODEL = "text-embedding-3-large"

        # Initialize clients
        self.client_oa = OpenAI(api_key=self.OPENAI_API_KEY)
        self.embedding_fn = OpenAIEmbeddingFunction(
            api_key=self.OPENAI_API_KEY,
            model_name=self.OPENAI_EMBEDDING_MODEL
        )
        self.client = chromadb.PersistentClient(path=self.DB_DIR)
        self.collection = self.client.get_or_create_collection(
            name="RH_A",
            embedding_function=self.embedding_fn
        )

    def _build_prompt(self, question: str, context: str, conversation_history: list, language: str) -> str:
        """Construct the prompt with context and conversation history."""
        history_prompt = ""
        if conversation_history:
            history_prompt = "\n\nPrevious conversation:\n"
            for msg in conversation_history:
                role = "User" if msg['role'] == 'user' else "Assistant"
                history_prompt += f"{role}: {msg['content']}\n"

        return f"""          Eres un asistente especializado en Recursos Humanos de HISENSE ELECTRÓNICA MÉXICO, S.A. DE C.V. 
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
        
        8. **Formato:** 
           - Organiza la respuesta de manera clara. 
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

        
        
Context:
{context}
{history_prompt}

Question:
{question}

Answer in {language}:
"""

    def _get_context(self, question: str, top_k: int = 3) -> str:
        """Retrieve relevant context from ChromaDB."""
        results = self.collection.query(query_texts=[question], n_results=top_k)
        if not results["documents"] or not results["documents"][0]:
            return None
        return "\n\n".join(results["documents"][0])[:6000]  # Limit context size

    def ask_question(
        self,
        question: str,
        language: str = 'english',
        conversation_history: list = None,
        top_k: int = 3
    ) -> Union[str, Generator[str, None, None]]:
        """
        Ask a question and get a streaming response.

        Returns:
            - If streaming: Generator that yields tokens
            - If error: Error message string
        """
        try:
            # Get context from ChromaDB
            context = self._get_context(question, top_k)
            if not context:
                return "⚠️ No relevant documents found." if language == 'english' else "⚠️ No se encontraron documentos relevantes."

            # Build the prompt
            prompt = self._build_prompt(question, context, conversation_history, language)

            # Create streaming response
            response_stream = self.client_oa.chat.completions.create(
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
        
        8. **Formato:** 
           - Organiza la respuesta de manera clara. 
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

Si pregunto ¿Qué hago si creo que mi jefe está incumpliendo el contrato colectivo? anadir tambien el nombre de la persona.

"""""
                        )
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000,
                stream=True
            )

            return self._stream_response(response_stream)

        except Exception as e:
            return f"❌ Error generating response: {str(e)}" if language == 'english' else f"❌ Error al generar respuesta: {str(e)}"

    def _stream_response(self, response_stream) -> Generator[str, None, None]:
        """Yield tokens from the OpenAI stream."""
        for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

# Create instance
assistant = HRAssistant()
