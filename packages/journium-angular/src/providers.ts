import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
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
    {
      provide: JourniumService,
      useFactory: () => new JourniumService(config),
    },
  ]);
}

export function withJourniumRouter(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: JOURNIUM_ROUTER_FEATURE,
      useValue: null,
    },
    {
      // Re-provide JourniumService with _frameworkHandlesPageviews flag.
      // This tells the JS SDK to skip built-in pageview tracking (pushState patching,
      // initial pageview) without modifying autoTrackPageviews, so remote config can
      // still override autoTrackPageviews to false and disable framework tracking too.
      // Uses deps[] instead of inject() because this factory is resolved indirectly
      // (as a dependency of the app initializer), which does not set up an inject() context.
      provide: JourniumService,
      useFactory: (config: JourniumConfig) => {
        return new JourniumService({
          ...config,
          options: { ...config?.options, _frameworkHandlesPageviews: true },
        });
      },
      deps: [JOURNIUM_CONFIG],
    },
    provideAppInitializer(() => {
      const router = inject(Router);
      const journiumService = inject(JourniumService);
      const config = inject(JOURNIUM_CONFIG) as JourniumConfig;
      // Skip if the user has explicitly disabled all pageview tracking.
      if (config?.options?.autoTrackPageviews === false) {
        return;
      }
      router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          // Check effective options at event time so remote config changes
          // (e.g. autoTrackPageviews: false) are respected immediately.
          const effective = journiumService.getEffectiveOptions();
          if (effective.autoTrackPageviews === false) {
            return;
          }
          journiumService.capturePageview();
        });
    }),
  ]);
}
