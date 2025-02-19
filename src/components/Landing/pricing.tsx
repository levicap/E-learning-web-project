import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { Check } from "lucide-react";
  
  const plans = [
    {
      name: "Basic",
      description: "Perfect for individual learners",
      price: "Free",
      features: [
        "Access to free courses",
        "Basic learning path",
        "Community forum access",
        "Mobile app access",
        "Course completion certificates"
      ],
      popular: false
    },
    {
      name: "Pro",
      description: "Best for career advancement",
      price: "$29",
      period: "per month",
      features: [
        "All Basic features",
        "Unlimited course access",
        "Advanced learning paths",
        "Priority support",
        "Offline downloads",
        "Project reviews",
        "1-on-1 mentoring sessions"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      description: "For teams and organizations",
      price: "Custom",
      features: [
        "All Pro features",
        "Custom learning paths",
        "Team analytics",
        "API access",
        "SSO integration",
        "Dedicated success manager",
        "Custom reporting"
      ],
      popular: false
    }
  ];
  
  export default function Pricing() {
    return (
      <section className="py-24 ml-5">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Choose Your Learning Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Flexible plans designed to meet your learning needs. Start for free and upgrade as you grow.
            </p>
          </div>
  
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute top-4 right-4" variant="secondary">
                    Most Popular
                  </Badge>
                )}
  
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
  
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
  
                <CardFooter>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }