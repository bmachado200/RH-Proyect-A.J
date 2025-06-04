// Language configuration
const translations = {
    english: {
        title: "💬 HR Assistant",
        sidebarTitle: "Welcome!",
        welcomeMessage: "Oficial AI HR Chatbot",
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
        helpTitle: "About HR Assistant",
        helpText: "This AI assistant specializes in HR policies and procedures at HISENSE ELECTRÓNICA MÉXICO. It can provide information from the Collective Work Agreement and Internal Work Regulations.",
        helpCapabilities: "Capabilities:",
        helpItem1: "Answer questions about employee rights",
        helpItem2: "Explain HR policies and procedures",
        helpItem3: "Provide information about benefits",
        helpItem4: "Clarify work regulations",
        helpLanguage: "The assistant supports both English and Spanish.",
        suggestedTitle: "Try asking:",
        helpButtonText: "Help",
        settingsButtonText: "Settings",
        translating: "Translating...",
        settingsTitle: "Settings",
        apiKeyLabel: "OpenAI API Key",
        apiKeyPlaceholder: "Enter your OpenAI API key",
        saveSettings: "Save",
        settingsSaved: "Settings saved successfully",
        invalidKey: "Invalid API key",
        settingsText: "Enter your OpenAI API key to use this service. Your key will be stored securely in your session.",
        clearKey: "Clear Key"
    },
    spanish: {
        title: "💬 Asistente de RH",
        sidebarTitle: "Bienvenido!",
        welcomeMessage: "AI Chat Oficial de RH",
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
        helpTitle: "Acerca del Asistente de RH",
        helpText: "Este asistente de IA está especializado en políticas y procedimientos de RH en HISENSE ELECTRÓNICA MÉXICO. Puede proporcionar información del Contrato Colectivo de Trabajo y el Reglamento Interno de Trabajo.",
        helpCapabilities: "Capacidades:",
        helpItem1: "Responder preguntas sobre derechos laborales",
        helpItem2: "Explicar políticas y procedimientos de RH",
        helpItem3: "Proveer información sobre beneficios",
        helpItem4: "Aclarar regulaciones laborales",
        helpLanguage: "El asistente soporta inglés y español.",
        suggestedTitle: "Prueba preguntando:",
        helpButtonText: "Ayuda",
        settingsButtonText: "Configuración",
        translating: "Traduciendo...",
        settingsTitle: "Configuración",
        apiKeyLabel: "Clave API de OpenAI",
        apiKeyPlaceholder: "Ingresa tu clave API de OpenAI",
        saveSettings: "Guardar",
        settingsSaved: "Configuración guardada exitosamente",
        invalidKey: "Clave API inválida",
        settingsText: "Ingresa tu clave API de OpenAI para usar este servicio. Tu clave se almacenará de forma segura en tu sesión.",
        clearKey: "Borrar Clave"
    }
};

const suggestedQuestions = {
    english: [
        "What benefits do I have as an employee under the collective agreement?",
        "What should I do if I think my boss is violating the collective agreement?",
        "What behaviors are prohibited according to the internal regulations?",
        "What are the penalties for being late, absent, or failing to fulfill my duties?"
    ],
    spanish: [
        "¿Qué beneficios tengo como trabajador bajo el contrato colectivo?",
        "¿Qué hago si creo que mi jefe está incumpliendo el contrato colectivo?",
        "¿Qué conductas están prohibidas según el reglamento interno?",
        "¿Cuáles son las sanciones por llegar tarde, ausentarse o incumplir con mis deberes?"
    ]
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
const helpButton = document.getElementById('helpButton');
const helpModal = document.getElementById('helpModal');
// const closeModal = document.querySelector('.close-modal'); // REMOVED this line
const sidebarTitle = document.getElementById('sidebarTitle');
const welcomeMessage = document.getElementById('welcomeMessage');
const helpButtonText = document.getElementById('helpButtonText');
const settingsButtonText = document.getElementById('settingsButtonText');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveSettingsButton = document.getElementById('saveSettingsButton');
const clearKeyButton = document.getElementById('clearKeyButton');

// Initialize UI
function initUI() {
    appContainer.style.display = 'block';
    welcomeTitle.textContent = translations[appLanguage].welcome;
    chatBox.innerHTML = `<div class="loading-message">${translations[appLanguage].loading}</div>`;
    
    setTimeout(() => {
        updateUIText();
        chatBox.innerHTML = '';
        addBotMessage(translations[appLanguage].greeting);
        setTimeout(() => {
            showSuggestedQuestions();
        }, 500);
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 500);
        animateUI();
    }, 1000);
}

// Update all UI text elements
function updateUIText() {
    const lang = translations[appLanguage];
    
    // Main chat area
    chatTitle.textContent = lang.title;
    userInput.placeholder = lang.placeholder;
    sendButton.textContent = lang.send;
    
    // Sidebar elements
    sidebarTitle.textContent = lang.sidebarTitle;
    welcomeMessage.textContent = lang.welcomeMessage;
    helpButtonText.textContent = lang.helpButtonText;
    settingsButtonText.textContent = lang.settingsButtonText;
    languageButton.textContent = lang.languageButton;
    
    // Modal content
    document.getElementById('helpModalTitle').textContent = lang.helpTitle;
    document.getElementById('helpModalText').textContent = lang.helpText;
    document.getElementById('helpModalCapabilities').textContent = lang.helpCapabilities;
    document.getElementById('helpModalItem1').textContent = lang.helpItem1;
    document.getElementById('helpModalItem2').textContent = lang.helpItem2;
    document.getElementById('helpModalItem3').textContent = lang.helpItem3;
    document.getElementById('helpModalItem4').textContent = lang.helpItem4;
    document.getElementById('helpModalLanguage').textContent = lang.helpLanguage;
    
    // Settings modal
    document.getElementById('settingsModalTitle').textContent = lang.settingsTitle;
    document.getElementById('settingsModalText').textContent = lang.settingsText;
    document.getElementById('apiKeyLabel').textContent = lang.apiKeyLabel;
    apiKeyInput.placeholder = lang.apiKeyPlaceholder;
    saveSettingsButton.textContent = lang.saveSettings;
    clearKeyButton.textContent = lang.clearKey;
}

// Show suggested questions
function showSuggestedQuestions() {
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'suggested-questions';
    const title = document.createElement('div');
    title.className = 'suggested-title';
    title.textContent = translations[appLanguage].suggestedTitle;
    questionsContainer.appendChild(title);

    const questionsList = document.createElement('div');
    questionsList.className = 'questions-list';

    suggestedQuestions[appLanguage].forEach(question => {
        const questionBtn = document.createElement('button');
        questionBtn.className = 'suggested-question';
        questionBtn.textContent = question;
        questionBtn.addEventListener('click', () => {
            userInput.value = question;
            sendMessage();
        });
        questionsList.appendChild(questionBtn);
    });

    questionsContainer.appendChild(questionsList);
    chatBox.appendChild(questionsContainer);
    setTimeout(() => {
        questionsContainer.style.opacity = '1';
        questionsContainer.style.transform = 'translateY(0)';
    }, 10);
}

// Animate UI elements
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

// Switch between English and Spanish
function switchLanguage() {
    appLanguage = appLanguage === 'english' ? 'spanish' : 'english';
    updateUIText();
    chatBox.style.opacity = 0;
    setTimeout(() => {
        chatBox.innerHTML = '';
        addBotMessage(translations[appLanguage].greeting);
        chatBox.style.opacity = 1;
        setTimeout(() => showSuggestedQuestions(), 500);
    }, 300);
}

// Help modal functions
function openHelpModal() {
    helpModal.style.display = 'block';
    setTimeout(() => {
        helpModal.classList.add('visible');
    }, 10);
}

function closeHelpModal() {
    helpModal.classList.remove('visible');
    setTimeout(() => {
        helpModal.style.display = 'none';
    }, 300);
}

// Settings modal functions
function openSettingsModal() {
    settingsModal.style.display = 'block';
    setTimeout(() => {
        settingsModal.classList.add('visible');
    }, 10);
}

function closeSettingsModal() {
    settingsModal.classList.remove('visible');
    setTimeout(() => {
        settingsModal.style.display = 'none';
    }, 300);
}

// Save API key
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        alert(translations[appLanguage].noQuestion.replace('question', 'API key'));
        return;
    }
    
    // Show loading state
    saveSettingsButton.disabled = true;
    saveSettingsButton.textContent = translations[appLanguage].loading;
    
    fetch('/set_api_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(`${translations[appLanguage].invalidKey}: ${data.error}`);
        } else {
            alert(translations[appLanguage].settingsSaved);
            closeSettingsModal();
        }
    })
    .catch(error => {
        console.error('Error saving API key:', error);
        alert(translations[appLanguage].error);
    })
    .finally(() => {
        saveSettingsButton.disabled = false;
        saveSettingsButton.textContent = translations[appLanguage].saveSettings;
    });
}

// Clear API key
function clearApiKey() {
    apiKeyInput.value = '';
    fetch('/set_api_key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: '' })
    })
    .then(() => {
        alert('API key cleared'); // This alert might be better if localized too
    })
    .catch(error => {
        console.error('Error clearing API key:', error);
    });
}

// Translation function
function translateMessage(messageElement, targetLanguage) {
    const messageContent = messageElement.querySelector('.message-text');
    const currentText = messageContent.textContent;
    
    // Don't translate if already in the target language
    // This check might need adjustment if appLanguage changes before translation completes or if targetLanguage is the current appLanguage
    // if (targetLanguage === appLanguage) return; // Consider if this logic is always correct

    // Show loading state
    const originalText = messageContent.innerHTML; // Store innerHTML to preserve formatting
    messageContent.innerHTML = `<div class="loading-translation">${translations[appLanguage].translating}</div>`;
    
    fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            text: currentText, // Send the plain text content for translation
            target_language: targetLanguage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            messageContent.innerHTML = originalText; // Restore original if error
            console.error('Translation error:', data.error);
            return;
        }
        messageContent.innerHTML = data.translated_text || originalText; // Use translated or fallback to original
    })
    .catch(error => {
        console.error('Translation failed:', error);
        messageContent.innerHTML = originalText; // Restore original on failure
    });
}

// Message functions
function addBotMessage(message, specialEffect = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'scaleY(0)';
    messageElement.style.transformOrigin = 'top';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-text';
    messageElement.appendChild(messageContent);

    // Add translation button container
    const translationContainer = document.createElement('div');
    translationContainer.className = 'translation-buttons';
    
    const translateButton = document.createElement('button');
    translateButton.className = 'translate-btn';
    // Text of translate button should reflect the OTHER language
    translateButton.innerHTML = appLanguage === 'english' ? 'ES' : 'EN'; 
    translateButton.title = appLanguage === 'english' ? 'Translate to Spanish' : 'Translate to English';
    
    translateButton.addEventListener('click', () => {
        // Determine target language based on current app language
        const targetLanguageForTranslation = appLanguage === 'english' ? 'spanish' : 'english';
        translateMessage(messageElement, targetLanguageForTranslation);
    });
    
    translationContainer.appendChild(translateButton);
    messageElement.appendChild(translationContainer);

    chatBox.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'scaleY(1)';
        let i = 0;
        const speed = Math.max(5, Math.min(15 - (message.length / 30), 5)); // Adjusted typing speed calculation
        const typingEffect = () => {
            if (i < message.length) {
                messageContent.innerHTML += message.charAt(i++); // Use innerHTML to render potential HTML entities
                setTimeout(typingEffect, speed);
                const isNearBottom = chatBox.scrollHeight - chatBox.clientHeight - chatBox.scrollTop < 150;
                if (isNearBottom) {
                    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
                }
            } else {
                messageElement.classList.add('reveal');
                if (specialEffect && message.length > 80) { // Example condition for pulse effect
                    messageElement.classList.add('pulse');
                    setTimeout(() => messageElement.classList.remove('pulse'), 1000);
                }
            }
        };
        setTimeout(typingEffect, 200); // Initial delay before typing starts
    }, 10); // Initial delay for message element to appear
    return messageElement; // Return for potential future manipulation
}

function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateX(20px)';
    messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Preserve line breaks
    chatBox.appendChild(messageElement);
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateX(0)';
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    }, 10);
}

// Send message to server
function sendMessage() {
    const question = userInput.value.trim();
    if (!question) {
        alert(translations[appLanguage].noQuestion);
        return;
    }
    addUserMessage(question);
    userInput.value = '';
    sendButton.disabled = true; // Disable send button after sending
    sendButton.style.opacity = '0.7';


    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message bot-message typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dots"><span></span><span></span><span></span></div>
        <div class="typing-text">${translations[appLanguage].typing}</div>
    `;
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message streaming';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-text';
    messageElement.appendChild(messageContent);
    // Do not append to chatBox yet, append after typing indicator is removed or stream starts

    fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ question: question, language: appLanguage })
    })
    .then(response => {
        if (!response.ok) { // Check for HTTP errors like 4xx, 5xx
            // Attempt to parse error from JSON response
            return response.json().then(errData => {
                throw new Error(errData.error || `HTTP error! status: ${response.status}`);
            }).catch(() => {
                // If response is not JSON or parsing fails
                throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        chatBox.removeChild(typingIndicator); // Remove typing indicator once stream starts
        chatBox.appendChild(messageElement);   // Add the streaming message element

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialData = '';

        function readStream() {
            return reader.read().then(({ done, value }) => {
                if (done) {
                    messageElement.classList.remove('streaming');
                    
                    // Add translation button to the completed message
                    const translationContainer = document.createElement('div');
                    translationContainer.className = 'translation-buttons';
                    
                    const translateButton = document.createElement('button');
                    translateButton.className = 'translate-btn';
                    translateButton.innerHTML = appLanguage === 'english' ? 'ES' : 'EN';
                    translateButton.title = appLanguage === 'english' ? 'Translate to Spanish' : 'Translate to English';
                    
                    translateButton.addEventListener('click', () => {
                        const targetLanguage = appLanguage === 'english' ? 'spanish' : 'english';
                        translateMessage(messageElement, targetLanguage);
                    });
                    
                    translationContainer.appendChild(translateButton);
                    messageElement.appendChild(translationContainer);
                    chatBox.scrollTop = chatBox.scrollHeight; // Scroll after adding button
                    return;
                }
                partialData += decoder.decode(value, { stream: true });
                const lines = partialData.split('\n\n');
                partialData = lines.pop(); // Keep incomplete line for next chunk
                
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.token) {
                                messageContent.innerHTML += data.token; // Append token
                                chatBox.scrollTop = chatBox.scrollHeight;
                            }
                            if (data.error) { // Handle server-sent errors during stream
                                console.error("Server error during stream:", data.error);
                                messageContent.innerHTML += `<br><span style="color:red;">Error: ${data.error}</span>`;
                                chatBox.scrollTop = chatBox.scrollHeight;
                                // Optionally stop processing further stream if error is critical
                            }
                        } catch (e) {
                            console.error("Error parsing stream data:", e, "Line:", line);
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
        if (typingIndicator.parentNode === chatBox) {
            chatBox.removeChild(typingIndicator);
        }
        if (messageElement.parentNode === chatBox) { // If message element was added, remove it on error
             chatBox.removeChild(messageElement);
        }
        addBotMessage(`${translations[appLanguage].error}: ${error.message}`, false);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initUI(); // Initializes UI, language, and initial bot message

    // Add event listeners to all close buttons in modals
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                if (modal.id === 'helpModal') {
                    closeHelpModal();
                } else if (modal.id === 'settingsModal') {
                    closeSettingsModal();
                }
            }
        });
    });
    
    // Initial loading animation and UI setup
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            appContainer.style.display = 'flex'; // Changed to flex for sidebar layout
            setTimeout(() => {
                appContainer.style.opacity = '1';
                document.querySelector('.top-bar').classList.add('visible');
                document.querySelector('.chat-container').classList.add('visible');
                document.querySelector('#chatTitle').classList.add('visible');
                document.querySelector('.chat-box').classList.add('visible');
                document.querySelector('.input-area').classList.add('visible');
            }, 100); // Reduced delay for quicker appearance after loading
        }, 500);
    }, 1000); // Initial loading screen duration

    userInput.addEventListener('focus', () => {
        userInput.parentElement.style.boxShadow = '0 0 0 2px rgba(47, 85, 209, 0.3)'; // Adjusted color to match theme
    });
    userInput.addEventListener('blur', () => {
        userInput.parentElement.style.boxShadow = 'none';
    });
    userInput.addEventListener('input', () => {
        sendButton.disabled = userInput.value.trim().length === 0;
        sendButton.style.opacity = sendButton.disabled ? '0.7' : '1';
    });

    // Other general event listeners
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { // Send on Enter, allow Shift+Enter for newline
            e.preventDefault(); // Prevent default Enter behavior (like newline in some cases)
            sendMessage();
        }
    });
    languageButton.addEventListener('click', switchLanguage);
    helpButton.addEventListener('click', openHelpModal);
    settingsButton.addEventListener('click', openSettingsModal);
    saveSettingsButton.addEventListener('click', saveApiKey);
    clearKeyButton.addEventListener('click', clearApiKey);
    // closeModal.addEventListener('click', closeHelpModal); // REMOVED this - handled by querySelectorAll loop

    // Close modals when clicking outside their content or pressing Escape
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) { // If click is on the modal backdrop itself
            closeHelpModal();
        }
        if (e.target === settingsModal) { // If click is on the modal backdrop itself
            closeSettingsModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (helpModal.style.display === 'block' && helpModal.classList.contains('visible')) {
                closeHelpModal();
            }
            if (settingsModal.style.display === 'block' && settingsModal.classList.contains('visible')) {
                closeSettingsModal();
            }
        }
    });
});
