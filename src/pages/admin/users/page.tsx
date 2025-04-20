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

// Mock data for demonstration
const stats = {
  totalUsers: 1234,
  activeUsers: 987,
  pendingUsers: 56,
  admins: 12,
  instructors: 45
};

const recentSignups = [
  { id: 1, name: "Sarah Wilson", role: "Student", time: "2 hours ago" },
  { id: 2, name: "John Doe", role: "Instructor", time: "5 hours ago" },
  { id: 3, name: "Emma Brown", role: "Student", time: "1 day ago" },
  { id: 4, name: "Michael Chen", role: "Student", time: "1 day ago" },
  { id: 5, name: "Lisa Taylor", role: "Admin", time: "2 days ago" }
];

const activityLogs = [
  { id: 1, action: "Role Change", user: "James Smith", details: "Changed from Student to Instructor", time: "1 hour ago" },
  { id: 2, action: "User Deleted", user: "Admin", details: "Removed inactive account", time: "3 hours ago" },
  { id: 3, action: "Login", user: "Maria Garcia", details: "Successful login from new device", time: "5 hours ago" },
  { id: 4, action: "Role Change", user: "Admin", details: "Updated user permissions", time: "1 day ago" }
];

// Mock data for charts
const userGrowthData = [
  { month: 'Jan', users: 800 },
  { month: 'Feb', users: 967 },
  { month: 'Mar', users: 1098 },
  { month: 'Apr', users: 1234 },
  { month: 'May', users: 1378 },
  { month: 'Jun', users: 1489 }
];

const roleDistributionData = [
  { name: 'Students', value: 1177, color: '#3B82F6' },
  { name: 'Instructors', value: 45, color: '#6366F1' },
  { name: 'Admins', value: 12, color: '#8B5CF6' }
];

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
        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeUsers}</h3>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Users</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingUsers}</h3>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.admins}</h3>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructors</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.instructors}</h3>
                </div>
                <GraduationCap className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-500" />
                User Growth
              </CardTitle>
              <CardDescription>Monthly user registration trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="userGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="month" className="text-xs text-gray-600 dark:text-gray-400" />
                    <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#userGrowth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Role Distribution Chart */}
          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Role Distribution
              </CardTitle>
              <CardDescription>User roles breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePieChart>
                    <Pie
                      data={roleDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </RechartsePieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {roleDistributionData.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Sign-ups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recent Sign-ups */}
          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Recent Sign-ups
              </CardTitle>
              <CardDescription>Latest users who joined the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSignups.map((signup) => (
                  <div key={signup.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{signup.name}</p>
                      <p className="text-sm text-gray-500">{signup.role}</p>
                    </div>
                    <span className="text-sm text-gray-500">{signup.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-green-500" />
                Activity Logs
              </CardTitle>
              <CardDescription>Recent system activities and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                      <p className="text-sm text-gray-500">{log.details}</p>
                    </div>
                    <span className="text-sm text-gray-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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