# WorkoutAI

WorkoutAI creates workout programs using openAI API for users based on their preferences.

## Prerequisites
*  [Node.js](https://nodejs.org/en "Node.js") (v18.0 or later recommeneded)
* npm (usually comes bundled with Node.js)

## Installation/Setup
* In terminal, navigate to projects main directory 
`cd [project-directory]`
* Install dependencies in project directory
`npm install`

### Setting Up openAI API Key

To run this project, you'll need an API key from OpenAI. Here's how to set it up:

* Sign up/login on the [OpenAI website](https://platform.openai.com/)
* Generate an API key in your OpenAI account settings
* Create a `.env` file in the root directory of this project (Same location as index.js)
* In the `.env` file, add your API key like this: 
`OPENAI_API=your-api-key-here`
* Keep your API key in the .env file private to maintain the security of your OpenAI account

## Running Server
* In terminal, navigate to projects main directory 
`cd [project-directory]`
* Start server with node
`node .\index.js`

## Testing
* When server is running, go the the link: http://localhost:3000/index.html
* To stop server: `Ctrl + C` in terminal where server is running

## Languages/Technologies
* HTML/CSS
* JavaScript
* Node.js

