/*  COMP1720 Major Assignment
*   2019 Sem 2
*   Tim James - u6947396
*/

// TODO add sounds
// TODO add additional looping choices
// TODO refine choices
// TODO endings?

// variable declaration
let fontAnonymous, input, button, player, users, viewers, displayedViewers;
let canvasWidth, canvasHeight, chatStatus, initialTime;
let greetingMsg, choiceResponseMsg, idleChoiceMsg;
let names, adjectives, nouns;
let loopChoiceA, loopChoiceB, loopChoiceC;
let playerName = "You";
let lastUser = "";
let lastMessage = "";
let currentUser = "";
let eventStatus = 0; // 0 - not active, 1 - preparing, 2 - responding
let chatWidth = 500;
let choicesMade = 0;
let prevChoice = -1;
let prevBestChoice = -1;
let timeOfLastChoice = 0;
let minMsgDelay = 75;
let maxMsgDelay = 100;
let eventDelayA = 0;
let eventDelayB = 0;
let msgRows = 0;
let prevLCB = 0;
let prevLCC = 0;
const initialViewers = 1000;
let choices = [];
let choicesLoop = [];
let messages = [];
let canvasFunctions = [];
let currentEvents = [];
let isTyping = false;
let isHoveringA = false;
let isHoveringB = false;
let isHoveringC = false;
let hasEnteredName = false;
let isChoiceLooping = false;

// canvas variables
let backgroundType = 0; // 0 : black, 1 : black, 2 : white, 3 : gray
let shapeType = 0;      // 0 : unassigned, 1 : circle, 2 : square, 3 : triangle
let colorType = 0;      // 0 : white/black, 1 : red, 2 : green, 3 : blue
let movementType = 0;   // 0 : none, 1 : scatter, 2 : path, 3 : bounce
let xDir = 10;
let yDir = 10;
let speedType = 0;      // 0 : medium, 1 : medium, 2 : slow, 3 : fast
let nextPosX, nextPosY;
let sizeType = 0;       // 0 : medium, 1 : large, 2 : small, 3 : random
let fadeType = 0;       // 0 : medium, 1 : medium, 2 : slow, 3 : fast
let colorShiftType = 0; // 0 : unassigned, 1 : none, 2 : saturation, 3 : hue
let hue, saturation;
let shapeColorR, shapeColorG, shapeColorB;
let outlineType = 0;    // 0 : none, 1 : none, 2 : normal, 3 : thick
let transType = 0;      // 0 : none, 1 : none, 2 : subtle, 3 : strong

// looping canvas variables
let sizeModifier = 0;
let bgColorModifier = 0;
let rotationModifier = 0;
let translationXModifier = 0;
let translationYModifier = 0;

function preload() {
  // load font  
  fontAnonymous = loadFont('assets/AnonymousPro-Regular.ttf');
  fontAnonymousBold = loadFont('assets/AnonymousPro-Bold.ttf');
  fontAnonymousItalics = loadFont('assets/AnonymousPro-Italics.ttf');

  // instantiate complex objects
  instantiateChoices();
  instantiateUsers();
  instantiateChatStatus();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fill(0);
  background(0);

  // setup input field properties
  input = createInput();
  input.style('width: 500px');
  input.style('font-size: 50px');
  input.style('font-family: monospace');
  input.style('background-color: #191919');
  input.style('border-color: #646464');

  // setup button properties
  button = createButton('▶');
  button.style('width: 70px');
  button.style('font-size: 50px');
  button.style('background-color: #191919');
  button.style('border-color: #646464');
  button.style('color: #c8c8c8');
  button.mousePressed(writeMessage);
  
  // setup view number properties
  viewers = initialViewers;
  displayedViewers = Math.round(random(0.98*viewers, 1.02*viewers));

  // revert if  undefined
  loopChoiceA = choicesLoop[0];
  loopChoiceB = choicesLoop[0];
  loopChoiceC = choicesLoop[0];
}

function draw() {
  // allow the user to enter their name on startup
  if (!hasEnteredName) {
    // create elements
    background(0);
    input.position(windowWidth/2-270, windowHeight/2-25);
    button.position(input.x+500, input.y);
    
    // ensure repeated keypresses are handled correctly
    if (input.value().length == 0 ||
    keyIsDown(ESCAPE) ||
    (!isTyping && 
    (keyIsDown(BACKSPACE) || keyIsDown(DELETE))))
      stopTyping();
      
    // ensure name input does not exceed max length
    if (input.value().length > 15)
      input.value(input.value().substring(0, 15));
  }
  // once user has entered their name, run as normal
  else {
    rotate(rotationModifier);
    translate(translationXModifier, translationYModifier);
    if (choicesMade > 9 && !isChoiceLooping) { // once out of choices, loop
      isChoiceLooping = true;
      generateLoopingChoices();
    }

    // display elements
    displayCanvas(canvasFunctions);
    displayBackUI();
    checkHover();
    displayMessages(messages);
    displayChoices(choicesMade);
    displayFrontUI();

    // random fluctuation in viewer count
    if (frameCount%Math.round(random(25, 50)) == 0)
      displayedViewers = Math.round(random(0.98*viewers, 1.02*viewers));
    
    // generate new chat messages in random intervals
    if (frameCount%Math.round(random(minMsgDelay, maxMsgDelay)) == 0)
      generateNextMsg();

    // after time has elapsed since a choice, add waiting messages to chat
    if (getSecondsSinceChoice() > 45)
      chatStatus.waiting = 10;      
    else
      chatStatus.waiting = 0;

    // delay before chat responds to events
    if (eventDelayA > 50 && eventStatus == 1) {
      eventStatus = 2;
      minMsgDelay = 50;
      maxMsgDelay = 75;
      eventDelayA = 0;
      respondToEvents();
    }
    else if (eventStatus == 1) {      
      eventDelayA++;
    }
    else if (eventDelayB > 50 && eventStatus == 2) {
      eventStatus = 0;
      eventDelayB = 0;
    }
    else if (eventStatus == 2) {         
      eventDelayB++;
    }
    else {
      minMsgDelay = 75;
      maxMsgDelay = 100;
    }
  }
}

/*
  Instantiation
*/

function instantiateChoices() { // create a list of possible choices, where 3 are displayed at a time
  // choice ids = 0, 1, 2 : non-looping normal, -1 : run once only, not in chat, -2 : run once only, -3 : not in chat, -4 : looping normal
  choices = [
    newChoice("keep the background \nblack", 0, 1.3, 0, function A0() {backgroundType = 1;}),
    newChoice("set a white background", 1, 1.2, 0, function A1() {backgroundType = 2;}),
    newChoice("set a gray background", 2, 1.05, 0, function A2() {backgroundType = 3;}),

    newChoice("add a circle", 0, 1.1, 0, function B0() {shapeType = 1;}),
    newChoice("add a square", 1, 0.95, 0, function B1() {shapeType = 2;}),   
    newChoice("add a triangle", 2, 1.5, 0, function B2() {shapeType = 3;}),

    newChoice("make the shape red", 0, 1.2, 0, function C0() {colorType = 1;}),
    newChoice("make the shape green", 1, 1.1, 0, function C1() {colorType = 2;}),    
    newChoice("make the shape blue", 2, 0.9, 0, function C2() {colorType = 3;}), 

    newChoice("scatter the shapes", 0, 0.7, 0, function D0() {movementType = 1;}),
    newChoice("move shapes in a path", 1, 1.1, 0, function D1() {movementType = 2;}),    
    newChoice("make shapes bounce", 2, 0.9, 0, function D2() {movementType = 3;}),

    newChoice("keep the colours \nthe same", 0, 0.8, 0, function E0() {colorShiftType = 1;}),
    newChoice("add a saturation \ncycle", 1, 1.1, 0, function E1() {colorShiftType = 2;}),
    newChoice("add a hue cycle", 2, 1.4, 0, function E2() {colorShiftType = 3;}),

    newChoice("keep the speed \nthe same", 0, 1.05, 0, function F0() {speedType = 1;}),
    newChoice("make the speed \nslower", 1, 0.6, 0, function F1() {speedType = 2;}),    
    newChoice("make the speed \nfaster", 2, 1.1, 0, function F2() {speedType = 3;}),

    newChoice("make the shape \nlarger", 0, 1.6, 0, function G0() {sizeType = 1;}),
    newChoice("make the shape \nsmaller", 1, 1.2, 0, function G1() {sizeType = 2;}),
    newChoice("scale the shape \nrandomly", 2, 0.4, 0, function G2() {sizeType = 3;}),

    newChoice("keep a medium fade", 0, 1.1, 0, function H0() {fadeType = 1;}),
    newChoice("make the fade slower", 1, 1.7, 0, function H1() {fadeType = 2;}),
    newChoice("make the fade faster", 2, 0.3, 0, function H2() {fadeType = 3;}),

    newChoice("keep the effect the\n same", 0, 1.2, 0, function I0() {outlineType = 1;}),
    newChoice("add a outline effect", 1, 0.8, 0, function I1() {outlineType = 2;}),
    newChoice("add a thick outline \neffect", 2, 1.5, 0, function I2() {outlineType = 3;}),

    newChoice("keep the effect the \nsame", 0, 0.6, 0, function J0() {transType = 1;}),
    newChoice("add subtle transparency", 1, 1.8, 0, function J1() {transType = 2;}),
    newChoice("add strong transparency", 2, 1.3, 0, function J2() {transType = 3;})
  ]

  choicesLoop = [    
    newChoice("keep things the \nsame", 0, 1, 1, function S() {}),
    newChoice("add a random \ncircle", -2, 1.1, 1, function L0() {
      fill(random(0,255), random(0,255), random(0,255));
      ellipse(random(10, canvasWidth-10), random(80, canvasHeight-10), random(50,200));}),
    newChoice("add a random \nsquare", -2, 0.95, 1, function L1() {
      fill(random(0,255), random(0,255), random(0,255));
      rect(random(10, canvasWidth-10), random(80, canvasHeight-10), random(50,200), random(50,200));}),
    newChoice("add a random \ntriangle", -2, 0.8, 1, function L2() {
      fill(random(0,255), random(0,255), random(0,255));
      myTriangle(random(10, canvasWidth-10), random(80, canvasHeight-10), random(50,200));}),
    newChoice("increase shape size", -2, 1.5, 1, function L3() {sizeModifier += 40;}),
    newChoice("decrease shape size", -2, 0.6, 1, function L4() {sizeModifier -= 40;}),
    newChoice("make the background \ndarker", -2, 1.1, 1, function L5() {bgColorModifier -= 50;}),
    newChoice("make the background \nlighter", -2, 0.7, 1, function L6() {bgColorModifier += 50;}),
    newChoice("randomize everything", -2, 0.7, 1, function L7() {
      backgroundType = Math.round(random(1,3)); shapeType = Math.round(random(1,3)); colorType = Math.round(random(1,3)); movementType = Math.round(random(1,3)); 
      speedType = Math.round(random(1,3)); sizeType = Math.round(random(1,3)); fadeType = Math.round(random(1,3)); colorShiftType = Math.round(random(1,3)); 
      outlineType = Math.round(random(1,3)); transType = Math.round(random(1,3));}),
    newChoice("constantly randomize everything", -4, 0.7, 1, function L7() {
      shapeType = Math.round(random(1,3)); colorType = Math.round(random(1,3)); movementType = Math.round(random(1,3)); 
      speedType = Math.round(random(1,3)); sizeType = Math.round(random(1,3)); fadeType = Math.round(random(1,3)); colorShiftType = Math.round(random(1,3)); 
      outlineType = Math.round(random(1,3)); transType = Math.round(random(1,3));}),
    newChoice("pick this choice", -1, 1.25, 1, function Z0() {}),
    newChoice("don't pick this \nchoice", -1, 0.75, 1, function Z1() {}),
    newChoice("rotate everything", -1, 0.75, 1, function Z2() {rotationModifier += (random(-0.01, 0.01));reloadBG();}),
    newChoice("translate everything", -1, 0.75, 1, function Z2() {translationXModifier += random(-5,5); translationYModifier += random(-5,5);reloadBG();}),
    newChoice("randomly change \nyour name", -1, 0.5, 1, function Z3() {playerName = generateName();}),
    newChoice("say \"hi\" in \nchat", -1, 1.5, 1, function Z4() {addMessage(newMessage("", "Hi!", 0));}),
    newChoice("say \"hi\" in \nchat", -1, 0.5, 1, function Z4() {addMessage(newMessage("", "I didn't choose this.", 0));}),
    newChoice("kick a member of \nchat", -1, 0.5, 1, function Z5() {addMessage(newMessage("", "User @"+generateName()+" has been kicked from the chat", 1));}),
    newChoice("add a moderator to \nchat", -1, 0.75, 1, function Z6() {addMessage(newMessage("", "Moderator @"+generateName()+" has joined the chat", 1));}),
    newChoice("make the chat smaller", -1, 0.25, 1, function Z7() {chatWidth -= 10;}),
    newChoice("make the chat larger", -1, 2, 1, function Z8() {chatWidth += 10;})
  ]
}

function instantiateUsers() { // create a list of all identified users
  names = [
    "Noah",
    "William",
    "James",
    "Oliver",
    "Benjamin",
    "Elijah",
    "Lucas",
    "Mason",
    "Logan",
    "Alexander",
    "Ethan",
    "Jacob",
    "Michael",
    "Daniel",
    "Henry",
    "Jackson",
    "Sebastian",
    "Aiden",
    "Matthew",
    "Samuel",
    "David",
    "Joseph",
    "Carter",
    "Owen",
    "Wyatt",
    "John",
    "Jack",
    "Luke",
    "Jayden",
    "Dylan",
    "Grayson",
    "Levi",
    "Isaac",
    "Gabriel",
    "Julian",
    "Mateo",
    "Anthony",
    "Jaxon",
    "Lincoln",
    "Joshua",
    "Christopher",
    "Andrew",
    "Theodore",
    "Caleb",
    "Ryan",
    "Emma",
    "Olivia",
    "Ava",
    "Isabella",
    "Sophia",
    "Charlotte",
    "Mia",
    "Amelia",
    "Harper",
    "Evelyn",
    "Abigail",
    "Emily",
    "Elizabeth",
    "Mila",
    "Ella",
    "Avery",
    "Sofia",
    "Camila",
    "Aria",
    "Scarlett",
    "Victoria",
    "Madison",
    "Luna",
    "Grace",
    "Chloe",
    "Penelope",
    "Layla",
    "Riley",
    "Zoey",
    "Nora",
    "Lily",
    "Eleanor",
    "Hannah",
    "Lillian",
    "Addison",
    "Aubrey"
  ];
  adjectives = [
    "Painful",
    "Broken",
    "Metal",
    "Deep",
    "Cultured",
    "Superior",
    "Intellectual",
    "Foregoing",
    "White",
    "Mellow",
    "Unhealthy",
    "Jazzy",
    "Mammoth",
    "Overrated",
    "Stingy",
    "Royal",
    "Reakable",
    "Absolute",
    "Piquant",
    "Charming",
    "Revived",
    "Living",
    "Ten",
    "Waiting",
    "Spotted",
    "Tidy",
    "Nifty",
    "Sordid",
    "Round",
    "Awful",
    "Aback",
    "Nervous",
    "Shaky",
    "Chief",
    "Plucky",
    "Happy",
    "Red",
    "Green",
    "Blue",
    "Orange",
    "Purple",
    "Silver",
    "Gold",
    "Nice",
    "Mad",
    "Hot",
    "Pure",
    "Tall",
    "Ugly",
    "Huge",
    "Old",
    "Odd",
    "Hungry",
    "Basic",
    "Angry",
    "Wooden",
    "Sudden",
    "Cute",
    "Severe",
    "Afraid",
    "Mental",
    "Boring",
    "Alive",
    "Hungry",
    "Inner",
    "Explosive"
  ];
  nouns = [
    "Shadow",
    "Needle",
    "Poison",
    "Spiders",
    "River",
    "Ocean",
    "Mountain",
    "Island",
    "Potato",
    "Pickle",
    "Brother",
    "Plant",
    "Expert",
    "Spoon",
    "Marble",
    "Bear",
    "Smoke",
    "Fire",
    "Storm",
    "Dragon",
    "Lizard",
    "Bird",
    "Fish",
    "Squid",
    "Machine",
    "Robot",
    "Dinosaur",
    "Insect",
    "Monkey",
    "Guy",
    "Pancake",
    "Toothpaste",
    "Knee",
    "Fridge",
    "Ear",
    "Idea",
    "Singer",
    "Death",
    "Hall",
    "Tooth",
    "Hat",
    "Piano",
    "Pie",
    "Guitar",
    "Ladder",
    "Basket",
    "Error",
    "Cookie",
    "Glitch",
    "Unit",
    "Thing",
    "Snakes",
    "Egg",
    "Cactus",
    "Cat",
    "Sheep",
    "Quartz",
    "Tiger",
    "Feather",
    "Winter",
    "Rake",
    "Hydrant",
    "Ants",
    "Cobweb"

  ];

  // assign names and status to users
  if (Math.random() >= 0.5) { // hi lecturers :)
    users = {
      complementer : newUser("Ben_Swift", true),
      pretentious : newUser(generateSName(1, false, false, false), true),
      critic : newUser("Tony_Curran", true),
      edgy : newUser(generateSName(2, false, false, true), true)
    };
  }
  else {
    users = {
      complementer : newUser("Tony_Curran", true),
      pretentious : newUser(generateSName(1, false, false, false), true),
      critic : newUser("Ben_Swift", true),
      edgy : newUser(generateSName(2, false, false, true), true)
    };
  }
}

function instantiateChatStatus() { // create a list of chat status properties
  chatStatus = {
    idle : 2,
    greeting : 300,
    greetingAcc : 0,
    waiting : 0,
    nextChoice : 2,
    choiceResponse : 0,
    choiceResponseAcc : 0,
    playerMsgResponse : 0,
    playerMsgResponseAcc : 0,
    sequence : 0,
    sequenceAcc : 0
  }
}

function instantiateChatMessages() { // create lists of different chat messages
  greetingMsg = [
    newMessage(users.critic.name, "Finally caught one of these live", 4),
    newMessage(users.complementer.name, "Very excited to see what @"+playerName+" pulls off here!", 4),
    newMessage(users.edgy.name, "Meh live art sessions aren't really my thing", 4),    
    newMessage(users.pretentious.name, "I wonder if @"+playerName+" will be any good", 4)
  ];
  choiceResponseMsg = [
    newMessage(users.critic.name, "An interesting decision", 4),
    newMessage(users.pretentious.name, "A unique process on display here", 4),
    newMessage(users.complementer.name, "I like where @"+playerName+" is taking this", 4),
    newMessage(users.edgy.name, "Honestly just make the colors darker", 4)
  ];
  idleMsg = [
    newMessage(users.critic.name, "Is @"+playerName+" even an artist?", 4),
    newMessage(users.critic.name, "I wonder how I should rate this experience...", 4),
    newMessage(users.critic.name, "I think this deserves the highest possible rating", 4),
    newMessage(users.complementer.name, "As a university lecturer, I'm quite impressed", 4),
    newMessage(users.complementer.name, "I heard this guy got a degree at ANU", 4),
    newMessage(users.pretentious.name, "Maybe incorporate some Daniel Mullins influence?", 4), // easter egg: developer of 'The Hex' and 'Pony Island'
    newMessage(users.pretentious.name, "This encapsulates the sublime effortlessly", 4),
    newMessage(users.pretentious.name, "They're using Javascript?? Why?", 4),
    newMessage(users.pretentious.name, "Surprised @"+playerName+" is using p5.js", 4),
    newMessage(users.pretentious.name, "I wonder if this will be in an exhibition", 4),
    newMessage(users.critic.name, "I have yet to be impressed", 4),
    newMessage(users.critic.name, "I will be giving this a 7/10, read my review online", 4),
    newMessage(users.complementer.name, "I think @"+playerName+" is an genuis", 4),
    newMessage(users.complementer.name, "@"+playerName+" is a true modern artist", 4),
    newMessage(users.complementer.name, "Tim James is an amazing programmer", 4), // :)
    newMessage(users.edgy.name, "I find the essential unreality of meaning interesting", 4),
    newMessage(users.edgy.name, "There is an inner darkness in this", 4),
    newMessage(users.edgy.name, "This place is as toxic as twitch chat", 4),
    newMessage(users.edgy.name, "Who is making the choices?", 4),
    newMessage(users.edgy.name, "Its like the Stanley Parable", 4), // easter egg
    newMessage(users.edgy.name, "This website has really bad design...", 4),
    newMessage(users.edgy.name, "Who wrote the code for this? Long messages are not processed well at all!!!", 4),
    newMessage(users.edgy.name, "It feels like @"+playerName+" has limited choices", 4),
    newMessage(users.edgy.name, "IS ANYONE HERE REAL?!", 4),
    newMessage(users.edgy.name, "I THINK THIS IS ALL FAKE!", 4),
    newMessage(users.edgy.name, "IS THIS EVEN LIVE?!", 4),
    newMessage(users.edgy.name, "HOW DO I GET OUT OF HERE???", 4),
    newMessage(users.pretentious.name, "I'm sensing some Davey Wreden influence in this", 4), // easter egg: developer of 'The Beginners Guide' and 'The Stanley Parable'
    newMessage(users.pretentious.name, "Is thier name really @"+playerName+"?", 4),
    newMessage(users.pretentious.name, "Reminds me of Kyle Seeley's work.", 4), // easter egg: developer of 'Emily is Away'
    newMessage(users.pretentious.name, "Maybe incorporate some Daniel Mullins influence?", 4) // easter egg: developer of 'The Hex' and 'Pony Island'
  ];
}

function startStreaming() { // setup in preparation for streaming
  input.style('width: 450px');
  input.style('font-size: 25px');
  button.style('width: 50px');
  button.style('font-size: 25px');
  player = newUser(playerName, true);
  hasEnteredName = true;
  initialTime = new Date();
  instantiateChatMessages();
  addMessage(newMessage("", "Live Chat has Started", 1));

  if (Math.random() >= 0.5) { // hi tutors :)
    addMessage(newMessage("Harrison_Shoebridge", "Hello!", 4));
    addMessage(newMessage("Rohan_Proctor", "Hi @"+playerName, 4));
  }
  else {
    addMessage(newMessage("Rohan_Proctor", "Hello!", 4));
    addMessage(newMessage("Harrison_Shoebridge", "Hi @"+playerName, 4));
  }
}

/*
  Events
*/

function generateNextMsg() { // decide what message to add to chat, based on current events
  let totalValues = chatStatus.playerMsgResponse + chatStatus.choiceResponse + chatStatus.greeting 
    + chatStatus.waiting + chatStatus.nextChoice + chatStatus.idle ;
  let randomValue = random(0, totalValues);

  // respond to input from the user
  if (randomValue < chatStatus.playerMsgResponse) { 
    generatePlayerMsgResponse();

    // decay chance
    chatStatus.playerMsgResponse = chatStatus.playerMsgResponse*0.75;
    if (chatStatus.playerMsgResponseAcc > 2) {
      chatStatus.playerMsgResponse = 0;
      chatStatus.playerMsgResponseAcc = 0;
    }
    else
      chatStatus.playerMsgResponseAcc++;
  }
  // respond to choices from the user
  else if (randomValue < chatStatus.playerMsgResponse + chatStatus.choiceResponse) {
    generateChoiceResponse();

    // decay chance
    chatStatus.choiceResponse = chatStatus.choiceResponse*0.75;
    if (chatStatus.choiceResponseAcc > 6) {
      chatStatus.choiceResponse = 0;
      chatStatus.choiceResponseAcc = 0;
    }
    else
      chatStatus.choiceResponseAcc++;
  }
  // greeting on startup
  else if (randomValue < chatStatus.playerMsgResponse + 
    chatStatus.choiceResponse + chatStatus.greeting) {
    generateGreetingMsg();

    // decay chance
    chatStatus.greeting = chatStatus.greeting*0.8;
    if (chatStatus.greetingAcc > 14) {
      chatStatus.greeting = 0;
      chatStatus.greetingAcc = 0;
      chatStatus.idle = 15;
      chatStatus.nextChoice = 30;
    }
    else
      chatStatus.greetingAcc++;
  }
  // waiting if no choices are made for a while
  else if (randomValue < chatStatus.playerMsgResponse + chatStatus.choiceResponse + 
    chatStatus.greeting + chatStatus.waiting) { 
      generateWaitingMsg();
  }
  // make comments on the current choice
  else if (randomValue < chatStatus.playerMsgResponse + chatStatus.choiceResponse + 
    chatStatus.greeting + chatStatus.waiting + chatStatus.nextChoice) { 
      generateNextChoiceMsg();
  }
  // revert to idle messages if no other options are made
  else {
    generateIdleMsg();
  }
}

function generateGreetingMsg() { // randomly generate a greeting
  if (greetingMsg.length != 0) {
    let r = Math.round(random(0, greetingMsg.length - 1));
    addMessage(greetingMsg[r]);
    greetingMsg.splice(r, 1);
  }
  else {
    let r1 = Math.round(random(0, 6));
    let apnd = "";
    switch (r1) {
      case 0:
        apnd = " all";
        break;
      case 1:
        apnd = " chat";
        break;
      case 2:
        apnd = " everyone";
        break;
      case 3:
        apnd = " @" + playerName;
        break;
      case 4:
        if (Math.random() >= 0.5) 
          apnd = " @" + lastUser;
        else if (Math.random() >= 0.5)
          apnd = " @" + users.pretentious.name;        
        else if (Math.random() >= 0.5)
          apnd = " @" + users.critic.name;
        else
          apnd = " @" + users.complementer.name;
        break;
      default:
        apnd = "";
        break;
    }

    let r2 = Math.round(random(0, 8));
    switch(r2) {
      case 0:
        addMessage(newMessage(generateName(), "Hi"+apnd, 2));
        break;
      case 1:
        addMessage(newMessage(generateName(), "Hey"+apnd, 2));
        break;
      case 2:
        addMessage(newMessage(generateName(), "Hi"+apnd+" :)", 4));
        break;
      case 3:
        addMessage(newMessage(generateName(), "Ey"+apnd, 2));
        break;
      case 4:
        addMessage(newMessage(generateName(), "Whats up"+apnd, 3));
        break;
      case 5:
        addMessage(newMessage(generateName(), "How is everyone?", 2));
        break;
      case 6:
        addMessage(newMessage(generateName(), "Hullo"+apnd, 2));
        break;
      default:
        addMessage(newMessage(generateName(), "Hello"+apnd, 3));
        break;
    }
  }
}

function generateIdleMsg() { // randomly generate an idle message
  let r;
  if (idleMsg.length != 0 && (Math.random() >= 0.5)) {
    r = Math.round(random(0, idleMsg.length - 1));
    addMessage(idleMsg[r]);
    idleMsg.splice(r, 1);
  }
  else if (Math.random() >= 0.85) { // artistic nonesense
    r = Math.round(random(0, 4));
    switch(r) {
      case 0:
        addMessage(newMessage(generateName(), "A fascinating display of traditional ideology", 4));
        break;
      case 1:
        addMessage(newMessage(generateName(), "This is a testament to the inaccuracies of our era", 4));
        break;
      case 2:
        addMessage(newMessage(generateName(), "Gives a clue to the darkness of our future", 4));
        break;
      case 3:
        addMessage(newMessage(generateName(), "Creates synergies from traditional and modern layers", 4));
        break;
      default:
        addMessage(newMessage(generateName(), "This gives a sense of nihilism and inevitability", 4));
        break;
    }
  }
  else {
    if (viewers > initialViewers*1.5) { // happy
      r = Math.round(random(0, 18));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Interested to see what happens next", 4));
          break;
        case 1:
          addMessage(newMessage(generateName(), "This is looking great", 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "Very nice", 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "Impressive", 2));
          break;        
        case 4:
          addMessage(newMessage(generateName(), "Very nice", 2));
          break;        
        case 5:
          addMessage(newMessage(generateName(), "Wish I had this kind of talent", 2));
          break;        
        case 6:
          addMessage(newMessage(generateName(), "Really cool", 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), "Unique", 2));
          break;
        case 8:
          addMessage(newMessage(generateName(), "Really says something about the world", 2));
          break;
        case 9:
          addMessage(newMessage(generateName(), "Very nice", 2));
          break;
        case 10:
          addMessage(newMessage(generateName(), "A true artist", 2));
          break;
        case 11:
          addMessage(newMessage(generateName(), "@"+playerName+" is a genuis", 2));
          break;
        case 12:
          addMessage(newMessage(generateName(), "@"+playerName+" has talent", 2));
          break;
        case 13:
          addMessage(newMessage(generateName(), "I would actually pay money for this", 2));
          break;
        case 14:
            if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "I'll be right back, hope I don't miss anything", 2));
            else if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "Be Right Back", 2));
            else if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "Gonna head off", 2));
            else
              addMessage(newMessage(generateName(), "brb", 2));          
          break;
        case 15:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Hey its @"+lastUser, 3));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "I agree @"+lastUser, 2));
          else
            addMessage(newMessage(generateName(), "For sure @"+lastUser, 3));
          break;      
        case 16:
            let c = String.fromCharCode(Math.round(random(41, 127)));
            addMessage(newMessage(generateName(), c+c, 3));
            break;
        default:
          generateGreetingMsg();
          break;
      }
    }
    else if (viewers < initialViewers*0.5) { // toxic
      r = Math.round(random(0, 17));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Not much so far...", 2));
          break;
        case 1:
          addMessage(newMessage(generateName(), "Kind of underwhelmed", 3));
          break;
        case 2:
          addMessage(newMessage(generateName(), "Well this is disappointing", 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "Meh", 2));
          break;        
        case 4:
          addMessage(newMessage(generateName(), "I could do better", 2));
          break;
        case 5:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Not really into this", 2));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Not my kind of thing", 2));
          else
            addMessage(newMessage(generateName(), "Why would anyone like this?", 2));
          break;        
        case 6:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "You're wrong @"+lastUser, 3));
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "What is @"+lastUser+" even on about?", 3));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "I dunno @"+lastUser, 2));
          else
            addMessage(newMessage(generateName(), "What @"+lastUser, 3));
          break;
        case 7:
          let c = String.fromCharCode(Math.round(random(41, 127)));
          let c2 = String.fromCharCode(Math.round(random(41, 127)));
          addMessage(newMessage(generateName(), c+c2+c+c+c2, 3));
          break;
        case 8:
          addMessage(newMessage(generateName(), "Why does @"+playerName+" even bother?", 3));
          break;
        case 9:
          addMessage(newMessage(generateName(), "Is @"+playerName+" even trying?", 3));
          break;
        case 10:
          addMessage(newMessage(generateName(), "This sucks", 2));
          break;
        case 11:
          addMessage(newMessage(generateName(), "Lame", 3));
          break;
        case 12:
          addMessage(newMessage(generateName(), "What a mess", 2));
          break;
        case 13:
          addMessage(newMessage(generateName(), "I don't get it", 3));
          break;
        case 14:
          addMessage(newMessage(generateName(), "What am I looking at?", 3));
          break;
        case 15:
          addMessage(newMessage("", "User @"+generateName()+" has been kicked from the chat", 1));
          break;
        default:
          generateGreetingMsg();
          break;
      }
    }
    else { // neutral
      r = Math.round(random(0, 12));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Not much so far...", 2));
          break;
        case 1:
          addMessage(newMessage(generateName(), "Interested to see what happens next", 4));
          break;
        case 2:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Not really into this yet", 4));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Not my kind of thing", 4));
          else
            addMessage(newMessage(generateName(), "This is cool, but not my kind of thing", 4));
          break;
        case 3:
          if (getSecondsElapsed() < 60)
            addMessage(newMessage(generateName(), "Looking forward to seeing this get going", 2));
          else {
            if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "I'll be right back, hope I don't miss anything", 2));
            else if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "Be Right Back", 2));
            else if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "Think I've seen enough, goodnight everyone", 2));
            else if (Math.random() >= 0.5)
              addMessage(newMessage(generateName(), "Gonna head off", 2));
            else
              addMessage(newMessage(generateName(), "brb", 2));
          }
          break;
        case 4:
          if (getSecondsElapsed() < 60)
            addMessage(newMessage(generateName(), "@"+playerName+" is just getting started", 2));
          else
            addMessage(newMessage(generateName(), "Just give @"+playerName+" more time", 2));
          break;
        case 5:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Interesting...", 3));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Hmm", 3));
          else
            addMessage(newMessage(generateName(), "...", 3));
          break;
        case 6:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "Hey its @"+lastUser, 3));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "I dunno @"+lastUser, 2));
          else
            addMessage(newMessage(generateName(), "What @"+lastUser, 3));
          break;
        case 7:
          let c = String.fromCharCode(Math.round(random(41, 127)));
          addMessage(newMessage(generateName(), c+c, 3));
          break;
        case 8:
          if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "@"+playerName+" has what it takes", 2));
          else if (Math.random() >= 0.5)
            addMessage(newMessage(generateName(), "You got this @"+playerName, 2));
          else
            addMessage(newMessage(generateName(), "I think @"+playerName+" has potential", 2));
          break;
        case 9:
          addMessage(newMessage(generateName(), "I'm a big fan of your work @"+playerName, 4));
          break;
        case 10:
          addMessage(newMessage("", "User @"+generateName()+" has been kicked from the chat", 1));
          break;
        default:
          generateGreetingMsg();
          break;
      }
    }
  }  
}

function generatePlayerMsgResponse() { // randomly generate a message commenting on player input
  r = Math.round(random(0, 7));
  switch(r) {
    case 0:
      addMessage(newMessage(generateName(), "@"+playerName+" is talking in chat!", 2));
      break;
    case 1:
      addMessage(newMessage(generateName(), "@"+playerName+" less talking, more art", 2));
      break;
    case 2:
      addMessage(newMessage(generateName(), "@"+playerName+" get back to the art", 2));
      break;
    case 3:
      addMessage(newMessage(generateName(), "Guys, @"+playerName+" is in the chat!", 2));
      break;
    case 4:
      addMessage(newMessage(generateName(), "Looks like, @"+playerName+" is reading chat", 2));
      break;
    case 5:
      addMessage(newMessage(generateName(), "Look its @"+playerName, 2));
      break;
    default:
      addMessage(newMessage(generateName(), "Oh hey, @"+playerName, 2));
      break;
  }
}

function generateNextChoiceMsg() { // randomly generate a message about the next choice
  let r, rC, c;
  if (isChoiceLooping) {    
    rC = Math.round(random(0,2));
    if (rC == 0)
      c = loopChoiceA;
    else if (rC == 1)
      c = loopChoiceB;
    else
      c = loopChoiceC;
    
    if (c.id == -1 || c.id == -3)
      c = loopChoiceA;
  }
  else {
    rC = choicesMade*3 + Math.round(random(0,2));
    c = choices[rC];
  }
  if (viewers > initialViewers*1.5) { // happy
    if (c.vFactor > 1) { // pro
      r = Math.round(random(0, 14));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "I'd recommend "+c.text, 2));
          break;
        case 1:
          addMessage(newMessage(generateName(), "I reckon "+c.text, 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "Please "+c.text, 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), c.text+" would look good", 2));
          break;
        case 4:
          addMessage(newMessage(generateName(), "Up to you @"+playerName+" but I would "+c.text, 2));
          break;
        case 5:
          addMessage(newMessage(generateName(), c.text+" could work", 2));
          break;
        case 6:
          addMessage(newMessage(generateName(), c.text+" would complement your style", 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), c.text+" maybe?", 3));
          break;
        case 8:
          addMessage(newMessage(generateName(), c.text+" and it'd be perfect", 2));
          break;
        case 9:
          addMessage(newMessage(generateName(), "@"+lastUser+" "+c.text+" is better", 2));
          break;
        case 10:
          addMessage(newMessage(generateName(), "Hey @"+playerName+" "+c.text, 2));
          break;
        case 11:
          addMessage(newMessage(generateName(), "@"+playerName+" "+c.text, 2));
          break;
        case 12:
          addMessage(newMessage(generateName(), "@"+playerName+" you should "+c.text, 2));
          break;
        default:
          addMessage(newMessage(generateName(), c.text, 3));
          break;
      }
    }
    else { // cons
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Up to you, but maybe don't "+c.text, 3));
          break;
        case 1:
          addMessage(newMessage(generateName(), c.text+" probably wouldn't be as good", 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "@"+lastUser+" "+c.text+" might not be great", 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "@"+playerName+" don't "+c.text, 2));
          break;
        case 4:
          addMessage(newMessage(generateName(), "Looks good so far, but avoid "+c.text, 2));
          break;
        case 5:
          addMessage(newMessage(generateName(), c.text+" wouldn't be great", 2));
          break;
        case 6:
          addMessage(newMessage(generateName(), "Maybe avoid "+c.text+"?", 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), c.text+" is kind of overdone", 2));
          break;
        case 8:
          addMessage(newMessage(generateName(), c.text+" isn't amazing", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "Don't "+c.text, 2));
          break;
      }
    }
  }
  else if (viewers < initialViewers*0.5) { // toxic
    if (c.vFactor > 1) { // pro
      r = Math.round(random(0, 14));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "@"+playerName+" you better "+c.text, 2));
          break;
        case 1:
          addMessage(newMessage(generateName(), "Honestly if they don't "+c.text+"...", 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "@"+playerName+" your only option is "+c.text, 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "Its obvious, just "+c.text, 2));
          break;
        case 4:
          addMessage(newMessage(generateName(), "Its simple, just "+c.text, 2));
          break;
        case 5:
          addMessage(newMessage(generateName(), "I'll be really disappointed unless they "+c.text, 2));
          break;
        case 6:
          addMessage(newMessage(generateName(), "Obviously "+c.text+" is the better option", 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), "Just "+c.text, 2));
          break;
        case 8:
          addMessage(newMessage(generateName(), c.text+" and it'd be great", 2));
          break;
        case 9:
          addMessage(newMessage(generateName(), "@"+lastUser+" "+c.text+" is better", 2));
          break;
        case 10:
          addMessage(newMessage(generateName(), "Hey @"+playerName+" "+c.text, 2));
          break;
        case 11:
          addMessage(newMessage(generateName(), "@"+playerName+" "+c.text, 2));
          break;
        case 12:
          addMessage(newMessage(generateName(), "@"+playerName+" you should "+c.text, 2));
          break;
        default:
          addMessage(newMessage(generateName(), c.text, 3));
          break;
      }
    }
    else { // cons
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Why would anyone "+c.text+"?", 3));
          break;
        case 1:
          addMessage(newMessage(generateName(), c.text+" to ruin it", 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "@"+lastUser+" "+c.text+" sucks", 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "@"+playerName+" don't "+c.text, 2));
          break;
        case 4:
          addMessage(newMessage(generateName(), "Anything but "+c.text, 2));
          break;
        case 5:
          addMessage(newMessage(generateName(), c.text+" is the worst", 2));
          break;
        case 6:
          addMessage(newMessage(generateName(), "Only an idiot would "+c.text, 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), c.text+" would be lame", 2));
          break;
        case 8:
          addMessage(newMessage(generateName(), c.text+" is boring", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "Don't "+c.text, 2));
          break;
      }
    }
  }
  else { // neutral
    if (c.vFactor > 1) { // pro
      r = Math.round(random(0, 14));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "No, "+c.text, 2));
          break;
        case 1:
          addMessage(newMessage(generateName(), "You should "+c.text, 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "Please "+c.text, 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "You gotta "+c.text, 2));
          break;
        case 4:
          addMessage(newMessage(generateName(), "Honestly just "+c.text, 2));
          break;
        case 5:
          addMessage(newMessage(generateName(), "Why don't you "+c.text, 2));
          break;
        case 6:
          addMessage(newMessage(generateName(), "Would look better if you "+c.text, 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), "Just "+c.text, 2));
          break;
        case 8:
          addMessage(newMessage(generateName(), c.text+" and it'd be great", 2));
          break;
        case 9:
          addMessage(newMessage(generateName(), "@"+lastUser+" "+c.text+" is better", 2));
          break;
        case 10:
          addMessage(newMessage(generateName(), "Hey @"+playerName+" "+c.text, 2));
          break;
        case 11:
          addMessage(newMessage(generateName(), "@"+playerName+" "+c.text, 2));
          break;
        case 12:
          addMessage(newMessage(generateName(), "@"+playerName+" you should "+c.text, 2));
          break;
        default:
          addMessage(newMessage(generateName(), c.text, 3));
          break;
      }
    }
    else { // cons
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Why would anyone "+c.text+"?", 3));
          break;
        case 1:
          addMessage(newMessage(generateName(), c.text+" to ruin it", 2));
          break;
        case 2:
          addMessage(newMessage(generateName(), "@"+lastUser+" "+c.text+" sucks", 2));
          break;
        case 3:
          addMessage(newMessage(generateName(), "@"+playerName+" don't "+c.text, 2));
          break;
        case 4:
          addMessage(newMessage(generateName(), "Anything but "+c.text, 2));
          break;
        case 5:
          addMessage(newMessage(generateName(), c.text+" would be horrible", 2));
          break;
        case 6:
          addMessage(newMessage(generateName(), "No one whants to "+c.text, 2));
          break;
        case 7:
          addMessage(newMessage(generateName(), c.text+" would be lame", 2));
          break;
        case 8:
          addMessage(newMessage(generateName(), c.text+" is boring", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "Don't "+c.text, 2));
          break;
      }
    }
  }
}

function generateWaitingMsg() { // randomly generate a message after time has elapsed with no events
  r = Math.round(random(0, 13));
  switch(r) {
    case 0:
      addMessage(newMessage(generateName(), "Do something already!", 3));
      break;
    case 1:
      addMessage(newMessage(generateName(), "@"+playerName+" hasn't made a choice in ages", 2));
      break;
    case 2:
      addMessage(newMessage(generateName(), "Look at the bottom of the screen and do something", 2));
      break;
    case 3:
      addMessage(newMessage(generateName(), "Do something pls", 2));
      break;
    case 4:
      addMessage(newMessage(generateName(), "This is taking forever", 2));
      break;
    case 5:
      addMessage(newMessage(generateName(), "Be patient everyone", 2));
      break;
    case 6:
      addMessage(newMessage(generateName(), "I'm sure something will happen soon", 2));
      break;
    case 7:
      addMessage(newMessage(generateName(), "Give them more time", 2));
      break;
    case 8:
      addMessage(newMessage(generateName(), "Boring", 2));
      break;
    case 9:
      addMessage(newMessage(generateName(), "Make a choice already @"+playerName, 2));
      break;
    case 10:
      addMessage(newMessage(generateName(), "Is @"+playerName+" even here?", 3));
      break;
    case 11:
      addMessage(newMessage(generateName(), "This is boring, hope @"+playerName+" does something soon", 2));
      break;
    default:
      addMessage(newMessage(generateName(), "zzz", 2));
      break;
  }
}

function generateChoiceResponse() { // randomly generate a message about the last choice made 
  let r;
  if (choiceResponseMsg.length != 0 && (Math.random() >= 0.75)) {
    r = Math.round(random(0, choiceResponseMsg.length - 1));
    addMessage(choiceResponseMsg[r]);
    choiceResponseMsg.splice(r, 1);
  }
  else {    
    if (viewers > initialViewers*1.5) { // happy
      if (prevChoice.vFactor > 1) { // pro
        r = Math.round(random(0, 12));
        switch(r) {
          case 0:
            addMessage(newMessage(generateName(), prevChoice.text+" was such a great choice!", 2));
            break;
          case 1:
            addMessage(newMessage(generateName(), "They chose to "+prevChoice.text+", looks prefect", 2));
            break;
          case 2:
            addMessage(newMessage(generateName(), "Glad they decided to "+prevChoice.text, 2));
            break;
          case 3:
            addMessage(newMessage(generateName(), "Perfect, they decided to "+prevChoice.text, 2));
            break;
          case 4:
            addMessage(newMessage(generateName(), "Great, they decided to "+prevChoice.text, 2));
            break;
          case 5:
            addMessage(newMessage(generateName(), "Perfect, they decided to "+prevChoice.text, 2));
            break;          
          case 6:
            addMessage(newMessage(generateName(), "They chose to "+prevChoice.text+", looks good", 2));
            break;
          case 7:
            addMessage(newMessage(generateName(), "@"+playerName+" is a genuis", 2));
            break;
          case 7:
            addMessage(newMessage(generateName(), "Dunno how @"+playerName+" does it", 2));
            break;
          case 8:
            addMessage(newMessage(generateName(), "Looks great :)", 3));
            break;
          case 9:
            addMessage(newMessage(generateName(), "A masterpiece", 3));
            break;
          case 10:
            addMessage(newMessage(generateName(), "This is shaping up very nicely", 3));
            break;
          default:
            addMessage(newMessage(generateName(), "@"+playerName+" is incredible", 3));
            break;
        }
      }
      else { // cons
        r = Math.round(random(0, 10));
        switch(r) {
          case 0:
            addMessage(newMessage(generateName(), prevChoice.text+", an alright decision", 2));
            break;
          case 1:
            addMessage(newMessage(generateName(), prevChoice.text+", is just okay", 2));
            break;
          case 2:
            addMessage(newMessage(generateName(), "I wouldn't have chosen to "+prevChoice.text, 2));
            break;
          case 3:
            addMessage(newMessage(generateName(), "Would have prefered something else", 2));
            break; 
          case 4:
            addMessage(newMessage(generateName(),  prevBestChoice.text+" would have been better", 2));
            break;         
          case 5:
            addMessage(newMessage(generateName(),  prevBestChoice.text+" would have been preferred", 2));
            break;                  
          case 6:
            addMessage(newMessage(generateName(),  "Wish they went with "+prevBestChoice.text+" instead", 2));
            break;
          case 7:
            addMessage(newMessage(generateName(),  "Meh, I would rather you "+prevBestChoice.text, 2));
            break;
          case 8:
            addMessage(newMessage(generateName(),  "Not as great as your other decisions", 2));
            break;
          default:
            addMessage(newMessage(generateName(), "I'm sure you know what you're doing", 3));
            break;
        }     
      }
    }
    else if (viewers < initialViewers*0.5) { // toxic
      if (prevChoice.vFactor > 1) { // pro
        r = Math.round(random(0, 8));
        switch(r) {
          case 0:
            addMessage(newMessage(generateName(), prevChoice.text+", guess its the best you could do", 2));
            break;
          case 1:
            addMessage(newMessage(generateName(), prevChoice.text+", a bit better I suppose...", 2));
            break;
          case 2:
            addMessage(newMessage(generateName(), "At least choosing to "+prevChoice.text+", was better", 2));
            break;
          case 3:
            addMessage(newMessage(generateName(), "They choose to "+prevChoice.text+", thankfully", 2));
            break;
          case 4:
            addMessage(newMessage(generateName(), "Maybe it'll start to get better", 3));
            break;
          case 5:
            addMessage(newMessage(generateName(), "I like this better than the alternatives", 2));
            break;
          case 6:
            addMessage(newMessage(generateName(), "Meh", 2));
            break;
          default:
            addMessage(newMessage(generateName(), "Seems like the only way of salvaging this mess", 3));
            break;
        }      
      }
      else { // cons
        r = Math.round(random(0, 12));
        switch(r) {
          case 0:
            addMessage(newMessage(generateName(), "WHY WOULD YOU "+prevChoice.text+"?!", 3));
            break;
          case 1:
            addMessage(newMessage(generateName(), "WHY WOULD ANYONE "+prevChoice.text, 3));
            break;
          case 2:
            addMessage(newMessage(generateName(), "@"+playerName+" chose to "+prevChoice.text+", WHYYY", 3));
            break;
          case 3:
            addMessage(newMessage(generateName(), prevChoice.text+" was the worst possible decision...", 3));
            break;
          case 4:
            addMessage(newMessage(generateName(), prevChoice.text+" is really lame", 3));
            break;
          case 5:
            addMessage(newMessage(generateName(), prevBestChoice.text+" would have been so much better", 3));
            break;
          case 6:
            addMessage(newMessage(generateName(), "WHY DIDNT YOU JUST "+prevBestChoice.text, 3));
            break;
          case 7:
            addMessage(newMessage(generateName(), "OBVIOUSLY "+prevBestChoice.text+" WOULDVE BEEN BETTER THAN THIS", 3));
            break;
          case 8:
            addMessage(newMessage(generateName(), "THEY DIDNT EVEN "+prevBestChoice.text, 3));
            break;
          case 9:
            addMessage(newMessage(generateName(), "@"+playerName+" is making the WORST decisions", 3));
            break;
          case 10:
            addMessage(newMessage(generateName(), "@"+playerName+" just RUINED it", 3));
            break;
          default:
            addMessage(newMessage(generateName(), "@"+playerName+" has no idea what they're doing", 3));
            break;
        }
        
      }
    }
    else { // neutral
      if (prevChoice.vFactor > 1) { // pro
        r = Math.round(random(0, 11));
        switch(r) {
          case 0:
            addMessage(newMessage(generateName(), "They chose to "+prevChoice.text+", looks good", 2));
            break;
          case 1:
            addMessage(newMessage(generateName(), "They chose to "+prevChoice.text+", looks prefect", 2));
            break;
          case 2:
            addMessage(newMessage(generateName(), "Glad they decided to "+prevChoice.text, 2));
            break;
          case 3:
            addMessage(newMessage(generateName(), "Neat, they decided to "+prevChoice.text, 2));
            break;
          case 4:
            addMessage(newMessage(generateName(), "Great, they decided to "+prevChoice.text, 2));
            break;
          case 5:
            addMessage(newMessage(generateName(), prevChoice.text+" looks really nice", 2));
            break;          
          case 6:
            addMessage(newMessage(generateName(), "They chose to "+prevChoice.text+", looks amazing", 2));
            break;
          case 7:
            addMessage(newMessage(generateName(), "So happy they did "+prevChoice.text, 2));
            break;
          case 8:
            addMessage(newMessage(generateName(), "Looks incredible", 3));
            break;
          case 9:
            addMessage(newMessage(generateName(), "Nice", 3));
            break;
          default:
            addMessage(newMessage(generateName(), "This is shaping up nicely", 3));
            break;
        }      
      }
      else { // cons
        r = Math.round(random(0, 11));
        switch(r) {
          case 0:
            addMessage(newMessage(generateName(), "Why did they "+prevChoice.text+"?", 2));
            break;
          case 1:
            addMessage(newMessage(generateName(), "Why would anyone "+prevChoice.text+"?", 2));
            break;
          case 2:
            addMessage(newMessage(generateName(), "@"+playerName+" why would you "+prevChoice.text+"?", 2));
            break;
          case 3:
            addMessage(newMessage(generateName(),  "Since they chose to "+prevChoice.text+" it sucks now", 2));
            break;
          case 4:
            addMessage(newMessage(generateName(),  "This really isn't looking great", 2));
            break;
          case 5:
            addMessage(newMessage(generateName(),  "They should have gone with "+prevBestChoice.text+" instead", 2));
            break;
          case 6:
            addMessage(newMessage(generateName(),  prevBestChoice.text+" would have been better", 2));
            break;
          case 7:
            addMessage(newMessage(generateName(),  prevBestChoice.text+" > "+prevChoice.text, 2));
            break;
          case 8:
            addMessage(newMessage(generateName(),  prevBestChoice.text+" is better than "+prevChoice.text, 2));
            break;
          case 9:
            addMessage(newMessage(generateName(),  "Why didn't they just "+prevChoice.text+"?", 2));
            break;
          default:
            addMessage(newMessage(generateName(), "@"+playerName+" is ruining it", 3));
            break;
        }      
      }
    }
  }
}

function generateName() { // randomly generate a name
  let tempStr = generateSName(0, Math.random() >= 0.5, Math.random() >= 0.6, Math.random() >= 0.9);
  lastUser = currentUser;
  currentUser = ""+tempStr;
  return tempStr;
}

function generateSName(t, isReal, addNumber, isE) { // randomly generate a name, based on parameters
  let tempStr = "";
  let r, rA, rN, a, n;
  if (isReal) { // real name
    r = Math.round(random(0, names.length - 1));
    tempStr = names[r];
  }
  else { // combination of adjective and noun
    if (t == 1) { // pretentious
      rA = Math.round(random(4,6));
      rN = Math.round(random(4,7));
    }
    else if (t == 2) { // edgy
      rA = Math.round(random(0,3));
      rN = Math.round(random(0,3));
    }
    else {
      rA = Math.round(random(0, adjectives.length - 1));
      rN = Math.round(random(0, nouns.length - 1));
    }
    a = adjectives[rA];
    n = nouns[rN];
    
    

    // random method of concatenation
    if (Math.random() >= 0.5) {
      tempStr = a+n;
    }
    else if (Math.random() >= 0.5)
      tempStr = a+"_"+n;
    else
      tempStr = a+"-"+n;
  }

  if (addNumber) // random number at the end
    tempStr += Math.round(random(0, 999));
  
  if (isE) // edgy teenager thingo
    tempStr = "xX"+tempStr+"Xx";
  
  return tempStr;
}

function triggerEvent(f) { // handles delay and message rate after triggering an event
  eventStatus = 1;
  eventDelayA = 0;
  eventDelayB = 0;
  currentEvents.push(f);
}

function respondToEvents() { // handles current events
  for (i = 0; i < currentEvents.length; i++) {
    currentEvents[i]();
  }
  currentEvents = [];
}

function getTimeElapsed() { // gets the time elapsed since starting streaming  
  let currentTime = new Date();
  return currentTime - initialTime;
}

function getSecondsElapsed() { // gets the time elapsed since starting streaming in seconds
  return Math.floor(getTimeElapsed() / 1000);
}

function getSecondsSinceChoice() { // gets the time elapsed since a choice has been made in seconds
  return getSecondsElapsed() - timeOfLastChoice;
}

function generateLoopingChoices() { // generates a set of random choices
  let r1, r2, r3;
  // ensure choices are not the same
  r1 = 0;
  loopChoiceA = choicesLoop[r1];
  r2 = Math.round(random(0, choicesLoop.length - 1));
  while (r2 == r1 || r2 == prevLCB)
    r2 = Math.round(random(0, choicesLoop.length - 1));
  loopChoiceB = choicesLoop[r2];
  r3 = Math.round(random(0, choicesLoop.length - 1));  
  while (r3 == r2 || r3 == r1 || r3 == prevLCC)
    r3 = Math.round(random(0, choicesLoop.length - 1));
  loopChoiceC = choicesLoop[r3];
  prevLCB = r2;
  prevLCC = r3;
}

/*
 Object Functions
*/

function writeMessage() { //* handle player text input
  if (isTyping) {
    if (!hasEnteredName) { // first entry assigns the player name
      if (input.value().length > 0 && input.value() != " ") // ensure name is not empty
        playerName = input.value();
      startStreaming();
    }
    else { // other entires add a new message to the chat
      addMessage(newMessage(playerName, input.value(), 0));
      triggerEvent(function pMsg() {chatStatus.playerMsgResponse = 150;});
    }
    stopTyping();
  }
}

function makeChoice(n, id) { //* trigger events from making a choice, 
  // n is the current choice and id is the choice made (between 0 and 2)
  let i = n*3 + id;
  choicesMade++;
  prevChoice = choices[i];

  // set the prev best choice as the choice with the max value
  let max = Math.max(choices[n*3].vFactor, choices[n*3+1].vFactor, choices[n*3+2].vFactor);
  if (max == choices[n*3].vFactor)
    prevBestChoice = choices[n*3];
  else if (max == choices[n*3+1].vFactor)
    prevBestChoice = choices[n*3+1];
  else    
    prevBestChoice = choices[n*3+2];

  timeOfLastChoice = getSecondsElapsed();

  canvasFunctions.push(choices[i]);
  canvasFunctions.sort(compareChoices);

  // calculate new viewer count
  viewers = Math.round(viewers * choices[i].vFactor);
  displayedViewers = Math.round(random(0.98*viewers, 1.02*viewers));
  triggerEvent(function c() {chatStatus.choiceResponse = 200;});

  return choices[i];
}

function makeLoopingChoice(i) { // makes a loopable choice
  let c;
  if (i == 1)
    c = loopChoiceA;
  else if (i == 2)
    c = loopChoiceB;
  else
    c = loopChoiceC;

  choicesMade++;
  if (c.id == -1 || c.id == -3)
    prevChoice = newChoice("do that", 0, 1, 0, function Z() {});
  else
    prevChoice = c;

  // set the prev best choice as the choice with the max value
  let max = Math.max(loopChoiceA.vFactor, loopChoiceB.vFactor, loopChoiceC.vFactor);
  if (max == loopChoiceA.vFactor)
    prevBestChoice = loopChoiceA;
  else if (max == loopChoiceB.vFactor)
    prevBestChoice = loopChoiceB;
  else    
    prevBestChoice = loopChoiceC;

  timeOfLastChoice = getSecondsElapsed();

  canvasFunctions.push(c);
  canvasFunctions.sort(compareChoices);

  // calculate new viewer count
  viewers = Math.round(viewers * c.vFactor);
  displayedViewers = Math.round(random(0.98*viewers, 1.02*viewers));
  triggerEvent(function c() {chatStatus.choiceResponse = 200;});

  generateLoopingChoices();
  return c;
}

function addMessage(m) { // add a message to the chat
  if (m.text != lastMessage || m.type == 0) { // ensure the same message is not added twice
    lastMessage = m.text;

    if (m.type == 2 || m.type == 3) { // add random modifications to type 2 messages
      // randomly all caps
      if (Math.random() >= 0.9)
        m.text = m.text.toUpperCase();
      else {
        // randomly upper or lower case first character
        if (Math.random() >= 0.5)
          m.text = m.text[0].toUpperCase() + m.text.substring(1, m.text.length);
        else
          m.text = m.text[0].toLowerCase() + m.text.substring(1, m.text.length);
      }

      // randomly remove final character if type 3
      if (Math.random() >= 0.9 && m.type == 3) {
        m.text = m.text.substring(0, m.text.length - 1);
      }
      else {      
        // randomly stutter last letter, up to twice
        if (Math.random() >= 0.95)
          m.text += m.text[m.text.length - 1];
        if (Math.random() >= 0.95)
          m.text += m.text[m.text.length - 1];
      }

      // randomly add punctuation
      if (Math.random() >= 0.9) {
        m.text += ".";
      }
      else {
        if (Math.random() >= 0.75)
          m.text += "!";
        if (m.type == 3) {
          // randomly add question mark    
          if (Math.random() >= 0.75)
            m.text += "?";
        }
      }

      // randomly add a character to the end of the string
      if (Math.random() >= 0.95) {
        m.text += String.fromCharCode(Math.round(random(41, 127)));
      }
    }

    // max length of text
    let tempInt = (m.user + ": " + m.text).length;
    if (tempInt > chatWidth/14 + 1) {
      m.text = m.text.substring(0, 2*(chatWidth/14)-m.user.length);
      msgRows++;
    }

    // once the chat is full of messages, remove the oldest message
    if ((msgRows-1)*25 > windowHeight-160) {
      removeLastMsg();
      // remove an additional message if necessary
      if ((msgRows-1)*25 > windowHeight-160) {      
        removeLastMsg();
      }
    }
    msgRows++;

    // format time stamp
    let time = getTimeElapsed();
    let tempStr = "";
    let minutes = Math.floor(time / 60000)%60;
    let seconds = Math.floor(time / 1000)%60;
    if (minutes < 10)
      tempStr += "0" + minutes;
    else
      tempStr += minutes;     
    if (seconds < 10)
      tempStr += ":0" + seconds;
    else
      tempStr += ":" + seconds;
    m.time = tempStr;

    messages.push(m);
  }
}

function removeLastMsg() { // remove the oldest message from messages
  // reformat if removing a multi-row message
  let tempStr = messages[0].user + ": " + messages[0].text;
  if (tempStr.length > chatWidth/14+1 && !messages[0].isReduced) {
    messages[0].text = "-" + tempStr.substring(chatWidth/14, tempStr.length);
    messages[0].isReduced = true;
  }
  else
    messages.shift();

  msgRows--;
}

function compareChoices(a, b) { // compares the order of two choices
  if (a.order < b.order){
    return -1;
  }
  if (a.order > b.order){
    return 1;
  }
  return 0;
}

/*
  Create Object
*/

function newChoice(t, i, v, o, f) { // stores information about a choice
  let choice = {
    text : t,
    // 0, 1, 2 : non-looping normal, -1 : run once only, not in chat, -2 : run once only, -3 : not in chat, -4 : looping normal
    id : i, 
    vFactor : v,
    order : o,
    function : f
  }
  return choice;
}

function newUser(n, a) { // stores information about a user
  let user = {
    name : n,
    isActive : a
  }
  return user;
}

function newMessage(u, s, t) {  // stores information about a message
  let message = {
    user : "",
    text : s.replace("\n","").substring(0, 2*(chatWidth/14)-u.length),
    // the type of message determines how it is displayed.
    // general types have random variations
    // 0 - player, 1 - console, 2 - general, 3 - general w/ ?, 4 - fixed
    type : t, 
    time : "",
    isReduced : false
  };

  // process type
  switch (message.type) {
    case 0: // player messages
      message.user = playerName;
      break;
    case 1: // console messages
      message.user = "";
      break;
    default:
      message.user = u;
      break;
  };
  
  return message;
}

/*
  Display
*/

function displayMessages(messages) { // displays a list of messages in the chat window
  let rowOffset = 0;
  noStroke();
  textFont(fontAnonymous);
  textSize(20);
  textAlign(LEFT);

  // iterate across all messages
  for (i = 0; i < messages.length; i++) {
    fill(100);
    textStyle(NORMAL);
    textFont(fontAnonymous);
    text(messages[i].time, windowWidth - chatWidth + 10, 25*(i+rowOffset+1));
    fill(200);

    // different message types are displayed differently
    let tempStr;
    if (messages[i].type == 0) {
      textStyle(BOLD);
      textFont(fontAnonymousBold);
      tempStr = messages[i].user + ": " + messages[i].text;
    }
    else if (messages[i].type == 1) {
      textStyle(ITALIC);
      textFont(fontAnonymousItalics);
      tempStr = messages[i].text;
    }
    else {
      textStyle(NORMAL);
      textFont(fontAnonymous);
      tempStr = messages[i].user + ": " + messages[i].text;
    }

    // format messages that are too long
    if (tempStr.length > chatWidth/14 + 1 && !messages[i].isReduced) {
      tempStr = tempStr.substring(0, chatWidth/14) + "-\n" + tempStr.substring(chatWidth/14, tempStr.length);
      text(tempStr, windowWidth - chatWidth + 75, 25*(i+rowOffset+1));
      rowOffset++;
    }
    else
      text(tempStr,windowWidth - chatWidth + 75, 25*(i+rowOffset+1));
  }
  textFont(fontAnonymous);
  textStyle(NORMAL);
}

function displayChoices(i) { // displays the current choises
  noStroke();
  textFont('Trebuchet MS');
  textSize(20);
  textAlign(LEFT);
  textStyle(NORMAL);
  fill(200);

  if (isChoiceLooping) {
    // indicate which option is being hovered over
    if (isHoveringA) {
      text(loopChoiceB.text[0].toUpperCase() + loopChoiceB.text.substring(1, loopChoiceB.text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);
      text(loopChoiceC.text[0].toUpperCase() + loopChoiceC.text.substring(1, loopChoiceC.text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
      fill(255);
      text(loopChoiceA.text[0].toUpperCase() + loopChoiceA.text.substring(1, loopChoiceA.text.length), 10, windowHeight-40);
    }
    else if (isHoveringB) {
      text(loopChoiceA.text[0].toUpperCase() + loopChoiceA.text.substring(1, loopChoiceA.text.length), 10, windowHeight-40);
      text(loopChoiceC.text[0].toUpperCase() + loopChoiceC.text.substring(1, loopChoiceC.text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
      fill(255);
      text(loopChoiceB.text[0].toUpperCase() + loopChoiceB.text.substring(1, loopChoiceB.text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);

    }
    else if (isHoveringC) {
      text(loopChoiceA.text[0].toUpperCase() + loopChoiceA.text.substring(1, loopChoiceA.text.length), 10, windowHeight-40);
      text(loopChoiceB.text[0].toUpperCase() + loopChoiceB.text.substring(1, loopChoiceB.text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);
      fill(255);
      text(loopChoiceC.text[0].toUpperCase() + loopChoiceC.text.substring(1, loopChoiceC.text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
    }
    else {
      text(loopChoiceA.text[0].toUpperCase() + loopChoiceA.text.substring(1, loopChoiceA.text.length), 10, windowHeight-40);
      text(loopChoiceB.text[0].toUpperCase() + loopChoiceB.text.substring(1, loopChoiceB.text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);
      text(loopChoiceC.text[0].toUpperCase() + loopChoiceC.text.substring(1, loopChoiceC.text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
    }    
  }
  else {
    // indicate which option is being hovered over
    if (isHoveringA) {
      text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);
      text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
      fill(255);
      text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 10, windowHeight-40);
    }
    else if (isHoveringB) {
      text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 10, windowHeight-40);
      text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
      fill(255);
      text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);

    }
    else if (isHoveringC) {
      text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 10, windowHeight-40);
      text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);
      fill(255);
      text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
    }
    else {
      text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 10, windowHeight-40);
      text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+10, windowHeight-40);
      text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+10, windowHeight-40);
    }
  }
}

function displayCanvas(f) { // run functions that create the canvas
  canvasWidth = windowWidth - chatWidth;
  canvasHeight = windowHeight - 140;
  for (i = 0; i < f.length; i++) {
    if (f[i].id == -1 || f[i].id == -2) { // only run special choice functions once
      f[i].function();
      f.splice(i, 1);
    }
    else if (!isChoiceLooping || f[i].id == -4)
      f[i].function();
  }

  let fade;
  if (fadeType == 2)                // slower fade
    fade = 5;
  else if (fadeType == 3)           // faster fade
    fade = 50;
  else                              // medium fade
    fade = 20;

  let bgColor = 200;
  if (backgroundType == 2)          // white background
    bgColor = 200
  else if (backgroundType == 3)     // gray background
    bgColor = 50;
  else                              // black background
    bgColor = 0;

  fill(bgColor+bgColorModifier, fade);
  rect(0, 70, canvasWidth, canvasHeight);

  let spd;
  if (speedType == 2)                 // slow
    spd = 4;
  else if (speedType == 3)            // fast
    spd = 1;
  else                                // medium
    spd = 2;

  if (frameCount%spd == 0) {
    let shapeOpacity;
    if (transType == 2)               // subtle transparency
      shapeOpacity = 100;
    else if (transType == 3)          // strong transparency
      shapeOpacity = 30;
    else                              // no transparency
      shapeOpacity = 255;

    if (colorShiftType == 2) {        // saturation sine color cycle
      if (colorType == 1) 
        hue = 0;
      else if (colorType == 2)
        hue = 100;
      else
        hue = 230;
      saturation = Math.abs(sin(frameCount/80))*360;
      colorMode(HSB, 360);
      fill(hue, saturation, 300, shapeOpacity);    
      colorMode(RGB, 255);
    }
    else if (colorShiftType == 3) {    // hue sine color cycle
      hue = Math.abs(sin(frameCount/130))*360;
      saturation = 300;
      colorMode(HSB, 360);
      fill(hue, saturation, 300, shapeOpacity);  
      colorMode(RGB, 255);
    }
    else {                            // unassigned
      if (colorType == 1) {           // red        
        shapeColorR = 255;
        shapeColorG = 0;
        shapeColorB = 0;
      }
      else if (colorType == 2) {       // green
        shapeColorR = 0;
        shapeColorG = 255;
        shapeColorB = 0;
      }
      else if (colorType == 3) {       // blue
        shapeColorR = 0;
        shapeColorG = 0;
        shapeColorB = 255;
      }
      else {                           // unassigned
        if (backgroundType == 2) {
          shapeColorR = 0;
          shapeColorG = 0;
          shapeColorB = 0;
        }
        else {
          shapeColorR = 255;
          shapeColorG = 255;
          shapeColorB = 255;
        }
      }
      colorMode(RGB, 255);
      fill(shapeColorR, shapeColorG, shapeColorB, shapeOpacity);
    }

    let shapeSize = 100;
    if (sizeType == 1)              // large
      shapeSize = 150;
    else if (sizeType == 2)         // small
      shapeSize = 50;
    else if (sizeType == 3)         // random
      shapeSize = random(50,150);
    
    shapeSize += sizeModifier;

    if (movementType == 1) {        // scatter
      nextPosX = random(shapeSize/2, canvasWidth-shapeSize/2);
      nextPosY = random(70+shapeSize/2, canvasHeight);
    }
    else if (movementType == 2) {   // path
      nextPosX = (nextPosX+10)%(canvasWidth-shapeSize/2);
      nextPosY = random(70+shapeSize/2, canvasHeight);
    }
    else if (movementType == 3) {   // bounce
      nextPosX += xDir;
      if (nextPosX < shapeSize/2) {      
        xDir = random(5, 10);
        nextPosX += 2*(xDir);
      }
      else if (nextPosX > canvasWidth - shapeSize/2){      
        xDir = random(-5, -10);
        nextPosX += 2*(xDir);
      }

      nextPosY += yDir;
      if (nextPosY < 70 + shapeSize/2) {      
        yDir = random(5, 10);
        nextPosY += 2*(yDir);
      }
      else if (nextPosY > canvasHeight + 70 - shapeSize/2){      
        yDir = random(-5, -10);
        nextPosY += 2*(yDir);
      }
    }
    else {                          // unassigned
      nextPosX = canvasWidth/2;
      nextPosY = canvasHeight/2+70;    
    }

    if (outlineType == 2) {          // outline
      stroke(0);    
      strokeWeight(1);
    }
    else if (outlineType == 3) {    // thick outline
      stroke(0);
      strokeWeight(3);
    }
    else                            // no outline
      noStroke();
    
    if (shapeType == 1)             // circle
      ellipse(nextPosX, nextPosY, shapeSize);
    else if (shapeType == 2) {      // rectangle
      let shapeSize2 = shapeSize;
      if (sizeType == 3)
        shapeSize2 = random(50,150);
      rect(nextPosX-shapeSize/2, nextPosY-shapeSize/2, shapeSize, shapeSize2);
    }
    else if (shapeType == 3) {      // triangle
      if (movementType != 0 && movementType != 3) {
        if (Math.random() >= 0.5)        
          myTriangle(nextPosX, nextPosY, shapeSize);
        else
          myTriangleFlipped(nextPosX, nextPosY, shapeSize);
      }
      else
        myTriangle(nextPosX, nextPosY, shapeSize);
    }
  }

  // reset
  noStroke();
  strokeWeight(1);
}

function reloadBG() { // reload the background to remove afterimages
  let bgColor;
  if (backgroundType == 2)          // white background
    bgColor = 200
  else if (backgroundType == 3)     // gray background
    bgColor = 50;
  else                              // black background
    bgColor = 0;
  background(bgColor);
}

function displayBackUI() { // display the back layer of UI
  if (frameCount%1000 == 0) 
    reloadBG();

  fill(20);
  stroke(100);
  rect(windowWidth-chatWidth, 0, windowWidth, windowHeight);
  rect(0, 0, windowWidth-chatWidth, 70);
  rect(0, windowHeight-70, windowWidth-chatWidth, 70);
  noStroke();
}

function displayFrontUI() { // display the front layer of UI
  stroke(100);
  fill(100);
  line(windowWidth-chatWidth, windowHeight-106, windowWidth, windowHeight-106);
  line(0, 70, windowWidth-chatWidth, 70);
  line(0, windowHeight-70, windowWidth-chatWidth, windowHeight-70);
  line(windowWidth-195, windowHeight-70, windowWidth-195, windowHeight);
  line((windowWidth-chatWidth)/3, windowHeight-70, (windowWidth-chatWidth)/3, windowHeight);
  line(2*(windowWidth-chatWidth)/3, windowHeight-70, 2*(windowWidth-chatWidth)/3, windowHeight);

  // header text
  fill(200);
  noStroke();
  textFont('Trebuchet MS');
  textAlign(CENTER);
  textStyle(BOLD);
  textSize(50);
  if (playerName == "You")
    text(playerName+" are Streaming LIVE", (windowWidth - chatWidth)/2, 50);
  else
    text(playerName+" is Streaming LIVE", (windowWidth - chatWidth)/2, 50);  
  
  // viewer count
  textStyle(NORMAL);
  textSize(25);
  text(displayedViewers + "\nWatching Now", windowWidth-195-(chatWidth-195)/2, windowHeight-45);
  textAlign(LEFT);

  // position input and button
  input.position(windowWidth - chatWidth + 1, windowHeight - 105);
  button.position(input.x+chatWidth-50, input.y);
  
  // if text box is empty or user is pressing escape,
  // display a prompt in the text box.
  // don't allow the user to delete the prompt
  if (input.value().length == 0 ||
    keyIsDown(ESCAPE) ||
    (!isTyping && 
    (keyIsDown(BACKSPACE) || keyIsDown(DELETE))))
    stopTyping();
}

function myTriangle(x, y, s) { // create a triangle with side length s and centered at (x,y)
  let h = Math.sqrt((s*s) - ((s/2) * (s/2)));
  triangle(x - s/2, y + h/2, x + s/2, y + h/2, x, y - h/2);
}

function myTriangleFlipped(x, y, s) { // create a triangle with side length s and centered at (x,y)
  let h = Math.sqrt((s*s) - ((s/2) * (s/2)));
  triangle(x - s/2, y - h/2, x + s/2, y - h/2, x, y + h/2);
}

/*
  Interaction
*/

function checkHover() { // calculate and indicate which option is being hovered over
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

function keyPressed() { // handle keyboard input
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

function mousePressed() { // handle clicking on choices
  if (isHoveringA) {
    if (isChoiceLooping)
      makeLoopingChoice(1);
    else
      makeChoice(choicesMade, 0);
  }
  else if (isHoveringB) {
    if (isChoiceLooping)
      makeLoopingChoice(2);
    else
      makeChoice(choicesMade, 1);
  }
  else if (isHoveringC) {
    if (isChoiceLooping)
      makeLoopingChoice(3);
    else
      makeChoice(choicesMade, 2);
  }
}

function startTyping() { // display when the user starts typing
  input.style('color: #c8c8c8');
  input.value("");
  isTyping = true;
}

function stopTyping() { // display prompt when the user stops typing
  input.style('color: #646464');
  if (!hasEnteredName)
    input.value("Enter your name");
  else
    input.value("Post a message");
  isTyping = false;
}