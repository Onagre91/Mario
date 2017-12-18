var Cell = function (y, x, image) {
    this.x = x;
    this.y = y;
    this.image = image;
    this.html = document.createElement('img');
    this.html.src = image;
    this.html.style.position = 'absolute';
    this.html.style.width = scale+'px';
    document.body.appendChild(this.html);
    this.update = function () {
        this.html.style.left = this.x * scale+'px';
        this.html.style.top = this.y * scale+'px';
    };
    this.checkCollision = function (cell) {
        if(!cell) {
            return false;
        }
        if (cell.x === this.x && cell.y === this.y && this != cell) {
            return true;
        } else {
            return false;
        }
    };
    this.die = function () {
        var koop = new Koopa(y, x, 'assets/shell.png');
        koop.parentNode.removeChild(element);
        // détruit l'objet et le remove de la map
    };
    this.update();
}

var Mario = function (y, x, image) {
    var mario = this;
    Cell.call(this, y , x, image);
    this.falling = false;
    this.input = new Input(['ArrowLeft', 'ArrowRight', 'Space']);
    this.jump = {
        power: 0,
        interval: null
    };

    this.makeJump = function () {
        old_y = mario.y
        mario.y--;
        var collision = map.checkCollision(mario)
        if(collision){
            mario.y = old_y;
            if(collision instanceof Koopa){
                console.log('?');
            }
            return false;
        };
        mario.jump.power--;
        if (mario.jump.power === 0) {
            clearInterval(mario.jump.interval);
            mario.jump.interval = null;
            mario.falling = true;
        }
    };
    this.fall = function () {
        if(mario.jump.interval){
            return;
        }
        old_y = mario.y;
        mario.y++;
        mario.falling = true;
        var collision = map.checkCollision(mario)
        if(collision){
            if(collision instanceof Koopa){
                console.log('falling');
                collision.die();
            } else {
                mario.y = old_y;
                mario.falling = false;
            }
            if(collision instanceof Peach){
                window.alert("Bien joué, mais ta princesse est dans un autre projet !");
            }

        };
    };
    this.die = function () {
       clearInterval(this.interval);
       map.delete(this);
       window.alert("Game Over");
   };
   this.move = function () {
    old_x = mario.x;
    if (mario.input.keys.ArrowLeft.isPressed || mario.input.keys.ArrowLeft.pressed) {
        mario.x--;
        mario.input.keys.ArrowLeft.pressed = false;
    }
    if (mario.input.keys.ArrowRight.isPressed || mario.input.keys.ArrowRight.pressed) {
        mario.x++;
        mario.input.keys.ArrowRight.pressed = false;
    }
    if(mario.input.keys.Space.pressed || mario.input.keys.Space.isPressed ){
        if (mario.falling == false) {
            mario.jump.power = 3;
            mario.falling = true;
            mario.jump.interval = setInterval(mario.makeJump, 100);
        }
        mario.input.keys.Space.pressed = false;
    }
    var collision = map.checkCollision(mario)
    if (collision) {
        if(collision instanceof Koopa){
            mario.die();
            console.log('confrontage');
        } else {
            mario.x = old_x;
        }
        if (collision instanceof Peach) {
            window.alert("Bien joué, mais ta princesse est dans un autre projet !");
        } else {
            mario.x = old_x;
        }
    }
};
this.interval = setInterval(function () {
    mario.move();
    mario.update();
    mario.fall();
}, 100);
};

var Koopa = function (y, x, image) {
   Cell.call(this,y , x, image);
   var koopa = this;
   this.direction = 'left';
   this.die = function() {
    clearInterval(this.interval);
    map.delete(this);
};

this.move = function () {
    old_x = koopa.x;
    if (this.direction === 'left') {
        koopa.x--;
    }
    if (this.direction === 'right') {
        koopa.x++;
    }

    var collision = map.checkCollision(koopa);
    if (collision) {
        if(collision instanceof Mario){
            collision.die();
            console.log('confrontage');
        } else {
            koopa.x = old_x;
            if (this.direction === 'left'){
                this.direction = 'right'
            } else {
                this.direction = 'left'
            }
        }
    }
};
this.fall = function () {
 old_y = koopa.y;
 koopa.y++;
 var collision = map.checkCollision(koopa);
 if(collision){
    koopa.y = old_y;
}
};
this.interval = setInterval(function () {
 koopa.fall();
 koopa.move();
 koopa.update();
}, 200);
}


var Peach = function(y, x, image) {
 Cell.call(this, y, x, image);
 var peach = this;

}

var Input = function (keys) {
    this.keys = {};
    for (var i = 0; i < keys.length; i++) {
        this.keys[keys[i]] = {};
        this.keys[keys[i]].isPressed = false;
        this.keys[keys[i]].pressed = false;
    }
    var input = this;
    window.addEventListener('keydown', function(e){
        e = e || window.event;
        if (typeof input.keys[e.code] !== 'undefined'){
            input.keys[e.code].isPressed = true;
            input.keys[e.code].pressed = true;
        }
    });
    window.addEventListener('keyup', function(e){
        e = e || window.event;
        if (typeof input.keys[e.code] !== 'undefined'){
            input.keys[e.code].isPressed = false;
        }
    });
}

var Map = function (model) {
    this.map = [];
    this.generateMap = function () {
        for (var y = 0; y < model.length; y++) {
            for (var x = 0; x < model[y].length; x++) {
                var leet = model[y][x];
                if (leet === "w") {
                    this.map.push(new Cell(y, x, 'assets/wall.jpg'));
                }
                if (leet === "k") {
                    this.map.push(new Koopa(y, x, 'assets/shell.png'));
                }
                if (leet === "m") {
                    this.map.push(new Mario(y, x, 'assets/mario.png'));
                }
                if (leet === "p") {
                    this.map.push(new Peach(y, x, 'assets/peach.png')); 
                }
            }
        }
    };
    this.checkCollision = function (cell) {
        for (var i = 0; i < this.map.length; i++) {
            if(cell.checkCollision(this.map[i])) {
                return this.map[i];
            }
        }
        return false;
    };
    this.delete = function (cell) {
        this.map.splice(this.map.indexOf(cell), 1);
        document.body.removeChild(cell.html);
        delete cell;
    };
};

var schema = [
'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
'w                                      w',
'w                     k                w',
'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww    w',
'w                                      w',
'w                                      w',
'w                                      w',
'w                                      w',
'w                                      w',
'w          k    w                      w',
'wwwwwwwwwwwwwwwww                      w',
'w                   w                  w',
'w            wwwww  wwwwwwwwwwwwwwwwwwww',
'w            w                         w',
'w           ww                         w',
'w          www                         w',
'w         wwww                         w',
'w    m   wwwww k     w      k        p w',
'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'
];
var scale = 30;
var map = new Map(schema);
map.generateMap();
