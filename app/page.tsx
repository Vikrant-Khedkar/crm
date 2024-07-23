import { SignIn, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to PersonalNexus</h1>
      <SignedOut>
        <SignIn />
      </SignedOut>
      <SignedIn>
        <div className="flex flex-col items-center">
          <UserButton />
          <Link href="/dashboard" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Dashboard
          </Link>
        </div>
      </SignedIn>
    </main>
  )
}