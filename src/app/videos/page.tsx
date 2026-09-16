'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, User, Video, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentProtectedRoute } from '@/components';

interface VideoData {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  standard: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  viewCount?: number;
  tags?: string[];
  uploadedBy?: {
    name: string;
  };
  createdAt: string;
}

function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [studentStandard, setStudentStandard] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];

  // Fetch Videos for Student's Standard
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/videos/student/standard');

      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(data.data || []);

      // Get student's standard from first video or local storage
      if (data.data?.length > 0) {
        setStudentStandard(data.data[0].standard);
      }
    } catch (error) {
      toast.error('Error fetching videos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  // Filter Videos
  const filteredVideos = videos.filter(video => {
    const matchesSubject = !filterSubject || video.subject === filterSubject;
    return matchesSubject;
  });

  // Group videos by subject
  const groupedVideos: Record<string, VideoData[]> = {};
  filteredVideos.forEach(video => {
    if (!groupedVideos[video.subject]) {
      groupedVideos[video.subject] = [];
    }
    groupedVideos[video.subject].push(video);
  });

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <Video size={48} className="text-[#00E5A8]" />
          </div>
          <p className="mt-4 text-gray-400 text-lg">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] relative overflow-hidden py-8 pt-20 sm:py-12 sm:pt-24 md:py-16 md:pt-28 px-4 sm:px-6 lg:px-8">
      {/* Green Radial Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
      </div>

      <div className="relative z-10">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .video-card { animation: fadeIn 0.5s ease-out forwards; }
        .video-card:nth-child(n) { animation-delay: calc(var(--index, 0) * 0.1s); }
        .header-section { animation: slideInLeft 0.6s ease-out; }
        .modal-backdrop { animation: modalBackdropFadeIn 0.3s ease-out; backdrop-filter: blur(8px); }
        .modal-content { animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .video-thumbnail:hover { transform: scale(1.05); }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="header-section mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#00E5A8] flex items-center gap-2">
            <Video className="w-8 h-8" /> Learning Videos
          </h1>
          <p className="text-gray-400 mt-2">
            Watch educational videos for {studentStandard}
          </p>
        </div>

        {/* Filter */}
        {videos.length > 0 && (
          <div className="bg-[#111111] rounded-lg shadow-md p-4 sm:p-6 mb-8 border border-gray-800">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-[#080808] border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5A8] transition-all text-white"
            >
              <option value="">All Subjects</option>
              {subjects.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
        )}

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="bg-[#111111] rounded-lg shadow-md p-12 text-center border border-gray-800">
            <Video size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No videos available for your standard yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedVideos).map(([subject, subjectVideos]) => (
              <div key={subject}>
                <h2 className="text-2xl font-bold text-white mb-4 px-2">
                  {subject}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectVideos.map((video, index) => (
                    <div
                      key={video._id}
                      className="video-card bg-[#111111] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-800 hover:border-[#00E5A8]/50 cursor-pointer"
                      style={{'--index': index} as React.CSSProperties}
                      onClick={() => setSelectedVideo(video)}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full h-40 bg-[#080808] overflow-hidden group">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 video-thumbnail"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00E5A8] to-[#00B386]">
                            <Video size={48} className="text-white" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                          <Play size={40} className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        <h3 className="font-bold text-white text-base sm:text-lg line-clamp-2 mb-2">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {video.description || 'No description available'}
                        </p>

                        {/* Video Stats */}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {video.duration && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{formatDuration(video.duration)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>👁️ {video.viewCount || 0}</span>
                          </div>
                        </div>

                        {/* Uploaded By */}
                        <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-2 text-xs text-gray-400">
                          <User size={12} />
                          <span>by {video.uploadedBy?.name || 'Admin'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="modal-content bg-[#111111] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#00E5A8] to-[#00B386] text-white p-4 sm:p-6 flex items-center justify-between z-10">
              <h2 className="text-xl sm:text-2xl font-bold line-clamp-1">{selectedVideo.title}</h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Video Player */}
              <div className="w-full bg-[#080808] rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="500"
                  src={getEmbedUrl(selectedVideo.videoUrl)}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video"
                />
              </div>

              {/* Video Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#080808] rounded-lg p-4 text-center border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Subject</p>
                  <p className="font-bold text-white">{selectedVideo.subject}</p>
                </div>
                <div className="bg-[#080808] rounded-lg p-4 text-center border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Standard</p>
                  <p className="font-bold text-white">{selectedVideo.standard}</p>
                </div>
                <div className="bg-[#00E5A8]/10 rounded-lg p-4 text-center border border-[#00E5A8]/30">
                  <p className="text-xs text-gray-400 mb-1">Duration</p>
                  <p className="font-bold text-white">{formatDuration(selectedVideo.duration)}</p>
                </div>
                <div className="bg-[#080808] rounded-lg p-4 text-center border border-gray-800">
                  <p className="text-xs text-gray-400 mb-1">Views</p>
                  <p className="font-bold text-white">{selectedVideo.viewCount || 0}</p>
                </div>
              </div>

              {/* Description */}
              {selectedVideo.description && (
                <div>
                  <h3 className="font-bold text-white mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed bg-[#080808] p-4 rounded-lg border border-gray-800">
                    {selectedVideo.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[#00E5A8]/20 text-[#00E5A8] px-3 py-1 rounded-full text-sm font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Info */}
              <div className="bg-[#080808] rounded-lg p-4 text-sm text-gray-400 border border-gray-800">
                <p>Uploaded by: <strong className="text-white">{selectedVideo.uploadedBy?.name || 'Admin'}</strong></p>
                <p>Uploaded on: <strong className="text-white">{new Date(selectedVideo.createdAt).toLocaleDateString()}</strong></p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-full bg-[#00E5A8] text-black py-3 rounded-full font-bold hover:bg-[#00E5A8]/90 hover:scale-105 transition-all duration-300"
              >Close Video
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// Wrap with StudentProtectedRoute for security
export default function ProtectedVideosPage() {
  return (
    <StudentProtectedRoute>
      <VideosPage />
    </StudentProtectedRoute>
  );
}

