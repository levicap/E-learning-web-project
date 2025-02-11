import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Search, Loader2 } from "lucide-react";

export function AISearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // Simulate AI processing
    setTimeout(() => setIsSearching(false), 2000);
  };

  return (
    <Card className="p-4 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Bot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Learning Assistant</h3>
      </div>
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="What would you like to learn? e.g., 'Create a learning path for becoming a web developer'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Let our AI assistant create personalized learning paths and course recommendations based on your goals.
        </p>
      </form>
    </Card>
  );
}