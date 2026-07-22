import { Injectable } from "@angular/core";
import braze from "braze-cordova-sdk";

@Injectable({
    providedIn: "root"
})
export class BrazeService {
    init(): void {
        braze.changeUser("test-user-marilize");
    }

    logCustomEvent(event: string): void {
        braze.logCustomEvent(event);
        braze.requestImmediateDataFlush();
    }
}