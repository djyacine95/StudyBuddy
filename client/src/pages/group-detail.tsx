import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Sparkles, 
  Send, 
  Calendar, 
  Users, 
  Sparkles as SparklesIcon,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Link, useParams } from "wouter";
import type { GroupWithMembers, MessageWithUser, SessionWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: group, isLoading: groupLoading } = useQuery<GroupWithMembers>({
    queryKey: ["/api/groups", id],
    enabled: isAuthenticated && !!id,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/groups", id, "sessions"],
    enabled: isAuthenticated && !!id,
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (!id || !isAuthenticated) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", groupId: id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" && data.groupId === id) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [id, isAuthenticated]);

  // Load initial messages
  const { data: initialMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/groups", id, "messages"],
    enabled: isAuthenticated && !!id,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/groups/${id}/messages`, { content });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Generate agenda mutation
  const generateAgendaMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiRequest("POST", `/api/sessions/${sessionId}/generate-agenda`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id, "sessions"] });
      toast({
        title: "Success",
        description: "AI agenda generated successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate agenda",
        variant: "destructive",
      });
    },
  });

  // Toggle checklist item
  const toggleChecklistMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      await apiRequest("PATCH", `/api/checklist/${itemId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id, "sessions"] });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  if (authLoading || groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-muted-foreground mb-4">This study group doesn't exist</p>
          <Button asChild>
            <Link href="/">
              <a>Back to Dashboard</a>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/">
                <a className="flex items-center gap-2 hover-elevate px-2 py-1 rounded-md" data-testid="link-home">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="font-bold text-xl">StudyBuddy</span>
                </a>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/">
                  <a className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-dashboard">
                    Dashboard
                  </a>
                </Link>
                <Link href="/schedule">
                  <a className="text-sm font-medium text-muted-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-schedule">
                    Schedule
                  </a>
                </Link>
                <Link href="/settings">
                  <a className="text-sm font-medium text-muted-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-settings">
                    Settings
                  </a>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/settings">
                <a data-testid="link-profile">
                  <Avatar className="h-9 w-9 hover-elevate cursor-pointer">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </a>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                asChild
              >
                <a href="/api/logout" data-testid="button-logout">
                  Log Out
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Group Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{group.members?.length || 0} members</span>
              </div>
            </div>
          </div>

          {/* Topics */}
          {group.topics && group.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {group.topics.map((topic, idx) => (
                <Badge key={idx} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          )}

          {/* Members */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.members?.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover-elevate">
                    <Avatar>
                      <AvatarImage src={member.user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {member.user.firstName} {member.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Group Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/20 rounded-md">
                  {messages.map((msg) => {
                    const isOwn = msg.userId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={msg.user.profileImageUrl || undefined} />
                          <AvatarFallback className="text-xs">
                            {msg.user.firstName?.[0]}{msg.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isOwn ? "items-end" : ""} max-w-[70%]`}>
                          <p className="text-xs text-muted-foreground mb-1">
                            {msg.user.firstName} {msg.user.lastName}
                          </p>
                          <div
                            className={`px-4 py-2 rounded-md ${
                              isOwn 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-card border"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    data-testid="input-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Study Sessions</CardTitle>
                  <Button size="sm" variant="outline" data-testid="button-new-session">
                    <Calendar className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : sessions.length > 0 ? (
                  sessions.map((session) => (
                    <Card key={session.id} className="p-4" data-testid={`session-${session.id}`}>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">{session.title}</h4>
                          {session.scheduledAt && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(session.scheduledAt), "MMM d, h:mm a")}
                            </p>
                          )}
                        </div>

                        {session.objectives && session.objectives.length > 0 ? (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Objectives</p>
                            <ul className="space-y-1">
                              {session.objectives.map((obj, idx) => (
                                <li key={idx} className="text-xs flex gap-1">
                                  <span className="text-primary">•</span>
                                  <span>{obj}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => generateAgendaMutation.mutate(session.id)}
                            disabled={generateAgendaMutation.isPending}
                            data-testid={`button-generate-agenda-${session.id}`}
                          >
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            Generate AI Agenda
                          </Button>
                        )}

                        {session.checklistItems && session.checklistItems.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Checklist</p>
                            <div className="space-y-2">
                              {session.checklistItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-2">
                                  <Checkbox
                                    checked={item.completed || false}
                                    onCheckedChange={(checked) =>
                                      toggleChecklistMutation.mutate({
                                        itemId: item.id,
                                        completed: checked as boolean,
                                      })
                                    }
                                    data-testid={`checkbox-${item.id}`}
                                  />
                                  <p className={`text-xs ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {item.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No sessions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
