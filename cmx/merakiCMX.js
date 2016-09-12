
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

  function merakiCMXsettings(config) {
      RED.nodes.createNode(this,config);
      //this.name = config.name;
      //this.url = config.url;
      //console.log('merakiCMXsettings config %j',config);
      //console.log('merakiCMXsettings this  %j',this);
      //console.log('merakiCMXsettings this '+ JSON.stringify(this, null, 2));
  }
  // Settings
  RED.nodes.registerType("meraki-cmx-settings",merakiCMXsettings,{
    credentials: {
        secret: {type:"password"},
        validator: {type:"password"}
    }
  });


  // output node
  function merakiCMX(config) {
    RED.nodes.createNode(this,config);
    //console.log('merakiCMX config '+JSON.stringify(config, null, 3));

    if (!config.url) {
        this.warn(RED._("merakiCMX.errors.missing-path"));
        return;
    }
    this.name = config.name;
    this.url = config.url;
    // Retrieve the config node
    this.settings = RED.nodes.getNode(config.settings);

    // copy "this" object in case we need it in context of callbacks of other functions.
    var node = this;

    //console.log('merakiCMX this '+ JSON.stringify(this, null, 3));
    //console.log('merakiCMX node object '+ JSON.stringify(node, null, 3));

    // Start CMX Listener using config settings
    cmxServer(node);

    // close open URL listeners
    this.on("close",function() {
        var node = this;
        console.log("closing routes");
        console.log("node.url "+node.url);
        //console.log("RED.httpNode._router.stack "+ JSON.stringify(RED.httpNode._router.stack, null, 3));
        for (var i = RED.httpNode._router.stack.length - 1; i >= 0; i--) {
          if (RED.httpNode._router.stack[i].route){
            if (RED.httpNode._router.stack[i].route.path === node.url) {
              console.log("removing "+node.url);

              RED.httpNode._router.stack.splice(i, 1);
            }
          }
        }
        //console.log("RED.httpNode._router.stack: New Results"+ JSON.stringify(RED.httpNode._router.stack, null, 3));

        /*
        RED.httpNode._router.stack.forEach(function(route,i,routes) {
            console.log("route.route "+route.route);
            console.log("route.route.path "+route.route.path);

            if (route.route && route.route.path === node.url) {
                routes.splice(i,1);
                console.log("route closed: /"+node.url);
            }else{
              console.log("no routes closed");
            }
        });
        */
    });


  };
  RED.nodes.registerType("Meraki CMX",merakiCMX);

  // CMX Server
  function cmxServer(node){
    console.log('cmxServer url: '+node.url);
    console.log('cmxServer validator: '+node.settings.credentials.validator);
    //console.log('cmxServer node: '+JSON.stringify(node, null, 2));
    //console.log('cmxServer secret: '+node.settings.credentials.secret);
    
    node.status({fill:"yellow",shape:"dot",text:"waiting for first contact"});

    var msg = {};

    RED.httpNode.get(node.url, function(req, res){
      console.log("sending validation: "+node.settings.credentials.validator);
      node.status({fill:"blue",shape:"dot",text:"sent validator"});
      setTimeout(function(){
              node.status({fill:"green",shape:"dot",text:"listening"});
            }, 5000);
      msg.validator = node.settings.credentials.validator;
      msg.payload = null;
      node.send(msg);
      res.send(msg.validator);
    });

    RED.httpNode.post(node.url, function(req, res){
        //var jsoned = JSON.parse(req.body.data);
        console.log(node.url+' validating secret');
        console.log('cmx req.body: %j',req.body);
        console.log('cmx req.body: ',req.body);
      try{
          if (req.body.secret == node.settings.credentials.secret) {
            console.log(node.url+' secret verified');
            node.status({fill:"blue",shape:"dot",text:"data received"});
            setTimeout(function(){
              node.status({fill:"green",shape:"dot",text:"listening"});
            }, 5000);
            msg.payload = req.body;
            node.send(msg);
            res.status(200);
         }else{
            console.log('invalid secret from: '+req.connection.remoteAddress);
            node.status({fill:"red",shape:"dot",text:"secret invalid"});
            msg.error = 'invalid secret from: '+req.connection.remoteAddress;
            msg.payload = null;
            node.send(msg);
            res.sendStatus(401); // unauthorized
         }
       } catch (e) {
         // An error has occured
         console.log("Error.  Invalid POST from " + req.connection.remoteAddress);
         node.status({fill:"red",shape:"dot",text:"invalid post"});
         
         console.log(e);
         msg.error = "Invalid POST from " + req.connection.remoteAddress;
         msg.payload = null;
         node.send(msg);
         res.end();
        }
    });

  }
}
