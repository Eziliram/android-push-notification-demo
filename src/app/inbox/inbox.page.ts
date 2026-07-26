import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonContent, IonHeader } from '@ionic/angular/standalone';
import { HeaderComponent } from '@components/header/header.component';
import { BrazeService } from '@services/braze.service';
import { MmCardComponent } from '@components/mm-card/mm-card.component';
import { DateTimeStringPipe } from '../shared/pipes/date-time-string.pipe';
import { BrazeContentCard } from '@models/braze/braze-content-card';

@Component({
  selector: 'app-inbox',
  template: `
    <ion-header mode="ios" class="ion-no-border">
      <app-header title="Notifications" [showBackButton]="true" (backEvent)="navigateBack()" />
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      @if (brazeService.inboxContentCards().length > 0) {
        @for (card of brazeService.inboxContentCards(); track card.id) {
          <app-mm-card
            [title]="card.title ?? 'Mama Money'"
            [showDismiss]="card.dismissible"
            [clickable]="!!card.url"
            (cardClick)="openContentCard(card)"
            (dismiss)="confirmDismiss(card.id)"
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
  styleUrl: './inbox.page.scss',
  standalone: true,
  imports: [IonHeader, IonContent, HeaderComponent, MmCardComponent, DateTimeStringPipe]
})
export class InboxPage {
  constructor(
    private readonly router: Router,
    private readonly alertController: AlertController,
    protected readonly brazeService: BrazeService
  ) {}

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  ionViewDidEnter(): void {
    this.brazeService.inboxContentCards().forEach((card) => {
      this.brazeService.logContentCardImpression(card.id);
    });
  }

  openContentCard(card: BrazeContentCard): void {
    if (!card.url) {
      return;
    }

    try {
      const deepLink = new URL(card.url);
      const route = deepLink.hostname;
      const isKnownRoute = this.router.config.some((config) => config.path === route);

      if (!route || !isKnownRoute) {
        console.warn(`Ignoring unknown content card route: ${card.url}`);
        return;
      }

      this.brazeService.logContentCardClick(card.id);
      void this.router.navigate([route]);
    } catch (error) {
      console.error(`Invalid content card URL: ${card.url}`, error);
    }
  }

  async confirmDismiss(cardId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Message',
      message: 'Are you sure you would like to delete this message?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          role: 'destructive',
          handler: () => {
            this.brazeService.dismissContentCard(cardId);
          }
        }
      ]
    });

    await alert.present();
  }
}
