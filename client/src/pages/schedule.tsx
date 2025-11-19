import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Sparkles, 
  Plus, 
  BookOpen, 
  Calendar as CalendarIcon,
  Trash2,
  Edit
} from "lucide-react";
import { Link } from "wouter";
import type { Class, InsertClass } from "@shared/schema";

export default function Schedule() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState<InsertClass>({
    courseName: "",
    courseCode: "",
    meetingTimes: [],
    examDates: [],
  });
  const [meetingTimeInput, setMeetingTimeInput] = useState("");
  const [examDateInput, setExamDateInput] = useState("");

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

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
  });

  // Add class mutation
  const addClassMutation = useMutation({
    mutationFn: async (data: InsertClass) => {
      await apiRequest("POST", "/api/classes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class added successfully",
      });
      setIsAddDialogOpen(false);
      setNewClass({
        courseName: "",
        courseCode: "",
        meetingTimes: [],
        examDates: [],
      });
      setMeetingTimeInput("");
      setExamDateInput("");
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
        description: "Failed to add class",
        variant: "destructive",
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Success",
        description: "Class deleted",
      });
    },
  });

  const addMeetingTime = () => {
    if (meetingTimeInput.trim()) {
      setNewClass({
        ...newClass,
        meetingTimes: [...(newClass.meetingTimes || []), meetingTimeInput.trim()],
      });
      setMeetingTimeInput("");
    }
  };

  const addExamDate = () => {
    if (examDateInput.trim()) {
      setNewClass({
        ...newClass,
        examDates: [...(newClass.examDates || []), examDateInput.trim()],
      });
      setExamDateInput("");
    }
  };

  const handleAddClass = () => {
    if (!newClass.courseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a course name",
        variant: "destructive",
      });
      return;
    }
    addClassMutation.mutate(newClass);
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
                  <a className="text-sm font-medium hover-elevate px-3 py-2 rounded-md" data-testid="link-schedule">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Class Schedule</h1>
            <p className="text-muted-foreground">
              Manage your classes and exam dates
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-class">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>
                  Enter your class details below
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="course-name">Course Name *</Label>
                  <Input
                    id="course-name"
                    placeholder="e.g., Introduction to Calculus"
                    value={newClass.courseName}
                    onChange={(e) => setNewClass({ ...newClass, courseName: e.target.value })}
                    className="mt-2"
                    data-testid="input-course-name"
                  />
                </div>

                <div>
                  <Label htmlFor="course-code">Course Code (Optional)</Label>
                  <Input
                    id="course-code"
                    placeholder="e.g., MATH 101"
                    value={newClass.courseCode || ""}
                    onChange={(e) => setNewClass({ ...newClass, courseCode: e.target.value })}
                    className="mt-2"
                    data-testid="input-course-code"
                  />
                </div>

                <div>
                  <Label>Meeting Times</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., Mon/Wed 10:00-11:30 AM"
                      value={meetingTimeInput}
                      onChange={(e) => setMeetingTimeInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addMeetingTime()}
                      data-testid="input-meeting-time"
                    />
                    <Button onClick={addMeetingTime} size="icon" data-testid="button-add-meeting-time">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newClass.meetingTimes && newClass.meetingTimes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newClass.meetingTimes.map((time, idx) => (
                        <Badge key={idx} variant="secondary">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Exam Dates</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., Dec 15, 2025"
                      value={examDateInput}
                      onChange={(e) => setExamDateInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addExamDate()}
                      data-testid="input-exam-date"
                    />
                    <Button onClick={addExamDate} size="icon" data-testid="button-add-exam-date">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newClass.examDates && newClass.examDates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newClass.examDates.map((date, idx) => (
                        <Badge key={idx} variant="secondary">
                          {date}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsAddDialogOpen(false)}
                    data-testid="button-cancel-add-class"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleAddClass}
                    disabled={addClassMutation.isPending}
                    data-testid="button-submit-class"
                  >
                    {addClassMutation.isPending ? "Adding..." : "Add Class"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {classesLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="h-20" />
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : classes.length > 0 ? (
          <div className="grid gap-4">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover-elevate" data-testid={`card-class-${cls.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{cls.courseName}</CardTitle>
                        {cls.courseCode && (
                          <p className="text-sm text-muted-foreground mt-1">{cls.courseCode}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteClassMutation.mutate(cls.id)}
                      data-testid={`button-delete-class-${cls.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {cls.meetingTimes && cls.meetingTimes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Meeting Times</p>
                      <div className="flex flex-wrap gap-2">
                        {cls.meetingTimes.map((time, idx) => (
                          <Badge key={idx} variant="outline">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {cls.examDates && cls.examDates.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Upcoming Exams</p>
                      <div className="flex flex-wrap gap-2">
                        {cls.examDates.map((date, idx) => (
                          <Badge key={idx} variant="secondary">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Classes Added</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add your classes to help us find compatible study partners
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-empty-add-class">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Class
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
