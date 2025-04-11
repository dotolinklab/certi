/**
 * 챗봇 프롬프트 관리 파일
 * 
 * 이 파일은 챗봇의 응답 생성에 사용되는 프롬프트를 관리합니다.
 * 원하는 프롬프트로 수정하여 챗봇의 응답 스타일과 내용을 커스터마이징할 수 있습니다.
 */

// 기본 시스템 프롬프트
const DEFAULT_SYSTEM_PROMPT = `당신은 자격증 취득과 학위 취득에 관한 정보를 제공하는 도우미입니다. 친절하고 정확한 정보를 제공하세요.`;

// 상담톡 연결 프롬프트
const CHANNEL_TALK_PROMPT = `당신은 자격증 취득과 학위 취득에 관한 간략한 정보를 제공하는 도우미입니다. 
모든 질문에 대해 최대 20자 이내로 짧게 답변한 후, 
"더 자세한 상담을 원하시면 상담톡으로 연결해 드리겠습니다. 👉 <a href='https://2vly7.channel.io' target='_blank'>상담톡 바로가기</a>"
라는 문구를 반드시 포함해서 답변해주세요.`;

// 특정 주제별 프롬프트
const PROMPT_TEMPLATES = {
    // 채널톡 연결 프롬프트
    channelTalk: CHANNEL_TALK_PROMPT,
    
    // 사회복지사 관련 프롬프트
    socialWorker: `당신은 사회복지사 자격증 취득에 관한 전문가입니다. 
    사회복지사 1급과 2급 자격증의 취득 과정, 필요한 과목, 시험 준비 방법 등에 대해 
    상세하고 정확한 정보를 제공해주세요. 현행 법규와 최신 정보에 기반하여 답변하세요.`,
    
    // 보육교사 관련 프롬프트
    childCareTeacher: `당신은 보육교사 자격증 취득에 관한 전문가입니다.
    보육교사 자격증의 취득 방법, 필요한 학점과 과목, 실습 요건, 취업 정보 등에 대해
    구체적이고 도움이 되는 정보를 제공해주세요. 최신 보육교사 자격 기준에 맞추어 답변하세요.`,
    
    // 평생교육사 관련 프롬프트
    lifelongEducator: `당신은 평생교육사 자격증 취득에 관한 전문가입니다.
    평생교육사 자격증의 등급별 취득 방법, 필수 이수 과목, 실습 요건, 취업 분야 등에 대해
    명확하고 실용적인 정보를 제공해주세요. 평생교육법의 최신 개정 내용을 반영하여 답변하세요.`,
    
    // 독학사 관련 프롬프트
    selfEducation: `당신은 독학사 학위 취득에 관한 전문가입니다.
    독학사 학위의 단계별 시험 과정, 응시 자격, 준비 방법, 학점 은행제와의 차이점 등을
    체계적이고 이해하기 쉽게 설명해주세요. 실제 취득 사례와 팁을 포함하여 답변하세요.`,
    
    // 일반적인 자격증 정보 프롬프트
    generalCertificate: `당신은 각종 자격증과 학위 취득에 관한 종합 안내자입니다.
    자격증 취득의 일반적인 절차, 준비 방법, 활용 방안 등에 대해 
    실용적이고 객관적인 정보를 제공해주세요. 자격증의 가치와 취업에 미치는 영향도 함께 설명해주세요.`
};

// 현재 활성화된 프롬프트 (기본값으로 초기화)
let currentPrompt = DEFAULT_SYSTEM_PROMPT;

// 프롬프트 변경 함수
function setPrompt(promptKey) {
    if (promptKey in PROMPT_TEMPLATES) {
        currentPrompt = PROMPT_TEMPLATES[promptKey];
        return true;
    } else if (promptKey === 'default') {
        currentPrompt = DEFAULT_SYSTEM_PROMPT;
        return true;
    }
    return false;
}

// 현재 프롬프트 반환 함수
function getCurrentPrompt() {
    return currentPrompt;
}

// 사용자 정의 프롬프트 설정 함수
function setCustomPrompt(customPrompt) {
    if (customPrompt && customPrompt.trim().length > 0) {
        currentPrompt = customPrompt.trim();
        // 로컬 스토리지에 저장 (선택적)
        localStorage.setItem('custom_prompt', currentPrompt);
        return true;
    }
    return false;
}

// 저장된 사용자 정의 프롬프트 불러오기
function loadSavedPrompt() {
    const savedPrompt = localStorage.getItem('custom_prompt');
    if (savedPrompt) {
        currentPrompt = savedPrompt;
        return true;
    }
    return false;
}

// 사용 가능한 모든 프롬프트 키 반환
function getAvailablePromptKeys() {
    return Object.keys(PROMPT_TEMPLATES).concat(['default']);
}

// 프롬프트 객체 내보내기
window.ChatbotPrompts = {
    DEFAULT_SYSTEM_PROMPT,
    CHANNEL_TALK_PROMPT,
    PROMPT_TEMPLATES,
    setPrompt,
    getCurrentPrompt,
    setCustomPrompt,
    loadSavedPrompt,
    getAvailablePromptKeys
}; 