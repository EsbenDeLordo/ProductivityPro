import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Pause, Play, RotateCcw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TimerMode = 'focus' | 'short-break' | 'long-break';
interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  alarmSound: 'bell',
};

// Alarm sounds
const ALARM_SOUNDS = {
  bell: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'),
  // Add more alarm sounds here if needed
};

export default function PomodoroTimer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize timer based on current mode
  useEffect(() => {
    let duration = 0;
    switch (mode) {
      case 'focus':
        duration = settings.focus * 60;
        break;
      case 'short-break':
        duration = settings.shortBreak * 60;
        break;
      case 'long-break':
        duration = settings.longBreak * 60;
        break;
    }
    setTimeLeft(duration);
    setIsRunning(false);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [mode, settings]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Play alarm sound
    const alarm = ALARM_SOUNDS[settings.alarmSound as keyof typeof ALARM_SOUNDS];
    if (alarm) {
      alarm.play().catch(error => console.error('Error playing alarm:', error));
    }

    // Show notification
    if (mode === 'focus') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      toast({
        title: 'Focus session complete!',
        description: `You've completed ${newCount} pomodoro${newCount !== 1 ? 's' : ''} today.`,
      });

      // Determine which break to take
      if (newCount % settings.longBreakInterval === 0) {
        if (settings.autoStartBreaks) {
          setMode('long-break');
          setIsRunning(true);
        } else {
          setMode('long-break');
          setIsRunning(false);
        }
      } else {
        if (settings.autoStartBreaks) {
          setMode('short-break');
          setIsRunning(true);
        } else {
          setMode('short-break');
          setIsRunning(false);
        }
      }
    } else {
      // Break is complete, start a new focus session
      toast({
        title: 'Break complete!',
        description: 'Time to focus again.',
      });

      if (settings.autoStartPomodoros) {
        setMode('focus');
        setIsRunning(true);
      } else {
        setMode('focus');
        setIsRunning(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    let totalDuration = 0;
    switch (mode) {
      case 'focus':
        totalDuration = settings.focus * 60;
        break;
      case 'short-break':
        totalDuration = settings.shortBreak * 60;
        break;
      case 'long-break':
        totalDuration = settings.longBreak * 60;
        break;
    }
    
    return 100 - (timeLeft / totalDuration * 100);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    let duration = 0;
    switch (mode) {
      case 'focus':
        duration = settings.focus * 60;
        break;
      case 'short-break':
        duration = settings.shortBreak * 60;
        break;
      case 'long-break':
        duration = settings.longBreak * 60;
        break;
    }
    
    setTimeLeft(duration);
    setIsRunning(false);
  };

  const getCardColor = () => {
    switch (mode) {
      case 'focus':
        return 'bg-gradient-to-b from-red-50 to-transparent border-red-200 dark:from-red-950/20 dark:border-red-800/30';
      case 'short-break':
        return 'bg-gradient-to-b from-green-50 to-transparent border-green-200 dark:from-green-950/20 dark:border-green-800/30';
      case 'long-break':
        return 'bg-gradient-to-b from-blue-50 to-transparent border-blue-200 dark:from-blue-950/20 dark:border-blue-800/30';
    }
  };

  const getProgressColor = () => {
    switch (mode) {
      case 'focus':
        return 'bg-red-500';
      case 'short-break':
        return 'bg-green-500';
      case 'long-break':
        return 'bg-blue-500';
    }
  };

  return (
    <Card className={`overflow-hidden transition-all ${getCardColor()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Pomodoro Timer</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Stay focused and take structured breaks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showSettings ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Timer Durations (minutes)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Focus</label>
                  <Slider 
                    className="py-1"
                    value={[settings.focus]} 
                    min={5} 
                    max={60} 
                    step={5} 
                    onValueChange={([value]) => setSettings({...settings, focus: value})}
                  />
                  <div className="text-center text-xs">{settings.focus} min</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Short Break</label>
                  <Slider 
                    className="py-1"
                    value={[settings.shortBreak]} 
                    min={1} 
                    max={15} 
                    step={1} 
                    onValueChange={([value]) => setSettings({...settings, shortBreak: value})}
                  />
                  <div className="text-center text-xs">{settings.shortBreak} min</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Long Break</label>
                  <Slider 
                    className="py-1"
                    value={[settings.longBreak]} 
                    min={5} 
                    max={30} 
                    step={5} 
                    onValueChange={([value]) => setSettings({...settings, longBreak: value})}
                  />
                  <div className="text-center text-xs">{settings.longBreak} min</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Long Break Interval</label>
                <Select
                  value={settings.longBreakInterval.toString()}
                  onValueChange={(value) => setSettings({...settings, longBreakInterval: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Every 2 sessions</SelectItem>
                    <SelectItem value="3">Every 3 sessions</SelectItem>
                    <SelectItem value="4">Every 4 sessions</SelectItem>
                    <SelectItem value="5">Every 5 sessions</SelectItem>
                    <SelectItem value="6">Every 6 sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Alarm Sound</label>
                <Select
                  value={settings.alarmSound}
                  onValueChange={(value) => setSettings({...settings, alarmSound: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sound" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bell">Bell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={settings.autoStartBreaks}
                  onChange={() => setSettings({...settings, autoStartBreaks: !settings.autoStartBreaks})}
                />
                <span>Auto-start breaks</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer ml-4">
                <input 
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={settings.autoStartPomodoros}
                  onChange={() => setSettings({...settings, autoStartPomodoros: !settings.autoStartPomodoros})}
                />
                <span>Auto-start focus sessions</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            <Tabs 
              defaultValue="focus" 
              value={mode} 
              onValueChange={(value) => setMode(value as TimerMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="focus">Focus</TabsTrigger>
                <TabsTrigger value="short-break">Short Break</TabsTrigger>
                <TabsTrigger value="long-break">Long Break</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col items-center justify-center pt-4">
              <div className="text-5xl font-bold mb-6">{formatTime(timeLeft)}</div>
              
              <div className="w-full max-w-md mb-6">
                <Progress value={calculateProgress()} className={`h-3 ${getProgressColor()}`} />
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={toggleTimer} 
                  size="lg"
                  variant={mode === 'focus' ? 'default' : 'outline'}
                  className={`rounded-full h-12 w-12 p-0 ${
                    mode === 'focus' 
                      ? '' 
                      : mode === 'short-break' 
                        ? 'text-green-600 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/50' 
                        : 'text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/50'
                  }`}
                >
                  {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button 
                  onClick={resetTimer} 
                  variant="outline" 
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-1" />
                <span>
                  {mode === 'focus' 
                    ? `${settings.focus} min focus` 
                    : mode === 'short-break' 
                      ? `${settings.shortBreak} min short break` 
                      : `${settings.longBreak} min long break`
                  }
                </span>
              </div>
              <div>{completedPomodoros} completed today</div>
            </div>
          </div>
        )}
      </CardContent>
      
      {showSettings && (
        <CardFooter className="justify-end pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(false)}
          >
            Done
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}