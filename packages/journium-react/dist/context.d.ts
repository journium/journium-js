import React, { ReactNode } from 'react';
import { Journium } from 'journium-js';
import { JourniumConfig } from '@journium/shared';
interface JourniumContextValue {
    journium: Journium | null;
}
interface JourniumProviderProps {
    children: ReactNode;
    config: JourniumConfig;
    autoCapture?: boolean;
}
export declare const JourniumProvider: React.FC<JourniumProviderProps>;
export declare const useJournium: () => JourniumContextValue;
export {};
//# sourceMappingURL=context.d.ts.map