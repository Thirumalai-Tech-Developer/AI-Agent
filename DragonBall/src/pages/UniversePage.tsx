import React, { useState } from "react";
import { Shield, RefreshCw, Zap, Star, Compass, Award, Sparkles, Orbit } from "lucide-react";

interface Universe {
  id: number;
  name: string;
  god: string;
  angel: string;
  status: string;
  strengthLevel: string;
  description: string;
}

const universes: Universe[] = [
  { id: 1, name: "Universe 1", god: "Iwen", angel: "Awamo", status: "Exempt", strengthLevel: "Superior", description: "The Supreme Universe. Boasts extreme cultural progression and developmental equilibrium." },
  { id: 2, name: "Universe 2", god: "Heles", angel: "Sour", status: "Active", strengthLevel: "Moderate", description: "The Passionate Universe. Governed by appreciation of beauty, love, and artistic combat." },
  { id: 6, name: "Universe 6", god: "Champa", angel: "Vados", status: "Active", strengthLevel: "High", description: "The Twin Universe to Seven. Home to high-potential Saiyans and unique legendary warriors." },
  { id: 7, name: "Universe 7", god: "Beerus", angel: "Whis", status: "Active", strengthLevel: "Supreme", description: "Our focal realm. Housing legendary warriors, Saiyans, and pivotal Multiverse defenders." },
  { id: 11, name: "Universe 11", god: "Belmod", angel: "Marcarita", status: "Active", strengthLevel: "Peak", description: "The Justice Universe. Under the protection of the Pride Troopers and the elite fighter Jiren." },
  { id: 12, name: "Universe 12", god: "Geene", angel: "Martinu", status: "Exempt", strengthLevel: "Superior", description: "The Ultimate Universe. Highly developed technology and ancient dimensional creators." }
];

export default function UniversePage() {
  const [collectedBalls, setCollectedBalls] = useState<number[]>([]);
  const [shenronSummoned, setShenronSummoned] = useState(false);
  const [radarStatus, setRadarStatus] = useState("ACTIVE");

  const handleCollectBall = (ballId: number) => {
    if (collectedBalls.includes(ballId)) return;
    setCollectedBalls((prev) => [...prev, ballId]);
  };

  const resetQuest = () => {
    setCollectedBalls([]);
    setShenronSummoned(false);
    setRadarStatus("ACTIVE");
  };

  const handleSummon = () => {
    if (collectedBalls.length === 7) {
      setShenronSummoned(true);
      setRadarStatus("SUMMONED");
    }
  };

  const triggerCheatCodes = () => {
    setCollectedBalls([1, 2, 3, 4, 5, 6, 7]);
  };

  return (
    <div id="universe-page" className="space-y-24 pb-24 pt-8 bg-background text-foreground selection:bg-green-500/30 min-h-screen">
      {/* HEADER SECTION */}
      <section className="max-w-7xl mx-auto px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-accent/5 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase px-3 py-1 rounded-full">
            <Zap className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            Zen-Oh Grand Archives
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-tight">
            Cosmology & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Celestial Beings</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Scan official cosmological database indexes overseen by the high deities. Complete the legendary trials to assemble the dragon spheres and summon the eternal dragon.
          </p>
        </div>
      </section>

      {/* 1. MULTIVERSE DEITY GRID */}
      <section id="multiverse" className="max-w-7xl mx-auto px-4 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border/60">
          <div>
            <h2 className="text-2xl font-black tracking-wider uppercase flex items-center gap-2.5 text-foreground">
              <Shield className="h-6 w-6 text-primary" />
              Multiverse High Registry
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Official registry compiled by Great Priest Daishinkan
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-mono bg-muted/50 px-3 py-1.5 rounded-lg border border-border/80">
            <Orbit className="h-4 w-4 animate-spin text-primary/80" style={{ animationDuration: '6s' }} />
            <span>Exempt Status: Developmental Rating &ge; 7</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {universes.map((uni) => (
            <div 
              key={uni.id} 
              className="group relative bg-card hover:bg-muted/30 border border-border rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/40 flex flex-col justify-between overflow-hidden"
            >
              {/* Background gradient hint */}
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-all" />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded">
                      No. {uni.id}
                    </span>
                    <h3 className="text-2xl font-black text-foreground mt-1 group-hover:text-primary transition-colors">
                      {uni.name}
                    </h3>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded border ${ 
                    uni.status === "Exempt" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  }`}>
                    {uni.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-6">
                  {uni.description}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono border-t border-border/40 pt-4 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">God of Destruction</span>
                  <span className="font-bold text-foreground text-right">Lord {uni.god}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Guiding Angel</span>
                  <span className="font-bold text-foreground text-right">{uni.angel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Combat Tier</span>
                  <span className="font-black text-amber-500 text-right uppercase tracking-wider">{uni.strengthLevel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SUMMON SHENRON QUEST */}
      <section id="summon-shenron" className="max-w-7xl mx-auto px-4 scroll-mt-20">
        <div className="bg-gradient-to-br from-green-950/40 via-background to-emerald-950/30 border border-green-900/40 rounded-3xl p-6 md:p-12 relative overflow-hidden shadow-2xl">
          {/* Subtle star particle fields simulated via grid and styling */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent pointer-events-none" />

          {shenronSummoned ? (
            <div className="relative z-10 text-center py-12 space-y-8 animate-fade-in">
              {/* Animated Shenron Glow Circle */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute inset-2 border-2 border-dashed border-emerald-500/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-4 border border-emerald-500/20 rounded-full animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />
                
                {/* Celestial Graphic Representation of Shenron (Glow-effect dragon avatar) */}
                <div className="relative z-10 bg-gradient-to-tr from-green-500 to-emerald-400 p-6 rounded-full shadow-[0_0_50px_rgba(16,185,129,0.5)] border border-emerald-300">
                  <Sparkles className="h-16 w-16 text-black animate-pulse" />
                </div>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-4 py-1.5 rounded-full tracking-widest uppercase">
                  🐉 Legendary Summon Achieved 🐉
                </span>
                <h2 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-green-300 via-emerald-400 to-teal-500 tracking-wider animate-pulse uppercase">
                  SHENRON HAS ASCENDED!
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/80 font-mono tracking-wide leading-relaxed bg-black/40 p-5 rounded-xl border border-emerald-900/30 max-w-xl mx-auto">
                  "I AM THE ETERNAL DRAGON. I SHALL GRANT YOU ANY WISH WITHIN MY POWER. CHOOSE WISELY..."
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={resetQuest}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
                  Return Dragon Balls
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Quest Guide */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-500 uppercase">
                    <Compass className="h-4 w-4 animate-spin" style={{ animationDuration: '12s' }} /> Active Quest Mode
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
                    THE TRIAL OF the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500">
                      DRAGON BALLS
                    </span>
                  </h2>
                </div>
                
                <p className="text-xs sm:text-sm text-green-100/70 leading-relaxed">
                  Seven ancient golden spheres exist scattered inside our localized subspace locator grid. Discover and select all 7 spheres to calibrate the focus matrix tray, then click "INVOKE ETERNAL DRAGON" below to initiate deep cosmic summoning rituals.
                </p>

                {/* Ball Progress Tray */}
                <div className="p-5 bg-black/60 border border-green-900/60 rounded-2xl space-y-5">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-mono text-green-400 font-bold tracking-widest uppercase">
                      MATRIX TRAY ({collectedBalls.length}/7)
                    </p>
                    {collectedBalls.length < 7 && (
                      <button 
                        onClick={triggerCheatCodes} 
                        className="text-[10px] font-mono text-zinc-500 hover:text-amber-500 underline transition-colors"
                      >
                        Auto-Locate Grid
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 justify-between py-3 px-2 bg-black/40 rounded-xl border border-zinc-900/80">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                      const isCollected = collectedBalls.includes(num);
                      return (
                        <div
                          key={num}
                          className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all duration-500 ${
                            isCollected
                              ? "bg-gradient-to-b from-yellow-400 to-amber-600 border-amber-300 text-amber-950 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                              : "bg-zinc-900/80 border-zinc-800 text-zinc-600"
                          }`}
                        >
                          {isCollected ? (
                            <span className="text-[10px] sm:text-xs text-amber-950 animate-pulse">★</span>
                          ) : (
                            <span className="text-[9px] font-mono">{num}</span>
                          )}
                          {/* Mini visual indicator of star count matching ball index */}
                          {isCollected && (
                            <span className="absolute -bottom-1 text-[6px] tracking-tighter opacity-80">
                              {"".padStart(num, "★")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleSummon}
                    disabled={collectedBalls.length < 7}
                    className={`w-full py-4 rounded-xl font-black tracking-widest text-xs uppercase transition-all duration-300 shadow-lg ${
                      collectedBalls.length === 7
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-black hover:scale-[1.02] active:scale-95 shadow-green-500/20 hover:shadow-green-500/40 cursor-pointer"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                    }`}
                  >
                    INVOKE ETERNAL DRAGON
                  </button>
                </div>
              </div>

              {/* Interactive Dragon Ball Radar Display / Selection Map */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                <div className="w-full max-w-md bg-black/40 p-4 rounded-2xl border border-zinc-900/60 text-center space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      RADAR INTERACTIVE TARGETING
                    </span>
                    <span className="text-zinc-500">SENSORS: {radarStatus}</span>
                  </div>

                  <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-green-950/30 border-4 border-green-800/60 rounded-full flex items-center justify-center shadow-[inset_0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden group">
                    {/* Radar Screen Grid Lines */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_30%,_rgba(16,185,129,0.05)_30%,_rgba(16,185,129,0.05)_60%,_transparent_60%)]" />
                    <div className="absolute w-full h-[1px] bg-green-500/10 top-1/2 left-0" />
                    <div className="absolute h-full w-[1px] bg-green-500/10 left-1/2 top-0" />

                    {/* Radar Sweeper element */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-500/10 to-transparent rounded-full animate-spin pointer-events-none"
                      style={{ animationDuration: '4s' }}
                    />
                    
                    {/* Positioning for 7 Balls */} 
                    {[
                      { id: 1, top: "20%", left: "25%", label: "1★" },
                      { id: 2, top: "22%", left: "70%", label: "2★" },
                      { id: 3, top: "58%", left: "18%", label: "3★" },
                      { id: 4, top: "45%", left: "48%", label: "4★" },
                      { id: 5, top: "70%", left: "45%", label: "5★" },
                      { id: 6, top: "75%", left: "78%", label: "6★" },
                      { id: 7, top: "15%", left: "48%", label: "7★" }
                    ].map((ball) => {
                      const isCollected = collectedBalls.includes(ball.id);
                      return (
                        <button
                          key={ball.id}
                          onClick={() => handleCollectBall(ball.id)}
                          style={{ top: ball.top, left: ball.left }}
                          disabled={isCollected}
                          className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex flex-col items-center justify-center font-bold text-xs border transition-all duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                            isCollected
                              ? "bg-zinc-950/90 border-zinc-800 text-zinc-700 cursor-not-allowed scale-75 opacity-20"
                              : "bg-gradient-to-b from-amber-400 to-orange-500 border-amber-300 text-amber-950 shadow-md cursor-pointer animate-pulse"
                          }`}
                          title={`Secure Dragon Ball ${ball.id}`}
                        >
                          <span className="text-[10px] font-mono leading-none">{ball.label}</span>
                        </button>
                      );
                    })}

                    {/* Radar core info message */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 border border-green-900/60 px-3 py-1.5 rounded text-[10px] font-mono text-green-400 animate-pulse">
                      {collectedBalls.length === 7 ? "RADAR LOCKED" : "TAP EMITTING BEACONS"}
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Tap target points detected by radar scanner to capture. Ensure visual locking on all targets.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}