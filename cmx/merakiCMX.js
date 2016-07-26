
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
      //this.name = n.name;
      //this.url = n.url;
      //console.log('merakiCMXsettings n %j',n);
      //console.log('merakiCMXsettings this  %j',this);
      //console.log('merakiCMXsettings this '+ JSON.stringify(this, null, 2));
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
    //console.log('merakiCMX n '+JSON.stringify(n, null, 3));
    this.name = n.name;
    this.url = n.url;
    // Retrieve the config node
    this.settings = RED.nodes.getNode(n.settings);


    // copy "this" object in case we need it in context of callbacks of other functions.
    var node = this;

    //console.log('merakiCMX this '+ JSON.stringify(this, null, 3));

    // Start CMX Listener
    cmxServer(node);
  };
  RED.nodes.registerType("Meraki CMX",merakiCMX);

  function cmxServer(node){
    console.log('cmxServer url: '+node.url);
    console.log('cmxServer validator: '+node.settings.credentials.validator);
    //console.log('cmxServer node: '+JSON.stringify(node, null, 2));
    //console.log('cmxServer secret: '+node.settings.credentials.secret);

    var msg = {};

    RED.httpAdmin.get(node.url, function(req, res){
      console.log("sending validation: "+node.settings.credentials.validator);
      msg.validator = node.settings.credentials.validator;
      node.send(msg);
      res.send(msg.validator);
    });

    RED.httpAdmin.post(node.url, function(req, res){
        //var jsoned = JSON.parse(req.body.data);
        console.log(node.url+' validating secret');
        console.log('cmx req.body: %j',req.body);
        console.log('cmx req.body: ',req.body);
      try{
          if (req.body.secret == node.settings.credentials.secret) {
            console.log(node.url+' secret verified');
            msg.payload = req.body;
            node.send(msg);
            res.status('ok');
         }else{
            console.log('invalid secret from: '+req.connection.remoteAddress);
            msg.error = 'invalid secret from: '+req.connection.remoteAddress;
            node.send(msg);
            res.sendStatus(401); // unauthorized
         }
       } catch (e) {
         // An error has occured
         console.log("Error.  Invalid POST from " + req.connection.remoteAddress);
         console.log(e);
         msg.error = "Invalid POST from " + req.connection.remoteAddress;
         node.send(msg);
         res.end();
        }
    });

  }
}
