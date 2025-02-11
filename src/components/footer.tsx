import { 
    Sparkles, 
    Github, 
    Twitter, 
    Linkedin, 
    Mail, 
    MapPin, 
    Phone,
    BookOpen,
    GraduationCap,
    Users2,
    Building2,
    FileText,
    HelpCircle,
    Shield,
    Globe
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  
  export default function Footer() {
    return (
      <footer className="bg-muted/50 pt-20 pb-12 ml-5">
        <div className="container">
          {/* Newsletter Section */}
          <div className="mb-16 p-8 bg-primary/5 rounded-2xl">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6">
                Get the latest updates on new courses, features, and learning resources.
              </p>
              <div className="flex gap-2">
                <Input placeholder="Enter your email" type="email" className="max-w-sm" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">LearnHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering learners worldwide with cutting-edge education technology.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>123 Learning Street, Education City</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>hello@learnhub.com</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="bg-primary/10 p-2 rounded-lg text-primary hover:bg-primary/20 transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="bg-primary/10 p-2 rounded-lg text-primary hover:bg-primary/20 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="bg-primary/10 p-2 rounded-lg text-primary hover:bg-primary/20 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
  
            {/* Platform Links */}
            <div>
              <h3 className="font-semibold mb-6 text-lg">Platform</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Courses
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Learning Paths
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Users2 className="h-4 w-4 mr-2" />
                    Mentorship
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Building2 className="h-4 w-4 mr-2" />
                    Enterprise
                  </a>
                </li>
              </ul>
            </div>
  
            {/* Resources Links */}
            <div>
              <h3 className="font-semibold mb-6 text-lg">Resources</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-4 w-4 mr-2" />
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Globe className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Users2 className="h-4 w-4 mr-2" />
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
  
            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-6 text-lg">Company</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Building2 className="h-4 w-4 mr-2" />
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Users2 className="h-4 w-4 mr-2" />
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <FileText className="h-4 w-4 mr-2" />
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
  
          {/* Bottom Bar */}
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 LearnHub. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">Terms</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }