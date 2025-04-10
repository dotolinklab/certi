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
    const deleteModal = document.getElementById('deleteModal');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const postImage = document.getElementById('postImage');
    const imagePreview = document.getElementById('imagePreview');
    const postId = document.getElementById('postId');
    const submitPostBtn = document.getElementById('submitPostBtn');

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
        // 관리자 권한 확인
        if (!isAdmin) {
            alert('관리자만 게시물을 삭제할 수 있습니다.');
            return;
        }
        
        deleteModal.style.display = 'flex';
        confirmDelete.dataset.postId = postId;
    }

    // 게시물 삭제 확인
    confirmDelete.addEventListener('click', function() {
        const postId = this.dataset.postId;
        posts = posts.filter(post => post.id !== postId);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        renderPosts();
        deleteModal.style.display = 'none';
    });

    // 삭제 취소
    cancelDelete.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });

    // 폼 초기화
    function resetForm() {
        if (postForm) {
            postForm.reset();
            imagePreview.innerHTML = '';
            currentPostId = null;
            document.getElementById('postId').value = '';
        }
    }

    // 게시물 렌더링
    function renderPosts() {
        blogPosts.innerHTML = '';
        
        if (posts.length === 0) {
            blogPosts.innerHTML = '<p class="no-posts">아직 게시된 글이 없습니다.</p>';
            return;
        }
        
        // 모바일 환경 확인
        const isMobile = window.innerWidth <= 768;
        
        posts.forEach(post => {
            const postElement = document.importNode(postTemplate.content, true);
            const postContainer = postElement.querySelector('.blog-post');
            
            // 데이터 속성 설정
            postContainer.setAttribute('data-id', post.id);
            
            // 제목 설정
            const postTitle = postElement.querySelector('.post-title');
            postTitle.textContent = post.title;
            
            // 날짜 설정
            postElement.querySelector('.post-date').textContent = post.date;
            
            // 내용 설정
            const postContentElement = postElement.querySelector('.post-content');
            
            // HTML 모드인 경우 innerHTML로 설정, 아니면 textContent로 설정
            if (post.isHtml) {
                // 내용 요약 (일부만 표시)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = post.content;
                const contentText = tempDiv.textContent || tempDiv.innerText;
                const maxLength = isMobile ? 100 : 200; // 모바일에서는 더 짧게 표시
                
                if (contentText.length > maxLength) {
                    // HTML 내용이 길면 요약해서 표시 (텍스트로만)
                    postContentElement.textContent = contentText.substring(0, maxLength) + '...';
                } else {
                    // 짧은 HTML은 그대로 표시
                    postContentElement.innerHTML = post.content;
                }
            } else {
                // 일반 텍스트 - 기존 로직 사용
                const contentText = post.content;
                const maxLength = isMobile ? 100 : 200; // 모바일에서는 더 짧게 표시
                const shortContent = contentText.length > maxLength
                    ? contentText.substring(0, maxLength) + '...'
                    : contentText;
                
                postContentElement.textContent = shortContent;
            }
            
            // 자세히 보기 링크 설정
            const readMoreLink = postElement.querySelector('.post-read-more a');
            readMoreLink.href = `blog.html?post=${post.id}`;
            
            // 이미지 설정
            const postImage = postElement.querySelector('.post-image');
            if (post.image) {
                postImage.src = post.image;
                postImage.alt = post.title;
                
                // 이미지 클릭 시 상세 페이지로 이동
                postImage.style.cursor = 'pointer';
                postImage.addEventListener('click', function() {
                    window.location.href = `blog.html?post=${post.id}`;
                });
            } else {
                postImage.style.display = 'none';
            }
            
            // 제목 클릭 시 상세 페이지로 이동
            postTitle.style.cursor = 'pointer';
            postTitle.addEventListener('click', function() {
                window.location.href = `blog.html?post=${post.id}`;
            });
            
            const postActions = postElement.querySelector('.post-actions');
            
            // 관리자가 아니면 수정/삭제 버튼 숨기기
            if (!isAdmin) {
                postActions.style.display = 'none';
            }
            
            const editButton = postElement.querySelector('.btn-edit');
            const deleteButton = postElement.querySelector('.btn-delete');
            
            editButton.addEventListener('click', function(e) {
                e.stopPropagation(); // 이벤트 버블링 방지
                editPost(post.id);
            });
            
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation(); // 이벤트 버블링 방지
                showDeleteModal(post.id);
            });
            
            blogPosts.appendChild(postElement);
        });
    }

    // URL 파라미터에서 게시물 ID 가져오기
    function getPostIdFromUrl() {
        const editId = getUrlParameter('edit');
        const viewId = getUrlParameter('post');
        const isNewPost = getUrlParameter('new');
        
        // 새 게시물 작성 모드인 경우
        if (isNewPost === 'true' && isAdmin) {
            postFormContainer.style.display = 'block';
            resetForm();
            submitPostBtn.textContent = '게시하기';
            return null;
        }
        // 편집 모드인 경우
        else if (editId) {
            // 관리자 확인
            if (!isAdmin) {
                alert('관리자만 게시물을 수정할 수 있습니다.');
                window.location.href = 'blog.html';
                return null;
            }
            
            // 게시물 폼 표시 및 데이터 로드
            const post = posts.find(p => p.id === editId);
            if (post && postFormContainer) {
                postFormContainer.style.display = 'block';
                document.getElementById('postTitle').value = post.title;
                document.getElementById('postContent').value = post.content;
                document.getElementById('postId').value = post.id;
                
                // 에디터 모드 설정
                editorMode = post.isHtml ? 'html' : 'plain';
                switchEditorMode(editorMode);
                
                // 이미지 미리보기 설정
                if (post.image) {
                    imagePreview.innerHTML = `<img src="${post.image}" alt="미리보기" style="max-width: 200px; max-height: 200px;">`;
                }
                
                currentPostId = post.id;
                submitPostBtn.textContent = '수정하기';
            }
            
            return editId;
        } 
        // 조회 모드인 경우
        else if (viewId) {
            // 게시물 세부 정보 표시
            const post = posts.find(p => p.id === viewId);
            if (post) {
                // 게시물 목록을 비우고 세부 정보 표시
                blogPosts.innerHTML = '';
                
                // 상단 관리자 액션 버튼 추가 (관리자인 경우)
                if (isAdmin) {
                    // 관리자 버튼 추가
                    const adminControlsArea = document.querySelector('.admin-controls');
                    if (adminControlsArea) {
                        // 기존 버튼 유지하기 위해 innerHTML 대신 추가
                        const editBtn = document.createElement('a');
                        editBtn.href = `blog.html?edit=${post.id}`;
                        editBtn.className = 'btn btn-edit';
                        editBtn.innerHTML = '<i class="fas fa-edit"></i> 이 글 수정하기';
                        
                        const deleteBtn = document.createElement('a');
                        deleteBtn.href = '#';
                        deleteBtn.className = 'btn btn-delete';
                        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> 이 글 삭제하기';
                        deleteBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            showDeleteModal(post.id);
                        });
                        
                        adminControlsArea.appendChild(editBtn);
                        adminControlsArea.appendChild(deleteBtn);
                    }
                }
                
                // 세부 정보 UI 생성
                const detailElement = document.createElement('div');
                detailElement.className = 'blog-post-detail';
                
                // 뒤로가기 버튼
                const backButton = document.createElement('button');
                backButton.className = 'btn-back';
                backButton.innerHTML = '<i class="fas fa-arrow-left"></i> 목록으로 돌아가기';
                backButton.addEventListener('click', function() {
                    window.location.href = 'blog.html';
                });
                
                detailElement.appendChild(backButton);
                
                // 게시물 컨테이너 생성
                const postContainer = document.createElement('div');
                postContainer.className = 'post-detail-container';
                
                // 1. 제목 요소 생성 및 추가
                const titleElement = document.createElement('h2');
                titleElement.className = 'post-detail-title';
                titleElement.textContent = post.title;
                postContainer.appendChild(titleElement);
                
                // 2. 날짜 요소 생성 및 추가
                const dateElement = document.createElement('div');
                dateElement.className = 'post-detail-date';
                dateElement.textContent = post.date;
                postContainer.appendChild(dateElement);
                
                // 4. 이미지 추가 (있는 경우에만)
                if (post.image) {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'post-detail-image';
                    imageContainer.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
                    postContainer.appendChild(imageContainer);
                }
                
                // 5. 내용 요소 생성 및 추가
                const contentElement = document.createElement('div');
                contentElement.className = 'post-detail-content-text';
                
                if (post.isHtml) {
                    contentElement.innerHTML = post.content;
                } else {
                    contentElement.textContent = post.content;
                }
                
                postContainer.appendChild(contentElement);
                
                // 모든 요소를 상세 페이지 컨테이너에 추가
                detailElement.appendChild(postContainer);
                blogPosts.appendChild(detailElement);
            }
            
            return viewId;
        }
        
        return null;
    }

    // 샘플 게시물 생성
    const createSampleBtn = document.getElementById('createSampleBtn');
    if (createSampleBtn) {
        createSampleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('샘플 게시물을 생성하시겠습니까?')) {
                createSamplePosts();
            }
        });
    }

    // 샘플 게시물 생성 함수
    function createSamplePosts() {
        if (!isAdmin) {
            alert('관리자만 샘플 게시물을 생성할 수 있습니다.');
            return;
        }
        
        const samplePosts = [
            {
                id: Date.now().toString(),
                title: '학위취득 방법 총정리 - 독학학위제부터 학점은행제까지',
                content: '많은 분들이 학위 취득을 위해 다양한 방법을 찾고 계신데요. 이번 글에서는 독학학위제, 학점은행제, 사이버대학 등 다양한 학위 취득 방법을 비교 분석하고 각각의 장단점을 살펴보겠습니다.',
                date: new Date().toLocaleString('ko-KR'),
                image: 'https://via.placeholder.com/200x200?text=학위취득',
                isHtml: false
            },
            {
                id: (Date.now() - 1000).toString(),
                title: 'HTML 태그를 활용한 글쓰기 가이드',
                content: '<h3>HTML 태그의 기본</h3><p>이 글은 <strong>HTML 태그</strong>를 사용하여 작성되었습니다.</p><ul><li>글씨를 <em>기울이거나</em></li><li>텍스트를 <strong>굵게</strong> 표시할 수 있습니다.</li><li>또한 <a href="#">링크</a>도 넣을 수 있죠.</li></ul><p>이렇게 작성하면 더 <span style="color:blue;">다채로운</span> 글을 쓸 수 있습니다!</p>',
                date: new Date(Date.now() - 86400000).toLocaleString('ko-KR'), // 하루 전
                image: 'https://via.placeholder.com/200x200?text=HTML가이드',
                isHtml: true
            },
            {
                id: (Date.now() - 2000).toString(),
                title: '사회복지사 자격증 2급 취득방법',
                content: '<h3>사회복지사 자격증의 중요성</h3><p>사회복지사 자격증은 사회복지 분야에서 일하기 위한 필수 자격증입니다.</p><h4>취득 방법</h4><ol><li><strong>학점은행제를 통한 취득</strong>: 사회복지 관련 교과목 이수</li><li><strong>대학에서 취득</strong>: 사회복지학과 졸업</li><li><strong>관련 실습</strong>: 160시간의 현장실습 완료</li></ol><p>자세한 사항은 <a href="#">한국사회복지사협회</a>에서 확인하세요.</p>',
                date: new Date(Date.now() - 172800000).toLocaleString('ko-KR'), // 이틀 전
                image: 'https://via.placeholder.com/200x200?text=사회복지사',
                isHtml: true
            },
            {
                id: (Date.now() - 3000).toString(),
                title: '지방세 세목별 과세증명서 발급 방법',
                content: '지방세는 우리의 일상생활과 지역사회 발전에 밀접한 관련이 있는 중요한 세금 제도입니다. 특히 지방세 세목별 과세증명서는 부동산 거래, 각종 행정 절차, 대출 신청 등 다양한 상황에서 필요한 중요한 문서입니다. 이 글에서는 지방세의 개념부터 국세와의 차이점, 세목별 과세증명서 발급 방법, 지방세 납부 및 조회 방법까지 자세히 알아보겠습니다.',
                date: new Date(Date.now() - 259200000).toLocaleString('ko-KR'), // 삼일 전
                image: 'https://via.placeholder.com/200x200?text=지방세증명서',
                isHtml: false
            },
            {
                id: (Date.now() - 4000).toString(),
                title: '폐업사실증명 발급방법 신청절차',
                content: '사업을 종료하고 폐업 절차를 진행한 후에는 폐업사실증명서가 필요한 경우가 많습니다. 폐업사실증명서는 사업자가 적법하게 폐업 신고를 했음을 증명하는 공식 문서로, 다양한 행정 절차나 금융 거래에서 요구됩니다. 이 글에서는 폐업사실증명서의 개념부터 발급 방법, 필요한 서류, 온라인 발급 절차, 수수료, 유효기간까지 상세히 알아보겠습니다.',
                date: new Date(Date.now() - 345600000).toLocaleString('ko-KR'), // 사일 전
                image: 'https://via.placeholder.com/200x200?text=폐업증명서',
                isHtml: false
            }
        ];
        
        // 기존 게시물에 샘플 게시물 추가
        posts = [...samplePosts, ...posts];
        
        // 로컬 스토리지에 저장
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        
        // 게시물 다시 렌더링
        renderPosts();
        
        alert('샘플 게시물이 성공적으로 생성되었습니다.');
    }

    // 초기화 함수
    function init() {
        setupAdminInterface();
        
        const editMode = getUrlParameter('edit');
        const newMode = getUrlParameter('new');
        const viewMode = getUrlParameter('post');
        
        // 수정 모드나 새 게시물 작성 모드가 아니고, 게시물 보기 모드도 아닌 경우에만 게시물 목록 표시
        if (!editMode && !newMode && !viewMode) {
            renderPosts();
        } else {
            getPostIdFromUrl();
        }
    }

    // 초기화
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