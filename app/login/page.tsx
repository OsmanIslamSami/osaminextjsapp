import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md dark:bg-zinc-900">
        <h2 className="mb-6 text-2xl font-bold text-center text-black dark:text-zinc-50">Sign In</h2>
        <SignIn routing="path" path="/login" />
      </div>
    </div>
  );
}
