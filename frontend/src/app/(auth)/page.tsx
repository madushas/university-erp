"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user) {
    // Just in case the redirect hasn't completed yet
    return null;
  }

  const demoUsers = [
    { role: 'Admin', username: 'admin', password: 'password' },
    { role: 'Instructor', username: 'dr_smith', password: 'password' },
    { role: 'Student', username: 'john_doe', password: 'password' },
  ];

  const copyCreds = async (u: string, p: string) => {
    try {
      await navigator.clipboard.writeText(`username: ${u}\npassword: ${p}`);
      toast.success('Credentials copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy + CTA */}
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                University ERP • Demo
              </span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                Streamline Academics with a Modern ERP
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                This is a demo environment. Explore role‑based dashboards, course management, and secure authentication.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </div>

              {/* Demo credentials */}
              <div className="mt-10 grid sm:grid-cols-3 gap-4">
                {demoUsers.map((item) => (
                  <div key={item.username} className="rounded-xl border border-gray-200 bg-white/60 backdrop-blur p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{item.role}</p>
                        <p className="mt-1 font-semibold text-gray-900">{item.username}</p>
                        <p className="text-sm text-gray-600">password: password</p>
                      </div>
                      <button
                        aria-label={`Copy ${item.role} credentials`}
                        onClick={() => copyCreds(item.username, item.password)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50 p-2"
                      >
                        <Copy className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                Use any of the above credentials to sign in. All demo accounts share the same password.
              </p>
            </div>

            {/* Visuals */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop"
                  alt="Campus walkway"
                  className="rounded-xl shadow-md object-cover h-48 sm:h-56 w-full"
                  loading="lazy"
                />
                <img
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=1200&auto=format&fit=crop"
                  alt="Students collaborating"
                  className="rounded-xl shadow-md object-cover h-48 sm:h-56 w-full"
                  loading="lazy"
                />
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop"
                  alt="Lecture hall"
                  className="rounded-xl shadow-md object-cover h-48 sm:h-56 w-full"
                  loading="lazy"
                />
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
                  alt="Library study area"
                  className="rounded-xl shadow-md object-cover h-48 sm:h-56 w-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ready to explore?</h2>
              <p className="text-gray-600">Jump straight into the app with the demo credentials or create your own account.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}