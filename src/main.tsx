import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ClerkProvider} from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) {
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
          <ClerkProvider publishableKey={clerkPubKey}>

    <App />
    </ClerkProvider>

  </StrictMode>
);
