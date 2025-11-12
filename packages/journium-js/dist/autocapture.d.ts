import { JourniumClient } from './client';
export interface AutocaptureConfig {
    captureClicks?: boolean;
    captureFormSubmits?: boolean;
    captureFormChanges?: boolean;
    captureTextSelection?: boolean;
    ignoreClasses?: string[];
    ignoreElements?: string[];
    captureContentText?: boolean;
}
export interface AutocaptureEvent {
    event: string;
    properties: Record<string, any>;
}
export declare class AutocaptureTracker {
    private client;
    private config;
    private listeners;
    private isActive;
    constructor(client: JourniumClient, config?: AutocaptureConfig);
    start(): void;
    stop(): void;
    private addClickListener;
    private addFormSubmitListener;
    private addFormChangeListener;
    private addTextSelectionListener;
    private shouldIgnoreElement;
    private isFormElement;
    private getElementProperties;
    private getFormProperties;
    private getInputProperties;
    private getElementType;
    private getElementText;
    private getElementsChain;
    private isSafeInputType;
}
//# sourceMappingURL=autocapture.d.ts.map