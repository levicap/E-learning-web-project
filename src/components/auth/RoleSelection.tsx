import { useUser } from '@clerk/clerk-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, School } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RoleSelection() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [role, setRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          id: user?.id,
          name: user?.fullName || user?.username
        })
      });

      if (response.ok) {
        navigate(`/${role}-dashboard`);
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome to the Learning Platform</h1>
            <p className="text-muted-foreground">
              Choose your role to get started with your personalized experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <RadioGroup
              value={role}
              onValueChange={setRole}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="student"
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 hover:bg-accent transition-all",
                  role === 'student' && "border-primary ring-2 ring-primary ring-offset-2"
                )}
              >
                <RadioGroupItem
                  value="student"
                  id="student"
                  className="sr-only"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Student</h3>
                    <p className="text-sm text-muted-foreground">
                      Access courses, track progress, and engage with learning materials
                    </p>
                  </div>
                </div>
              </Label>

              <Label
                htmlFor="teacher"
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-4 hover:bg-accent transition-all",
                  role === 'teacher' && "border-primary ring-2 ring-primary ring-offset-2"
                )}
              >
                <RadioGroupItem
                  value="teacher"
                  id="teacher"
                  className="sr-only"
                />
                <div className="space-y-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
                    <School className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Teacher</h3>
                    <p className="text-sm text-muted-foreground">
                      Create courses, manage students, and monitor learning outcomes
                    </p>
                  </div>
                </div>
              </Label>
            </RadioGroup>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!role}
            >
              Continue as {role || '...'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}