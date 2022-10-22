import { Component, Input, OnInit } from "@angular/core";
import { IonRouterOutlet, ModalController } from "@ionic/angular";
import { InfoPageComponent } from "../modals/info-page.component";

@Component({
    selector:'parking-toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
    @Input() headerTitle: string;
    @Input() letterStartTitle: string;

    constructor(protected _modalController: ModalController, private routerOutlet: IonRouterOutlet){}

    ngOnInit(): void {
        
    }

    async presentModal() {
        const modal = await this._modalController.create({
            component: InfoPageComponent,
            cssClass: 'my-custom-class',
            showBackdrop: true,
            presentingElement: await this._modalController.getTop()
        });
        return await modal.present();
    }
}