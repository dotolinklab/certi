document.addEventListener('DOMContentLoaded', function() {
    // 탭 전환 관련 요소
    const loginTabBtn = document.getElementById('loginTabBtn');
    const registerTabBtn = document.getElementById('registerTabBtn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // 로그인 폼 관련 요소
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminId = document.getElementById('adminId');
    const adminPassword = document.getElementById('adminPassword');
    const rememberMe = document.getElementById('rememberMe');
    const loginError = document.getElementById('loginError');
    
    // 회원가입 폼 관련 요소
    const adminRegisterForm = document.getElementById('adminRegisterForm');
    const newAdminId = document.getElementById('newAdminId');
    const newAdminPassword = document.getElementById('newAdminPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const adminName = document.getElementById('adminName');
    const adminEmail = document.getElementById('adminEmail');
    const adminKey = document.getElementById('adminKey');
    const registerError = document.getElementById('registerError');
    
    // 관리자 키 (실제 환경에서는 서버에서 관리해야 함)
    const ADMIN_MASTER_KEY = "admin123";
    
    // 로컬 스토리지에서 관리자 정보 가져오기
    let adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
    
    // 로그인 시도
    if (localStorage.getItem('rememberedAdmin')) {
        const savedAdmin = JSON.parse(localStorage.getItem('rememberedAdmin'));
        adminId.value = savedAdmin.id;
        rememberMe.checked = true;
    }
    
    // URL 해시 확인 (회원가입 탭으로 바로 이동)
    if (window.location.hash === '#register') {
        registerTabBtn.click();
    }
    
    // 탭 전환 기능
    loginTabBtn.addEventListener('click', function() {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        window.location.hash = '';
    });
    
    registerTabBtn.addEventListener('click', function() {
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        window.location.hash = 'register';
    });
    
    // 로그인 처리
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        loginError.textContent = '';
        
        const id = adminId.value.trim();
        const password = adminPassword.value;
        
        // 아이디 또는 비밀번호가 비어있는 경우
        if (!id || !password) {
            loginError.textContent = '아이디와 비밀번호를 모두 입력해주세요.';
            return;
        }
        
        // 사용자 정보 확인
        const user = adminUsers.find(user => user.id === id && user.password === password);
        
        if (user) {
            // 로그인 성공
            if (rememberMe.checked) {
                localStorage.setItem('rememberedAdmin', JSON.stringify({ id: id }));
            } else {
                localStorage.removeItem('rememberedAdmin');
            }
            
            // 현재 로그인 정보 저장 - 대시보드 시스템
            localStorage.setItem('currentAdmin', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }));
            
            // 블로그 시스템과의 호환성을 위한 저장
            localStorage.setItem('admin_token', 'true');
            localStorage.setItem('admin_name', user.name || user.id);
            localStorage.setItem('admin_role', user.role || 'admin');
            
            // 로그인 성공 메시지 표시 (선택적)
            loginError.textContent = '로그인 성공! 페이지 이동 중...';
            loginError.style.color = 'green';
            
            // 약간의 지연 후 리디렉션 (사용자에게 피드백 제공)
            setTimeout(function() {
                // 관리자 대시보드로 리디렉션
                window.location.href = 'admin-dashboard.html';
            }, 500);
        } else {
            // 로그인 실패
            loginError.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
            adminPassword.value = '';
        }
    });
    
    // 로그인 버튼 클릭 이벤트 (2중 보호)
    const loginButton = adminLoginForm.querySelector('button[type="submit"]');
    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            if (!adminLoginForm.checkValidity()) {
                return;
            }
            
            e.preventDefault();
            
            const event = new Event('submit', {
                bubbles: true,
                cancelable: true
            });
            
            adminLoginForm.dispatchEvent(event);
        });
    }
    
    // 회원가입 처리
    adminRegisterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        registerError.textContent = '';
        
        const id = newAdminId.value.trim();
        const password = newAdminPassword.value;
        const confirm = confirmPassword.value;
        const name = adminName.value.trim();
        const email = adminEmail.value.trim();
        const key = adminKey.value;
        
        // 유효성 검사
        if (!id || !password || !confirm || !name || !email || !key) {
            registerError.textContent = '모든 필드를 입력해주세요.';
            return;
        }
        
        if (password !== confirm) {
            registerError.textContent = '비밀번호가 일치하지 않습니다.';
            confirmPassword.value = '';
            return;
        }
        
        // 아이디 중복 확인
        if (adminUsers.some(user => user.id === id)) {
            registerError.textContent = '이미 사용 중인 아이디입니다.';
            return;
        }
        
        // 이메일 형식 확인
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            registerError.textContent = '유효한 이메일 주소를 입력해주세요.';
            return;
        }
        
        // 관리자 키 확인
        if (key !== ADMIN_MASTER_KEY) {
            registerError.textContent = '관리자 등록 키가 올바르지 않습니다.';
            adminKey.value = '';
            return;
        }
        
        // 새 사용자 등록
        const newUser = {
            id: id,
            password: password,
            name: name,
            email: email,
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        adminUsers.push(newUser);
        localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        
        // 폼 초기화
        adminRegisterForm.reset();
        
        // 로그인 탭으로 전환
        loginTabBtn.click();
    });
    
    // 초기 관리자 계정 생성 (최초 한 번만 실행)
    function createInitialAdmin() {
        if (adminUsers.length === 0) {
            const defaultAdmin = {
                id: 'admin',
                password: 'admin123',
                name: '기본 관리자',
                email: 'admin@example.com',
                role: 'admin',
                createdAt: new Date().toISOString()
            };
            adminUsers.push(defaultAdmin);
            localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
        }
    }
    
    // 초기 관리자 계정 생성 실행
    createInitialAdmin();
    
    // 세션 확인 (이미 로그인되어 있는지)
    function checkSession() {
        const currentAdmin = localStorage.getItem('currentAdmin');
        if (currentAdmin) {
            window.location.href = 'admin-dashboard.html';
        }
    }
    
    // 세션 확인 실행
    checkSession();

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
}); 