/**
 * @type { HTMLCanvasElement }
 */
const canvas  = document.querySelector("canvas");
const context = canvas.getContext("2d");

const canvas_size = Math.min(window.innerWidth, window.innerHeight) - 2;

canvas.width = canvas.height = canvas_size;

// not sure if i'll be needing this
class Sprite {
    /**
     * @param { string } path the path pointing to the sprite
     */
    constructor(path) {
        this.img     = new Image();
        this.img.src = path;
        this.width   = this.img.width;
        this.height  = this.img.height;
    }
}

/**
 * 
 * @param { Entity[] } objects 
 * @param { Line_particle[] } particles
 * @param { CanvasRenderingContext2D } context 
 */
function draw(objects, particles, context) {
    context.clearRect(0, 0, canvas_size, canvas_size);
    objects.forEach(obj => {
        if (!obj.active) return;
        context.strokeStyle = obj.colour;
        if (obj.constructor == Rocket) {
            if (Math.floor(obj.invincibility / 333) % 2 == 1) {
                return;
            }
        }
        context.beginPath();
        obj.get_lines().forEach(line => {
            context.moveTo(line.start.x, line.start.y);
            context.lineTo(line.end.x, line.end.y);
        });
        context.closePath();
        context.stroke();
    });

    particles.forEach(particle => {
        context.strokeStyle = particle.colour;
        context.beginPath();
        context.moveTo(particle.line.start.x, particle.line.start.y);
        context.lineTo(particle.line.end.x, particle.line.end.y);
        context.closePath();
        context.stroke();
    });
}