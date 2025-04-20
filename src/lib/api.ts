import axios from 'axios';
import { User, FilterState, PaginationState, SortingState } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export async function getUsers(
  pagination: PaginationState,
  filters: FilterState,
  sorting?: SortingState
) {
  const params = new URLSearchParams({
    page: (pagination.pageIndex + 1).toString(),
    limit: pagination.pageSize.toString(),
    ...filters,
    ...(sorting && { sort: `${sorting.desc ? '-' : ''}${sorting.id}` }),
  });

  const response = await api.get(`/users?${params}`);
  return response.data;
}

export async function deleteUser(userId: string) {
  return api.delete(`/users/${userId}`);
}

export async function deleteUsers(userIds: string[]) {
  return Promise.all(userIds.map(id => deleteUser(id)));
}

export async function createUser(userData: {
  name: string;
  email: string;
  role: string;
  password?: string;
}) {
  const response = await api.post('/users', userData);
  return response.data;
}

export async function updateUser(userId: string, updates: {
  name?: string;
  email?: string;
  role?: string;
}) {
  const response = await api.put(`/users/${userId}`, updates);
  return response.data;
}