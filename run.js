// Constants
const MARGIN = 40;
const TORQUE = 0.005;
let canv;

// Assets
let shipImage;
let explodeSound;
let tingSound;
let thrustSound;
let thrustImages = [];
let tutorialImage;

// Game objects
let ship;
let objective;
let ground;
let highscore = 0;

// Ship variables
let collision = false;
let hasMoved = false;

// module aliases
let Engine = Matter.Engine,
    World = Matter.World,
    Events = Matter.Events,
    Vector = Matter.Vector,
    Bodies = Matter.Bodies;

// create an engine
let engine = Engine.create();

// Particle System
let particles = [];

// Timer
let duration = 0;
let collisionStart = 0;
let collisionEnd = 0;

// Score
let score = 0;
let u = 0;

function preload() {
    // Load sound effects
    soundFormats('mp3', 'ogg');
    explodeSound = loadSound('assets/sound/explode.mp3');
    tingSound    = loadSound('assets/sound/ting.mp3');
    thrustSound  = loadSound('assets/sound/thrust.mp3');

    // Load sprites
    shipImage = loadImage("assets/graphics/rocket.svg");
    tutorialImage = loadImage("assets/graphics/tutorial.svg")
    thrustImages.push(loadImage('assets/graphics/thrust1.svg'));
    thrustImages.push(loadImage('assets/graphics/thrust2.svg'));
    thrustImages.push(loadImage('assets/graphics/thrust3.svg'));
}

function setup() {
    // Create canvas
    resize();
    // We need a ground
    ground = Bodies.rectangle(0, height, width * 2, 5, { isStatic: true, mass: 1 });
    World.add(engine.world, ground);
    
    // Objective
    objective = new Boxy();

    // Create ship
    ship = new Rocket(4, 40, 0);
    newGame();

    // Handle collision events
    collisionHandler();
}

function draw() {
    resize();
    let d = false;
    clear();
    fill(254,190,190);

    if(keyDown("A")){
        hasMoved = true;
        ship.body.torque -= collision ? TORQUE * 5 : TORQUE;
    }
    if(keyDown("D")){
        hasMoved = true;
        ship.body.torque += collision ? TORQUE * 5 : TORQUE;
    }

    if(keyDown("W")){
        hasMoved = true;
        d = true;
        Matter.Body.applyForce(
            ship.body,
            ship.body.position, 
            Vector.rotate(
                Vector.create(0, -0.01), 
                ship.body.angle, 
                ship.body.position,
            )
        );
        ship.thrust();
    } else {
        ship.thrust(true);
    }

    Engine.update(engine);

    objective.draw();
    ship.draw(d);

    if(particles.length > 0) {
        for(var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].display();
        }
    }

    if(!hasMoved){
        push();
        translate(width / 2, height / 2);
        imageMode(CENTER);
        image(tutorialImage, 0, 0, 432, 297);
        pop();
    }

    push();
    fill(255,0,0);
    stroke(255,0,0);
    rect(0,0, 120, 30);
    fill(255,255,255);  
    textSize(24);
    text(score > highscore ? score : highscore, 5, 23);
    pop();
}

function resize(){
    let newHeight = windowHeight - 4;
    let children = document.body.children;
    for (let i = 0; i < children.length; i++) {
        if(children[i].tagName == "CANVAS"){
            continue;
        }
        newHeight -= children[i].offsetHeight;
    }

    canv = createCanvas(windowWidth - 1, newHeight);
}

function keyTyped(){
    if(key == "X" || key == "x"){
        explode();
    }
}

function newGame(){
    Matter.Body.setPosition(ship.body,Vector.create(width/2, height - 20));
    Matter.Body.setVelocity(ship.body, Vector.create(0,0));
    objective.destroy();
    objective = new Boxy();
}

class Boxy {
    constructor() {
        this.x = random(170, width - 170);
        this.y = random(150, height - 250);
        this.w = 120;
        this.h = 40;
        this.body = Bodies.rectangle(
            this.x, this.y, this.w, this.h,
            { isStatic: true, mass: 1 });

        World.add(engine.world, this.body);
    }
    
    draw() {
        push();
        fill(255);
        translate(this.body.position.x, this.body.position.y);
        rectMode(CENTER);
        rotate(this.body.angle);
        rect(0, 0, this.w, this.h);
        fill(0);
        textSize(32);
        text(score, -52, 10);
        pop();
    }

    destroy() {
        World.remove(engine.world, this.body);
    }
}

class Rocket {
    constructor(m, x, y) {
        this.x = x;
        this.y = y;
        this.body = Bodies.fromVertices(this.x, this.y, [
            { "x": 256, "y": 24 },
            { "x": 231.3311, "y": 41.0187 }, { "x": 209.3760, "y": 61.4227 },
            { "x": 191.1132, "y": 85.1678 }, { "x": 178.3484, "y": 112.2347 },
            { "x": 173.2137, "y": 141.6867 }, { "x": 173.1757, "y": 144.4707 },
            { "x": 173.1757, "y": 257.4121 }, { "x": 97.8828, "y": 313.8828 },
            { "x": 97.8828, "y": 406.1738 }, { "x": 52.7050, "y": 451.3496 },
            { "x": 52.7050, "y": 490.8242 }, { "x": 67.2073, "y": 490.8242 },
            { "x": 97.2073, "y": 490.8242 }, { "x": 127.2073, "y": 490.8242 },
            { "x": 157.2073, "y": 490.8242 }, { "x": 187.2073, "y": 490.8242 },
            { "x": 217.2073, "y": 490.8242 }, { "x": 247.2073, "y": 490.8242 },
            { "x": 277.2073, "y": 490.8242 }, { "x": 307.2073, "y": 490.8242 },
            { "x": 337.2073, "y": 490.8242 }, { "x": 367.2073, "y": 490.8242 },
            { "x": 397.2073, "y": 490.8242 }, { "x": 427.2073, "y": 490.8242 },
            { "x": 457.2073, "y": 490.8242 }, { "x": 459.2949, "y": 490.8242 },
            { "x": 459.2949, "y": 451.3496 }, { "x": 414.1172, "y": 406.1738 },
            { "x": 414.1172, "y": 313.8828 }, { "x": 338.8242, "y": 257.4121 },
            { "x": 338.8242, "y": 144.4707 }, { "x": 337.6966, "y": 129.3276 },
            { "x": 329.1781, "y": 100.6604 }, { "x": 313.8760, "y": 74.9265 },
            { "x": 293.9093, "y": 52.5838 }, { "x": 270.7720, "y": 33.5263 }
        ]
        );
        Matter.Body.scale(this.body, 0.10, 0.10);
        this.body.mass = m;

        World.add(engine.world, this.body);
    }

    draw(d) {
        push();
        translate(this.body.position.x, this.body.position.y);
        rectMode(RADIUS);
        rotate(this.body.angle);
        triangle();
        image(shipImage, -28, -28, 48, 48);

        if (d) {
            image(thrustImages[(++u) % 3], -11, 20, 15, 20);
        }
        pop();

        if (this.body.position.x < -MARGIN) {
            Matter.Body.setPosition(this.body,
                { "x": width, "y": this.body.position.y });
        } else if (this.body.position.x > width + MARGIN) {
            Matter.Body.setPosition(this.body,
                { "x": 0, "y": this.body.position.y });
        } else if (this.body.position.y < -1000) {
            explode();
        } else if (this.body.position.y > height) {
            explode();
        }
    }

    thrust(d) {
        if (d) {
            thrustSound.stop();
            return;
        }
        
        if (!thrustSound.isPlaying()) {
            thrustSound.play();
        }
    }
}


function collisionHandler(){
    Events.on(engine, 'collisionStart', function(event) {
        collisionStart = (new Date()).getTime();
        var pair = event.pairs[0];

        var bodyAMomentum = Vector.mult(pair.bodyA.velocity, pair.bodyA.mass);
        var bodyBMomentum = Vector.mult(pair.bodyB.velocity, pair.bodyB.mass);
        var relativeMomentum = Vector.sub(bodyAMomentum, bodyBMomentum);

        if (Vector.magnitude(relativeMomentum) > 40) {
            explode();
        } else if(!collision) {
            tingSound.play()
        }
        
        collision = true;
    });

    Events.on(engine, 'collisionActive', function(event){
        if(event.pairs[0].bodyA.id != 1){
            duration = (new Date()).getTime() - collisionStart;

            if(duration > 1000){
                objective.destroy();
                objective = new Boxy();
                score += 250;
                duration = 0;
            }
        }
    });

    Events.on(engine, 'collisionEnd', function(event) {
        collisionEnd = (new Date()).getTime();
        collision = false;
    });
}

function explode(){
    console.log("EXPLODE!!!");
    explodeSound.play();

    for(let i = 0; i < 150; i++){
        particles[i] = new Particle(ship.body.position.x, ship.body.position.y, 
            random(3, 50));
    }
    if(highscore < score){
        highscore = score;
    }
    score = 0;
    newGame();
}

class Particle {
    constructor(x, y, r) {
        this.pos   = createVector(x, y);
        this.vel   = createVector(random(-50, 50), random(-50, 50));
        this.acc   = createVector(0, 0);
        this.r     = r ? r : 48;
        this.halfr = r / 2;
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.set(0, 0);
    }

    display() {
        noStroke();
        fill(255,0,30);
        ellipse(this.pos.x, this.pos.y, this.r, this.r);
    }

    edges() {
        if(this.pos.y > (height - this.halfr)) {
            this.vel.y *= -1;
            this.pos.y = (height - this.halfr);
        }

        if(this.pos.y < 0 + this.halfr) {
            this.vel.y *= -1;
            this.pos.y = 0 + this.halfr;
        }

        if(this.pos.x > (width - this.halfr)) {
            this.vel.x *= -1;
            this.pos.x = (width - this.halfr);
        }

        if(this.pos.x < this.halfr) {
            this.vel.x /= -1;
            this.pos.x = this.halfr;
        }
    }
}
