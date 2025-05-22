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
        helpTitle: "About HR Assistant",
        helpText: "This AI assistant specializes in HR policies and procedures at HISENSE ELECTRÓNICA MÉXICO. It can provide information from the Collective Work Agreement and Internal Work Regulations.",
        helpCapabilities: "Capabilities:",
        helpItem1: "Answer questions about employee rights",
        helpItem2: "Explain HR policies and procedures",
        helpItem3: "Provide information about benefits",
        helpItem4: "Clarify work regulations",
        helpLanguage: "The assistant supports both English and Spanish.",
        suggestedTitle: "Try asking:"
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
        helpTitle: "Acerca del Asistente de RH",
        helpText: "Este asistente de IA está especializado en políticas y procedimientos de RH en HISENSE ELECTRÓNICA MÉXICO. Puede proporcionar información del Contrato Colectivo de Trabajo y el Reglamento Interno de Trabajo.",
        helpCapabilities: "Capacidades:",
        helpItem1: "Responder preguntas sobre derechos laborales",
        helpItem2: "Explicar políticas y procedimientos de RH",
        helpItem3: "Proveer información sobre beneficios",
        helpItem4: "Aclarar regulaciones laborales",
        helpLanguage: "El asistente soporta inglés y español.",
        suggestedTitle: "Prueba preguntando:"
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

function updateUIText() {
    const lang = translations[appLanguage];
    chatTitle.textContent = lang.title;
    userInput.placeholder = lang.placeholder;
    sendButton.textContent = lang.send;
    languageButton.textContent = lang.languageButton;
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

window.addEventListener('click', (e) => {
    if (helpModal && e.target === helpModal) {
        helpModal.classList.remove('visible');
        setTimeout(() => {
            helpModal.style.display = 'none';
        }, 300);
    }
});

document.addEventListener('keydown', (e) => {
    if (helpModal && e.key === 'Escape' && helpModal.style.display === 'block') {
        helpModal.classList.remove('visible');
        setTimeout(() => {
            helpModal.style.display = 'none';
        }, 300);
    }
});

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

function addBotMessage(message, specialEffect = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'scaleY(0)';
    messageElement.style.transformOrigin = 'top';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-text';
    messageElement.appendChild(messageContent);
    chatBox.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'scaleY(1)';
        let i = 0;
        const speed = Math.max(5, Math.min(15 - (message.length / 30), 5));
        const typingEffect = () => {
            if (i < message.length) {
                messageContent.innerHTML += message.charAt(i++);
                setTimeout(typingEffect, speed);
                const isNearBottom = chatBox.scrollHeight - chatBox.clientHeight - chatBox.scrollTop < 150;
                if (isNearBottom) {
                    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
                }
            } else {
                messageElement.classList.add('reveal');
                if (specialEffect && message.length > 80) {
                    messageElement.classList.add('pulse');
                    setTimeout(() => messageElement.classList.remove('pulse'), 1000);
                }
            }
        };
        setTimeout(typingEffect, 200);
    }, 10);
    return messageElement;
}

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
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    }, 10);
}

function sendMessage() {
    const question = userInput.value.trim();
    if (!question) {
        alert(translations[appLanguage].noQuestion);
        return;
    }
    addUserMessage(question);
    userInput.value = '';

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
    chatBox.appendChild(messageElement);

    fetch('/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify({ question: question, language: appLanguage })
    })
    .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let partialData = '';
        function readStream() {
            return reader.read().then(({ done, value }) => {
                if (done) {
                    chatBox.removeChild(typingIndicator);
                    messageElement.classList.remove('streaming');
                    return;
                }
                partialData += decoder.decode(value, { stream: true });
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

document.addEventListener('DOMContentLoaded', () => {
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
                initUI();
            }, 500);
        }, 500);
    }, 1000);

    userInput.addEventListener('focus', () => {
        userInput.parentElement.style.boxShadow = '0 0 0 2px rgba(230, 126, 34, 0.3)';
    });
    userInput.addEventListener('blur', () => {
        userInput.parentElement.style.boxShadow = 'none';
    });
    userInput.addEventListener('input', () => {
        sendButton.disabled = userInput.value.trim().length === 0;
        sendButton.style.opacity = sendButton.disabled ? '0.7' : '1';
    });
});

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
languageButton.addEventListener('click', switchLanguage);
