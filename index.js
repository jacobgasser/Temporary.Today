var http = require("http");
var url = require("url");
var fs = require("fs");
var ws = require("ws").Server;
var list = {
  list: ["temp"]
};
var linkedList = {
  list: [{ temp: "http://google.com" }]
};
var wsaddress = "ws://159.65.185.219:3000";
if (process.argv.length > 0) {
  wsaddress = "ws://localhost:3000";
}
http
  .createServer(function(req, res) {
    var q = url.parse(req.url, true);
    var filename = "." + q.pathname;
    if (!q.pathname.includes(".")) {
      var actual = q.pathname.substr(1);
      if (!doesExist(actual)) {
        res.writeHead(404, { "Content-Type": "text/html" });
        return res.end("404404404 Not Found");
      }
      res.writeHead(302, { Location: getLink(actual) });
      return res.end("Check Console ;)");
    }
    fs.readFile(filename, function(err, data) {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        return res.end("404 Not Found");
      }

      if (filename === "./REBA.png") {
        res.writeHead(200, { "Content-Type": "image/png" });
        res.write(data);
        return res.end();
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      //res.write(data);
      return res.end(data);
    });
  })
  .listen(80);

var server = new ws({
  port: 3000
});
server.on("connection", function(ws) {
  ws.on("message", function(msg) {
    if (msg.toString().startsWith("--test ")) {
      var cancel = false;
      const id = msg.toLowerCase().split(" ");
      if (id.length > 3) {
        ws.send("-error TOO MANY ARGS");
        return;
      }
      cancel = doesExist(id[1]);
      if (cancel) {
        ws.send("-error TAKEN");
        return;
      }
      ws.send("-suc avail");
    }
    if (msg.toString() == "-get") {
      console.log("-------------------------");
      for (var i = 0; i < linkedList.list.length; i++) {
        console.log(linkedList.list[i]);
      }
      console.log("-------------------------");
    }

    if (msg.toString().startsWith("--add ")) {
      const addmsg = msg.toLowerCase().split(" ");
      if (doesExist(addmsg[1])) {
        ws.send("-error TAKEN");
        return;
      }
      addToList(addmsg[1], addmsg[2]);
      let day = 86400000;
      setTimeout(remove, day, addmsg[1]);
    }
  });
});

function remove(name) {
  console.log("at the remove place");
  for (var i = 0; i < linkedList.list.length; i++) {
    for (key in linkedList.list[i]) {
      if (key === name) {
        linkedList.list.splice(i, 1);
        for (var i = 0; i < list.list.length; i++) {
          if (list.list[i] === name) {
            list.list.splice(i, 1);
          }
        }
      }
    }
  }
}

function doesExist(name) {
  var cancel = false;
  for (var i = 0; i < list.list.length; i++) {
    if (name === list.list[i]) {
      cancel = true;
      break;
    }
  }
  return cancel;
}

function addToList(name, url) {
  if (doesExist(name)) {
    return;
  }
  list.list[list.list.length] = name;
  linkedList.list[linkedList.list.length] = { [name]: `${url.toString()}` };
}

function getLink(name) {
  if (!doesExist(name)) {
    return;
  }
  var link = "";
  for (var i = 0; i < linkedList.list.length; i++) {
    for (key in linkedList.list[i]) {
      if (key === name) {
        link = linkedList.list[i]["" + name];
      }
    }
  }
  if (link === "") {
    link = "";
  }
  return link;
}
