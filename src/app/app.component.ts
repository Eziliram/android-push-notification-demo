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
    private pushNotificationService: PushNotificationService,
    private brazeService: BrazeService
  ) {
    this.pushNotificationService.init();
    this.brazeService.init();
  }
}
