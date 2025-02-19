import { ScrollArea } from '@/components/ui/scroll-area';
import { Course } from '../App';

const courses: Course[] = [
  {
    id: '1',
    name: 'Web Development Fundamentals',
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    name: 'Advanced JavaScript',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    name: 'React Mastery',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
  },
];

interface CourseSelectionProps {
  selectedCourse: Course | null;
  onSelectCourse: (course: Course) => void;
}

export default function CourseSelection({ selectedCourse, onSelectCourse }: CourseSelectionProps) {
  return (
    <ScrollArea className="h-[400px] rounded-md border p-4">
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
              selectedCourse?.id === course.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectCourse(course)}
          >
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <img
                src={course.image}
                alt={course.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <h3 className="mt-2 font-semibold">{course.name}</h3>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}