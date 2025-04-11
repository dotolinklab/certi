const comments = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    // 특정 게시글의 댓글 조회
    const { postId, page = 1, limit = 10, sort = 'newest' } = req.query;
    let postComments = comments.filter(comment => comment.postId === parseInt(postId));
    
    // 정렬
    if (sort === 'newest') {
      postComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'oldest') {
      postComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sort === 'likes') {
      postComments.sort((a, b) => b.likes - a.likes);
    }
    
    // 페이지네이션
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedComments = postComments.slice(start, end);
    
    res.status(200).json({
      comments: paginatedComments,
      total: postComments.length,
      page: parseInt(page),
      totalPages: Math.ceil(postComments.length / limit)
    });
  } else if (req.method === 'POST') {
    // 새 댓글 작성
    const { postId, content, author } = req.body;
    const newComment = {
      id: Date.now(),
      postId: parseInt(postId),
      content,
      author,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0
    };
    comments.push(newComment);
    res.status(201).json(newComment);
  } else if (req.method === 'PUT') {
    // 댓글 수정
    const { id, content } = req.body;
    const index = comments.findIndex(comment => comment.id === parseInt(id));
    if (index !== -1) {
      comments[index] = {
        ...comments[index],
        content,
        updatedAt: new Date().toISOString()
      };
      res.status(200).json(comments[index]);
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } else if (req.method === 'DELETE') {
    // 댓글 삭제
    const { id } = req.query;
    const index = comments.findIndex(comment => comment.id === parseInt(id));
    if (index !== -1) {
      comments.splice(index, 1);
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } else if (req.method === 'PATCH') {
    // 댓글 좋아요
    const { id } = req.body;
    const index = comments.findIndex(comment => comment.id === parseInt(id));
    if (index !== -1) {
      comments[index].likes += 1;
      res.status(200).json(comments[index]);
    } else {
      res.status(404).json({ error: 'Comment not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 