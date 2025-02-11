import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
  import { Badge } from "@/components/ui/badge";
  
  const faqs = [
    {
      question: "How does the learning path system work?",
      answer: "Our learning paths are curated sequences of courses designed to help you achieve specific career goals. Each path is customized based on your current skill level and learning pace, with AI-powered recommendations to optimize your learning journey."
    },
    {
      question: "Can I access the courses offline?",
      answer: "Yes, with our Pro plan, you can download courses for offline viewing through our mobile app. This feature allows you to continue learning even without an internet connection."
    },
    {
      question: "What types of certificates do you offer?",
      answer: "We offer verified certificates for all course completions. Our certificates are industry-recognized and can be shared directly on LinkedIn. Pro members also receive specialized certificates for completing learning paths."
    },
    {
      question: "How does the mentorship program work?",
      answer: "Pro members get access to 1-on-1 mentorship sessions with industry experts. You can schedule sessions based on your needs, get project reviews, and receive personalized career guidance."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, you can request a full refund within the first 30 days of your subscription."
    },
    {
      question: "Can I switch between plans?",
      answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time. When upgrading, you'll get immediate access to all the features of your new plan."
    }
  ];
  
  export default function FAQ() {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our platform, courses, and learning experience.
            </p>
          </div>
  
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    );
  }