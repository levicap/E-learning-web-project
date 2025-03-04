import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import io, { Socket } from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  senderId?: string;
}

interface SystemMessage {
  type: 'join' | 'leave';
  username: string;
  timestamp: Date;
  userId?: string;
}

interface ChatProps {
  channel: string;
  username: string;
  userId: string;
}

const Chat: React.FC<ChatProps> = ({ channel, username, userId }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<(Message | SystemMessage)[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current?.emit('join-room', { 
        room: channel, 
        username,
        userId: userId
      });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current.on('previous-messages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
      scrollToBottom();
    });

    socketRef.current.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('user-joined', (data: { id: string, username: string, timestamp: Date, userId: string }) => {
      setMessages(prev => [...prev, {
        type: 'join',
        username: data.username,
        timestamp: new Date(data.timestamp),
        userId: data.userId
      }]);
      scrollToBottom();
    });

    socketRef.current.on('user-left', (data: { id: string, username: string, timestamp: Date, userId: string }) => {
      setMessages(prev => [...prev, {
        type: 'leave',
        username: data.username,
        timestamp: new Date(data.timestamp),
        userId: data.userId
      }]);
      scrollToBottom();
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [channel, username, userId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: username,
      content: newMessage,
      timestamp: new Date(),
      senderId: userId
    };

    socketRef.current?.emit('send-message', { room: channel, message });
    setNewMessage('');
  };

  const renderMessage = (message: Message | SystemMessage, index: number) => {
    if ('type' in message) {
      // System message
      return (
        <div key={`system-${index}`} className="flex justify-center my-2">
          <div className="px-3 py-1 bg-muted text-xs text-muted-foreground rounded-full">
            {message.type === 'join'
              ? `${message.username} joined the room`
              : `${message.username} left the room`}
          </div>
        </div>
      );
    } else {
      // User message
      const isCurrentUser = message.senderId === userId;
      return (
        <div
          key={message.id || `msg-${index}`}
          className={cn(
            "flex items-start gap-3 mb-4",
            isCurrentUser ? "flex-row-reverse" : ""
          )}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} />
            <AvatarFallback>{message.sender[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className={cn("flex flex-col max-w-[75%]", isCurrentUser ? "items-end" : "")}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{message.sender}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div
              className={cn(
                "mt-1 px-4 py-2 rounded-lg",
                isCurrentUser
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted text-foreground rounded-tl-none"
              )}
            >
              {message.content}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chat</h3>
          <Badge variant={isConnected ? "outline" : "destructive"} className="h-6">
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-grow p-4">
        <div className="space-y-1">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground my-4">
              No messages yet. Be the first to say hello!
            </div>
          )}
          
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <Separator />
      
      <form onSubmit={sendMessage} className="p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-grow"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isConnected || !newMessage.trim()}
            className="shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;