
"use client";

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, HeartHandshake, Mail, Sun, Moon } from "lucide-react";

export default function SettingsPanel() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="h-full flex flex-col pt-6 space-y-6">
      <div className="px-4 space-y-4">
        <Label>Tampilan</Label>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="flex items-center space-x-2">
            {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <span className="text-sm font-medium">Mode Gelap</span>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={handleThemeChange}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full px-4">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <span>Tentang Sahabat Hijrah</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Sahabat Hijrah (SAHIJRA) adalah asisten AI yang dirancang untuk membantu Anda mencari jawaban seputar agama Islam berdasarkan Al-Qur'an dan hadis shahih sesuai pemahaman Salafus Shalih.
            </p>
            <p>
              Tujuan kami adalah menyediakan informasi yang cepat, akurat dan terpercaya untuk membantu perjalanan hijrah Anda. Tapi harus tetap diingat bahwa, AI tidaklah ma’shum (terjaga dari kesalahan) dan tidak 100% valid. Gunakanlah dengan bijak, jauhi perdebatan, selalu kroscek dan konsultasikan dengan Ustadz yang berilmu agar mendapatkan pemahaman yang mantap, terhindar dari kekeliruan dan tidak tergelincir dalam kesesatan.
            </p>
            <p className="font-medium text-foreground">
              created by Sahijra Team @sahijra
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
             <div className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5" />
              <span>Dukung Dakwah SAHIJRA</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Mari berjuang bersama dalam dakwah untuk menyebarkan ilmu yang bermanfaat. Dukungan Anda sangat berarti.
            </p>
            <div>
              <p className="font-semibold text-foreground">Bank Syariah Indonesia (BSI)</p>
              <p>Nomor Rekening: 7283392559</p>
              <p>(an. Denny Saputra)</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Bank Mandiri</p>
              <p>Nomor Rekening: 9000006111349</p>
              <p>(an. Denny Saputra)</p>
            </div>
            <p>Atau melalui Lynk.id Sahijra</p>
            <p className="font-medium text-foreground pt-2">
              Jazakumullahu khairan. Semoga Allah ﷻ membalas kebaikan Anda.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>Bantuan & Kontak</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Jika Anda memiliki pertanyaan, saran, atau masukan, jangan ragu untuk menghubungi kami melalui media sosial di bawah ini:
            </p>
            <p>
              <a href="mailto:sahijra.official@gmail.com" className="text-primary hover:underline">sahijra.official@gmail.com</a>
            </p>
            <p>@sahijra</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
