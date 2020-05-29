import './index.scss';
import osjs from 'osjs';
import {name as applicationName} from './metadata.json';

import {h, app} from 'hyperapp';

import { Terminal } from 'xterm';

const createView = (state, actions) => h("div", { id: "terminal" });

let term = {};

const updateDisplay = ($content) => {
    term.open($content);
}

const createApp = (proc, win, $content) => {
  updateDisplay($content);
};

// Our launcher
const register = (core, args, options, metadata) => {
  // Create a new Application instance
  const proc = core.make('osjs/application', {args, options, metadata});


  // Creates a new WebSocket connection (see server.js)
  const sock = proc.socket('/socket');
  //sock.on('open', () => sock.send('Ping'));


  proc.on('create-window', (win, proc2) => {
    term = new Terminal();
    sock.on('message', (...args) => {
      console.log(args);
      args.forEach(arg => term.write(arg.data));
    });

    const prompt = () => {
      sock.send('\r\n');
    };

    term.onKey(e => {
        const printable = !e.domEvent.altKey
          && !e.domEvent.altGraphKey
          && !e.domEvent.ctrlKey
          && !e.domEvent.metaKey;

        //console.log(e);

        if (e.domEvent.keyCode === 13) {
            prompt();
        } else if (e.domEvent.keyCode === 8) {
            // Do not delete the prompt
            if (term._core.buffer.x > 2) {
                sock.send('\b \b');
            }
        } else if (printable) {
            sock.send(e.key);
        }
    });
  });

  // Create  a new Window instance
  proc.createWindow({
    id: 'xtermjsWindow',
    title: metadata.title.en_EN,
    dimension: {width: 720, height: 408},
    attributes: { gravity: 'center' }
  })
    .on('destroy', () => proc.destroy())
    .render(($content, win) => createApp(proc, win, $content))

  // Creates a HTTP call (see server.js)
  //proc.request('/test', {method: 'post'})
  //.then(response => console.log(response));

  return proc;
};

// Creates the internal callback function when OS.js launches an application
osjs.register(applicationName, register);
