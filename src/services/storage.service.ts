import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) { }

  async saveScanResult(scanInfo: any) {
    let scans = await this.storage.get('scans') || [];
    scans.push(scanInfo);
    await this.storage.set('scans', scans);
  }

  async getScanResults() {
    return await this.storage.get('scans') || [];
  }
}
