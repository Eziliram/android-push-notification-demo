import { Injectable, signal } from "@angular/core";
import { BrazeContentCard } from "@models/braze/braze-content-card";
import braze from "braze-cordova-sdk";

@Injectable({
    providedIn: "root"
})
export class BrazeService {
    readonly inboxContentCards = signal<BrazeContentCard[]>([]);

    init(): void {
        braze.changeUser("test-user-marilize");
        this.loadInboxContentCards();
    }

    logCustomEvent(event: string): void {
        braze.logCustomEvent(event);
        braze.requestImmediateDataFlush();
    }

    loadInboxContentCards(): void {
        braze.getContentCardsFromCache(
            (cards: BrazeContentCard[]) => {
                this.updateInboxContentCards(cards);
                this.fetchInboxContentCards();
            },
            () => {
                this.fetchInboxContentCards();
            }
        )
    }

    updateInboxContentCards(cards: BrazeContentCard[]): void {
        const inboxContentCards = cards.filter(
            card => card.extras?.type === "inbox" && !card.dismissed
        )

        this.inboxContentCards.set(inboxContentCards);
    }

    fetchInboxContentCards(): void {
        braze.getContentCardsFromServer(
            (cards: BrazeContentCard[]) => {
                this.updateInboxContentCards(cards);
            },
            (error: unknown) => {
                console.error("Failed to fetch Braze content cards:", error);
            }
        )
    }

    dismissContentCard(cardId: string): void {
        braze.logContentCardDismissed(cardId);
        this.inboxContentCards.update(
            cards => cards.filter(card => card.id !== cardId)
        );
    }
}
