import { AfterViewInit, Component, computed, effect, input } from '@angular/core';
import { IonButton, IonIcon, IonAccordion } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';
import anime, { AnimeInstance } from 'animejs';
import { BrazeService } from '@services/braze.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inbox-button',
  template: `
    <div class="notification-button">
      @if (unreadMessages()) {
      <svg class="notification-button-unread" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
        <circle r="4.5" cx="5" cy="5" fill="red" />
      </svg>
      }
      <ion-button class="bell" [slot]="slot()" fill="clear" (click)="showInbox()">
        <ion-icon color="dark" slot="icon-only" name="notifications-outline"></ion-icon>
      </ion-button>
    </div>
  `,
  styles: [
    `
      ion-button {
        --padding-end: 0.5rem;
        --padding-start: 0.5rem;
        font-size: 1.75rem;
      }

      .notification-button {
        position: relative;
        svg {
          position: absolute;
          top: 30%;
          right: 25%;
          z-index: 99;
        }
      }
    `
  ],
  imports: [IonButton, IonIcon],
  standalone: true
})
export class InboxButtonComponent implements AfterViewInit {
  readonly slot = input<IonAccordion['toggleIconSlot']>();
  readonly unreadMessages = computed(() =>
    this.brazeService.inboxContentCards().some(card => !card.viewed)
  )

  private shakeAnimation?: AnimeInstance;
  private unreadMessageCount = 0;

  constructor(
    private readonly router: Router,
    private brazeService: BrazeService
  ) {
    addIcons({ notificationsOutline });

    effect(() => {
      const unreadMessageCount = this.brazeService
        .inboxContentCards()
        .filter(card => !card.viewed).length;

      if (unreadMessageCount > this.unreadMessageCount) {
        this.shakeAnimation?.restart();
      }

      this.unreadMessageCount = unreadMessageCount;
    });
  }

  showInbox(): void {
    this.router.navigate(["/inbox"]);
  }

  ngAfterViewInit(): void {
    this.shakeAnimation = anime({
      targets: '.bell',
      translateX: [
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: 0, duration: 50 }
      ],
      easing: 'easeInOutSine',
      duration: 2000,
      autoplay: false
    });
  }
}
