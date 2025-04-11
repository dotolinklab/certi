// DOM이 완전히 로드된 후 실행
// v1.6 - PC에서도 작동하는 햄버거 메뉴 추가
document.addEventListener('DOMContentLoaded', function() {
    // 햄버거 메뉴 기능 구현
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-close-btn');
    
    // 모바일 메뉴 기능
    if (mobileMenuButton) {
        // 햄버거 버튼 클릭 이벤트
        mobileMenuButton.addEventListener('click', function() {
            this.classList.toggle('active');
            
            // 모바일 환경에서는 모바일 메뉴를, PC 환경에서는 nav-menu를 토글
            if (window.innerWidth <= 768) {
                mobileMenu.classList.toggle('active');
                mobileMenuOverlay.classList.toggle('active');
            } else {
                navMenu.classList.toggle('active');
            }
            
            document.body.classList.toggle('menu-open');
        });
        
        // 모바일 메뉴 닫기 버튼
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                mobileMenuButton.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }
        
        // 모바일 메뉴 오버레이 클릭
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                mobileMenuButton.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }
        
        // 창 크기가 변경될 때 메뉴 상태 리셋
        window.addEventListener('resize', function() {
            // 창 크기에 따라 적절한 메뉴 닫기
            if (window.innerWidth > 768) {
                mobileMenu.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
            } else {
                navMenu.classList.remove('active');
            }
            
            mobileMenuButton.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
        
        // PC 환경에서 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', function(e) {
            if (window.innerWidth > 768) {
                if (navMenu.classList.contains('active') && 
                    !navMenu.contains(e.target) && 
                    !mobileMenuButton.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileMenuButton.classList.remove('active');
                }
            }
        });
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
});