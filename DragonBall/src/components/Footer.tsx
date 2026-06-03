import React, { useState } from 'react';
import { Link } from 'wouter';
import { Hash, Link2, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FooterLink {
  label: string;
  href: string;
  type: 'route' | 'anchor';
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const footerLinks: FooterLink[] = [
    { label: 'Home', href: '/', type: 'route' },
    { label: 'Sagas', href: '#sagas', type: 'anchor' },
    { label: 'Fusion', href: '#fusion-chamber', type: 'anchor' },
    { label: 'Fighters', href: '/characters', type: 'route' },
    { label: 'Lore', href: '/lore', type: 'route' }
  ];

  const socialLinks = [
    { icon: Hash, label: 'GitHub', href: 'https://github.com' },
    { icon: Link2, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: ExternalLink, label: 'Twitter', href: 'https://twitter.com' },
    { icon: Share2, label: 'Facebook', href: 'https://facebook.com' }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSubscribed(true);
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <footer
      id="footer"
      className="relative bg-black text-muted-foreground border-t border-amber-500/20 overflow-hidden py-12 md:py-16"
    >
      {/* Celestial Background & Amber Highlights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(245,158,11,0.05),_transparent_40%)] pointer-events-none" />
      
      {/* Star Cluster Simulation Effect */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:48px_48px] [background-position:12px_12px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-10 border-b border-zinc-800">
          
          {/* Column 1: Brand & Tribute */}
          <div className="col-span-1 md:col-span-4 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-200">
                CAPSULE CORP.
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              In memory of <strong className="text-amber-400 font-semibold">Akira Toriyama</strong> (1955–2024). Thank you for inspiring generations with your legendary art, timeless humor, and boundless imagination.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="col-span-1 md:col-span-3 flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
              Quick Links
            </h3>
            <nav className="flex flex-col space-y-2 text-sm">
              {footerLinks.map((link) => (
                link.type === 'route' ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-zinc-400 hover:text-amber-400 hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-zinc-400 hover:text-amber-400 hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>
          </div>

          {/* Column 3: Newsletter Form */}
          <div className="col-span-1 md:col-span-5 flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
              Capsule Corp Energy Updates
            </h3>
            <p className="text-sm text-zinc-400">
              Receive global energy level status checks and occasional news updates direct from our headquarters.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 pt-1">
              <Input
                type="email"
                placeholder="Your Saiyan ID or Email..."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribed || loading}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-amber-500 focus-visible:border-amber-500"
              />
              <Button
                type="submit"
                disabled={subscribed || loading}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold tracking-wide transition-all shrink-0"
              >
                {loading ? 'Transmitting...' : subscribed ? 'Energy Secured!' : 'Subscribe'}
              </Button>
            </form>
            {subscribed && (
              <p className="text-xs text-amber-400 animate-pulse">
                ✓ Transmitting coordinates. Power level reading incoming.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Capsule Corporation. This site is created to celebrate DBZ, non-affiliated with Toei Animation, Bird Studio, or Shueisha.
          </p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-zinc-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-zinc-400 cursor-pointer">Terms of Use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}