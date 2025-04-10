// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 햄버거 메뉴 기능 구현
    const menuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-close-btn');
    
    if (menuButton && mobileMenu && overlay) {
        menuButton.addEventListener('click', function() {
            menuButton.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        
        // 오버레이 클릭 시 메뉴 닫기
        overlay.addEventListener('click', function() {
            closeMenu();
        });
        
        // 닫기 버튼 클릭 시 메뉴 닫기
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeMenu();
            });
        }
        
        // 모바일 메뉴 내 링크 클릭 시 메뉴 닫기
        const mobileMenuLinks = document.querySelectorAll('.mobile-menu-list a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });
        
        // 메뉴 닫기 함수
        function closeMenu() {
            menuButton.classList.remove('active');
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
        
        // 관리자 로그인 상태 확인 및 메뉴 변경
        const adminLoginStatus = localStorage.getItem('adminLoggedIn');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        const mobileAdminBtn = document.getElementById('mobileAdminBtn');
        
        if (adminLoginStatus === 'true' && mobileLogoutBtn && mobileAdminBtn) {
            mobileLogoutBtn.style.display = 'block';
            mobileAdminBtn.textContent = '관리자 대시보드';
        }
        
        // 모바일 로그아웃 기능
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('adminLoggedIn');
                alert('로그아웃되었습니다.');
                location.reload();
            });
        }
    }
    
    // 관리자 로그인 상태에 따른 메인 메뉴 변경
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        const adminLoginStatus = localStorage.getItem('adminLoggedIn');
        if (adminLoginStatus === 'true') {
            adminLoginBtn.textContent = '관리자 대시보드';
        }
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
});