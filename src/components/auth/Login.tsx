import { SignedOut, SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <SignedOut>
          <SignIn 
            signUpUrl="/register"
            afterSignInUrl="/role-check" // Add this redirect

          />
        </SignedOut>
      </div>
    </>
  );
}