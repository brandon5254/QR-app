import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  map: Leaflet.Map = {} as Leaflet.Map;
  markers: any[] = [];
  filterOptions: string[] = [];
  selectedFilter: string = 'Todos'; // Valor por defecto para mostrar todos los marcadores
  markerIcon: any; // Variable para almacenar el icono personalizado

  constructor(private storage: Storage) {}

  async ionViewDidEnter() {
    await this.storage.create();
    this.getStorageData();

    this.map = new Leaflet.Map('mapId3').setView([3.4372, -76.5225], 16);

    Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: 'edupala.com'
    }).addTo(this.map);

    // Crear el icono personalizado
    this.markerIcon = Leaflet.icon({
      iconUrl: 'https://w7.pngwing.com/pngs/995/841/png-transparent-pin-location-map-icon.png', // Ruta del icono personalizado
      iconSize: [30, 30], // Tamaño del icono
      iconAnchor: [20, 40], // Punto de anclaje del icono
      popupAnchor: [0, -40] // Punto de anclaje del popup
    });
  }

  async getStorageData() {
    let scanHistory: { data: string; latitude?: number; longitude?: number, date?: string, time?: string }[] = (await this.storage.get('scanHistory')) || [];
    console.log(scanHistory); 
    if (scanHistory.length > 0) {
      const uniqueOptions: Map<string, { latitude: number, longitude: number }[]> = new Map();
  
      // Agrupar las ubicaciones por código QR en un Map
      scanHistory.forEach((scan: any) => {
        if (!uniqueOptions.has(scan.data)) {
          uniqueOptions.set(scan.data, []);
        }
        uniqueOptions.get(scan.data)?.push({ latitude: scan.latitude || 0, longitude: scan.longitude || 0 });
      });

      // Construir el array de opciones únicas para el select sin tener en cuenta los duplicados.
      this.filterOptions = Array.from(uniqueOptions.keys());

      // Crear los marcadores a partir de las ubicaciones agrupadas
      this.markers = [];
      uniqueOptions.forEach((locations, code) => {
        this.markers.push(...locations.map(location => ({
          lat: location.latitude,
          long: location.longitude,
          city: code,
          date: scanHistory.find(scan => scan.data === code)?.date,
          time: scanHistory.find(scan => scan.data === code)?.time
          
        })));
      });
  
      this.filterMarkers(); // Aplicar filtro inicial
    } else {
      this.markers = [];
      this.filterOptions = [];
    }
  }
  

  leafletMap() {
    for (const marker of this.markers) {
      // Crear el contenido del popup con la ciudad, fecha y hora
      const popupContent = `
        <b>Link: ${marker.city}</b><br>
        Fecha: ${marker.date}<br>
        Hora: ${marker.time}
      `;
  
      Leaflet.marker([marker.lat, marker.long], { icon: this.markerIcon }).addTo(this.map)
        .bindPopup(popupContent)
        .openPopup();
    }
  }
  

  filterMarkers(event?: any) {
    if (event) {
      this.selectedFilter = event.target.value;
    }
    // Limpiar el mapa antes de agregar los marcadores filtrados
    this.map.eachLayer(layer => {
      if (layer instanceof Leaflet.Marker) {
        this.map.removeLayer(layer);
      }
    });
    // Filtrar marcadores según la opción seleccionada
    let filteredMarkers = [];
    if (this.selectedFilter === 'Todos') {
      filteredMarkers = this.markers;
    } else {
      filteredMarkers = this.markers.filter(marker => marker.city === this.selectedFilter);
    }
    // Agregar marcadores filtrados al mapa
    for (const marker of filteredMarkers) {
      const popupContent = `
        <b>Link: ${marker.city}</b><br>
        Fecha: ${marker.date}<br>
        Hora: ${marker.time}
      `;
      Leaflet.marker([marker.lat, marker.long], { icon: this.markerIcon }).addTo(this.map) // Asignar el icono personalizado al marcador
        .bindPopup(popupContent)
        .openPopup();
    }
  }
}
