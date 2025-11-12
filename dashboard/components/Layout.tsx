'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuth, clearAuth, hasRole } from '@/lib/auth';
import { User } from '@/types';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const lastPathRef = useRef<string>('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const authUser = getAuth();
    setUser(authUser);
    
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isRootPage = pathname === '/';
    
    // Only redirect if pathname changed since last check
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      
      if (isRootPage) {
        if (authUser) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
        return;
      }
      
      if (!authUser) {
        if (!isAuthPage) {
          router.replace('/login');
          return;
        }
      } else {
        if (isAuthPage) {
          router.replace('/dashboard');
          return;
        }
      }
    }
    
    // Set loading to false only when we're on the correct page
    if ((authUser && !isAuthPage && !isRootPage) || (!authUser && isAuthPage)) {
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  if (!mounted) {
    return null;
  }

  if (pathname === '/login' || pathname === '/register') {
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isAdmin = hasRole(['admin']);
  const isModerator = hasRole(['admin', 'moderator']);
  const isUser = hasRole(['user']);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                  Task Manager
                </Link>
              </div>
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                {isModerator && (
                  <Link
                    href="/projects"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      pathname === '/projects'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Projects
                  </Link>
                )}
                <Link
                  href="/tasks"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/tasks'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tasks
                </Link>
                <Link
                  href="/tickets"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === '/tickets'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tickets
                </Link>
                {isAdmin && (
                  <Link
                    href="/users"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      pathname === '/users'
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Users
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

