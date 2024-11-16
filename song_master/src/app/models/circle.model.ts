import { delay } from "rxjs";


export class Circle {
    public checks: { x: number; y: number }[] = [];
    public checksCollised: { x: number; y: number; frame: number}[] = [];
    public rumble: { x: number; y: number } = {x: 0, y: 0}
    public angle: number = 0
    public frame: number = 10
    private audioElement: HTMLAudioElement;

    constructor(public radius: number, public color: string, public context: CanvasRenderingContext2D, public center: {x: number, y: number}) 
    {
        this.drawSelf();
        this.drawRumble('white', (this.center.x + this.radius), this.center.y);

      this.audioElement = new Audio();
      this.audioElement.src = './audio/note.mp3';
      this.audioElement.preload = 'auto'; // Précharger le fichier pour réduire le délai
      this.audioElement.addEventListener('canplaythrough', () => {
      console.log('Audio is ready to play');
      });
        
    }
      drawSelf() {
        this.context.beginPath(); // Commencer un nouveau chemin
        this.context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2); // Dessiner un cercle
        this.context.strokeStyle = this.color; // Couleur du contour
        this.context.lineWidth = 2; // Épaisseur du contour
        this.context.stroke(); // Dessiner le contour du cercle
        this.context.closePath(); // Terminer le chemin
      }

      drawRumble(color : string, x : number, y: number){
        this.context.beginPath();
        this.context.arc(x, y, 5.5, 0, Math.PI * 2);
        this.context.fillStyle = color; 
        this.context.fill();
        this.context.closePath();
        this.rumble = {x: x, y: y}
      } 
 
      drawCheck(x : number, y: number, loop: boolean){

        const coordCheck = {x, y};
        let foundCheck = false; 
       
        if(!loop){ 
          foundCheck = this.checks.some(coord => 
            coord.x === x && coord.y === y ||
             (coord.x > x - 12 && coord.x <  x + 12) && (coord.y > y - 12 && coord.y <  y + 12) ||
             this.rumble.x === x && this.rumble.y === y ||
             (this.rumble.x > x - 12 && this.rumble.x <  x + 12) && (coord.y > y - 12 && coord.y <  y + 12)
            );
        }
         
        if(!foundCheck || loop){
        this.context.beginPath(); // Commencer un nouveau chemin
        this.context.arc(x, y, 6, 0, Math.PI * 2); // Dessiner un cercle
        this.context.strokeStyle = this.color; // Couleur du contour
        this.context.fillStyle = 'black'; 
        this.context.fill();
        this.context.lineWidth = 2; // Épaisseur du contour
        this.context.stroke(); // Dessiner le contour du cercle
        this.context.closePath(); // Terminer le chemin
        if(!foundCheck && !loop){
        console.log("moi")
        this.checks.push(coordCheck)
        }
        } 
      }
    

      animateRumble(){
        
        if (this.angle >= 2 * Math.PI) {
            this.angle = 0;
        }

        if(this.frame < 10){
        this.frame += 1;
        }
        
        this.angle -= 0.02;
        const newx = this.center.x + this.radius * Math.cos(this.angle);
        const newy = this.center.y + this.radius * Math.sin(this.angle);

        this.rumble = {x: newx, y: newy}


        this.drawSelf() ;
       

        this.checks.forEach(check => {
        this.drawCheck(check.x , check.y, true)

        this.drawRumble('white', newx, newy);

        if(this.frame === 10){
        this.collision(check.x , check.y, newx, newy) 
        }
        });
    
      }
      
      collision(x : number, y: number, xrumble: number, yrumble: number)
      {
        const distanceBetweenCenters = Math.sqrt(
          Math.pow(x - xrumble, 2) + Math.pow(y - yrumble, 2)
      );

      if (Math.floor(distanceBetweenCenters) <= 6) {
          this.playAudio();  // Afficher "hey" quand une collision est détectée
          this.frame = 0;
        }
    }

    playAudio() {
      // Vérifier l'état du contexte audio
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.play().catch((error) => {
          console.error('Erreur lors de la lecture de l\'audio :', error);
        });
      }
    }
  
}
