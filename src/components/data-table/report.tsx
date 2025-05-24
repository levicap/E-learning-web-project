import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpDown,
  CheckCircle2,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react';

interface Report {
  id: string;
  username: string;
  sessionName: string;
  instructorEmail: string;
  instructorPhone: string;
  reason: string;
  description: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const initialReports: Report[] = [
  {
    id: 'r1',
    username: 'alex_smith',
    sessionName: 'Weekly Meeting',
    reason: 'Inappropriate behavior',
    description: 'User was disruptive during the session and used inappropriate language',
    date: '2025-02-15T10:30:00Z',
    status: 'pending',
  },
  {
    id: 'r2',
    username: 'maria_jones',
    sessionName: 'Product Demo',
    reason: 'Technical issue',
    description: "User reported screen sharing wasn't working properly throughout the session",
    date: '2025-02-14T14:15:00Z',
    status: 'reviewed',
  },
  // ... (previous reports data)
];

function ReportTable() {
  const [reports, setReports] = useState(initialReports);
  const [searchQuery, setSearchQuery] = useState('');

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'username',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent"
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('username')}</div>
      ),
    },
    {
      accessorKey: 'sessionName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent"
        >
          Session Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'reason',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent"
        >
          Reason
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description: string = row.getValue('description');
        return (
          <div className="max-w-[400px] truncate" title={description}>
            {description}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge
            variant="outline"
            className={
              status === 'pending'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : status === 'reviewed'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const report = row.original;

        const handleResolve = () => {
          setReports((prev) =>
            prev.map((r) =>
              r.id === report.id ? { ...r, status: 'resolved' as const } : r
            )
          );
        };

        const handleDelete = () => {
          setReports((prev) => prev.filter((r) => r.id !== report.id));
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(report.id)}
              >
                Copy report ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {report.status !== 'resolved' && (
                <DropdownMenuItem onClick={handleResolve}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as resolved
                </DropdownMenuItem>
              )}
              {report.status === 'resolved' && (
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: setSearchQuery,
  });

  return (
    <div className="min-h-screen bg-background mt-20">
      <div className="container mx-auto py-10">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">Reports</CardTitle>
              <CardDescription>
                Manage user-submitted reports across all sessions
              </CardDescription>
            </div>
            <Badge className="px-4 py-1.5 text-base bg-primary">
              {reports.length} Reports
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 transition-all duration-200 border-2 focus-visible:ring-2"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportTable;