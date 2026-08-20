export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 size-[400px] rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 size-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
