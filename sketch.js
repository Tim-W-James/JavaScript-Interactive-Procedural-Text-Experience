/*  COMP1720 Major Assignment
*   2019 Sem 2
*   Tim James - u6947396
*/

// variable declaration
let input, button, player, users, viewers, displayedViewers;
let canvasWidth, canvasHeight, chatStatus, initialTime;
let greetingMsg, nextChoiceMsg;
let names, adjectives, nouns;
let playerName = "You";
let lastUser = "";
let lastMessage = "";
let currentUser = "";
let eventStatus = 0; // 0 - not active, 1 - preparing, 2 - responding
let chatWidth = 500;
let choicesMade = 0;
let prevChoice = -1;
let timeOfLastChoice = 0;
let minMsgDelay = 75;
let maxMsgDelay = 100;
let eventDelayA = 0;
let eventDelayB = 0;
let msgRows = 0;
const initialViewers = 1000;
let choices = [];
let messages = [];
let canvasFunctions = [];
let currentEvents = [];
let isTyping = false;
let isHoveringA = false;
let isHoveringB = false;
let isHoveringC = false;
let hasEnteredName = false;

function preload() {
  // instantiate complex objects
  instantiateChoices();
  instantiateUsers();
  instantiateChatStatus();
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // setup input field properties
  input = createInput();
  input.style('width: 500px');
  input.style('font-size: 50px');
  input.style('font-family: "Consolas", monaco, monospace');
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
    // display elements
    displayBackUI();
    displayCanvas(canvasFunctions);
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
    if (getSecondsSinceChoice() > 30)
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
  choices = [
    newChoice("add a circle", 0, 1.2, 1, function A0() {ellipse(canvasWidth/2, canvasHeight/2+70, 100);}),
    newChoice("add a square", 1, 1.05, 1, function A1() {rect(canvasWidth/2-50, canvasHeight/2+20, 100, 100);}),    
    newChoice("add a triangle", 2, 1.3, 1, function A2() {myTriangle(canvasWidth/2, canvasHeight/2+70, 100);}),    
    newChoice("make the shape blue", 0, 1.2, 0, function B0() {fill(0, 0, 255);}),
    newChoice("make the shape green", 1, 1.1, 0, function B1() {fill(0, 255, 0);}),    
    newChoice("make the shape red", 2, 0.9, 0, function B2() {fill(255, 0, 0);})    ,
    newChoice("", 0, 0, 0, function C0() {}),
    newChoice("", 1, 0, 0, function C1() {}),    
    newChoice("", 2, 0, 0, function C2() {})
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
  users = {
    complementer : newUser(generateSName(0, true, true, false), true),
    pretentious : newUser(generateSName(1, false, false, false), true),
    critic : newUser(generateSName(0, true, false, false), true),
    edgy : newUser(generateSName(2, false, false, true), true)
  };
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
  addMessage(newMessage(generateName(), "Hello!", 4));
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
    console.log("Total: "+totalValues+"\nRandom Value: "+randomValue+ "\nGot: playerMsgResponse");
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
    console.log("Total: "+totalValues+"\nRandom Value: "+randomValue+ "\nGot: choiceResponse");
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
    console.log("Total: "+totalValues+"\nRandom Value: "+randomValue+ "\nGot: greeting");
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
      console.log("Total: "+totalValues+"\nRandom Value: "+randomValue+ "\nGot: waiting");
      generateWaitingMsg();
  }
  // make comments on the current choice
  else if (randomValue < chatStatus.playerMsgResponse + chatStatus.choiceResponse + 
    chatStatus.greeting + chatStatus.waiting + chatStatus.nextChoice) { 
      console.log("Total: "+totalValues+"\nRandom Value: "+randomValue+ "\nGot: nextChoice");
      generateNextChoiceMsg();
  }
  // revert to idle messages if no other options are made
  else { 
    console.log("Total: "+totalValues+"\nRandom Value: "+randomValue+ "\nGot: idle");
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

function generateNextChoiceMsg() {// randomly generate a message about the next choice
  let r;
  let rC = choicesMade*3 + Math.round(random(0,2));
  let c = choices[rC];  
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
  r = Math.round(random(0, 12));
  switch(r) {
    case 0:
      addMessage(newMessage(generateName(), "Do something already!", 3));
      break;
    case 1:
      addMessage(newMessage(generateName(), "@"+playerName+" hasn't made a choice in ages", 2));
      break;
    case 2:
      addMessage(newMessage(generateName(), "Look and the bottom of the screen and do something", 2));
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
    default:
      addMessage(newMessage(generateName(), "This is boring, hope @"+playerName+" does something soon", 2));
      break;
  }
}

function generateChoiceResponse() { // randomly generate a message about the last choice made
  let r;
  if (viewers > initialViewers*1.5) { // happy
    if (prevChoice.vFactor > 1) { // pro
      r = Math.round(random(0, 14));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), prevChoice.text+" was such a great choice!", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "@"+playerName+" is doing great", 3));
          break;
      }
    }
    else { // cons
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), prevChoice.text+", an alright decision", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "I'm sure you know what you're doing", 3));
          break;
      }     
    }
  }
  else if (viewers < initialViewers*0.5) { // toxic
    if (prevChoice.vFactor > 1) { // pro
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), prevChoice.text+", guess its the best you could do", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "Seems like the only way of salvaging this mess", 3));
          break;
      }      
    }
    else { // cons
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "WHY WOULD YOU "+prevChoice.text+"?!", 3));
          break;
        default:
          addMessage(newMessage(generateName(), "@"+playerName+" has no idea what they're doing", 3));
          break;
      }
      
    }
  }
  else { // neutral
    if (prevChoice.vFactor > 1) { // pro
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "They chose to "+prevChoice.text+", looks good", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "This is shaping up nicely", 3));
          break;
      }
      
    }
    else { // cons
      r = Math.round(random(0, 10));
      switch(r) {
        case 0:
          addMessage(newMessage(generateName(), "Why did they "+prevChoice.text+"?", 2));
          break;
        default:
          addMessage(newMessage(generateName(), "@"+playerName+" is ruining it", 3));
          break;
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
  //n is the current choice and id is the choice made (between 0 and 2)
  let i = n*3 + id;
  choicesMade++;
  prevChoice = choices[i];
  timeOfLastChoice = getSecondsElapsed();

  canvasFunctions.push(choices[i]);
  canvasFunctions.sort(compareChoices);

  // calculate new viewer count
  viewers = Math.round(viewers * choices[i].vFactor);
  displayedViewers = Math.round(random(0.98*viewers, 1.02*viewers));
  triggerEvent(function c() {chatStatus.choiceResponse = 200;});

  return choices[i];
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
    text : s.substring(0, 2*(chatWidth/14)-u.length),
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
  textFont('Consolas');
  textSize(20);
  textAlign(LEFT);

  // iterate across all messages
  for (i = 0; i < messages.length; i++) {
    fill(100);
    textStyle(NORMAL);
    text(messages[i].time, windowWidth - chatWidth + 10, 25*(i+rowOffset+1));
    fill(200);

    // different message types are displayed differently
    let tempStr;
    if (messages[i].type == 0) {
      textStyle(BOLD);
      tempStr = messages[i].user + ": " + messages[i].text;
    }
    else if (messages[i].type == 1) {
      textStyle(ITALIC);
      tempStr = messages[i].text;
    }
    else {
      textStyle(NORMAL);
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
  textStyle(NORMAL);
}

function displayChoices(i) { // displays the current choises
  noStroke();
  textFont('Trebuchet MS');
  textSize(30);
  textAlign(LEFT);
  textStyle(NORMAL);
  fill(200);

  // indicate which option is being hovered over
  if (isHoveringA) {
    text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+25, windowHeight-25);
    text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
    fill(255);
    text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 25, windowHeight-25);
  }
  else if (isHoveringB) {
    text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 25, windowHeight-25);
    text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
    fill(255);
    text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+25, windowHeight-25);

  }
  else if (isHoveringC) {
    text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 25, windowHeight-25);
    text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+25, windowHeight-25);
    fill(255);
    text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
  }
  else {
    text(choices[i*3].text[0].toUpperCase() + choices[i*3].text.substring(1, choices[i*3].text.length), 25, windowHeight-25);
    text(choices[i*3+1].text[0].toUpperCase() + choices[i*3+1].text.substring(1, choices[i*3+1].text.length), ((windowWidth-chatWidth)/3)+25, windowHeight-25);
    text(choices[i*3+2].text[0].toUpperCase() + choices[i*3+2].text.substring(1, choices[i*3+2].text.length), (2*(windowWidth-chatWidth)/3)+25, windowHeight-25);
  }
}

function displayCanvas(f) { // run functions that create the canvas
  canvasWidth = windowWidth - chatWidth;
  canvasHeight = windowHeight - 140;
  fill(255);
  for (i = 0; i < f.length; i++) {
    f[i].function();
  }
}

function displayBackUI() { // display the back layer of UI
  fill(0);
  rect(0, 0, windowWidth, windowHeight);

  fill(25, 100);
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
    makeChoice(choicesMade, 0);
  }
  else if (isHoveringB) {
    makeChoice(choicesMade, 1);
  }
  else if (isHoveringC) {
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