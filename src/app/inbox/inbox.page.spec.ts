import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { BrazeContentCard } from '@models/braze/braze-content-card';
import { BrazeService } from '@services/braze.service';
import { InboxPage } from './inbox.page';

describe('InboxPage', () => {
  let page: InboxPage;
  let router: jasmine.SpyObj<Router>;
  let alertController: jasmine.SpyObj<AlertController>;
  let brazeService: jasmine.SpyObj<BrazeService>;

  const card: BrazeContentCard = {
    id: 'card-1',
    created: 1,
    expiresAt: 2,
    viewed: false,
    clicked: false,
    pinned: false,
    dismissed: false,
    dismissible: true,
    openURLInWebView: false,
    extras: { type: 'inbox' },
    domain: '',
    type: 'Classic'
  };

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate'], {
      config: [{ path: '' }, { path: 'complete' }, { path: 'inbox' }]
    });
    router.navigate.and.resolveTo(true);

    alertController = jasmine.createSpyObj<AlertController>('AlertController', ['create']);
    brazeService = jasmine.createSpyObj<BrazeService>(
      'BrazeService',
      ['dismissContentCard', 'logContentCardClick', 'logContentCardImpression'],
      { inboxContentCards: signal<BrazeContentCard[]>([]).asReadonly() }
    );

    page = new InboxPage(router, alertController, brazeService);
  });

  it('logs and navigates for a valid application deep link', () => {
    const linkedCard = { ...card, url: 'mamamoney://complete' };

    page.openContentCard(linkedCard);

    expect(brazeService.logContentCardClick).toHaveBeenCalledOnceWith(card.id);
    expect(router.navigate).toHaveBeenCalledOnceWith(['complete']);
  });

  it('does not log or navigate for an unknown route', () => {
    spyOn(console, 'warn');
    const linkedCard = { ...card, url: 'mamamoney://unknown' };

    page.openContentCard(linkedCard);

    expect(brazeService.logContentCardClick).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not log or navigate for a malformed URL', () => {
    spyOn(console, 'error');
    const linkedCard = { ...card, url: 'not a URL' };

    page.openContentCard(linkedCard);

    expect(brazeService.logContentCardClick).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('dismisses a card only when the destructive action is confirmed', async () => {
    const present = jasmine.createSpy('present').and.resolveTo();
    alertController.create.and.resolveTo({ present } as unknown as HTMLIonAlertElement);

    await page.confirmDismiss(card.id);
    const options = alertController.create.calls.mostRecent().args[0];

    if (!options) {
      fail('Expected alert options to be provided');
      return;
    }

    const confirmButton = Array.isArray(options.buttons) ? options.buttons[1] : undefined;

    expect(brazeService.dismissContentCard).not.toHaveBeenCalled();
    expect(present).toHaveBeenCalledTimes(1);

    if (typeof confirmButton === 'object') {
      confirmButton.handler?.({});
    }

    expect(brazeService.dismissContentCard).toHaveBeenCalledOnceWith(card.id);
  });
});
