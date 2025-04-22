import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Crown, MoreHorizontal, Hand, Video, VideoOff, Shield } from 'lucide-react';
import io, { Socket } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'participant' | 'moderator';
  isMuted?: boolean;
  isVideoOff?: boolean;
  isSpeaking?: boolean;
  isHandRaised?: boolean;
  userId?: string;
  joinTime?: Date;
}

interface Enrollment {
  sessionId: string;
  title: string;
  students: { _id: string; name: string; clerkId: string }[];
}

interface UserData {
  role: string;
}

interface ParticipantsListProps {
  channel: string;
  userId: string;
  userRole: 'host' | 'participant';
  onPromoteUser?: (userId: string) => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  channel,
  userId,
  userRole,
  onPromoteUser
}) => {
  const { user } = useUser();
  const clerkId = user?.id;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // 1) Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${clerkId}`);
        const data: UserData = await res.json();
        setUserData(data);
      } catch (e) {
        console.error('Error fetching user details:', e);
      }
    };
    fetchUser();
  }, [clerkId]);

  // 2) Fetch today's enrollments (teachers only)
  useEffect(() => {
    if (!clerkId || userData?.role !== 'teacher') return;
    fetch('http://localhost:5000/api/sessions/today-enrollments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-clerk-user-id': clerkId
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: Enrollment[]) => setEnrollments(data))
      .catch(err => console.error('[Fetch enrollments error]', err));
  }, [clerkId, userData]);

  // 3) Socket.io connection
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      s.emit('join-room', {
        room: channel,
        username: user?.fullName || user?.username || 'Anonymous',
        userId
      });
    });
    s.on('connect_error', () => setIsConnected(false));

    s.on('participants-update', (updated: any[]) => {
      setParticipants(updated.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        userId: p.userId,
        joinTime: p.joinTime,
        isMuted: false,
        isVideoOff: false,
        isSpeaking: false,
        isHandRaised: false
      })));
    });

    s.on('hand-raised', ({ userId: uid, isRaised }) => {
      setParticipants(prev =>
        prev.map(p => p.userId === uid ? { ...p, isHandRaised: isRaised } : p)
      );
    });
    s.on('audio-state-change', ({ userId: uid, isMuted }) => {
      setParticipants(prev =>
        prev.map(p => p.userId === uid ? { ...p, isMuted } : p)
      );
    });
    s.on('video-state-change', ({ userId: uid, isVideoOff }) => {
      setParticipants(prev =>
        prev.map(p => p.userId === uid ? { ...p, isVideoOff } : p)
      );
    });

    return () => {
      s.disconnect();
    };
  }, [channel, user, userId]);

  // Promote handler
  const handlePromoteUser = () => {
    if (!selectedParticipant) return;
    onPromoteUser?.(selectedParticipant.userId || selectedParticipant.id);
    setParticipants(prev =>
      prev.map(p =>
        p.id === selectedParticipant.id ? { ...p, role: 'host' } : p
      )
    );
    socket?.emit('promote-participant', {
      room: channel,
      participantId: selectedParticipant.userId || selectedParticipant.id,
      newRole: 'host'
    });
    setShowPromoteDialog(false);
    setSelectedParticipant(null);
  };

  // Remove handler (kick via REST)
  const handleRemoveParticipant = async () => {
    if (!selectedParticipant || !clerkId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/rooms/${encodeURIComponent(channel)}/kick`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': clerkId
          },
          body: JSON.stringify({
            hostClerkId: clerkId,
            targetClerkId: selectedParticipant.userId
          })
        }
      );
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || `Status ${res.status}`);
      }
      setParticipants(prev =>
        prev.filter(p => p.id !== selectedParticipant.id)
      );
    } catch (err) {
      console.error('Failed to kick participant:', err);
    } finally {
      setShowRemoveDialog(false);
      setSelectedParticipant(null);
    }
  };

  const canManageParticipants = userRole === 'host';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Participants ({participants.length})
          </h3>
          <Badge variant={isConnected ? "outline" : "destructive"} className="h-6">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Students Enrolled Today (teachers only) */}
      {userData?.role === 'teacher' && (
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">
            Students Enrolled for Session:
          </h3>
          {enrollments.length === 0 ? (
            <div className="text-muted-foreground">
              No students enrolled
            </div>
          ) : (
            enrollments.map(session => (
              <div key={session.sessionId} className="mb-4">
                <ul className="list-disc list-inside ml-4">
                  {session.students.map(s => (
                    <li key={s._id}>{s.name}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* Main Participants ScrollArea */}
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-2">
          {participants.length === 0 ? (
            <div className="text-center text-muted-foreground my-4">
              No participants yet
            </div>
          ) : (
            <>
              {/* Hosts */}
              {participants.filter(p => p.role === 'host').map(participant => (
                <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} />
                      <AvatarFallback>{participant.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.name}</span>
                        <Crown size={14} className="text-amber-500" />
                        {participant.userId === userId && (
                          <Badge variant="secondary" className="text-xs h-5">
                            You
                          </Badge>
                        )}
                        {participant.isHandRaised && <Hand size={14} className="text-yellow-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">Host</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.isMuted ? <MicOff size={16} className="text-destructive" /> : <Mic size={16} className={participant.isSpeaking ? 'text-green-500' : 'text-muted-foreground'} />}
                    {participant.isVideoOff ? <VideoOff size={16} className="text-destructive" /> : <Video size={16} className="text-muted-foreground" />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Send private message</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Moderators */}
              {participants.filter(p => p.role === 'moderator').map(participant => (
                <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} />
                      <AvatarFallback>{participant.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.name}</span>
                        <Shield size={14} className="text-blue-500" />
                        {participant.userId === userId && (
                          <Badge variant="secondary" className="text-xs h-5">
                            You
                          </Badge>
                        )}
                        {participant.isHandRaised && <Hand size={14} className="text-yellow-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">Moderator</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.isMuted ? <MicOff size={16} className="text-destructive" /> : <Mic size={16} className={participant.isSpeaking ? 'text-green-500' : 'text-muted-foreground'} />}
                    {participant.isVideoOff ? <VideoOff size={16} className="text-destructive" /> : <Video size={16} className="text-muted-foreground" />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Send private message</DropdownMenuItem>
                        {canManageParticipants && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSelectedParticipant(participant); setShowPromoteDialog(true); }}>
                              Promote to host
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedParticipant(participant); setShowRemoveDialog(true); }}>
                              Remove from session
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Participants */}
              {participants.filter(p => p.role === 'participant').map(participant => (
                <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} />
                      <AvatarFallback>{participant.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{participant.name}</span>
                        {participant.userId === userId && (
                          <Badge variant="secondary" className="text-xs h-5">
                            You
                          </Badge>
                        )}
                        {participant.isHandRaised && <Hand size={14} className="text-yellow-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">Participant</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {participant.isMuted ? <MicOff size={16} className="text-destructive" /> : <Mic size={16} className={participant.isSpeaking ? 'text-green-500' : 'text-muted-foreground'} />}
                    {participant.isVideoOff ? <VideoOff size={16} className="text-destructive" /> : <Video size={16} className="text-muted-foreground" />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Send private message</DropdownMenuItem>
                        {canManageParticipants && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => { setSelectedParticipant(participant); setShowPromoteDialog(true); }}>
                                    Promote to host
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Make moderator</DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedParticipant(participant); setShowRemoveDialog(true); }}>
                              Remove from session
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Promote Dialog */}
      <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {selectedParticipant?.name} to host? They will have full control over the session.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromoteUser}>Promote to Host</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Participant</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedParticipant?.name} from the session? They will not be able to rejoin without a new invitation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveParticipant}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParticipantsList;
