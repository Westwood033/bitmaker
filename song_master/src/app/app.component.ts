import { Component, createNgModuleRef, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Circle } from './models/circle.model';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  allCircle : Circle[] = []
  title = 'song-master';

  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  ton: number = 1; // Variable pour ajuster la tonalité (-1 à 1)
  

  private context!: CanvasRenderingContext2D;


  ngAfterViewInit() {
    // Obtenir le contexte 2D du canvas
    this.context = this.canvas.nativeElement.getContext('2d')!;
  }


  getCanvasCenter() 
  {
    const width = this.canvas.nativeElement.clientWidth;;
    const height = this.canvas.nativeElement.clientHeight;
    return {
      x: width / 2,
      y: height / 2
    };
  }
  
  createCircle(event: MouseEvent) {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left; // Position X du clic
    const y = event.clientY - rect.top;  // Position Y du clic
    const center = this.getCanvasCenter();
    const radius = Math.sqrt((center.x - x) ** 2 + (center.y - y) ** 2);


    const foundCircle = this.allCircle.find(circle => 
      circle.radius === radius || (circle.radius < radius + 3 && circle.radius > radius - 3) 
    );

    const constraint = this.allCircle.some(circle => 
      circle.radius > radius - 10 && circle.radius < radius + 10
    );

    if(!foundCircle && !constraint)
    {
    const newCircle = new Circle(radius, 'white', this.context, center);
  
    this.allCircle.push(newCircle);
    }
    

    if(foundCircle){
      const dx = x - center.x
      const dy = y - center.y

      const distance = Math.sqrt(dx * dx + dy * dy)

      const closex = center.x + (dx / distance) * foundCircle.radius 
      const closey = center.y + (dy / distance) * foundCircle.radius 

      foundCircle.drawCheck(closex, closey, false);
      }
  }

  animate(){
    
    this.context.clearRect(0, 0, this.context.canvas.width , this.context.canvas.height)
    this.allCircle.forEach(circle => {
      circle.animateRumble()
    });
    requestAnimationFrame(() => this.animate());
    
  }
  

  playNote(frequency: number, duration: number  ) {
    // Créer un contexte audio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Créer un oscillateur
    const oscillator = audioContext.createOscillator();

    // Définir la fréquence (qui correspond à la hauteur de la note)
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // Connecter l'oscillateur au contexte audio et démarrer le son
    oscillator.connect(audioContext.destination);
    oscillator.start();

    // Arrêter le son après 1 seconde
    oscillator.stop(audioContext.currentTime + duration);
  }

  pump(rayon: number){
    this.playNote(1/rayon, 0.1) // à améliorer 
  }


}

