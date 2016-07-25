# node-red-contrib-meraki-cmx
A node-red node to to receive WiFi presence analytics from a Cisco Meraki wireless network.

## Description
This is an initital release of the Node-Red Module for Meraki CMX.

##Considerations

##Install:

Currently a work in progress, just copy the contents into the `.node-red/node_modules` folder

Bugs:
- Multiple Nodes with identical settings will crash
- Multiple Nodes with identical ports will crash
- Basically, you can have multiple nodes as long as the ports are unique

ToDo:
- SSL support
- Remove debugging messages
- Security/Performance testing

####Written by Cory Guynn, 2016
#####www.InternetOfLEGO.com

![Alt text](node-red-contrib-meraki-cmx-screenshot.png?raw=true "Optional Title")


##Sample Flow
```
[{"id":"26f6d68d.31af6a","type":"Meraki CMX","z":"7e446509.34277c","settings":"981e77d3.3f0248","x":110,"y":60,"wires":[["9c9afadb.78a1d8","63f92812.0db518","4cc8a088.2fccb"]]},{"id":"9c9afadb.78a1d8","type":"debug","z":"7e446509.34277c","name":"CMX Data","active":true,"console":"false","complete":"payload","x":630,"y":60,"wires":[]},{"id":"63f92812.0db518","type":"switch","z":"7e446509.34277c","name":"Search Clients","property":"payload","propertyType":"msg","rules":[{"t":"cont","v":"Apple","vt":"str"},{"t":"cont","v":"00:26:ab:b8:a9:a5","vt":"str"}],"checkall":"true","outputs":2,"x":140,"y":160,"wires":[["d9c66fc1.8e415"],["d06f6538.11dd78"]]},{"id":"5945d3d6.15f76c","type":"debug","z":"7e446509.34277c","name":"Apple Device Found!","active":true,"console":"false","complete":"payload","x":600,"y":160,"wires":[]},{"id":"d9c66fc1.8e415","type":"function","z":"7e446509.34277c","name":"Apple device found!","func":"msg.payload = \"Apple device found!\"\nreturn msg;","outputs":1,"noerr":0,"x":360,"y":160,"wires":[["5945d3d6.15f76c"]]},{"id":"4cc8a088.2fccb","type":"file","z":"7e446509.34277c","name":"","filename":"/logs/cmx.log","appendNewline":true,"createDir":false,"overwriteFile":"false","x":620,"y":100,"wires":[]},{"id":"d06f6538.11dd78","type":"trigger","z":"7e446509.34277c","op1":"Welcome Back!","op2":"We miss you :(","op1type":"str","op2type":"str","duration":"5","extend":true,"units":"min","reset":"","name":"Welcome Back / We Miss You","x":270,"y":240,"wires":[["cdec7155.463a"]]},{"id":"cdec7155.463a","type":"debug","z":"7e446509.34277c","name":"CMX Message","active":true,"console":"false","complete":"payload","x":620,"y":240,"wires":[]},{"id":"981e77d3.3f0248","type":"meraki-cmx-settings","z":"7e446509.34277c","name":"cmx","port":"9000","url":"/cmx"}]
```




