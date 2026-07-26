import { PluginListenerHandle } from '@capacitor/core';
import { PushNotificationSchema, PushNotificationsPlugin } from '@capacitor/push-notifications';
import { BrazeService } from './braze.service';
import { PushNotificationService } from './push-notification.service';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let brazeService: jasmine.SpyObj<BrazeService>;
  let pushNotifications: jasmine.SpyObj<PushNotificationsPlugin>;

  const listenerHandle: PluginListenerHandle = {
    remove: async () => undefined
  };

  beforeEach(() => {
    brazeService = jasmine.createSpyObj<BrazeService>('BrazeService', ['fetchInboxContentCards']);
    pushNotifications = jasmine.createSpyObj<PushNotificationsPlugin>('PushNotifications', [
      'addListener',
      'checkPermissions',
      'requestPermissions',
      'register'
    ]);
    pushNotifications.addListener.and.resolveTo(listenerHandle);

    service = new PushNotificationService(brazeService, pushNotifications);
  });

  it('registers when notification permission is granted', async () => {
    pushNotifications.checkPermissions.and.resolveTo({ receive: 'granted' });
    pushNotifications.register.and.resolveTo();

    await service.init();

    expect(pushNotifications.requestPermissions).not.toHaveBeenCalled();
    expect(pushNotifications.register).toHaveBeenCalledTimes(1);
  });

  it('requests permission before registering when the status is prompt', async () => {
    pushNotifications.checkPermissions.and.resolveTo({ receive: 'prompt' });
    pushNotifications.requestPermissions.and.resolveTo({ receive: 'granted' });
    pushNotifications.register.and.resolveTo();

    await service.init();

    expect(pushNotifications.requestPermissions).toHaveBeenCalledTimes(1);
    expect(pushNotifications.register).toHaveBeenCalledTimes(1);
  });

  it('does not register when notification permission is denied', async () => {
    pushNotifications.checkPermissions.and.resolveTo({ receive: 'denied' });

    await service.init();

    expect(pushNotifications.register).not.toHaveBeenCalled();
  });

  it('fetches inbox cards for a valid inbox notification', async () => {
    pushNotifications.checkPermissions.and.resolveTo({ receive: 'denied' });
    await service.init();

    getNotificationListener()(createNotification('{"type":"inbox"}'));

    expect(brazeService.fetchInboxContentCards).toHaveBeenCalledTimes(1);
  });

  it('ignores malformed and unrelated notification extras', async () => {
    pushNotifications.checkPermissions.and.resolveTo({ receive: 'denied' });
    spyOn(console, 'warn');
    await service.init();

    const notificationListener = getNotificationListener();
    notificationListener(createNotification('not-json'));
    notificationListener(createNotification('{"type":"other"}'));

    expect(brazeService.fetchInboxContentCards).not.toHaveBeenCalled();
  });

  it('initializes native listeners and registration only once', async () => {
    pushNotifications.checkPermissions.and.resolveTo({ receive: 'granted' });
    pushNotifications.register.and.resolveTo();

    await Promise.all([service.init(), service.init()]);

    expect(pushNotifications.addListener).toHaveBeenCalledTimes(3);
    expect(pushNotifications.register).toHaveBeenCalledTimes(1);
  });

  function getNotificationListener(): (notification: PushNotificationSchema) => void {
    const listenerCalls = pushNotifications.addListener.calls.allArgs() as unknown as Array<
      [string, (...arguments_: unknown[]) => void]
    >;
    const listenerCall = listenerCalls.find((listenerArguments) => listenerArguments[0] === 'pushNotificationReceived');

    expect(listenerCall).toBeDefined();

    return listenerCall?.[1] as unknown as (notification: PushNotificationSchema) => void;
  }

  function createNotification(extra: string): PushNotificationSchema {
    return {
      id: 'notification-1',
      title: 'Inbox',
      body: 'You have a new message',
      data: { extra }
    };
  }
});
