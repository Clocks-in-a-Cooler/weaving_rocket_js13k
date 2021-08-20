// had all this code lying around. might as well put it to good use

class Colour {
    /**
     * @param { number } r 
     * @param { number } g 
     * @param { number } b 
     * @param { number } a (defaults to 1, full opacity, if no alpha is specified)
     */
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    to_string() {
        return `rgba(${ this.r }, ${ this.g }, ${ this.b }, ${ this.a })`;
    }

    clone() {
        return new Colour(this.r, this.g, this.b, this.a);
    }
}

class Vector {
    /**
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x, y) {
        this.x = x; this.y = y;
    }

    get length() {
        return Math.hypot(this.x, this.y);
    }

    get angle() {
        var angle = Math.acos(this.x / this.length);
        return this.y > 0 ? angle : -angle;
    }

    to_string() {
        return `(${ this.x }, ${ this.y })`;
    }

    /**
     * @param {Vector} other 
     */
    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    /**
     * @param {Vector} other
     */
    subtract(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    /**
     * @param {Number} factor
     */
    multiply(factor) {
        return new Vector(this.x * factor, this.y * factor);
    }

    /**
     * @param {Number} new_length
     */
    scale(new_length) {
        var factor = new_length / this.length;
        return this.multiply(factor);
    }
}

class Line {
    /**
     * @param {Vector} start
     * @param {Vector} end
     */
    constructor(start, end) {
        this.start = start;
        this.end   = end;
    }

    get vector() {
        return this.end.subtract(this.start);
    }

    get length() {
        return this.end.subtract(this.start).length;
    }

    get midpoint() {
        return new Vector((this.start.x + this.end.x) / 2, (this.start.y + this.end.y)  / 2);
    }

    /**
     * 
     * @param { number } start_x 
     * @param { number } start_y 
     * @param { number } end_x 
     * @param { number } end_y 
     */
    static create_line(start_x, start_y, end_x, end_y) {
        return new Line(new Vector(start_x, start_y), new Vector(end_x, end_y));
    }

    /**
     * @param {Vector} displacement
     */
    translate(displacement) {
        return new Line(this.start.add(displacement), this.end.add(displacement));
    }

    /**
     * @param {Vector} center 
     * @param {Number} angle 
     */
    rotate(center, angle) {
        // to match the formula i ~~stole~~ worked out on my own
        var x1 = this.start.x;
        var y1 = this.start.y;
        var x2 = this.end.x;
        var y2 = this.end.y;
        var p  = center.x;
        var q  = center.y;

        var new_x1 = (x1 - p) * Math.cos(angle) - (y1 - q) * Math.sin(angle) + p;
        var new_y1 = (x1 - p) * Math.sin(angle) + (y1 - q) * Math.cos(angle) + q;
        var new_x2 = (x2 - p) * Math.cos(angle) - (y2 - q) * Math.sin(angle) + p;
        var new_y2 = (x2 - p) * Math.sin(angle) + (y2 - q) * Math.cos(angle) + q;

        return new Line(
            new Vector(new_x1, new_y1),
            new Vector(new_x2, new_y2)
        );
    }

    /**
     * @param {Line} other
     * @returns {Vector?} the point of intersection
     */
    collision(other) {
        // stolen from http://paulbourke.net/geometry/pointlineplane/
        // i solved for u1 and u2 differently, but the result is the same
        var x1 = this.start.x;
        var y1 = this.start.y;
        var x2 = this.end.x;
        var y2 = this.end.y;
        var x3 = other.start.x;
        var y3 = other.start.y;
        var x4 = other.end.x;
        var y4 = other.end.y;

        var denominator = (x4 - x3) * (y2 - y1) - (x2 - x1) * (y4 - y3);
        
        if (denominator == 0) {
            return false;
        }

        var u1_numerator = (x4 - x3) * (y3 - y1) - (x3 - x1) * (y4 - y3);
        var u2_numerator = (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1);

        var u1 = u1_numerator / denominator;
        // var u2 = u2_numerator / demoninator; // haha i'm an idiot
        var u2 = u2_numerator / denominator;

        if (
            u1 >= 0 && u1 <= 1 &&
            u2 >= 0 && u2 <= 1
        ) {
            return this.start.add(this.vector.multiply(u1));
        } else {
            return null;
        }
    }
}

const LINE_PARTICLE_MOVE_SPEED   = 0.03;
const LINE_PARTICLE_ROTATE_SPEED = Math.PI / 6000; // up to 30 degrees per second, which is PI / 6 radians per second, which in turn is PI / 6000 radians per second
const LINE_PARTICLE_MAX_LIFETIME = 750; // milliseconds

class Line_particle extends Line {
    /**
     * @param { Line } line
     * @param { Colour } colour
     */
    constructor(line, colour) {
        super(line.start, line.end);
        this.colour = colour.clone();
        this.motion = new Vector(Math.random() * LINE_PARTICLE_MOVE_SPEED, Math.random() * LINE_PARTICLE_MOVE_SPEED);

        this.rotation  = (Math.random() < 0.5 ? -1 : 1) * Math.random() * LINE_PARTICLE_ROTATE_SPEED;
        this.motion.x *= Math.random() < 0.5 ? -1 : 1;
        this.motion.y *= Math.random() < 0.5 ? -1 : 1;

        this.lifetime = LINE_PARTICLE_MAX_LIFETIME;
    }

    /**
     * @param { number } lapse 
     */
    update(lapse) {
        var new_line   = this.rotate(this.midpoint, this.rotation * lapse).translate(this.motion.multiply(lapse));
        this.start     = new_line.start;
        this.end       = new_line.end;
        this.lifetime -= lapse;
        this.colour.a  = this.lifetime / LINE_PARTICLE_MAX_LIFETIME;
    }
}

class Entity {
    /**
     * @param {Vector} position the center of the entity
     * @param {Line[]} lines the outline of the entity, relative to the center (`position`). used for collision detection. does not need to be closed
     * @param {Number?} angle the angle, where 0 is facing directly to the right. if no angle is supplied, defaults to 0
     */
    constructor(position, lines, angle) {
        this.position = position;
        this.angle    = isNaN(angle) ? 0 : angle;
        this.lines    = lines;
        this.health   = 1;
        this.active   = true;
        this.colour   = new Colour(255, 255, 255);
    }

    get_lines() {
        var center = this.position, angle = this.angle;
        return this.lines.map(line => {
            return line.translate(center).rotate(center, angle);
        });
    }

    /**
     * creates an entity.
     * @param {Vector} center 
     * @param {Vector[]} points the vertices of the entity, relative to the center
     * @param { number } angle the angle of the entity. like with the constructor, this defaults to 0
     */
    static create_entity(center, points, angle) {
        angle     = isNaN(angle) ? 0 : angle;
        var lines = points.map((_, index, points) => {
            return new Line(points[index], points[(index + 1) % points.length]).translate(center.multiply(-1));
        });

        return new Entity(center, lines, angle);
    }

    /**
     * @param {Entity} other
     * @returns {Vector[]} an array of points where intersection occurs. if there is no intersection, `null` is returned
     */
    collision(other) {
        /**
         * @type { Vector }
         */
        var intersection_points = [];
        this.get_lines().forEach((this_line) => {
            other.get_lines().forEach((other_line) => {
                var collision_point = this_line.collision(other_line);
                if (collision_point) {
                    intersection_points.push(collision_point);
                }
            });
        });

        return intersection_points.length ? intersection_points : null;
    }

    /**
     * 
     * @param { number } lapse 
     * @param { Entity[] } entities
     */
    update(lapse, entities) {
        // override
    }

    shatter() {
        // break apart those lines, and fall apart
        this.get_lines().forEach(line => {
            particles.push(new Line_particle(line, this.colour));
        });

        this.active = false;
    }
}

/**
 * @type { Entity[] }
 */
var entities = [];

/**
 * @type { Line_particle[] }
 */
var particles = [];

// objects that you'll actually see in the game

const ASTEROID_SIDE_LENGTH = 20;

var asteroid_move_speed     = 0.2;
var asteroid_rotation_speed = 0.001;
class Asteroid extends Entity {
    /**
     * each asteroid is a regular polygon.
     * @param { number } x 
     * @param { number } size the number of sides. the more sides, the larger the polygon
     * @param { Colour } colour 
     */
    constructor(x, size, colour) {
        var position = new Vector(x, -100);
        var lines    = [];

        var center_angle = Math.PI * 2 / size;
        var radius       = ASTEROID_SIDE_LENGTH * 0.5 / Math.sin(center_angle / 2);

        for (var c = 0; c < size; c++) {
            var angle = c * center_angle;
            var start = new Vector(Math.cos(angle) * radius, Math.sin(angle) * radius);
            var end   = new Vector(Math.cos(angle + center_angle) * radius, Math.sin(angle + center_angle) * radius);
            lines.push(new Line(start, end));
        }

        super(position, lines, 0);
        this.colour = colour;
        this.speed  = Math.random() * 0.1 + asteroid_move_speed;

        this.rotate_direction = Math.random() < 0.5 ? -1 : 1;
    }

    /**
     * @param { number } lapse 
     * @param { Entity[] } entities
     */
    update(lapse, entities) {
        this.position.y += lapse * this.speed;
        this.angle      += lapse * asteroid_rotation_speed * this.rotate_direction;
        this.active      = this.active && (this.position.y - 100) < canvas_size;
    }
}


const ROCKET_LINES = [
    new Line(new Vector(0, -30), new Vector(15, 30)),
    new Line(new Vector(15, 30), new Vector(0, 15)),
    new Line(new Vector(0, 15), new Vector(-15, 30)),
    new Line(new Vector(-15, 30), new Vector(0, -30))
];

const ROCKET_MOVE_SPEED = 0.3;
const ROCKET_LEAN_ANGLE = Math.PI / 6;
const ROCKET_ACCELERATION = 0.0005;
const ROCKET_FRICTION     = 0.0015;

class Rocket extends Entity {
    constructor() {
        var position = new Vector(canvas_size / 2, canvas_size - 50);
        super(position, ROCKET_LINES, 0);
        this.colour        = new Colour(173, 255, 47);
        this.invincibility = 5000;
        this.direction     = "left";
        this.x_speed       = 0;
    }

    /**
     * @param { number } lapse 
     * @param { Entity[] } entities
     */
    update(lapse, entities) {
        this.invincibility = this.invincibility <= 0 ? 0 : (this.invincibility - lapse);

        if (space_bar & KEY_PRESSED) {
            switch (this.direction) {
                case "right":
                    this.direction = "left";
                    break;
                case "left":
                    this.direction = "right";
                    break;
            }
            space_bar = KEY_SEEN;
        }

        if (space_bar) {
            switch (this.direction) {
                case "right":
                    this.x_speed    += ROCKET_ACCELERATION * lapse;
                    break;
                case "left":
                    this.x_speed    -= ROCKET_ACCELERATION * lapse;
                    break;
            }
        }
        this.position.x += this.x_speed * lapse;
        this.angle       = ROCKET_LEAN_ANGLE * this.x_speed / ROCKET_MOVE_SPEED;
        this.x_speed    -= this.x_speed * lapse * ROCKET_FRICTION;
        this.position.x  = Math.max(30, Math.min(this.position.x, canvas_size - 30));

        entities.forEach(entity => {
            if (entity === this) return;
            if (entity.collision(this)) {
                entity.shatter();
                this.shatter();
                this.active        = true;
                this.invincibility = 2000;
            }
        });
    }
}