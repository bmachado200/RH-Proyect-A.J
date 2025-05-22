// Language configuration
const translations = {
    english: {
        title: "💬 HR Assistant",
        placeholder: "Type your question here...",
        send: "Send",
        greeting: "Hello! I'm your HR Assistant. How can I help you today? 🤖",
        noQuestion: "Please enter a question",
        error: "❌ Error processing your question",
        languageButton: "Español",
        loading: "Loading your HR assistant...",
        welcome: "Welcome to HR Assistant",
        typing: "Generating response...",
        clear: "Clear Conversation",
        contrato_colectivo: "Collective Agreement",
        documentos_internos: "Internal Documents",
        selectCollection: "Select document source:",
        helpTitle: "About HR Assistant",
        helpText: "This AI assistant specializes in HR policies and procedures at HISENSE ELECTRÓNICA MÉXICO. It can provide information from the Collective Work Agreement and Internal Work Regulations.",
        helpCapabilities: "Capabilities:",
        helpItem1: "Answer questions about employee rights",
        helpItem2: "Explain HR policies and procedures",
        helpItem3: "Provide information about benefits",
        helpItem4: "Clarify work regulations",
        helpLanguage: "The assistant supports both English and Spanish."
    },
    spanish: {
        title: "💬 Asistente de RH",
        placeholder: "Escribe tu pregunta aquí...",
        send: "Enviar",
        greeting: "¡Hola! Soy tu asistente de Recursos Humanos. ¿En qué puedo ayudarte hoy? 🤖",
        noQuestion: "Por favor ingresa una pregunta",
        error: "❌ Error al procesar tu pregunta",
        languageButton: "English",
        loading: "Cargando tu asistente de RH...",
        welcome: "Bienvenido al Asistente de RH",
        typing: "Generando respuesta...",
        clear: "Limpiar Conversación",
        contrato_colectivo: "Contrato Colectivo",
        documentos_internos: "Documentos Internos",
        selectCollection: "Selecciona fuente de documentos:",
        helpTitle: "Acerca del Asistente de RH",
        helpText: "Este asistente de IA está especializado en políticas y procedimientos de RH en HISENSE ELECTRÓNICA MÉXICO. Puede proporcionar información del Contrato Colectivo de Trabajo y el Reglamento Interno de Trabajo.",
        helpCapabilities: "Capacidades:",
        helpItem1: "Responder preguntas sobre derechos laborales",
        helpItem2: "Explicar políticas y procedimientos de RH",
        helpItem3: "Proveer información sobre beneficios",
        helpItem4: "Aclarar regulaciones laborales",
        helpLanguage: "El asistente soporta inglés y español."
    }
};

let appLanguage = 'english';

// DOM Elements
const languageButton = document.getElementById('languageButton');
const chatTitle = document.getElementById('chatTitle');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');
const loadingScreen = document.getElementById('loadingScreen');
const appContainer = document.getElementById('appContainer');
const welcomeTitle = document.getElementById('welcomeTitle');
const helpIcon = document.getElementById('floating-help-icon');
const helpModal = document.getElementById('helpModal');
const closeModal = document.querySelector('.close-modal');

// Initialize UI with animations
function initUI() {
    // Immediately show the app container (remove display:none)
    appContainer.style.display = 'block';
    
    // Set welcome title
    welcomeTitle.textContent = translations[appLanguage].welcome;
    
    // Show loading message in chat
    chatBox.innerHTML = `<div class="loading-message">${translations[appLanguage].loading}</div>`;
    
    // Simulate resource loading
    setTimeout(() => {
        updateUIText();
        chatBox.innerHTML = '';
        addBotMessage(translations[appLanguage].greeting);
        
        // Hide loading screen after content is ready
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 500);
        
        // Animate UI elements in
        animateUI();
    }, 1000); // Reduced from 1500ms for faster perceived loading
}

// Update all text elements based on current language
function updateUIText() {
    const lang = translations[appLanguage];
    chatTitle.textContent = lang.title;
    userInput.placeholder = lang.placeholder;
    sendButton.textContent = lang.send;
    languageButton.textContent = lang.languageButton;
    
    // Update collection selector labels
    document.querySelector('#collectionSelect option[value="contrato_colectivo"]').textContent = lang.contrato_colectivo;
    document.querySelector('#collectionSelect option[value="documentos_internos"]').textContent = lang.documentos_internos;
    document.querySelector('.collection-selector label').textContent = lang.selectCollection;
    
    // Update help modal text if it exists
    if (document.getElementById('helpModalTitle')) {
        document.getElementById('helpModalTitle').textContent = lang.helpTitle;
        document.getElementById('helpModalText').textContent = lang.helpText;
        document.getElementById('helpModalCapabilities').textContent = lang.helpCapabilities;
        document.getElementById('helpModalItem1').textContent = lang.helpItem1;
        document.getElementById('helpModalItem2').textContent = lang.helpItem2;
        document.getElementById('helpModalItem3').textContent = lang.helpItem3;
        document.getElementById('helpModalItem4').textContent = lang.helpItem4;
        document.getElementById('helpModalLanguage').textContent = lang.helpLanguage;
    }
}

// Modal functionality
if (helpIcon) {
    helpIcon.addEventListener('click', () => {
        helpModal.style.display = 'block';
        setTimeout(() => {
            helpModal.classList.add('visible');
        }, 10);
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        helpModal.classList.remove('visible');
        setTimeout(() => {
            helpModal.style.display = 'none';
        }, 300);
    });
}

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
    if (helpModal && e.target === helpModal) {
        helpModal.classList.remove('visible');
        setTimeout(() => {
            helpModal.style.display = 'none';
        }, 300);
    }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (helpModal && e.key === 'Escape' && helpModal.style.display === 'block') {
        helpModal.classList.remove('visible');
        setTimeout(() => {
            helpModal.style.display = 'none';
        }, 300);
    }
});

// Rest of your existing script.js code remains the same...
// [Previous code continues below...]

// Animate UI elements one after another
function animateUI() {
    const elements = [
        document.querySelector('.top-bar'),
        document.querySelector('#chatTitle'),
        document.querySelector('.chat-box'),
        document.querySelector('.input-area')
    ];
    
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Toggle between languages
function switchLanguage() {
    appLanguage = appLanguage === 'english' ? 'spanish' : 'english';
    updateUIText();
    
    // Animate language change
    chatBox.style.opacity = 0;
    setTimeout(() => {
        chatBox.innerHTML = '';
        addBotMessage(translations[appLanguage].greeting);
        chatBox.style.opacity = 1;
    }, 300);
}

// Enhanced bot message with cool effects
function addBotMessage(message, specialEffect = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'scaleY(0)';
    messageElement.style.transformOrigin = 'top';
    
    // Create message content container
    const messageContent = document.createElement('div');
    messageContent.className = 'message-text';
    messageElement.appendChild(messageContent);
    
    chatBox.appendChild(messageElement);
    
    // Animate container
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'scaleY(1)';
        
        // Typewriter effect
        let i = 0;
        const speed = Math.max(5, Math.min(15 - (message.length / 30), 5));
        const typingEffect = () => {
            if (i < message.length) {
                messageContent.innerHTML += message.charAt(i);
                i++;
                setTimeout(typingEffect, speed);
                
                // Auto-scroll with smooth behavior
                const isNearBottom = chatBox.scrollHeight - chatBox.clientHeight - chatBox.scrollTop < 150;
                if (isNearBottom) {
                    chatBox.scrollTo({
                        top: chatBox.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            } else {
                // Final reveal effect
                messageElement.classList.add('reveal');
                
                // Pulse effect for important messages
                if (specialEffect && message.length > 80) {
                    messageElement.classList.add('pulse');
                    setTimeout(() => {
                        messageElement.classList.remove('pulse');
                    }, 1000);
                }
            }
        };
        
        setTimeout(typingEffect, 200);
    }, 10);
    
    return messageElement;
}

// Add user message with animation
function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateX(20px)';
    messageElement.innerHTML = message.replace(/\n/g, '<br>');
    
    chatBox.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateX(0)';
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }, 10);
}

// Handle sending messages
function sendMessage() {
    const question = userInput.value.trim();
    if (!question) {
        alert(translations[appLanguage].noQuestion);
        return;
    }
    
    addUserMessage(question);
    userInput.value = '';
    
    // Get selected collection
    const collectionSelect = document.getElementById('collectionSelect');
    const selectedCollection = collectionSelect.value;
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="typing-text">${translations[appLanguage].typing}</div>
    `;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    // Create message element for streaming response
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message streaming';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-text';
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);
    
    // Use fetch with POST
    fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
            question: question,
            language: appLanguage,
            collection: selectedCollection
        })
    })
    .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialData = '';
        
        function readStream() {
            return reader.read().then(({done, value}) => {
                if (done) {
                    chatBox.removeChild(typingIndicator);
                    messageElement.classList.remove('streaming');
                    return;
                }
                
                partialData += decoder.decode(value, {stream: true});
                const lines = partialData.split('\n\n');
                partialData = lines.pop();
                
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.substring(6));
                        if (data.token) {
                            messageContent.innerHTML += data.token;
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }
                    }
                });
                
                return readStream();
            });
        }
        
        return readStream();
    })
    .catch(error => {
        console.error('Error:', error);
        chatBox.removeChild(typingIndicator);
        chatBox.removeChild(messageElement);
        addBotMessage(translations[appLanguage].error, false);
    });
}

// Clear conversation
function clearConversation() {
    const lang = translations[appLanguage];
    const confirmation = confirm(lang.clear + "?");
    
    if (confirmation) {
        chatBox.innerHTML = '';
        fetch('/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: appLanguage })
        })
        .then(() => {
            addBotMessage(lang.greeting);
        });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial setup - directly show the app
    initUI();

    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContainer.style.display = 'block';
            
            setTimeout(() => {
                appContainer.style.opacity = '1';
                document.querySelector('.top-bar').classList.add('visible');
                document.querySelector('.chat-container').classList.add('visible');
                document.querySelector('#chatTitle').classList.add('visible');
                document.querySelector('.chat-box').classList.add('visible');
                document.querySelector('.input-area').classList.add('visible');
                
                // Initialize chat
                initUI();
            }, 500);
        }, 500);
    }, 1000);
    
    // Input focus animation
    userInput.addEventListener('focus', () => {
        userInput.parentElement.style.boxShadow = '0 0 0 2px rgba(230, 126, 34, 0.3)';
    });
    
    userInput.addEventListener('blur', () => {
        userInput.parentElement.style.boxShadow = 'none';
    });
    
    // Input validation
    userInput.addEventListener('input', () => {
        if (userInput.value.trim().length > 0) {
            sendButton.disabled = false;
            sendButton.style.opacity = '1';
        } else {
            sendButton.disabled = true;
            sendButton.style.opacity = '0.7';
        }
    });
});

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
languageButton.addEventListener('click', switchLanguage);
if (clearButton) clearButton.addEventListener('click', clearConversation);

chatBox.addEventListener('wheel', (e) => {
    e.stopPropagation();
});

// Auto-scroll to bottom on load
window.addEventListener('load', () => {
    chatBox.scrollTop = chatBox.scrollHeight;
});