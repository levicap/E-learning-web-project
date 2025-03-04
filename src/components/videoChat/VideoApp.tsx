





import React, { useState, useEffect } from 'react';
import VideoChat from './VideoChat';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Users, MessageSquare, FileText, Presentation } from 'lucide-react';

function VoiceChatApp() {
  const { user, isLoaded } = useUser();
  const [inRoom, setInRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [persistedState, setPersistedState] = useState<{inRoom: boolean, roomName: string} | null>(null);

  // Load persisted state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('voiceChatState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setPersistedState(parsedState);
    }
  }, []);

  // Apply persisted state once user is loaded
  useEffect(() => {
    if (isLoaded && user && persistedState) {
      setInRoom(persistedState.inRoom);
      setRoomName(persistedState.roomName);
    }
  }, [isLoaded, user, persistedState]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isLoaded && user) {
      localStorage.setItem('voiceChatState', JSON.stringify({ inRoom, roomName }));
    }
  }, [inRoom, roomName, isLoaded, user]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName && user) {
      setInRoom(true);
    }
  };

  const handleLeaveRoom = () => {
    setInRoom(false);
    setRoomName('');
    localStorage.removeItem('voiceChatState');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-background">
      {!inRoom ? (
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-none shadow-md">
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center">Join Live Session</CardTitle>
                <CardDescription className="text-center">
                  Connect with instructors and peers in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Name</Label>
                    <Input
                      id="room"
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="Enter a room name"
                      className="w-full"
                      required
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img 
                          src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || user?.username}`} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{user?.fullName || user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  onClick={handleJoinRoom}
                >
                  Join Session
                </Button>
              </CardFooter>
            </Card>

            <div className="mt-8 space-y-4">
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Interactive Learning</h3>
                      <p className="text-sm text-muted-foreground">
                        Join live sessions with instructors and peers for interactive learning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Presentation className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Screen Sharing</h3>
                      <p className="text-sm text-muted-foreground">
                        Share your screen to present slides, demos, or code examples.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Collaborative Whiteboard</h3>
                      <p className="text-sm text-muted-foreground">
                        Use the whiteboard to explain concepts and collaborate in real-time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <VideoChat
          channel={roomName}
          onLeave={handleLeaveRoom}
          username={user?.fullName || user?.username || 'Anonymous'}
          userId={user?.id || ''}
        />
      )}
    </div>
  );
}

export default function VideoApp() {
  return <VoiceChatApp />;
}