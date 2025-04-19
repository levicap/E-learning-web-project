import React from 'react';
import { UserProfile } from '@clerk/clerk-react';

const CustomSettings = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 mt-20">
      <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
      {/* 
        routing="path" tells it to use your React Router (or similar) 
        and path="/settings/*" should match whatever route you've mounted this on.
      */}
      <UserProfile />
    </div>
  );
};

export default CustomSettings;
