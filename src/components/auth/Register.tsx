import { SignedOut, SignUp } from '@clerk/clerk-react'
export default function Register() {
  return (
    <>
    <div className="flex justify-center items-center min-h-screen">
      <SignedOut>
        <SignUp 
          afterSignUpUrl="/role-selection"
          redirectUrl="/role-selection"
        />
      </SignedOut>
    </div>
    </>
  )
}