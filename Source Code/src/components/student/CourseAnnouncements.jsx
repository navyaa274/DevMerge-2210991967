import React, { useState, useEffect } from 'react';
import { Bell, Pin, AlertTriangle, Info, Calendar, Clock, Eye, User, Plus } from 'lucide-react';

const CourseAnnouncements = ({ courseId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    announcement_type: 'general',
    priority: 'normal',
    is_pinned: false,
    tags: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, [courseId]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      // This would use the announcement service when it's created
      // For now, using mock data
      const mockAnnouncements = [
        {
          _id: '1',
          title: 'Welcome to the Course!',
          content: 'Welcome to our course! Please review the syllabus and course materials. The first assignment is due next week.',
          announcement_type: 'general',
          priority: 'normal',
          is_pinned: true,
          published_at: new Date(Date.now() - 86400000), // 1 day ago
          created_by: { first_name: 'Dr.', last_name: 'Smith', username: 'drsmith' },
          tags: ['welcome', 'syllabus'],
          view_count: 45,
          is_read: false
        },
        {
          _id: '2',
          title: 'Midterm Exam Schedule',
          content: 'The midterm examination will be held on March 15th from 10:00 AM to 12:00 PM in Room 101. Please bring your student ID.',
          announcement_type: 'exam',
          priority: 'high',
          is_pinned: false,
          published_at: new Date(Date.now() - 3600000), // 1 hour ago
          created_by: { first_name: 'Dr.', last_name: 'Smith', username: 'drsmith' },
          tags: ['exam', 'midterm'],
          view_count: 23,
          is_read: true,
          read_at: new Date(Date.now() - 1800000) // 30 min ago
        }
      ];
      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      // This would use the announcement service
      console.log('Creating announcement:', createForm);
      setShowCreateForm(false);
      setCreateForm({
        title: '',
        content: '',
        announcement_type: 'general',
        priority: 'normal',
        is_pinned: false,
        tags: ''
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      // This would use the announcement service
      setAnnouncements(prev => prev.map(ann =>
        ann._id === announcementId
          ? { ...ann, is_read: true, read_at: new Date() }
          : ann
      ));
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam': return <AlertTriangle size={16} className="text-red-500" />;
      case 'assignment': return <Calendar size={16} className="text-blue-500" />;
      case 'grade': return <Info size={16} className="text-green-500" />;
      case 'important': return <AlertTriangle size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'normal': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-500 bg-gray-50';
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell size={32} className="text-blue-500" />
            Course Announcements
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with important course information</p>
        </div>

        {/* Only show create button for faculty/admin */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={16} />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement._id}
            className={`border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
              getPriorityColor(announcement.priority)
            } ${announcement.is_read ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {announcement.is_pinned && <Pin size={16} className="text-yellow-500" />}
                {getTypeIcon(announcement.announcement_type)}
                <h2 className="text-xl font-semibold">{announcement.title}</h2>
                {!announcement.is_read && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{announcement.created_by.first_name} {announcement.created_by.last_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{formatTimeAgo(announcement.published_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{announcement.view_count}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
            </div>

            {announcement.tags && announcement.tags.length > 0 && (
              <div className="flex gap-2 mb-4">
                {announcement.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Type: <span className="capitalize">{announcement.announcement_type}</span> •
                Priority: <span className="capitalize">{announcement.priority}</span>
              </div>

              {!announcement.is_read && (
                <button
                  onClick={() => markAsRead(announcement._id)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  Mark as Read
                </button>
              )}

              {announcement.is_read && announcement.read_at && (
                <span className="text-sm text-gray-500">
                  Read {formatTimeAgo(announcement.read_at)}
                </span>
              )}
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">No announcements yet</h3>
            <p>Check back later for important course updates</p>
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Announcement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                  placeholder="Announcement title"
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content *</label>
                <textarea
                  value={createForm.content}
                  onChange={(e) => setCreateForm({...createForm, content: e.target.value})}
                  placeholder="Announcement content..."
                  className="w-full p-3 border rounded resize-none"
                  rows={6}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={createForm.announcement_type}
                    onChange={(e) => setCreateForm({...createForm, announcement_type: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="general">General</option>
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="grade">Grade</option>
                    <option value="schedule">Schedule</option>
                    <option value="important">Important</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({...createForm, priority: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (optional)</label>
                <input
                  type="text"
                  value={createForm.tags}
                  onChange={(e) => setCreateForm({...createForm, tags: e.target.value})}
                  placeholder="Add tags separated by commas"
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.is_pinned}
                  onChange={(e) => setCreateForm({...createForm, is_pinned: e.target.checked})}
                  id="is_pinned"
                />
                <label htmlFor="is_pinned" className="text-sm">Pin this announcement</label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateAnnouncement}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  Create Announcement
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({
                      title: '',
                      content: '',
                      announcement_type: 'general',
                      priority: 'normal',
                      is_pinned: false,
                      tags: ''
                    });
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

export default CourseAnnouncements;
