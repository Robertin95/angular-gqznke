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
  public anchoContenedor = 1000;
  public altoContenedor = 200;

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

  private cost(aspects, start, end, widthContainer, maxHeight) {
    const sumAspects = aspects.slice(start, end + 1).reduce((a, b) => a + b);
    const alturarow = widthContainer / sumAspects;
    const cost = (maxHeight - alturarow) ** 2;
    return cost;
  }

  private justifiedLayout(images, widthContainer, maxHeight) {
    const n = images.length;
    const aspects = images.map((image) => image.width / image.height);
    const minCost = new Array(n + 1).fill(0);
    const lastRowImage = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let cost = Infinity;
      let j = i;

      while (j < n) {
        const newCost =
          minCost[i] + this.cost(aspects, i, j, widthContainer, maxHeight);

        if (newCost < cost) {
          cost = newCost;
          lastRowImage[i] = j;
        }

        j++;
      }
      minCost[i + 1] = cost;
    }

    const rows = [];
    let start = 0;

    while (start < n) {
      const end = lastRowImage[start];
      rows.push(images.slice(start, end + 1));
      start = end + 1;
    }

    // Ajustar el tamaño de las imágenes en cada row
    for (const row of rows) {
      const sumAspects = row
        .map((image) => image.width / image.height)
        .reduce((a, b) => a + b);
      const alturarow = widthContainer / sumAspects;

      for (const image of row) {
        image.height = alturarow;
        image.width = image.height * (image.width / image.height);
      }
    }

    return rows;
  }
}

bootstrapApplication(App);
