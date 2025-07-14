import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../apis/api';
import API_ENDPOINTS from '../../../utils/constants';
import styles from './UserBoard.module.css';
import Dropdown from '../../common/Dropdown';
import Pagination from '../../common/Pagination/Pagination';

const UserBoard = ({ isLogin, currentUserId }) => {
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [myCommentedPosts, setMyCommentedPosts] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 페이지네이션 상태
  const [currentPages, setCurrentPages] = useState({
    myPosts: 1,
    myComments: 1,
    bookmarks: 1,
    likes: 1
  });

  // 정렬 옵션 상태
  const [sortOptions, setSortOptions] = useState({
    myPosts: 'latest',
    myComments: 'latest',
    bookmarks: 'latest',
    likes: 'latest'
  });

  // 총 페이지 수 상태
  const [totalPages, setTotalPages] = useState({
    myPosts: 1,
    myComments: 1,
    bookmarks: 1,
    likes: 1
  });

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (isLogin && currentUserId) {
      fetchUserActivityPosts();
    }
  }, [isLogin, currentUserId, currentPages, sortOptions]);

  const fetchUserActivityPosts = async () => {
    setLoading(true);
    try {
      // 내가 쓴 글 조회
      const myPostsResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/my-posts`, {
        headers: { 'User-Id': currentUserId },
        params: {
          page: currentPages.myPosts,
          size: ITEMS_PER_PAGE,
          sort: sortOptions.myPosts
        }
      });

      // 내가 댓글 단 글 조회
      const myCommentsResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/my-comments`, {
        headers: { 'User-Id': currentUserId },
        params: {
          page: currentPages.myComments,
          size: ITEMS_PER_PAGE,
          sort: sortOptions.myComments
        }
      });

      // 북마크한 글 조회
      const bookmarkResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/my-bookmarks`, {
        headers: { 'User-Id': currentUserId },
        params: {
          page: currentPages.bookmarks,
          size: ITEMS_PER_PAGE,
          sort: sortOptions.bookmarks
        }
      });

      // 좋아요한 글 조회
      const likeResponse = await api.get(`${API_ENDPOINTS.COMMUNITY.USER}/board/my-likes`, {
        headers: { 'User-Id': currentUserId },
        params: {
          page: currentPages.likes,
          size: ITEMS_PER_PAGE,
          sort: sortOptions.likes
        }
      });

      // 데이터 설정
      setMyPosts(myPostsResponse.data.posts || []);
      setMyCommentedPosts(myCommentsResponse.data.comments || []);
      
      // 북마크/좋아요는 기존 방식 유지하되 페이지네이션 추가
      const bookmarkedPostIds = bookmarkResponse.data.bookmarkedPostIds || [];
      const likedPostIds = likeResponse.data.likedPostIds || [];

      if (bookmarkedPostIds.length > 0) {
        const bookmarkedPostsData = await fetchPostDetails(bookmarkedPostIds);
        setBookmarkedPosts(bookmarkedPostsData);
      } else {
        setBookmarkedPosts([]);
      }

      if (likedPostIds.length > 0) {
        const likedPostsData = await fetchPostDetails(likedPostIds);
        setLikedPosts(likedPostsData);
      } else {
        setLikedPosts([]);
      }

      // 총 페이지 수 설정
      setTotalPages({
        myPosts: myPostsResponse.data.totalPages || 1,
        myComments: myCommentsResponse.data.totalPages || 1,
        bookmarks: bookmarkResponse.data.totalPages || 1,
        likes: likeResponse.data.totalPages || 1
      });

    } catch (error) {
      console.error('Failed to fetch user activity posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postIds) => {
    try {
      const promises = postIds.map(postId =>
        api.get(`${API_ENDPOINTS.COMMUNITY.PUBLIC}/board/${postId}/info`)
      );
      const responses = await Promise.all(promises);
      
      return responses
        .map(response => {
          if (response.data && response.data.success) {
            return response.data.data;
          }
          return null;
        })
        .filter(data => data);
    } catch (error) {
      console.error('Failed to fetch post details:', error);
      return [];
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/board/${postId}`);
  };

  const handleBookmarkToggle = async (postId, e) => {
    e.stopPropagation();
    
    try {
      await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/bookmark/${postId}`, {
        headers: { 'User-Id': currentUserId }
      });

      setBookmarkedPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
      alert('북마크 해제 중 오류가 발생했습니다.');
    }
  };

  const handleLikeToggle = async (postId, e) => {
    e.stopPropagation();

    try {
      await api.delete(`${API_ENDPOINTS.COMMUNITY.USER}/board/like/${postId}`, {
        headers: { 'User-Id': currentUserId }
      });

      setLikedPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Failed to remove like:', error);
      alert('좋아요 해제 중 오류가 발생했습니다.');
    }
  };

  const handleMoreClick = (type) => {
    switch (type) {
      case 'my-posts':
        navigate('/my/posts');
        break;
      case 'my-comments':
        navigate('/my/comments');
        break;
      case 'bookmark':
        navigate('/my/bookmarks');
        break;
      case 'like':
        navigate('/my/likes');
        break;
      default:
        break;
    }
  };

  const handleSortChange = (section, option) => {
    setSortOptions(prev => ({
      ...prev,
      [section]: option.value
    }));
    setCurrentPages(prev => ({
      ...prev,
      [section]: 1
    }));
  };

  const handlePageChange = (section, page) => {
    setCurrentPages(prev => ({
      ...prev,
      [section]: page
    }));
  };

  const getSortOptions = () => [
    { label: '최신순', value: 'latest' },
    { label: '오래된순', value: 'oldest' },
    { label: '인기순', value: 'popular' }
  ];

  const getCurrentSortLabel = (section) => {
    const options = getSortOptions();
    const currentOption = options.find(option => option.value === sortOptions[section]);
    return currentOption ? currentOption.label : '최신순';
  };

  const renderDropdown = (section) => {
    return (
      <Dropdown
        defaultOption={getCurrentSortLabel(section)}
        options={getSortOptions()}
        onSelect={(option) => handleSortChange(section, option)}
      />
    );
  };

  const renderPagination = (section, totalPage, currentPage) => {
    if (totalPage <= 1) return null;

    return (
      <div className={styles.paginationWrapper}>
        <Pagination
          currentPage={currentPage}
          pageBlock={5}
          pageCount={totalPage}
          onPageChange={(page) => handlePageChange(section, page)}
        />
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateString);
      return '-';
    }
  };

  const renderMyPostList = (posts) => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>작성한 게시글이 없습니다.</p>
        </div>
      );
    }

    return (
      <div className={styles.postList}>
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className={styles.postItem}
            onClick={() => handlePostClick(post.id)}
          >
            <div className={styles.postNumber}>{index + 1}.</div>
            <div className={styles.postContent}>
              <div className={styles.postTitle}>{post.title}</div>
              <div className={styles.postMeta}>
                <span className={styles.author}>{`${post.creatorNickname} (${post.userId})`}</span>
                <span className={styles.separator}>|</span>
                <span className={styles.date}>{formatDate(post.createdAt)}</span>
                <span className={styles.separator}>|</span>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <img src="/icons/common/comment.svg" alt="댓글" className={styles.icon} />
                    <span>{post.commentCount || 0}</span>
                  </div>
                  <span className={styles.separator}>|</span>
                  <div className={styles.statItem}>
                    <img src="/icons/common/view.svg" alt="조회수" className={styles.icon} />
                    <span>{post.viewCount || 0}</span>
                  </div>
                  <span className={styles.separator}>|</span>
                    <div className={styles.statItem}>
                        <img src="/icons/common/heart_fill.svg" alt="좋아요" className={styles.icon} />
                        <span>{post.likeCount || 0}</span>
                    </div>
                    <span className={styles.separator}>|</span>
                    <div className={styles.statItem}>
                        <img src="/icons/common/bookmark.svg" alt="북마크" className={styles.icon} />
                        <span>{post.bookmarkCount || 0}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMyCommentList = (comments) => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>댓글을 단 게시글이 없습니다.</p>
        </div>
      );
    }

    return (
      <div className={styles.postList}>
        {comments.map((comment, index) => (
          <div 
            key={comment.postId} 
            className={styles.postItem}
            onClick={() => handlePostClick(comment.postId)}
          >
            <div className={styles.postNumber}>{index + 1}.</div>
            <div className={styles.postContent}>
              <div className={styles.postTitle}>{comment.postTitle}</div>
              <div className={styles.commentContent}>
                <span className={styles.commentLabel}>내 댓글:</span>
                <span className={styles.commentText}>{comment.content}</span>
              </div>
              <div className={styles.postMeta}>
                <span className={styles.date}>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBookmarkLikeList = (posts, type, onToggle) => {
    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>로딩 중...</div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>{type === 'bookmark' ? '북마크한 게시글이 없습니다.' : '좋아요한 게시글이 없습니다.'}</p>
        </div>
      );
    }

    return (
      <div className={styles.postList}>
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className={styles.postItem}
            onClick={() => handlePostClick(post.id)}
          >
            <div className={styles.postNumber}>{index + 1}.</div>
            <div className={styles.postContent}>
              <div className={styles.postTitle}>{post.title}</div>
              <div className={styles.postMeta}>
                <span className={styles.author}>{`${post.creatorNickname} (${post.userId})`}</span>
                <span className={styles.separator}>|</span>
                <span className={styles.date}>{formatDate(post.createdAt)}</span>
                <span className={styles.separator}>|</span>
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <img src="/icons/common/comment.svg" alt="댓글" className={styles.icon} />
                    <span>{post.commentCount || 0}</span>
                  </div>
                  <span className={styles.separator}>|</span>
                  <div className={styles.statItem}>
                    <img src="/icons/common/view.svg" alt="조회수" className={styles.icon} />
                    <span>{post.viewCount || 0}</span>
                  </div>
                </div>
                <span className={styles.separator}>|</span>
                <div className={styles.statItem}>
                <img src="/icons/common/heart_fill.svg" alt="좋아요" className={styles.icon} />
                <span>{post.likeCount || 0}</span>
                </div>
                <span className={styles.separator}>|</span>
                <div className={styles.statItem}>
                <img src="/icons/common/bookmark.svg" alt="북마크" className={styles.icon} />
                <span>{post.bookmarkCount || 0}</span>
                </div>
              </div>
            </div>
            <button
              className={styles.actionButton}
              onClick={(e) => onToggle(post.id, e)}
            >
              <img
                src={type === 'bookmark' ? '/icons/common/bookmark_added.svg' : '/icons/common/heart_fill.svg'}
                alt={type === 'bookmark' ? '북마크 해제' : '좋아요 해제'}
                className={styles.actionIcon}
              />
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (!isLogin) {
    return (
      <div className={styles.container}>
        <div className={styles.loginRequired}>
          <p>로그인 후 이용 가능한 서비스입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 내가 쓴 글 */}
      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <h3 className={styles.boardTitle}>내가 쓴 글</h3>
          {renderDropdown('myPosts')}
        </div>
        {renderMyPostList(myPosts)}
        {renderPagination('myPosts', totalPages.myPosts, currentPages.myPosts)}
      </div>

      {/* 내가 댓글 단 글 */}
      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <h3 className={styles.boardTitle}>내가 댓글 단 글</h3>
          {renderDropdown('myComments')}
        </div>
        {renderMyCommentList(myCommentedPosts)}
        {renderPagination('myComments', totalPages.myComments, currentPages.myComments)}
      </div>

      {/* 내가 북마크한 글 */}
      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <h3 className={styles.boardTitle}>내가 북마크한 글</h3>
          {renderDropdown('bookmarks')}
        </div>
        {renderBookmarkLikeList(bookmarkedPosts, 'bookmark', handleBookmarkToggle)}
        {renderPagination('bookmarks', totalPages.bookmarks, currentPages.bookmarks)}
      </div>

      {/* 내가 좋아요한 글 */}
      <div className={styles.boardSection}>
        <div className={styles.boardHeader}>
          <h3 className={styles.boardTitle}>내가 좋아요한 글</h3>
          {renderDropdown('likes')}
        </div>
        {renderBookmarkLikeList(likedPosts, 'like', handleLikeToggle)}
        {renderPagination('likes', totalPages.likes, currentPages.likes)}
      </div>
    </div>
  );
};

export default UserBoard;