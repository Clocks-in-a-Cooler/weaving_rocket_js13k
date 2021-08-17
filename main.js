/**
 * @type { Entity[] }
 */
var entities = [];

canvas.addEventListener("click", (event) => {
    var x = event.offsetX;
    entities.push(new Asteroid(x, Math.floor(Math.random() * 4 + 6), "white"));
});

/**
 * @param { number } lapse 
 */
function update(lapse) {
    entities = entities.filter(e => e.active);
    entities.forEach(e => e.update(lapse));
}

var last_time = null;
function animate(time) {
    var lapse = last_time == null ? 0 : time - last_time;
    last_time = time;
    update(lapse);
    draw(entities, context);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);