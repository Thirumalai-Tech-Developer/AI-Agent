import React, { useState, useEffect } from 'react';
import {
  Flame,
  Swords,
  Shield,
  Zap,
  Dumbbell,
  TrendingUp,
  Sparkles,
  Trophy,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface TrainingLog {
  id: string;
  name: string;
  gain: string;
  type: 'ki' | 'strength' | 'speed';
  timestamp: string;
}

export default function SaiyanTrainingHub() {
  const [kiLevel, setKiLevel] = useState<number>(30);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [powerMultiplier, setPowerMultiplier] = useState<number>(1); // Base form
  const [gravityRoom, setGravityRoom] = useState<number>(10); // G-Force
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([
    { id: '1', name: 'Mental Image Training', gain: '+250 Ki', type: 'ki', timestamp: '2 mins ago' },
    { id: '2', name: '10,000 Pushups (100G)', gain: '+1,200 Strength', type: 'strength', timestamp: '15 mins ago' },
    { id: '3', name: 'Aura Speed Drills', gain: '+450 Speed', type: 'speed', timestamp: '1 hour ago' }
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      interval = setInterval(() => {
        setKiLevel((prev) => {
          if (prev >= 100) {
            setIsCharging(false);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isCharging]);

  const handleFormChange = (form: 'base' | 'ssj' | 'ssj2' | 'ssj3' | 'ssgss') => {
    const multipliers = {
      base: 1,
      ssj: 50,
      ssj2: 100,
      ssj3: 400,
      ssgss: 15000
    };
    setPowerMultiplier(multipliers[form]);
    if (form !== 'base') {
      // Instantly fire a flare of Ki when transforming
      setKiLevel(Math.min(kiLevel + 20, 100));
    }
  };

  const getFormName = () => {
    if (powerMultiplier === 1) return { name: 'Base Form', badge: 'bg-muted text-muted-foreground' };
    if (powerMultiplier === 50) return { name: 'Super Saiyan', badge: 'bg-accent text-accent-foreground border border-accent animate-pulse' };
    if (powerMultiplier === 100) return { name: 'Super Saiyan 2', badge: 'bg-primary text-primary-foreground border-2 border-accent animate-pulse' };
    if (powerMultiplier === 400) return { name: 'Super Saiyan 3', badge: 'bg-gradient-to-r from-primary via-accent to-secondary text-white font-bold animate-pulse' };
    return { name: 'Super Saiyan Blue', badge: 'bg-blue-600 text-white animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.6)]' };
  };

  const triggerTraining = (type: 'ki' | 'strength' | 'speed', name: string, gainValue: string) => {
    const newLog: TrainingLog = {
      id: Date.now().toString(),
      name,
      gain: gainValue,
      type,
      timestamp: 'Just now'
    };
    setTrainingLogs([newLog, ...trainingLogs.slice(0, 5)]);
    
    // Boost Ki slightly on completed action
    setKiLevel((prev) => Math.min(prev + 10, 100));
  };

  const currentForm = getFormName();
  const basePowerLevel = 12000;
  const currentPowerLevel = basePowerLevel * powerMultiplier * (1 + (gravityRoom / 100)) * (1 + (kiLevel / 100));

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-card to-muted border border-border relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary text-primary font-bold tracking-wider uppercase">
                Hyperbolic Time Chamber
              </Badge>
              <Badge className={currentForm.badge}>
                {currentForm.name}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-sm">
              Saiyan Training Hub
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base">
              Harness the ultimate warrior lineage. Adjust your gravity multiplier, control your raw Ki circulation, and breakthrough historical physical bounds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
            <Button 
              onClick={() => setIsCharging(true)} 
              disabled={isCharging || kiLevel >= 100}
              className={`w-full sm:w-auto font-bold tracking-wide uppercase transition-all duration-300 ${
                isCharging ? 'ki-aura-button bg-primary text-white scale-105' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              <Flame className="mr-2 h-5 w-5 animate-pulse" />
              {isCharging ? 'Charging Ki...' : kiLevel >= 100 ? 'Ki Fully Charged' : 'Charge Ki'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setKiLevel(30)} 
              className="w-full sm:w-auto border-border hover:bg-secondary/20"
            >
              Reset Ki
            </Button>
          </div>
        </div>

        {/* GRID DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: LIVE METRICS & CHARGERS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* CORE POWER CARD */}
            <Card className="border-border bg-card overflow-hidden shadow-lg animate-float">
              <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Zap className="text-accent h-5 w-5" />
                    Live Scouter Reading
                  </CardTitle>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Scouter V3.2</span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated Combat Power</span>
                  <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-accent">
                    {currentPowerLevel.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Multiplier: <span className="text-primary font-bold">x{powerMultiplier.toLocaleString()}</span> | Gravity Chamber: <span className="text-primary font-bold">{gravityRoom}G</span>
                  </p>
                </div>

                {/* KI RESERVE BAR */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="flex items-center gap-1 text-primary">
                      <Flame className="h-4 w-4 fill-primary/20" /> Ki Aura Resonance
                    </span>
                    <span className={kiLevel >= 90 ? 'text-accent animate-pulse font-bold' : 'text-foreground'}>
                      {kiLevel}% {kiLevel >= 90 && ' (MAX POWER)'}
                    </span>
                  </div>
                  <div className="relative h-4 w-full bg-secondary/30 rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-300 ease-out"
                      style={{ width: `${kiLevel}%` }}
                    />
                    {isCharging && (
                      <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GRAVITY CHAMBER CONTROLLER */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-primary h-5 w-5" />
                  Capsule Corp Gravity Chamber
                </CardTitle>
                <CardDescription>
                  Increase atmospheric pressure to artificially accelerate physical limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-border">
                  <div>
                    <span className="text-sm text-muted-foreground block">Active Intensity</span>
                    <span className="text-2xl font-bold text-primary">{gravityRoom}x Earth Gravity</span>
                  </div>
                  <Badge variant="outline" className="border-accent text-accent animate-pulse">
                    {gravityRoom <= 50 ? 'Novice' : gravityRoom <= 200 ? 'Super Saiyan Level' : 'Godly Strain'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {[10, 50, 100, 300, 500].map((g) => (
                      <Button
                        key={g}
                        variant={gravityRoom === g ? 'default' : 'outline'}
                        onClick={() => setGravityRoom(g)}
                        className="flex-1 font-bold"
                      >
                        {g}G
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TRAINING DRILLS ACTIONS */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="text-accent h-5 w-5" />
                  Execute Physical & Spiritual Drills
                </CardTitle>
                <CardDescription>
                  Select an active combat discipline to log performance and earn core attributes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => triggerTraining('strength', 'Heavy Guard Sparring', '+1,500 Strength')}
                    className="h-auto py-4 flex flex-col gap-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <Swords className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="font-bold text-xs block">Heavy Sparring</div>
                      <span className="text-[10px] text-muted-foreground">+1.5k Strength</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => triggerTraining('ki', 'Aura Expansion Meditation', '+800 Ki reserve')}
                    className="h-auto py-4 flex flex-col gap-2 border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
                  >
                    <Flame className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="font-bold text-xs block">Meditation</div>
                      <span className="text-[10px] text-muted-foreground">+800 Ki Reserve</span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => triggerTraining('speed', 'Afterimage Flash Drills', '+1,200 Agility')}
                    className="h-auto py-4 flex flex-col gap-2 border-border hover:border-blue-400/50 hover:bg-blue-500/5 transition-all group"
                  >
                    <TrendingUp className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <div className="font-bold text-xs block">Afterimage Speed</div>
                      <span className="text-[10px] text-muted-foreground">+1.2k Speed</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT: TRANSFORMATION PANEL & RECENT TRAINING LOGS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SAISYAN FORM CONTROL */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-accent h-5 w-5" />
                  Transformation Tier
                </CardTitle>
                <CardDescription>
                  Break spiritual locks. Choose your active form multiplier.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => handleFormChange('base')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    powerMultiplier === 1
                      ? 'bg-secondary/40 border-secondary-foreground/20 font-bold'
                      : 'bg-background/20 border-border/60 hover:border-border'
                  }`}
                >
                  <div>
                    <span className="text-sm block">Base Warrior Form</span>
                    <span className="text-xs text-muted-foreground">Standard Power Threshold</span>
                  </div>
                  <Badge variant="outline">Multiplier: 1x</Badge>
                </button>

                <button
                  onClick={() => handleFormChange('ssj')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    powerMultiplier === 50
                      ? 'bg-accent/10 border-accent/40 font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                      : 'bg-background/20 border-border/60 hover:border-accent/40'
                  }`}
                >
                  <div>
                    <span className="text-sm block text-accent font-bold">Super Saiyan</span>
                    <span className="text-xs text-muted-foreground">Golden Aura Active</span>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">50x</Badge>
                </button>

                <button
                  onClick={() => handleFormChange('ssj2')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    powerMultiplier === 100
                      ? 'bg-primary/10 border-primary/40 font-bold shadow-[0_0_10px_rgba(234,88,12,0.2)]'
                      : 'bg-background/20 border-border/60 hover:border-primary/40'
                  }`}
                >
                  <div>
                    <span className="text-sm block text-primary font-bold">Super Saiyan 2</span>
                    <span className="text-xs text-muted-foreground">Lightning Discharges</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">100x</Badge>
                </button>

                <button
                  onClick={() => handleFormChange('ssj3')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    powerMultiplier === 400
                      ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-accent font-bold shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                      : 'bg-background/20 border-border/60 hover:border-accent'
                  }`}
                >
                  <div>
                    <span className="text-sm block text-accent font-extrabold">Super Saiyan 3</span>
                    <span className="text-xs text-muted-foreground">Extreme Stamina Drain</span>
                  </div>
                  <Badge className="bg-accent text-accent-foreground font-black">400x</Badge>
                </button>

                <button
                  onClick={() => handleFormChange('ssgss')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    powerMultiplier === 15000
                      ? 'bg-blue-950/40 border-blue-500 font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'bg-background/20 border-border/60 hover:border-blue-400/40'
                  }`}
                >
                  <div>
                    <span className="text-sm block text-blue-400 font-bold">Super Saiyan Blue</span>
                    <span className="text-xs text-muted-foreground">Divine Ki Control</span>
                  </div>
                  <Badge className="bg-blue-600 text-white font-extrabold">15,000x</Badge>
                </button>
              </CardContent>
            </Card>

            {/* RECENT SESSION LOGS */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-primary h-5 w-5" />
                  Chamber Log History
                </CardTitle>
                <CardDescription>
                  Tracks active milestones accomplished under gravity strain.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {trainingLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex justify-between items-center p-3 rounded-lg bg-background/40 border border-border/60 transition-all hover:bg-background/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-secondary/60">
                        {log.type === 'ki' && <Flame className="h-4 w-4 text-accent" />}
                        {log.type === 'strength' && <Swords className="h-4 w-4 text-primary" />}
                        {log.type === 'speed' && <TrendingUp className="h-4 w-4 text-blue-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{log.name}</div>
                        <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[11px] bg-secondary text-secondary-foreground border border-border/80">
                      {log.gain}
                    </Badge>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="pt-0 text-center justify-center">
                <p className="text-xs text-muted-foreground">All battle data synchronized with Capsule Corp central frames.</p>
              </CardFooter>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}