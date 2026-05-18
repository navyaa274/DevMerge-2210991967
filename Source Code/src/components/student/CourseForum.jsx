import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, ThumbsUp, ThumbsDown, Reply, Pin, Lock, Eye, Clock, User } from 'lucide-react';
import forumService from '../../services/api/forumService';

const CourseForum = ({ courseId }) => {
  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [threadForm, setThreadForm] = useState({
    title: '',
    content: '',
    tags: '',
    is_anonymous: false
  });
  const [replyForm, setReplyForm] = useState({
    content: '',
    is_anonymous: false
  });
  const [activeTab, setActiveTab] = useState('recent'); // recent, popular, unanswered

  useEffect(() => {
    loadForumData();
  }, [courseId]);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const [forumResponse, threadsResponse] = await Promise.all([
        forumService.getOrCreateCourseForum(courseId),
        forumService.getForumThreads(forumResponse?.data?.data?._id || '', {
          page: 1,
          limit: 20,
          sort: activeTab === 'recent' ? 'last_reply_at' : activeTab === 'popular' ? 'view_count' : 'created_at'
        })
      ]);

      setForum(forumResponse.data.data);
      setThreads(threadsResponse.data.data || []);
      setPagination(threadsResponse.data.pagination);
    } catch (error) {
      console.error('Error loading forum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThreadDetails = async (threadId) => {
    try {
      const response = await forumService.getThread(threadId);
      setSelectedThread(response.data.data.thread);
      setThreadReplies(response.data.data.replies || []);
    } catch (error) {
      console.error('Error loading thread details:', error);
    }
  };

  const handleCreateThread = async () => {
    try {
      const tagsArray = threadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await forumService.createThread(forum._id, {
        ...threadForm,
        tags: tagsArray
      });

      setShowThreadForm(false);
      setThreadForm({ title: '', content: '', tags: '', is_anonymous: false });
      loadForumData();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleCreateReply = async () => {
    try {
      await forumService.createReply(selectedThread._id, {
        ...replyForm,
        parent_reply_id: replyingTo?._id
      });

      setShowReplyForm(false);
      setReplyingTo(null);
      setReplyForm({ content: '', is_anonymous: false });
      loadThreadDetails(selectedThread._id);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleThreadClick = async (thread) => {
    setSelectedThread(thread);
    await loadThreadDetails(thread._id);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderThreadList = () => (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div
          key={thread._id}
          onClick={() => handleThreadClick(thread)}
          className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {thread.is_pinned && <Pin size={16} className="text-yellow-500" />}
                {thread.is_locked && <Lock size={16} className="text-red-500" />}
                <h3 className="text-lg font-semibold hover:text-blue-600">{thread.title}</h3>
              </div>

              <p className="text-gray-600 mb-3 line-clamp-2">{thread.content}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{thread.is_anonymous ? 'Anonymous' : thread.author_id?.first_name} {thread.is_anonymous ? '' : thread.author_id?.last_name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{thread.view_count}</span>
                </div>

                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  <span>{thread.reply_count}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatTimeAgo(thread.created_at)}</span>
                </div>

                {thread.last_reply_at && (
                  <span className="text-xs">
                    Last reply {formatTimeAgo(thread.last_reply_at)}
                  </span>
                )}
              </div>

              {thread.tags && thread.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {thread.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button className="flex items-center gap-1 text-gray-500 hover:text-green-500">
                <ThumbsUp size={14} />
                <span className="text-xs">{thread.upvotes?.length || 0}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-red-500">
                <ThumbsDown size={14} />
                <span className="text-xs">{thread.downvotes?.length || 0}</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {threads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium mb-2">No discussions yet</h3>
          <p>Be the first to start a conversation!</p>
        </div>
      )}
    </div>
  );

  const renderThreadDetail = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Thread Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {selectedThread.is_pinned && <Pin size={16} className="text-yellow-500" />}
              {selectedThread.is_locked && <Lock size={16} className="text-red-500" />}
              <h1 className="text-2xl font-bold">{selectedThread.title}</h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <span>By {selectedThread.is_anonymous ? 'Anonymous' : `${selectedThread.author_id?.first_name} ${selectedThread.author_id?.last_name}`}</span>
              <span>{formatTimeAgo(selectedThread.created_at)}</span>
              <span>{selectedThread.view_count} views</span>
              <span>{threadReplies.length} replies</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
              <ThumbsUp size={14} />
              {selectedThread.upvotes?.length || 0}
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
              <ThumbsDown size={14} />
              {selectedThread.downvotes?.length || 0}
            </button>
          </div>
        </div>

        <div className="prose max-w-none">
          <p>{selectedThread.content}</p>
        </div>

        {selectedThread.tags && selectedThread.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {selectedThread.tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="divide-y">
        {threadReplies.map((reply) => (
          <div key={reply._id} className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {reply.is_anonymous ? 'Anonymous' : `${reply.author_id?.first_name} ${reply.author_id?.last_name}`}
                  </span>
                  <span className="text-sm text-gray-500">{formatTimeAgo(reply.created_at)}</span>
                </div>

                <div className="text-gray-700 mb-3">{reply.content}</div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setReplyingTo(reply);
                      setShowReplyForm(true);
                    }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
                  >
                    <Reply size={14} />
                    Reply
                  </button>

                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500">
                    <ThumbsUp size={14} />
                    {reply.upvotes?.length || 0}
                  </button>

                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
                    <ThumbsDown size={14} />
                    {reply.downvotes?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="p-6 border-t bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {replyingTo ? `Reply to ${replyingTo.is_anonymous ? 'Anonymous' : replyingTo.author_id?.first_name}` : 'Add Reply'}
          </h3>

          <div className="space-y-4">
            <textarea
              value={replyForm.content}
              onChange={(e) => setReplyForm({...replyForm, content: e.target.value})}
              placeholder="Write your reply..."
              className="w-full p-3 border rounded resize-none"
              rows={4}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={replyForm.is_anonymous}
                onChange={(e) => setReplyForm({...replyForm, is_anonymous: e.target.checked})}
                id="reply_anonymous"
              />
              <label htmlFor="reply_anonymous" className="text-sm">Post anonymously</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateReply}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Post Reply
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyingTo(null);
                  setReplyForm({ content: '', is_anonymous: false });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Reply Button */}
      {!showReplyForm && (
        <div className="p-6 border-t">
          <button
            onClick={() => setShowReplyForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Reply size={16} />
            Add Reply
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare size={32} className="text-blue-500" />
            Course Discussion
          </h1>
          <p className="text-gray-600 mt-1">Discuss course topics and collaborate with classmates</p>
        </div>

        {!selectedThread && (
          <button
            onClick={() => setShowThreadForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus size={16} />
            New Discussion
          </button>
        )}
      </div>

      {selectedThread ? (
        <>
          {/* Back Button */}
          <button
            onClick={() => setSelectedThread(null)}
            className="mb-4 text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            ← Back to Discussions
          </button>

          {renderThreadDetail()}
        </>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            {[
              { key: 'recent', label: 'Recent' },
              { key: 'popular', label: 'Popular' },
              { key: 'unanswered', label: 'Unanswered' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderThreadList()}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded ${
                      page === pagination.page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* New Thread Modal */}
      {showThreadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-6">Start New Discussion</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={threadForm.title}
                  onChange={(e) => setThreadForm({...threadForm, title: e.target.value})}
                  placeholder="What would you like to discuss?"
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={threadForm.content}
                  onChange={(e) => setThreadForm({...threadForm, content: e.target.value})}
                  placeholder="Provide more details about your question or topic..."
                  className="w-full p-3 border rounded resize-none"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (optional)</label>
                <input
                  type="text"
                  value={threadForm.tags}
                  onChange={(e) => setThreadForm({...threadForm, tags: e.target.value})}
                  placeholder="Add tags separated by commas (e.g., homework, quiz, lecture)"
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={threadForm.is_anonymous}
                  onChange={(e) => setThreadForm({...threadForm, is_anonymous: e.target.checked})}
                  id="thread_anonymous"
                />
                <label htmlFor="thread_anonymous" className="text-sm">Post anonymously</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateThread}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  Create Discussion
                </button>
                <button
                  onClick={() => {
                    setShowThreadForm(false);
                    setThreadForm({ title: '', content: '', tags: '', is_anonymous: false });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseForum;
