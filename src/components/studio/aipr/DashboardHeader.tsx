import { Sparkles } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Course Success Predictor
            </h1>
            <p className="text-sm text-muted-foreground">
              Let AI predict your next successful course
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}