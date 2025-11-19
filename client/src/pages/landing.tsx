import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, MessageSquare, Sparkles, CheckCircle, Clock, Target, Star } from "lucide-react";
import heroImage from "@assets/generated_images/Students_studying_together_collaboratively_57d9bea4.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Dark wash gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/80 z-10" />
        
        {/* Hero Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Students collaborating" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect Study Squad
            </h1>
            <p className="text-xl text-foreground/90 mb-8 max-w-2xl">
              AI-powered matching connects you with compatible study partners based on your schedule, topics, and learning goals. Get personalized session agendas with practice questions.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 h-12"
                asChild
              >
                <a href="/api/login" data-testid="button-get-started">
                  Get Started Free
                </a>
              </Button>
              <p className="text-sm text-muted-foreground">
                Join 10,000+ students studying smarter together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to better study sessions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Set Up Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Add your classes, available times, topics of interest, and learning goals. Takes less than 5 minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Get Smart Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our AI analyzes schedule overlap and topic similarity to form high-quality study groups that actually work.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Study Together</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Chat with your group, generate AI session agendas, and track progress with built-in checklists.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">AI-Powered Agendas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get objectives, practice questions, and time schedules for every session
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI matches based on schedule overlap and semantic topic similarity
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <MessageSquare className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Real-Time Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Coordinate with your group instantly through built-in messaging
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <Calendar className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Schedule Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatic session scheduling based on mutual availability
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Agendas Preview */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground mb-6">
                Every Session Has a Plan
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                No more wasted time wondering what to study. Our AI generates comprehensive session agendas tailored to your class and upcoming exams.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Clear Objectives</h3>
                    <p className="text-sm text-muted-foreground">
                      Know exactly what you'll accomplish each session
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Practice Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      4-6 targeted questions with answers to test understanding
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Time Breakdown</h3>
                    <p className="text-sm text-muted-foreground">
                      60-90 minute schedules optimized for productive learning
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">Progress Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Built-in checklists keep everyone accountable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Sample Agenda: Calculus Study Session</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    <span>90 minutes</span>
                    <span>•</span>
                    <Calendar className="w-4 h-4" />
                    <span>Exam in 5 days</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 rounded-md">
                    <p className="text-sm font-medium mb-1">0-15 min: Review derivatives</p>
                    <p className="text-xs text-muted-foreground">Warm up with chain rule examples</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-md">
                    <p className="text-sm font-medium mb-1">15-45 min: Practice integration</p>
                    <p className="text-xs text-muted-foreground">Work through 4 practice problems together</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-md">
                    <p className="text-sm font-medium mb-1">45-75 min: Applications</p>
                    <p className="text-xs text-muted-foreground">Related rates and optimization problems</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-md">
                    <p className="text-sm font-medium mb-1">75-90 min: Review & Questions</p>
                    <p className="text-xs text-muted-foreground">Clarify concepts and plan next session</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by Students Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  "StudyBuddy helped me find consistent study partners for the first time. The AI agendas keep our sessions focused and productive."
                </p>
                <div>
                  <p className="font-semibold text-sm">Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">Stanford University</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  "The matching algorithm is incredible. I got paired with people who actually wanted to study the same topics at the same times."
                </p>
                <div>
                  <p className="font-semibold text-sm">Marcus Johnson</p>
                  <p className="text-xs text-muted-foreground">MIT</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  "Game changer for group projects. The practice questions generated for our sessions are actually helpful and relevant."
                </p>
                <div>
                  <p className="font-semibold text-sm">Priya Patel</p>
                  <p className="text-xs text-muted-foreground">UC Berkeley</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Study Smarter?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who've transformed their study habits with AI-powered matching
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 h-12"
              asChild
            >
              <a href="/api/login" data-testid="button-cta-signup">
                Get Started Free
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 h-12"
              asChild
            >
              <a href="#features" data-testid="button-learn-more">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">About</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate inline-block">Our Mission</a></li>
                <li><a href="#" className="hover-elevate inline-block">How It Works</a></li>
                <li><a href="#" className="hover-elevate inline-block">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate inline-block">Smart Matching</a></li>
                <li><a href="#" className="hover-elevate inline-block">AI Agendas</a></li>
                <li><a href="#" className="hover-elevate inline-block">Group Chat</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate inline-block">Study Tips</a></li>
                <li><a href="#" className="hover-elevate inline-block">Help Center</a></li>
                <li><a href="#" className="hover-elevate inline-block">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover-elevate inline-block">Privacy Policy</a></li>
                <li><a href="#" className="hover-elevate inline-block">Terms of Service</a></li>
                <li><a href="#" className="hover-elevate inline-block">Data Protection</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 StudyBuddy. Student data protected and privacy-first.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
