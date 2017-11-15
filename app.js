
const express = require ('express');
const app = express ();
const httpProxy = require ('http-proxy');
const proxy = httpProxy.createProxyServer ();

const config = {
	port: 8080,
	allowedPorts: [
		{
			from: 3000,
			to: 16000
		}
	]
};

(() => {
	try {
		var loadedConfig = JSON.parse (require ('fs').readFileSync ('config.json', 'utf8'));
		for (var k in loadedConfig) {
			if (k.startsWith ('$')) continue;
			config[k] = loadedConfig[k];
		}
	} catch (err) {
		console.log ('No config.json present or unable to parse it:\n', err);
	}
}) ();

function isPortAllowed (port) {
	for (var i = 0; i < config.allowedPorts.length; i++) {
		var allowance = config.allowedPorts[i];
		if (allowance === port) return true;
		if (typeof (allowance) !== 'object') continue;
		if (typeof (allowance.from) === 'number' && typeof (allowance.to) === 'number') {
			if (port >= allowance.from && port <= allowance.to) {
				return true;
			}
		} else if (typeof (allowance.port) === 'number') {
			if (allowance.port === port) {
				return true;
			}
		}
	}
	return false;
}


var triedConnections = {};
process.on('uncaughtException', function (err) {
	if (err.code === 'ECONNREFUSED' && err.address === '127.0.0.1' && err.port) {
		if (triedConnections[err.port]) {
			triedConnections[err.port].forEach (res => {
				res
					.status(404)
					.send('<!DOCTYPE html>\r\n<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1>Unable to access resource</body></html>');
			});
			triedConnections[err.port] = [];
		}
		return;
	}
	console.log('--< UNCAUGHT EXCEPTION >--');
	console.log(err);
});




app.all ('/', (req, res) => {
	res
		.status (403)
		.send ('<!DOCTYPE html>\r\n<html><head><title>403 Fobidden</title></head><body><h1>403 Forbidden</h1>Unable to access resource</body></html>');
})

app.all (/\/([0-9]+)(.*)/, (req, res) => {
	var targetPort = parseInt (req.params[0]);
	if (!isPortAllowed (targetPort)) {
		res
			.status (403)
			.send ('<!DOCTYPE html>\r\n<html><head><title>403 Fobidden</title></head><body><h1>403 Forbidden</h1>Unable to access resource</body></html>');
		return;
	}
	req.url = req.params[1] || '/';
	req.headers['X-IP'] = req.connection.remoteAddress;
	console.log ('proxy -> ' + req.params[0]);
	try {
		if (!triedConnections[targetPort]) {
			triedConnections[targetPort] = [res];
		} else {
			triedConnections[targetPort].push (res);
		}
		proxy.web (req, res, {
			target: 'http://127.0.0.1:' + req.params[0]
		});
		setTimeout (() => {
			var arr = triedConnections[targetPort];
			for (var i = arr.length - 1; i >= 0; i--) {
				if (arr[i] === res) {
					arr.splice (i, 1);
				}
			}
		}, 5000);
	} catch (err) {
		console.log (err);
		res
			.status (404)
			.send ('<!DOCTYPE html>\r\n<html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1>Unable to access resource</body></html>');
	}
});

app.listen (config.port, () => {
	console.log ('Port-Forwarder listening on port ' + config.port);
});



// var test = express ();
// test.get ('/test', (req, res) => {
// 	res.send ('<!DOCTYPE html>\r\n<html><body><pre>SUCCESS 8)\n' + JSON.stringify (req.headers, null, 4) + '</pre></body></html>');
// });
// test.all (/(.*)/, (req, res) => {
// 	res.send ('<!DOCTYPE html>\r\n<html><body><pre>URL = ' + req.url + '</pre></body></html>');
// });
// test.listen (3001, () => {
// 	console.log ('Test listening on port 3001');
// });

