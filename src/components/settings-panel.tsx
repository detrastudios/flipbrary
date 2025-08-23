
"use client";

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon, Laptop } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPanel() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Mode Tampilan</Label>
        <p className="text-sm text-muted-foreground">
          Pilih preferensi tema antarmuka aplikasi.
        </p>
      </div>
       <div className="flex items-center space-x-2 rounded-lg border p-1 bg-muted">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          onClick={() => handleThemeChange('light')}
          className={cn("flex-1 justify-center", theme === 'light' && 'bg-background text-foreground shadow-sm')}
        >
          <Sun className="mr-2 h-4 w-4" />
          Terang
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
           onClick={() => handleThemeChange('dark')}
          className={cn("flex-1 justify-center", theme === 'dark' && 'bg-background text-foreground shadow-sm')}
        >
          <Moon className="mr-2 h-4 w-4" />
          Gelap
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'ghost'}
           onClick={() => handleThemeChange('system')}
           className={cn("flex-1 justify-center", theme === 'system' && 'bg-background text-foreground shadow-sm')}
        >
          <Laptop className="mr-2 h-4 w-4" />
          Sistem
        </Button>
      </div>
    </div>
  );
}
