import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Menu, Activity, Cpu, Radio, ChevronRight, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavLink {
  label: string;
  href: string;
  type: "route" | "anchor";
}

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const [powerLevel, setPowerLevel] = useState(8990);
  const [isOpen, setIsOpen] = useState(false);

  // Simulated dynamic Saiyan power indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerLevel((prev) => {
        if (prev >= 9005) return 8990;
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const links: NavLink[] = [
    { label: "Home", href: "/", type: "route" },
    { label: "Saiyans", href: "#characters", type: "anchor" },
    { label: "Scanner", href: "#saiyan-scanner", type: "anchor" },
    { label: "Universe 7", href: "/universe", type: "route" },
    { label: "Shenron Quest", href: "/universe#summon-shenron", type: "anchor" }
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (href.includes("#")) {
      // For cross-page anchors like /universe#summon-shenron
      const [path, hash] = href.split("#");
      if (location === path) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } 
    }
  };

  return (
    <nav id="navbar" className="sticky top-0 z-50 w-full border-b-2 border-primary/30 bg-background/85 backdrop-blur-md shadow-[0_4px_30px_rgba(168,85,247,0.15)] before:absolute before:bottom-0 before:left-0 before:h-[1px] before:w-full before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Saiyan Crest HUD */}
          <div className="flex items-center gap-3">
            <Link href="/" className="relative group flex items-center gap-2 text-xl font-black tracking-widest text-primary transition-all duration-300 hover:text-accent">
              <div className="relative">
                <Zap className="h-7 w-7 text-accent fill-accent animate-pulse relative z-10 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                <span className="absolute -inset-1 rounded-full bg-accent/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity"></span>
              </div>
              <span className="font-mono tracking-tighter text-foreground">
                FRIEZA<span className="text-primary font-sans font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">FORCE</span>
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300"></span>
            </Link>

            {/* Live Sci-Fi HUD Indicator */}
            <div className="hidden lg:flex items-center gap-2 rounded-md border border-primary/20 bg-card/60 px-3 py-1 font-mono text-[10px] tracking-widest text-accent">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>SYS_ACTIVE</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link, idx) => (
              link.type === "route" ? (
                <Link
                  key={idx}
                  href={link.href}
                  className={`relative text-xs font-bold uppercase tracking-widest font-mono transition-all duration-200 hover:text-primary ${
                    location === link.href 
                      ? "text-accent border-b border-accent pb-1"
                      : "text-muted-foreground hover:translate-y-[-1px]"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={idx}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="relative text-xs font-bold uppercase tracking-widest font-mono text-muted-foreground transition-all duration-200 hover:text-primary hover:translate-y-[-1px]"
                >
                  {link.label}
                </a>
              )
            ))}
          </div>

          {/* Power Level HUD Panel & Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Sci-Fi Power Indicator Dashboard */}
            <div className="flex flex-col items-end border-r border-dashed border-primary/30 pr-4 font-mono">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest">BP_SCAN_07</span>
              <span className={`text-sm font-bold tracking-tight transition-all ${
                powerLevel >= 9000 ? "text-destructive animate-pulse" : "text-primary"
              }`}>
                PL {powerLevel >= 9000 ? "OVER 9000!" : powerLevel}
              </span>
            </div>

            <Link href="/universe#summon-shenron" onClick={(e) => handleAnchorClick(e, "/universe#summon-shenron")}>
              <Button
                variant="outline"
                className="hidden md:flex relative overflow-hidden group border-accent/40 bg-card hover:bg-accent hover:text-accent-foreground text-xs font-bold uppercase tracking-widest font-mono rounded-none py-1.5 px-4 h-9 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <Sparkles className="mr-2 h-4 w-4 text-accent animate-spin-slow group-hover:text-primary-foreground" />
                SUMMON SHENRON
              </Button>
            </Link>

            {/* Mobile Sheet Trigger (Responsive View) */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost" className="relative border border-primary/20 text-foreground hover:bg-card">
                    <Menu className="h-6 w-6 text-primary" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent animate-ping"></span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 border-l-2 border-primary/30 bg-background/95 backdrop-blur-lg text-foreground font-mono">
                  <SheetHeader className="border-b border-primary/20 pb-4">
                    <SheetTitle className="text-left text-sm tracking-widest font-black text-primary">
                      SYSTEM MENU [v1.09]
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 flex flex-col gap-4">
                    {links.map((link, idx) => (
                      link.type === "route" ? (
                        <Link
                          key={idx}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center justify-between p-3 border-b border-primary/10 hover:bg-primary/10 rounded-md transition-colors text-sm font-bold uppercase tracking-wider ${
                            location === link.href ? "text-accent bg-accent/5 border-l-2 border-accent pl-4" : "text-foreground"
                          }`}
                        >
                          {link.label}
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </Link>
                      ) : (
                        <a
                          key={idx}
                          href={link.href}
                          onClick={(e) => {
                            setIsOpen(false);
                            handleAnchorClick(e, link.href);
                          }}
                          className="flex items-center justify-between p-3 border-b border-primary/10 hover:bg-primary/10 rounded-md transition-colors text-sm font-bold uppercase tracking-wider text-foreground"
                        >
                          {link.label}
                          <ChevronRight className="h-4 w-4 text-primary" />
                        </a>
                      )
                    ))}
                  </div>

                  {/* HUD stats in Mobile Menu */}
                  <div className="absolute bottom-8 left-6 right-6 p-4 rounded-lg border border-primary/20 bg-card/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>WIFI COMS:</span>
                      <span className="text-emerald-400">CONNECTED</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>SECTOR:</span>
                      <span className="text-accent">UNIVERSE 7</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>POWER LVL:</span>
                      <span className="text-primary font-bold">{powerLevel}</span>
                    </div>
                    <Link href="/universe#summon-shenron" className="w-full mt-2" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-accent hover:bg-accent/85 text-accent-foreground font-bold tracking-widest text-xs">
                        SUMMON SHENRON
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}