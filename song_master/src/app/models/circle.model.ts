import { delay } from "rxjs";

export class Circle {
    public checks: { x: number; y: number }[] = [];
    public rumble: { x: number; y: number } = {x: 0, y: 0}
    public angle: number = 0

    constructor(public radius: number, public color: string, public context: CanvasRenderingContext2D, public center: {x: number, y: number}) 
    {
        this.drawSelf();
        this.drawRumble('white', (this.center.x + this.radius), this.center.y);
        
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
        this.context.fillStyle = 'white'; 
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
        
        this.angle -= 0.01;
        const newx = this.center.x + this.radius * Math.cos(this.angle);
        const newy = this.center.y + this.radius * Math.sin(this.angle);

        this.rumble = {x: newx, y: newy}


        this.drawSelf() ;
        this.drawRumble('white', newx, newy);

        this.checks.forEach(check => {
        this.drawCheck(check.x , check.y, true)
        this.collision(check.x , check.y) 
        });
        
        
        //setTimeout(() => this.animateRumble(), 100);
    
      }
      
      collision(x : number, y: number){
        const distanceBetweenCenters = Math.sqrt(
            Math.pow(x - this.rumble.x, 2) + Math.pow(y - this.rumble.y, 2)
        );
    
        // Vérifier si le cercle1 est complètement dans le cercle2
        if(distanceBetweenCenters + 5.5 <= 6){
            //console.log("hey")
            this.playNote(440, 0.05)
        }
        

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
     
}
