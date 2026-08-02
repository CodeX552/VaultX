export function HomePage() {
  // Landing page ka kaam product ka core message clearly present karna hai.
  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col justify-center px-6 py-20">
      <div className="max-w-3xl">
        {/* Short hero badge user ko instantly context deta hai. */}
        <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm text-emerald-300">
          Secure Password Manager
        </p>
        {/* Main headline project ke security focus ko highlight karta hai. */}
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
          VaultX protects credentials with encrypted storage and modern auth.
        </h1>
        {/* Subtext me tech stack aur product maturity ka signal diya gaya hai. */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          A production-ready password vault built with React, TypeScript, Node.js, PostgreSQL, and AES-256-GCM.
        </p>
      </div>
    </section>
  );
}
