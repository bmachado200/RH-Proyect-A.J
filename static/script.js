// Language configuration
const translations = {
    english: {
        title: "💬 HR Assistant",
        placeholder: "Type your question here...",
        send: "Send",
        greeting: "Hello! I'm your HR Assistant powered by Ollama/Llama3. How can I help you today?",
        dbSelectorLabel: "Search in:",
        dbOptions: {
            internos: "📄 Internal Documents",
            contrato: "📑 Collective Contract"
        },
        noQuestion: "Please enter a question",
        error: "❌ Error processing your question",
        searching: "Searching in",
        processing: "Processing with Llama3",
        connected: "Connected",
        disconnected: "Disconnected"
    },
    spanish: {
        title: "💬 Asistente de RH",
        placeholder: "Escribe tu pregunta aquí...",
        send: "Enviar",
        greeting: "¡Hola! Soy tu asistente de RH impulsado por Ollama/Llama3. ¿En qué puedo ayudarte hoy?",
        dbSelectorLabel: "Consultar en:",
        dbOptions: {
            internos: "📄 Documentos Internos",
            contrato: "📑 Contrato Colectivo"
        },
        noQuestion: "Por favor ingresa una pregunta",
        error: "❌ Error al procesar tu pregunta",
        searching: "Buscando en",
        processing: "Procesando con Llama3",
        connected: "Conectado",
        disconnected: "Desconectado"
    }
};

let appLanguage = 'spanish';
let currentSource = 'internos';

// DOM Elements
const chatTitle = document.querySelector('.chat-title');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const sourceButtons = document.querySelectorAll('.source-button');
const languageToggle = document.querySelector('.language-toggle');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.querySelector('.status-text');

// Initialize UI
updateUIText();
addBotMessage(translations[appLanguage].greeting);
checkOllamaStatus();

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

sourceButtons.forEach(button => {
    button.addEventListener('click', () => {
        sourceButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentSource = button.dataset.source;
    });
});

languageToggle.addEventListener('click', () => {
    appLanguage = appLanguage === 'spanish' ? 'english' : 'spanish';
    updateUIText();
});

function updateUIText() {
    const lang = translations[appLanguage];
    chatTitle.textContent = lang.title;
    userInput.placeholder = lang.placeholder;
    sendButton.textContent = lang.send;
    statusText.textContent = lang.connected;
}

async function checkOllamaStatus() {
    try {
        const response = await fetch('/status');
        const isConnected = await response.json();
        
        statusIndicator.classList.toggle('offline', !isConnected);
        statusText.textContent = translations[appLanguage][isConnected ? 'connected' : 'disconnected'];
    } catch (error) {
        statusIndicator.classList.add('offline');
        statusText.textContent = translations[appLanguage].disconnected;
    }
}

function createTypingIndicator(source) {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
        <span>${translations[appLanguage].processing}</span>
        <div class="dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    return indicator;
}

function formatSources(sources) {
    if (!sources || !sources.length) return '';
    
    return `
        <div class="sources-section">
            📌 Sources:
            ${sources.map((source, index) => `
                <div class="source-item">
                    ${index + 1}. ${source.fuente}
                    <span class="source-match">(${Math.round(source.similitud * 100)}% match)</span>
                </div>
            `).join('')}
        </div>
    `;
}

async function sendMessage() {
    const question = userInput.value.trim();
    
    if (!question) {
        alert(translations[appLanguage].noQuestion);
        return;
    }
    
    addUserMessage(question);
    userInput.value = '';
    
    const typingIndicator = createTypingIndicator(currentSource);
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                question: question,
                doc_type: currentSource
            })
        });
        
        const data = await response.json();
        chatBox.removeChild(typingIndicator);
        
        if (data.error) {
            addBotMessage(data.error);
        } else {
            const formattedResponse = `
                ${data.response}
                ${formatSources(data.sources)}
            `;
            addBotMessage(formattedResponse);
        }
    } catch (error) {
        chatBox.removeChild(typingIndicator);
        addBotMessage(translations[appLanguage].error);
        console.error('Error:', error);
    }
}

function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addBotMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}