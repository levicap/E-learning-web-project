import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "./Navbar";
import Testimonials from "./test";
import Instructors from "./instructor";
import Pricing from "./pricing";
import FAQ from "./faq";
import Footer from "./footer";
import { AISearch } from "./aisearch";
import { 
  BookOpen, 
  Rocket, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Brain,
  Target,
  Zap
} from "lucide-react";

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background z-0" />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">
              <Badge className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                Transform Your Future
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                Master New Skills with
                <span className="text-primary"> Interactive Learning</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Unlock your potential with our cutting-edge e-learning platform. Learn from industry experts and join a community of lifelong learners.
              </p>
              <div className="flex gap-4">
                <Button size="lg" className="px-8">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Browse Courses
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-8">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">50K+ Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm">300+ Courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm">Expert Instructors</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80" 
                alt="Students learning"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <Testimonials />
      <AISearch />

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience a revolutionary approach to online learning with features designed to maximize your success.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <Instructors />

      {/* Testimonials */}

     
      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students already learning on our platform. Start your journey today!
          </p>
          <Button size="lg" variant="secondary" className="px-8">
            Start Learning Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
      <Pricing />
      <FAQ />
      <Footer />
      
    </div>
  );
}

const features = [
  {
    icon: <Brain className="h-6 w-6 text-primary" />,
    title: "Adaptive Learning",
    description: "Our AI-powered system adapts to your learning style and pace, ensuring optimal progress."
  },
  {
    icon: <Rocket className="h-6 w-6 text-primary" />,
    title: "Learn by Doing",
    description: "Practice with real-world projects and interactive exercises to reinforce your knowledge."
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Community Learning",
    description: "Connect with peers and mentors in our vibrant learning community."
  },
  {
    icon: <Target className="h-6 w-6 text-primary" />,
    title: "Focused Curriculum",
    description: "Carefully crafted courses designed to help you achieve your career goals."
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Quick Progress",
    description: "Learn at your own pace with bite-sized lessons and micro-learning modules."
  },
  {
    icon: <Award className="h-6 w-6 text-primary" />,
    title: "Certification",
    description: "Earn industry-recognized certificates upon course completion."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "UX Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The interactive learning approach and community support made my transition into UX design smooth and enjoyable."
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The practical projects and mentor feedback helped me build a strong portfolio that landed me my dream job."
  },
  {
    name: "Emma Davis",
    role: "Data Analyst",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The structured curriculum and hands-on exercises made complex data concepts easy to understand and apply."
  }
];

export default Landing;