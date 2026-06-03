import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Zap, Flame, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface NavLink {
  label: string;
  href: string;
  type: 'route' | 'anchor';
}

const navLinks: NavLink[] = [
  { label: 'Home', href: '/', type: 'route' },
  { label: 'Sagas', href: '#sagas', type: 'anchor' },
  { label: 'Fusion Chamber', href: '#fusion-chamber', type: 'anchor' },
  { label: 'Fighters', href: '/characters', type: 'route' },
  { label: 'Lore', href: '/lore', type: 'route' }
];

export default function Navbar() {
  const [location] = useLocation();
  const [kiLevel, setKiLevel] = useState(8900);
  const [isCharging, setIsCharging] = useState(false);

  // Handle Ki Energy Level fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isCharging) {
        setKiLevel((prev) => {
          if (prev >= 9999) return 9000 + Math.floor(Math.random() * 999);
          return prev + Math.floor(Math.random() * 150) + 50;
        });
      } else {
        setKiLevel((prev) => {
          const base = 8900 + Math.floor(Math.sin(Date.now() / 1000) * 100);
          return base;
        });
      }
    }, 150);
    return () => clearInterval(interval);
  }, [isCharging]);

  return (
    <nav 
      id="navbar" 
      className="sticky top-0 z-50 w-full border-b-2 border-[oklch(0.65_0.25_45)] bg-background/90 backdrop-blur-md shadow-[0_4px_30px_rgba(234,88,12,0.15)] transition-all duration-300"
    >
      {/* Super Saiyan Aura glowing boundary underneath */}
      <div className="absolute bottom-[-2px] left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[oklch(0.65_0.25_45)] to-transparent opacity-80 animate-pulse" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Glowing 4-Star Logo Group */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.85_0.21_85)] to-[oklch(0.65_0.25_45)] shadow-[0_0_15px_oklch(0.65_0.25_45)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[360deg]">
              {/* 4 Star Layout inside Orange Dragon Ball */}
              <div className="grid grid-cols-2 gap-1 p-1.5">
                {[1, 2, 3, 4].map((star) => (
                  <svg 
                    key={star} 
                    className="h-2.5 w-2.5 fill-red-600 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] animate-pulse" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192z"/>
                  </svg>
                ))}
              </div>
              {/* Highlight Overlay */}
              <div className="absolute top-1 left-1.5 h-3 w-4 rounded-full bg-white/40 blur-[1px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-widest text-foreground uppercase group-hover:text-[oklch(0.85_0.21_85)] transition-colors duration-200">
                DragonBall
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-[oklch(0.65_0.25_45)] uppercase">
                Universe
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.type === 'route' ? (
                <Link 
                  key={link.label}
                  href={link.href}
                  className={`relative text-sm font-semibold tracking-wider uppercase transition-colors duration-300 hover:text-[oklch(0.85_0.21_85)] ${
                    location === link.href ? 'text-[oklch(0.65_0.25_45)]' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                  {location === link.href && (
                    <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-[oklch(0.65_0.25_45)] shadow-[0_0_8px_oklch(0.65_0.25_45)]" />
                  )}
                </Link>
              ) : (
                <a 
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold tracking-wider uppercase text-muted-foreground transition-all duration-300 hover:text-[oklch(0.85_0.21_85)] hover:shadow-[0_2px_0_oklch(0.85_0.21_85)]"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Interactive Ki Energy Meter */}
          <div 
            className="hidden lg:flex items-center gap-4 px-4 py-2 rounded-xl bg-card border border-muted-foreground/20 cursor-pointer select-none group transition-all duration-300 hover:border-[oklch(0.65_0.25_45)] hover:shadow-[0_0_15px_rgba(234,88,12,0.1)]"
            onMouseEnter={() => setIsCharging(true)}
            onMouseLeave={() => setIsCharging(false)}
          >
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  {isCharging ? 'Charging Ki' : 'Power Level'}
                </span>
                <Flame className={`h-3 w-3 ${isCharging ? 'text-[oklch(0.65_0.25_45)] animate-bounce' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-sm font-mono font-black ${kiLevel > 9000 ? 'text-[oklch(0.65_0.25_45)] animate-pulse' : 'text-foreground'}`}>
                {kiLevel > 9000 ? 'OVER 9000!' : `${kiLevel} bp`}
              </span>
            </div>

            {/* Interactive energy meter level bar */}
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden relative border border-muted-foreground/10">
              <div 
                className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-[oklch(0.65_0.25_45)] to-[oklch(0.85_0.21_85)]"
                style={{ width: `${Math.min(100, ((kiLevel - 8000) / 2000) * 100)}%` }}
              />
              {isCharging && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_0.5s_linear_infinite]" />
              )}
            </div>
          </div>

          {/* Mobile Sheet Trigger / Hamburger */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-[oklch(0.65_0.25_45)]/10 text-foreground hover:text-[oklch(0.65_0.25_45)]"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l-2 border-[oklch(0.65_0.25_45)] bg-background text-foreground p-6">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left text-xs font-black tracking-[0.25em] text-[oklch(0.65_0.25_45)] uppercase">
                    DRAGONBALL UNIVERSE
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    link.type === 'route' ? (
                      <Link 
                        key={link.label}
                        href={link.href}
                        className={`text-lg font-bold tracking-wider uppercase transition-colors duration-200 hover:text-[oklch(0.85_0.21_85)] ${
                          location === link.href ? 'text-[oklch(0.65_0.25_45)]' : 'text-foreground'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        key={link.label}
                        href={link.href}
                        className="text-lg font-bold tracking-wider uppercase text-foreground transition-colors duration-200 hover:text-[oklch(0.85_0.21_85)]"
                      >
                        {link.label}
                      </a>
                    )
                  ))}
                </div>

                {/* Mobile Ki Tracker status indicator */}
                <div className="mt-12 p-4 rounded-xl border border-muted bg-card flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black tracking-widest uppercase text-muted-foreground">Current Ki:</span>
                    <span className="text-sm font-mono font-black text-[oklch(0.65_0.25_45)]">{kiLevel} bp</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[oklch(0.65_0.25_45)]" 
                      style={{ width: `${Math.min(100, ((kiLevel - 8000) / 2000) * 100)}%` }}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}