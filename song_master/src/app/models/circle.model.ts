import { delay } from "rxjs";

export class Circle {
  public checks: { x: number; y: number }[] = [];
  private activeChecks: Set<string> = new Set();
  public checksCollised: { x: number; y: number; frame: number }[] = [];
  public rumble: { x: number; y: number } = { x: 0, y: 0 };
  public angle: number = 0;
  public frame: number = 10;
  public selected: boolean = false; // ✅ Nouvelle propriété
  private audioElement: HTMLAudioElement;
  private note: string;
  public onUpdate?: () => void;

  constructor(
    public radius: number,
    public color: string,
    public context: CanvasRenderingContext2D,
    public center: { x: number; y: number },
    public speed: number,
  ) {
    this.drawSelf();
    this.drawRumble("white", this.center.x + this.radius, this.center.y);
    
    const notes = ['c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4'];
    this.note = notes[(Math.floor(this.radius / 20)) % notes.length];
    this.audioElement = new Audio(`./audio/${this.note}.mp3`);
    this.audioElement.preload = 'auto';
    this.audioElement.addEventListener("canplaythrough", () => {
    });
  }

  // ---------------------------------------------------------
  // ✅ Dessin du cercle principal
  // ---------------------------------------------------------
  drawSelf(customColor?: string) {
    this.context.beginPath();
    this.context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
    this.context.strokeStyle = customColor ?? (this.selected ? "red" : this.color);
    this.context.lineWidth = 2;
    this.context.stroke();
    this.context.closePath();
  }

  drawRumble(color: string, x: number, y: number) {
    this.context.beginPath();
    this.context.arc(x, y, 5.5, 0, Math.PI * 2);
    this.context.fillStyle = color;
    this.context.fill();
    this.context.closePath();
    this.rumble = { x, y };
  }

  resetRumble() {
    this.angle = 0;
    this.frame = 10;
    this.rumble = {
      x: this.center.x + this.radius,
      y: this.center.y,
    };

    this.drawSelf();
    this.checks.forEach((check) => this.drawCheck(check.x, check.y, true));
    this.drawRumble("white", this.rumble.x, this.rumble.y);
  }

  // ---------------------------------------------------------
  // ✅ Gestion des "checks"
  // ---------------------------------------------------------
  changeColorCheck(mouseX: number, mouseY: number) {
    this.checks.forEach((check) => {
      const dx = mouseX - check.x;
      const dy = mouseY - check.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      this.context.beginPath();
      this.context.arc(check.x, check.y, 6, 0, Math.PI * 2);
      this.context.fillStyle = "black";
      this.context.fill();
      this.context.strokeStyle = distance <= 13 ? "red" : this.color;
      this.context.stroke();
      this.context.closePath();
    });
  }

  removeCheck(x: number, y: number) {
    this.checks = this.checks.filter((c) => !(c.x === x && c.y === y));
    if (this.onUpdate) this.onUpdate();
  }

  drawCheck(x: number, y: number, loop: boolean, manual: boolean = false) {
    const coordCheck = { x, y };
    let foundCheck = undefined;

    if (!loop) {
      foundCheck = this.checks.find(
        (coord) =>
          coord.x === x && coord.y === y ||
          (coord.x > x - 12 && coord.x < x + 12 &&
           coord.y > y - 12 && coord.y < y + 12) ||
          (this.rumble.x > x - 12 && this.rumble.x < x + 12 &&
           this.rumble.y > y - 12 && this.rumble.y < y + 12)
      );
    }

    if (foundCheck && !loop && manual) {
      this.removeCheck(foundCheck.x, foundCheck.y);
    }

    
    if (!foundCheck || loop) {
      this.context.beginPath();
      this.context.arc(x, y, 6, 0, Math.PI * 2);
      this.context.strokeStyle = this.color;
      this.context.fillStyle = "black";
      this.context.fill();
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.closePath();

      if (!foundCheck && !loop) {
        this.checks.push(coordCheck);
      }
    }
  }

  // ---------------------------------------------------------
  // ✅ Animation et collisions
  // ---------------------------------------------------------
  animateRumble(isPaused: boolean) {
    if (isPaused) {
      this.drawSelf();
      this.checks.forEach((check) => this.drawCheck(check.x, check.y, true));
      this.drawRumble("white", this.rumble.x, this.rumble.y);
      return;
    }

    if (this.angle >= 2 * Math.PI) {
      this.angle = 0;
    }

    if (this.frame < 10) this.frame += 1;
    this.angle -= this.speed;

    const newx = this.center.x + this.radius * Math.cos(this.angle);
    const newy = this.center.y + this.radius * Math.sin(this.angle);
    this.rumble = { x: newx, y: newy };

    this.drawSelf();
    this.checks.forEach((check) => {
      this.drawCheck(check.x, check.y, true);
      if (this.frame === 10) {
        this.collision(check.x, check.y, newx, newy);
      }
    });

    this.drawRumble("white", this.rumble.x, this.rumble.y);
  }

  collision(x: number, y: number, xrumble: number, yrumble: number) {
  const distance = Math.sqrt((x - xrumble) ** 2 + (y - yrumble) ** 2);
  const key = `${x},${y}`; // identifiant unique du check

  if (distance <= 6) {
    if (!this.activeChecks.has(key)) {
      this.playAudio();        // joue la note seulement une fois
      this.activeChecks.add(key);
      this.frame = 0;
    }
  } else {
    // Le rumble est sorti du check → on peut rejouer la note à la prochaine entrée
    if (this.activeChecks.has(key)) {
      this.activeChecks.delete(key);
    }
  }
}


  playAudio() {
  if (this.audioElement) {
    const clone = this.audioElement.cloneNode(true) as HTMLAudioElement;
    clone.currentTime = 0;
    clone.play().catch((err) => console.error("Erreur audio :", err));
  }
}
}
