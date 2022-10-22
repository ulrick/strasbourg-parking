import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'info-page',
  templateUrl: 'info-page.component.html',
  styleUrls: ['info-page.component.scss']
})
export class InfoPageComponent {

  constructor(private _modalController: ModalController) {}

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this._modalController.dismiss({
      'dismissed': true
    });
  }
}