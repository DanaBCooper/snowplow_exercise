/*
Initialisation required for server + tracker
*/

var express = require('express');
var app = express();
var snowplow = require('snowplow-tracker')
var emitter = snowplow.emitter;
var tracker = snowplow.tracker;
var fs = require("fs");


var basket = [0, 0, 0, 0, 0]
var tab_str = "<tr><td>Product 0</td><td> Q </td> </tr>"
var cost_array = [1,2,3,4,5]
var sku_array = ["product1","product2","product3","product4","product5"]
var transaction_count = 1


/*
Initialising and configuring the emitter to handle communication with Snowplow Micro
Looks for endpoint at 0.0.0.0:9090, sends a post request and sends after each event.
Prints to console if communication fails
*/

var e = emitter(
  '0.0.0.0',
  'http',
  9090,
  'POST',
  1,
  function(error,body,response){
    if (error) {
      console.log("Sending events failed");
    }
  },
  { maxSockets: 6 } // Node.js agentOptions object to tune performance
);

/*
General settings for the tracker
*/
var t = tracker([e], 'testTracker', 'testApp')
t.setLang('en')


/*
Handles get + post requests for the landing page. Logs a screen view no matter the request.
Post request simulates a purchase if in the URL - Logs the purchase and looks to see if more
than 3 of any single item have been purchased to trigger a custom unstructured event
*/
app.get('/', function(req, res){
  var d = new Date();
  t.trackScreenView("Landing Page", "screen0", null, d.getTime())
  fs.readFile('./home.html', 'utf8', function(err, data){
    res.end( data )
  })
})

app.post('/', function(req, res){
  var d = new Date();
  t.trackScreenView("Landing Page", "screen0", null, d.getTime())
  fs.readFile('./home.html', 'utf8', function(err, data){
    res.end( data )
  })
  if (req.url.substring(2) == 'c'){
    cost = 0;
    items = [];
    for(var i =0; i<5; i++){
      cost += basket[i] * cost_array[i]
      if (basket[i] > 0){
        items.push({
          "sku" : sku_array[i],
          "price" : cost_array[i],
          "quantity" : basket[i]
        })
        if(basket[i] > 3){
          t.trackUnstructEvent({
            "schema": "iglu:com.example_company/save-game/jsonschema/1-0-2",
            "data": {
              "name" : "More than 3 purchased",
              "amount" : basket[i],
              "product" : sku_array[i]
            }
          })
        }
      }
    }
    t.trackEcommerceTransaction(transaction_count, null, cost, null, null, null, null, null, null, items )
    transaction_count++;
    basket = [0, 0, 0, 0, 0]
  }
})

/*
Handles get + post requests for the product page. Logs a screen view for both,
and the post request handles the strucured event of an item being added to the basket.
*/

app.get('/products', function (req, res) {
  var d = new Date();
  t.trackScreenView("Product Page", "screen1", null, d.getTime())
   fs.readFile("./product_list.html", 'utf8', function (err, data) {
     var x = basket.reduce((a, b) => a + b, 0)
     data = data.replace("$", x.toString() )
      res.end( data );
   });
})

app.post('/products', function (req, res) {
  var d = new Date();
  t.trackScreenView("Product Page", "screen1", null, d.getTime())
   fs.readFile("./product_list.html", 'utf8', function (err, data) {
     var x = basket.reduce((a, b) => a + b, 0)
     data = data.replace("$", x.toString() )
      res.end( data );
   });
   var index = parseInt(req.url.substring(11)) - 1
   if (0 <= index <= 5){
    basket[index]++;
    t.trackStructEvent("shop","add-to-basket",null,sku_array[index])
  }
})

/*
Handles the basket page. Inserts server held information into the HTML page in order to show
the contents of a basket
*/

app.get('/basket', function (req, res) {
  var d = new Date();
  t.trackScreenView("Basket Page", "screen2", null, d.getTime())
   fs.readFile("./basket.html", 'utf8', function (err, data) {
     var insert_str = ""
     for (var i =0; i< basket.length; i++){
       if(basket[i] != 0){
         insert_str = insert_str + tab_str.replace("0",(i+1).toString()).replace("Q",basket[i].toString())
       }
     }
     data = data.substring(0, 115) + insert_str + data.substring(116)

      res.end( data );
   });
})


/*
Launches the server
*/
var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
