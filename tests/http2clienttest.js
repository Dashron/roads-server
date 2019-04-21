const http2 = require('http2');
const client = http2.connect('http://localhost:8443');
client.on('socketError', (err) => console.error(err));
client.on('error', (err) => console.error(err));

function handleReq(req) {
    req.on('response', (headers, flags) => {
        for (const name in headers) {
            console.log(`${name}: ${headers[name]}`);
        }
    });

    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
        console.log(`\n${data}`);
    });
    req.end();
}

handleReq(client.request({ ':path': '/' }));
/*handleReq(client.request({ ':path': '/test' , ':method': 'POST'}, {
    endStream: false
}));*/
