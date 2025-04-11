const posts = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    // 게시글 목록 조회
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    let sortedPosts = [...posts];
    
    // 정렬
    if (sort === 'newest') {
      sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    
    // 페이지네이션
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = sortedPosts.slice(start, end);
    
    res.status(200).json({
      posts: paginatedPosts,
      total: posts.length,
      page: parseInt(page),
      totalPages: Math.ceil(posts.length / limit)
    });
  } else if (req.method === 'POST') {
    // 새 게시글 작성
    const { title, content, imageUrl } = req.body;
    const newPost = {
      id: Date.now(),
      title,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      views: 0
    };
    posts.push(newPost);
    res.status(201).json(newPost);
  } else if (req.method === 'PUT') {
    // 게시글 수정
    const { id, title, content, imageUrl } = req.body;
    const index = posts.findIndex(post => post.id === parseInt(id));
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        title,
        content,
        imageUrl,
        updatedAt: new Date().toISOString()
      };
      res.status(200).json(posts[index]);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } else if (req.method === 'DELETE') {
    // 게시글 삭제
    const { id } = req.query;
    const index = posts.findIndex(post => post.id === parseInt(id));
    if (index !== -1) {
      posts.splice(index, 1);
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } else if (req.method === 'PATCH') {
    // 게시글 조회수 증가 또는 좋아요
    const { id, action } = req.body;
    const index = posts.findIndex(post => post.id === parseInt(id));
    if (index !== -1) {
      if (action === 'view') {
        posts[index].views += 1;
      } else if (action === 'like') {
        posts[index].likes += 1;
      }
      res.status(200).json(posts[index]);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 