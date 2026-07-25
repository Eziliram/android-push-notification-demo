import { Component, input, output } from '@angular/core';
import { ImageLoaderComponent } from '@components/image-loader/image-loader.component';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-mm-card',
  template: ` <ion-card>
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
             <ion-icon
              color="danger"
              slot="icon-only"
              name="close-circle-outline"
              size="large"
              (click)="handleDismiss()"
            />
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
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    ImageLoaderComponent,
    IonIcon
  ]
})
export class MmCardComponent {
  title = input('Mama Money');
  showIcon = input(true);
  showDismiss = input(false);
  dismiss = output<void>();

  constructor() {
    addIcons({ closeCircleOutline });
  }

  handleDismiss(): void {
    this.dismiss.emit();
  }
}
