import { Component, OnDestroy, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Storage } from '@ionic/storage-angular';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {

  qrString = 'Esto es un mensaje oculto';
  barCodeString = '12345566765';
  scannedResult: any;
  content_visibility = '';

  constructor(private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
  }

  async checkPermission() {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        return true;
      }
      return false;
    } catch(e) {
      console.log(e);
      return false;
    }
  }

  async startScan() {
    try {
      const permission = await this.checkPermission();
      if (!permission) {
        return;
      }
      await BarcodeScanner.hideBackground();
      
      document.querySelector('body')?.classList.add('scanner-active');
      this.content_visibility = 'hidden';
      const result = await BarcodeScanner.startScan();
      
      BarcodeScanner.showBackground();
      document.querySelector('body')?.classList.remove('scanner-active');
      this.content_visibility = '';

      if (result?.hasContent) {
        this.scannedResult = result.content;
        const date = new Date();
        const location = await Geolocation.getCurrentPosition();
  
        // Obtener la matriz de escaneos del Local Storage o inicializarla si no existe
        let scanHistory = await this.storage.get('scanHistory') || [];
  
        // Agregar el nuevo escaneo a la matriz
        const scanInfo = {
          data: result.content,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        scanHistory.push(scanInfo);
  
        // Guardar la matriz actualizada en el Local Storage
        await this.storage.set('scanHistory', scanHistory);
        
        // Actualizar la lista de escaneos en Tab2
        this.updateScanResults();
      }
    } catch(e) {
      console.log(e);
      this.stopScan();
    }
  }

  async updateScanResults() {
    // Obtener la matriz de escaneos actualizada del Local Storage
    let scanHistory = await this.storage.get('scanHistory');
    console.log(scanHistory); // Solo para verificar en la consola
  
  }

  stopScan() {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('scanner-active');
    this.content_visibility = '';
  }

  ngOnDestroy(): void {
    this.stopScan();
  }
}
