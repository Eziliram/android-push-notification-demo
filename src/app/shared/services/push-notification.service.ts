import { Injectable } from '@angular/core';
import { BrazeParsedExtra, BrazePushNotification } from '@models/braze/braze-push-notification';
import { PushNotifications, PushNotificationSchema } from '@capacitor/push-notifications';
import { BrazeService } from './braze.service';
import { JSONParse } from '@utils/json-parse';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private initialisation?: Promise<void>;

  constructor(private readonly brazeService: BrazeService) {}

  init(): Promise<void> {
    this.initialisation ??= this.initPushNotifications();
    return this.initialisation;
  }

  private async initPushNotifications(): Promise<void> {
    await Promise.all([
      PushNotifications.addListener(
        'registration',
        (token) => console.log('~ PushNotificationService ~ token:', token)),
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema | BrazePushNotification) => {
          const extra = notification.data?.['extra'];

          if (typeof extra !== 'string') {
            return;
          }

          const parsedExtra = JSONParse(extra);

          if (isInboxExtra(parsedExtra)) {
            this.brazeService.fetchInboxContentCards();
          }
        }
      ),
      PushNotifications.addListener(
        'registrationError',
        (error) => console.error('Push notification registration failed:', error))
    ]);

    let permissionStatus = await PushNotifications.checkPermissions();

    if (permissionStatus.receive === 'prompt') {
      permissionStatus = await PushNotifications.requestPermissions();
    }

    if (permissionStatus.receive === 'granted') {
      await PushNotifications.register();
    }
  }
}

function isInboxExtra(value: unknown): value is BrazeParsedExtra {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'inbox';
}
