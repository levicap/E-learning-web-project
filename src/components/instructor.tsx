import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Star,
  Award,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";

const instructors = [
  {
    name: "Dr. Emily Chen",
    role: "Data Science Lead",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Former Google AI researcher with 10+ years of experience in machine learning and data science.",
    expertise: ["Machine Learning", "Python", "Data Analysis"],
    students: 15000,
    rating: 4.9,
    courses: 12
  },
  {
    name: "Alex Rodriguez",
    role: "Senior Web Developer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Full-stack developer with expertise in modern web technologies and 8 years of teaching experience.",
    expertise: ["React", "Node.js", "TypeScript"],
    students: 22000,
    rating: 4.8,
    courses: 15
  },
  {
    name: "Sarah Williams",
    role: "UX Design Expert",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "Award-winning designer with experience at top tech companies, passionate about teaching design principles.",
    expertise: ["UI/UX Design", "Figma", "User Research"],
    students: 18000,
    rating: 4.9,
    courses: 10
  },
  {
    name: "David Kumar",
    role: "Mobile Development Lead",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    bio: "15+ years of mobile development experience, created multiple top-rated apps in App Store.",
    expertise: ["iOS", "Android", "React Native"],
    students: 20000,
    rating: 4.8,
    courses: 14
  }
];

export default function Instructors() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4">Expert Instructors</Badge>
          <h2 className="text-4xl font-bold mb-4">Learn from Industry Leaders</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our instructors are experienced professionals who bring real-world expertise to their teaching.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 ml-5">
          {instructors.map((instructor) => (
            <Card key={instructor.name} className="group">
              <div className="p-6">
                {/* Avatar and Stats */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <img
                      src={instructor.avatar}
                      alt={instructor.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 ring-2 ring-primary/10"
                    />
                    <Badge className="absolute -bottom-2 -right-2 bg-primary">
                      {instructor.courses} courses
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{instructor.role}</p>
                  
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">{instructor.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="text-sm">{instructor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm">{instructor.courses}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mb-4">
                  {instructor.bio}
                </p>

                {/* Expertise */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {instructor.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  <Button variant="ghost" size="icon" className="hover:text-primary">
                    <Github className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-primary">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:text-primary">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}