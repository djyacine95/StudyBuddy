import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Users, Brain, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Matching() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

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

  const findMatchesMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/matching/find");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "We've found compatible study partners for you!",
      });
      setTimeout(() => {
        setLocation("/");
      }, 1500);
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
        title: "Info",
        description: "No matches found right now. Try updating your preferences or check back later.",
      });
    },
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
                  <a className="text-sm font-medium text-muted-foreground hover-elevate px-3 py-2 rounded-md" data-testid="link-dashboard">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Study Squad</h1>
          <p className="text-lg text-muted-foreground">
            Our AI will match you with compatible study partners based on your preferences
          </p>
        </div>

        {!hasCompletedProfile ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-3">Complete Your Profile First</h2>
              <p className="text-muted-foreground mb-6">
                To find the best study partners, we need to know more about your topics, availability, and learning goals.
              </p>
              <Button size="lg" asChild data-testid="button-setup-profile">
                <Link href="/settings">
                  <a>
                    Complete Profile
                  </a>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* How Matching Works */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-3">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Topic Similarity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    We use AI embeddings to match you with students studying similar topics
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Schedule Overlap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Find partners with matching availability for convenient study times
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Group Formation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Stable matching algorithm ensures high-quality, balanced study groups
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Your Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Topics of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.topics?.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {user?.learningGoals && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Learning Goals</p>
                    <p className="text-sm">{user.learningGoals}</p>
                  </div>
                )}

                {user?.preferredLanguages && user.preferredLanguages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {user.preferredLanguages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-muted rounded-md text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Find Matches Button */}
            <Card>
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-3">Ready to Find Your Squad?</h2>
                <p className="text-muted-foreground mb-6">
                  Our AI will analyze your profile and find the most compatible study partners for you
                </p>
                <Button
                  size="lg"
                  onClick={() => findMatchesMutation.mutate()}
                  disabled={findMatchesMutation.isPending}
                  className="px-8"
                  data-testid="button-find-matches"
                >
                  {findMatchesMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Finding Matches...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find My Study Partners
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
