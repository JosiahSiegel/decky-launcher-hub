const WebSocket = require('ws');
const http = require('http');

async function forceReload() {
  const response = await new Promise((resolve, reject) => {
    http.get('http://192.168.68.80:8081/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
  
  const sharedJS = response.find(t => t.title === 'SharedJSContext');
  if (!sharedJS) {
    console.log('SharedJSContext not found');
    return;
  }
  
  console.log('Force reloading Launcher Hub plugin...\n');
  const ws = new WebSocket(sharedJS.webSocketDebuggerUrl);
  
  ws.on('open', () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Console.enable' }));
    
    // Force reload by clearing cache and reimporting
    ws.send(JSON.stringify({
      id: 3,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (async function() {
            console.log('[ForceReload] Starting force reload...');
            
            // Clear any cached scripts
            const scripts = Array.from(document.querySelectorAll('script'));
            const launcherScript = scripts.find(s => 
              s.src && s.src.includes('launcher-hub')
            );
            
            if (launcherScript) {
              console.log('[ForceReload] Removing old script tag');
              launcherScript.remove();
            }
            
            // Force reload with timestamp
            const timestamp = Date.now();
            const scriptUrl = 'http://127.0.0.1:1337/plugins/Launcher%20Hub/dist/index.js?t=' + timestamp;
            
            console.log('[ForceReload] Loading new script:', scriptUrl);
            
            const newScript = document.createElement('script');
            newScript.type = 'module';
            newScript.src = scriptUrl;
            
            newScript.onload = () => {
              console.log('[ForceReload] Script loaded successfully');
            };
            
            newScript.onerror = (e) => {
              console.error('[ForceReload] Script load error:', e);
            };
            
            document.head.appendChild(newScript);
            
            return 'Force reload initiated with timestamp: ' + timestamp;
          })()
        `
      }
    }));
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    // Console messages
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args || [];
      const text = args.map(arg => arg.value || arg.description || '').join(' ');
      if (text.includes('[ForceReload]') || text.includes('LauncherHub')) {
        console.log(text);
      }
    }
    
    // Result
    if (msg.id === 3 && msg.result && msg.result.result) {
      console.log('\nResult:', msg.result.result.value);
      
      // Wait a bit then check again
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 4,
          method: 'Runtime.evaluate',
          params: {
            expression: `console.log('[ForceReload] Check complete'); 'done'`
          }
        }));
      }, 2000);
    }
    
    if (msg.id === 4) {
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 500);
    }
    
    // Exception
    if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails;
      console.log('EXCEPTION:', details.text);
    }
  });
  
  setTimeout(() => {
    console.log('Timeout');
    ws.close();
    process.exit(1);
  }, 10000);
}

forceReload().catch(console.error);