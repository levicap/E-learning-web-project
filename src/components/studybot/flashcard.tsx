import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Flashcard as FlashcardType } from '@/types';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  flashcard: FlashcardType;
  onRate: (id: string, confidence: 1 | 2 | 3 | 4 | 5) => void;
}

export function Flashcard({ flashcard, onRate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="perspective-1000">
      <Card
        className={cn(
          "relative w-full aspect-[4/3] cursor-pointer transition-transform duration-500 transform-style-3d",
          isFlipped && "rotate-y-180"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="absolute inset-0 backface-hidden p-6 flex flex-col justify-between">
          <div className="text-xl font-semibold">{flashcard.question}</div>
          <div className="text-sm text-muted-foreground">Click to flip</div>
        </CardContent>

        <CardContent className="absolute inset-0 backface-hidden rotate-y-180 p-6 flex flex-col justify-between bg-blue-50">
          <div className="text-xl">{flashcard.answer}</div>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRate(flashcard.id, rating as 1 | 2 | 3 | 4 | 5);
                }}
                className={cn(
                  "w-8 h-8",
                  flashcard.confidence === rating && "bg-blue-100"
                )}
              >
                {rating}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}