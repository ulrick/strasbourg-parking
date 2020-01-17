import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network';
import { SpinnerDialog } from "@ionic-native/spinner-dialog";

/*
  Generated class for the NetworkManagerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NetworkManagerProvider {

  private networkState = this.network.type;

  constructor(public http: HttpClient, private network: Network, private spinnerDialog : SpinnerDialog) {
    console.log('Hello NetworkManagerProvider Provider');
  }

  public onConnect(): any{
    return this.network.onConnect();
  }

  public onDisconnect() {
    return this.network.onDisconnect();
  }


  public onChange(){
    this.network.onchange().subscribe(data => {
      this.spinnerDialog.show("Connexion!", "Tentative de connexion "+this.checkConnection()), error => console.log(error);
      setTimeout(() => {
        this.spinnerDialog.hide();
      }, 3000);
    });
  }

  public isConnected() : boolean{
    return (this.networkState != ("none" || "unknown" || "cellular") );
  }

  public checkConnection() : string {

    let connection = "";
    switch (this.networkState) {
      case "unknown":
        connection = "AUTRE";
        break;
      case "ethernet":
        connection = "ETHERNET";
        break;
      case "wifi":
        connection = "WIFI";
        break;
      case "2g":
        connection = "2G";
        break;
      case "3g":
        connection = "3G";
        break;
      case "4g":
        connection = "4G";
        break;
      case "cellular":
        connection = "CELLULAIRE";
        break;
      case "none":
        connection = "PAS DE SIGNAL RESEAUX";
        break;
    
      default:
        connection = "AUTRE";
        break;
    }

    return connection;
  }

}
