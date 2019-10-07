let input, button;
let userName = "You";
let viewers = 0;
let chatWidth = 400;
let choices = [];
var choisesMade = 0;
let messages = [];
let canvasFunctions= [];
let isTyping = false;
let isHoveringA = false;
let isHoveringB = false;
let isHoveringC = false;

function preload() {
  // load any assets (images, sounds etc.) here
  instantiateChoices();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // setup input field properties
  input = createInput();
  input.style('width: 350px');
  input.style('font-size: 25px');
  input.style('font-family: "Trebuchet MS", Helvetica, sans-serif');
  input.style('background-color: #191919');
  input.style('border-color: #646464');

  // setup button properties
  button = createButton('▶');
  button.style('width: 50px');
  button.style('font-size: 25px');
  button.style('background-color: #191919');
  button.style('border-color: #646464');
  button.style('color: #c8c8c8');
  button.mousePressed(writeMessage);

  newMessage("hello", 1, false);
  newMessage("hello??", 1, false);
  newMessage("wow", 1, false);

  canvasFunctions.push();
}

function draw() {
  displayBackUI();
  displayCanvas(canvasFunctions);
  checkHover();
  displayMessages(messages);
  displayChoices(choisesMade);
  displayFrontUI();

  makeChoice(0, 2);
}

function displayBackUI() {
  fill(0);
  rect(0, 0, windowWidth, windowHeight);

  fill(25, 100);
  stroke(100);
  rect(windowWidth-chatWidth, 0, windowWidth, windowHeight);
  rect(0, 0, windowWidth-chatWidth, 70);
  rect(0, windowHeight-70, windowWidth-chatWidth, 70);
  noStroke();
}

function displayFrontUI() {
  stroke(100);
  fill(100);
  line(windowWidth-chatWidth, windowHeight-36, windowWidth, windowHeight-36);
  line(0, 70, windowWidth-chatWidth, 70);
  line(0, windowHeight-70, windowWidth-chatWidth, windowHeight-70);
  line(195, 0, 195, 70);
  line(windowWidth-chatWidth-195, 0, windowWidth-chatWidth-195, 70);
  line((windowWidth-chatWidth)/3, windowHeight-70, (windowWidth-chatWidth)/3, windowHeight);
  line(2*(windowWidth-chatWidth)/3, windowHeight-70, 2*(windowWidth-chatWidth)/3, windowHeight);

  fill(200);
  noStroke();
  textFont('Trebuchet MS');
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(50);
  if (userName == "You")
    text(userName+" are Streaming LIVE", 195+(windowWidth - chatWidth - 390)/2, 50);
  else
    text(userName+" is Streaming LIVE", 220, 50);
  
  
  textStyle(NORMAL);
  textSize(25);
  text(viewers + "\nWatching Now", windowWidth - chatWidth - 100, 25);
  textAlign(LEFT);

  input.position(windowWidth - chatWidth + 1, windowHeight - 35);
  button.position(input.x+350, input.y);
  
  // if text box is empty or user is pressing escape,
  // display a prompt in the text box.
  // don't allow the user to delete the prompt
  if (input.value().length == 0 ||
    keyIsDown(ESCAPE) ||
    (!isTyping && 
    (keyIsDown(BACKSPACE) || keyIsDown(DELETE))))
    stopTyping();
}

function displayCanvas(f) {
  canvasWidth = windowWidth - chatWidth;
  canvasHeight = windowHeight - 140;
  for (i = 0; i < f.length; i++) {
    f[i]();
  }
}

function newChoice(t, i, f) {
  let choice = {
    text : t,
    id : i,
    function : f
  }
  return choice;
}

function instantiateChoices() {
  choices = [
    newChoice("Add a Circle", 0, function A0() {fill(255);ellipse(canvasWidth/2, canvasHeight/2+70, 100);}),
    newChoice("Add a Square", 1, function A1() {fill(255);rect(canvasWidth/2-50, canvasHeight/2+20, 100, 100);}),    
    newChoice("Add a Triangle", 2, function A2() {fill(255);myTriangle(canvasWidth/2, canvasHeight/2+70, 100);})
  ]
}

function makeChoice(n, id) {
  let i = n*3 + id;
  canvasFunctions.push(choices[i].function);
  //choisesMade++;
  return choices[i];
}

function writeMessage() {
  if (isTyping) {
    newMessage(input.value(), 0, true);
    stopTyping();
  }
}

function newMessage(t, e, p) {
  let today = new Date();
  let message = {
    user : "",
    text : t,
    time : "",
    isPriority : p,
    type : e // 0 - player, 1 - basic, 2 - random
  };

  switch (message.type) {
    case 0:
      message.user = userName;
      break;
    case 1:      
      message.user = "Bob";
      break;
    default:
      message.user = "Larry";
      break;
  }
  
  let tempStr = ""
  if (today.getHours() < 10)
    tempStr += "0" + today.getHours();
  else
    tempStr += today.getHours();     
  if (today.getMinutes() < 10)
    tempStr += ":0" + today.getMinutes();
  else
    tempStr += ":" + today.getMinutes();
  message.time = tempStr;

  if (messages.length*25 > windowHeight-75)
    messages.shift();
  
  messages.push(message);
  return message;
}

function displayMessages(messages) {
  let rowOffset = 0;
  noStroke();
  textFont('Trebuchet MS');
  textSize(20);
  textAlign(LEFT);
  for (i = 0; i < messages.length; i++) {
    fill(100);
    textStyle(NORMAL);
    text(messages[i].time, windowWidth - chatWidth + 10, 25*(i+rowOffset+1));
    fill(200);
    if (messages[i].type == 0)
      textStyle(BOLD);
    else
      textStyle(NORMAL);

    tempString = messages[i].user + ": " + messages[i].text;
    if (tempString.length > chatWidth/14) {
      tempString = tempString.substring(0, chatWidth/14) + "-\n" + tempString.substring(chatWidth/14, tempString.length);
      text(tempString,windowWidth - chatWidth + 70, 25*(i+rowOffset+1));
      rowOffset++;
    }
    else
      text(tempString,windowWidth - chatWidth + 70, 25*(i+rowOffset+1));
  }
  textStyle(NORMAL);
}

function displayChoices(i) {
  noStroke();
  textFont('Trebuchet MS');
  textSize(30);
  textAlign(LEFT);
  textStyle(NORMAL);
  fill(200);
  if (isHoveringA) {
    text(choices[i*3+1].text, ((windowWidth-chatWidth)/3)+25, windowHeight-25);
    text(choices[i*3+2].text, (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
    fill(255);
    text(choices[i*3].text, 25, windowHeight-25);
  }
  else if (isHoveringB) {
    text(choices[i*3].text, 25, windowHeight-25);
    text(choices[i*3+2].text, (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
    fill(255);
    text(choices[i*3+1].text, ((windowWidth-chatWidth)/3)+25, windowHeight-25);

  }
  else if (isHoveringC) {
    text(choices[i*3].text, 25, windowHeight-25);
    text(choices[i*3+1].text, ((windowWidth-chatWidth)/3)+25, windowHeight-25);
    fill(255);
    text(choices[i*3+2].text, (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
  }
  else {
    text(choices[i*3].text, 25, windowHeight-25);
    text(choices[i*3+1].text, ((windowWidth-chatWidth)/3)+25, windowHeight-25);
    text(choices[i*3+2].text, (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
  }
}

function keyPressed() {
  // don't allow the user to delete the text prompt
  if (!isTyping && 
    (keyCode === BACKSPACE || keyCode === DELETE))
    stopTyping();
  // if not typing, clear the text box and begin typing
  else if (!isTyping && 
    !(keyCode === ENTER || keyCode === RETURN)) 
    startTyping();

  // pressing enter or return will write a message
  if (keyCode === ENTER || keyCode === RETURN)
    writeMessage();
}

function checkHover() {
  if (mouseY > windowHeight - 70 && mouseX < windowWidth - chatWidth){
    if (mouseX > 2 * (windowWidth-chatWidth)/3) {
      cursor(HAND);
      isHoveringA = false;
      isHoveringB = false;
      isHoveringC = true;
      fill(100, 100);
      rect(2 * (windowWidth-chatWidth)/3, windowHeight-70, (windowWidth-chatWidth)/3, 70);
    }
    else if (mouseX > (windowWidth-chatWidth)/3) {
      cursor(HAND);
      isHoveringA = false;
      isHoveringB = true;
      isHoveringC = false;
      fill(100, 100);
      rect((windowWidth-chatWidth)/3, windowHeight-70, (windowWidth-chatWidth)/3, 70);
    }
    else {
      cursor(HAND);
      isHoveringA = true;
      isHoveringB = false;
      isHoveringC = false;
      fill(100, 100);
      rect(0, windowHeight-70, (windowWidth-chatWidth)/3, 70);
    }
  }
  else {
    cursor(ARROW);
    isHoveringA = false;
    isHoveringB = false;
    isHoveringC = false;
  }
}

function mousePressed() {
  if (isHoveringA) {
    makeChoice(choisesMade, 0);
  }
  else if (isHoveringB) {
    makeChoice(choisesMade, 1);
  }
  else if (isHoveringC) {
    makeChoice(choisesMade, 2);
  }
}

function startTyping() {
  input.style('color: #c8c8c8');
  input.value("");
  isTyping = true;
}

function stopTyping() {
  input.style('color: #646464');
  input.value("Post a message");
  isTyping = false;
}

function myTriangle(x, y, s) {
  let h = Math.sqrt((s*s) - ((s/2) * (s/2)));
  triangle(x - s/2, y + h/2, x + s/2, y + h/2, x, y - h/2);
}