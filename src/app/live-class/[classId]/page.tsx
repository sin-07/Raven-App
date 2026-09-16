'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, AlertCircle, Loader as LoaderIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { StudentProtectedRoute } from '@/components';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface LiveClassData {
  _id: string;
  title: string;
  subject: string;
  class: string;
  teacherName: string;
  roomName: string;
  isRecordingEnabled?: boolean;
}

interface UserInfo {
  name: string;
  email: string;
}

function LiveClassPage() {
  const { classId } = useParams();
  const router = useRouter();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const [liveClass, setLiveClass] = useState<LiveClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    initializeLiveClass();

    return () => {
      // Cleanup Jitsi on unmount
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [classId]);

  const initializeLiveClass = async () => {
    try {
      // Check student authentication first
      const studentRes = await fetch('/api/auth/verify', {
        credentials: 'include'
      });

      let user: UserInfo | null = null;
      let isTeacher = false;

      if (studentRes.ok) {
        const { student: studentData } = await studentRes.json();
        user = { 
          name: studentData.studentName || 'Student', 
          email: studentData.email 
        };
      } else {
        // Check admin authentication
        const adminRes = await fetch('/api/admin/verify', {
          credentials: 'include'
        });
        
        if (adminRes.ok) {
          const { admin: adminData } = await adminRes.json();
          user = { 
            name: adminData.name || adminData.email || 'Teacher', 
            email: adminData.email 
          };
          isTeacher = true;
          setIsModerator(true);
        }
      }

      if (!user) {
        toast.error('Please login to join the class');
        router.push('/login');
        return;
      }

      setUserInfo(user);

      // Fetch class details - try admin endpoint first, then student
      let classData: LiveClassData | null = null;
      try {
        const response = await fetch(`/api/admin/live-classes/${classId}`);
        const data = await response.json();
        classData = data.data;
      } catch (adminError) {
        try {
          const response = await fetch(`/api/student/live-classes/${classId}`);
          const data = await response.json();
          classData = data.data;
        } catch (studentError) {
          throw new Error('Unable to fetch class details');
        }
      }

      if (!classData) {
        throw new Error('Live class not found');
      }

      setLiveClass(classData);

      // Record student joining (if student)
      if (!isTeacher) {
        try {
          await fetch(`/api/student/live-classes/${classId}/join`, {
            method: 'POST',
          });
        } catch (err) {
          console.error('Error recording join:', err);
        }
      }

      // Initialize Jitsi
      loadJitsi(classData, user, isTeacher);
    } catch (err: any) {
      console.error('Initialize error:', err);
      setError(err.message || 'Failed to load live class');
      toast.error(err.message || 'Failed to load live class');
    } finally {
      setLoading(false);
    }
  };

  const loadJitsi = (classData: LiveClassData, user: UserInfo, isTeacher: boolean) => {
    // Load Jitsi Meet External API script
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi(classData, user, isTeacher);
      script.onerror = () => {
        setError('Failed to load Jitsi Meet. Please check your internet connection.');
        toast.error('Failed to load video conferencing');
      };
      document.body.appendChild(script);
    } else {
      initializeJitsi(classData, user, isTeacher);
    }
  };

  const initializeJitsi = (classData: LiveClassData, user: UserInfo, isTeacher: boolean) => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: classData.roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: true,
        disableDeepLinking: true,
        defaultLanguage: 'en',
        enableNoisyMicDetection: true,
        resolution: 720,
        constraints: {
          video: {
            height: { ideal: 720, max: 1080, min: 360 }
          }
        },
        // Disable recording for non-moderators
        disableRecording: !classData.isRecordingEnabled,
        // Enable all features
        toolbarButtons: [
          'camera',
          'chat',
          'closedcaptions',
          'desktop',
          'download',
          'embedmeeting',
          'etherpad',
          'feedback',
          'filmstrip',
          'fullscreen',
          'hangup',
          'help',
          'highlight',
          'invite',
          'linktosalesforce',
          'livestreaming',
          'microphone',
          'noisesuppression',
          'participants-pane',
          'profile',
          'raisehand',
          'recording',
          'security',
          'select-background',
          'settings',
          'shareaudio',
          'sharedvideo',
          'shortcuts',
          'stats',
          'tileview',
          'toggle-camera',
          'videoquality',
          'whiteboard'
        ]
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        DEFAULT_BACKGROUND: '#474747',
        DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
        DEFAULT_LOCAL_DISPLAY_NAME: user.name,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        DISABLE_PRESENCE_STATUS: false,
        DISPLAY_WELCOME_PAGE_CONTENT: true,
        ENABLE_DIAL_OUT: false,
        FILM_STRIP_MAX_HEIGHT: 120,
        MOBILE_APP_PROMO: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        TOOLBAR_ALWAYS_VISIBLE: false,
        VERTICAL_FILMSTRIP: true
      },
      userInfo: {
        displayName: user.name,
        email: user.email
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;

    // Event listeners
    api.addEventListener('videoConferenceJoined', () => {
      console.log('User joined conference');
      toast.success(`Welcome to ${classData.title}!`);

      // Set moderator privileges for teacher
      if (isTeacher) {
        api.executeCommand('toggleLobby', false); // Disable lobby
      }
    });

    api.addEventListener('videoConferenceLeft', () => {
      console.log('User left conference');
      handleLeaveClass();
    });

    api.addEventListener('readyToClose', () => {
      handleLeaveClass();
    });

    api.addEventListener('participantJoined', (participant: any) => {
      console.log('Participant joined:', participant);
    });

    api.addEventListener('participantLeft', (participant: any) => {
      console.log('Participant left:', participant);
    });

    // Error handling
    api.addEventListener('errorOccurred', (error: any) => {
      console.error('Jitsi error:', error);
      toast.error('An error occurred in the video conference');
    });
  };

  const handleLeaveClass = async () => {
    try {
      // Record student leaving
      if (userInfo && !isModerator) {
        await fetch(`/api/student/live-classes/${classId}/leave`, {
          method: 'POST',
        });
      }
    } catch (err) {
      console.error('Error recording leave:', err);
    } finally {
      router.push(isModerator ? '/admin/dashboard' : '/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center p-4">
        <div className="bg-[#111111] rounded-lg p-8 max-w-md w-full text-center border border-gray-800">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Class</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push(isModerator ? '/admin/dashboard' : '/dashboard')}
            className="bg-[#00E5A8] hover:bg-[#00E5A8]/90 hover:scale-105 text-black px-6 py-2 rounded-full transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-[#0b0b0b] overflow-hidden">
      {/* Green Radial Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_rgba(0,229,168,0.2)_0%,_rgba(0,229,168,0.1)_30%,_transparent_70%)]"></div>
      </div>

      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-[#080808] bg-opacity-95 text-white p-4 z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-[#00E5A8]" />
            <div>
              <h1 className="font-bold text-lg">{liveClass?.title}</h1>
              <p className="text-sm text-gray-400">
                {liveClass?.subject} • {liveClass?.class} • Teacher: {liveClass?.teacherName}
              </p>
            </div>
          </div>
          {isModerator && (
            <span className="bg-[#00E5A8] text-black px-3 py-1 rounded-full text-sm font-semibold">
              Moderator
            </span>
          )}
        </div>
      </div>

      {/* Jitsi Container */}
      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full"
        style={{ paddingTop: '64px' }}
      />

      {/* Instructions Overlay (appears briefly) */}
      <style>{`
        #jitsiConferenceFrame0 {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
}

// Wrap with StudentProtectedRoute for security
export default function ProtectedLiveClassPage() {
  return (
    <StudentProtectedRoute>
      <LiveClassPage />
    </StudentProtectedRoute>
  );
}

