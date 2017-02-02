'use strict'

var AWS = require('aws-sdk')
var uuid = require('uuid')
var _ = require('underscore')
var sortedRanking = (data) => {
  if (data.Items) {
    let sortedData = data.Items.sort( (a, b) => {
      if (a.time > b.time) {
        return 1
      } else if (a.time < b.time) {
        return -1
      } else {
        return 0
      }
    })
    return sortedData
  }
  return []
}

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello world from our APIS!',
      input: event,
    }),
  }

  callback(null, response)

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event })
}

module.exports.addToRanking = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient()
  var params = JSON.parse(event.body)
  var Item = {
    email: params.email,
    firstName: params.firstName,
    time: params.time,
    shopping: params.shopping,
  }

  //TODO: Research about when using an external lambda function is better than doing this.
  docClient.scan({
    TableName: 'pascoa-virtual-ranking',
    ProjectionExpression: 'email',
    FilterExpression: 'email = :newEmail',
    ExpressionAttributeValues: {
         ":newEmail": Item.email,
    }
  }, (error, data) => {
    if (error) {
      callback(error)
    } else {
      if (data) {
        //perform update
        docClient.update({
          TableName: 'pascoa-virtual-ranking',
          Key: {
            'email': Item.email,
          },
          UpdateExpression: 'set time = :time',
          ExpressionAttributeValues: {
            ':time': Item.time
          },
          ReturnValues: 'UPDATED_NEW'
        }, (error, data) => {
          if (error) {
            callback(error)
          } else {
            callback(null, {
              statusCode: 200,
              headers: {
                'Access-Control-Allow-Origin': '*'
              },
              body: "Updated " + JSON.stringify(data)
            })
          }
        })
      }
    }
  })
  docClient.put({ TableName: 'pascoa-virtual-ranking', Item: Item}, (error) => {
    if (error) {
      callback(error)
    }
    callback(null, {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: "Information saved successfully with " + JSON.stringify(event.body)
    })
  })
}

module.exports.getRanking = (event, context, callback) => {
  var docClient = new AWS.DynamoDB.DocumentClient()
  var params = {
    TableName: 'pascoa-virtual-ranking',
  }
  if (event.queryStringParameters && event.queryStringParameters.shopping) {
    params.ProjectionExpression = 'email, firstName, time'
    params.FilterExpression = 'shopping = :requestedShopping'
    params.ExpressionAttributeValues = {
         ":requestedShopping": event.queryStringParameters.shopping,
    }
  }


  var queryObject = null;
  if (event.queryStringParameters && event.queryStringParameters.email) {
    queryObject = {
      email: event.queryStringParameters.email,
    }
  }

  docClient.scan(params, (error, data) => {
    if (error) {
      callback(error)
    }
    //TODO: Query directly from the DB. DynamoDB kinda sucks fetching data, so we will have this for now
    var sortedArray = sortedRanking(data)
    var ranking = _.first(sortedArray, 5)
    var userPosition = queryObject ? _.findIndex(sortedArray, queryObject, true) + 1 : -1
    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin':'*'
      },
      body: JSON.stringify({ userPosition: userPosition, ranking: ranking }),
    })
  })
}
