
"use client";

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Sun, Moon, Laptop, Info, HeartHandshake, Mail, Copy, Settings } from 'lucide-react';
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
    <div className="space-y-4">
       <div className="space-y-1.5">
        <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Label className="text-sm font-semibold">Pengaturan</Label>
        </div>
        <p className="text-xs text-muted-foreground pl-6">
          Atur preferensi tampilan aplikasi Anda di sini.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Mode Tampilan</Label>
        <p className="text-xs text-muted-foreground">
          Pilih preferensi tema antarmuka aplikasi.
        </p>
      </div>
       <div className="flex items-center space-x-1 rounded-lg border p-1 bg-muted">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          onClick={() => handleThemeChange('light')}
          size="sm"
          className={cn("flex-1 justify-center text-xs", theme === 'light' && 'bg-background text-foreground shadow-sm')}
        >
          <Sun className="mr-1.5 h-3.5 w-3.5" />
          Terang
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
           onClick={() => handleThemeChange('dark')}
          size="sm"
          className={cn("flex-1 justify-center text-xs", theme === 'dark' && 'bg-background text-foreground shadow-sm')}
        >
          <Moon className="mr-1.5 h-3.5 w-3.5" />
          Gelap
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'ghost'}
           onClick={() => handleThemeChange('system')}
           size="sm"
           className={cn("flex-1 justify-center text-xs", theme === 'system' && 'bg-background text-foreground shadow-sm')}
        >
          <Laptop className="mr-1.5 h-3.5 w-3.5" />
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
          <AccordionContent className="text-xs text-muted-foreground space-y-3">
            <div className="space-y-1.5">
                <p>🌙 <span className="font-semibold text-foreground">Tentang Sahijra</span></p>
                <p>Sahijra (Sahabat Hijrah) adalah gerakan dakwah digital yang hadir untuk menemani langkah kaum muslimin dalam perjalanan hijrah menuju Allah ﷻ.</p>
                <p>Kami percaya bahwa hijrah bukan sekadar tren, melainkan perjalanan seumur hidup—sebuah usaha untuk terus belajar, memperbaiki diri, dan istiqamah di atas Al-Qur’an dan As-Sunnah sesuai pemahaman Salafus Shalih.</p>
            </div>
            <div className="space-y-1.5">
                <p>✨ <span className="font-semibold text-foreground">Misi Kami</span></p>
                <p>📖 Menyebarkan ilmu syar’i yang benar dan bermanfaat</p>
                <p>🤝 Menjadi sahabat dalam perjalanan hijrah muslimin</p>
                <p>💻 Menghadirkan teknologi & media kreatif untuk dakwah</p>
                <p>🌍 Menyebarkan kebaikan yang bisa diakses siapa saja, kapan saja</p>
            </div>
            <div className="space-y-1.5">
                <p>💡 <span className="font-semibold text-foreground">Apa yang Kami Lakukan?</span></p>
                <p>Sahabat Hijrah AI → asisten berbasis kecerdasan buatan untuk menjawab pertanyaan agama sesuai Qur’an & Sunnah</p>
                <p>Produk Digital Edukatif → poster anak, peta kota aesthetic, dll. hasil penjualannya untuk support dakwah</p>
                <p>Konten & Media Dakwah → menyampaikan ilmu dengan cara yang hangat, mudah dipahami, dan tetap menjaga adab</p>
                <p>Kajian Rutin Offline → mempertemukan muslimin dalam majelis ilmu yang penuh berkah</p>
                <p>Kajian Online & Self Development Islami (insyaAllah segera hadir) → membahas ilmu agama & pengembangan diri seorang muslim agar lebih bermanfaat dan istiqamah di jalan hijrah</p>
            </div>
             <div className="space-y-1.5">
                <p>🕌 <span className="font-semibold text-foreground">Mengapa Harus Mendukung?</span></p>
                <p>Karena setiap dukungan—baik lewat donasi, pembelian produk, maupun berbagi konten—akan menjadi bagian dari amal jariyah insyaAllah. “Perumpamaan orang yang menafkahkan hartanya di jalan Allah seperti sebutir benih yang menumbuhkan tujuh bulir, pada tiap bulir seratus biji.” (QS. Al-Baqarah: 261)</p>
            </div>
             <div className="space-y-1.5">
                <p>🌱 Sahijra hadir bukan hanya sebagai nama, tapi sebagai teman perjalanan hijrahmu. Barakallahu fiikum.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="support">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Dukung Dakwah SAHIJRA
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground space-y-2">
            <p>Mari berjuang bersama dalam dakwah untuk menyebarkan ilmu yang bermanfaat. Dukungan Anda sangat berarti.</p>
            <div>
              <p className="font-semibold text-foreground">Bank Syariah Indonesia (BSI)</p>
              <div className="flex items-center justify-between">
                <span>7283392559 (an. Denny Saputra)</span>
                 <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy('7283392559', 'Nomor rekening BSI')}>
                  <Copy className="h-3.5 w-3.5" />
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
          <AccordionContent className="text-xs text-muted-foreground space-y-2">
            <p>Jika Anda memiliki pertanyaan, saran, atau masukan, jangan ragu untuk menghubungi kami melalui media sosial di bawah ini:</p>
            <div className="flex items-center justify-between">
              <span>sahijra.official@gmail.com</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy('sahijra.official@gmail.com', 'Alamat email')}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
             <p>Instagram: <Link href="https://instagram.com/sahijra" target="_blank" rel="noopener noreferrer" className="text-primary underline">@sahijra</Link></p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
