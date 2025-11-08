import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Circle } from './models/circle.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  allCircle: Circle[] = [];
  title = 'song-master';
  edit = true;
  private isAnimating = false;
  public speed = 0.01;
  public showPopup = false;
  selectedCircle: Circle | null = null;

  colors = [
    { name: 'Jaune', value: 'yellow' },
    { name: 'Bleu clair', value: 'lightblue' },
    { name: 'Orange', value: 'orange' },
    { name: 'Blanc', value: 'white' },
    { name: 'Vert', value: 'green' },
    { name: 'Violet', value: 'purple' },
    { name: 'Rose', value: 'pink' },
    { name: 'Beige', value: 'beige' },
  ];

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;

  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d')!;
  }

  getCanvasCenter() {
    const width = this.canvas.nativeElement.clientWidth;
    const height = this.canvas.nativeElement.clientHeight;
    return { x: width / 2, y: height / 2 };
  }

  openColorPopup(circle: Circle) {
  if(!this.edit) return;
  this.selectedCircle = circle;
  this.showPopup = true;
}

  // Méthode pour changer la couleur du cercle sélectionné
  changeCircleColor(color: string) {
    if (this.selectedCircle) {
      this.selectedCircle.color = color;
      this.showPopup = false;
      this.base();
      this.selectedCircle = null;
    }
  }

  // -------------------------------------------------------
  // 🟢 Création ou interaction avec un cercle
  // -------------------------------------------------------
  createCircle(event: MouseEvent) {
    if (!this.edit) return; // ❌ Blocage si on n'est pas en mode édition
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const center = this.getCanvasCenter();
    const radius = Math.sqrt((center.x - x) ** 2 + (center.y - y) ** 2);

    const foundCircle = this.allCircle.find(
      circle =>
        circle.radius === radius ||
        (circle.radius < radius + 3 && circle.radius > radius - 3)
    );

    const constraint = this.allCircle.some(
      circle => circle.radius > radius - 10 && circle.radius < radius + 10
    );

    if (!foundCircle && !constraint) {
      const newCircle = new Circle(radius, 'orange', this.context, center, this.speed);
      newCircle.onUpdate = () => this.base();
      this.allCircle.push(newCircle);
      this.allCircle.sort((a, b) => a.radius - b.radius);
    }

    if (foundCircle) {
      const dx = x - center.x;
      const dy = y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const closex = center.x + (dx / distance) * foundCircle.radius;
      const closey = center.y + (dy / distance) * foundCircle.radius;
      foundCircle.drawCheck(closex, closey, false, true);
      this.base();
    }
  }

  hoverCheck(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    this.allCircle.forEach(circle => {
      circle.changeColorCheck(mouseX, mouseY);
    });
  }

  // -------------------------------------------------------
  // 🧩 Modes d’édition et d’animation
  // -------------------------------------------------------
  start_animation() {
    this.allCircle.forEach(c => c.resetRumble());
    this.edit = false;
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  start_edit() {
    this.edit = true;
    this.isAnimating = false;
    this.base();
  }

  // -------------------------------------------------------
  // 🔴 Gestion sélection / suppression
  // -------------------------------------------------------
  toggleSelect(circle: Circle) {
    if (!this.edit) return; // ❌ Interdiction hors mode édition
    circle.selected = !circle.selected;
    this.base();
  }

  deleteSelected() {
    if (!this.edit) return; // ❌ Interdiction hors mode édition
    this.allCircle = this.allCircle.filter(c => !c.selected);
    this.base();
  }

  change_speed(speed: string){
    if(Number(speed) > 100) return;
    if (!this.edit) return;
    this.allCircle.forEach(circle => {
      this.speed = Number(speed)/1000;
      circle.speed = this.speed;
    })
  }

  // -------------------------------------------------------
  // 🎨 Redessin du canvas
  // -------------------------------------------------------
  base() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.allCircle.forEach(circle => {
      circle.drawSelf();
      circle.drawRumble(circle.color, circle.center.x + circle.radius, circle.center.y);
      circle.checks.forEach(check => {
        circle.drawCheck(check.x, check.y, true);
      });
    });
  }

  animate() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.allCircle.forEach(circle => circle.animateRumble(this.edit));
    if (!this.isAnimating) return;
    requestAnimationFrame(() => this.animate());
  }

  get anySelected() {
    return this.allCircle.some(c => c.selected);
  }
}
