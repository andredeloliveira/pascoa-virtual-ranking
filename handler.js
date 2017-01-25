'use strict';

var AWS = require('aws-sdk');
var uuid = require('uuid');
var _ = require('underscore');

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
  var params = JSON.parse(event.body)
  var Item = {
    id: uuid.v4(),
    user: params.user,
    name: params.name,
    time: params.time,
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
};

module.exports.getRanking = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName: 'pascoa-ranking',
  }
  docClient.scan(params, (error, data) => {
    if (error) {
      callback(error);
    }
    //TODO: Query directly from the DB. Though DynamoDB kinda sucks fetching data, so we will have this by now 
    let orderedData = data.Items.sort( (a, b) => {
      if (a.time > b.time) {
        return 1;
      } else if (a.time < b.time) {
        return -1;
      } else {
        return 0;
      }
    })
    let firstFiveOrdered = _.first(orderedData, 5);
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin':'*'
      },
      body: JSON.stringify(firstFiveOrdered),
    });
  });
}
