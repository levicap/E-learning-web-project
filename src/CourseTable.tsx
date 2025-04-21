import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Star,
  BookOpen,
  DollarSign,
  Calendar,
  User,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import CreateCourseDialog from './components/create';

interface Instructor {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: Instructor | null;  // <-- can be null if something went wrong
  image: string;
  category: string;
  price: number;
  rating: number;
  lessons: Array<{
    _id: string;
    title: string;
    description: string;
    duration: string;
    videoUrl: string;
  }>;
  createdAt: string;
}

export default function CoursesTable() {
  const { getToken, userId } = useAuth();
  const [data, setData] = useState<Course[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Course>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/courses/instructor-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-clerk-user-id': userId || ''
        }
      });
      const coursesData = await response.json();
      setData(coursesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      const token = await getToken();
      await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-clerk-user-id': userId || ''
        }
      });
      setData(data.filter(course => course._id !== courseId));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedCourse?._id || !editFormData) return;

    try {
      const token = await getToken();
      const formData = new FormData();
      Object.entries(editFormData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch(`http://localhost:5000/api/courses/${selectedCourse._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-clerk-user-id': userId || ''
        },
        body: formData
      });

      const updatedCourse = await response.json();
      setData(data.map(course => 
        course._id === selectedCourse._id ? updatedCourse : course
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      {
        accessorKey: 'image',
        header: 'Course',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <img
              src={`http://localhost:5000${row.original.image}`}
              alt={row.original.title}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop';
              }}
            />
            <div>
              <div className="font-medium">{row.original.title}</div>
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {row.original.description}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'instructor',
        header: 'Instructor',
        cell: ({ row }) => {
          const instr = row.original.instructor;
          // if instr is null or missing, show a dash; otherwise use instr.name
          const label = instr?.name ?? '–';
          return (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>{label}</span>
            </div>
          );
        },
      },
      
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>${row.original.price.toFixed(2)}</span>
          </div>
        ),
      },
      // {
      //   accessorKey: 'rating',
      //   header: 'Rating',
      //   cell: ({ row }) => {
      //     // coerce to a number (default 0), then format one decimal place
      //     const raw = row.original.rating;
      //     const num = typeof raw === 'number' ? raw : Number(raw) || 0;
      //     return (
      //       <div className="flex items-center space-x-1">
      //         <Star className="w-4 h-4 text-yellow-400" />
      //         <span>{num.toFixed(1)}</span>
      //       </div>
      //     );
      //   },
      // },
      
      {
        accessorKey: 'lessons',
        header: 'Lessons',
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span>{row.original.lessons.length}</span>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedCourse(row.original);
                setEditFormData({
                  title: row.original.title,
                  description: row.original.description,
                  category: row.original.category,
                  price: row.original.price,
                });
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedCourse(row.original);
                setIsLessonsModalOpen(true);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedCourse(row.original);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(data.length / pageSize),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-500">Manage your courses and lessons</p>
          </div>
          <CreateCourseDialog />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Search courses..."
                  className="pl-9 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={(table.getColumn('category')?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn('category')?.setFilterValue(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {Array.from(new Set(data.map((course) => course.category))).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-sm font-medium text-gray-500 tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              'flex items-center space-x-1',
                              header.column.getCanSort() && 'cursor-pointer select-none'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            <span className="inline-flex flex-col">
                              <ChevronUp
                                className={cn(
                                  'w-3 h-3 -mb-1',
                                  header.column.getIsSorted() === 'asc'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  'w-3 h-3',
                                  header.column.getIsSorted() === 'desc'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                )}
                              />
                            </span>
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  {[5, 10, 20, 30, 40, 50].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600">
                  Page{' '}
                  <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
                  <span className="font-medium">{table.getPageCount()}</span>
                </span>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Make changes to your course here.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={editFormData.category || ''}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={editFormData.price || ''}
                onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Lessons Modal */}
      <Dialog open={isLessonsModalOpen} onOpenChange={setIsLessonsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Lessons</DialogTitle>
            <DialogDescription>
              View all lessons for {selectedCourse?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {selectedCourse?.lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Lesson {index + 1}: {lesson.title}
                  </h3>
                  <span className="text-sm text-gray-500">{lesson.duration}</span>
                </div>
                <p className="mt-1 text-gray-600">{lesson.description}</p>
                {lesson.videoUrl && (
                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    View Video
                  </a>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLessonsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCourse && handleDelete(selectedCourse._id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}