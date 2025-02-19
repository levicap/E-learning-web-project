import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  MessageCircle,
  Users,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  Settings,
  ChevronRight,
  Heart,
  MoreHorizontal,
  Twitter,
  Facebook,
  Linkedin,
  Link,
  FileText,
  Image as ImageIcon,
  Code,
  Download,
  Send,
  Paperclip,
  SmilePlus,
  ChevronDown,
  Eye,
  ThumbsUp,
  Reply,
  Bookmark,
  Info,
  Book,
} from 'lucide-react';

function Live() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Alice Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      message: 'This explanation really helped me understand the concept better!',
      time: '2 min ago',
      likes: 3,
      isLiked: false,
      replies: 2,
    },
    {
      id: 2,
      user: 'Mark Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      message: 'Could you explain that last part again?',
      time: '5 min ago',
      likes: 1,
      isLiked: false,
      replies: 0,
    },
  ]);

  const pythonCode = `def integrate_by_parts(u, dv):
    # Integration by parts formula: ∫u dv = uv - ∫v du
    v = integrate(dv)
    du = diff(u)
    return u * v - integrate(v * du)

# Example usage
u = x
dv = exp(x)
result = integrate_by_parts(u, dv)
print(f"∫{u} {dv}dx = {result}")`;

  const resources = [
    {
      type: 'pdf',
      name: 'Lecture Notes - Integration by Parts',
      icon: FileText,
      size: '2.4 MB',
      description: 'Complete lecture notes covering integration by parts techniques and examples.',
    },
    {
      type: 'image',
      name: 'Visual Guide - Complex Integration',
      icon: ImageIcon,
      size: '856 KB',
      description: 'Step-by-step visual guide for solving complex integration problems.',
    },
    {
      type: 'code',
      name: 'Python Implementation Examples',
      icon: Code,
      size: '45 KB',
      code: pythonCode,
      description: 'Python code examples demonstrating integration by parts implementation.',
    },
  ];

  const [newMessage, setNewMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [expandedResource, setExpandedResource] = useState<number | null>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        {
          id: messages.length + 1,
          user: 'You',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
          message: newMessage,
          time: 'Just now',
          likes: 0,
          isLiked: false,
          replies: 0,
        },
        ...messages,
      ]);
      setNewMessage('');
    }
  };

  const toggleLike = (messageId: number) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          likes: msg.isLiked ? msg.likes - 1 : msg.likes + 1,
          isLiked: !msg.isLiked,
        };
      }
      return msg;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-2 py-1">LIVE</Badge>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Advanced Mathematics</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                247 Watching
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Twitter className="w-4 h-4" />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Facebook className="w-4 h-4" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Linkedin className="w-4 h-4" />
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Link className="w-4 h-4" />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0 relative aspect-video bg-black">
                <img
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655"
                  alt="Stream"
                  className="w-full h-full object-cover"
                />
                {/* Teacher Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/90 p-4 rounded-full backdrop-blur-md shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-destructive" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                  >
                    {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-destructive" />}
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stream Info & Resources */}
            <Card className="border-0 shadow-lg">
              <Tabs defaultValue="about" className="w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold">Advanced Mathematics: Calculus II</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" />
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        Prof. Sarah Matthews • Live Now
                      </CardDescription>
                    </div>
                    <TabsList className="grid w-[400px] grid-cols-2">
                      <TabsTrigger value="about" className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        About
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="flex items-center gap-2">
                        <Book className="w-4 h-4" />
                        Resources
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>
                <CardContent>
                  <TabsContent value="about" className="mt-0">
                    <p className="text-muted-foreground">
                      Today's topic: Integration by Parts and its Applications in Real-world Problems
                    </p>
                  </TabsContent>
                  <TabsContent value="resources" className="mt-0">
                    <div className="space-y-4">
                      {resources.map((resource, index) => (
                        <Collapsible
                          key={index}
                          open={expandedResource === index}
                          onOpenChange={() => setExpandedResource(expandedResource === index ? null : index)}
                        >
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-background rounded-md">
                                <resource.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium">{resource.name}</p>
                                <p className="text-sm text-muted-foreground">{resource.size}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {resource.type === 'code' && (
                                <CollapsibleTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    Preview
                                    <ChevronDown className="w-4 h-4" />
                                  </Button>
                                </CollapsibleTrigger>
                              )}
                              <Button variant="ghost" size="icon">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {resource.type === 'code' && (
                            <CollapsibleContent>
                              <div className="mt-2 p-4 bg-muted rounded-lg">
                                <pre className="text-sm overflow-x-auto">
                                  <code>{resource.code}</code>
                                </pre>
                              </div>
                            </CollapsibleContent>
                          )}
                        </Collapsible>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Chat Section */}
          <Card className="lg:h-[calc(100vh-8rem)] border-0 shadow-lg">
            <CardHeader className="border-b bg-muted/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {messages.length} Messages
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                <div className="space-y-4 p-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="group relative flex gap-3 hover:bg-muted/50 p-4 rounded-lg transition-colors">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={msg.avatar} />
                        <AvatarFallback>{msg.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-foreground">{msg.message}</p>
                        <div className="flex items-center gap-4 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-2 h-8 ${msg.isLiked ? 'text-primary' : ''}`}
                            onClick={() => toggleLike(msg.id)}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            {msg.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 h-8">
                            <Reply className="w-4 h-4" />
                            {msg.replies > 0 && msg.replies}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 h-8">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t bg-card p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-muted"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SmilePlus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendMessage} size="sm" className="gap-2">
                      <Send className="w-4 h-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Live;