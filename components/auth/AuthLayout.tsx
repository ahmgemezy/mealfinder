import { Link } from "@/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6 group">
            <div className="w-12 h-12 bg-linear-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300 mx-auto">
              <span className="text-2xl font-bold">W</span>
            </div>
          </Link>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="bg-card p-8 rounded-3xl shadow-soft border border-border/50">
          {children}
        </div>
      </div>
    </div>
  );
}
