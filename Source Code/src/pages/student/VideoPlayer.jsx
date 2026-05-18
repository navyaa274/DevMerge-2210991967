import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function VideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const contentContext = location.state; // Get context from navigation
  const [learningPath, setLearningPath] = useState(null);
  const [nextContent, setNextContent] = useState(null);

  useEffect(() => {
    fetchVideo();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      const [videoRes, progressRes] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/videos/${videoId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${API_BASE_URL}/videos/${videoId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => ({ data: { progress: 0 } }))
      ]);

      setVideo(videoRes.data);
      setProgress(progressRes.data.progress || 0);

      // Fetch learning path if context is available
      if (contentContext?.pathId) {
        const pathRes = await axios.get(
          `${API_BASE_URL}/learning-paths/${contentContext.pathId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLearningPath(pathRes.data);
        
        // Find next content item
        const next = findNextContent(pathRes.data, contentContext.moduleIndex, contentContext.contentIndex);
        setNextContent(next);
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const findNextContent = (path, currentModuleIdx, currentContentIdx) => {
    if (!path?.modules) return null;

    const currentModule = path.modules[currentModuleIdx];
    
    // Check if there's a next item in the current module
    if (currentModule?.content && currentContentIdx < currentModule.content.length - 1) {
      return {
        item: currentModule.content[currentContentIdx + 1],
        moduleIndex: currentModuleIdx,
        contentIndex: currentContentIdx + 1
      };
    }

    // Check if there's a next module
    if (currentModuleIdx < path.modules.length - 1) {
      const nextModule = path.modules[currentModuleIdx + 1];
      if (nextModule?.content && nextModule.content.length > 0) {
        return {
          item: nextModule.content[0],
          moduleIndex: currentModuleIdx + 1,
          contentIndex: 0
        };
      }
    }

    return null; // No more content
  };

  const handleNext = () => {
    if (!nextContent) {
      // No more content, go back to learning path
      if (contentContext?.pathId) {
        navigate(`/student/learning-paths/${contentContext.pathId}`);
      } else {
        navigate(-1);
      }
      return;
    }

    const { item, moduleIndex, contentIndex } = nextContent;
    const newContext = {
      pathId: contentContext.pathId,
      moduleIndex,
      contentIndex,
      contentType: item.type,
      contentId: item.contentId || item.title
    };

    // Navigate based on content type
    if (item.type === 'video') {
      navigate(`/student/video/${item.contentId}`, { state: newContext });
    } else if (item.type === 'quiz') {
      navigate(`/student/quiz/${item.contentId}`, { state: newContext });
    } else if (item.type === 'problem') {
      navigate(`/problems/${item.contentId}`, { state: newContext });
    } else if (item.type === 'reading') {
      navigate(`/student/reading/${item.title}`, { state: { reading: item, ...newContext } });
    } else {
      navigate(`/student/learning-paths/${contentContext.pathId}`);
    }
  };

  const updateProgress = async (currentProgress) => {
    try {
      await axios.post(
        `${API_BASE_URL}/videos/${videoId}/progress`,
        { progress: currentProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mark as complete in learning path if 90% watched
      if (currentProgress >= 90 && contentContext) {
        await axios.post(
          `${API_BASE_URL}/user-progress/${contentContext.pathId}/complete`,
          {
            contentType: 'video',
            contentId: videoId,
            moduleIndex: contentContext.moduleIndex,
            contentIndex: contentContext.contentIndex
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleVideoTimeUpdate = (e) => {
    const videoElement = e.target;
    if (!videoElement.duration) return;
    
    const currentProgress = Math.floor((videoElement.currentTime / videoElement.duration) * 100);
    
    if (currentProgress > progress) {
      setProgress(currentProgress);
      
      // Update progress every 10% increment
      if (currentProgress % 10 === 0 && currentProgress !== progress) {
        updateProgress(currentProgress);
      }
    }
  };

  const handleVideoEnded = () => {
    updateProgress(100);
    setProgress(100);
  };

  const handleMarkAsWatched = async () => {
    setProgress(100);
    await updateProgress(100);
    alert('Video marked as complete!');
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Direct video URL
    return url;
  };

  const isDirectVideo = (url) => {
    return url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(video.url);
  const isDirect = isDirectVideo(video.url);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white transition"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Course
          </button>
          <div className="flex items-center gap-4">
            <div className="text-gray-300 text-sm">
              Progress: <span className="font-bold text-white">{progress}%</span>
            </div>
            {progress >= 90 && (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="relative bg-black" style={{ paddingTop: '56.25%' }}>
          {isDirect ? (
            <video
              ref={playerRef}
              className="absolute top-0 left-0 w-full h-full"
              controls
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              poster={video.thumbnail}
            >
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <iframe
              ref={playerRef}
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 p-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-gray-800 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
          <p className="text-gray-300 mb-4">{video.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.floor(video.duration / 60)} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{video.views || 0} views</span>
            </div>
          </div>

          {/* Mark as Watched Button */}
          {progress < 90 && (
            <button
              onClick={handleMarkAsWatched}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mark as Watched
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-gray-800 p-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (contentContext?.pathId) {
                  navigate(`/student/learning-paths/${contentContext.pathId}`);
                } else {
                  navigate(-1);
                }
              }}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium"
            >
              ← Back to Course
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              {nextContent ? `Next: ${nextContent.item.title}` : 'Complete Course'} →
            </button>
          </div>
          {progress < 90 && (
            <p className="text-center text-gray-400 text-sm mt-3">
              Watch at least 90% to mark as complete
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
