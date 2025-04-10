document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소 참조
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLogoutLink = document.getElementById('adminLogoutLink');
    const adminStatusHeader = document.getElementById('adminStatusHeader');
    const postFormContainer = document.getElementById('postFormContainer');
    const postForm = document.getElementById('postForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const blogPosts = document.getElementById('blogPosts');
    const postTemplate = document.getElementById('postTemplate');
    const pagination = document.getElementById('pagination');
    const postImage = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    const postId = document.getElementById('postId');
    const submitPostBtn = document.getElementById('submitPostBtn');

    // 페이지네이션 변수
    const postsPerPage = 5; // 페이지당 게시물 수
    let currentPage = 1; // 현재 페이지
    let totalPages = 1; // 전체 페이지 수

    // URL에서 페이지 매개변수 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam && !isNaN(parseInt(pageParam))) {
        currentPage = parseInt(pageParam);
    }

    // HTML 편집기 관련 요소
    const plainTextBtn = document.getElementById('plainTextBtn');
    const htmlEditorBtn = document.getElementById('htmlEditorBtn');
    const postContent = document.getElementById('postContent');
    const htmlPreview = document.getElementById('htmlPreview');
    const previewContent = document.getElementById('previewContent');
    
    // 현재 에디터 모드 (plain 또는 html)
    let editorMode = 'plain';

    // 게시물 데이터 (로컬 스토리지에서 불러오기)
    let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    let currentPostId = null;
    let isAdmin = false;

    // 관리자 권한 및 메뉴 설정
    function setupAdminInterface() {
        // 대시보드와 동일한 방식으로 관리자 로그인 상태 확인
        const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
        const adminElements = document.querySelectorAll('.admin-only');
        
        if (currentAdmin) {
            // 관리자 로그인 상태
            isAdmin = true;
            adminElements.forEach(el => el.style.display = 'block');
            
            // 관리자 상태 표시
            if (adminStatusHeader) {
                adminStatusHeader.innerHTML = `<i class="fas fa-user-shield"></i> ${currentAdmin.name || currentAdmin.id} (관리자)`;
                adminStatusHeader.style.display = 'block';
            }
            
            // 기존 시스템과의 호환성을 위해 admin_token도 설정
            if (!localStorage.getItem('admin_token')) {
                localStorage.setItem('admin_token', 'true');
                localStorage.setItem('admin_name', currentAdmin.name || currentAdmin.id);
            }
        } else {
            // 이전 방식으로 확인 (역호환성 유지)
            const adminToken = localStorage.getItem('admin_token');
            const adminName = localStorage.getItem('admin_name');
            
            if (adminToken && adminName) {
                // 관리자 로그인 상태
            isAdmin = true;
                adminElements.forEach(el => el.style.display = 'block');
                
                // 관리자 상태 표시
                if (adminStatusHeader) {
                    adminStatusHeader.innerHTML = `<i class="fas fa-user-shield"></i> ${adminName} (관리자)`;
                    adminStatusHeader.style.display = 'block';
                }
                
                // 새 시스템에 동기화
                if (!localStorage.getItem('currentAdmin')) {
                    const adminData = {
                        id: adminName,
                        name: adminName,
                        role: 'admin'
                    };
                    localStorage.setItem('currentAdmin', JSON.stringify(adminData));
                }
        } else {
                // 로그인되지 않은 상태
                isAdmin = false;
                adminElements.forEach(el => el.style.display = 'none');
                if (adminStatusHeader) adminStatusHeader.style.display = 'none';
            }
        }
    }
    
    // 페이지 로드 시 관리자 인터페이스 설정
    setupAdminInterface();

    // 관리자 로그인 버튼 클릭 이벤트
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (isAdmin) {
                window.location.href = 'admin-dashboard.html';
            } else {
        window.location.href = 'admin-login.html';
            }
    });
    }

    // 관리자 로그아웃 버튼 클릭 이벤트
    if (adminLogoutLink) {
        adminLogoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('정말 로그아웃하시겠습니까?')) {
                // 두 시스템 모두에서 로그아웃 처리
        localStorage.removeItem('currentAdmin');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_name');
                localStorage.removeItem('admin_role');
                window.location.reload();
            }
        });
    }

    // URL에서 매개변수 가져오기
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // HTML 편집기 버튼 이벤트
    if (plainTextBtn && htmlEditorBtn) {
        plainTextBtn.addEventListener('click', function() {
            switchEditorMode('plain');
        });
        
        htmlEditorBtn.addEventListener('click', function() {
            switchEditorMode('html');
        });
        
        // 내용 변경 시 HTML 미리보기 업데이트
        postContent.addEventListener('input', updateHtmlPreview);
    }
    
    // HTML 미리보기 업데이트
    function updateHtmlPreview() {
        if (editorMode === 'html' && previewContent) {
            try {
                previewContent.innerHTML = postContent.value || '<p>HTML 미리보기가 여기에 표시됩니다.</p>';
            } catch (error) {
                console.error('HTML 미리보기 오류:', error);
                previewContent.innerHTML = '<p style="color: red;">HTML 오류가 발생했습니다. 코드를 확인해주세요.</p>';
            }
        }
    }

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

    // 게시물 작성 폼 처리
    if (postFormContainer) {
        // 이미지 미리보기 기능
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

        // 취소 버튼 클릭 이벤트
        cancelBtn.addEventListener('click', function() {
            // 대시보드로 이동
            window.location.href = 'admin-dashboard.html';
        });

        // 폼 제출 이벤트 (게시물 추가 또는 수정)
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 관리자 권한 확인
            if (!isAdmin) {
                alert('관리자만 게시물을 작성하거나 수정할 수 있습니다.');
                return;
            }
            
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const imageFile = document.getElementById('postImage').files[0];
            
            // 이미지를 Base64로 변환
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    savePost(title, content, e.target.result);
                };
                reader.readAsDataURL(imageFile);
            } else {
                // 이미지가 없는 경우 또는 수정에서 이미지를 변경하지 않은 경우
                const existingImageSrc = currentPostId ? posts.find(post => post.id === currentPostId)?.image : null;
                savePost(title, content, existingImageSrc);
            }
        });
    }

    // 게시물 저장 함수
    function savePost(title, content, imageSrc) {
        const currentDate = new Date().toLocaleString('ko-KR');
        
        // 현재 사용 중인 에디터 모드 확인 (console에 표시)
        console.log('게시물 저장:', { title, contentLength: content.length, isHtml: editorMode === 'html' });
        
        if (currentPostId) {
            // 게시물 수정
            const index = posts.findIndex(post => post.id === currentPostId);
            if (index !== -1) {
                posts[index] = {
                    ...posts[index],
                    title,
                    content,
                    date: currentDate,
                    image: imageSrc || posts[index].image,
                    isHtml: editorMode === 'html' // HTML 모드 여부 저장
                };
            }
        } else {
            // 새 게시물 추가
            const newPost = {
                id: Date.now().toString(), // 고유 ID 생성
                title,
                content,
                date: currentDate,
                image: imageSrc || 'images/default-post-image.jpg', // 기본 이미지 설정
                isHtml: editorMode === 'html' // HTML 모드 여부 저장
            };
            posts.unshift(newPost); // 최신 게시물이 맨 위에 오도록
        }
        
        // 로컬 스토리지에 저장
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // 대시보드로 이동
        window.location.href = 'admin-dashboard.html';
    }

    // 게시물 수정 함수
    function editPost(postId) {
        // 관리자 권한 확인
        if (!isAdmin) {
            alert('관리자만 게시물을 수정할 수 있습니다.');
            return;
        }
        
        // 관리자 대시보드로 이동하면서 edit 파라미터 전달
        window.location.href = `blog.html?edit=${postId}`;
    }

    // 게시물 삭제 모달 표시
    function showDeleteModal(postId) {
        currentPostId = postId;
        deleteModal.style.display = 'flex';
    }

    // 게시물 렌더링 함수
    function renderPosts() {
        blogPosts.innerHTML = '';
        
        if (posts.length === 0) {
            blogPosts.innerHTML = '<div class="no-posts">아직 게시물이 없습니다.</div>';
            renderPagination(0, 1);
            return;
        }
        
        // 총 페이지 수 계산
        totalPages = Math.ceil(posts.length / postsPerPage);
        
        // 현재 페이지가 유효한지 확인, 아니면 첫 페이지로
        if (currentPage < 1 || currentPage > totalPages) {
            currentPage = 1;
        }
        
        // 현재 페이지에 표시할 게시물 계산
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = Math.min(startIndex + postsPerPage, posts.length);
        const currentPosts = posts.slice(startIndex, endIndex);
        
        currentPosts.forEach(post => {
            // 템플릿 복제
            const postElement = document.importNode(postTemplate.content, true);
            
            // 데이터 설정
            const blogPostDiv = postElement.querySelector('.blog-post');
            blogPostDiv.dataset.id = post.id;
            
            // 게시물 제목 설정 및 클릭 이벤트 추가
            const postTitle = postElement.querySelector('.post-title');
            postTitle.textContent = post.title;
            postTitle.style.cursor = 'pointer';
            postTitle.addEventListener('click', function() {
                navigateToPost(post.id);
            });
            
            postElement.querySelector('.post-date').textContent = post.date;
            
            // 이미지 설정 및 클릭 이벤트 추가
            const postImageContainer = postElement.querySelector('.post-image-container');
            const postImage = postElement.querySelector('.post-image');
            
            if (post.image) {
                postImage.src = post.image;
            } else {
                postImage.src = 'images/default-post-image.jpg';
            }
            
            postImageContainer.style.cursor = 'pointer';
            postImageContainer.addEventListener('click', function() {
                navigateToPost(post.id);
            });
            
            // 컨텐츠 설정 (HTML 또는 일반 텍스트)
            const contentElement = postElement.querySelector('.post-content');
            const fullContent = post.content;
            
            // 내용을 짧게 잘라서 표시 (최대 200자)
            if (post.isHtml) {
                // HTML 내용 처리
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = fullContent;
                const textContent = tempDiv.textContent || tempDiv.innerText;
                
                if (textContent.length > 200) {
                    const truncatedText = textContent.substring(0, 200) + '...';
                    // XSS 방지를 위한 텍스트 노드로 추가
                    contentElement.textContent = truncatedText;
                } else {
                    // 짧은 내용은 HTML 그대로 표시
                    contentElement.innerHTML = fullContent;
                }
            } else {
                // 일반 텍스트 처리
                if (fullContent.length > 200) {
                    contentElement.textContent = fullContent.substring(0, 200) + '...';
                } else {
                    contentElement.textContent = fullContent;
                }
            }
            
            // '자세히 보기' 링크 설정
            const readMoreLink = postElement.querySelector('.post-read-more a');
            readMoreLink.href = `blog-detail.html?id=${post.id}`;
            
            // 전체 카드 클릭 이벤트 (모바일에서 더 쉽게 클릭하도록)
            blogPostDiv.addEventListener('click', function(e) {
                // 클릭이 이미 처리된 자식 요소가 아닌 경우에만 처리
                if (e.target !== postTitle && 
                    !postImageContainer.contains(e.target) && 
                    !readMoreLink.contains(e.target)) {
                    navigateToPost(post.id);
                }
            });
            
            // blogPosts에 추가
            blogPosts.appendChild(postElement);
        });
        
        // 페이지네이션 렌더링
        renderPagination(posts.length, totalPages);
    }
    
    // 게시물 상세 페이지로 이동하는 함수
    function navigateToPost(postId) {
        window.location.href = `blog-detail.html?id=${postId}`;
    }

    // 페이지네이션 렌더링 함수
    function renderPagination(totalItems, totalPages) {
        if (!pagination) return;
        
        pagination.innerHTML = '';
        
        // 게시물이 없거나 1페이지만 있으면 페이지네이션 숨기기
        if (totalItems <= postsPerPage) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        // 이전 페이지 버튼
        const prevButton = document.createElement('a');
        prevButton.href = `?page=${currentPage - 1}`;
        prevButton.className = `pagination-item prev ${currentPage <= 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.addEventListener('click', function(e) {
            if (currentPage > 1) {
                e.preventDefault();
                navigateToPage(currentPage - 1);
            } else {
                e.preventDefault(); // 첫 페이지면 이동 방지
            }
        });
        pagination.appendChild(prevButton);
        
        // 페이지 번호 생성
        const maxVisiblePages = 5; // 한 번에 표시할 최대 페이지 수
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // 시작 페이지 조정
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // 첫 페이지 링크 (필요한 경우)
        if (startPage > 1) {
            const firstPage = document.createElement('a');
            firstPage.href = `?page=1`;
            firstPage.className = 'pagination-item';
            firstPage.textContent = '1';
            firstPage.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToPage(1);
            });
            pagination.appendChild(firstPage);
            
            // 줄임표 표시 (첫 페이지와 간격이 있는 경우)
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }
        
        // 페이지 번호
        for (let i = startPage; i <= endPage; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = `?page=${i}`;
            pageLink.className = `pagination-item ${i === currentPage ? 'active' : ''}`;
            pageLink.textContent = i;
            
            pageLink.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToPage(i);
            });
            
            pagination.appendChild(pageLink);
        }
        
        // 마지막 페이지 링크 (필요한 경우)
        if (endPage < totalPages) {
            // 줄임표 표시 (마지막 페이지와 간격이 있는 경우)
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
            
            const lastPage = document.createElement('a');
            lastPage.href = `?page=${totalPages}`;
            lastPage.className = 'pagination-item';
            lastPage.textContent = totalPages;
            lastPage.addEventListener('click', function(e) {
                e.preventDefault();
                navigateToPage(totalPages);
            });
            pagination.appendChild(lastPage);
        }
        
        // 다음 페이지 버튼
        const nextButton = document.createElement('a');
        nextButton.href = `?page=${currentPage + 1}`;
        nextButton.className = `pagination-item next ${currentPage >= totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.addEventListener('click', function(e) {
            if (currentPage < totalPages) {
                e.preventDefault();
                navigateToPage(currentPage + 1);
            } else {
                e.preventDefault(); // 마지막 페이지면 이동 방지
            }
        });
        pagination.appendChild(nextButton);
    }
    
    // 페이지 이동 함수
    function navigateToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        
        currentPage = pageNumber;
        
        // URL 업데이트
        const url = new URL(window.location);
        url.searchParams.set('page', currentPage);
        window.history.pushState({}, '', url);
        
        // 게시물 다시 렌더링
        renderPosts();
        
        // 페이지 상단으로 스크롤
        window.scrollTo(0, 0);
    }

    // 초기화 함수
    function init() {
            renderPosts();
    }

    // 페이지 초기화
    init();

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