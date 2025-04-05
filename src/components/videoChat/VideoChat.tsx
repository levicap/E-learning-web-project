







import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IScreenVideoTrack } from 'agora-rtc-sdk-ng';
import { Camera, CameraOff, Mic, MicOff, UserMinus, UserPlus, MessageSquare, Users, X, Settings, ScreenShare, PhoneOff, Maximize, Minimize, Hand, Hand as HandOff, FileText, Video, Clock, Download } from 'lucide-react';
import axios from 'axios';
import Chat from './Chat';
import ParticipantsList from './ParticipantsList';
import Whiteboard from './Whiteboard';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VideoChatProps {
  channel: string;
  onLeave: () => void;
  username: string;
  userId: string;
}

const AGORA_APP_ID = '6e95e9bc2f2644fc97950ea2d9f6aee3';

const VideoChat: React.FC<VideoChatProps> = ({ channel, onLeave, username, userId }) => {
  const { user } = useUser();
  const [localTracks, setLocalTracks] = useState<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
    screenTrack: IScreenVideoTrack | null;
  }>({
    audioTrack: null,
    videoTrack: null,
    screenTrack: null
  });
  const [remoteUsers, setRemoteUsers] = useState<{ uid: string; videoTrack: ICameraVideoTrack; audioTrack: IMicrophoneAudioTrack; isScreenShare?: boolean; username?: string; role?: string }[]>([]);
  const [micMuted, setMicMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showSelfView, setShowSelfView] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'focus'>('grid');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'whiteboard'| null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDialog, setRecordingDialog] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [userRole, setUserRole] = useState<'host' | 'participant'>('participant');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  const rtcClient = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        await axios.post('http://localhost:5000/api/rooms', {
          name: channel,
          type: 'live-session'
        });
        setSessionStartTime(new Date());
      } catch (error) {
        console.error('Failed to create room:', error);
        setError('Failed to create room. Please try again.');
      }
    };

    initializeSession();
  }, [channel]);

  useEffect(() => {
    const initAgoraClient = async () => {
      rtcClient.current = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8',
        role: 'host'
      });

      try {
        const uid = Math.floor(Math.random() * 10000);
        
        // Join channel directly with App ID
        await rtcClient.current.join(AGORA_APP_ID, channel, null, uid);
        
        // Create audio and video tracks
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: {
            sampleRate: 48000,
            stereo: true,
            bitrate: 128
          }
        });
        
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 360,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          }
        });

        // Set initial states
        audioTrack.setEnabled(!micMuted);
        videoTrack.setEnabled(videoEnabled);
        
        // Publish tracks to channel
        await rtcClient.current.publish([audioTrack, videoTrack]);
        setLocalTracks({
          audioTrack,
          videoTrack,
          screenTrack: null
        });
        setIsConnected(true);

        // Set user as host if they're the first to join
        if (rtcClient.current.remoteUsers.length === 0) {
          setUserRole('host');
        }

        if (localVideoRef.current && videoEnabled) {
          videoTrack.play(localVideoRef.current);
        }

        // Handle remote users
        rtcClient.current.on('user-published', async (user, mediaType) => {
          await rtcClient.current!.subscribe(user, mediaType);
          
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
          
          if (mediaType === 'video' && user.videoTrack) {
            // Check if this is a screen share
            const isScreenShare = user.videoTrack.getMediaStreamTrack().label.includes('screen') || 
                                 user.videoTrack.getMediaStreamTrack().label.includes('display');
            
            // Update remote users state
            setRemoteUsers(prev => {
              // Check if user already exists
              const existingUserIndex = prev.findIndex(p => p.uid === user.uid.toString());
              
              if (existingUserIndex >= 0) {
                // Update existing user
                const updatedUsers = [...prev];
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  videoTrack: user.videoTrack!,
                  isScreenShare: isScreenShare
                };
                return updatedUsers;
              } else {
                // Add new user
                return [...prev, {
                  uid: user.uid.toString(),
                  videoTrack: user.videoTrack!,
                  audioTrack: user.audioTrack!,
                  isScreenShare: isScreenShare,
                  username: `User ${user.uid.toString().slice(0, 4)}`,
                  role: 'participant'
                }];
              }
            });
            
            // Play the video track immediately if the ref exists
            const refElement = remoteVideoRefs.current[user.uid.toString()];
            if (refElement) {
              user.videoTrack.play(refElement);
            }
          }
        });

        rtcClient.current.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            // Update state to reflect that the user's video is no longer available
            setRemoteUsers(prev => {
              const existingUserIndex = prev.findIndex(p => p.uid === user.uid.toString());
              
              if (existingUserIndex >= 0 && user.hasAudio) {
                // Keep the user in the list but update their state
                const updatedUsers = [...prev];
                // We're setting videoTrack to null, but TypeScript won't allow this
                // This is a workaround - in the UI we'll check if the track exists
                return updatedUsers;
              } else {
                // Remove the user completely if they have no audio either
                return prev.filter(u => u.uid !== user.uid.toString());
              }
            });
          } else if (mediaType === 'audio') {
            // Handle audio unpublish if needed
          }
        });

        // Handle user leaving
        rtcClient.current.on('user-left', (user) => {
          setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid.toString()));
        });

        rtcClient.current.on('exception', (event) => {
          console.warn('Agora exception:', event);
          setError(`Connection issue: ${event.code}`);
        });

      } catch (error) {
        console.error('Failed to initialize Agora client:', error);
        setIsConnected(false);
        setError('Failed to connect to video chat. Please try again.');
      }
    };

    initAgoraClient();

    return () => {
      // Clean up resources
      localTracks.audioTrack?.close();
      localTracks.videoTrack?.close();
      localTracks.screenTrack?.close();
      rtcClient.current?.leave();
      
      // Clear recording timer if active
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [channel]);

  // Effect to play remote video tracks when refs are updated
  useEffect(() => {
    remoteUsers.forEach(user => {
      const refElement = remoteVideoRefs.current[user.uid];
      if (refElement && user.videoTrack) {
        // Stop any existing playback first to prevent duplicates
        user.videoTrack.stop();
        // Play the video track in the ref element
        user.videoTrack.play(refElement);
      }
    });
  }, [remoteUsers]);

  // Effect to handle recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const toggleMic = async () => {
    if (localTracks.audioTrack) {
      const newMutedState = !micMuted;
      await localTracks.audioTrack.setEnabled(!newMutedState);
      setMicMuted(newMutedState);
    }
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      const newVideoState = !videoEnabled;
      await localTracks.videoTrack.setEnabled(newVideoState);
      setVideoEnabled(newVideoState);

      if (newVideoState && localVideoRef.current) {
        localTracks.videoTrack.play(localVideoRef.current);
      }
      
      // Re-publish video track to ensure other participants can see the change
      if (rtcClient.current) {
        if (newVideoState) {
          await rtcClient.current.unpublish([localTracks.videoTrack]);
          await rtcClient.current.publish([localTracks.videoTrack]);
        }
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (localTracks.screenTrack) {
        await rtcClient.current?.unpublish(localTracks.screenTrack);
        localTracks.screenTrack.close();
        
        // Re-enable camera if it was disabled
        if (localTracks.videoTrack) {
          await localTracks.videoTrack.setEnabled(true);
          setVideoEnabled(true);
          if (localVideoRef.current) {
            localTracks.videoTrack.play(localVideoRef.current);
          }
          await rtcClient.current?.publish([localTracks.videoTrack]);
        }
        
        setLocalTracks(prev => ({
          ...prev,
          screenTrack: null
        }));
        setIsScreenSharing(false);
      }
    } else {
      // Start screen sharing
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 15,
            bitrateMin: 600,
            bitrateMax: 2000
          }
        }, "auto");
        
        // If camera is enabled, disable it while screen sharing
        if (localTracks.videoTrack) {
          await localTracks.videoTrack.setEnabled(false);
          setVideoEnabled(false);
          await rtcClient.current?.unpublish([localTracks.videoTrack]);
        }
        
        // Publish screen track
        await rtcClient.current?.publish(screenTrack);
        
        setLocalTracks(prev => ({
          ...prev,
          screenTrack: Array.isArray(screenTrack) ? screenTrack[0] : screenTrack
        }));
        
        setIsScreenSharing(true);
        
        // Handle screen share stopped by user through browser UI
        screenTrack.on('track-ended', async () => {
          await toggleScreenShare();
        });
        
      } catch (error) {
        console.error('Error sharing screen:', error);
        setError('Failed to share screen. Please try again.');
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullScreen(true))
          .catch(err => {
            setError(`Error attempting to enable fullscreen: ${err.message}`);
          });
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullScreen(false))
          .catch(err => {
            setError(`Error attempting to exit fullscreen: ${err.message}`);
          });
      }
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // Emit hand raise event to other participants
    // This would require socket implementation
  };

  const handleLeave = async () => {
    try {
      // If recording is active, stop it first
      if (isRecording) {
        await stopRecording();
      }
      
      localTracks.audioTrack?.close();
      localTracks.videoTrack?.close();
      localTracks.screenTrack?.close();
      await rtcClient.current?.leave();

      await axios.delete(`http://localhost:5000/api/rooms/${channel}`);
      
      onLeave();
    } catch (error) {
      console.error('Error leaving room:', error);
      setError('Error leaving room. Please try again.');
    }
  };

  const toggleSidebar = (tab: 'chat' | 'participants' | 'whiteboard' ) => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
    }
  };

  // Function to set remote video ref
  const setRemoteVideoRef = (uid: string, element: HTMLDivElement | null) => {
    remoteVideoRefs.current[uid] = element;
    
    // If we have the element and the user, play the video
    const user = remoteUsers.find(u => u.uid === uid);
    if (element && user && user.videoTrack) {
      user.videoTrack.play(element);
    }
  };

  const startRecording = async () => {
    if (!recordingName.trim()) {
      setError('Please enter a name for the recording');
      return;
    }
    
    try {
      // In a real implementation, this would call a backend API to start cloud recording
      // For now, we'll just simulate it
      setIsRecording(true);
      setRecordingDialog(false);
      
      // In a real implementation, you would store the recording ID returned from the API
      const mockRecordingResponse = {
        recordingId: `rec-${Date.now()}`,
        status: 'recording'
      };
      
      console.log('Started recording:', mockRecordingResponse);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      // In a real implementation, this would call a backend API to stop cloud recording
      // For now, we'll just simulate it
      setIsRecording(false);
      
      // In a real implementation, you would use the stored recording ID
      const mockStopResponse = {
        status: 'stopped',
        recordingUrl: 'https://example.com/recordings/123'
      };
      
      console.log('Stopped recording:', mockStopResponse);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError('Failed to stop recording. Please try again.');
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const getSessionDuration = () => {
    if (!sessionStartTime) return '00:00:00';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    return formatRecordingTime(diffInSeconds);
  };

  return (
    <div ref={containerRef} className={cn(
      "h-screen flex flex-col bg-background",
      isFullScreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Session: {channel}</h2>
            <Badge variant={isConnected ? "success" : "destructive"} className="h-6">
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="h-6 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white"></span>
                Recording {formatRecordingTime(recordingTime)}
              </Badge>
            )}
            {isHandRaised && (
              <Badge variant="warning" className="h-6 bg-yellow-500">
                Hand Raised
              </Badge>
            )}
            <Badge variant="outline" className="h-6">
              <Clock className="h-3 w-3 mr-1" /> {getSessionDuration()}
            </Badge>
            <Badge variant="secondary" className="h-6">
              {userRole === 'host' ? 'Host' : 'Participant'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setLayout(layout === 'grid' ? 'focus' : 'grid')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Layout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleLeave}
              className="gap-1"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Leave</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 overflow-auto p-4">
          {/* {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )} */}

          <div className={cn(
            "grid gap-4 h-full",
            layout === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {/* Screen share takes priority in display */}
            {isScreenSharing && (
              <div className="col-span-full aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white">You are sharing your screen</p>
                </div>
                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
                  Screen Share
                </div>
              </div>
            )}

            {/* Remote screen shares take priority */}
            {remoteUsers.filter(user => user.isScreenShare).map(user => (
              <div 
                key={`screen-${user.uid}`}
                className="col-span-full aspect-video bg-black rounded-lg overflow-hidden shadow-md"
              >
                <div
                  className="w-full h-full"
                  ref={(el) => setRemoteVideoRef(user.uid, el)}
                />
                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium">
                  Screen Share from {user.username || `User ${user.uid.slice(0, 4)}`}
                </div>
              </div>
            ))}

            {/* Local video */}
            {showSelfView && !isScreenSharing && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md">
                <div 
                  ref={localVideoRef}
                  className="w-full h-full"
                />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <CameraOff size={48} className="text-muted-foreground opacity-50" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                  <span>You</span>
                  {micMuted && <MicOff size={14} className="text-destructive" />}
                  {isHandRaised && <Hand size={14} className="text-yellow-500" />}
                  {userRole === 'host' && (
                    <Badge variant="secondary" className="h-5 text-xs ml-1">Host</Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Remote videos (excluding screen shares which are shown above) */}
            {remoteUsers.filter(user => !user.isScreenShare).map(user => (
              <div 
                key={user.uid}
                className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-md"
              >
                <div
                  className="w-full h-full"
                  ref={(el) => setRemoteVideoRef(user.uid, el)}
                />
                <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5">
                  <span>{user.username || `User ${user.uid.slice(0, 4)}`}</span>
                  {user.role === 'host' && (
                    <Badge variant="secondary" className="h-5 text-xs ml-1">Host</Badge>
                  )}
                </div>
              </div>
            ))}
            
            {remoteUsers.length === 0 && !showSelfView && !isScreenSharing && (
              <div className="col-span-full flex items-center justify-center h-64 bg-muted rounded-lg">
                <p className="text-muted-foreground">No participants with video enabled</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {activeTab && (
          <div className="w-80 border-l bg-card/50 backdrop-blur-sm">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="w-full">
                {activeTab === 'chat' && <TabsTrigger value="chat">Chat</TabsTrigger>}
                {activeTab === 'participants' && <TabsTrigger value="participants">Participants</TabsTrigger>}
                {activeTab === 'whiteboard' && <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>}
               
              </TabsList>
              
              <TabsContent value="chat" className="h-[calc(100vh-12rem)]">
                <Chat channel={channel} username={username} userId={userId} />
              </TabsContent>
              
              <TabsContent value="participants" className="h-[calc(100vh-12rem)]">
                <ParticipantsList 
                  channel={channel} 
                  userId={userId} 
                  userRole={userRole}
                  onPromoteUser={(uid) => {
                    // In a real implementation, this would update the user's role on the server
                    setRemoteUsers(prev => 
                      prev.map(user => 
                        user.uid === uid 
                          ? { ...user, role: 'host' } 
                          : user
                      )
                    );
                  }}
                />
              </TabsContent>
              
              <TabsContent value="whiteboard" className="h-[calc(100vh-12rem)]">
                <Whiteboard roomId={channel} userId={userId} />
              </TabsContent>

            
            </Tabs>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t bg-card/80 backdrop-blur-sm py-3">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={micMuted ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleMic}
                    className="h-12 w-12 rounded-full"
                  >
                    {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{micMuted ? "Unmute" : "Mute"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={!videoEnabled ? "destructive" : "secondary"}
                    size="icon"
                    onClick={toggleVideo}
                    className="h-12 w-12 rounded-full"
                    disabled={isScreenSharing}
                  >
                    {!videoEnabled ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{videoEnabled ? "Turn off camera" : "Turn on camera"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-8 mx-2" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="icon"
                    onClick={toggleScreenShare}
                    className="h-10 w-10"
                  >
                    <ScreenShare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isScreenSharing ? "Stop sharing" : "Share screen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isHandRaised ? "default" : "outline"}
                    size="icon"
                    onClick={toggleHandRaise}
                    className="h-10 w-10"
                  >
                    {isHandRaised ? <HandOff className="h-5 w-5" /> : <Hand className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isHandRaised ? "Lower hand" : "Raise hand"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isFullScreen ? "default" : "outline"}
                    size="icon"
                    onClick={toggleFullScreen}
                    className="h-10 w-10"
                  >
                    {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {userRole === 'host' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="icon"
                      onClick={isRecording ? stopRecording : () => setRecordingDialog(true)}
                      className="h-10 w-10"
                    >
                      <Video className={cn("h-5 w-5", isRecording && "animate-pulse")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRecording ? "Stop recording" : "Start recording"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Separator orientation="vertical" className="h-8 mx-2" />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === 'chat' ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar('chat')}
                    className="h-10 w-10"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === 'chat' ? "Hide chat" : "Show chat"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === 'participants' ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar('participants')}
                    className="h-10 w-10"
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === 'participants' ? "Hide participants" : "Show participants"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === 'whiteboard' ? "default" : "outline"}
                    size="icon"
                    onClick={() => toggleSidebar('whiteboard')}
                    className="h-10 w-10"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{activeTab === 'whiteboard' ? "Hide whiteboard" : "Show whiteboard"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          
          </div>
        </div>
      </div>

      {/* Recording Dialog */}
      <Dialog open={recordingDialog} onOpenChange={setRecordingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Recording</DialogTitle>
            <DialogDescription>
              This will record the session for later viewing. All participants will be notified.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recording-name">Recording Name</Label>
              <Input
                id="recording-name"
                placeholder="Enter a name for this recording"
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-md text-sm">
              <p className="font-medium mb-1">Note:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>Recording will be available to all course participants</li>
                <li>You can stop recording at any time</li>
                <li>Processing may take a few minutes after recording stops</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordingDialog(false)}>Cancel</Button>
            <Button onClick={startRecording} disabled={!recordingName.trim()}>
              Start Recording
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoChat;