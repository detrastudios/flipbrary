"use client";

import SettingsPanel from '@/components/settings-panel';
import { ScrollArea } from './ui/scroll-area';


export default function ControlPanel() {
    return (
        <ScrollArea className="h-full w-full py-4 pr-4">
            <SettingsPanel />
        </ScrollArea>
    );
}
