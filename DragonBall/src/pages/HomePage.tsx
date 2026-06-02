import React, { useState, useEffect } from "react";
import { Shield, Zap, Flame, Star, Trophy, MessageSquare, Plus, Minus, Search, Radio, Send, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface Character {
  name: string;
  form: string;
  powerLevel: string;
  statValue: number; 
  avatarUrl: string;
  technique: string;
  faction: string;
}

const saiyans: Character[] = [
  { name: "Son Goku", form: "Mastered Ultra Instinct", powerLevel: "150,000,000,000", statValue: 99, avatarUrl: "⚡", technique: "Kamehameha", faction: "Z-Fighters" },
  { name: "Vegeta", form: "Ultra Ego", powerLevel: "145,000,000,000", statValue: 98, avatarUrl: "👑", technique: "Final Flash", faction: "Z-Fighters" },
  { name: "Gohan", form: "Beast Gohan", powerLevel: "140,000,000,000", statValue: 97, avatarUrl: "🩸", technique: "Special Beam Cannon", faction: "Z-Fighters" },
  { name: "Broly", form: "Legendary Super Saiyan", powerLevel: "130,000,000,000", statValue: 94, avatarUrl: "💀", technique: "Gigantic Meteor", faction: "Planet Vampa" },
  { name: "Future Trunks", form: "Super Saiyan Anger", powerLevel: "85,000,000,000", statValue: 82, avatarUrl: "⚔️", technique: "Burning Attack", faction: "Resistance" }
];

export default function HomePage() {
  // Hero state - Active Aura selection
  const [auraLevel, setAuraLevel] = useState<"base" | "ssj" | "blue" | "ui">("ssj");

  // Interactive Scanner states
  const [scannerBasePower, setScannerBasePower] = useState<number>(9000);
  const [scannerMultiplier, setScannerMultiplier] = useState<number>(50);
  const [scannedResult, setScannedResult] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerComment, setScannerComment] = useState<string>("");

  // Character Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Audio synthesized feedback for Scouter module
  const playScouterSound = (frequency: number, type: OscillatorType = 'square', duration = 0.08) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Web Audio API not supported or interaction blocked.", e);
    }
  };

  // Audio sweep simulation during active scanning
  useEffect(() => {
    let intervalId: any;
    if (isScanning) {
      let count = 0;
      intervalId = setInterval(() => {
        // Random retro synthesizer sweeps
        const frequency = 800 + Math.random() * 1200;
        playScouterSound(frequency, 'sawtooth', 0.05);
        count++;
        if (count > 15) clearInterval(intervalId);
      }, 80);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning]);

  const getAuraColor = () => {
    switch (auraLevel) {
      case "ssj": 
        return "border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.6)] text-amber-400 bg-amber-950/20";
      case "blue": 
        return "border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.6)] text-cyan-400 bg-cyan-950/20";
      case "ui": 
        return "border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.6)] text-purple-400 bg-purple-950/20";
      default: 
        return "border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.6)] text-red-500 bg-red-950/20";
    }
  };

  const getAuraText = () => {
    switch (auraLevel) {
      case "ssj": return "SUPER SAIYAN GOLDEN LIGHTNING";
      case "blue": return "SUPER SAIYAN GOD SUPER SAIYAN (BLUE)";
      case "ui": return "MASTERED ULTRA INSTINCT SYMPHONY";
      default: return "BASE CLASS KAIOKEN BURST";
    }
  };

  const triggerAuraChange = (level: "base" | "ssj" | "blue" | "ui") => {
    setAuraLevel(level);
    const frequencies: Record<string, number> = { base: 220, ssj: 440, blue: 660, ui: 880 };
    playScouterSound(frequencies[level] || 440, 'sine', 0.25);
  };

  const calculatePower = () => {
    setIsScanning(true);
    setScannedResult(null);
    playScouterSound(1200, 'square', 0.4);

    setTimeout(() => {
      const total = scannerBasePower * scannerMultiplier;
      setScannedResult(total);
      setIsScanning(false);
      
      // Play distinct result sounds
      if (total > 900000) {
        playScouterSound(1500, 'sawtooth', 0.5);
        setScannerComment("⚠️ BEWARE! This exceeds divine boundaries. Universe deletion imminent!");
      } else if (total > 9000) {
        playScouterSound(1000, 'sine', 0.3);
        setScannerComment("🔥 IMPOSSIBLE! IT'S OVER NINE THOUSAND!!!");
      } else {
        playScouterSound(600, 'triangle', 0.2);
        setScannerComment("💤 Low-tier planetary reading. Standard Earthling or capsule technician.");
      }
    }, 1500);
  };

  const filteredSaiyans = saiyans.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.form.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="home" className="space-y-24 pb-20 bg-background text-foreground overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-12 md:pt-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
              SAGA: DEFIANT LIMITS
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">
              CHRONICLE OF THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-yellow-300">
                ULTIMATE SAIYANS
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Explore legendary transformations, calculate battle thresholds with the Scouter module, and search the cosmic registry for Saiyan warriors.
            </p>

            {/* Interactive Transformation Switcher */}
            <div className="p-5 bg-card/80 border border-border rounded-xl space-y-4 shadow-xl backdrop-blur-sm">
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                CURRENT FORM CONFIGURATION:
              </p>
              <div className="text-sm font-mono font-bold text-foreground bg-black/40 p-2 rounded border border-white/5">
                🔮 {getAuraText()}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  { key: "base", label: "Kaioken x20", color: "hover:bg-red-600 bg-red-950/40 text-red-400 border-red-800/60" },
                  { key: "ssj", label: "Super Saiyan", color: "hover:bg-amber-500 bg-amber-950/40 text-amber-400 border-amber-800/60" },
                  { key: "blue", label: "SSJ Blue", color: "hover:bg-cyan-500 bg-cyan-950/40 text-cyan-400 border-cyan-800/60" },
                  { key: "ui", label: "Ultra Instinct", color: "hover:bg-purple-600 bg-purple-950/40 text-purple-400 border-purple-800/60" }
                ].map((aura) => (
                  <button
                    key={aura.key}
                    onClick={() => triggerAuraChange(aura.key as any)}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded transition-all border ${aura.color} hover:text-white ${
                      auraLevel === aura.key 
                        ? "ring-2 ring-primary scale-105 bg-primary text-primary-foreground border-transparent"
                        : "opacity-85"
                    }`}
                  >
                    {aura.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild className="bg-primary text-primary-foreground font-black tracking-wider uppercase hover:bg-primary/90">
                <a href="#saiyan-scanner">
                  <Radio className="mr-2 h-4 w-4 animate-ping" /> INITIATE SCOUTER SCAN
                </a>
              </Button>
              <Button asChild variant="outline" className="border-border hover:bg-muted font-black tracking-wider uppercase">
                <a href="#characters">
                  EXPLORE WARRIORS
                </a>
              </Button>
            </div>
          </div>

          {/* Hero Interactive Visual Sandbox */}
          <div className="lg:col-span-5 flex justify-center">
            <div className={`relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border-4 flex flex-col items-center justify-center backdrop-blur-md transition-all duration-700 ${getAuraColor()}`}>
              {/* Animated particle rings */}
              <div className="absolute inset-4 border border-white/10 rounded-full animate-spin [animation-duration:15s]" />
              <div className="absolute inset-1 border border-dashed border-primary/20 rounded-full animate-spin [animation-duration:30s]" />
              
              <span className="text-7xl sm:text-8xl animate-bounce [animation-duration:3s] drop-shadow-[0_15px_15px_rgba(0,0,0,0.9)]">
                {auraLevel === "base" ? "🔥" : auraLevel === "ssj" ? "⚡" : auraLevel === "blue" ? "💎" : "🌌"}
              </span>
              
              <div className="mt-4 text-center z-10 px-4">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">AURA COEFFICIENT</p>
                <p className="text-xl sm:text-2xl font-black font-mono tracking-widest text-foreground mt-1">
                  {auraLevel === "base" ? "x20 KAIO" : auraLevel === "ssj" ? "150,000,000%" : auraLevel === "blue" ? "DIVINE GOD" : "TRANSCENDENT"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHARACTERS SECTION */}
      <section id="characters" className="max-w-7xl mx-auto px-4 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">REGISTRY</Badge>
            <h2 className="text-3xl font-black tracking-tight text-foreground uppercase">
              ⚡ <span className="text-primary">SAIYAN</span> ELITE DECK
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track vital statistics, signature move-sets, and localized gravity-calculated output.
            </p>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search fighter, form, move..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 bg-card border-border text-foreground focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSaiyans.map((saiyan, idx) => (
            <div 
              key={idx} 
              className="group relative bg-gradient-to-b from-card to-muted border border-border hover:border-primary/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none flex items-center justify-center pl-8 pb-8 text-3xl opacity-60 group-hover:opacity-100 transition-all">
                {saiyan.avatarUrl}
              </div>
              <div className="mb-4">
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {saiyan.faction}
                </span>
                <h3 className="text-2xl font-black text-foreground mt-3 group-hover:text-primary transition-colors">
                  {saiyan.name}
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-1">Form: {saiyan.form}</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>SCOUTER RATIO</span>
                    <span className="font-mono font-bold text-foreground">{saiyan.statValue}%</span>
                  </div>
                  <div className="w-full bg-background/55 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-gradient-to-r from-primary via-amber-500 to-yellow-300 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${saiyan.statValue}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs py-2 border-t border-border/60">
                  <span className="text-muted-foreground">SIGNATURE MOVE</span>
                  <span className="font-bold text-amber-400 font-mono">{saiyan.technique}</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-t border-border/60">
                  <span className="text-muted-foreground">EST. BATTLE LEVEL</span>
                  <span className="font-mono font-bold text-primary">{saiyan.powerLevel}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredSaiyans.length === 0 && (
            <div className="col-span-full text-center py-16 border border-dashed border-border/80 rounded-2xl">
              <p className="text-muted-foreground font-mono">No warriors matched your frequency search scanner.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. SAIYAN SCANNER INTERACTIVE SECTION */}
      <section id="saiyan-scanner" className="max-w-7xl mx-auto px-4 scroll-mt-24">
        <div className="relative overflow-hidden bg-card border border-primary/30 rounded-3xl p-6 md:p-10 shadow-2xl">
          {/* Cyberpunk grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
            
            {/* Input Slider Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase">
                <Activity className="h-4 w-4 animate-pulse" />
                SAIYAN SCOUTER SIMULATOR
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white">
                CALCULATE ENERGY SIGNATURE
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl">
                Use our localized gravitational metrics to approximate any warrior's power state. Toggle sliders, synthesize instant auditory diagnostics, and view threshold ratings.
              </p>

              <div className="space-y-6 pt-2">
                {/* Slider 1: Base level */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground uppercase">BASE POWER LEVEL</span>
                    <span className="text-primary font-bold">{scannerBasePower.toLocaleString()} BP</span>
                  </div>
                  <Slider
                    min={100}
                    max={20000}
                    step={100}
                    value={[scannerBasePower]}
                    onValueChange={(val) => {
                      setScannerBasePower(val[0]);
                      playScouterSound(300 + val[0] / 30, 'sine', 0.05);
                    }}
                    className="py-2 [&>.bg-primary]:bg-primary"
                  />
                </div>

                {/* Slider 2: Multiplier */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground uppercase">Z-MULTIPLIER RATIO</span>
                    <span className="text-amber-400 font-bold">x{scannerMultiplier}</span>
                  </div>
                  <Slider
                    min={1}
                    max={300}
                    step={1}
                    value={[scannerMultiplier]}
                    onValueChange={(val) => {
                      setScannerMultiplier(val[0]);
                      playScouterSound(600 + val[0] * 3, 'triangle', 0.04);
                    }}
                    className="py-2 [&>.bg-primary]:bg-amber-400"
                  />
                </div>
              </div>

              <Button 
                onClick={calculatePower}
                disabled={isScanning}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-black tracking-widest uppercase py-6 text-sm transition-all shadow-lg shadow-primary/20"
              >
                {isScanning ? "DECRYPTING FORCE FIELDS..." : "RUN SCIENTIFIC SCAN"}
              </Button>
            </div>

            {/* Retro Green/Red Scouter UI Screen */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-black border border-primary/40 rounded-2xl relative overflow-hidden min-h-[300px]">
              {/* Futuristic overlay scanline */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(255,100,0,0.05),rgba(0,255,100,0.02),rgba(0,100,255,0.05))] bg-[size:100%_4px,4px_100%] pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-center text-[10px] font-mono text-primary/80 border-b border-primary/20 pb-3 mb-6">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" /> 
                    SCOUTER G-200
                  </span>
                  <span className="tracking-widest">RADAR STATUS: ACTIVE</span>
                </div>

                {isScanning ? (
                  <div className="h-40 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <div className="absolute inset-1.5 border-4 border-dashed border-amber-400 border-b-transparent rounded-full animate-spin [animation-direction:reverse]" />
                    </div>
                    <p className="text-xs font-mono text-primary uppercase tracking-widest animate-pulse">
                      Calibrating cosmic waves...
                    </p>
                  </div>
                ) : scannedResult !== null ? (
                  <div className="space-y-4 animate-fade-in">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">COMBAT RESULT</p>
                    <p className="text-4xl md:text-5xl font-black font-mono tracking-tight text-amber-400 select-all">
                      {scannedResult.toLocaleString()}
                    </p>
                    <div className="p-3 bg-primary/10 border border-primary/25 rounded-xl text-xs text-primary font-mono leading-relaxed">
                      {scannerComment}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center">
                    <Trophy className="h-10 w-10 text-muted-foreground/60 mb-2" />
                    <p className="text-xs text-muted-foreground/80 font-mono">
                      Awaiting target calibration parameters. Adjust the sliders to fire.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-primary/20 pt-4 flex justify-between text-[9px] font-mono text-muted-foreground">
                <span>SYSTEM MODEL: CAPSULE CORP-3</span>
                <span>DECIBELS: SYNTH-OK</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER POD SECTION */}
      <section id="newsletter" className="max-w-4xl mx-auto px-4 text-center scroll-mt-24">
        <div className="bg-gradient-to-br from-card to-muted p-8 sm:p-14 border border-border rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-xl mx-auto space-y-4">
            <Badge className="bg-primary/15 text-primary border-primary/20 font-mono tracking-wider">
              CAPSULE TELEMETRY HUB
            </Badge>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">
              SUBSCRIBE TO THE SAGA DISPATCH
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Receive direct coordinates regarding universe-scale tournaments, training supply updates, and new visual transformations from Bulma's private research division.
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              playScouterSound(880, 'sine', 0.15);
              setTimeout(() => playScouterSound(1320, 'sine', 0.2), 100);
              alert('Secure capsule transmission completed successfully! Welcome to the Z-fighters.');
            }} 
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mt-8"
          >
            <Input
              type="email"
              required
              placeholder="Enter target scouter email address"
              className="flex-1 bg-background border-border text-foreground focus:ring-1 focus:ring-primary py-6 px-4 rounded-xl"
            />
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-black text-xs uppercase tracking-widest px-6 py-6 rounded-xl transition-all shadow-lg shadow-primary/15"
            >
              <Send className="h-4.5 w-4.5 mr-2" /> ENLIST NOW
            </Button>
          </form>
        </div>
      </section>

    </div>
  );
}