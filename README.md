# snowplow_exercise
Internship Technical Assigment - a simple shopfront written in node.js and express, with locally configured tracking sending information to Snowplow Micro 

## Overview 
My task was implement and expriment with tracking in a simple example app. I did not have a simple app I was the sole author of that fit the task, so I used the opportunity to learn node.js and create a basic website.
It is a shopfront with 5 products and a basket, with various interactions (pageviews, adding to basket, etc.) sending an event to the Snowplow Micro tracker.

## Running
Requires: node.js and the express + fs modules, the node.js Snowplow tracker and Snowplow Micro  

Developed, run and tested on Linux Manjaro.  
`
   node server.js 
 `
  will launch the server. It can be accessed at localhost:8080  
 `
     sudo docker run --mount type=bind,source=$(pwd)/example,destination=/config -p 9090:9090 snowplow/snowplow-micro:latest         --collector-config /config/micro.conf --iglu /config/iglu.j\son
 `  
  will launch Snowplow Micro. It can be accessed at localhost:9090.  
  To set up Snowplow Micro I used instructions found at https://github.com/snowplow-incubator/snowplow-micro/  

## Tracking
This project is configured to track screen views, additions to basket, transactions and the custom event of more than 3 of any single item being purchased.
