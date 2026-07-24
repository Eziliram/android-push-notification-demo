import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { IonHeader, IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "@components/header/header.component";

@Component({
    selector: 'app-inbox',
    template: `
        <ion-header mode="ios" class="ion-no-border">
            <app-header title="Notifications" [showBackButton]="true" (backEvent)="navigateBack()" />
        </ion-header>

        <ion-content [fullscreen]="true" class="ion-padding">
        </ion-content>
    `,
    styles: [],
    standalone: true,
    imports: [IonHeader, IonContent, HeaderComponent]
})
export class InboxPage {
    constructor(private readonly router: Router) {}

    navigateBack(): void {
       this.router.navigate(['/']);
    }
}