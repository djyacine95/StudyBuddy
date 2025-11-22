import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Link } from "wouter";
import { Sparkles, ArrowLeft, Download, TrendingUp } from "lucide-react";
import type { SessionWithDetails } from "@shared/schema";
import { format, subDays, startOfDay } from "date-fns";

interface Analytics {
  totalSessions: number;
  completedSessions: number;
  averageCompletionRate: number;
  averageSuccessRating: number;
  totalStudyTime: number;
  sessionsPerDay: Array<{ date: string; count: number; hours: number }>;
  topicPerformance: Array<{ topic: string; sessionsCompleted: number; avgRating: number }>;
  weeklyTrend: Array<{ week: string; completedSessions: number; avgRating: number }>;
}

export default function Analytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
  });

  const { data: sessions = [] } = useQuery<SessionWithDetails[]>({
    queryKey: ["/api/sessions/upcoming"],
    enabled: isAuthenticated,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch("/api/analytics/export-pdf", {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `study-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Analytics exported to PDF",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <a className="hover-elevate p-2 rounded-md">
                  <ArrowLeft className="w-5 h-5" />
                </a>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Study Analytics</h1>
                <p className="text-sm text-muted-foreground">Track your study progress</p>
              </div>
            </div>
            <Button 
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analytics ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No study sessions yet. Start studying to see your analytics!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalSessions}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {analytics.completedSessions} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(analytics.averageCompletionRate)}%</div>
                  <p className="text-xs text-muted-foreground mt-2">Average checklist completion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Success Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.averageSuccessRating.toFixed(1)}/5</div>
                  <p className="text-xs text-muted-foreground mt-2">Average session rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Study Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{Math.round(analytics.totalStudyTime / 60)}h</div>
                  <p className="text-xs text-muted-foreground mt-2">{analytics.totalStudyTime} minutes</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Trend Chart */}
            {analytics.weeklyTrend && analytics.weeklyTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="completedSessions" 
                        stroke="hsl(var(--primary))"
                        name="Completed Sessions"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avgRating" 
                        stroke="hsl(var(--accent))"
                        name="Avg Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Topic Performance */}
            {analytics.topicPerformance && analytics.topicPerformance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Topic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topicPerformance.map((topic) => (
                      <div key={topic.topic} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{topic.topic}</span>
                            <Badge variant="secondary">
                              {topic.sessionsCompleted} sessions
                            </Badge>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min((topic.avgRating / 5) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Avg rating: {topic.avgRating.toFixed(1)}/5
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Activity */}
            {analytics.sessionsPerDay && analytics.sessionsPerDay.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.sessionsPerDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))"
                        name="Sessions"
                      />
                      <Bar 
                        dataKey="hours" 
                        fill="hsl(var(--accent))"
                        name="Hours"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
