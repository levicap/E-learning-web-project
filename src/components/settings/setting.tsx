import React from 'react';
import { UserProfile } from '@clerk/clerk-react';
import InstructorProfile from './profile';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { useUser } from '@clerk/clerk-react';

const CustomSettings = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 mt-20 ml-0">
      <h1 className="text-3xl font-bold mb-4">Account Settings</h1>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="instructor">Instructor Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4">
          <UserProfile />
        </TabsContent>

        <TabsContent value="instructor" className="mt-4">
          <InstructorProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomSettings;
