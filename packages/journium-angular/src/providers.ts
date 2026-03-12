import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { JourniumConfig } from '@journium/core';
import { JourniumService } from './service';
import { JOURNIUM_CONFIG } from './tokens';
import { filter } from 'rxjs';

export const JOURNIUM_ROUTER_FEATURE = new InjectionToken<void>(
  'JOURNIUM_ROUTER_FEATURE'
);

export function provideJournium(config: JourniumConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: JOURNIUM_CONFIG, useValue: config },
    JourniumService,
  ]);
}

export function withJourniumRouter(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: JOURNIUM_ROUTER_FEATURE,
      useValue: null,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const router = inject(Router);
        const journiumService = inject(JourniumService);
        return () => {
          router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
              journiumService.capturePageview();
            });
        };
      },
      multi: true,
    },
  ]);
}
