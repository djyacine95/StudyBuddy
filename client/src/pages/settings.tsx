import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  BookOpen, 
  Clock, 
  Shield, 
  X,
  Plus,
  Sparkles,
  Trash2
} from "lucide-react";
import { Link } from "wouter";
import type { User, Availability, UpdateUserPreferences } from "@shared/schema";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SAMPLE_TOPICS = [
  "Calculus", "Linear Algebra", "Physics", "Chemistry", "Biology",
  "Computer Science", "Data Structures", "Algorithms", "Statistics",
  "Economics", "Psychology", "History", "Literature", "Writing"
];

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [topicInput, setTopicInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

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

  const { data: availability = [] } = useQuery<Availability[]>({
    queryKey: ["/api/availability"],
    enabled: isAuthenticated,
  });

  // Preferences state
  const [preferences, setPreferences] = useState<UpdateUserPreferences>({
    topics: user?.topics || [],
    learningGoals: user?.learningGoals || "",
    preferredLanguages: user?.preferredLanguages || [],
    dataUsageConsent: user?.dataUsageConsent || false,
  });

  // Update preferences when user data loads
  useEffect(() => {
    if (user) {
      setPreferences({
        topics: user.topics || [],
        learningGoals: user.learningGoals || "",
        preferredLanguages: user.preferredLanguages || [],
        dataUsageConsent: user.dataUsageConsent || false,
      });
    }
  }, [user]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: UpdateUserPreferences) => {
      await apiRequest("PATCH", "/api/users/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Your preferences have been saved",
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
        description: "Failed to save preferences",
        variant: "destructive",
      });
    },
  });

  // Add availability mutation
  const addAvailabilityMutation = useMutation({
    mutationFn: async (data: { dayOfWeek: number; startTime: string; endTime: string }) => {
      await apiRequest("POST", "/api/availability", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Success",
        description: "Availability added",
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
        description: "Failed to add availability",
        variant: "destructive",
      });
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Success",
        description: "Availability removed",
      });
    },
  });

  const addTopic = () => {
    if (topicInput.trim() && !preferences.topics?.includes(topicInput.trim())) {
      setPreferences({
        ...preferences,
        topics: [...(preferences.topics || []), topicInput.trim()],
      });
      setTopicInput("");
    }
  };

  const removeTopic = (topic: string) => {
    setPreferences({
      ...preferences,
      topics: preferences.topics?.filter(t => t !== topic) || [],
    });
  };

  const addLanguage = () => {
    if (languageInput.trim() && !preferences.preferredLanguages?.includes(languageInput.trim())) {
      setPreferences({
        ...preferences,
        preferredLanguages: [...(preferences.preferredLanguages || []), languageInput.trim()],
      });
      setLanguageInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    setPreferences({
      ...preferences,
      preferredLanguages: preferences.preferredLanguages?.filter(l => l !== lang) || [],
    });
  };

  const handleSavePreferences = () => {
    savePreferencesMutation.mutate(preferences);
  };

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
                  <a className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-settings">
                    Settings
                  </a>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, preferences, and privacy settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">
              <BookOpen className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="availability" data-testid="tab-availability">
              <Clock className="w-4 h-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your profile information is managed through your authentication provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label>First Name</Label>
                    <Input 
                      value={user?.firstName || ""} 
                      disabled 
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Last Name</Label>
                    <Input 
                      value={user?.lastName || ""} 
                      disabled 
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input 
                      value={user?.email || ""} 
                      disabled 
                      className="mt-2"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    To update your profile information, please manage it through your authentication provider.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Topics of Interest</CardTitle>
                <CardDescription>
                  Add topics you want to study. This helps match you with compatible study partners.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Calculus, Physics, Computer Science"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopic()}
                    data-testid="input-topic"
                  />
                  <Button onClick={addTopic} data-testid="button-add-topic">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {preferences.topics?.map((topic) => (
                    <Badge key={topic} variant="secondary" className="gap-1" data-testid={`badge-topic-${topic}`}>
                      {topic}
                      <button
                        onClick={() => removeTopic(topic)}
                        className="hover-elevate rounded-sm"
                        data-testid={`button-remove-topic-${topic}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {SAMPLE_TOPICS.filter(t => !preferences.topics?.includes(t)).length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_TOPICS.filter(t => !preferences.topics?.includes(t)).slice(0, 8).map((topic) => (
                        <Badge 
                          key={topic} 
                          variant="outline" 
                          className="cursor-pointer hover-elevate"
                          onClick={() => {
                            setPreferences({
                              ...preferences,
                              topics: [...(preferences.topics || []), topic],
                            });
                          }}
                          data-testid={`suggestion-${topic}`}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Goals</CardTitle>
                <CardDescription>
                  Describe what you want to achieve in your study sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Prepare for upcoming exams, understand complex concepts, work through problem sets..."
                  value={preferences.learningGoals || ""}
                  onChange={(e) => setPreferences({ ...preferences, learningGoals: e.target.value })}
                  rows={4}
                  data-testid="textarea-learning-goals"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferred Languages</CardTitle>
                <CardDescription>
                  Languages you're comfortable studying in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., English, Spanish, Mandarin"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                    data-testid="input-language"
                  />
                  <Button onClick={addLanguage} data-testid="button-add-language">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {preferences.preferredLanguages?.map((lang) => (
                    <Badge key={lang} variant="secondary" className="gap-1" data-testid={`badge-language-${lang}`}>
                      {lang}
                      <button
                        onClick={() => removeLanguage(lang)}
                        className="hover-elevate rounded-sm"
                        data-testid={`button-remove-language-${lang}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSavePreferences}
                disabled={savePreferencesMutation.isPending}
                data-testid="button-save-preferences"
              >
                {savePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Availability</CardTitle>
                <CardDescription>
                  Set your available times for study sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {availability.map((slot) => (
                    <div 
                      key={slot.id} 
                      className="flex items-center justify-between p-3 border rounded-md"
                      data-testid={`availability-${slot.id}`}
                    >
                      <div>
                        <p className="font-medium">{DAYS_OF_WEEK[slot.dayOfWeek]}</p>
                        <p className="text-sm text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAvailabilityMutation.mutate(slot.id)}
                        data-testid={`button-delete-availability-${slot.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  {availability.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No availability set. Add your available times to get matched.
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <select 
                      id="day" 
                      className="w-full h-9 px-3 rounded-md border bg-background text-sm mt-2"
                      data-testid="select-day"
                    >
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <option key={day} value={idx}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input 
                      id="start-time" 
                      type="time" 
                      className="mt-2"
                      data-testid="input-start-time"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Input 
                      id="end-time" 
                      type="time" 
                      className="mt-2"
                      data-testid="input-end-time"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    const day = parseInt((document.getElementById("day") as HTMLSelectElement)?.value || "0");
                    const startTime = (document.getElementById("start-time") as HTMLInputElement)?.value;
                    const endTime = (document.getElementById("end-time") as HTMLInputElement)?.value;
                    
                    if (startTime && endTime) {
                      addAvailabilityMutation.mutate({
                        dayOfWeek: day,
                        startTime,
                        endTime,
                      });
                    }
                  }}
                  disabled={addAvailabilityMutation.isPending}
                  data-testid="button-add-availability"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time Slot
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Usage & Privacy</CardTitle>
                <CardDescription>
                  Control how your data is used to improve StudyBuddy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium mb-1">AI Training Data</p>
                    <p className="text-sm text-muted-foreground">
                      Allow your anonymized study session data to help improve our matching algorithm and AI agenda generation
                    </p>
                  </div>
                  <Switch
                    checked={preferences.dataUsageConsent || false}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, dataUsageConsent: checked })
                    }
                    data-testid="switch-data-consent"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Your Privacy Rights</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Your personal information is never shared with other users without your consent</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Study session data is encrypted and stored securely</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>You can delete your account and all associated data at any time</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={savePreferencesMutation.isPending}
                    data-testid="button-save-privacy"
                  >
                    {savePreferencesMutation.isPending ? "Saving..." : "Save Privacy Settings"}
                  </Button>

                  <div className="pt-4">
                    <h3 className="font-semibold text-destructive mb-2">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive"
                      data-testid="button-delete-account"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
