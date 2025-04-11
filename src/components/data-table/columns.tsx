import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const initials = row.getValue<string>('name')
        .split(' ')
        .map((n) => n[0])
        .join('');
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-violet-500 to-purple-500">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${initials}`} />
            <AvatarFallback className="text-white">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{row.getValue('name')}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue<string>('role');
      return (
        <Badge variant={
          role === 'student' ? 'destructive' : 
          role === 'teacher' ? 'default' : 
          'secondary'
        } className="bg-opacity-10 text-opacity-90">
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => row.getValue('email'),
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(row.getValue('createdAt')), { addSuffix: true })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row}
      />
    ),
  },
];