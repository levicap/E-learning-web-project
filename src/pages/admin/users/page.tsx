import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { columns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { getUsers, deleteUsers,createUser, updateUser } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { UserFormModal } from "@/components/UserFormModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, Users, UserCheck, Clock, Shield, GraduationCap, LineChart, PieChart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsePieChart, Pie, Cell } from 'recharts';




export default function UsersPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(null);
  const [filters, setFilters] = useState({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', pagination, sorting, filters],
    queryFn: () => getUsers(pagination, filters, sorting || undefined),
  });
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User created successfully' });
      setIsUserFormOpen(false);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) => 
      updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'User updated successfully' });
      setIsUserFormOpen(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteUsers(ids, []),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}.`,
      });
      setSelectedUsers([]);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete users. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    if (selectedUsers.length === 0) return;
    deleteMutation.mutate(selectedUsers);
    setIsDeleteDialogOpen(false);
  };

  const handleRowSelectionChange = (selectedRows: Record<string, boolean>) => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);
    setSelectedUsers(selectedIds);
  };
  const CustomToolbar = React.useCallback(
    (props: any) => (
      <DataTableToolbar
        {...props}
        onAddUser={() => {
          setSelectedUser(null);
          setIsUserFormOpen(true);
        }}
      />
    ),
    []
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
    

        {/* Users Table */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-xl transition-all duration-200 hover:shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Users Management
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400">
                  Manage your LMS users and their permissions efficiently
                </CardDescription>
              </div>
              {selectedUsers.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="transition-all duration-200 hover:scale-105"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete {selectedUsers.length} Selected
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
          <div className="relative">
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <DataTable
              data={data?.data || []}
              columns={columns}
              toolbar={CustomToolbar}
              pagination={{
                pageCount: data?.totalPages || 0,
                ...pagination,
              }}
              sorting={sorting}
              onPaginationChange={setPagination}
              onSortingChange={setSorting}
              onFiltersChange={setFilters}
              onRowSelectionChange={handleRowSelectionChange}
              className="transition-all duration-200"
             
            />
          </div>
        </CardContent>
      </Card>


        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUsers.length} selected user{selectedUsers.length > 1 ? 's' : ''}? 
                This action cannot be undone and will permanently remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <UserFormModal
        open={isUserFormOpen}
        onOpenChange={setIsUserFormOpen}
        user={selectedUser}
        onSubmit={async (data) => {
          if (selectedUser) {
            await updateMutation.mutateAsync({
              userId: selectedUser._id,
              updates: data,
            });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
      </div>
    </div>
  );
}