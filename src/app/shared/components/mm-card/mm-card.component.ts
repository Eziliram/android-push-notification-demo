import { Component, input, output } from '@angular/core';
import { ImageLoaderComponent } from '@components/image-loader/image-loader.component';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-mm-card',
  template: ` <ion-card [button]="clickable()" (click)="handleClick()">
    <ion-card-header>
      @if (title(); as title) {
      <ion-card-title>
        <div class="flex-row align-items-center">
          @if(showIcon()) {
          <div class="m-r-1">
            <app-image-loader
              src="assets/icon/mm-cc-logo.png"
              imageClass="iconize"
              maxWidth="50px"
              skeletonDiameter="50px"
              skeletonBorderRadius="50px"
            />
          </div>
          } {{ title }}

          @if (showDismiss()) {
          <ion-button aria-label="Dismiss notification" color="danger" fill="clear" (click)="handleDismiss($event)">
            <ion-icon slot="icon-only" name="close-circle-outline" size="large" />
          </ion-button>
          }
        </div>
      </ion-card-title>
      }
    </ion-card-header>

    <ion-card-content>
      <ng-content></ng-content>
    </ion-card-content>
  </ion-card>`,
  styles: [],
  standalone: true,
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, ImageLoaderComponent, IonIcon]
})
export class MmCardComponent {
  title = input('Mama Money');
  showIcon = input(true);
  showDismiss = input(false);
  clickable = input(false);
  cardClick = output<void>();
  dismiss = output<void>();

  constructor() {
    addIcons({ closeCircleOutline });
  }

  handleDismiss(event: Event): void {
    event.stopPropagation();
    this.dismiss.emit();
  }

  handleClick(): void {
    if (this.clickable()) {
      this.cardClick.emit();
    }
  }
}
