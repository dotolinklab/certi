// 전역 변수
let currentUser = null;
let postData = null;
const postId = new URLSearchParams(window.location.search).get('id');

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 현재 URL에서 게시물 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    // 현재 사용자 정보 가져오기
    fetchCurrentUser();

    // 게시물 ID가 있으면 데이터 가져오기
    if (postId) {
        fetchPostData(postId);
    } else {
        showError('게시물을 찾을 수 없습니다.');
    }

    // 로그아웃 이벤트 리스너 추가
    document.getElementById('adminLogoutLink').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });

    // 삭제 모달 이벤트 리스너 설정
    setupDeleteModal();
});

// 현재 사용자 정보 가져오기
function fetchCurrentUser() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLogoutLink = document.getElementById('adminLogoutLink');
    const adminOnlyElements = document.querySelectorAll('.admin-only');

    if (userData && userData.role === 'admin') {
        // 관리자 로그인 상태
        adminLoginBtn.style.display = 'none';
        
        // 관리자 전용 요소 표시
        adminOnlyElements.forEach(el => {
            el.style.display = 'block';
        });
    } else {
        // 비로그인 또는 일반 사용자
        adminLoginBtn.style.display = 'block';
        
        // 관리자 전용 요소 숨김
        adminOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}

// 로그아웃 처리
function logoutUser() {
    localStorage.removeItem('currentUser');
    showNotification('로그아웃 되었습니다.');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// 게시물 데이터 가져오기
function fetchPostData(postId) {
    // 로컬 스토리지에서 게시물 데이터 가져오기
    const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const post = posts.find(p => p.id === postId || p.id === parseInt(postId));
    
    if (post) {
        // 날짜가 없거나 잘못된 경우 현재 날짜 설정
        if (!post.date || post.date === 'Invalid Date' || isNaN(new Date(post.date).getTime())) {
            post.date = new Date().toISOString();
            // 수정된 날짜를 저장
            localStorage.setItem('blogPosts', JSON.stringify(posts));
        }
        renderPostDetail(post);
    } else {
        showError('게시물을 찾을 수 없습니다.');
    }
}

// 게시물 상세 정보 렌더링
function renderPostDetail(post) {
    const container = document.getElementById('blog-detail-container');
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    const isAdmin = userData && userData.role === 'admin';
    
    // 날짜 형식 변환
    let formattedDate;
    try {
        // 날짜 문자열이 유효한지 확인
        const dateObj = new Date(post.date);
        if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            // 유효하지 않은 경우 현재 날짜 사용
            formattedDate = new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    } catch (e) {
        // 날짜 변환 실패 시 현재 날짜 사용
        formattedDate = new Date().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // HTML 구성
    let html = `
        <div class="post-back-button">
            <button class="btn-back" onclick="window.location.href='blog.html'">
                <i class="fas fa-arrow-left"></i> 목록으로 돌아가기
            </button>
        </div>
        <div class="blog-post-detail">
            <div class="post-detail-header">
                <div class="post-detail-info">
                    <h1 class="post-detail-title">${post.title}</h1>
                    <p class="post-detail-date">${formattedDate}</p>
                </div>
                ${isAdmin ? `
                <div class="post-detail-actions">
                    <button class="btn-edit" id="editPostBtn" data-id="${post.id}">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="btn-cancel" id="deletePostBtn" data-id="${post.id}">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
                ` : ''}
            </div>
            
            ${post.image ? `
            <div class="post-detail-image">
                <img src="${post.image}" alt="${post.title}">
            </div>
            ` : ''}
            
            <div class="post-detail-content-text">
                ${post.isHtml ? post.content : `<p>${post.content}</p>`}
            </div>
            
            <div class="post-actions">
                <button class="btn-back" onclick="window.location.href='blog.html'">
                    <i class="fas fa-arrow-left"></i> 목록으로 돌아가기
                </button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // 관리자인 경우 이벤트 리스너 추가
    if (isAdmin) {
        // 수정 버튼 이벤트
        document.getElementById('editPostBtn').addEventListener('click', function() {
            const postId = this.getAttribute('data-id');
            // URL에 파라미터를 확실하게 넘기기 위해 문자열로 변환
            window.location.href = `admin-dashboard.html?edit=${postId}`;
        });
        
        // 삭제 버튼 이벤트
        document.getElementById('deletePostBtn').addEventListener('click', function() {
            const postId = this.getAttribute('data-id');
            showDeleteModal(postId);
        });
    }
}

// 삭제 모달 설정
function setupDeleteModal() {
    const modal = document.getElementById('deleteModal');
    
    // 모달 닫기 이벤트
    document.getElementById('cancelDelete').addEventListener('click', function() {
        hideDeleteModal();
    });
    
    // 외부 클릭 시 모달 닫기
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideDeleteModal();
        }
    });
}

// 삭제 모달 표시
function showDeleteModal(postId) {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    
    // 삭제 확인 버튼 이벤트
    document.getElementById('confirmDelete').onclick = function() {
        deletePost(postId);
        hideDeleteModal();
    };
}

// 삭제 모달 숨기기
function hideDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// 게시물 삭제
function deletePost(postId) {
    // 로컬 스토리지에서 게시물 가져오기
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    // 해당 ID의 게시물 찾기
    const index = posts.findIndex(p => p.id === postId || p.id === parseInt(postId));
    
    if (index !== -1) {
        // 게시물 삭제
        posts.splice(index, 1);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        showNotification('게시물이 삭제되었습니다.');
        
        // 블로그 목록 페이지로 리디렉션
        setTimeout(() => {
            window.location.href = 'blog.html';
        }, 1000);
    }
}

// 에러 메시지 표시
function showError(message) {
    const container = document.getElementById('blog-detail-container');
    container.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <a href="blog.html" class="btn btn-primary">블로그 목록으로 돌아가기</a>
        </div>
    `;
}

// 알림 메시지 표시
function showNotification(message) {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<p>${message}</p>`;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동으로 사라지게 함
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
} 