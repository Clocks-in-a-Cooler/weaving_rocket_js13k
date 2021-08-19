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
    context.lineWidth = 4;
    objects.forEach(obj => {
        if (!obj.active) return;
        context.strokeStyle = obj.colour.to_string();
        if (obj.constructor == Rocket) {
            // draw an arrow to guide the player and show them where their ship is going next
            var draw_arrow_direction;
            if (!space_bar) {
                // we need to draw the opposite direction
                if (obj.direction == "left") {
                    draw_arrow_direction = "right";
                } else {
                    draw_arrow_direction = "left";
                }
            } else {
                draw_arrow_direction = obj.direction;
            }

            context.fillStyle = "lime";
            context.save();
            context.translate(obj.position.x, obj.position.y);
            context.beginPath();
            switch (draw_arrow_direction) {
                case "left":
                    context.moveTo(-30, 15);
                    context.lineTo(-30, -15);
                    context.lineTo(-45, 0);
                    break;
                case "right":
                    context.moveTo(30, 15);
                    context.lineTo(30, -15);
                    context.lineTo(45, 0);
                    break;
            }
            context.closePath();
            context.fill();
            context.restore();

            if (Math.floor(obj.invincibility / 200) % 2) {
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
        context.strokeStyle = particle.colour.to_string();
        context.beginPath();
        context.moveTo(particle.start.x, particle.start.y);
        context.lineTo(particle.end.x, particle.end.y);
        context.closePath();
        context.stroke();
    });
}