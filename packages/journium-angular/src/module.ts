import { NgModule, ModuleWithProviders } from '@angular/core';
import { JourniumConfig } from '@journium/core';
import { JourniumService } from './service';
import { JOURNIUM_CONFIG } from './tokens';

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
