import { ScrollArea } from '@/components/ui/scroll-area';
import { Lesson } from '../App';

const lessons: Lesson[] = [
  {
    id: '1',
    courseId: '1',
    name: 'HTML Basics',
    description: 'Learn the fundamentals of HTML markup',
  },
  {
    id: '2',
    courseId: '1',
    name: 'CSS Styling',
    description: 'Master CSS styling techniques',
  },
  {
    id: '3',
    courseId: '2',
    name: 'ES6+ Features',
    description: 'Explore modern JavaScript features',
  },
  {
    id: '4',
    courseId: '2',
    name: 'Async Programming',
    description: 'Understanding async/await and Promises',
  },
  {
    id: '5',
    courseId: '3',
    name: 'React Hooks',
    description: 'Master React Hooks and State Management',
  },
  {
    id: '6',
    courseId: '3',
    name: 'React Router',
    description: 'Implementation of client-side routing',
  },
];

interface LessonSelectionProps {
  courseId: string;
  selectedLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
}

export default function LessonSelection({
  courseId,
  selectedLesson,
  onSelectLesson,
}: LessonSelectionProps) {
  const filteredLessons = lessons.filter((lesson) => lesson.courseId === courseId);

  return (
    <ScrollArea className="h-[200px] rounded-md border p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
              selectedLesson?.id === lesson.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectLesson(lesson)}
          >
            <h3 className="font-semibold">{lesson.name}</h3>
            <p className="text-sm text-muted-foreground">{lesson.description}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}