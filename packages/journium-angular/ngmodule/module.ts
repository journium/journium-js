import { NgModule, ModuleWithProviders } from '@angular/core';
import { JourniumConfig } from '@journium/core';
import { JourniumService, JOURNIUM_CONFIG } from '@journium/angular';

@NgModule({})
export class JourniumModule {
  static forRoot(config: JourniumConfig): ModuleWithProviders<JourniumModule> {
    return {
      ngModule: JourniumModule,
      providers: [
        { provide: JOURNIUM_CONFIG, useValue: config },
        {
          provide: JourniumService,
          useFactory: () => new JourniumService(config),
        },
      ],
    };
  }
}
