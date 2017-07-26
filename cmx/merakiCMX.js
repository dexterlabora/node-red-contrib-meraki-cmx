
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
        secret: {type:"text"},
        validator: {type:"text"}
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
    this.radioType = config.radioType;
    // Retrieve the config node
    this.settings = RED.nodes.getNode(config.settings);

    // copy "this" object in case we need it in context of callbacks of other functions.
    var node = this;
    //console.log("DEBUGGING this ",this);


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
    //console.log("DEBUGGING node ",node);
    console.log('cmxServer url: '+node.url);
    console.log('cmxServer validator: '+node.settings.credentials.validator);
    //console.log('cmxServer node: '+JSON.stringify(node, null, 2));
    //console.log('cmxServer secret: '+node.settings.credentials.secret);
    
    node.status({fill:"yellow",shape:"dot",text:"waiting for first contact"});

    //var msg = {};
    var data = {};

    RED.httpNode.get(node.url, function(req, res){
      console.log("sending validator: "+node.settings.credentials.validator);
      node.status({fill:"blue",shape:"dot",text:"sent validator"});
      setTimeout(function(){
              node.status({fill:"green",shape:"dot",text:"listening"});
            }, 5000);
      data.payload = node.settings.credentials.validator;
      var status = {};
      status.topic = "validator";
      status.payload = "sending validator";
      status.validator = node.settings.credentials.validator;
      status.remoteAddress = req.connection.remoteAddress;
      node.send([null, status]);
      //res.send(msg.validator);
      res.send(data.payload);
    });

    RED.httpNode.post(node.url, function(req, res){
        console.log(node.url+' Received Data, validating secret');

      try{
          console.log("processing Meraki observation data");
          if(!req.body){
            //console.log("invalid post data: ",req);
            throw "unrecognized data";
          }


          if(req.body.version != "2.0"){
            console.log("Meraki CMX: Invalid version. Expecting 2.0 but received ",req.body.version);
            node.status({fill:"red",shape:"dot",text:"invalid API version: "+req.body.version});
            setTimeout(function(){
              node.status({fill:"green",shape:"dot",text:"listening"});
            }, 5000);
            res.sendStatus(500);
            data.payload = node.settings.credentials.validator;
            var status = {};
            status.topic = "version";
            status.payload = "incorrect version";
            status.supportedVersion = "2.0";
            status.version = req.body.version;
            status.remoteAddress = req.connection.remoteAddress;
            status.statusCode = 500; // server error
            node.send([null, status]);
            res.end();
            return null;
          }       

          // Check Secret
          if (req.body.secret != node.settings.credentials.secret) {
            // Secret invalid
            console.log('Error: Invalid Secret from: '+req.connection.remoteAddress);
            node.status({fill:"red",shape:"dot",text:"secret invalid"});
            res.sendStatus(401); // unauthorized
            node.error("Invalid Secret from "+req.connection.remoteAddress,msg);
            var status = {};
            status.topic = "secret";
            status.payload = "invalid secret";
            status.secret = req.body.secret;
            status.version = req.body.version;
            status.remoteAddress = req.connection.remoteAddress;
            status.statusCode = 401;
            node.send([null, status]);
            res.end();      
            return null
          }else{
            // Secret verified
            console.log(node.url+' secret verified');
            node.status({fill:"blue",shape:"dot",text:"data received"});
            setTimeout(function(){
              node.status({fill:"green",shape:"dot",text:"listening"});
            }, 5000);
            var status = {};     
            status.topic = "secret";
            status.payload = "secret verified";
            status.secret = req.body.secret;
            status.remoteAddress = req.connection.remoteAddress;
            node.send([null, status]);
          }

          // Check Radio Observeration Type
          console.log("Radio type ",node.radioType);
          console.log("req.body.type ",req.body.type);
          if(node.radioType === req.body.type || node.radioType.toString() === "All"){
            console.log("sending data to flow");
            // Send Observations to Data flow
            var status = {};
            status.topic = "data";
            status.payload = "data received";
            status.supportedType = node.radioType;
            status.type = req.body.type;
            status.remoteAddress = req.connection.remoteAddress;
            status.statusCode = 200;
            data.payload = req.body;
            res.sendStatus(200);
            node.send([data, null]);      
          }else{
            // discarding data as it does not match the expected radio type
            console.log("discarding radio type ",req.body.type);
            node.status({fill:"yellow",shape:"dot",text:"discarding radio type"});
            setTimeout(function(){
              node.status({fill:"green",shape:"dot",text:"listening"});
            }, 5000);
            var status = {};
            status.topic = "type";
            status.payload = "discarding radio type";
            status.supportedType = node.radioType;
            status.type = req.body.type;
            status.remoteAddress = req.connection.remoteAddress;
            status.statusCode = 200; // OK 
            res.sendStatus(200); //respond to client with status code
            node.send([null, status]);
            res.end();
            return null
          }
        
          

               
            
         
       } catch (e) {
        // An error has occured
        console.log("Error. Invalid POST from " + req.connection.remoteAddress);
        console.log(e);
        node.status({fill:"red",shape:"dot",text:"invalid post"});
        res.sendStatus(500); // Server Error    
        node.error("Invalid POST req data from " + req.connection.remoteAddress, req);
        var status = {};
        status.topic = "error";
        status.payload = "invalid post data";
        status.remoteAddress = req.connection.remoteAddress;
        status.error = e;
        status.data = req.body;
        status.statusCode = 500;
        node.send([null, status]); 
        res.end();
         return null
        }
    });

  }
}
