/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Soccer news for latest news"
 *  Alexa: "Here's your top headlines: ..."
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.3245e000-8c03-4d33-a054-2f4b675a6a66"; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * Array containing top headlines.
 */

const axios = require('axios');
var FACTS = [
];

var url = 'https://newsapi.org/v1/articles?source=four-four-two&sortBy=top&apiKey=59004c0742794fec937043cb7426b65a';

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * SpaceGeek is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Fact = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Fact.prototype = Object.create(AlexaSkill.prototype);
Fact.prototype.constructor = Fact;

Fact.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    //console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

Fact.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    //handleNewFactRequest(response);
    response.ask("You can say soccer news, or, you can say exit... What can I help you with?", "What can I help you with?");
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Fact.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    //console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

var getFacts = () => {
  var Facts = [];
  return new Promise((resolve, reject) => {
    axios.get(url).then((response) => {
      if(response.data.status !== 'ok'){
        reject(Facts = [
          "Not able to retrieve headlines at this time"
        ]);
      }
      response.data.articles.forEach((item) => {
        Facts.push(`${item.title}. ${item.description}`);
      });
      resolve(Facts);
    })
  });
};

Fact.prototype.intentHandlers = {
    "GetNewFactIntent": function (intent, session, response) {
      getFacts().then((res) => {
        FACTS = res;
        handleNewFactRequest(response);
      });
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say tell me soccer news, or, you can say exit... What can I help you with?", "What can I help you with?");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

/**
 * Gets a random new fact from the list and returns to the user.
 */
function handleNewFactRequest(response) {
  var speechOutput;

  if(FACTS.length > 0){
    var speechText = "Here are your top headlines:";
    var cardTitle = "Your New";
    FACTS.forEach((item) => {
      speechText = speechText + " " + item + "<break time = \"0.5s\"/>";
    });
    speechOutput = {
      speech: "<speak>" + speechText + "</speak>",
      type: AlexaSkill.speechOutputType.SSML
    };
  }else{
    speechOutput = {
      speech: "<speak>Hello...You can say...soccer news... What can I help you with?</speak>",
      type: AlexaSkill.speechOutputType.SSML
    };
  }
  //response.tellWithCard(speechOutput, cardTitle, speechOutput);
  response.tell(speechOutput);
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var fact = new Fact();
    fact.execute(event, context);
};
