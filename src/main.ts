import 'zone.js/dist/zone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="container" [style.width.px]="anchoContenedor">
    <div *ngFor="let row of images" class="row">
      <img
        *ngFor="let image of row"
        [src]="image.download_url"
        [style.height.px]="image.height"
      />
    </div>
  </div>
  `,
})
export class App {
  name = 'Angular';

  public images = [];
  public anchoContenedor = 800;
  public altoContenedor = 70;

  async ngOnInit() {
    const imagesFromInternet = await this.getImages();
    this.images = this.justifiedLayout(
      imagesFromInternet,
      this.anchoContenedor,
      this.altoContenedor
    );
    console.log(this.images);
  }

  async getImages() {
    const response = await fetch(
      'https://picsum.photos/v2/list?page=2&limit=100'
    );
    const images = await response.json();
    return images;
  }

  private costo(aspectos, inicio, fin, widthContenedor, alturaMaxima) {
    const sumaAspectos = aspectos
      .slice(inicio, fin + 1)
      .reduce((a, b) => a + b);
    const alturaFila = widthContenedor / sumaAspectos;
    const costo = (alturaMaxima - alturaFila) ** 2;
    return costo;
  }

  private justifiedLayout(imagenes, widthContenedor, alturaMaxima) {
    const n = imagenes.length;
    const aspectos = imagenes.map((imagen) => imagen.width / imagen.height);
    const costoMinimo = new Array(n + 1).fill(0);
    const ultimaImagenFila = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let costo = Infinity;
      let j = i;

      while (j < n) {
        const nuevoCosto =
          costoMinimo[i] +
          this.costo(aspectos, i, j, widthContenedor, alturaMaxima);

        if (nuevoCosto < costo) {
          costo = nuevoCosto;
          ultimaImagenFila[i] = j;
        }

        j++;
      }
      costoMinimo[i + 1] = costo;
    }

    const filas = [];
    let inicio = 0;

    while (inicio < n) {
      const fin = ultimaImagenFila[inicio];
      filas.push(imagenes.slice(inicio, fin + 1));
      inicio = fin + 1;
    }

    // Ajustar el tamaño de las imágenes en cada fila
    for (const fila of filas) {
      const sumaAspectos = fila
        .map((imagen) => imagen.width / imagen.height)
        .reduce((a, b) => a + b);
      const alturaFila = widthContenedor / sumaAspectos;

      for (const imagen of fila) {
        imagen.height = alturaFila;
        imagen.width = imagen.height * (imagen.width / imagen.height);
      }
    }

    return filas;
  }
}

bootstrapApplication(App);
