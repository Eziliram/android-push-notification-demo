import { Injectable } from '@angular/core';
import { BrazeParsedExtra, BrazePushNotification } from '@models/braze/braze-push-notification';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { BrazeService } from './braze.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  constructor(private brazeService: BrazeService) {}

  init() {
    PushNotifications.addListener('registration', (token) => {
      console.log('~ PushNotificationService ~ token:', token);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema | BrazePushNotification) => {
        // TODO: Implement content card checking functionality when receiving Braze push notification with type === 'inbox' in "Extra's"
        const extra = notification.data?.["extra"];

        if (typeof extra !== "string") {
          return;
        }

        try {
          const parsedExtra: BrazeParsedExtra = JSON.parse(extra);

          if (parsedExtra.type === "inbox") {
            this.brazeService.requestContentCardsRefresh();
          }
        } catch (error) {
          console.error("Unable to parse push notification extras:", error);
        }
      }
    );

    this.registerPush();
  }

  async registerPush(): Promise<void> {
    let pushReq = await PushNotifications.checkPermissions();

    if (pushReq.receive === 'prompt') {
      pushReq = await PushNotifications.requestPermissions();
    }

    if (pushReq.receive) {
      // Ask iOS user for permission/auto grant android permission
      await PushNotifications.register();
    }
  }
}
