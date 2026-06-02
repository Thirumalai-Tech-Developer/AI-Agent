import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Hash, Link2, ExternalLink, Share2, Zap, Flame, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socials = [
  { icon: ExternalLink, label: "Capsule Corp Hub", href: "#" },
  { icon: Link2,        label: "Watanabe Labs",   href: "#" },
  { icon: Hash,         label: "Chala Head Chala", href: "#" },
  { icon: Share2,       label: "Saiyan Network",   href: "#" },
];

const dbQuotes = [
  "Push through the pain. Giving up hurts more! - Vegeta",
  "Power comes in response to a need, not a desire. - Goku",
  "Even a low-class warrior can surpass an elite if he works hard enough! - Goku",
  "You can take my body and my mind, but there is one thing a Saiyan always keeps! HIS PRIDE! - Vegeta",
  "It's not about being perfect, it's about pushing past your limits. - Goku"
];

export default function Footer() {
  const [quote, setQuote] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * dbQuotes.length);
    setQuote(dbQuotes[randomIndex]);
  }, []);

  const handleBackToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer id="footer" className="border-t border-border bg-background/95 py-12 relative overflow-hidden">
      {/* Dynamic background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.05),transparent)] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Random DB Quote */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary fill-primary animate-pulse" />
              <span className="text-lg font-bold tracking-wider text-foreground">SAIYAN FORCE</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Analyzing combat potentials, tracking Dragon Ball signatures, and chronicling the Saiyan legacy since Age 737.
            </p>
            <div className="p-3 bg-card border border-border rounded-lg inline-block max-w-md">
              <p className="text-xs italic text-muted-foreground flex items-start gap-1.5">
                <Flame className="h-4 w-4 shrink-0 text-primary" />
                <span>"{quote}"</span>
              </p>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <a href="#characters" className="text-muted-foreground hover:text-primary transition-colors">
                  Saiyans Showcase
                </a>
              </li>
              <li>
                <a href="#saiyan-scanner" className="text-muted-foreground hover:text-primary transition-colors">
                  Power Scanner
                </a>
              </li>
              <li>
                <a href="#footer" onClick={handleBackToTop} className="text-muted-foreground hover:text-primary transition-colors">
                  Ascend to Top (Z-Vanish)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Capsule Corp Newsletter & Socials */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-3">Capsule Corp Frequency</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Subscribe to gravity chamber status and tech updates.
              </p>
              {subscribed ? ( 
                <div className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-md p-2">
                  ✓ Frequency Locked. Communication channel established.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="Enter frequency email..."
                    className="h-8 text-xs bg-background"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" size="sm" className="h-8 px-2.5">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
            
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Scouter Frequencies</h4>
              <div className="flex gap-2">
                {socials.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="p-2 bg-card hover:bg-accent/20 border border-border hover:border-primary rounded-md text-muted-foreground hover:text-primary transition-all"
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center md:flex md:justify-between md:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SaiyanForce. This is a tribute fan-site. Powered by Capsule Corp Gravity Chamber technology.
          </p>
          <p className="text-xs text-primary font-bold tracking-widest mt-2 md:mt-0 uppercase animate-pulse">
            TRAIN INSANELY • GO BEYOND
          </p>
        </div>
      </div>
    </footer>
  );
}