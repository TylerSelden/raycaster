window.onload = function() {
  canvas = document.getElementById("canvas");
  cctx = canvas.getContext("2d");
  scene = document.getElementById("scene");
  ctx = scene.getContext("2d");

  test();
}

function test() {
  Game.init();
}