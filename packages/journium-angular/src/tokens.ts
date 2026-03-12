import { InjectionToken } from '@angular/core';
import { JourniumConfig } from '@journium/core';

export const JOURNIUM_CONFIG = new InjectionToken<JourniumConfig>('JOURNIUM_CONFIG');
