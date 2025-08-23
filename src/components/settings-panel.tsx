
"use client";

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Sun, Moon, Laptop, Info, HeartHandshake, Mail, Copy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPanel() {
  const [theme, setTheme] = useState<Theme>('system');
  const { toast } = useToast();

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
  
  const handleCopy = (textToCopy: string, label: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Disalin!",
        description: `${label} telah disalin ke clipboard.`,
      });
    }).catch(err => {
      console.error('Gagal menyalin: ', err);
      toast({
        variant: "destructive",
        title: "Gagal Menyalin",
        description: "Tidak dapat menyalin ke clipboard.",
      });
    });
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
      
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="about">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Tentang Sahijra
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
             <p>Sahabat Hijrah (SAHIJRA) adalah asisten AI yang dirancang untuk membantu Anda mencari jawaban seputar agama Islam berdasarkan Al-Qur'an dan hadis shahih sesuai pemahaman Salafus Shalih.</p>
             <p>Tujuan kami adalah menyediakan informasi yang cepat, akurat dan terpercaya untuk membantu perjalanan hijrah Anda. Tapi harus tetap diingat bahwa, AI tidaklah ma’shum (terjaga dari kesalahan) dan tidak 100% valid. Gunakanlah dengan bijak, jauhi perdebatan, selalu kroscek dan konsultasikan dengan Ustadz yang berilmu agar mendapatkan pemahaman yang mantap, terhindar dari kekeliruan dan tidak tergelincir dalam kesesatan.</p>
             <p className="font-semibold text-foreground">created by Sahijra Team @sahijra</p>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="support">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Dukung Dakwah SAHIJRA
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Mari berjuang bersama dalam dakwah untuk menyebarkan ilmu yang bermanfaat. Dukungan Anda sangat berarti.</p>
            <div>
              <p className="font-semibold text-foreground">Bank Syariah Indonesia (BSI)</p>
              <div className="flex items-center justify-between">
                <span>7283392559 (an. Denny Saputra)</span>
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('7283392559', 'Nomor rekening BSI')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
               <p className="font-semibold text-foreground">Bank Mandiri</p>
               <div className="flex items-center justify-between">
                <span>9000006111349 (an. Denny Saputra)</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('9000006111349', 'Nomor rekening Mandiri')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
             <p>Atau melalui <Link href="https://lynk.id/sahijra" target="_blank" rel="noopener noreferrer" className="text-primary underline">Lynk.id Sahijra</Link></p>
            <p className="italic">Jazakumullahu khairan. Semoga Allah ﷻ membalas kebaikan Anda.</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="contact" className="border-b-0">
          <AccordionTrigger>
             <div className="flex items-center gap-2">
               <Mail className="h-4 w-4" />
               Bantuan & Kontak
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Jika Anda memiliki pertanyaan, saran, atau masukan, jangan ragu untuk menghubungi kami melalui media sosial di bawah ini:</p>
            <div className="flex items-center justify-between">
              <span>sahijra.official@gmail.com</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy('sahijra.official@gmail.com', 'Alamat email')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
             <p>Instagram: <Link href="https://instagram.com/sahijra" target="_blank" rel="noopener noreferrer" className="text-primary underline">@sahijra</Link></p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
