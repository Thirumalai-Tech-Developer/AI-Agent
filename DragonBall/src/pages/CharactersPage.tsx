import React, { useState, useMemo } from 'react';
import { Search, Flame, Zap, Shield, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Fighter {
  name: string;
  type: 'Saiyan' | 'God' | 'Alien' | 'Cyborg';
  hp: number;
  ki: number;
  strength: number;
  speed: number;
  image: string;
  quote: string;
}

const FIGHTERS_DATA: Fighter[] = [
  {
    name: 'Son Goku',
    type: 'Saiyan',
    hp: 95,
    ki: 99,
    strength: 96,
    speed: 98,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300&auto=format&fit=crop',
    quote: 'I am the hope of the universe. I am the answer to all living things that cry out for peace.'
  },
  {
    name: 'Vegeta',
    type: 'Saiyan',
    hp: 92,
    ki: 95,
    strength: 97,
    speed: 94,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop',
    quote: 'There is only one certainty in life. A Saiyan always keeps his pride!'
  },
  {
    name: 'Gohan',
    type: 'Saiyan',
    hp: 90,
    ki: 92,
    strength: 95,
    speed: 90,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop',
    quote: 'I will never forgive you for what you\'ve done!'
  },
  {
    name: 'Frieza',
    type: 'Alien',
    hp: 88,
    ki: 90,
    strength: 89,
    speed: 95,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=300&auto=format&fit=crop',
    quote: 'Before you begin your struggle, let me warn you. My power is 530,000.'
  },
  {
    name: 'Piccolo',
    type: 'Alien',
    hp: 85,
    ki: 84,
    strength: 82,
    speed: 80,
    image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=300&auto=format&fit=crop',
    quote: 'Even with the power of a Super Saiyan, you\'re nothing but a child.'
  },
  {
    name: 'Lord Beerus',
    type: 'God',
    hp: 98,
    ki: 100,
    strength: 99,
    speed: 99,
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=300&auto=format&fit=crop',
    quote: 'Before creation, must come destruction. That is the law of the cosmos.'
  }
];

const MULTIPLIERS = [
  { name: 'Base', factor: 1, color: 'border-slate-500 text-slate-400' },
  { name: 'Kaioken x20', factor: 20, color: 'border-red-600 text-red-500 shadow-red-900/50' },
  { name: 'Super Saiyan', factor: 50, color: 'border-yellow-500 text-yellow-400 shadow-yellow-900/50' },
  { name: 'Super Saiyan 3', factor: 400, color: 'border-amber-500 text-amber-400 shadow-amber-900/50' },
  { name: 'Super Saiyan God', factor: 20000, color: 'border-rose-600 text-rose-500 shadow-rose-900/50' },
  { name: 'Super Saiyan Blue', factor: 100000, color: 'border-cyan-500 text-cyan-400 shadow-cyan-900/50' },
  { name: 'Ultra Instinct', factor: 5000000, color: 'border-purple-500 text-purple-400 shadow-purple-900/50' }
];

export default function CharactersPage() { 
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [basePower, setBasePower] = useState<number>(5000);
  const [activeForm, setActiveForm] = useState<string>('Base');

  // Filter Fighters
  const filteredFighters = useMemo(() => {
    return FIGHTERS_DATA.filter(fighter => {
      const matchesSearch = fighter.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === 'All' || fighter.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [search, selectedType]);

  // Calculate power
  const currentMultiplier = useMemo(() => {
    return MULTIPLIERS.find(m => m.name === activeForm)?.factor || 1;
  }, [activeForm]);

  const totalPower = basePower * currentMultiplier;

  // Get Epic Badge text based on power total
  const powerTier = useMemo(() => {
    if (totalPower < 10000) return { text: 'Farmer with Shotgun Tier', color: 'bg-zinc-800 text-zinc-400' };
    if (totalPower < 250000) return { text: 'Planet Threat!', color: 'bg-emerald-950 text-emerald-400 border border-emerald-500' };
    if (totalPower < 10000000) return { text: 'System Obliterator!', color: 'bg-amber-950 text-amber-400 border border-amber-500' };
    if (totalPower < 1000000000) return { text: 'Galaxy Buster!', color: 'bg-rose-950 text-rose-400 border border-rose-500 animate-pulse' };
    return { text: 'Universe Shatterer!', color: 'bg-purple-950 text-purple-300 border border-purple-500 animate-bounce' };
  }, [totalPower]);

  return (
    <div id="characters-page" className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge className="bg-orange-600 hover:bg-orange-700 text-white font-bold tracking-widest uppercase">
          DBZ Stats & Combat Database
        </Badge>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-yellow-400 to-red-600 bg-clip-text text-transparent">
          WARRING WARRIORS
        </h1>
        <p className="text-slate-400 text-lg">
          Analyze legendary fighters, explore power levels, and run real-time simulator metrics on cosmic-tier transformations.
        </p>
      </div>

      {/* 1. FIGHTERS GRID SECTION */}
      <section id="fighters-grid" className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input
              placeholder="Search fighter name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-orange-500"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['All', 'Saiyan', 'God', 'Alien', 'Cyborg'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                onClick={() => setSelectedType(type)}
                className={`flex-1 md:flex-none font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFighters.map((fighter) => {
            // SVG Spider Web Radar Calculation Points
            const center = 75;
            const maxVal = 100;
            const radius = 60;
            
            // Radians for 4 points: HP (0), Ki (PI/2), Speed (PI), Strength (3*PI/2)
            const getX = (val: number, angle: number) => {
              const length = (val / maxVal) * radius;
              return center + length * Math.cos(angle);
            };
            const getY = (val: number, angle: number) => {
              const length = (val / maxVal) * radius;
              return center + length * Math.sin(angle);
            };

            const hpPt = { x: getX(fighter.hp, -Math.PI / 2), y: getY(fighter.hp, -Math.PI / 2) };
            const kiPt = { x: getX(fighter.ki, 0), y: getY(fighter.ki, 0) };
            const speedPt = { x: getX(fighter.speed, Math.PI / 2), y: getY(fighter.speed, Math.PI / 2) };
            const strengthPt = { x: getX(fighter.strength, Math.PI), y: getY(fighter.strength, Math.PI) };

            const polygonPoints = `${hpPt.x},${hpPt.y} ${kiPt.x},${kiPt.y} ${speedPt.x},${speedPt.y} ${strengthPt.x},${strengthPt.y}`;

            return (
              <Card key={fighter.name} className="bg-slate-900/40 border-slate-800/80 hover:border-orange-500/50 transition-all duration-300 group overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                    <img 
                      src={fighter.image} 
                      alt={fighter.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 right-4 bg-orange-600/95 text-white z-20 font-bold border-none">
                      {fighter.type}
                    </Badge>
                  </div>

                  <CardHeader className="space-y-1 relative z-20 -mt-8 px-6">
                    <CardTitle className="text-2xl font-black text-slate-100 group-hover:text-orange-400 transition-colors">
                      {fighter.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 italic line-clamp-2">
                      "{fighter.quote}"
                    </CardDescription>
                  </CardHeader>

                  {/* Visual Stats Web Section */}
                  <CardContent className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="space-y-2 text-xs text-slate-400 w-1/2">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-500" /> HP</span>
                        <span className="font-bold text-slate-200">{fighter.hp}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> KI</span>
                        <span className="font-bold text-slate-200">{fighter.ki}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-500" /> SPEED</span>
                        <span className="font-bold text-slate-200">{fighter.speed}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-purple-500" /> STR</span>
                        <span className="font-bold text-slate-200">{fighter.strength}</span>
                      </div>
                    </div>

                    {/* Spider Web Simulator Canvas (SVG) */}
                    <div className="relative w-[150px] h-[150px] bg-slate-950/60 rounded-xl border border-slate-800/60 p-1 flex items-center justify-center">
                      <svg width="140" height="140" className="overflow-visible">
                        {/* Web rings */}
                        <circle cx="70" cy="70" r="50" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
                        <circle cx="70" cy="70" r="30" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                        <circle cx="70" cy="70" r="10" fill="none" stroke="#0f172a" strokeWidth="0.5" />
                        {/* Axes */}
                        <line x1="70" y1="10" x2="70" y2="130" stroke="#1e293b" strokeWidth="1" />
                        <line x1="10" y1="70" x2="130" y2="70" stroke="#1e293b" strokeWidth="1" />
                        
                        {/* Poly Area */}
                        <polygon
                          points={polygonPoints}
                          fill="rgba(249, 115, 22, 0.2)"
                          stroke="#f97316"
                          strokeWidth="1.5"
                        />
                        
                        {/* Point nodes */}
                        <circle cx={hpPt.x} cy={hpPt.y} r="2.5" fill="#10b981" />
                        <circle cx={kiPt.x} cy={kiPt.y} r="2.5" fill="#f97316" />
                        <circle cx={speedPt.x} cy={speedPt.y} r="2.5" fill="#eab308" />
                        <circle cx={strengthPt.x} cy={strengthPt.y} r="2.5" fill="#a855f7" />
                      </svg>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
        {filteredFighters.length === 0 && (
          <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-slate-500">No warriors found matching "{search}" under {selectedType}.</p>
          </div>
        )}
      </section>

      {/* 2. POWER CALCULATOR SECTION */}
      <section id="power-calc" className="max-w-4xl mx-auto">
        <Card className="bg-slate-900 border-2 border-orange-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />
          
          <CardHeader className="border-b border-slate-800 pb-6">
            <CardTitle className="text-3xl font-black text-orange-500 flex items-center gap-2">
              <Zap className="w-8 h-8 fill-orange-500 text-orange-500 animate-pulse" />
              Z-FIGHTER POWER CALCULATOR
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select a base power level and test various transformation multipliers to measure the absolute power peak.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-8 space-y-8">
            {/* Input & Slider for Base Power */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold tracking-wider text-slate-300 uppercase">Base Power Level</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={basePower}
                    onChange={(e) => setBasePower(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-32 bg-slate-950 border-slate-800 text-right text-orange-400 font-mono font-bold focus-visible:ring-orange-500"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setBasePower(9001)} 
                    className="border-slate-800 hover:text-white hover:bg-slate-800"
                    title="Over 9000!"
                  >
                    <RefreshCw className="w-4 h-4 text-orange-500" />
                  </Button>
                </div>
              </div>
              <Slider
                min={100}
                max={100000}
                step={100}
                value={[basePower]}
                onValueChange={(val) => setBasePower(val[0])}
                className="py-4"
              />
            </div>

            {/* Multipliers Grid */}
            <div className="space-y-3">
              <label className="text-sm font-semibold tracking-wider text-slate-300 uppercase block">
                Transformation Form Multiplier
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MULTIPLIERS.map((form) => (
                  <Toggle
                    key={form.name}
                    pressed={activeForm === form.name}
                    onPressedChange={() => setActiveForm(form.name)}
                    className={`border p-6 rounded-xl flex flex-col gap-1 items-center justify-center transition-all duration-300 h-20 ${
                      activeForm === form.name 
                        ? 'bg-slate-950 border-orange-500 ring-2 ring-orange-500/50 shadow-lg'
                        : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-semibold tracking-wide block text-center">{form.name}</span>
                    <span className="text-sm font-extrabold text-orange-400 font-mono">x{form.factor.toLocaleString()}</span>
                  </Toggle>
                ))}
              </div>
            </div>

            {/* Massive Glowing Counter Area */}
            <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-inner relative overflow-hidden">
              <div className="absolute top-2 left-4 text-[10px] font-mono text-slate-600 tracking-widest uppercase">Output Monitor v9.01</div>
              <div className="absolute top-2 right-4 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-mono text-red-500 font-semibold">OVERLOAD OK</span>
              </div>
              
              <div className="pt-4 space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">Calculated Combat Power</span>
                <h2 className="text-5xl sm:text-7xl font-black font-mono tracking-wider text-orange-500 select-all drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                  {totalPower.toLocaleString()}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
                <Badge className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${powerTier.color}`}>
                  {powerTier.text}
                </Badge>
                {totalPower > 9000 && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> OVER 9000!!!
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}