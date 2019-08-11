var backgroundImage;

function preload() {
  backgroundImage = loadImage('assets/windows-xp-bliss.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // since we're going to be drawing the background image at the same size each
  // frame, we re-size it once here in setup()
  backgroundImage.resize(windowWidth, windowHeight);
}

function draw() {
  // this `image()` function call is just an example---you should change (or
  // remove) it in your submitted assignment
  image(backgroundImage, 0, 0);

  // you can keep this `drawWindow()` function call in your final sketch
  drawWindow();
}

function drawWindow() {
  // start with a "push" so that we can go back to the current drawing state
  // (e.g. fill/stroke colour) at the end of the function
  push();
  fill(230);
  noStroke();

  // the width (and height) of the window "edge"
  var edge = 50;

  // draw the background "walls"
  rect(0, 0, edge, height);
  rect(0, 0, width, edge);
  rect(0, height-edge, width, edge);
  rect(width-edge, 0, edge, height);

  // now draw the window (including bars & sill)
  stroke(130, 82, 1);
  noFill();
  strokeWeight(10);
  rect(edge, edge, width-edge*2, height-edge*2);
  line(edge, height/2, width-edge, height/2);
  line(width/2, edge, width/2, height-edge);
  fill(150, 92, 1);
  rect(0+edge/2, height-edge*1.5, width-edge, edge/2);

  // pop drawing context back to original state (i.e. when `push()` was called)
  pop();
}
