// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 햄버거 메뉴 기능 구현
    const hamburgerBtn = document.querySelector('.mobile-menu-button');
    const menuNav = document.querySelector('.nav-menu');
    
    if (hamburgerBtn && menuNav) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 이벤트 버블링 방지
            menuNav.classList.toggle('active');
            const isExpanded = menuNav.classList.contains('active');
            this.setAttribute('aria-expanded', isExpanded);
            this.setAttribute('aria-label', isExpanded ? '메뉴 닫기' : '메뉴 열기');
            
            // 아이콘 변경
            const icon = this.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // 메뉴 내부 클릭 시 이벤트 전파 막기
        menuNav.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // 문서 어느 곳이든 클릭 시 메뉴 닫기
        document.addEventListener('click', function() {
            if (menuNav.classList.contains('active')) {
                menuNav.classList.remove('active');
                hamburgerBtn.setAttribute('aria-expanded', 'false');
                hamburgerBtn.setAttribute('aria-label', '메뉴 열기');
                const icon = hamburgerBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // 기본 API 키 설정 (사용자가 제공한 키)
    if (!localStorage.getItem('openai_api_key')) {
        const apiKey = prompt('OpenAI API 키를 입력해주세요:');
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
        }
    }
    
    // 저장된 사용자 프롬프트 불러오기 또는 채널톡 프롬프트로 설정
    const savedPrompt = localStorage.getItem('custom_prompt');
    if (!savedPrompt) {
        // 저장된 프롬프트가 없으면 채널톡 프롬프트를 설정
        ChatbotPrompts.setCustomPrompt(ChatbotPrompts.CHANNEL_TALK_PROMPT);
    } else {
        ChatbotPrompts.loadSavedPrompt();
    }
    
    // 카드에 호버 효과 추가
    const cards = document.querySelectorAll('.document-card');
    cards.forEach(card => {
        // 카드의 제목과 본문만 클릭 가능하도록 설정 (버튼은 제외)
        card.addEventListener('click', function(e) {
            // 이벤트가 버튼에서 시작된 경우 카드 클릭 이벤트는 무시
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return; // 버튼 클릭은 무시하고 버튼 자체의 href로 이동하도록 함
            }
            
            // 카드 내부에서 버튼 찾기
            const btn = card.querySelector('.btn');
            if (btn && btn.href) {
                // 버튼의 href가 설정되어 있다면 해당 URL로 이동
                window.location.href = btn.href;
            }
        });
    });
    
    // 버튼 클릭 이벤트 추가
    const buttons = document.querySelectorAll('.document-card .btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // href가 '#' 또는 비어있는 경우 기본 동작 방지
            if (!btn.href || btn.getAttribute('href') === '#') {
                e.preventDefault();
                
                // 카드의 제목 가져오기
                const card = btn.closest('.document-card');
                const cardTitle = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
                const cardHeader = card.querySelector('.document-card-header') ? 
                    card.querySelector('.document-card-header').textContent.trim() : '';
                
                // 임시 알림 메시지 표시
                alert(`[${cardHeader}] ${cardTitle}\n해당 페이지는 준비 중입니다.\nURL을 지정해주세요.`);
            }
        });
    });
    
    // 네비게이션 아이템 클릭 효과
    const navItems = document.querySelectorAll('nav ul li a');
    navItems.forEach(item => {
        // 이미 href가 있는 항목은 기본 동작 유지 (블로그 링크 등)
        if (item.getAttribute('href') && item.getAttribute('href') !== '#') {
            return;
        }
        
        item.addEventListener('click', function(e) {
            // #만 있거나 href가 없는 경우에만 기본 동작 방지
            if (item.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            // 모든 아이템에서 active 클래스 제거
            navItems.forEach(link => link.classList.remove('active'));
            // 클릭된 아이템에 active 클래스 추가
            this.classList.add('active');
        });
    });

    // 챗봇 기능 추가
    const body = document.querySelector('body');
    
    // 챗봇 버튼 추가
    const chatbotButton = document.createElement('div');
    chatbotButton.className = 'chatbot-button';
    chatbotButton.innerHTML = '<i class="fas fa-comments chatbot-icon"></i>';
    body.appendChild(chatbotButton);
    
    // 챗봇 컨테이너 추가
    const chatbotContainer = document.createElement('div');
    chatbotContainer.className = 'chatbot-container';
    chatbotContainer.innerHTML = `
        <div class="chatbot-header">
            <h3>자격증 도우미</h3>
            <div class="chatbot-controls">
                <i class="fas fa-cog settings-button" title="설정"></i>
                <i class="fas fa-times close-button"></i>
            </div>
        </div>
        <div class="chatbot-settings" style="display: none;">
            <div class="settings-option" id="set-prompt">
                <i class="fas fa-comment-dots"></i> 프롬프트 설정
            </div>
            <div class="settings-option" id="reset-api-key">
                <i class="fas fa-key"></i> API 키 재설정
            </div>
            <div class="settings-option" id="clear-chat">
                <i class="fas fa-trash"></i> 대화 기록 지우기
            </div>
        </div>
        <div class="chatbot-prompt-settings" style="display: none;">
            <div class="prompt-header">
                <h4>프롬프트 설정</h4>
                <i class="fas fa-times close-prompt-settings"></i>
            </div>
            <div class="prompt-templates">
                <label>사전 정의된 프롬프트:</label>
                <select id="prompt-templates-select">
                    <option value="default">기본 프롬프트</option>
                    <option value="channelTalk" selected>상담톡 연결 프롬프트</option>
                    <option value="socialWorker">사회복지사 자격증</option>
                    <option value="childCareTeacher">보육교사 자격증</option>
                    <option value="lifelongEducator">평생교육사 자격증</option>
                    <option value="selfEducation">독학사 학위취득</option>
                    <option value="generalCertificate">일반 자격증 정보</option>
                </select>
            </div>
            <div class="custom-prompt">
                <label>사용자 정의 프롬프트:</label>
                <textarea id="custom-prompt" rows="6" placeholder="원하는 프롬프트를 직접 입력하세요. 예: '당신은 자격증 취득 전문가로...'">${ChatbotPrompts.getCurrentPrompt()}</textarea>
            </div>
            <div class="prompt-actions">
                <button id="apply-prompt">적용하기</button>
                <button id="cancel-prompt">취소</button>
            </div>
        </div>
        <div class="chatbot-messages">
            <div class="message bot-message">안녕하세요! 자격증 취득에 관해 궁금한 점이 있으신가요?</div>
        </div>
        <div class="chatbot-input">
            <input type="text" placeholder="질문을 입력하세요...">
            <button><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    body.appendChild(chatbotContainer);
    
    // 챗봇 버튼 클릭 이벤트
    chatbotButton.addEventListener('click', function() {
        chatbotContainer.classList.toggle('active');
        if (chatbotContainer.classList.contains('active')) {
            chatbotButton.innerHTML = '<i class="fas fa-times chatbot-icon"></i>';
        } else {
            chatbotButton.innerHTML = '<i class="fas fa-comments chatbot-icon"></i>';
        }
    });
    
    // 닫기 버튼 클릭 이벤트
    const closeButton = chatbotContainer.querySelector('.close-button');
    closeButton.addEventListener('click', function() {
        chatbotContainer.classList.remove('active');
        chatbotButton.innerHTML = '<i class="fas fa-comments chatbot-icon"></i>';
    });
    
    // 설정 버튼 클릭 이벤트
    const settingsButton = chatbotContainer.querySelector('.settings-button');
    const settingsPanel = chatbotContainer.querySelector('.chatbot-settings');
    
    settingsButton.addEventListener('click', function() {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        // 프롬프트 설정 패널 닫기
        promptSettingsPanel.style.display = 'none';
    });
    
    // 프롬프트 설정 패널
    const promptSettingsPanel = chatbotContainer.querySelector('.chatbot-prompt-settings');
    const setPromptButton = document.getElementById('set-prompt');
    const closePromptSettingsButton = chatbotContainer.querySelector('.close-prompt-settings');
    const promptTemplatesSelect = document.getElementById('prompt-templates-select');
    const customPromptTextarea = document.getElementById('custom-prompt');
    const applyPromptButton = document.getElementById('apply-prompt');
    const cancelPromptButton = document.getElementById('cancel-prompt');
    
    // 프롬프트 설정 버튼 클릭 이벤트
    setPromptButton.addEventListener('click', function() {
        // 설정 패널 닫기
        settingsPanel.style.display = 'none';
        // 프롬프트 설정 패널 열기
        promptSettingsPanel.style.display = 'block';
        // 현재 프롬프트로 텍스트 영역 업데이트
        customPromptTextarea.value = ChatbotPrompts.getCurrentPrompt();
    });
    
    // 프롬프트 템플릿 선택 이벤트
    promptTemplatesSelect.addEventListener('change', function() {
        const selectedPromptKey = this.value;
        if (selectedPromptKey === 'custom') {
            // 사용자 정의 옵션을 선택한 경우 현재 값 유지
            return;
        }
        
        // 선택한 프롬프트 템플릿으로 텍스트 영역 업데이트
        if (selectedPromptKey === 'default') {
            customPromptTextarea.value = ChatbotPrompts.DEFAULT_SYSTEM_PROMPT;
        } else {
            customPromptTextarea.value = ChatbotPrompts.PROMPT_TEMPLATES[selectedPromptKey];
        }
    });
    
    // 프롬프트 적용 버튼 클릭 이벤트
    applyPromptButton.addEventListener('click', function() {
        const customPrompt = customPromptTextarea.value.trim();
        if (customPrompt) {
            ChatbotPrompts.setCustomPrompt(customPrompt);
            promptSettingsPanel.style.display = 'none';
            addMessage('프롬프트가 성공적으로 적용되었습니다.', 'bot', true);
        } else {
            alert('프롬프트를 입력해주세요.');
        }
    });
    
    // 프롬프트 취소 버튼 클릭 이벤트
    cancelPromptButton.addEventListener('click', function() {
        promptSettingsPanel.style.display = 'none';
    });
    
    // 프롬프트 설정 패널 닫기 버튼 이벤트
    closePromptSettingsButton.addEventListener('click', function() {
        promptSettingsPanel.style.display = 'none';
    });
    
    // API 키 설정 버튼 클릭 이벤트
    const resetApiKeyButton = document.getElementById('reset-api-key');
    resetApiKeyButton.addEventListener('click', function() {
        settingsPanel.style.display = 'none';
        const apiKey = prompt('OpenAI API 키를 입력하세요:', getAPIKey());
        if (apiKey && apiKey.trim()) {
            localStorage.setItem('openai_api_key', apiKey.trim());
            addMessage('API 키가 성공적으로 설정되었습니다.', 'bot', true);
        }
    });
    
    // 대화 기록 지우기 버튼 클릭 이벤트
    const clearChatButton = document.getElementById('clear-chat');
    clearChatButton.addEventListener('click', function() {
        if (confirm('대화 기록을 지우시겠습니까?')) {
            const chatMessages = document.querySelector('.chatbot-messages');
            // 초기 메시지만 남기고 모두 삭제
            chatMessages.innerHTML = '<div class="message bot-message">안녕하세요! 자격증 취득에 관해 궁금한 점이 있으신가요?</div>';
            // 대화 기록 저장소 초기화
            localStorage.removeItem('chat_history');
            settingsPanel.style.display = 'none';
        }
    });
    
    // 채팅 입력창 엔터 이벤트
    const chatInput = chatbotContainer.querySelector('.chatbot-input input');
    const chatSendButton = chatbotContainer.querySelector('.chatbot-input button');
    
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    chatSendButton.addEventListener('click', sendMessage);
    
    // 메시지 전송 함수
    function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText) return;
        
        // 사용자 메시지 추가
        addMessage(messageText, 'user');
        chatInput.value = '';
        
        // 자동 스크롤
        const chatMessages = document.querySelector('.chatbot-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 응답 로딩 메시지 표시
        const loadingId = 'loading-' + Date.now();
        const loadingMsg = `<div class="message bot-message" id="${loadingId}">
            <span class="loading-dots">응답 생성 중<span>.</span><span>.</span><span>.</span></span>
        </div>`;
        chatMessages.insertAdjacentHTML('beforeend', loadingMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // GPT 응답 가져오기
        fetchGPTResponse(messageText)
            .then(response => {
                // 로딩 메시지 제거
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) loadingElement.remove();
                
                // 응답 메시지 추가
                addMessage(response, 'bot');
                
                // 자동 스크롤
                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(error => {
                // 로딩 메시지 제거 및 오류 표시
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) loadingElement.remove();
                
                addMessage('죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.', 'bot');
                console.error('GPT 응답 오류:', error);
                
                // 자동 스크롤
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
    }
    
    // 메시지 추가 함수
    function addMessage(text, sender, saveToHistory = true) {
        const chatMessages = document.querySelector('.chatbot-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        // HTML 태그 지원 (보안상 주의 필요)
        messageElement.innerHTML = text;
        
        chatMessages.appendChild(messageElement);
        
        // 자동 스크롤
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 대화 기록 저장 (옵션)
        if (saveToHistory) {
            saveMessageToHistory(text, sender);
        }
    }
    
    // 대화 기록 저장 함수
    function saveMessageToHistory(text, sender) {
        const chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];
        chatHistory.push({
            text,
            sender,
            timestamp: new Date().toISOString()
        });
        // 최대 100개 메시지만 저장
        const trimmedHistory = chatHistory.slice(-100);
        localStorage.setItem('chat_history', JSON.stringify(trimmedHistory));
    }
    
    // GPT 응답 요청 함수
    async function fetchGPTResponse(userMessage) {
        const apiKey = getAPIKey();
        if (!apiKey) {
            throw new Error('API 키가 설정되지 않았습니다.');
        }
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: ChatbotPrompts.getCurrentPrompt() },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            return data.choices[0].message.content;
        } catch (error) {
            console.error('GPT API 오류:', error);
            throw error;
        }
    }
    
    // API 키 가져오기 함수
    function getAPIKey() {
        return localStorage.getItem('openai_api_key') || '';
    }
    
    // 초기화 시 저장된 대화 기록 불러오기 (옵션)
    function loadChatHistory() {
        const chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];
        if (chatHistory.length > 0) {
            // 최근 5개 메시지만 표시
            const recentMessages = chatHistory.slice(-5);
            const chatMessages = document.querySelector('.chatbot-messages');
            chatMessages.innerHTML = ''; // 기존 메시지 삭제
            
            recentMessages.forEach(msg => {
                addMessage(msg.text, msg.sender, false);
            });
        }
    }
    
    // 선택적으로 대화 기록 로드
    // loadChatHistory();

    // 모바일 메뉴 토글
    const menuButton = document.querySelector('.mobile-menu-button');
    const navMenu = document.querySelector('.nav-menu');

    menuButton.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    // 메뉴 외부 클릭시 닫기
    document.addEventListener('click', function(event) {
        if (!navMenu.contains(event.target) && !menuButton.contains(event.target)) {
            navMenu.classList.remove('active');
        }
    });
});