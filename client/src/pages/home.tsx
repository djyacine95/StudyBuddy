import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Sparkles, 
  Clock,
  Plus,
  BookOpen,
  TrendingUp,
  Upload
} from "lucide-react";
import { Link } from "wouter";
import type { GroupWithMembers, SessionWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: groups, isLoading: groupsLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/groups"],
    enabled: isAuthenticated,
  });

  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/upcoming"],
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const hasCompletedProfile = user?.topics && user.topics.length > 0;

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
                <Link href="/analytics">
                  <a className="text-sm font-medium text-muted-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-analytics">
                    Analytics
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            {hasCompletedProfile 
              ? "Here's your study dashboard" 
              : "Let's set up your profile to find study partners"}
          </p>
        </div>

        {/* Profile Setup CTA */}
        {!hasCompletedProfile && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your classes, availability, and topics to get matched with study partners
                  </p>
                </div>
                <Button asChild data-testid="button-setup-profile">
                  <Link href="/settings">
                    <a className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Set Up Profile
                    </a>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Study Groups */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">My Study Groups</h2>
                <Button size="sm" variant="outline" asChild data-testid="button-find-groups">
                  <Link href="/matching">
                    <a className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Find Groups
                    </a>
                  </Link>
                </Button>
              </div>

              {groupsLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : groups && groups.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <Card key={group.id} className="hover-elevate cursor-pointer" data-testid={`card-group-${group.id}`}>
                      <Link href={`/groups/${group.id}`}>
                        <a>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-lg">{group.name}</CardTitle>
                              <Badge variant="secondary" className="flex-shrink-0">
                                <Users className="w-3 h-3 mr-1" />
                                {group.members?.length || 0}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Member avatars */}
                            <div className="flex -space-x-2">
                              {group.members?.slice(0, 4).map((member) => (
                                <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                                  <AvatarImage src={member.user.profileImageUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {(group.members?.length || 0) > 4 && (
                                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                  +{(group.members?.length || 0) - 4}
                                </div>
                              )}
                            </div>

                            {/* Topics */}
                            <div className="flex flex-wrap gap-2">
                              {group.topics?.slice(0, 3).map((topic, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>

                            {/* Quick actions */}
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1" data-testid={`button-chat-${group.id}`}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Chat
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-schedule-${group.id}`}>
                                <Calendar className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </a>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Study Groups Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your profile and get matched with compatible study partners
                    </p>
                    <Button asChild data-testid="button-empty-find-groups">
                      <Link href="/matching">
                        <a className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Find Study Groups
                        </a>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : upcomingSessions && upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.slice(0, 5).map((session) => (
                      <div 
                        key={session.id} 
                        className="p-3 rounded-md bg-card hover-elevate cursor-pointer border"
                        data-testid={`session-${session.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm line-clamp-1">{session.title}</p>
                          {session.scheduledAt && new Date(session.scheduledAt).getTime() - Date.now() < 24 * 60 * 60 * 1000 && (
                            <Badge variant="destructive" className="text-xs flex-shrink-0">Soon</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {session.scheduledAt ? format(new Date(session.scheduledAt), "MMM d, h:mm a") : "TBD"}
                          </span>
                        </div>
                        {session.topic && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {session.topic}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming sessions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild data-testid="button-add-class">
                  <Link href="/schedule">
                    <a className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Add a Class
                    </a>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild data-testid="button-update-availability">
                  <Link href="/settings">
                    <a className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Update Availability
                    </a>
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild data-testid="button-manage-settings">
                  <Link href="/settings">
                    <a className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Manage Settings
                    </a>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
