function reset() {
    // clear everything
    entities = [];
}

function start() {
    // give the player a new rocket
    entities.push(new Rocket());
}

/**
 * @param { number } lapse 
 */
function update(lapse) {
    // update everything as usual
    entities = entities.filter(e => e.active);
    entities.forEach(e => e.update(lapse, entities));

    particles = particles.filter(p => p.lifetime > 0);
    particles.forEach(p => p.update(lapse));

    if (Math.random() < 0.167) {
        entities.push(new Asteroid(Math.random() * canvas_size, Math.floor(Math.random() * 8 + 5), "white"));
    }
}

var last_time = null;
function animate(time) {
    var lapse = last_time == null ? 0 : time - last_time;
    lapse     = Math.min(lapse, 33);
    last_time = time;
    update(lapse);
    draw(entities, particles, context);
    requestAnimationFrame(animate);
}

start();
requestAnimationFrame(animate);