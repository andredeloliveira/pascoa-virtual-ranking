'use strict';

var AWS = require('aws-sdk');
var uuid = require('uuid');

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello world from our APIS!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

module.exports.addToRanking = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var Item = {
    id: uuid.v4(),
    user: event.email,
    time: event.time,
  };

  docClient.put({ TableName: 'pascoa-ranking', Item: Item}, (error) => {
    if (error) {
      callback(error)
    }
    callback(null, {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: "Information saved successfully with " + JSON.stringify(event)
    })
  })
}
