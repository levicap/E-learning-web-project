import {
    AlertTriangle,
    ArrowRight,
    Bell,
    BookOpen,
    Brain,
    Camera,
    Clock,
    Crown,
    Eye,
    EyeOff,
    FileKey,
    Fingerprint,
    Globe,
    GraduationCap,
    History,
    Key,
    Laptop,
    LayoutDashboard,
    Lock,
    LogOut,
    Mail,
    Moon,
    Palette,
    PenTool,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Sun,
    Timer,
    Trophy,
    User,
    UserCircle,
    Users,
    Video,
  } from 'lucide-react';
  import { Separator } from '@/components/ui/separator';
  import { Button } from '@/components/ui/button';
  import { Progress } from '@/components/ui/progress';
  import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
  } from '@/components/ui/card';
  import { Switch } from '@/components/ui/switch';
  import { Label } from '@/components/ui/label';
  import { Badge } from '@/components/ui/badge';
  import { Input } from '@/components/ui/input';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
  
  function Setting() {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Settings</h1>
             
            </div>
          </div>
        </div>
  
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Profile Overview */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="sticky top-24">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Button size="icon" className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">John Doe</h2>
                      <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" /> Pro Member
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Trophy className="h-3 w-3" /> Level 12
                      </Badge>
                    </div>
                  </div>
  
                  <Separator className="my-6" />
  
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Study Time</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold">127h</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Courses</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold">15</p>
                      </div>
                    </div>
  
                    <div className="rounded-lg border p-4">
                      <h3 className="mb-3 font-medium">Security Status</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                          <span>Strong password</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ShieldAlert className="h-4 w-4 text-yellow-500" />
                          <span>2FA not enabled</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Fingerprint className="h-4 w-4 text-green-500" />
                          <span>Last login: 2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
  
            {/* Settings Tabs */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="learning">Learning</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
  
                <TabsContent value="general" className="space-y-6">
                  {/* Profile Settings */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" />
                        <CardTitle>Profile Settings</CardTitle>
                      </div>
                      <CardDescription>
                        Update your personal information and preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="language">Display Language</Label>
                          <Select defaultValue="en">
                            <SelectTrigger id="language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="it">Italian</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select defaultValue="utc">
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC</SelectItem>
                              <SelectItem value="est">Eastern Time</SelectItem>
                              <SelectItem value="pst">Pacific Time</SelectItem>
                              <SelectItem value="gmt">GMT</SelectItem>
                              <SelectItem value="cet">Central European Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
  
                  {/* Appearance */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <CardTitle>Appearance</CardTitle>
                      </div>
                      <CardDescription>
                        Customize how the platform looks and feels.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="rounded-lg border-2 border-primary p-4 [&:has(:checked)]:bg-primary/5">
                              <div className="flex items-center space-x-2">
                                <input type="radio" id="light" name="theme" className="theme-radio" />
                                <Label htmlFor="light" className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" /> Light
                                </Label>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="rounded-lg border-2 border-primary p-4 [&:has(:checked)]:bg-primary/5">
                              <div className="flex items-center space-x-2">
                                <input type="radio" id="dark" name="theme" className="theme-radio" />
                                <Label htmlFor="dark" className="flex items-center gap-2">
                                  <Moon className="h-4 w-4" /> Dark
                                </Label>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="rounded-lg border-2 border-primary p-4 [&:has(:checked)]:bg-primary/5">
                              <div className="flex items-center space-x-2">
                                <input type="radio" id="system" name="theme" className="theme-radio" />
                                <Label htmlFor="system" className="flex items-center gap-2">
                                  <Laptop className="h-4 w-4" /> System
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
  
                <TabsContent value="learning" className="space-y-6">
                  {/* Learning Preferences */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        <CardTitle>Learning Style</CardTitle>
                      </div>
                      <CardDescription>
                        Customize your learning experience and study habits.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Preferred Learning Time</Label>
                          <Select defaultValue="morning">
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                              <SelectItem value="evening">Evening (5PM - 10PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Daily Study Goal</Label>
                          <Select defaultValue="1hour">
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30min">30 minutes</SelectItem>
                              <SelectItem value="1hour">1 hour</SelectItem>
                              <SelectItem value="2hours">2 hours</SelectItem>
                              <SelectItem value="3hours">3 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
  
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Daily Study Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications to maintain your study streak
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Automatic Video Playback</Label>
                            <p className="text-sm text-muted-foreground">
                              Play the next video automatically
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Progress Indicators</Label>
                            <p className="text-sm text-muted-foreground">
                              Display progress bars and completion status
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
  
                  {/* Content Preferences */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5" />
                        <CardTitle>Content Preferences</CardTitle>
                      </div>
                      <CardDescription>
                        Customize your content display and learning materials.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Content Difficulty</Label>
                          <Select defaultValue="intermediate">
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Preferred Content Format</Label>
                          <Select defaultValue="mixed">
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video-focused</SelectItem>
                              <SelectItem value="text">Text-focused</SelectItem>
                              <SelectItem value="mixed">Mixed Content</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
  
                <TabsContent value="notifications" className="space-y-6">
                  {/* Notification Preferences */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        <CardTitle>Notification Settings</CardTitle>
                      </div>
                      <CardDescription>
                        Manage your notification preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Course Updates</Label>
                            <p className="text-sm text-muted-foreground">
                              New content and course announcements
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Achievement Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                              Notifications for badges and achievements
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Community Interactions</Label>
                            <p className="text-sm text-muted-foreground">
                              Replies and mentions in discussions
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Learning Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                              Daily and weekly study reminders
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
  
                  {/* Communication Preferences */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Communication Preferences</CardTitle>
                      </div>
                      <CardDescription>
                        Manage how we communicate with you.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Newsletter</Label>
                            <p className="text-sm text-muted-foreground">
                              Weekly digest of new courses and features
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Product Updates</Label>
                            <p className="text-sm text-muted-foreground">
                              Important updates about our platform
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
  
                <TabsContent value="security" className="space-y-6">
                  {/* Security Settings */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        <CardTitle>Security Settings</CardTitle>
                      </div>
                      <CardDescription>
                        Manage your account security and privacy.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4" />
                              <Label>Two-Factor Authentication</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              <Label>Login Notifications</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Get notified of new login attempts
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              <Label>Trusted Devices</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Manage devices that can access your account
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Manage <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
  
                      {/* Password Change Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Lock className="mr-2 h-4 w-4" />
                            Change Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                              Update your password to keep your account secure.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="current">Current Password</Label>
                              <div className="relative">
                                <Input
                                  id="current"
                                  type="password"
                                  className="pr-10"
                                  placeholder="Enter current password"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new">New Password</Label>
                              <div className="relative">
                                <Input
                                  id="new"
                                  type="password"
                                  className="pr-10"
                                  placeholder="Enter new password"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm">Confirm New Password</Label>
                              <div className="relative">
                                <Input
                                  id="confirm"
                                  type="password"
                                  className="pr-10"
                                  placeholder="Confirm new password"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline">Cancel</Button>
                            <Button>Update Password</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
  
                      {/* Security Log */}
                      <Card className="border-none shadow-none">
                        <CardHeader className="px-0 pt-0">
                          <div className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            <CardTitle>Security Log</CardTitle>
                          </div>
                          <CardDescription>
                            Recent security events and login activity
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between rounded-lg border p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <FileKey className="h-4 w-4 text-green-500" />
                                  <p className="font-medium">Successful login</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Chrome on MacOS • San Francisco, USA
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">2 hours ago</p>
                            </div>
                            <div className="flex items-start justify-between rounded-lg border p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  <p className="font-medium">Failed login attempt</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Firefox on Windows • London, UK
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">1 day ago</p>
                            </div>
                            <div className="flex items-start justify-between rounded-lg border p-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-blue-500" />
                                  <p className="font-medium">Password reset email sent</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Requested from Chrome on Windows
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">3 days ago</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="px-0">
                          <Button variant="outline" className="w-full">
                            View Full Security Log
                          </Button>
                        </CardFooter>
                      </Card>
                    </CardContent>
                  </Card>
  
                  {/* Privacy Settings */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <CardTitle>Privacy Settings</CardTitle>
                      </div>
                      <CardDescription>
                        Control your privacy and data settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Profile Visibility</Label>
                            <p className="text-sm text-muted-foreground">
                              Make your profile visible to other students
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Learning Activity</Label>
                            <p className="text-sm text-muted-foreground">
                              Share your learning progress with others
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
  
              {/* Save Changes */}
              <div className="flex justify-end gap-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default Setting;
  
  