function setup() {
  // create the canvas (800px wide, 600px high)
  createCanvas(800, 600);

  // make the text nice and big - adjust the size parameter
  // to make *your* name fit nicely on the nametag
  textSize(150);

  // draw a border to help you see the size
  // this isn't compulsory (remove this code if you like)
  strokeWeight(5);
  rect(0, 0, width, height);
}

function draw() {
  // your cool nametag code goes in this draw function

  // replace "Name" with your name!
  text("Name", 100, height-100);
}

// when you hit the spacebar, what's currently on the canvas will be saved (as a
// "nametag.png" file) to your downloads folder
function keyTyped() {
  if (key === " ") {
	saveCanvas("nametag.png");
  }
}
