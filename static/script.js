// Language configuration
const translations = {
    english: {
        title: "💬 HR Assistant",
        sidebarTitle: "Welcome!", // Used for desktop sidebar header
        mobileMenuTitle: "Menu", // For mobile collapsed header
        welcomeMessage: "Oficial AI HR Chatbot",
        placeholder: "Type your question here...",
        send: "Send",
        greeting: "Hello! I'm your HR Assistant. How can I help you today? 🤖",
        noQuestion: "Please enter a question",
        error: "❌ Error processing your question, please enter your API Key, if you don't have it, go to <a href='https://auth.openai.com/log-in' target='_blank'>https://auth.openai.com/log-in</a>",
        languageButton: "Español",
        loading: "Loading your HR assistant...",
        welcome: "Welcome to HR Assistant", // For loading screen
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
        sidebarTitle: "¡Bienvenido!", // Used for desktop sidebar header
        mobileMenuTitle: "Menú", // For mobile collapsed header
        welcomeMessage: "AI Chat Oficial de RH",
        placeholder: "Escribe tu pregunta aquí...",
        send: "Enviar",
        greeting: "¡Hola! Soy tu asistente de Recursos Humanos. ¿En qué puedo ayudarte hoy? 🤖",
        noQuestion: "Por favor ingresa una pregunta",
        error: "❌ Error al procesar tu pregunta, porfavor ingresa tu API Key, si no lo tienes ingresa a <a href='https://auth.openai.com/log-in' target='_blank'>https://auth.openai.com/log-in</a>",
        languageButton: "English",
        loading: "Cargando tu asistente de RH...",
        welcome: "Bienvenido al Asistente de RH", // For loading screen
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
const welcomeTitle = document.getElementById('welcomeTitle'); // On loading screen
const helpButton = document.getElementById('helpButton');
const helpModal = document.getElementById('helpModal');
const sidebarTitle = document.getElementById('sidebarTitle'); // Desktop sidebar title
const welcomeMessage = document.getElementById('welcomeMessage'); // Desktop welcome message
const helpButtonText = document.getElementById('helpButtonText');
const settingsButtonText = document.getElementById('settingsButtonText');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveSettingsButton = document.getElementById('saveSettingsButton');
const clearKeyButton = document.getElementById('clearKeyButton');
const mobileSidebarHeaderTitle = document.getElementById('mobileSidebarHeaderTitle'); // Mobile menu title
const hamburgerButton = document.querySelector('.hamburger');
const sidebarElement = document.querySelector('.sidebar');


// Initialize UI
function initUI() {
    // appContainer.style.display = 'block'; // Changed to flex in HTML/CSS
    welcomeTitle.textContent = translations[appLanguage].welcome; // For loading screen
    chatBox.innerHTML = `<div class="loading-message">${translations[appLanguage].loading}</div>`;

    setTimeout(() => {
        updateUIText();
        chatBox.innerHTML = ''; // Clear "Loading your HR assistant..." from chatbox
        addBotMessage(translations[appLanguage].greeting);
        setTimeout(() => {
            showSuggestedQuestions();
        }, 500); // Show suggestions after greeting

        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore body scroll if needed
            appContainer.style.display = 'flex'; // Show the app container (sidebar uses fixed, main-content flexes)
            appContainer.style.opacity = '1';
            animateUI(); // Start staggered animations
        }, 500); // Duration of loading screen fade out
    }, 1000); // Initial delay for loading screen content
}

// Update all UI text elements
function updateUIText() {
    const lang = translations[appLanguage];

    // Main chat area
    chatTitle.textContent = lang.title;
    userInput.placeholder = lang.placeholder;
    sendButton.textContent = lang.send;

    // Sidebar elements (Desktop and expanded mobile)
    sidebarTitle.textContent = lang.sidebarTitle; // For desktop main sidebar title
    if (mobileSidebarHeaderTitle) mobileSidebarHeaderTitle.textContent = lang.mobileMenuTitle; // For mobile collapsed menu bar
    welcomeMessage.textContent = lang.welcomeMessage;
    helpButtonText.textContent = lang.helpButtonText;
    settingsButtonText.textContent = lang.settingsButtonText;
    languageButton.children[1].textContent = lang.languageButton; // Assuming icon is first child

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
            // Optionally hide suggested questions after one is clicked
            // if (questionsContainer.parentNode) {
            //     questionsContainer.parentNode.removeChild(questionsContainer);
            // }
        });
        questionsList.appendChild(questionBtn);
    });

    questionsContainer.appendChild(questionsList);
    chatBox.appendChild(questionsContainer);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to show them if chatbox is already full
    setTimeout(() => { // Stagger animation
        questionsContainer.style.opacity = '1';
        questionsContainer.style.transform = 'translateY(0)';
    }, 10);
}

// Animate UI elements in sequence
function animateUI() {
    const elementsToAnimate = [
        { el: document.querySelector('.top-bar'), delay: 100 },
        { el: document.querySelector('#chatTitle'), delay: 200 },
        { el: document.querySelector('.chat-container'), delay: 300 },
        { el: document.querySelector('.chat-box'), delay: 400 }, // chat-box itself
        { el: document.querySelector('.input-area'), delay: 500 }
    ];
    elementsToAnimate.forEach(item => {
        if (item.el) { // Check if element exists
            setTimeout(() => {
                item.el.classList.add('visible');
            }, item.delay);
        }
    });
}

// Function to close mobile sidebar if open
function closeMobileSidebar() {
    if (sidebarElement && hamburgerButton && window.innerWidth <= 768) {
        sidebarElement.classList.remove('expanded');
        hamburgerButton.setAttribute('aria-expanded', 'false');
    }
}

// Switch between English and Spanish
function switchLanguage() {
    closeMobileSidebar(); // Close mobile menu if open
    appLanguage = appLanguage === 'english' ? 'spanish' : 'english';
    updateUIText();
    // chatBox.style.opacity = 0; // Let's re-evaluate this transition
    // setTimeout(() => {
        chatBox.innerHTML = ''; // Clear previous messages or greeting
        addBotMessage(translations[appLanguage].greeting);
        // chatBox.style.opacity = 1;
        setTimeout(() => showSuggestedQuestions(), 500); // Show new suggestions
    // }, 300);
}

// Help modal functions
function openHelpModal() {
    closeMobileSidebar();
    helpModal.style.display = 'flex'; // Use flex for centering
    document.body.classList.add('modal-open');
    setTimeout(() => {
        helpModal.classList.add('visible');
    }, 10); // Short delay for transition
}

function closeHelpModal() {
    helpModal.classList.remove('visible');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        helpModal.style.display = 'none';
    }, 300); // Match CSS transition duration
}

// Settings modal functions
function openSettingsModal() {
    closeMobileSidebar();
    settingsModal.style.display = 'flex'; // Use flex for centering
    document.body.classList.add('modal-open');
    setTimeout(() => {
        settingsModal.classList.add('visible');
    }, 10);
}

function closeSettingsModal() {
    settingsModal.classList.remove('visible');
    document.body.classList.remove('modal-open');
    setTimeout(() => {
        settingsModal.style.display = 'none';
    }, 300);
}

// Save API key
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
        // Re-use noQuestion translation, but adapt it for API key context
        alert(translations[appLanguage].noQuestion.replace(translations[appLanguage].placeholder.split(" ")[0].toLowerCase(), "API key"));
        return;
    }

    const originalButtonText = saveSettingsButton.textContent;
    saveSettingsButton.disabled = true;
    saveSettingsButton.textContent = translations[appLanguage].typing.split("...")[0]; // "Generating..." or "Cargando..."

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
        saveSettingsButton.textContent = originalButtonText;
    });
}

// Clear API key
function clearApiKey() {
    apiKeyInput.value = '';
    // Consider a confirmation before clearing
    fetch('/set_api_key', { // Assuming clearing means setting an empty key
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: '' }) // Send empty string
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
             alert('Error clearing API key: ' + data.error); // Should be translated
        } else {
            alert(translations[appLanguage].settingsSaved.replace(translations[appLanguage].saveSettings, translations[appLanguage].clearKey)); // Crude re-use, better to have dedicated translation
        }
    })
    .catch(error => {
        console.error('Error clearing API key:', error);
        alert(translations[appLanguage].error);
    });
}


// Translation function for messages
function translateMessage(messageElement, targetLanguage) {
    const messageTextElement = messageElement.querySelector('.message-text');
    if (!messageTextElement) return;

    const currentText = messageTextElement.dataset.originalText || messageTextElement.textContent; // Use original if already translated once
    messageTextElement.dataset.originalText = currentText; // Store original text

    const originalHTML = messageTextElement.innerHTML;
    messageTextElement.innerHTML = `<div class="loading-translation">${translations[appLanguage].translating}</div>`;

    // Manage translate button visibility/state
    const translateButton = messageElement.querySelector('.translate-btn');
    if (translateButton) translateButton.disabled = true;


    fetch('/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: currentText,
            target_language: targetLanguage
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error || !data.translated_text) {
            messageTextElement.innerHTML = currentText; // Restore original text content
            console.error('Translation error:', data.error);
            // Optionally show an error to the user
        } else {
            messageTextElement.innerHTML = data.translated_text; // Set translated text
            // Update button to allow translating back or to the other language
            if (translateButton) {
                const newTargetLang = targetLanguage === 'english' ? 'spanish' : 'english';
                translateButton.innerHTML = newTargetLang === 'english' ? 'EN' : 'ES';
                translateButton.title = `Translate to ${newTargetLang.charAt(0).toUpperCase() + newTargetLang.slice(1)}`;
                // Update event listener to translate to the new target
                translateButton.onclick = () => translateMessage(messageElement, newTargetLang);
            }
        }
    })
    .catch(error => {
        console.error('Translation failed:', error);
        messageTextElement.innerHTML = currentText; // Restore original text on network failure
    })
    .finally(() => {
        if (translateButton) translateButton.disabled = false;
    });
}


// Add Bot Message with Typing Effect
function addBotMessage(message, specialEffect = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-text';
    messageElement.appendChild(messageContent);

    // Add translation button container (only if not the initial greeting or simple messages)
    if (message !== translations[appLanguage].greeting && specialEffect !== false) { // Also check specialEffect to avoid adding to HTML error messages that won't type
        const translationContainer = document.createElement('div');
        translationContainer.className = 'translation-buttons';

        const translateButton = document.createElement('button');
        translateButton.className = 'translate-btn';
        const targetLangForButton = appLanguage === 'english' ? 'spanish' : 'english';
        translateButton.innerHTML = targetLangForButton === 'english' ? 'EN' : 'ES';
        translateButton.title = `Translate to ${targetLangForButton === 'english' ? 'English' : 'Spanish'}`;

        translateButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent message click if any
            // Determine target language based on current app language (or button text)
            const langToTranslateTo = translateButton.innerHTML === 'ES' ? 'spanish' : 'english';
            translateMessage(messageElement, langToTranslateTo);
        });

        translationContainer.appendChild(translateButton);
        messageElement.appendChild(translationContainer);
    }

    chatBox.appendChild(messageElement);

    // Animate message appearance
    setTimeout(() => {
        // If specialEffect is explicitly false, assume the message might contain HTML
        // (like your error message with a link) and should be rendered directly.
        if (specialEffect === false) {
            messageContent.innerHTML = message; // Render HTML directly
            chatBox.scrollTop = chatBox.scrollHeight;
            messageElement.classList.add('reveal'); // Add any reveal class if used
        } else {
            // Original typing effect for normal messages
            let i = 0;
            const baseSpeed = 20; // Base speed
            const lengthFactor = Math.max(0, Math.min(15, message.length / 20)); // Adjust factor as needed
            const speed = baseSpeed - lengthFactor;

            function typingEffect() {
                if (i < message.length) {
                    messageContent.innerHTML += message.charAt(i++);
                    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll while typing
                    setTimeout(typingEffect, speed);
                } else {
                    messageElement.classList.add('reveal'); // Can be used for further CSS animation
                    // Example special effect (pulse)
                    // if (specialEffect && message.length > 80) { // Check if specialEffect is true for the pulse
                    //     messageElement.classList.add('pulse');
                    //     setTimeout(() => messageElement.classList.remove('pulse'), 1000);
                    // }
                    chatBox.scrollTop = chatBox.scrollHeight; // Final scroll after message is complete
                }
            }
            typingEffect(); // Start typing effect
        }
    }, 100); // Delay for message element to be in DOM for transitions

    return messageElement;
}


function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    // messageElement.style.opacity = '0';
    // messageElement.style.transform = 'translateX(20px)';
    messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Preserve line breaks
    chatBox.appendChild(messageElement);

    // Animate message appearance
    // setTimeout(() => {
        // messageElement.style.opacity = '1';
        // messageElement.style.transform = 'translateX(0)';
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    // }, 10);
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
    sendButton.disabled = true;

    // 1. Create the single bot message element.
    // This element will first show "typing..." and then the streamed response.
    const botResponseContainer = document.createElement('div');
    botResponseContainer.className = 'message bot-message'; // Basic bot message style

    const messageTextElement = document.createElement('div');
    messageTextElement.className = 'message-text'; // Container for the actual text content

    // 2. Set initial content to the "typing indicator" (dots and text).
    // We'll use a new class 'typing-indicator-inline' for the inner div.
    messageTextElement.innerHTML = `
        <div class="typing-indicator-inline">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <div class="typing-text">${translations[appLanguage].typing}</div>
        </div>
    `;
    botResponseContainer.appendChild(messageTextElement);
    chatBox.appendChild(botResponseContainer);
    chatBox.scrollTop = chatBox.scrollHeight;

    fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ question: question, language: appLanguage })
    })
    .then(response => {
        // We will now modify botResponseContainer directly, instead of removing a separate indicator.
        if (!response.ok) {
            // If an error occurs before the stream starts, remove the placeholder and show an error.
            if (botResponseContainer.parentNode === chatBox) {
                chatBox.removeChild(botResponseContainer);
            }
            return response.json().then(errData => {
                throw new Error(errData.error || `HTTP error! status: ${response.status}`);
            }).catch(() => { // Fallback if not JSON
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            });
        }

        // 3. Clear the "typing..." content from messageTextElement and prepare for streaming.
        messageTextElement.innerHTML = ''; // Clear the typing indicator dots and text
        botResponseContainer.classList.add('streaming'); // Add streaming class for the caret to the main container

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialData = '';

        function readStream() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    botResponseContainer.classList.remove('streaming'); // Remove caret animation

                    // Add translation button to the completed streamed message
                    const translationContainer = document.createElement('div');
                    translationContainer.className = 'translation-buttons persistent';

                    const translateButton = document.createElement('button');
                    translateButton.className = 'translate-btn';
                    const targetLangForButton = appLanguage === 'english' ? 'spanish' : 'english';
                    translateButton.innerHTML = targetLangForButton === 'english' ? 'EN' : 'ES';
                    translateButton.title = `Translate to ${targetLangForButton === 'english' ? 'English' : 'Spanish'}`;
                    
                    translateButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const langToTranslateTo = translateButton.innerHTML === 'ES' ? 'spanish' : 'english';
                        // Pass botResponseContainer as it's the main message element holding messageTextElement
                        translateMessage(botResponseContainer, langToTranslateTo);
                    });
                    
                    translationContainer.appendChild(translateButton);
                    // Append to botResponseContainer, which is the div.message.bot-message
                    botResponseContainer.appendChild(translationContainer); 
                    chatBox.scrollTop = chatBox.scrollHeight;
                    sendButton.disabled = false; // Re-enable send button
                    return;
                }

                partialData += decoder.decode(value, { stream: true });
                const lines = partialData.split('\n\n');
                partialData = lines.pop(); 

                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = line.substring(6); 
                            if (jsonData.trim() === "[DONE]") {
                                return;
                            }
                            const data = JSON.parse(jsonData);
                            if (data.token) {
                                messageTextElement.innerHTML += data.token; // Stream into messageTextElement
                                chatBox.scrollTop = chatBox.scrollHeight;
                            }
                            if (data.error) {
                                console.error("Server error during stream:", data.error);
                                messageTextElement.innerHTML += `<br><span class="stream-error">Error: ${data.error}</span>`;
                                chatBox.scrollTop = chatBox.scrollHeight;
                            }
                        } catch (e) {
                            console.error("Error parsing stream data:", e, "Line:", line);
                        }
                    }
                });
                return readStream(); 
            }).catch(streamError => { 
                 console.error('Stream reading error:', streamError);
                 if (botResponseContainer.parentNode === chatBox) { // Remove the placeholder on error
                     chatBox.removeChild(botResponseContainer);
                 }
                 addBotMessage(`${translations[appLanguage].error}: Streaming failed.`, false);
                 sendButton.disabled = false; 
            });
        }
        return readStream();
    })
    .catch(error => { 
        console.error('Fetch/Ask Error:', error);
        // Ensure placeholder is removed if it was added and an error occurred before/during fetch
        if (botResponseContainer && botResponseContainer.parentNode === chatBox) {
            chatBox.removeChild(botResponseContainer);
        }
        addBotMessage(`${translations[appLanguage].error}: ${error.message}`, false);
        sendButton.disabled = false; 
    });
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initUI(); // Initializes UI, language, and initial bot message

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                if (modal.id === 'helpModal') closeHelpModal();
                else if (modal.id === 'settingsModal') closeSettingsModal();
            }
        });
    });
    
    // Hamburger menu toggle
    if (hamburgerButton && sidebarElement) {
        hamburgerButton.addEventListener('click', () => {
            sidebarElement.classList.toggle('expanded');
            const isExpanded = sidebarElement.classList.contains('expanded');
            hamburgerButton.setAttribute('aria-expanded', isExpanded.toString());
        });
    }


    userInput.addEventListener('input', () => {
        sendButton.disabled = userInput.value.trim().length === 0;
    });
    sendButton.disabled = true; // Initially disable if input is empty

    // Send message
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) { // Check if button is enabled
                sendMessage();
            }
        }
    });

    // Sidebar buttons
    languageButton.addEventListener('click', switchLanguage);
    helpButton.addEventListener('click', openHelpModal);
    settingsButton.addEventListener('click', openSettingsModal);

    // Settings modal buttons
    saveSettingsButton.addEventListener('click', saveApiKey);
    clearKeyButton.addEventListener('click', clearApiKey);

    // Close modals on backdrop click or Escape key
    window.addEventListener('click', (e) => {
        if (e.target === helpModal && helpModal.classList.contains('visible')) {
            closeHelpModal();
        }
        if (e.target === settingsModal && settingsModal.classList.contains('visible')) {
            closeSettingsModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (helpModal.style.display !== 'none' && helpModal.classList.contains('visible')) {
                closeHelpModal();
            }
            if (settingsModal.style.display !== 'none' && settingsModal.classList.contains('visible')) {
                closeSettingsModal();
            }
        }
    });
});
