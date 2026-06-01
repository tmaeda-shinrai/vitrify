import Link from "next/link";

import { clientEnv } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 block text-center font-display text-2xl font-bold text-primary"
        >
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </Link>
        {children}
      </div>
    </main>
  );
}
