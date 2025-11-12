import React, { ReactNode } from 'react';
import { JourniumConfig } from '@journium/shared';
interface NextJourniumProviderProps {
    children: ReactNode;
    config: JourniumConfig;
    autoCapture?: boolean;
    trackRouteChanges?: boolean;
}
export declare const NextJourniumProvider: React.FC<NextJourniumProviderProps>;
export {};
//# sourceMappingURL=provider.d.ts.map