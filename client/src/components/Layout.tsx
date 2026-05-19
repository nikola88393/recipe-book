
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Plus, Home, User, LogOut } from 'lucide-react';

export function Layout() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();


  async function handleSignOut() {
    await signOut(auth);
    navigate('/', { replace: true });
  }

  const isActive = (path: string) => location.pathname === path;



  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fbf9f2' }}>

      {/* ── Desktop Floating Header ────────────────────────────────────────── */}
      <div className="hidden md:block sticky top-4 z-40 px-6 w-full max-w-[1200px] mx-auto">
        <header
          className="rounded-full px-8 py-3 flex items-center justify-between float-shadow ring-shadow"
          style={{
            backgroundColor: 'rgba(245, 244, 237, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            className="font-literata font-medium italic text-2xl transition-opacity hover:opacity-75"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              color: '#3b6840',
              letterSpacing: '-0.01em',
            }}
          >
            Heirloom Kitchen
          </Link>

          {/* Desktop Nav */}
          <nav className="flex items-center gap-8">
            <Link
              to="/book"
              className="font-franklin text-sm transition-colors duration-200"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                color: isActive('/book') ? '#3b6840' : '#5f5e5d',
                fontWeight: isActive('/book') ? 500 : 400,
              }}
            >
              Cookbook
            </Link>
            <Link
              to="/book/recipe/new"
              className="font-franklin text-sm transition-colors duration-200"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                color: isActive('/book/recipe/new') ? '#3b6840' : '#5f5e5d',
                fontWeight: isActive('/book/recipe/new') ? 500 : 400,
              }}
            >
              Add Recipe
            </Link>

            <div className="h-4 w-px bg-border-cream" />

            {/* User area */}
            {user && (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? 'Account'}
                    className="w-8 h-8 rounded-full object-cover ring-shadow"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-franklin font-semibold text-sm select-none ring-shadow"
                    style={{
                      backgroundColor: '#94c595',
                      color: '#002108',
                      fontFamily: 'Libre Franklin, Arial, sans-serif',
                    }}
                  >
                    {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="flex items-center transition-colors duration-200 hover:opacity-70"
                  style={{ color: '#87867f' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </nav>
        </header>
      </div>

      {/* ── Mobile Header ─────────────────────────────────────────────────── */}
      <header
        className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 py-3 border-b"
        style={{
          backgroundColor: 'rgba(245, 244, 237, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: '#f0eee6',
        }}
      >
        <Link
          to="/"
          className="font-medium italic text-xl"
          style={{
            fontFamily: 'Literata, Georgia, serif',
            color: '#3b6840',
          }}
        >
          Heirloom Kitchen
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? 'Account'}
                className="w-8 h-8 rounded-full object-cover ring-shadow"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm"
                style={{ backgroundColor: '#94c595', color: '#002108' }}
              >
                {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{ color: '#87867f' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main
        className="flex-1 w-full mx-auto pb-24 md:pb-0"
        style={{
          maxWidth: '1200px',
          paddingLeft: 'clamp(20px, 4vw, 40px)',
          paddingRight: 'clamp(20px, 4vw, 40px)',
          paddingTop: '32px',
        }}
      >
        <Outlet />
      </main>

      {/* ── Mobile Bottom Navigation ───────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t pb-safe"
        style={{
          backgroundColor: '#f5f4ed',
          borderColor: '#f0eee6',
        }}
      >
        <div className="flex justify-around items-center px-4 py-2">
          {/* Home */}
          <Link
            to="/book"
            aria-current={isActive('/book') ? 'page' : undefined}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-150"
            style={{
              backgroundColor: isActive('/book') ? '#83c892' : 'transparent',
              color: isActive('/book') ? '#09552a' : '#5e5d59',
            }}
          >
            <Home size={22} />
            <span
              className="font-medium mt-0.5"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', fontSize: '10px' }}
            >
              Cookbook
            </span>
          </Link>

          {/* Add */}
          <Link
            to="/book/recipe/new"
            aria-current={isActive('/book/recipe/new') ? 'page' : undefined}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-150"
            style={{
              backgroundColor: isActive('/book/recipe/new') ? '#83c892' : 'transparent',
              color: isActive('/book/recipe/new') ? '#09552a' : '#5e5d59',
            }}
          >
            <Plus size={22} />
            <span
              className="font-medium mt-0.5"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', fontSize: '10px' }}
            >
              Add
            </span>
          </Link>

          {/* Profile / Sign out */}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-150"
            style={{ color: '#5e5d59' }}
          >
            <User size={22} />
            <span
              className="font-medium mt-0.5"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', fontSize: '10px' }}
            >
              Sign Out
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
