// Server setup using Node.js
var http = require('http');
var fs = require('fs');
var url = require('url');

// Get openAI api key from .env file and put into easy API_KEY variable
require('dotenv').config()

// Import openai library and setup with API key
// Used OpenAI Node discussion for reference:
// https://github.com/openai/openai-node/discussions/217
const OpenAI = require('openai').default;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API 
});

// Set max tokens per response
const MAX_TOKENS = 2000;

// Set rate limiting variables
const MAX_REQUESTS = 10; // Maximum requests per time window
const TIME_WINDOW = 10 * 60 * 1000; // Set time window for max requests
const requestTimes = []; //create array to store request times in time window


// Start server
http.createServer(function (request, response) {
  let urlObject = url.parse(request.url, true, false)

  
  // handling generateButton request
  if (request.method === "POST" && urlObject.pathname === "/generateWorkout") {
    console.log("\nRECIEVED GENERATION REQUEST FROM CLIENT")
    let responseText = ""

    // If rate limit is hit, do not continue with the generate workout call
    let rateLimitIsHit = isRateLimitHit()
    if (rateLimitIsHit)
    {
      console.log("\nTOO MANY CLIENT REQUESTS IN TIME LIMIT")
      response.writeHead(429, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify('<h3>Rate Limit Exceeded</h3>'));
      return;
    }

    
    // Get the data from the client and put into body
    let body = "";
    request.on('data', (chunk) => { body += chunk; });

    request.on('end', async() => 
    {
      // Parse the recieved client data
      let receivedObject = JSON.parse(body);

      // Try making a call the the openai api
      try 
      {
        console.log("\nProcessing request...")
        // Handle generate workout logic with openAI using the recievedText from client
        const openAIResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          max_tokens: MAX_TOKENS,
          messages: [
            // Tell GPT what it is, and what it does
            {"role": "system", "content": "you are a gym professional who creates workout programs based off information given by the user."},

            // Tell GPT how to format the response to look better on the clients end
            {"role": "system", "content": `Please format your response in <html> without an <html> or <body> tag. 
            The titles for each day should be in <h2> tags, and the workouts under each day should be in a <ul> with <li> 
            elements for each workout. Any notes should be at the end with <p> tags. Do not add a disclaimer.`},

            // User client form data to get GPT to create personal workout plan
            {"role": "user", "content": `
            Create a workout program using some of the following information.
            Primary goal: ${receivedObject.primaryGoalText},
            Equipment available to use: ${receivedObject.equipmentText},
            Days per week: ${receivedObject.daysText},
            Current experience level: ${receivedObject.experienceText},
            Workout duration preference: ${receivedObject.timeText},
            Extra information to help create a personalized workout program: ${receivedObject.informationFormText}
            `}],
        });
        console.log("Response created, sending back to client.")
        console.log("Tokens used: " + openAIResponse.usage.total_tokens)

        // Get the text from the AI's response
        responseText = openAIResponse.choices[0].message.content.trim();
      
        // Send back the AI generated workout
        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify(responseText))
      }
    
      // if call to api fails, write the error to console and return error message
      catch (error) 
      {
        console.error('Error: ', error);
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify('Internal Server Error'));
      }
    });
  }


  // serving html pages to client
  if (request.method === "GET") {
    //handle GET requests as static file requests
    let filePath = "client" + urlObject.pathname
    if (urlObject.pathname === '/') filePath = "client" + '/index.html'


    fs.readFile(filePath, function(error, data) 
    {
      if (error) 
      {
        // report error to console
        console.log('ERROR: ' + JSON.stringify(error))
        // respond with not found 404 to client
        response.writeHead(404)
        response.end(JSON.stringify(error))
        return
      }

    // Determine correct content type using file extension
    var contentType;
    switch (filePath.slice(((filePath.lastIndexOf(".") - 1) >>> 0) + 2)) 
    {
      case 'html':
        contentType = 'text/html';
        break;
      case 'js':
        contentType = 'text/javascript';
        break;
      case 'css':
        contentType = 'text/css';
        break;
      default:
        contentType = 'text/plain';
      }

      response.writeHead(200, { 'Content-Type': contentType })
      response.end(data)
    })
  }
}).listen(3000);
console.log('Server Running on port 3000.');
console.log('To test: http://localhost:3000/index.html');



// Funciton to check if rate limit is being exceeded
function isRateLimitHit() {
  const currentTime = Date.now()
  //Loop through request times, if its older then the time window, remove
  while (requestTimes.length > 0 && currentTime - requestTimes[0] > TIME_WINDOW) requestTimes.shift();

  // If max requests are made in time window, send error to client
  if (requestTimes.length >= MAX_REQUESTS) return true;

  // Add current request time to the array
  requestTimes.push(currentTime);

  // If rate limit is not hit, return false
  return false; 
}