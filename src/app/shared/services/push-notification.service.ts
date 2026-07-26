import { Inject, Injectable, InjectionToken } from '@angular/core';
import { PushNotifications, PushNotificationsPlugin } from '@capacitor/push-notifications';
import { BrazeParsedExtra } from '@models/braze/braze-push-notification';
import { JSONParse } from '@utils/json-parse';
import { BrazeService } from './braze.service';

export const PUSH_NOTIFICATIONS = new InjectionToken<PushNotificationsPlugin>('PUSH_NOTIFICATIONS', {
  providedIn: 'root',
  factory: () => PushNotifications
});

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private initialisation?: Promise<void>;

  constructor(
    private readonly brazeService: BrazeService,
    @Inject(PUSH_NOTIFICATIONS) private readonly pushNotifications: PushNotificationsPlugin
  ) {}

  init(): Promise<void> {
    this.initialisation ??= this.initPushNotifications();
    return this.initialisation;
  }

  private async initPushNotifications(): Promise<void> {
    await Promise.all([
      this.pushNotifications.addListener('registration', (token) =>
        console.log('~ PushNotificationService ~ token:', token)
      ),
      this.pushNotifications.addListener('pushNotificationReceived', (notification) => {
        const extra = notification.data?.['extra'];

        if (typeof extra !== 'string') {
          return;
        }

        const parsedExtra = JSONParse(extra);

        if (isInboxExtra(parsedExtra)) {
          this.brazeService.fetchInboxContentCards();
        }
      }),
      this.pushNotifications.addListener('registrationError', (error) =>
        console.error('Push notification registration failed:', error)
      )
    ]);

    let permissionStatus = await this.pushNotifications.checkPermissions();

    if (permissionStatus.receive === 'prompt') {
      permissionStatus = await this.pushNotifications.requestPermissions();
    }

    if (permissionStatus.receive === 'granted') {
      await this.pushNotifications.register();
    }
  }
}

function isInboxExtra(value: unknown): value is BrazeParsedExtra {
  return typeof value === 'object' && value !== null && 'type' in value && value.type === 'inbox';
}
