import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <Image src="/next.svg" alt="Next.js logo" width={40} height={16} className="dark:invert" />
        <span className="text-xl font-bold text-black dark:text-zinc-50">MyApp</span>
      </div>
      <nav className="flex items-center gap-4">
        <Show when="signed-in">
          <Link href="/clients" className="px-4 py-2 text-black dark:text-white hover:bg-black/[.04] dark:hover:bg-[#1a1a1a] rounded">
            Clients
          </Link>
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 rounded border border-black/[.08] dark:border-white/[.145] hover:bg-black/[.04] dark:hover:bg-[#1a1a1a]">Sign Up</button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </nav>
    </header>
  );
}
