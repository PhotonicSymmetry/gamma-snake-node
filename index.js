const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

//  This function is called everytime your snake is entered into a game.
//  cherrypy.request.json contains information about the game that's about to be played.
// TODO: Use this function to decide how your snake is going to look on the board.
app.post('/start', (request, response) => {
  console.log("START");

  // Response data
  const data = {
    color: '#FF8000',
    headType: "regular",
    tailType: "regular"
  }

  return response.json(data)
})

// Valid moves are "up", "down", "left", or "right".
// TODO: Use the information in cherrypy.request.json to decide your next move.
var prevMove = -1;
function makeChoice(data) {
  // TODO: some sort of logic to prevent snake from trapping itself as well as attacking head of shorter opponents
  var nums = [1, 1, 1, 1];
  for (i = 0; i < data.board.snakes.length; i++) {
    for (j = 0; j < data.board.snakes[i].body.length; j++) {
      if ((data.board.snakes[i].body[j].x === data.you.body[0].x - 1 && data.board.snakes[i].body[j].y === data.you.body[0].y) || data.you.body[0].x - 1 === -1) {
        nums[2] = 0;
      }
      if ((data.board.snakes[i].body[j].x === data.you.body[0].x + 1 && data.board.snakes[i].body[j].y === data.you.body[0].y) || data.you.body[0].x + 1 === data.board.width) {
        nums[3] = 0;
      }
      if ((data.board.snakes[i].body[j].x === data.you.body[0].x && data.board.snakes[i].body[j].y === data.you.body[0].y - 1) || data.you.body[0].y - 1 === -1) {
        nums[0] = 0;
      }
      if ((data.board.snakes[i].body[j].x === data.you.body[0].x && data.board.snakes[i].body[j].y === data.you.body[0].y + 1) || data.you.body[0].y + 1 === data.board.height) {
        nums[1] = 0;
      }
    }
  }
  if (data.board.food.length) {
    var distFood = data.board.food.map(function(a) {
      return Math.pow(a.x - data.you.body[0].x, 2) + Math.pow(a.y - data.you.body[0].y, 2);
    });
    var closestFood = data.board.food[distFood.indexOf(Math.min(...distFood))];
    if (data.you.body[0].x > closestFood.x && nums[2]) {
      return 2;
    }
    if (data.you.body[0].x < closestFood.x && nums[3]) {
      return 3;
    }
    if (data.you.body[0].y > closestFood.y && nums[0]) {
      return 0;
    }
    if (data.you.body[0].y < closestFood.y && nums[1]) {
      return 1;
    }
  }
  while (true) {
    var move = Math.floor(Math.random() * possible_moves.length);
    if (nums[move]) {
      return move;
    }
  }
};
// This function is called on every turn of a game. It's how your snake decides where to move.
app.post('/move', (request, response) => {
  var data = request.body;

  possible_moves = ["up", "down", "left", "right"]
  var choice = makeChoice(data);
  var snake_move = possible_moves[choice];

  console.log("MOVE: " + snake_move);
  return response.json({ move: snake_move })
})

// This function is called when a game your snake was in ends.
// It's purely for informational purposes, you don't have to make any decisions here.
app.post('/end', (request, response) => {
  console.log("END");
  return response.json({ message: "ok" });
})

// The Battlesnake engine calls this function to make sure your snake is working.
app.post('/ping', (request, response) => {
  return response.json({ message: "pong" });
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
