declare module 'braze-cordova-sdk' {
  type BrazeContentCard = import('../app/shared/models/braze/braze-content-card').BrazeContentCard;

  interface BrazePlugin {
    changeUser(userId: string): void;
    logCustomEvent(eventName: string): void;
    requestImmediateDataFlush(): void;
    getContentCardsFromCache(
      successCallback: (cards: BrazeContentCard[]) => void,
      errorCallback: (error: unknown) => void
    ): void;
    getContentCardsFromServer(
      successCallback: (cards: BrazeContentCard[]) => void,
      errorCallback: (error: unknown) => void
    ): void;
    logContentCardDismissed(cardId: string): void;
    logContentCardImpression(cardId: string): void;
    logContentCardClicked(cardId: string): void;
  }

  const braze: BrazePlugin;
  export default braze;
}
