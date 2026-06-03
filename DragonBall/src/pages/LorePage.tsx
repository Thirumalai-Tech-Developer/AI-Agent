import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
  Compass,
  Sparkles,
  Flame,
  Milestone,
  Globe,
  Orbit,
  Zap,
  Gift,
  Terminal,
  Volume2
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  era: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  glowingColor: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'beerus',
    era: 'Age of Beerus (Millions of Years Ago)',
    title: 'The Slumber of the Destroyer',
    description: 'Lord Beerus begins his long slumber, letting cosmic tides shape the universe while mortal civilizations rise, fall, and brew legendary premium beers in his distant honor.',
    icon: Orbit,
    glowingColor: 'shadow-[0_0_15px_rgba(168,85,247,0.5)] border-purple-500'
  },
  {
    id: 'super-dragon-balls',
    era: 'Age 41',
    title: 'Creation of the Super Dragon Balls',
    description: 'The Dragon God Zalama crafts the Super Dragon Balls, each the size of a planet, scattered across Universes 6 and 7, humming with reality-warping divine energy.',
    icon: Sparkles,
    glowingColor: 'shadow-[0_0_15px_rgba(234,179,8,0.5)] border-yellow-500'
  },
  {
    id: 'vegeta-destruction',
    era: 'Age 737',
    title: 'The Annihilation of Planet Vegeta',
    description: 'Under the tyrannical command of Lord Frieza, the Saiyan homeworld is pulverized into cosmic dust, leaving only a handful of surviving warriors scattered across the cosmos.',
    icon: Flame,
    glowingColor: 'shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500'
  },
  {
    id: 'namek-explosion',
    era: 'Age 762',
    title: 'The Cataclysmic Explosion of Namek',
    description: 'A terrifying showdown between a newly awakened Super Saiyan Goku and Frieza ends in the structural failure and ultimate vaporized destruction of the beautiful, green Namekian homeworld.',
    icon: Globe,
    glowingColor: 'shadow-[0_0_15px_rgba(34,197,94,0.5)] border-emerald-500'
  }
];

const COSMIC_RESPONSES = [
  "Your wish is granted! However, Shenron was feeling lazy so your infinite wealth is delivered entirely in expired galactic coupons.",
  "Granted. You are now the most powerful being in the universe, but only when everyone else is asleep and nobody is watching.",
  "Shenron chuckles. Your wish to master Ultra Instinct has been processed. You can now dodge all awkward social interactions perfectly.",
  "Wish fulfilled. Your hair instantly grows three feet long and glows bright golden, but your electric bill increases by 500% from static discharge.",
  "Granted! Your mortal kitchen is now stocked with an infinite supply of delicious instant ramen, but you can never find a clean fork again."
];

export default function LorePage() {
  // Dragon ball search game states
  const [ballsFound, setBallsFound] = useState<boolean[]>(Array(7).fill(false));
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  const [radarLogs, setRadarLogs] = useState<string[]>(["System Initialized. Tap on cosmic coordinates (spheres) to scan the quadrant."]);
  const [radarProgress, setRadarProgress] = useState<number>(0);
  const [customWish, setCustomWish] = useState<string>('');
  const [wishResult, setWishResult] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [audioFeedback, setAudioFeedback] = useState<string>('');

  const triggerSearch = (index: number) => {
    if (ballsFound[index] || searchingIndex !== null) return;

    setSearchingIndex(index);
    setRadarProgress(10);
    setAudioFeedback("*BEEP... BEEP... RADAR PULSING*");
    setRadarLogs((prev) => [
      `Scanning Galactic Quadrant Sector ${index + 1}...`,
      ...prev
    ]);

    // Simulate radar scanning progress
    const interval = setInterval(() => {
      setRadarProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 250);

    setTimeout(() => {
      setBallsFound((prev) => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });
      setSearchingIndex(null);
      setRadarProgress(0);
      setAudioFeedback("*DING! DRAGON BALL LOCATED*");
      setRadarLogs((prev) => [
        `[SUCCESS] Dragon Ball #${index + 1} located in the depths of Sector ${index * 3 + 4}! Energy signature confirmed.`,
        ...prev
      ]);
    }, 1000);
  };

  const resetQuest = () => {
    setBallsFound(Array(7).fill(false));
    setRadarLogs(["Radar system rebooted. Seek out the remaining dragon ball coordinates."]);
    setWishResult(null);
    setCustomWish('');
  };

  const handleWishSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWish.trim()) return;

    // Generate a funny random response
    const randomIndex = Math.floor(Math.random() * COSMIC_RESPONSES.length);
    setWishResult(COSMIC_RESPONSES[randomIndex]);
  };

  const allBallsFound = ballsFound.every(Boolean);

  return (
    <div id="lore-page" className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-20 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-semibold tracking-wider uppercase">
          <Sparkles className="w-4 h-4 animate-spin" /> Cosmic Record Keeper
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600">
          Chronicles & Dragon Lore
        </h1>
        <p className="text-slate-400 text-lg">
          Traverse the historical epochs of mortal struggle, celestial intervention, and unlock the legendary power to warp destiny itself.
        </p>
      </div>

      {/* Section 1: Timeline Component */}
      <section id="timeline" className="max-w-5xl mx-auto scroll-mt-24 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-amber-400 tracking-tight flex items-center justify-center gap-2">
            <Milestone className="text-amber-500" /> Sacred Cosmic Timeline
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            A chronicle of historic cosmic shifts, divine intervention, and world-shattering events since the dawn of ancient deities.
          </p>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 py-8 space-y-12">
          {TIMELINE_EVENTS.map((event, idx) => {
            const EventIcon = event.icon;
            return (
              <div key={event.id} className="relative pl-8 md:pl-12">
                
                {/* Timeline Node Icon and Glowing effect */}
                <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-900 border-2 flex items-center justify-center text-amber-400 transition-all duration-500 ${event.glowingColor}`}>
                  <EventIcon className="w-4 h-4" />
                </div>

                {/* Date Badge placed beautifully */}
                <div className="md:absolute md:-left-32 md:top-2 md:w-24 text-left md:text-right font-mono text-xs font-semibold uppercase tracking-wider text-amber-500/80 mb-2 md:mb-0">
                  {event.era}
                </div>

                {/* Event Card Content */}
                <Card className="bg-slate-900/80 border-slate-800/80 hover:border-amber-500/40 transition-colors duration-300 backdrop-blur-sm shadow-xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                      {event.title}
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm leading-relaxed font-sans">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: DragonBalls Quest */}
      <section id="dragonballs" className="max-w-5xl mx-auto scroll-mt-24 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-amber-500 tracking-tight flex items-center justify-center gap-2">
            <Compass className="text-amber-500 animate-pulse" /> Dragon Radar Tracking Quest
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Trace divine energy signals scattered across deep space. Tap on each glass sphere below to synchronize with your Dragon Radar and summon Shenron.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: The Interactive Radar / Logs Console */}
          <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800/80 text-slate-200">
            <CardHeader className="border-b border-slate-800/80 bg-slate-950/40">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                Dragon Radar Console v3.1
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Scanning cosmic frequencies
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Active Sound / Scanner visual cue */}
              {audioFeedback && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2 text-center text-xs font-mono text-amber-400 animate-pulse">
                  {audioFeedback}
                </div>
              )}

              {searchingIndex !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Syncing coordinates...</span>
                    <span>{radarProgress}%</span>
                  </div>
                  <Progress value={radarProgress} className="h-1.5 bg-slate-800" />
                </div>
              )}

              {/* Console logs output terminal style */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 h-48 overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 text-slate-500 text-[10px]">
                  <Terminal className="w-3.5 h-3.5" /> Live Telemetry Logs
                </div>
                {radarLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed break-words">
                    &gt; {log}
                  </div>
                ))} 
              </div>

              {/* Progress Tracker Summary */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Signals Captured:</span>
                <span className="font-bold font-mono text-amber-500">
                  {ballsFound.filter(Boolean).length} / 7
                </span>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-950/30 flex gap-2">
              <Button
                variant="outline"
                className="w-full border-slate-800 text-slate-400 hover:text-slate-100 text-xs py-1.5 h-auto"
                onClick={resetQuest}
              >
                Reset Radar
              </Button>
            </CardFooter>
          </Card>

          {/* Column 2: The 7 Mystic Dragon Balls grid */}
          <Card className="lg:col-span-2 bg-gradient-to-b from-slate-900/60 to-slate-950/40 border-slate-800/80 overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 justify-center items-center">
                {ballsFound.map((found, idx) => {
                  const starsCount = idx + 1;
                  const isScanning = searchingIndex === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => triggerSearch(idx)}
                        disabled={found || isScanning}
                        className={`
                          relative w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300
                          ${found 
                            ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 shadow-[0_0_20px_rgba(245,158,11,0.8)] cursor-default scale-105 border-2 border-amber-300'
                            : 'bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:scale-105 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          }
                          ${isScanning ? 'animate-ping border-amber-500' : ''}
                        `}
                      >
                        {/* Inner Glass shine effect */}
                        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                        
                        {/* Star arrangement mapped inside the sphere */}
                        <div className="flex flex-wrap gap-0.5 justify-center max-w-[34px] p-1">
                          {Array.from({ length: starsCount }).map((_, sIdx) => (
                            <span 
                              key={sIdx} 
                              className={`text-[9px] font-bold ${found ? 'text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]' : 'text-slate-700 animate-pulse'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </button>
                      <span className="text-xs font-mono text-slate-500">
                        Ball {starsCount}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Big Reward / Call to action once gathered */}
              {allBallsFound ? (
                <div className="p-6 rounded-lg bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border border-amber-500/30 text-center space-y-4 animate-fade-in">
                  <div className="mx-auto w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                    <Zap className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-amber-400">The Sky Darkens... Shenron Awaits!</h3>
                    <p className="text-slate-300 text-xs max-w-md mx-auto">
                      All seven dragon balls have been gathered. Their divine energy is resonating intensely. Submit your wish to the Dragon God below.
                    </p>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-slate-950 font-bold px-6 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                        Summon the Dragon God
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-amber-500/30 text-slate-100 max-w-lg shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400 flex items-center gap-2">
                          🐉 Shenron's Divine Chamber
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                          State your single custom wish, and I, the eternal Dragon, shall grant it! (Within reasonable cosmic bounds)
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleWishSubmission} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <label className="text-xs text-amber-400 font-semibold block">What is your cosmic wish?</label>
                          <Input
                            value={customWish}
                            onChange={(e) => setCustomWish(e.target.value)}
                            placeholder="e.g., Infinite raw Saiyan strength or unlimited Garlic Bread..."
                            className="bg-slate-950 border-slate-800 text-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            maxLength={100}
                            required
                          />
                        </div>
                        
                        {wishResult && (
                          <div className="p-4 rounded border border-emerald-500/20 bg-emerald-500/5 text-slate-300 text-sm space-y-2 font-mono">
                            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                              <Gift className="w-4 h-4" /> Dragon's decree:
                            </div>
                            <p className="italic leading-relaxed">"{wishResult}"</p>
                          </div>
                        )}

                        <DialogFooter className="flex gap-2 sm:gap-0 pt-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800" 
                            onClick={() => {
                              setIsDialogOpen(false);
                              setWishResult(null);
                              setCustomWish('');
                            }}
                          >
                            Dismiss
                          </Button>
                          <Button 
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            Cast Wish Into Cosmic Tides
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 border border-dashed border-slate-800 rounded-lg text-xs">
                  Capture all seven signals to summon the legendary eternal dragon.
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </section>
    </div>
  );
}