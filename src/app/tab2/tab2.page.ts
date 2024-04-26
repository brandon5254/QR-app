import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  scanResults: any[] = [];

  constructor(private storage: Storage) {}

  async ionViewWillEnter() {
    await this.storage.create();
    this.getStorageData();
  }

  async getStorageData() {
    let scanHistory = await this.storage.get('scanHistory');
    console.log(scanHistory); 
    if (scanHistory) {
      this.scanResults = scanHistory.reverse(); 
    } else {
      this.scanResults = []; 
    }
  }

  async borrarDatos() {
    await this.storage.remove('scanHistory');
    this.scanResults = []; // Limpiar la lista después de borrar los datos del Local Storage
  }
}
