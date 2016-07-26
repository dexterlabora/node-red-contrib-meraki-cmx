# node-red-contrib-meraki-cmx
A Node-RED node to receive WiFi presence analytics from a Cisco Meraki wireless network.

##Install

Run the following command in your Node-RED user directory - typically ~/.node-red

    npm i node-red-contrib-meraki-cmx


## Description
A Cisco Meraki CMX (Connected Mobile eXperience) node to receive presence information from a Meraki WiFi network.

Meraki WiFi access points will send their WiFi presence observations, via the Meraki cloud, to this node. The JSON stream will be available in the `msg.payload` object.

More information on the CMX Location API can be found on the Meraki Developers Portal. http://developers.meraki.com/tagged/Location

##How it works
The CMX Node requires the following configurations

####Validator
- Used by Meraki to validate the receiver. The CMX Node will respond with the validator when Meraki performs a [GET] request to your server.
- When a validator response is sent to Meraki, a copy of the response will be available in the `msg.validator` object.

####Secret
- Used by the CMX Node to ensure the JSON stream is from the appropriate sendor.

####URL
- The URL that will listen for the JSON stream. This path will be appended to the servers domain name and port. `http://yourserver:port/URL`
If the node encounters any errors, the `msg.error` object will contain this information.


##Install:
Currently a work in progress, just copy the contents into the `.node-red/node_modules` folder and restart Node-RED.

Known Issues:
- Multiple Nodes with an identical URL will not function properly. 



####Written by Cory Guynn, 2016
#####http://www.InternetOfLEGO.com
#####http://developers.meraki.com

![Alt text](node-red-contrib-meraki-cmx-screenshot-overview.png?raw=true "CMX Overview")
![Alt text](node-red-contrib-meraki-cmx-screenshot-settings.png?raw=true "CMX Settings")



##Sample Flow
```
[{"id":"63f92812.0db518","type":"switch","z":"7e446509.34277c","name":"Search Clients","property":"payload","propertyType":"msg","rules":[{"t":"cont","v":"Apple","vt":"str"},{"t":"cont","v":"00:26:ab:b8:a9:a5","vt":"str"}],"checkall":"true","outputs":2,"x":140,"y":160,"wires":[["d9c66fc1.8e415"],["d06f6538.11dd78"]]},{"id":"5945d3d6.15f76c","type":"debug","z":"7e446509.34277c","name":"Apple Device Found!","active":true,"console":"false","complete":"payload","x":600,"y":160,"wires":[]},{"id":"d9c66fc1.8e415","type":"function","z":"7e446509.34277c","name":"Apple device found!","func":"msg.payload = \"Apple device found!\"\nreturn msg;","outputs":1,"noerr":0,"x":360,"y":160,"wires":[["5945d3d6.15f76c"]]},{"id":"4cc8a088.2fccb","type":"file","z":"7e446509.34277c","name":"","filename":"logs/cmx.log","appendNewline":true,"createDir":true,"overwriteFile":"false","x":630,"y":100,"wires":[]},{"id":"d06f6538.11dd78","type":"trigger","z":"7e446509.34277c","op1":"Welcome Back!","op2":"We miss you :(","op1type":"str","op2type":"str","duration":"5","extend":true,"units":"min","reset":"","name":"Welcome Back / We Miss You","x":330,"y":220,"wires":[["cdec7155.463a"]]},{"id":"cdec7155.463a","type":"debug","z":"7e446509.34277c","name":"CMX Message","active":true,"console":"false","complete":"payload","x":620,"y":220,"wires":[]},{"id":"a556156e.19dca8","type":"file in","z":"7e446509.34277c","name":"","filename":"logs/cmx.log","format":"utf8","x":370,"y":300,"wires":[["e119b3f1.79e46"]]},{"id":"84868391.73888","type":"inject","z":"7e446509.34277c","name":"Logs","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"x":110,"y":300,"wires":[["a556156e.19dca8"]]},{"id":"e119b3f1.79e46","type":"debug","z":"7e446509.34277c","name":"","active":true,"console":"false","complete":"false","x":630,"y":300,"wires":[]},{"id":"e8edfe6b.5f9d4","type":"debug","z":"7e446509.34277c","name":"CMX Validator","active":true,"console":"false","complete":"validator","x":620,"y":60,"wires":[]},{"id":"b974e072.b5143","type":"debug","z":"7e446509.34277c","name":"CMX Data","active":true,"console":"false","complete":"payload","x":630,"y":20,"wires":[]},{"id":"68447c98.128934","type":"Meraki CMX","z":"7e446509.34277c","url":"/cmx","settings":"981e77d3.3f0248","x":120,"y":60,"wires":[["b974e072.b5143","e8edfe6b.5f9d4","4cc8a088.2fccb","63f92812.0db518"]]},{"id":"981e77d3.3f0248","type":"meraki-cmx-settings","z":"7e446509.34277c","name":"Lab Network"}]
```
