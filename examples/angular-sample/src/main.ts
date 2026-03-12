import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideJournium, withJourniumRouter } from '@journium/angular';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideJournium({
      publishableKey: environment.journiumPublishableKey,
      apiHost: environment.journiumApiHost,
      options: { debug: true },
    }),
    provideRouter(routes),
    withJourniumRouter(),
  ],
}).catch((err) => console.error(err));
