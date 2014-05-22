var http = require('http');
var fs = require('fs');
var url = require('url');

http.createServer(function (req, res) {
    var chunks = [];
    var boundary = req.headers['content-type'].split("boundary")[1];
    boundary = boundary.substr(1);

    var params = url.parse(req.url,true);
    console.log(params.query);
    
    req.on("data",function(chunk){
	chunks.push(chunk);
    });
    
    req.on('end',function(){
	var buffer = Buffer.concat(chunks);
	var content = buffer.toString("binary");
	var parts = content.split(boundary);
		
	var fileExt = parts[1].split('\r\n')[3].split('.')[1];
	
	var fileName = new Date().getTime()+"."+fileExt;
	var count=3;
	var idx = 0;
	while(count>0){
	    while(parts[2].charAt(idx)!='\n'){
		idx++;
	    }
	    count--;
	    idx++;
	}
	
	var data = parts[2].substr(idx+2,parts[2].length-idx-6);
	fs.writeFile(fileName,data,{encoding:'binary'},function(){
	    console.log(fileName);
	});
	
	res.end(fileName + '\r\n');
    });
    
    res.writeHead(200, {'Content-Type': 'text/plain'});
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
