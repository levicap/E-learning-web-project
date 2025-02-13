import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { 
  Github, 
  Twitter, 
  Mail, 
  BookOpen, 
  GraduationCap,
  Rocket,
  Star,
  Trophy,
  Users,
  CheckCircle2,
  Lock,
  Info,
  Sparkles,
  Brain,
  Target,
  Zap
} from 'lucide-react';

function Sign() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      

      <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center relative perspective">
        {/* Left side - Enhanced Hero Section */}
        <div className="hidden md:flex flex-col space-y-8 p-8">
          <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400 relative animate-fade-in ">
            <GraduationCap size={44} className="floating animation-delay-100" />
            <h1 className="text-4xl font-bold text-glow">EduLearn Pro</h1>
            <Badge variant="secondary" className="ml-2 animate-shine">Beta</Badge>
          </div>

          <div className="space-y-6 animate-fade-in animation-delay-200">
            <h2 className="text-6xl font-bold text-gray-900 dark:text-white leading-tight hover-rotate-y">
              Transform Your Future with 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"> Smart Learning</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Join thousands of learners from around the globe and transform your career with our cutting-edge e-learning platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in animation-delay-300">
            <div className="group">
              <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20">
                <Users className="text-indigo-600 dark:text-indigo-400 group-hover:animate-bounce" />
                <div>
                  <p className="font-semibold">10K+ Students</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active learners</p>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20">
                <Trophy className="text-indigo-600 dark:text-indigo-400 group-hover:animate-bounce" />
                <div>
                  <p className="font-semibold">500+ Courses</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expert-led</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 animate-fade-in animation-delay-400">
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 group">
              <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500 group-hover:animate-bounce" />
              <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">AI-Powered Learning</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 group">
              <Target className="w-8 h-8 mx-auto mb-2 text-purple-500 group-hover:animate-bounce" />
              <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">Personalized Path</p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 group">
              <Zap className="w-8 h-8 mx-auto mb-2 text-indigo-500 group-hover:animate-bounce" />
              <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">Real-time Progress</p>
            </div>
          </div>

          <div className="relative group animate-fade-in animation-delay-500 hover-rotate-y">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                alt="Students learning"
                className="rounded-2xl shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/40 to-transparent rounded-2xl group-hover:from-indigo-600/50 transition-colors" />
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Auth Form */}
        <div className="w-full max-w-md mx-auto animate-fade-in animation-delay-600">
          <Card className="w-full backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:shadow-indigo-500/20">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-950 transition-all duration-300">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-950 transition-all duration-300">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={onSubmit}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Welcome back</span>
                      <Sparkles className="w-5 h-5 inline animate-pulse text-yellow-500" />
                    </CardTitle>
                    <CardDescription>
                      Sign in to your account to continue learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </Label>
                      <Input 
                        id="signin-email" 
                        type="email" 
                        placeholder="john@example.com"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-indigo-500/20"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Password</span>
                      </Label>
                      <Input 
                        id="signin-password" 
                        type="password"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-indigo-500/20"
                        required 
                      />
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="link" className="px-0 text-xs hover:text-indigo-500 transition-colors">
                            Forgot password?
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Info className="h-4 w-4" />
                            <p className="text-sm">Click here to reset your password. We'll send you an email with instructions.</p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Separator className="flex-1" />
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>or continue with</span>
                      </span>
                      <Separator className="flex-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        className="hover:scale-110 transition-transform hover:shadow-lg hover:shadow-indigo-500/20 group"
                      >
                        <Github className="h-4 w-4 group-hover:animate-bounce" />
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button"
                        className="hover:scale-110 transition-transform hover:shadow-lg hover:shadow-indigo-500/20 group"
                      >
                        <Twitter className="h-4 w-4 group-hover:animate-bounce" />
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button"
                        className="hover:scale-110 transition-transform hover:shadow-lg hover:shadow-indigo-500/20 group"
                      >
                        <Mail className="h-4 w-4 group-hover:animate-bounce" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <BookOpen className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Sign In
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={onSubmit}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Create an account</span>
                      <Sparkles className="w-5 h-5 inline animate-pulse text-yellow-500" />
                    </CardTitle>
                    <CardDescription>
                      Join our learning community today
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>First name</span>
                        </Label>
                        <Input 
                          id="firstName" 
                          className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-indigo-500/20"
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input 
                          id="lastName" 
                          className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-indigo-500/20"
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="john@example.com"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-indigo-500/20"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Password</span>
                      </Label>
                      <Input 
                        id="signup-password" 
                        type="password"
                        className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-indigo-500/20"
                        required 
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Separator className="flex-1" />
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>or continue with</span>
                      </span>
                      <Separator className="flex-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        className="hover:scale-110 transition-transform hover:shadow-lg hover:shadow-indigo-500/20 group"
                      >
                        <Github className="h-4 w-4 group-hover:animate-bounce" />
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button"
                        className="hover:scale-110 transition-transform hover:shadow-lg hover:shadow-indigo-500/20 group"
                      >
                        <Twitter className="h-4 w-4 group-hover:animate-bounce" />
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button"
                        className="hover:scale-110 transition-transform hover:shadow-lg hover:shadow-indigo-500/20 group"
                      >
                        <Mail className="h-4 w-4 group-hover:animate-bounce" />
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <BookOpen className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Rocket className="mr-2 h-4 w-4" />
                      )}
                      Create Account
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Sign;