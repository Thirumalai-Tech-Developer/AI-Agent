import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Sparkles,
  Compass,
  ShieldAlert,
  Sword,
  UserCheck,
  Info,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Static data definitions
const SAGAS_DATA = [
  {
    id: 'saiyan',
    title: 'Saiyan Invasion',
    period: 'DBZ Season 1',
    powerLevel: 18000,
    summary: 'Earths defenders face the ruthless Saiyan elites, Nappa and Vegeta, in an ultimate struggle for survival.',
    fight: 'Goku vs. Vegeta (Kaioken x4 Kamehameha Duel)',
    dangerLevel: 'High (Class-A)',
    stats: { deaths: 6, planetsSaved: 1, powerMultiplier: 'x10' }
  },
  {
    id: 'frieza',
    title: 'Frieza Saga',
    period: 'DBZ Season 2-4',
    powerLevel: 120000000,
    summary: 'Journey to planet Namek culminates in Gokus legendary transformation into the legendary Super Saiyan to defeat the galactic tyrant.',
    fight: 'Super Saiyan Goku vs. 100% Final Form Frieza',
    dangerLevel: 'Critical (Class-S)',
    stats: { deaths: 4, planetsSaved: 2, powerMultiplier: 'x50' }
  },
  {
    id: 'cell',
    title: 'Cell Games',
    period: 'DBZ Season 5-6',
    powerLevel: 450000000,
    summary: 'An engineered bio-android hosts a martial arts tournament to decide Earths annihilation. Gohan must unleash his latent rage.',
    fight: 'Super Saiyan 2 Gohan vs. Super Perfect Cell (Father-Son Kamehameha)',
    dangerLevel: 'Extreme (Class-SS)',
    stats: { deaths: 2, planetsSaved: 1, powerMultiplier: 'x100' }
  },
  {
    id: 'buu',
    title: 'Majin Buu Chaos',
    period: 'DBZ Season 7-9',
    powerLevel: 1200000000,
    summary: 'An ancient, unpredictable magic entity threatens cosmic existence. Earth pins its last hope on Fusion and the Super Spirit Bomb.',
    fight: 'Vegito vs. Super Buu / Goku Super Spirit Bomb vs. Kid Buu',
    dangerLevel: 'Universal Threat',
    stats: { deaths: 7000000000, planetsSaved: 3, powerMultiplier: 'x400' }
  },
  {
    id: 'top',
    title: 'Tournament of Power',
    period: 'Dragon Ball Super',
    powerLevel: 95000000000,
    summary: '8 universes battle in a royal rumble where losers are erased instantly. Goku must master the godly Ultra Instinct.',
    fight: 'Mastered Ultra Instinct Goku & Frieza vs. Jiren',
    dangerLevel: 'Multiversal Void',
    stats: { deaths: 0, planetsSaved: 12, powerMultiplier: 'God-tier' }
  }
];

const FIGHTERS = [
  { id: 'goku', name: 'Goku', power: 150000000, baseStyle: 'Saiyan God', icon: '🔥' },
  { id: 'vegeta', name: 'Vegeta', power: 145000000, baseStyle: 'Saiyan Prince', icon: '⚡' },
  { id: 'goten', name: 'Goten', power: 45000000, baseStyle: 'Half-Saiyan Kid', icon: '👦' },
  { id: 'trunks', name: 'Trunks', power: 46000000, baseStyle: 'Half-Saiyan Swordmaster', icon: '⚔️' },
  { id: 'gohan', name: 'Gohan', power: 130000000, baseStyle: 'Beast/Ultimate', icon: '⚡' },
  { id: 'piccolo', name: 'Piccolo', power: 85000000, baseStyle: 'Orange/Namekian', icon: '🟢' }
];

export default function HomePage() {
  // State management
  const [auraColor, setAuraColor] = useState<'gold' | 'red' | 'blue'>('gold');
  const [shenronActive, setShenronActive] = useState(false);
  const [activeSaga, setActiveSaga] = useState('saiyan');
  
  // Fusion State
  const [fighter1, setFighter1] = useState('goku');
  const [fighter2, setFighter2] = useState('vegeta');
  const [isFusing, setIsFusing] = useState(false);
  const [fusionResult, setFusionResult] = useState<any>(null);
  const [shake, setShake] = useState(false);

  // Dynamic ambient styling configurations based on Aura selector
  const getAuraStyles = () => {
    switch (auraColor) {
      case 'red':
        return {
          shadow: 'shadow-[0_0_60px_-15px_rgba(239,68,68,0.7)] border-red-500/50 bg-gradient-to-b from-red-950/20 via-background to-background',
          glow: 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
          gradientText: 'from-red-500 via-orange-400 to-yellow-500',
          badge: 'bg-red-500/10 text-red-400 border-red-500/30',
          button: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
        };
      case 'blue':
        return {
          shadow: 'shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] border-blue-500/50 bg-gradient-to-b from-blue-950/20 via-background to-background',
          glow: 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
          gradientText: 'from-blue-400 via-cyan-300 to-indigo-500',
          badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          button: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
        };
      case 'gold':
      default:
        return {
          shadow: 'shadow-[0_0_60px_-15px_rgba(234,179,8,0.7)] border-yellow-500/50 bg-gradient-to-b from-yellow-950/20 via-background to-background',
          glow: 'text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]',
          gradientText: 'from-yellow-500 via-amber-400 to-amber-200',
          badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
          button: 'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-yellow-500/20'
        };
    }
  };

  const currentStyles = getAuraStyles();
  const activeSagaData = SAGAS_DATA.find(s => s.id === activeSaga) || SAGAS_DATA[0];

  // Handle Fusion logic
  const triggerFusion = () => {
    if (fighter1 === fighter2) return;
    setIsFusing(true);
    setShake(true);

    setTimeout(() => {
      setShake(false);
    }, 600);

    setTimeout(() => {
      const f1 = FIGHTERS.find(f => f.id === fighter1)!;
      const f2 = FIGHTERS.find(f => f.id === fighter2)!;

      // Special combinations or procedural name + stats generation
      let hybridName = 'Unknown Warrior';
      let fusionPower = Math.round((f1.power + f2.power) * 2.3);
      let signatureMove = 'Ultimate Ki Cannon';
      let type = 'Standard Metamoran Fusion';

      if ((f1.id === 'goku' && f2.id === 'vegeta') || (f1.id === 'vegeta' && f2.id === 'goku')) {
        hybridName = 'Gogeta';
        fusionPower = 980000000;
        signatureMove = 'Stardust Breaker';
        type = 'Potara Earring / Metamoran Fusion';
      } else if ((f1.id === 'goten' && f2.id === 'trunks') || (f1.id === 'trunks' && f2.id === 'goten')) {
        hybridName = 'Gotenks';
        fusionPower = 340000000;
        signatureMove = 'Super Ghost Kamikaze Attack';
        type = 'Metamoran Kids Fusion';
      } else {
        // Procedural fusion name logic
        const part1 = f1.name.slice(0, Math.floor(f1.name.length / 2));
        const part2 = f2.name.slice(Math.floor(f2.name.length / 2));
        hybridName = part1.charAt(0).toUpperCase() + part1.slice(1).toLowerCase() + part2.toLowerCase();
        signatureMove = `${f1.baseStyle.split('/')[0]} ${f2.name.substring(1)} Buster`;
      }

      setFusionResult({
        name: hybridName,
        powerLevel: fusionPower,
        signatureMove,
        type,
        f1Name: f1.name,
        f2Name: f2.name
      });
      setIsFusing(false);
    }, 1200);
  };

  return (
    <div
      id="home"
      className={`min-h-screen text-foreground transition-all duration-700 ease-in-out ${currentStyles.shadow} relative overflow-x-hidden pb-16`}
    >
      {/* Cosmic background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-transparent via-background to-transparent pointer-events-none opacity-40" />

      {/* 1. HERO SECTION */}
      <header id="hero" className="container mx-auto px-4 pt-16 pb-20 md:py-28 flex flex-col items-center text-center relative">
        {/* Floating Shenron Summon State Overlay */}
        {shenronActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 animate-fade-in p-6 text-center">
            <div className="animate-bounce text-7xl mb-4">🐉</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-emerald-400 tracking-wider uppercase mb-2">
              Shenron Has Awakened!
            </h2>
            <p className="text-gray-300 max-w-lg mb-8 text-sm md:text-base">
              "I am the Eternal Dragon. I shall grant you any wish. State your desires, and watch the cosmos reshape."
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
              <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-950/30" onClick={() => alert('Wish granted: Unlimited power level received!')}>
                Grant Infinite Power
              </Button>
              <Button variant="destructive" onClick={() => setShenronActive(false)}>
                Dismiss Dragon
              </Button>
            </div>
          </div>
        )}

        {/* Header Indicator */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 text-xs font-semibold uppercase tracking-wider ${currentStyles.badge}`}>
          <Flame className="w-4 h-4 animate-pulse" />
          Active Battle Domain Aura
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tight uppercase leading-none max-w-4xl">
          Unleash Your <br />
          <span className={`bg-gradient-to-r ${currentStyles.gradientText} bg-clip-text text-transparent duration-500`}>
            Saiyan Legend
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Enter the ultimate anime combat zone. Control the ambient power elements, navigate through chronological battle sagas, or test forbidden warrior combinations inside the Fusion Chamber.
        </p>

        {/* Interactive Aura Switcher widget directly inside Hero */}
        <div className="mt-10 p-4 rounded-2xl bg-muted/30 border border-border/60 max-w-md w-full backdrop-blur-sm">
          <p className="text-xs uppercase font-extrabold tracking-widest text-muted-foreground mb-3">
            Channel Cosmic Energy Aura
          </p>
          <div className="flex justify-around items-center gap-2">
            <button
              onClick={() => setAuraColor('gold')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${auraColor === 'gold' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105' : 'bg-background/80 hover:bg-yellow-950/30 text-yellow-500 border border-yellow-500/20'}`}
            >
              🌟 Gold (Super Saiyan)
            </button>
            <button
              onClick={() => setAuraColor('red')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${auraColor === 'red' ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105' : 'bg-background/80 hover:bg-red-950/30 text-red-500 border border-red-500/20'}`}
            >
              🔥 Red (God Form)
            </button>
            <button
              onClick={() => setAuraColor('blue')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${auraColor === 'blue' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-background/80 hover:bg-blue-950/30 text-blue-400 border border-blue-500/20'}`}
            >
              💎 Blue (Evolved)
            </button>
          </div>
        </div>

        {/* Primary Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md px-4">
          <a href="#fusion-chamber" className="flex-1">
            <Button className={`w-full py-6 text-md font-bold rounded-xl transition-all duration-300 ${currentStyles.button}`}>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Awaken Aura
            </Button>
          </a>
          <Button
            variant="outline"
            className="flex-1 py-6 text-md font-bold rounded-xl border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShenronActive(true)}
          >
            🐉 Summon Shenron
          </Button>
        </div>
      </header>

      {/* 2. SAGAS TIMELINE SECTION */}
      <section id="sagas" className="container mx-auto px-4 py-20 border-t border-border/40 relative">
        <div className="flex flex-col items-center text-center mb-12">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 uppercase tracking-widest px-3 py-1">
            Chronological Archives
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wide">
            Ultimate Saga Timeline
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mt-2">
            Chronicles of catastrophic events, pivotal transformations, and explosive cosmic battles.
          </p>
        </div>

        {/* Horizontal Scroll Navigation for Timeline Sagas */}
        <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-none snap-x justify-start md:justify-center border-b border-border/40 mb-8">
          {SAGAS_DATA.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSaga(s.id)}
              className={`px-5 py-3 rounded-t-lg font-bold text-sm tracking-wide uppercase transition-all duration-200 snap-center shrink-0 border-b-2 ${
                activeSaga === s.id
                  ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Active Saga Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl border bg-muted/20 backdrop-blur-sm">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-yellow-500/80 uppercase tracking-widest">
                  {activeSagaData.period}
                </span>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                  {activeSagaData.dangerLevel}
                </Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                {activeSagaData.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                {activeSagaData.summary}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider border-b pb-1">
                Saga Chronology Stats
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-background/60 p-2 rounded-lg border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Casualties</p>
                  <p className="text-sm font-bold text-white">{activeSagaData.stats.deaths}</p>
                </div>
                <div className="bg-background/60 p-2 rounded-lg border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Saved</p>
                  <p className="text-sm font-bold text-white">{activeSagaData.stats.planetsSaved} World</p>
                </div>
                <div className="bg-background/60 p-2 rounded-lg border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Multiplier</p>
                  <p className="text-sm font-bold text-yellow-400">{activeSagaData.stats.powerMultiplier}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl border bg-card/60 relative overflow-hidden">
            {/* Animated BG line graph/grid for battle screen aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sword className="w-5 h-5 text-red-500 animate-pulse" />
                <h4 className="text-xs uppercase font-extrabold text-red-500 tracking-wider">
                  Key Battle Simulation
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-background/80 border border-border/50 shadow-inner mb-6">
                <p className="text-sm md:text-base font-bold text-amber-200">
                  {activeSagaData.fight}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                <span>Peak Power Concentration</span>
                <span className="text-yellow-400">{activeSagaData.powerLevel.toLocaleString()} PT</span>
              </div>
              <Progress
                value={Math.min(100, Math.max(5, (activeSagaData.powerLevel / 95000000000) * 100))}
                className="h-2 bg-muted"
              />
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                *Power level rating values are approximate and based on official combat data grids.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FUSION CHAMBER SECTION */}
      <section id="fusion-chamber" className="container mx-auto px-4 py-20 border-t border-border/40">
        <div className="flex flex-col items-center text-center mb-12">
          <Badge className="mb-3 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 uppercase tracking-widest px-3 py-1">
            FORBIDDEN BIOMETRIC LAB
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wide text-white">
            Metamoran Fusion Chamber
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mt-2">
            Merge two supreme warriors using the perfect dance coordinates to generate a brand new hybrid super fighter.
          </p>
        </div>

        <div className={`max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-all duration-300 ${shake ? 'animate-bounce' : ''}`}>
          {/* Selector 1 */}
          <div className="md:col-span-4 bg-card/40 border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Warrior One</span>
            <div className="text-5xl mb-4 p-4 rounded-full bg-muted/60">
              {FIGHTERS.find(f => f.id === fighter1)?.icon || '🔥'}
            </div>
            <h3 className="text-lg font-bold mb-3">
              {FIGHTERS.find(f => f.id === fighter1)?.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Base: {FIGHTERS.find(f => f.id === fighter1)?.baseStyle}
            </p>
            <Select value={fighter1} onValueChange={setFighter1}>
              <SelectTrigger className="w-full bg-background border border-border">
                <SelectValue placeholder="Select Warrior" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {FIGHTERS.map(f => (
                  <SelectItem key={f.id} value={f.id} disabled={f.id === fighter2}>
                    {f.name} (Pwr: {(f.power / 1000000).toFixed(0)}M)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Trigger / Center Dance Indicator */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30 animate-spin duration-[10s]" />
              <div className="absolute inset-2 rounded-full border border-dashed border-yellow-500/30 animate-spin duration-[5s]" />
              <span className="text-4xl animate-pulse">🥋</span>
            </div>
            <Button
              onClick={triggerFusion}
              disabled={isFusing || fighter1 === fighter2}
              className="w-full mt-6 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black font-extrabold uppercase text-xs tracking-widest py-6 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isFusing ? 'Fusing Bio-Energy...' : 'PERFORM FUSION DANCE'}
            </Button>
          </div>

          {/* Selector 2 */}
          <div className="md:col-span-4 bg-card/40 border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Warrior Two</span>
            <div className="text-5xl mb-4 p-4 rounded-full bg-muted/60">
              {FIGHTERS.find(f => f.id === fighter2)?.icon || '⚡'}
            </div>
            <h3 className="text-lg font-bold mb-3">
              {FIGHTERS.find(f => f.id === fighter2)?.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Base: {FIGHTERS.find(f => f.id === fighter2)?.baseStyle}
            </p>
            <Select value={fighter2} onValueChange={setFighter2}>
              <SelectTrigger className="w-full bg-background border border-border">
                <SelectValue placeholder="Select Warrior" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {FIGHTERS.map(f => (
                  <SelectItem key={f.id} value={f.id} disabled={f.id === fighter1}>
                    {f.name} (Pwr: {(f.power / 1000000).toFixed(0)}M)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interactive Fusion Result Panel */}
        {isFusing && (
          <div className="max-w-xl mx-auto mt-12 p-8 rounded-3xl bg-indigo-950/20 border border-indigo-500/40 text-center animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h4 className="text-lg font-extrabold uppercase text-indigo-400 tracking-wider">Biometric Merging...</h4>
            <p className="text-xs text-muted-foreground mt-1">Perfecting physical form parameters and aligning energy levels.</p>
          </div>
        )}

        {fusionResult && !isFusing && (
          <div className="max-w-xl mx-auto mt-12 p-6 rounded-3xl border border-yellow-500 bg-gradient-to-br from-card to-muted/80 shadow-[0_0_40px_rgba(234,179,8,0.15)] animate-fade-in relative overflow-hidden">
            {/* Corner Decorative elements */}
            <div className="absolute top-0 right-0 p-3 bg-yellow-500 text-black text-[10px] font-black uppercase rounded-bl-xl tracking-widest">
              SUCCESS
            </div>

            <h4 className="text-xs font-mono uppercase text-yellow-500 tracking-widest mb-1">
              Newly Fused Super Warrior
            </h4>
            <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
              {fusionResult.name}
            </h3>
            <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase text-[10px]">
              {fusionResult.type}
            </Badge>

            <div className="space-y-4 pt-2 border-t border-border/60">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Calculated Power Level</span>
                  <span className="font-bold text-yellow-400">{fusionResult.powerLevel.toLocaleString()} PT</span>
                </div>
                <Progress value={85} className="h-1.5 bg-background" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Signature Skill:</span>
                  <span className="font-extrabold text-white uppercase tracking-wider">
                    {fusionResult.signatureMove}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Parent Components:</span>
                  <span className="font-bold text-white">
                    {fusionResult.f1Name} + {fusionResult.f2Name}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFusionResult(null)}
                className="text-xs text-muted-foreground hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Reset Chamber
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}