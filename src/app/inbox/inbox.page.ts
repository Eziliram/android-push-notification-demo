import { Component } from "@angular/core";
import { Router } from "@angular/router";
import {
  IonContent,
  IonHeader,
} from '@ionic/angular/standalone';
import { HeaderComponent } from "@components/header/header.component";
import { BrazeService } from "@services/braze.service";
import { MmCardComponent } from "@components/mm-card/mm-card.component";
import { DateTimeStringPipe } from "../shared/pipes/date-time-string.pipe";

@Component({
    selector: 'app-inbox',
    template: `
        <ion-header mode="ios" class="ion-no-border">
            <app-header title="Notifications" [showBackButton]="true" (backEvent)="navigateBack()" />
        </ion-header>

        <ion-content [fullscreen]="true" class="ion-padding">
            @if (brazeService.inboxContentCards().length > 0) {
                @for (
                    card of brazeService.inboxContentCards();
                    track card.id
                ) {
                    <app-mm-card
                        [title]="card.title ?? 'Mama Money'"
                        [showDismiss]="true"
                    >
                        @if (card.cardDescription) {
                            <p class="notification-description">
                                {{ card.cardDescription }}
                            </p>
                        }

                        @if (card.created) {
                            <p class="notification-date">
                                {{ card.created | dateTimeString }}
                            </p>
                        }
                    </app-mm-card>
                }
            } @else {
                <p>You have no notifications.</p>
            }
        </ion-content>
    `,
    styleUrl: "./inbox.page.scss",
    standalone: true,
    imports: [
        IonHeader,
        IonContent,
        HeaderComponent,
        MmCardComponent,
        DateTimeStringPipe
    ]
})
export class InboxPage {
    constructor(
        private readonly router: Router,
        protected readonly brazeService: BrazeService
    ) {}

    navigateBack(): void {
       this.router.navigate(['/']);
    }
}