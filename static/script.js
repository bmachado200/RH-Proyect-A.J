// Configuración de idioma
const translations = {
    english: {
        title: "💬 HR Assistant",
        placeholder: "Type your question here...",
        send: "Send",
        greeting: "Hello! I'm your HR Assistant. How can I help you today?",
        dbSelectorLabel: "Search in:",
        dbOptions: {
            internos: "📄 Internal Documents",
            contrato: "📑 Collective Contract"
        },
        noQuestion: "Please enter a question",
        error: "❌ Error processing your question",
        searching: "Searching in"
    },
    spanish: {
        title: "💬 Asistente de RH",
        placeholder: "Escribe tu pregunta aquí...",
        send: "Enviar",
        greeting: "¡Hola! Soy tu asistente de Recursos Humanos. ¿En qué puedo ayudarte hoy?",
        dbSelectorLabel: "Consultar en:",
        dbOptions: {
            internos: "📄 Documentos Internos",
            contrato: "📑 Contrato Colectivo"
        },
        noQuestion: "Por favor ingresa una pregunta",
        error: "❌ Error al procesar tu pregunta",
        searching: "Buscando en"
    }
};

let appLanguage = 'spanish';

// Elementos DOM
const chatTitle = document.getElementById('chatTitle');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const dbTypeSelect = document.getElementById('dbType');
const dbSelectorLabel = document.querySelector('.document-selector label');

// Inicializar UI
updateUIText();
addBotMessage(translations[appLanguage].greeting);

// Event listeners
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function updateUIText() {
    const lang = translations[appLanguage];
    chatTitle.textContent = lang.title;
    userInput.placeholder = lang.placeholder;
    sendButton.textContent = lang.send;
    dbSelectorLabel.textContent = lang.dbSelectorLabel;
    
    // Actualizar opciones del selector
    dbTypeSelect.innerHTML = '';
    for (const [value, text] of Object.entries(lang.dbOptions)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        dbTypeSelect.appendChild(option);
    }
}

function sendMessage() {
    const question = userInput.value.trim();
    const dbType = dbTypeSelect.value;
    const lang = translations[appLanguage];

    if (!question) {
        alert(lang.noQuestion);
        return;
    }
    
    addUserMessage(question);
    userInput.value = '';
    
    // Mostrar dónde se está buscando
    const dbTypeName = lang.dbOptions[dbType];
    addSystemMessage(`${lang.searching} ${dbTypeName.toLowerCase()}`);
    
    // Mostrar indicador de carga
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Enviar al backend
    fetch('/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            question: question,
            db_type: dbType
        })
    })
    .then(response => response.json())
    .then(data => {
        chatBox.removeChild(typingIndicator);
        if (data.error) {
            addBotMessage(data.error);
        } else {
            addBotMessage(data.response);
        }
    })
    .catch(error => {
        chatBox.removeChild(typingIndicator);
        addBotMessage(lang.error);
        console.error('Error:', error);
    });
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
    messageElement.innerHTML = message.replace(/\n/g, '<br>');
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system-message';
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}