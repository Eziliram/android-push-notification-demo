import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { BrazeService } from '@services/braze.service';
import { PushNotificationService } from '@services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly brazeService: BrazeService
  ) {
    this.brazeService.init();
    void this.pushNotificationService.init().catch((error: unknown) => {
      console.error('Unable to initialize push notifications:', error);
    });
  }
}
