var Game = {
  player: {
    x: 79.98844383444641,
    y: 95.20566767468645,
    width: 25,
    height: 25,
    speed: 1,
    turnspeed: 1,
    angle: 336,
    turn: function(dir) {
      if (dir == 0) {
        this.angle -= Game.player.turnspeed;
      } else {
        this.angle += Game.player.turnspeed;
      }
      if (this.angle > 360) {
        this.angle -= 360;
      }
      if (this.angle < 0) {
        this.angle += 360;
      }
    },
    move: function(dir) {
      var angle = this.angle;
      angle += (dir * 90);
    
      var deltaX = this.speed * Math.cos(Game.toRad(angle));
      var deltaY = this.speed * Math.sin(Game.toRad(angle));
    
      var mapX = Math.floor((deltaX + this.x) / Game.mapConfig.blockSize);
      var mapY = Math.floor((deltaY + this.y) / Game.mapConfig.blockSize);
      var pMapX = Math.floor((this.x) / Game.mapConfig.blockSize);
      var pMapY = Math.floor((this.y) / Game.mapConfig.blockSize);

      if (!Game.checkSolid(mapY, pMapX)) this.y += deltaY;
      if (!Game.checkSolid(pMapY, mapX)) this.x += deltaX;
    }
  },
  rays: {
    quantity: 180,
    fov: 60,
    step: 0.1,
    renderDistance: 50,
    distances: [],
    zmatrix: [],
    dev: [],
    points: []
  },
  mapConfig: {
    blockSize: 40
  },
  map: {
    data:`########################################
#               ####
#  .   # #####  ####
#  .   # #####  ####
#   .  # #####  ####
# #  . # ###    ####
# ###### ###  ######
#    #   ###  ######
#   ##        ######
##  ######  ########
##  ######  ########
##          ########
##          ########
#######  ###########
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################
####################`.split("\n"),
    info: {
      " ": {
        solid: false,
        color: {
          r: 0,
          g: 0,
          b: 0
        }
      },
      "#": {
        solid: true,
        color: {
          r: 75,
          g: 75,
          b: 200
        },
        height: 1
      },
      ".": {
        solid: true,
        color: {
          r: 200,
          g: 75,
          b: 75
        },
        height: 1
      }
    }
  },
  entities: [
    {
      color: "red",
      x: 214,
      y: 94
    }
  ],
  drawRay: function (x, y, angle, length, color) {
    angle = angle * Math.PI / 180;

    var endX = x + length * Math.cos(angle);
    var endY = y + length * Math.sin(angle);

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  },
  circle: function (x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  },
  toRad: function(angle) {
    return angle * Math.PI / 180;
  },
  toDeg: function(angle) {
    return angle * (180 / Math.PI);
  },
  checkSolid: function(y, x) {
    if (Game.map.data[y] !== undefined && Game.map.data[y][x] !== undefined) return Game.map.info[Game.map.data[y][x]].solid;
  },
  angleOf: function(a, b) {
    var dy = a[1] - b[1];
    var dx = a[0] - b[0];
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    //if (theta < 0) theta = 360 + theta; // range [0, 360)
    return theta - 180;
  },
  getSpriteCoord: function(sprite) {
    var angle = Game.angleOf([Game.player.x, Game.player.y], [sprite.x, sprite.y]) - Game.player.angle;

    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    x = (angle * (canvas.width / Game.rays.fov)) + (canvas.width / 2);



    cctx.fillStyle = "green";
    cctx.fillRect(x, canvas.height / 2, 50, 50);
  },
  distanceTo: function(a, b) {
    var a = a[0] - b[0];
    var b = a[1] - b[1];

    return Math.sqrt(a * a, b * b);
  },
  //asdf4
  closeTo: function(a, b) {
    return Math.abs(a - b) <= 1;
  },
  getDistances: function () {
    Game.rays.points = [];
    for (var i = 0; i < Game.rays.quantity; i++) {
      var angle = Game.toRad((Game.player.angle - (Game.rays.fov / 2)) + ((Game.rays.fov / Game.rays.quantity) * i));
      // var angle = Game.toRad(330);
      var rayX = Game.player.x;
      var rayY = Game.player.y;
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);
      var tan = Math.tan(angle);
      var hitWall = false;

      for (var j = 0; j < Game.rays.renderDistance; j++) {
        // rayX += Math.cos(angle) * Game.rays.step;
        // rayY += Math.sin(angle) * Game.rays.step;

        var stepX, stepY;

        ////
        // cos is + if facing right
        // maybe remove +/- 1, so you can't see through walls?
        if (sin < 0) {
          stepY = (Math.floor((rayY - 1) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayY;
        } else {
          stepY = (Math.ceil((rayY + 1) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayY;
        }
        if (cos < 0) {
          stepX = (Math.floor((rayX - 1) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayX
        } else {
          stepX = (Math.ceil((rayX + 1) / Game.mapConfig.blockSize) * Game.mapConfig.blockSize) - rayX;
        }
      

        var nearX = [rayX + stepX, (stepX * tan) + rayY]; // blue
        var nearY = [(stepY / tan) + rayX, rayY + stepY]; // purple


        var mapX, mapY;

        if (Game.distanceTo([rayX, rayY], nearX) < Game.distanceTo([rayX, rayY], nearY)) {
          // hits side of box
          rayX = nearX[0];
          rayY = nearX[1];
          
          if (cos < 0) { // facing left
            mapX = Math.floor(rayX / Game.mapConfig.blockSize) - 1;
            mapY = Math.floor(rayY / Game.mapConfig.blockSize);
          } else { // facing right
            mapX = Math.floor(rayX / Game.mapConfig.blockSize);
            mapY = Math.floor(rayY / Game.mapConfig.blockSize);
          }
        } else {
          // hits top/bottom of box
          rayX = nearY[0];
          rayY = nearY[1];

          if (sin < 0) { // facing down
            mapX = Math.floor(rayX / Game.mapConfig.blockSize);
            mapY = Math.floor(rayY / Game.mapConfig.blockSize) - 1;
          } else { // facing up
            mapX = Math.floor(rayX / Game.mapConfig.blockSize);
            mapY = Math.floor(rayY / Game.mapConfig.blockSize);
          }
        }

        if (Game.checkSolid(mapY, mapX)) {
          hitWall = true;
          var distance = Math.sqrt(Math.pow(rayX - Game.player.x, 2) + Math.pow(rayY - Game.player.y, 2));
          Game.rays.distances[i] = [distance, Game.map.data[mapY][mapX]];
          // Game.rays.zmatrix[i] = [distance, Game.map.data[mapY][mapX], i];
          Game.rays.points.push([rayX, rayY, true]);
          break;
        }
        Game.rays.points.push([rayX, rayY, false]);
      }

      Game.rays.dev[i] = [rayX, rayY];

      if (!hitWall) {
        Game.rays.distances[i] = [Infinity, " "];
      }
    }
    // Game.rays.zmatrix.sort((a,b)=>a-b);
  },
  logic: function () {
    var frameBuffer = Date.now();

    for (var i in Game.activeKeys) {
      if (Game.activeKeys[i] && typeof (Game.keyBindings[i]) == "function") Game.keyBindings[i]();
    }

    Game.getDistances();

    setTimeout(function () {
      Game.logic();
    }, (1000 / 60) - (Date.now() - frameBuffer));
  },
  drawWalls: function() {
    var columnWidth = scene.width / Game.rays.quantity;
    for (var i = 0; i < Game.rays.quantity; i++) {
      var distance = Game.rays.distances[i][0] * Math.cos(Game.toRad(((Game.rays.fov / Game.rays.quantity) * i) - (Game.rays.fov / 2)));
      var tile = Game.rays.distances[i][1];

      var wallHeight = (64 / distance * 277);
      var wallTop = (scene.height / 2) - (wallHeight / 2) - (wallHeight  * (Game.map.info[tile].height - 1));
      wallHeight *= Game.map.info[tile].height
      var columnX = i * columnWidth;

      // get wall color
      var r = Game.map.info[tile].color.r - distance * 0.5;
      var g = Game.map.info[tile].color.g - distance * 0.5;
      var b = Game.map.info[tile].color.b - distance * 0.5;
      var a = (1000 - distance * 0.5) / 1000;

      // draw the column
      cctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
      cctx.fillRect(columnX, wallTop, columnWidth, wallHeight);
    }
  },
  gradient: function(dimensions, a, b, stop1, stop2, context) {
    var grd = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
    grd.addColorStop(0, stop1);
    grd.addColorStop(1, stop2);
    
    // Fill with gradient
    context.fillStyle = grd;
    context.fillRect(dimensions[0], dimensions[1], dimensions[2], dimensions[3]);
  },
  render: function() {
    var frameBuffer = Date.now();
    ctx.clearRect(0, 0, scene.width, scene.height);
    cctx.clearRect(0, 0, canvas.width, canvas.height);

    // map
    for (var i = 0; i < Game.map.data.length; i++) {
      for (var j = 0; j < Game.map.data[i].length; j++) {
        if (Game.map.data[j] == undefined || Game.map.data[j][i] == undefined) continue;
        var tile = Game.map.data[j][i];
        var r = Game.map.info[tile].color.r;
        var g = Game.map.info[tile].color.g;
        var b = Game.map.info[tile].color.b;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(i * Game.mapConfig.blockSize, j * Game.mapConfig.blockSize, Game.mapConfig.blockSize, Game.mapConfig.blockSize);
      }
    }
    for (var i in Game.entities) {
      Game.circle(Game.entities[i].x, Game.entities[i].y, 5, "yellow");
    }

    Game.drawRay(Game.player.x, Game.player.y, Game.player.angle, 500, "green");
    Game.circle(Game.player.x, Game.player.y, Game.player.width / 2, "red");

    //rays
    for (var i = 0; i < Game.rays.quantity; i++) {
      // var angle = (Game.player.angle - (Game.rays.fov / 2)) + ((Game.rays.fov / Game.rays.quantity) * i);
      // Game.drawRay(Game.player.x, Game.player.y, angle, Game.rays.distances[i][0], "rgba(0, 200, 0, 0.2)");
      ctx.strokeStyle = "rgba(0, 200, 0, 0.2)";
      ctx.beginPath();
      ctx.moveTo(Game.player.x, Game.player.y);
      ctx.lineTo(Game.rays.dev[i][0], Game.rays.dev[i][1]);
      ctx.stroke();
    }

    //dev points
    for (var i in Game.rays.points) {
      var color = "red";
      if (Game.rays.points[i][2]) color = "yellow";
      Game.circle(Game.rays.points[i][0], Game.rays.points[i][1], 1, color);
    }

    // Game.gradient([0, 0, canvas.width, canvas.height], [0, 0], [0, canvas.height], "#aeaeae", "#000000", cctx);
    Game.drawWalls();

    Game.circle(Game.mapConfig.blockSize*1.5,Game.mapConfig.blockSize, "yellow");

    Game.getSpriteCoord(Game.entities[0]);



    setTimeout(function () {
      Game.render();
    }, (1000 / 60) - (Date.now() - frameBuffer));
  },
  keyBindings: {
    37: () => { Game.player.turn(0) },
    39: () => { Game.player.turn(1) },
    87: () => { Game.player.move(0) },
    38: () => { Game.player.move(0) },
    68: () => { Game.player.move(1) },
    83: () => { Game.player.move(2) },
    40: () => { Game.player.move(2) },
    65: () => { Game.player.move(3) }
  },
  activeKeys: [],
  init: function () {
    window.addEventListener("keydown", (event) => { Game.activeKeys[event.keyCode] = true });
    window.addEventListener("keyup", (event) => { Game.activeKeys[event.keyCode] = false });
    Game.logic();
    Game.render();
  }
}