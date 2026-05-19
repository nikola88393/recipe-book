import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, Shield } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f2' }}>

      {/* ── Floating Pill Header ──────────────────────────────────────────── */}
      <div className="sticky top-4 z-40 px-5 md:px-10 w-full">
        <header
          className="max-w-[1200px] mx-auto rounded-full px-6 md:px-10 py-3 md:py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(245, 244, 237, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0px 0px 0px 1px #e8e6dc',
          }}
        >
          <a
            href="#"
            className="italic text-2xl md:text-3xl font-medium transition-opacity hover:opacity-75"
            style={{ fontFamily: 'Literata, Georgia, serif', color: '#3b6840' }}
          >
            Heirloom Kitchen
          </a>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-8">
              {['Features', 'About', 'Sign In'].map(label => (
                <Link
                  key={label}
                  to={label === 'Sign In' ? '/login' : '#'}
                  className="text-sm transition-colors duration-200"
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    color: '#5f5e5d',
                    fontWeight: 400,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#3b6840')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#5f5e5d')}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="h-4 w-px" style={{ backgroundColor: '#f0eee6' }} />
            <Link
              to="/register"
              className="btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>
          <Link
            to="/login"
            className="md:hidden btn-primary text-sm"
          >
            Sign In
          </Link>
        </header>
      </div>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section
        className="w-full border-b mt-8"
        style={{ backgroundColor: '#f5f4ed', borderColor: '#f0eee6' }}
      >
        <div
          className="max-w-[1200px] mx-auto flex flex-col items-center text-center"
          style={{ padding: 'clamp(60px, 10vw, 120px) clamp(20px, 4vw, 40px)' }}
        >
          <span
            className="mb-6 uppercase tracking-widest"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#5e5d59',
              letterSpacing: '0.1em',
            }}
          >
            Editorial Minimalism
          </span>

          <h1
            className="max-w-4xl mb-6 text-balance"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: 500,
              lineHeight: 1.1,
              color: '#1b1c18',
            }}
          >
            A Sanctuary for Your Family's Culinary Legacy
          </h1>

          <p
            className="max-w-2xl mb-10 text-balance"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              fontSize: '20px',
              lineHeight: 1.6,
              color: '#5e5d59',
            }}
          >
            Preserve the recipes that matter. Curate a beautiful, distraction-free library of your
            favorite dishes, designed with the quiet reverence of a linen-bound cookbook.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 font-medium text-sm px-8 py-4 rounded-xl ring-shadow transition-all duration-200"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                backgroundColor: '#94c595',
                color: '#26522d',
              }}
            >
              Start Your Collection
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-medium text-sm px-8 py-4 rounded-xl ring-shadow transition-colors duration-200"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                backgroundColor: '#faf9f5',
                color: '#4d4c48',
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Hero Image */}
          <div
            className="mt-16 w-full max-w-5xl rounded-2xl overflow-hidden ring-shadow whisper-shadow relative"
            style={{
              aspectRatio: '21/9',
              backgroundColor: '#efeee7',
              minHeight: '200px',
            }}
          >
            {/* Decorative editorial hero */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #efeee7 0%, #e3e3dc 100%)',
              }}
            >
              <div className="text-center" style={{ padding: '40px' }}>
                <div
                  className="italic mb-3"
                  style={{
                    fontFamily: 'Literata, Georgia, serif',
                    fontSize: 'clamp(24px, 4vw, 48px)',
                    fontWeight: 500,
                    color: '#3b6840',
                    lineHeight: 1.2,
                  }}
                >
                  "Cooking is a craft, and every recipe is a story worth preserving."
                </div>
                <div
                  className="uppercase tracking-widest"
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#87867f',
                    letterSpacing: '0.08em',
                  }}
                >
                  Heirloom Kitchen — A Digital Cookbook
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Editorial / Mission Section ───────────────────────────────────── */}
      <section
        className="max-w-[1200px] mx-auto"
        style={{
          padding: 'clamp(60px, 8vw, 80px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Text */}
          <div className="md:col-span-5 md:col-start-2 flex flex-col gap-6 order-2 md:order-1">
            <h2
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 500,
                color: '#1b1c18',
                lineHeight: 1.3,
              }}
            >
              Slow Living in the Digital Kitchen.
            </h2>
            <p
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#4d4c48',
              }}
            >
              We believe that cooking is a craft, and the recipes we pass down are stories. Heirloom
              Kitchen strips away the noise of modern digital recipe sites — the aggressive ads, the
              endless scrolling, the auto-playing videos.
            </p>
            <p
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#4d4c48',
              }}
            >
              What remains is a quiet, beautifully typeset canvas where your family's culinary history
              can breathe. It's not just about saving instructions; it's about preserving intent.
            </p>
            <div>
              <Link
                to="/register"
                className="font-medium text-sm underline underline-offset-4 transition-all"
                style={{
                  fontFamily: 'Libre Franklin, Arial, sans-serif',
                  color: '#3b6840',
                  textDecorationColor: '#94c595',
                }}
              >
                Begin your collection →
              </Link>
            </div>
          </div>

          {/* Bento grid */}
          <div className="md:col-span-5 md:col-start-8 order-1 md:order-2 grid grid-cols-2 gap-4">
            <div
              className="col-span-2 rounded-xl ring-shadow overflow-hidden flex items-center justify-center"
              style={{ height: '192px', backgroundColor: '#efeee7' }}
            >
              <div className="text-center p-6">
                <div
                  className="italic mb-2"
                  style={{
                    fontFamily: 'Literata, Georgia, serif',
                    fontSize: '24px',
                    fontWeight: 500,
                    color: '#3b6840',
                  }}
                >
                  Grandmother's Apple Pie
                </div>
                <div
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    fontSize: '12px',
                    color: '#87867f',
                    letterSpacing: '0.06em',
                  }}
                >
                  8 INGREDIENTS · 3 STEPS
                </div>
              </div>
            </div>
            <div
              className="rounded-xl ring-shadow p-6 flex flex-col justify-between"
              style={{ height: '160px', backgroundColor: '#e8e6dc' }}
            >
              <BookOpen size={28} style={{ color: '#3b6840' }} />
              <span
                className="leading-tight"
                style={{
                  fontFamily: 'Literata, Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#424940',
                }}
              >
                Organic<br />Curation
              </span>
            </div>
            <div
              className="rounded-xl ring-shadow p-6 flex flex-col justify-between"
              style={{ height: '160px', backgroundColor: '#e3e3dc' }}
            >
              <Sparkles size={28} style={{ color: '#5f5e5d' }} />
              <span
                className="leading-tight"
                style={{
                  fontFamily: 'Literata, Georgia, serif',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#424940',
                }}
              >
                Tactile<br />Typography
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards Section ─────────────────────────────────────────── */}
      <section
        className="border-t"
        style={{
          backgroundColor: '#f5f4ed',
          borderColor: '#f0eee6',
          padding: 'clamp(60px, 8vw, 80px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <span
              className="mb-4 uppercase tracking-widest block"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                color: '#87867f',
                letterSpacing: '0.1em',
              }}
            >
              Why Heirloom Kitchen
            </span>
            <h2
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 500,
                color: '#1b1c18',
                lineHeight: 1.2,
              }}
            >
              Designed for Culinary Legacy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <BookOpen size={24} style={{ color: '#3b6840' }} />,
                bg: 'rgba(148, 197, 149, 0.15)',
                title: 'Editorial Design',
                desc: 'A reading experience closer to a magazine than a dashboard. Generous typography and warm parchment tones create a calming, focused environment.',
              },
              {
                icon: <Shield size={24} style={{ color: '#5f5e5d' }} />,
                bg: '#e8e6dc',
                title: 'Your Recipes, Your Data',
                desc: 'Recipes are synced to your personal account and accessible from any device. Private and secure by design.',
              },
              {
                icon: <Sparkles size={24} style={{ color: '#276b3d' }} />,
                bg: 'rgba(130, 200, 146, 0.15)',
                title: 'Smart Import',
                desc: 'Import recipes from any website with a single link. Our AI extracts ingredients and steps automatically so you can focus on cooking.',
              },
            ].map(({ icon, bg, title, desc }) => (
              <div
                key={title}
                className="rounded-lg ring-shadow whisper-shadow p-6 flex flex-col gap-4"
                style={{ backgroundColor: '#faf9f5' }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: bg }}
                >
                  {icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'Literata, Georgia, serif',
                    fontSize: '21px',
                    fontWeight: 500,
                    color: '#1b1c18',
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    fontSize: '15px',
                    lineHeight: 1.6,
                    color: '#5e5d59',
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) clamp(20px, 4vw, 40px)' }}>
        <div
          className="max-w-[1200px] mx-auto rounded-2xl ring-shadow text-center"
          style={{ backgroundColor: '#efeee7', padding: 'clamp(48px, 6vw, 80px) 40px' }}
        >
          <h2
            className="mb-6"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 500,
              color: '#1b1c18',
              lineHeight: 1.2,
            }}
          >
            Begin Your Culinary Journey
          </h2>
          <p
            className="max-w-xl mx-auto mb-10"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              fontSize: '18px',
              lineHeight: 1.6,
              color: '#5e5d59',
            }}
          >
            Create your free account today and start building your personal recipe legacy.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 font-medium text-base px-8 py-4 rounded-xl ring-shadow transition-all duration-200"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              backgroundColor: '#94c595',
              color: '#26522d',
            }}
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{
          backgroundColor: '#f5f4ed',
          borderColor: '#f0eee6',
          padding: 'clamp(40px, 6vw, 60px) clamp(20px, 4vw, 40px)',
        }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div
            className="italic text-2xl font-medium"
            style={{ fontFamily: 'Literata, Georgia, serif', color: '#3b6840' }}
          >
            Heirloom Kitchen
          </div>
          <div className="flex flex-col items-center md:items-end gap-3">
            <nav className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map(label => (
                <a
                  key={label}
                  href="#"
                  className="text-sm transition-colors duration-200"
                  style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#5f5e5d' }}
                >
                  {label}
                </a>
              ))}
            </nav>
            <p
              className="text-sm"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
            >
              © 2025 Heirloom Kitchen. A digital sanctuary for culinary legacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
