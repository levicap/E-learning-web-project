import { SignedOut, SignUp } from '@clerk/clerk-react'
import Navbar from '../Landing/Navbar'
export default function Register() {
  return (
    <>
      <Navbar/>
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