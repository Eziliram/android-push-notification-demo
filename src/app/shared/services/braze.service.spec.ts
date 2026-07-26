import { BrazeContentCard } from '@models/braze/braze-content-card';
import braze from 'braze-cordova-sdk';
import { BrazeService } from './braze.service';

describe('BrazeService', () => {
  let service: BrazeService;

  const createCard = (overrides: Partial<BrazeContentCard> = {}): BrazeContentCard => ({
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
    type: 'Classic',
    ...overrides
  });

  beforeEach(() => {
    service = new BrazeService();
  });

  describe('init', () => {
    it('changes to the assessment user and loads content cards', () => {
      const changeUserSpy = spyOn(braze, 'changeUser');
      const loadCardsSpy = spyOn(service, 'loadInboxContentCards');

      service.init();

      expect(changeUserSpy).toHaveBeenCalledOnceWith('assessment-test-user');
      expect(loadCardsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logCustomEvent', () => {
    it('logs the event and immediately flushes Braze data', () => {
      const logEventSpy = spyOn(braze, 'logCustomEvent');
      const flushSpy = spyOn(braze, 'requestImmediateDataFlush');

      service.logCustomEvent('INBOX_MESSAGE_TEST');

      expect(logEventSpy).toHaveBeenCalledOnceWith('INBOX_MESSAGE_TEST');
      expect(flushSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadInboxContentCards', () => {
    it('updates cards from the cache and then fetches fresh cards', () => {
      const cachedCards = [createCard()];
      const updateSpy = spyOn(service, 'updateInboxContentCards');
      const fetchSpy = spyOn(service, 'fetchInboxContentCards');
      spyOn(braze, 'getContentCardsFromCache').and.callFake((successCallback) => {
        successCallback(cachedCards);
      });

      service.loadInboxContentCards();

      expect(updateSpy).toHaveBeenCalledOnceWith(cachedCards);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('fetches fresh cards when reading the cache fails', () => {
      const fetchSpy = spyOn(service, 'fetchInboxContentCards');
      spyOn(braze, 'getContentCardsFromCache').and.callFake((_successCallback, errorCallback) => {
        errorCallback(new Error('cache unavailable'));
      });

      service.loadInboxContentCards();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateInboxContentCards', () => {
    it('keeps inbox cards', () => {
      const inboxCard = createCard();

      service.updateInboxContentCards([inboxCard]);

      expect(service.inboxContentCards()).toEqual([inboxCard]);
    });

    it('excludes non-inbox cards', () => {
      const nonInboxCard = createCard({
        extras: { type: 'other' }
      });

      service.updateInboxContentCards([nonInboxCard]);

      expect(service.inboxContentCards()).toEqual([]);
    });

    it('excludes dismissed cards', () => {
      const dismissedCard = createCard({ dismissed: true });

      service.updateInboxContentCards([dismissedCard]);

      expect(service.inboxContentCards()).toEqual([]);
    });
  });

  describe('fetchInboxContentCards', () => {
    it('updates local state with cards returned by the server', () => {
      const serverCards = [createCard()];
      const updateSpy = spyOn(service, 'updateInboxContentCards');
      spyOn(braze, 'getContentCardsFromServer').and.callFake((successCallback) => {
        successCallback(serverCards);
      });

      service.fetchInboxContentCards();

      expect(updateSpy).toHaveBeenCalledOnceWith(serverCards);
    });

    it('logs an error when the server request fails', () => {
      const error = new Error('server unavailable');
      const consoleErrorSpy = spyOn(console, 'error');
      spyOn(braze, 'getContentCardsFromServer').and.callFake((_successCallback, errorCallback) => {
        errorCallback(error);
      });

      service.fetchInboxContentCards();

      expect(consoleErrorSpy).toHaveBeenCalledOnceWith('Failed to fetch Braze content cards:', error);
    });
  });

  describe('dismissContentCard', () => {
    it('logs the dismissal and removes the card from local state', () => {
      const dismissedSpy = spyOn(braze, 'logContentCardDismissed');
      const dismissedCard = createCard({ id: 'dismissed-card' });
      const remainingCard = createCard({ id: 'remaining-card' });
      service.updateInboxContentCards([dismissedCard, remainingCard]);

      service.dismissContentCard(dismissedCard.id);

      expect(dismissedSpy).toHaveBeenCalledOnceWith(dismissedCard.id);
      expect(service.inboxContentCards()).toEqual([remainingCard]);
    });
  });

  describe('logContentCardImpression', () => {
    it('logs the impression and marks the card as viewed', () => {
      const impressionSpy = spyOn(braze, 'logContentCardImpression');
      const card = createCard();
      service.updateInboxContentCards([card]);

      service.logContentCardImpression(card.id);

      expect(impressionSpy).toHaveBeenCalledOnceWith(card.id);
      expect(service.inboxContentCards()[0].viewed).toBeTrue();
    });
  });

  describe('logContentCardClick', () => {
    it('logs the click and marks the card as clicked', () => {
      const clickSpy = spyOn(braze, 'logContentCardClicked');
      const card = createCard();
      service.updateInboxContentCards([card]);

      service.logContentCardClick(card.id);

      expect(clickSpy).toHaveBeenCalledOnceWith(card.id);
      expect(service.inboxContentCards()[0].clicked).toBeTrue();
    });
  });
});
