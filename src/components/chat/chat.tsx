import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import EmojiPicker from 'emoji-picker-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  Send,
  PaperclipIcon,
  Video,
  FileText,
  MessageSquare,
  User,
  Smile,
  Image as ImageIcon,
  Code,
  UserPlus,
  Circle,
  Link as LinkIcon,
  X,
  Upload,
  Search
} from "lucide-react";

interface Message {
  id: number;
  sender: string;
  content: string;
  avatar: string;
  timestamp: string;
  isCurrentUser: boolean;
  type?: 'text' | 'image' | 'code' | 'file';
  attachment?: {
    url?: string;
    name?: string;
    size?: string;
    content?: string;
  };
}

interface ChatRoom {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  unread: number;
  online: boolean;
  type: 'individual' | 'group';
  members?: number;
}

interface FileUpload {
  id: string;
  name: string;
  size: number;
  progress: number;
  type: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: string;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "Prof. Sarah Wilson",
      content: "Hi everyone! Let's discuss the upcoming project presentation. 📚",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      timestamp: "9:30 AM",
      isCurrentUser: false,
      type: 'text'
    },
    {
      id: 2,
      sender: "You",
      content: "I've completed the research section. Would love some feedback! 🎯",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      timestamp: "9:32 AM",
      isCurrentUser: true,
      type: 'text'
    },
    {
      id: 3,
      sender: "David Chen",
      content: "Here's the diagram we discussed:",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      timestamp: "9:35 AM",
      isCurrentUser: false,
      type: 'image',
      attachment: {
        url: "https://images.unsplash.com/photo-1611348586804-61bf6c080437",
        name: "research_diagram.png"
      }
    },
    {
      id: 4,
      sender: "David Chen",
      content: "And here's the sample code:",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      timestamp: "9:36 AM",
      isCurrentUser: false,
      type: 'code',
      attachment: {
        name: "example.py",
        content: "def calculate_average(numbers):\n    return sum(numbers) / len(numbers)"
      }
    }
  ]);

  const [chatRooms] = useState<ChatRoom[]>([
    {
      id: 1,
      name: "Advanced Mathematics Group",
      avatar: "https://images.unsplash.com/photo-1509869175650-a1d97972541a",
      lastMessage: "Let's solve those equations! 📐",
      unread: 3,
      online: true,
      type: 'group',
      members: 28
    },
    {
      id: 2,
      name: "Prof. Sarah Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      lastMessage: "Your last assignment was excellent ⭐",
      unread: 1,
      online: true,
      type: 'individual'
    },
    {
      id: 3,
      name: "Study Group 101",
      avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      lastMessage: "Meeting tomorrow at 3 PM 📅",
      unread: 0,
      online: true,
      type: 'group',
      members: 15
    }
  ]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(chatRooms[0]);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [chatType, setChatType] = useState<'individual' | 'group'>('individual');
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [showFileList, setShowFileList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const contacts: Contact[] = [
    {
      id: 1,
      name: "Dr. Emily Parker",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      email: "emily.parker@university.edu",
      role: "Professor"
    },
    {
      id: 2,
      name: "Michael Chang",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      email: "m.chang@university.edu",
      role: "Teaching Assistant"
    },
    {
      id: 3,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      email: "s.johnson@university.edu",
      role: "Student"
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        progress: 0,
        type: file.type
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setShowFileList(true);

      // Simulate upload progress
      newFiles.forEach(file => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, progress: Math.min(progress, 100) } : f
            )
          );
          if (progress >= 100) clearInterval(interval);
        }, 500);
      });
    }
  });

  return (
    <div className="h-screen w-full bg-background p-4 flex items-center justify-center mt-9">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-6xl h-[800px] flex">
          {/* Sidebar */}
          <div className="w-80 border-r">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Hub Chat
              </CardTitle>
              <div className="flex justify-between items-center mt-2">
                <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Chat</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Chat Type</Label>
                        <RadioGroup
                          defaultValue="individual"
                          onValueChange={(value) => setChatType(value as 'individual' | 'group')}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual">Individual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="group" id="group" />
                            <Label htmlFor="group">Group</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Search Contacts</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      </div>

                      <ScrollArea className="h-[200px] border rounded-md p-2">
                        <div className="space-y-2">
                          {filteredContacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                            >
                              <Avatar>
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                              <Badge variant="secondary">{contact.role}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {chatType === 'group' && (
                        <div className="space-y-2">
                          <Label>Group Name</Label>
                          <Input placeholder="Enter group name..." />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
                        Cancel
                      </Button>
                      <Button>Create Chat</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Circle className="h-3 w-3 fill-green-500 text-green-500 mr-2" />
                        Online
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You are online</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <Tabs defaultValue="all" className="px-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="direct" className="flex-1">Direct</TabsTrigger>
                <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-[650px] py-4">
                <AnimatePresence>
                  {chatRooms.map((room) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedRoom(room)}
                      className={`flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer mb-2 ${
                        selectedRoom.id === room.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={room.avatar} />
                          <AvatarFallback>
                            {room.type === 'group' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        {room.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold">{room.name}</h4>
                          {room.unread > 0 && (
                            <Badge variant="default" className="ml-2">
                              {room.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {room.lastMessage}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedRoom.avatar} />
                    <AvatarFallback>
                      {selectedRoom.type === 'group' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center text-sm text-muted-foreground">
                        <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-2" />
                        Online
                      </span>
                      {selectedRoom.type === 'group' && (
                        <span className="text-sm text-muted-foreground">
                          • {selectedRoom.members} members
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <UserPlus className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite to {selectedRoom.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Search Users</Label>
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by name or email..."
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          {contacts.map((contact) => (
                            <div
                              key={contact.id}
                              className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
                            >
                              <Avatar>
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">{contact.email}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Invite
                              </Button>
                            </div>
                          ))}
                        </ScrollArea>
                        <Separator />
                        <div className="flex items-center gap-4">
                          <Input
                            placeholder="Or enter email addresses..."
                            className="flex-1"
                          />
                          <Button>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Generate Link
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <FileText className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Shared Files</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {uploadedFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                              <div className="p-2 bg-primary/10 rounded">
                                {file.type.startsWith('image/') ? (
                                  <ImageIcon className="h-6 w-6 text-primary" />
                                ) : (
                                  <FileText className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                                {file.progress < 100 && (
                                  <Progress value={file.progress} className="h-1 mt-2" />
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                                onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="mt-4">
                        <div
                          {...getRootProps()}
                          className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                        >
                          <input {...getInputProps()} />
                          <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Drag & drop files here, or click to select files
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent 
              className="flex-1 overflow-hidden p-4"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <ScrollArea className="h-[580px]">
                <AnimatePresence>
                  <div className="space-y-4">
                    {isDragActive && (
                      <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center">
                        <p className="text-primary">Drop files here to share</p>
                      </div>
                    )}
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${
                          message.isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!message.isCurrentUser && (
                          <Avatar>
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[70%] ${
                            message.isCurrentUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          } rounded-lg p-3`}
                        >
                          {!message.isCurrentUser && (
                            <p className="text-sm font-medium mb-1">{message.sender}</p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          {message.type === 'image' && message.attachment?.url && (
                            <div className="mt-2">
                              <img
                                src={message.attachment.url}
                                alt={message.attachment.name}
                                className="rounded-lg max-w-full h-auto"
                              />
                            </div>
                          )}
                          {message.type === 'code' && message.attachment?.content && (
                            <div className="mt-2 bg-black/10 p-3 rounded-md">
                              <pre className="text-xs overflow-x-auto">
                                <code>{message.attachment.content}</code>
                              </pre>
                            </div>
                          )}
                          <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                        </div>
                        {message.isCurrentUser && (
                          <Avatar>
                            <AvatarImage src={message.avatar} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </ScrollArea>
            </CardContent>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <PaperclipIcon className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => setShowFileList(true)}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Image
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => setShowFileList(true)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Document
                        </Button>
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => setShowFileList(true)}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Code
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setMessageInput((prev) => prev + emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default Chat;