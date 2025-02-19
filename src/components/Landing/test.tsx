import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "UX Designer",
    company: "Design Co",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The interactive learning approach and community support made my transition into UX design smooth and enjoyable. The platform's AI-powered recommendations were spot on!",
    course: "UX Design Masterclass",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    company: "Tech Solutions Inc",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The practical projects and mentor feedback helped me build a strong portfolio that landed me my dream job. The community support was invaluable throughout my journey.",
    course: "Full-Stack Development",
    rating: 5
  },
  {
    name: "Emma Davis",
    role: "Data Analyst",
    company: "Analytics Pro",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The structured curriculum and hands-on exercises made complex data concepts easy to understand and apply. I've grown so much in my career thanks to this platform.",
    course: "Data Science Bootcamp",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4">Testimonials</Badge>
          <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how LearnHub has transformed careers and lives through our comprehensive learning experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative p-8 overflow-hidden group">
              <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
              
              <div className="relative">
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="mb-6 text-muted-foreground">
                  "{testimonial.content}"
                </blockquote>

                {/* Course Badge */}
                <Badge variant="secondary" className="mb-6">
                  {testimonial.course}
                </Badge>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/10"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}