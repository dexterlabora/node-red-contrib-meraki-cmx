
// Cisco Meraki CMX Listener

/*
 This node will accept a JSON post from the Cisco Meraki CMX Presence API.
 It will first respond to a [GET] request and respond with a validator key (provided within the Meraki Dashboard)
 Meraki will then send a [POST] which includes the CMX JSON data, including a user defined secret
 If the secret matches, the data will be set to the msg.payload object.

 Written by: Cory Guynn
 www.Meraki.com
 www.InternetOfLEGO.com
*/

module.exports = function (RED) {
  "use strict";

  function merakiCMXsettings(n) {
      RED.nodes.createNode(this,n);

      console.log('merakiCMXsettings n %j',n);
      console.log('merakiCMXsettings this  %j',this);
      this.name = n.name;
      this.port = n.port;
      this.url = n.url;

      console.log('merakiCMXsettings this UPDATED '+ JSON.stringify(this, null, 2));

  }

  RED.nodes.registerType("meraki-cmx-settings",merakiCMXsettings,{
    credentials: {
        secret: {type:"password"},
        validator: {type:"password"}
    }
  });


  // output node
  function merakiCMX(n) {
    RED.nodes.createNode(this,n);
    // Retrieve the config node
    this.settings = RED.nodes.getNode(n.settings);
    //this.credentials = RED.nodes.getNode(n.credentials);
    console.log('merakiCMX n %j',n);
    console.log('merakiCMX this '+ JSON.stringify(this, null, 2));

    // copy "this" object in case we need it in context of callbacks of other functions.
    //var node = this;
    var node = this;

    // Start CMX Listener
    cmxServer(node);

  };
  RED.nodes.registerType("Meraki CMX",merakiCMX);

  function cmxServer(node){
    //console.log('cmxServer node: '+JSON.stringify(node, null, 2));
    console.log('cmxServer url: '+node.settings.url);
    console.log('cmxServer validator: '+node.settings.credentials.validator);
    console.log('cmxServer secret: '+node.settings.credentials.secret);

    var express = require('express');
    var bodyParser = require('body-parser');

    var msg = {};

    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

    app.get(node.settings.url, function(req, res){
      console.log("sending validation: "+node.settings.credentials.validator);
      msg.payload = node.settings.credentials.validator;
      node.send(msg);
      res.send(msg.payload);

    });

    app.post(node.settings.url, function(req, res){
        //var jsoned = JSON.parse(req.body.data);
        console.log('/cmx validating secret');
        console.log('cmx req.body: %j',req.body);
      try{
          if (req.body.secret == node.settings.credentials.secret) {
            console.log('/cmx secret verified');

            msg.payload = req.body;
            node.send(msg);
            res.status('ok');

         }else{
           console.log('invalid secret');
           msg.payload = 'invalid secret from: '+req.connection.remoteAddress;
           node.send();
           res.sendStatus(401); // unauthorized
         }
       } catch (e) {
         // An error has occured
         console.log("Error.  Invalid POST from " + req.connection.remoteAddress + ":");
         console.log(e);
         node.send();
         res.end();
        }
    });

    // Start CMX Listener
    console.log('node.settings.connect? '+ node.settings.connected);
    if(node.settings.connected === true){
          console.log('server is already running on port' +node.settings.port);
    }else {
      node.settings.connected = true;
      // start server
      node.server = app.listen(node.settings.port,function(){
          console.log("Meraki CMX listening on: "+node.settings.port+':'+node.settings.url);
      });
    }
    node.on("close", function() {
        // Called when the node is shutdown - eg on redeploy.
        // Allows ports to be closed, connections dropped etc.
         console.log('closing connection: '+node.settings.port+':'+node.settings.url);
         node.server.close();
         node.settings.connected = null;
    });

  }
}
