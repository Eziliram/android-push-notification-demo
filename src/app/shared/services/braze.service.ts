import { Injectable, signal } from "@angular/core";
import { BrazeContentCard } from "@models/braze/braze-content-card";
import { BrazeAltPushContentCard } from "@models/braze/braze-push-content-card";
import { convertToBrazeContentCard } from "@utils/braze/convert-content-card";
import braze from "braze-cordova-sdk";

@Injectable({
    providedIn: "root"
})
export class BrazeService {
    readonly inboxContentCards = signal<BrazeContentCard[]>([]);

    init(): void {
        braze.changeUser("test-user-marilize");
    }

    logCustomEvent(event: string): void {
        braze.logCustomEvent(event);
        braze.requestImmediateDataFlush();
    }

    fetchInboxContentCards(): void {
        braze.requestContentCardsRefresh();
        braze.getContentCardsFromServer(
            (altCards: BrazeAltPushContentCard[]) => {
                const cards = altCards as unknown as BrazeContentCard[];

                const inboxContentCards = cards.filter(card => card.extras.type === "inbox");
                
                this.inboxContentCards.set(inboxContentCards);
            },
            (error: unknown) => {
                console.error("Failed to fetch Braze content cards:", error);
            }
        )
    }
}