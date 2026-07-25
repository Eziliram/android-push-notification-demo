import { Injectable } from '@angular/core';
import { BrazeParsedExtra, BrazePushNotification } from '@models/braze/braze-push-notification';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { BrazeService } from './braze.service';
import { JSONParse } from '@utils/json-parse';

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
        const extra = notification.data?.["extra"];

        if (typeof extra !== "string") {
          return;
        }

        const parsedExtra: BrazeParsedExtra | null = JSONParse(extra);

        if (parsedExtra?.type === "inbox") {
          this.brazeService.fetchInboxContentCards();
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
