const { exec } = require("child_process");

const { LineStream } = require('nstream');

// Methods OS.js server requires
module.exports = (core, proc) => ({

  // When server initializes
  init: async () => {
    // HTTP Route example (see index.js)
    core.app.post(proc.resource('/test'), (req, res) => {
      res.json({hello: 'World'});
    });

    // WebSocket Route example (see index.js)
    core.app.ws(proc.resource('/socket'), (ws, req) => {
      console.log('new client connected!')

      const ls = new LineStream();
      ls.on('data', (data) => {
        const msg = data.toString('utf8')
        console.log('lsd', msg);
        exec(`bash -c '${msg}'`, (err, stdout, stderr) => {
          if (err) {
            console.error(`exec error: ${err}`);
            ws.send(err.message);
            ws.send('\r\n$ ');
            return;
          }
          ws.send(`stdout: ${stdout}`);
          ws.send(`stderr: ${stderr}`);
          ws.send('\r\n$ ');
        })

      });

      ws.on('message', msg => {
        ws.send(msg);
        ls.write(msg);
      });

      ws.send('Hello from \x1B[1;3;31mxterm.js\x1B[0m \r\n$ ')
    });
  },

  // When server starts
  start: () => {},

  // When server goes down
  destroy: () => {},

  // When using an internally bound websocket, messages comes here
  onmessage: (ws, respond, args) => {}
});
