document.addEventListener('DOMContentLoaded', function() {
    // 세션 확인 - 로그인되어 있지 않으면 로그인 페이지로 리디렉션
    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (!currentAdmin) {
        window.location.href = 'admin-login.html';
        return;
    }

    // DOM 요소 참조
    const adminName = document.getElementById('adminName');
    const logoutBtn = document.getElementById('logoutBtn');
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const postsTableBody = document.getElementById('postsTableBody');
    const usersTableBody = document.getElementById('usersTableBody');
    const profileSettingsForm = document.getElementById('profileSettingsForm');
    const postCount = document.getElementById('postCount');
    const userCount = document.getElementById('userCount');
    const viewCount = document.getElementById('viewCount');
    const commentCount = document.getElementById('commentCount');
    const recentActivity = document.getElementById('recentActivity');
    const postSearch = document.getElementById('postSearch');
    const userSearch = document.getElementById('userSearch');
    const addUserBtn = document.getElementById('addUserBtn');
    const adminLogoutLink = document.getElementById('adminLogoutLink');
    const mobileAdminLogoutLink = document.getElementById('mobileAdminLogoutLink');

    // 햄버거 메뉴 관련 요소
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const navMenu = document.querySelector('.nav-menu');

    // 햄버거 메뉴 기능 구현
    if (mobileMenuButton) {
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
        if (mobileCloseBtn) {
            mobileCloseBtn.addEventListener('click', function() {
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
    }

    // 관리자 데이터 표시
    if (adminName) {
        adminName.textContent = currentAdmin.name || currentAdmin.id;
    }

    // 모바일 환경인지 확인
    const isMobile = window.innerWidth <= 768;

    // 탭 전환 기능
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item a');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-list .menu-item a');
    const tabs = document.querySelectorAll('.dashboard-tab');

    // 탭 변경 함수
    function changeTab(tabId) {
        // 모든 탭 비활성화
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // 모든 메뉴 비활성화
        menuItems.forEach(item => {
            item.parentElement.classList.remove('menu-active');
        });
        
        // 모바일 메뉴 아이템 비활성화
        mobileMenuItems.forEach(item => {
            item.parentElement.classList.remove('menu-active');
        });

        // 선택한 탭 활성화
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('active');

            // 선택한 메뉴 활성화
            const menuItem = document.querySelector(`[data-tab="${tabId}"]`);
            if (menuItem) {
                menuItem.parentElement.classList.add('menu-active');
            }
            
            // 선택한 모바일 메뉴 활성화
            const mobileMenuItem = document.querySelector(`.mobile-menu-list [data-tab="${tabId}"]`);
            if (mobileMenuItem) {
                mobileMenuItem.parentElement.classList.add('menu-active');
            }
        }
        
        // 모바일 메뉴 닫기
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            mobileMenuButton.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
        
        // 탭이 변경될 때 데이터 새로고침
        if (tabId === 'posts') {
            loadPostsData();
        } else if (tabId === 'users') {
            loadUsersData();
        } else if (tabId === 'settings') {
            loadProfileSettings();
        } else if (tabId === 'overview') {
            loadDashboardData();
        }
        
        // 스크롤을 맨 위로 이동
        window.scrollTo(0, 0);
    }

    // 메뉴 클릭 이벤트
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            changeTab(tabId);
        });
    });
    
    // 모바일 메뉴 클릭 이벤트
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            changeTab(tabId);
        });
    });

    // URL 매개변수 확인 (초기 탭 설정 이전에 확인)
    const urlParams = new URLSearchParams(window.location.search);
    const newPost = urlParams.get('newpost');
    const editPostId = urlParams.get('edit');

    // 초기 탭 설정
    if (newPost === 'true' || editPostId) {
        // 새 게시물 작성 또는 수정 모드인 경우 posts 탭으로 이동
        changeTab('posts');
        // 게시물 작성 폼 표시
        setTimeout(() => {
            showPostForm(editPostId);
        }, 500); // 시간을 늘려 탭 전환이 완료된 후 폼이 표시되도록 함
    } else {
        // 기본값은 overview 탭
        changeTab('overview');
    }

    // 로그아웃 버튼 이벤트
    logoutBtn.addEventListener('click', function() {
        handleLogout();
    });
    
    // 관리자 로그아웃 링크 이벤트
    if (adminLogoutLink) {
        adminLogoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // 모바일 관리자 로그아웃 링크 이벤트
    if (mobileAdminLogoutLink) {
        mobileAdminLogoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // 로그아웃 공통 처리 함수
    function handleLogout() {
        if (confirm('정말 로그아웃하시겠습니까?')) {
            localStorage.removeItem('currentAdmin');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_name');
            window.location.href = 'admin-login.html';
        }
    }

    // 데이터 로드 및 표시 함수
    function loadDashboardData() {
        // 로딩 애니메이션 효과
        showLoadingState([postCount, userCount, viewCount, commentCount]);
        
        // 로컬 스토리지에서 게시물 및 사용자 데이터 로드
        const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
        
        // 약간의 지연 후 데이터 표시 (로딩 효과를 위해)
        setTimeout(() => {
            // 통계 데이터 업데이트
            updateStats(posts, adminUsers);
            
            // 최근 활동 업데이트
            renderRecentActivity(posts);
        }, 300);
    }
    
    // 로딩 상태 표시 함수
    function showLoadingState(elements) {
        elements.forEach(element => {
            element.classList.add('loading');
            element.innerHTML = '<div class="shimmer"></div>';
        });
        
        if (recentActivity) {
            recentActivity.innerHTML = '<div class="shimmer-container"><div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div></div>';
        }
    }

    // 통계 업데이트
    function updateStats(posts, users) {
        // 카운터 애니메이션 효과로 숫자 증가
        animateCounter(postCount, posts.length);
        animateCounter(userCount, users.length);
        
        // 현재 기능 없음 - 향후 구현을 위한 데이터
        const totalViews = calculateTotalViews(posts);
        const totalComments = calculateTotalComments(posts);
        
        animateCounter(viewCount, totalViews);
        animateCounter(commentCount, totalComments);
    }
    
    // 조회수 계산 함수
    function calculateTotalViews(posts) {
        // 향후 실제 데이터로 변경 예정
        return posts.length > 0 ? posts.length * 5 + Math.floor(Math.random() * 50) : 0;
    }
    
    // 댓글 수 계산 함수
    function calculateTotalComments(posts) {
        // 향후 실제 데이터로 변경 예정
        return posts.length > 0 ? Math.floor(posts.length * 2 + Math.random() * 10) : 0;
    }
    
    // 숫자 증가 애니메이션 함수
    function animateCounter(element, targetNumber) {
        if (!element) return;
        
        element.classList.remove('loading');
        
        const duration = 1000; // 애니메이션 지속 시간 (밀리초)
        const frameDuration = 1000/60; // 60fps
        const frames = duration / frameDuration;
        const startNumber = 0;
        const increment = (targetNumber - startNumber) / frames;
        
        let currentNumber = startNumber;
        let frame = 0;
        
        const counter = setInterval(() => {
            currentNumber += increment;
            frame++;
            
            element.textContent = Math.floor(currentNumber);
            
            if (frame >= frames) {
                clearInterval(counter);
                element.textContent = targetNumber;
            }
        }, frameDuration);
    }

    // 게시물 목록 렌더링
    function renderPosts(posts) {
        postsTableBody.innerHTML = '';
        
        if (!posts || posts.length === 0) {
            // 게시물이 없을 때 메시지 표시
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="empty-table">등록된 게시물이 없습니다.</td>`;
            postsTableBody.appendChild(emptyRow);
            return;
        }
        
        // 게시물 목록 렌더링
        posts.forEach((post, index) => {
            const row = document.createElement('tr');
            
            // 간단한 ID 생성 (실제 ID는 내부적으로 유지)
            const shortId = post.id.substring(post.id.length - 6);
            
            // 날짜 형식화
            const date = formatDate(post.date);
            
            // 실제 조회 수 데이터가 없다면 임시로 랜덤 수 표시
            const views = post.views || Math.floor(Math.random() * 100) + 1;
            
            row.innerHTML = `
                <td>${shortId}</td>
                <td class="post-title-cell" title="${post.title}">
                    <a href="blog-detail.html?id=${post.id}" target="_blank" class="post-title-link">${post.title}</a>
                </td>
                <td>${date}</td>
                <td>${views}</td>
                <td class="actions-cell">
                    <button class="btn-icon edit-btn" data-id="${post.id}" title="게시물 수정">
                        <i class="fas fa-pen-fancy"></i>
                    </button>
                    <button class="btn-icon delete-btn" data-id="${post.id}" title="게시물 삭제">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            postsTableBody.appendChild(row);
        });
        
        // 수정 버튼 이벤트 리스너
        const editButtons = postsTableBody.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                // URL 매개변수를 변경하여 수정 모드 활성화
                history.pushState({}, '', `admin-dashboard.html?edit=${postId}`);
                showPostForm(postId);
            });
        });
        
        // 삭제 버튼 이벤트 리스너
        const deleteButtons = postsTableBody.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const postId = this.getAttribute('data-id');
                if (confirm('이 게시물을 정말 삭제하시겠습니까?')) {
                    deletePost(postId);
                }
            });
        });
    }

    // 게시물 검색 기능
    if (postSearch) {
        postSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
            
            if (searchTerm.length > 0) {
                const filteredPosts = posts.filter(post => 
                    post.title.toLowerCase().includes(searchTerm) || 
                    post.content.toLowerCase().includes(searchTerm)
                );
                renderPosts(filteredPosts);
            } else {
                renderPosts(posts);
            }
        });
    }

    // 게시물 삭제 함수
    function deletePost(postId) {
        let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        posts = posts.filter(post => post.id !== postId);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // 데이터 다시 로드
        loadDashboardData();
        loadPostsData();
        
        // 성공 메시지 표시
        showNotification('게시물이 성공적으로 삭제되었습니다.', 'success');
    }
    
    // 알림 메시지 표시 함수
    function showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // 알림 닫기 버튼
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // 문서에 알림 추가
        document.body.appendChild(notification);
        
        // 3초 후 자동으로 알림 닫기
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // 최근 활동 렌더링
    function renderRecentActivity(posts) {
        if (!recentActivity) return;
        
        recentActivity.innerHTML = '';
        
        // 최근 활동 데이터가 없을 경우
        if (posts.length === 0) {
            recentActivity.innerHTML = '<p class="no-activity">아직 활동 내역이 없습니다.</p>';
            return;
        }
        
        // 최근 5개의 게시물만 표시
        const recentPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        recentPosts.forEach(post => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="activity-content">
                    <p><a href="blog-detail.html?id=${post.id}" target="_blank" class="post-title-link">${post.title}</a></p>
                    <span class="activity-time">${formatDate(post.date)}</span>
                </div>
            `;
            
            recentActivity.appendChild(activityItem);
        });
    }

    // 날짜 포맷 함수
    function formatDate(dateString) {
        // 입력이 없거나 유효하지 않은 경우
        if (!dateString) return '날짜 없음';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '날짜 없음';
        
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60); // 분 단위 차이
        
        if (diff < 1) return '방금 전';
        if (diff < 60) return `${diff}분 전`;
        
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours}시간 전`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}일 전`;
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ko-KR', options);
    }
    
    // 게시물 데이터 로드
    function loadPostsData() {
        const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        renderPosts(posts);
        
        // 게시물 검색 기능
        if (postSearch) {
            postSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                if (searchTerm.length > 0) {
                    const filteredPosts = posts.filter(post => 
                        post.title.toLowerCase().includes(searchTerm) || 
                        post.content.toLowerCase().includes(searchTerm)
                    );
                    renderPosts(filteredPosts);
                } else {
                    renderPosts(posts);
                }
            });
        }
    }
    
    // 사용자 데이터 로드
    function loadUsersData() {
        const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
        renderUsers(users);
    }
    
    // 사용자 목록 렌더링
    function renderUsers(users) {
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        if (users.length === 0) {
            const noUsersRow = document.createElement('tr');
            noUsersRow.innerHTML = `<td colspan="6" class="no-data">등록된 사용자가 없습니다.</td>`;
            usersTableBody.appendChild(noUsersRow);
            return;
        }
        
        // 현재 로그인한 관리자는 삭제할 수 없음
        const currentAdminId = currentAdmin.id;
        
        users.forEach((user, index) => {
            const row = document.createElement('tr');
            
            // 역할 뱃지 클래스 설정
            let roleClass = '';
            switch(user.role) {
                case '관리자':
                    roleClass = 'admin';
                    break;
                default:
                    roleClass = 'editor';
            }
            
            // 가입일 형식화
            const createdDate = user.created ? formatDate(user.created) : '정보 없음';
            
            // 모든 사용자의 역할은 '관리자'로 표시
            const userRole = '관리자';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name || '이름 없음'}</td>
                <td>${user.id}</td>
                <td><span class="role-badge ${roleClass}">${userRole}</span></td>
                <td>${createdDate}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" data-id="${user.id}" title="수정"><i class="fas fa-pen-fancy"></i></button>
                        <button class="btn-delete ${user.id === currentAdminId ? 'disabled' : ''}"
                            data-id="${user.id}" title="삭제" ${user.id === currentAdminId ? 'disabled' : ''}>
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // 사용자 편집 이벤트
            const editBtn = row.querySelector('.btn-edit');
            editBtn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                editUser(userId);
            });
            
            // 사용자 삭제 이벤트 (현재 로그인한 관리자는 삭제 불가)
            const deleteBtn = row.querySelector('.btn-delete:not(.disabled)');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    const userId = this.getAttribute('data-id');
                    if (confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
                        deleteUser(userId);
                    }
                });
            }
            
            usersTableBody.appendChild(row);
        });
    }
    
    // 사용자 검색 기능
    if (userSearch) {
        userSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const users = JSON.parse(localStorage.getItem('adminUsers')) || [];
            
            const filteredUsers = users.filter(user => {
                return (user.name && user.name.toLowerCase().includes(searchTerm)) || 
                       user.id.toLowerCase().includes(searchTerm) ||
                       (user.role && user.role.toLowerCase().includes(searchTerm));
            });
            
            renderUsers(filteredUsers);
        });
    }
    
    // 사용자 삭제 함수
    function deleteUser(userId) {
        // 현재 로그인한 관리자는 삭제할 수 없음
        if (userId === currentAdmin.id) {
            showNotification('본인 계정은 삭제할 수 없습니다.', 'error');
            return;
        }
        
        let users = JSON.parse(localStorage.getItem('adminUsers')) || [];
        users = users.filter(user => user.id !== userId);
        localStorage.setItem('adminUsers', JSON.stringify(users));
        
        // 데이터 다시 로드
        loadDashboardData();
        loadUsersData();
        
        // 성공 메시지 표시
        showNotification('사용자가 성공적으로 삭제되었습니다.', 'success');
    }
    
    // 사용자 편집 함수
    function editUser(userId) {
        // 향후 구현
        alert('사용자 편집 기능은 아직 개발 중입니다.');
    }
    
    // 새 관리자 추가 버튼 이벤트
    if (addUserBtn) {
        addUserBtn.addEventListener('click', function() {
            // 향후 구현
            alert('관리자 추가 기능은 아직 개발 중입니다.');
        });
    }
    
    // 프로필 설정 로드
    function loadProfileSettings() {
        if (!profileSettingsForm) return;
        
        const settingName = document.getElementById('settingName');
        const settingEmail = document.getElementById('settingEmail');
        
        if (settingName) settingName.value = currentAdmin.name || '';
        if (settingEmail) settingEmail.value = currentAdmin.email || '';
        
        // 프로필 설정 제출 이벤트
        profileSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfileSettings();
        });
    }
    
    // 프로필 설정 업데이트
    function updateProfileSettings() {
        const settingName = document.getElementById('settingName');
        const settingEmail = document.getElementById('settingEmail');
        const currentPassword = document.getElementById('currentPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmNewPassword = document.getElementById('confirmNewPassword');
        const profileError = document.getElementById('profileError');
        
        // 기본 유효성 검사
        if (!settingName.value.trim()) {
            showError(profileError, '이름을 입력해주세요.');
            return;
        }
        
        if (!settingEmail.value.trim()) {
            showError(profileError, '이메일을 입력해주세요.');
            return;
        }
        
        // 비밀번호 변경 시 검증
        if (newPassword.value || confirmNewPassword.value) {
            if (!currentPassword.value) {
                showError(profileError, '현재 비밀번호를 입력해주세요.');
                return;
            }
            
            // 현재 비밀번호 확인
            if (currentPassword.value !== currentAdmin.password) {
                showError(profileError, '현재 비밀번호가 일치하지 않습니다.');
                return;
            }
            
            if (newPassword.value !== confirmNewPassword.value) {
                showError(profileError, '새 비밀번호가 일치하지 않습니다.');
                return;
            }
            
            if (newPassword.value.length < 6) {
                showError(profileError, '비밀번호는 최소 6자 이상이어야 합니다.');
                return;
            }
        }
        
        // 관리자 정보 업데이트
        const updatedAdmin = {
            ...currentAdmin,
            name: settingName.value.trim(),
            email: settingEmail.value.trim()
        };
        
        // 비밀번호 변경 시
        if (newPassword.value) {
            updatedAdmin.password = newPassword.value;
        }
        
        // 로컬 스토리지 업데이트
        localStorage.setItem('currentAdmin', JSON.stringify(updatedAdmin));
        
        // 관리자 목록 업데이트
        const adminUsers = JSON.parse(localStorage.getItem('adminUsers')) || [];
        const updatedUsers = adminUsers.map(user => {
            if (user.id === updatedAdmin.id) {
                return {
                    ...user,
                    name: updatedAdmin.name,
                    email: updatedAdmin.email,
                    password: updatedAdmin.password
                };
            }
            return user;
        });
        
        localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
        
        // 성공 메시지 표시
        showNotification('프로필 정보가 성공적으로 업데이트되었습니다.', 'success');
        
        // 비밀번호 입력 필드 초기화
        currentPassword.value = '';
        newPassword.value = '';
        confirmNewPassword.value = '';
        profileError.textContent = '';
    }
    
    // 오류 메시지 표시
    function showError(element, message) {
        if (!element) return;
        
        element.textContent = message;
        
        // 애니메이션 효과 추가
        element.style.animation = 'none';
        void element.offsetWidth; // 리플로우 강제
        element.style.animation = 'shake 0.5s ease-in-out';
    }
    
    // 초기 데이터 로드
    loadDashboardData();
    
    // 창 크기가 변경될 때 모바일 여부 확인 및 UI 업데이트
    window.addEventListener('resize', function() {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile !== isMobile) {
            // 모바일 상태가 변경되면 페이지 새로고침
            window.location.reload();
        }
    });
    
    // 댓글 및 사용자 활동을 위한 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            max-width: 350px;
            animation: slideIn 0.3s ease forwards;
            transform: translateX(100%);
        }
        
        @keyframes slideIn {
            to { transform: translateX(0); }
        }
        
        .notification-hide {
            animation: slideOut 0.3s ease forwards;
        }
        
        @keyframes slideOut {
            to { transform: translateX(calc(100% + 20px)); }
        }
        
        .notification.success {
            border-left: 4px solid #1cc88a;
        }
        
        .notification.error {
            border-left: 4px solid #e74a3b;
        }
        
        .notification.info {
            border-left: 4px solid #4e73df;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i {
            font-size: 20px;
        }
        
        .notification.success i {
            color: #1cc88a;
        }
        
        .notification.error i {
            color: #e74a3b;
        }
        
        .notification.info i {
            color: #4e73df;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #939eaf;
            cursor: pointer;
            padding: 5px;
        }
        
        .notification-close:hover {
            color: #2e384d;
        }
        
        .loading {
            position: relative;
            min-height: 28px;
            overflow: hidden;
        }
        
        .shimmer {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 4px;
        }
        
        .shimmer-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 20px 0;
        }
        
        .shimmer-container .shimmer {
            height: 40px;
        }
        
        @keyframes shimmer {
            0% { background-position: -100% 0; }
            100% { background-position: 100% 0; }
        }
        
        .btn-delete.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
    
    document.head.appendChild(style);

    // 게시물 작성 폼 표시 함수
    function showPostForm(postId = null) {
        // 기존 게시물 목록 숨기기
        const postsTableContainer = document.querySelector('#posts .table-container');
        const searchFilter = document.querySelector('#posts .search-filter');
        
        if (postsTableContainer) {
            postsTableContainer.style.display = 'none';
        }
        
        if (searchFilter) {
            searchFilter.style.display = 'none';
        }
        
        // 이미 폼이 있는지 확인
        let postFormContainer = document.querySelector('.post-form-container');
        
        if (!postFormContainer) {
            // 폼 컨테이너 생성
            postFormContainer = document.createElement('div');
            postFormContainer.className = 'post-form-container';
            
            // 폼 HTML 생성
            postFormContainer.innerHTML = `
                <h3>${postId ? '게시물 수정' : '새 게시물 작성'}</h3>
                <form id="postForm" class="dashboard-form">
                    <input type="hidden" id="postId" value="${postId || ''}">
                    
                    <div class="form-group">
                        <label for="postTitle">제목</label>
                        <input type="text" id="postTitle" placeholder="게시물 제목을 입력하세요" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="postContent">내용</label>
                        <div class="editor-mode-selector">
                            <button type="button" id="plainTextBtn" class="editor-mode-btn active">일반 텍스트</button>
                            <button type="button" id="htmlEditorBtn" class="editor-mode-btn">HTML 에디터</button>
                        </div>
                        <textarea id="postContent" rows="10" placeholder="게시물 내용을 입력하세요" required></textarea>
                        
                        <div id="htmlPreview" class="html-preview" style="display: none;">
                            <h4>HTML 미리보기</h4>
                            <div id="previewContent" class="preview-content"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="postImage">이미지</label>
                        <input type="file" id="postImage" accept="image/*">
                        <div id="imagePreview" class="image-preview"></div>
                    </div>
                    
                    <div class="form-buttons">
                        <button type="button" id="cancelBtn" class="btn-secondary">취소</button>
                        <button type="submit" id="submitBtn" class="btn-primary">
                            ${postId ? '게시물 수정' : '게시물 등록'}
                        </button>
                    </div>
                </form>
            `;
            
            // 폼을 posts 탭에 추가
            document.getElementById('posts').appendChild(postFormContainer);
            
            // 폼 이벤트 리스너 설정
            setupPostFormEvents(postId);
        }
        
        // 게시물 수정인 경우 기존 데이터 로드
        if (postId) {
            loadPostData(postId);
        }
    }

    // 게시물 폼 이벤트 설정
    function setupPostFormEvents(postId) {
        const postForm = document.getElementById('postForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const plainTextBtn = document.getElementById('plainTextBtn');
        const htmlEditorBtn = document.getElementById('htmlEditorBtn');
        const postContent = document.getElementById('postContent');
        const htmlPreview = document.getElementById('htmlPreview');
        const previewContent = document.getElementById('previewContent');
        const postImage = document.getElementById('postImage');
        const imagePreview = document.getElementById('imagePreview');
        
        // 현재 에디터 모드
        let editorMode = 'plain';
        
        // 취소 버튼 이벤트
        cancelBtn.addEventListener('click', function() {
            // 폼 제거하고 목록으로 돌아가기
            resetPostsView();
        });
        
        // 에디터 모드 전환 버튼
        plainTextBtn.addEventListener('click', function() {
            switchEditorMode('plain');
        });
        
        htmlEditorBtn.addEventListener('click', function() {
            switchEditorMode('html');
        });
        
        // 내용 변경 시 HTML 미리보기 업데이트
        postContent.addEventListener('input', function() {
            if (editorMode === 'html') {
                updateHtmlPreview();
            }
        });
        
        // 이미지 미리보기
        postImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="미리보기" style="max-width: 200px; max-height: 200px;">`;
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
            }
        });
        
        // 폼 제출 이벤트
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const postIdValue = document.getElementById('postId').value;
            const imageFile = document.getElementById('postImage').files[0];
            
            if (!title || !content) {
                alert('제목과 내용을 모두 입력해주세요.');
                return;
            }
            
            // 이미지 처리
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    savePost(title, content, e.target.result, postIdValue, editorMode);
                };
                reader.readAsDataURL(imageFile);
            } else {
                // 기존 이미지 유지 또는 기본 이미지 사용
                const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
                let existingImage = 'images/default-post-image.jpg';
                
                // 수정 모드인 경우 기존 이미지 사용
                if (postIdValue) {
                    const existingPost = posts.find(post => post.id === postIdValue);
                    if (existingPost && existingPost.image) {
                        existingImage = existingPost.image;
                    }
                }
                
                savePost(title, content, existingImage, postIdValue, editorMode);
            }
        });
        
        // 에디터 모드 전환 함수
        function switchEditorMode(mode) {
            editorMode = mode;
            
            if (mode === 'plain') {
                plainTextBtn.classList.add('active');
                htmlEditorBtn.classList.remove('active');
                htmlPreview.style.display = 'none';
            } else {
                plainTextBtn.classList.remove('active');
                htmlEditorBtn.classList.add('active');
                htmlPreview.style.display = 'block';
                updateHtmlPreview();
            }
        }
        
        // HTML 미리보기 업데이트
        function updateHtmlPreview() {
            try {
                previewContent.innerHTML = postContent.value || '<p>HTML 미리보기가 여기에 표시됩니다.</p>';
            } catch (error) {
                console.error('HTML 미리보기 오류:', error);
                previewContent.innerHTML = '<p style="color: red;">HTML 오류가 발생했습니다. 코드를 확인해주세요.</p>';
            }
        }
    }
    
    // 게시물 데이터 로드 (수정 시)
    function loadPostData(postId) {
        const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            document.getElementById('postTitle').value = post.title || '';
            document.getElementById('postContent').value = post.content || '';
            
            // 이미지 미리보기 설정
            if (post.image) {
                document.getElementById('imagePreview').innerHTML = 
                    `<img src="${post.image}" alt="미리보기" style="max-width: 200px; max-height: 200px;">`;
            }
            
            // HTML 모드였다면 해당 모드로 전환
            if (post.isHtml) {
                document.getElementById('htmlEditorBtn').click();
            }
        }
    }
    
    // 게시물 저장 함수
    function savePost(title, content, imageSrc, postId, editorMode) {
        const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
        const currentDate = new Date().toLocaleString('ko-KR');
        
        if (postId) {
            // 게시물 수정
            const index = posts.findIndex(post => post.id === postId);
            if (index !== -1) {
                posts[index] = {
                    ...posts[index],
                    title,
                    content,
                    date: currentDate,
                    image: imageSrc,
                    isHtml: editorMode === 'html'
                };
            }
        } else {
            // 새 게시물 추가
            const newPost = {
                id: Date.now().toString(),
                title,
                content,
                date: currentDate,
                image: imageSrc,
                isHtml: editorMode === 'html'
            };
            
            posts.unshift(newPost);
        }
        
        // 로컬 스토리지에 저장
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // 알림 표시
        showNotification(postId ? '게시물이 성공적으로 수정되었습니다.' : '새 게시물이 등록되었습니다.', 'success');
        
        // 게시물 목록으로 돌아가기
        resetPostsView();
        
        // 게시물 목록 다시 로드
        loadPostsData();
    }
    
    // 게시물 목록 보기로 초기화
    function resetPostsView() {
        // 폼 제거
        const postFormContainer = document.querySelector('.post-form-container');
        if (postFormContainer) {
            postFormContainer.remove();
        }
        
        // 테이블과 검색 필터 다시 표시
        const postsTableContainer = document.querySelector('#posts .table-container');
        const searchFilter = document.querySelector('#posts .search-filter');
        
        if (postsTableContainer) {
            postsTableContainer.style.display = 'block';
        }
        
        if (searchFilter) {
            searchFilter.style.display = 'flex';
        }
        
        // URL 매개변수 제거
        history.pushState({}, '', 'admin-dashboard.html');
    }

    // 새 게시물 작성 링크 클릭 이벤트 추가
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a[href="admin-dashboard.html?newpost=true"]');
        if (target) {
            e.preventDefault();
            changeTab('posts');
            setTimeout(() => {
                showPostForm(null);
            }, 500); // 충분한 시간을 주어 탭 전환이 완료된 후 폼이 표시되도록 함
            history.pushState({}, '', `admin-dashboard.html?newpost=true`);
        }
    }, false);
}); 