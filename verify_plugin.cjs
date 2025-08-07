const WebSocket = require('ws');
const http = require('http');

async function verifyPlugin() {
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
  
  console.log('Verifying LauncherHub plugin is actually running...\n');
  const ws = new WebSocket(sharedJS.webSocketDebuggerUrl);
  
  ws.on('open', () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Console.enable' }));
    
    // Check if plugin is ACTUALLY loaded and working
    ws.send(JSON.stringify({
      id: 3,
      method: 'Runtime.evaluate',
      params: {
        expression: `
          (function() {
            console.log('[Verify] Starting verification...');
            
            // Check if DeckyPluginLoader exists
            if (!window.DeckyPluginLoader) {
              return { error: 'DeckyPluginLoader not found' };
            }
            
            // Check the plugin store
            const store = window.DeckyPluginLoader.pluginStore;
            if (!store) {
              return { error: 'Plugin store not found' };
            }
            
            // Get all plugins
            const plugins = store.plugins.map(p => ({
              name: p.name,
              enabled: p.enabled,
              hasComponent: !!p.content,
              error: p.error || null
            }));
            
            // Look for LauncherHub
            const launcher = plugins.find(p => p.name === 'Launcher Hub');
            
            // Try to check if the plugin actually rendered
            const quickAccessRoot = document.querySelector('.quickaccessmenu_TabGroupPanel_1QO7b');
            const hasLauncherIcon = quickAccessRoot ? 
              Array.from(quickAccessRoot.querySelectorAll('.quickaccesscontrols_PanelSection_3gY0a')).some(el => 
                el.textContent.includes('Launcher Hub') || el.textContent.includes('🚀')
              ) : false;
            
            // Check if our Backend class exists globally
            const hasBackendClass = typeof Backend !== 'undefined';
            
            return {
              pluginCount: plugins.length,
              plugins: plugins,
              launcherFound: !!launcher,
              launcherDetails: launcher || null,
              hasQuickAccessIcon: hasLauncherIcon,
              hasBackendClass: hasBackendClass
            };
          })()
        `
      }
    }));
    
    // Also try to manually check for our plugin
    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 4,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            // Try to find our plugin in the actual rendered DOM
            const tabs = document.querySelectorAll('.gamepadtabbedpage_Tab_3eEbS');
            const launcherTab = Array.from(tabs).find(t => 
              t.textContent.includes('🚀') || t.textContent.includes('Launcher')
            );
            
            if (launcherTab) {
              console.log('[Verify] Found launcher tab in DOM!');
              launcherTab.click();
              'Found and clicked launcher tab';
            } else {
              console.log('[Verify] No launcher tab found in DOM');
              'No launcher tab found';
            }
          `
        }
      }));
    }, 1000);
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    
    // Console messages
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args || [];
      const text = args.map(arg => arg.value || arg.description || '').join(' ');
      if (text.includes('[Verify]') || text.includes('Launcher')) {
        console.log(text);
      }
    }
    
    // Main result
    if (msg.id === 3 && msg.result && msg.result.result) {
      const result = msg.result.result.value;
      if (typeof result === 'string') {
        try {
          const data = JSON.parse(result);
          
          console.log('\n=== PLUGIN VERIFICATION RESULTS ===');
          
          if (data.error) {
            console.log('❌ ERROR:', data.error);
          } else {
            console.log(`Total plugins loaded: ${data.pluginCount}`);
            console.log('\nAll plugins:');
            data.plugins.forEach(p => {
              const icon = p.enabled ? '✅' : '❌';
              const component = p.hasComponent ? '📦' : '⚠️';
              console.log(`  ${icon} ${p.name} ${component} ${p.error ? `ERROR: ${p.error}` : ''}`);
            });
            
            if (data.launcherFound) {
              console.log('\n🚀 LAUNCHER HUB FOUND:');
              console.log('  Details:', JSON.stringify(data.launcherDetails, null, 2));
            } else {
              console.log('\n❌ Launcher Hub NOT in plugin list');
            }
            
            console.log('\nDOM Checks:');
            console.log(`  Quick Access Icon: ${data.hasQuickAccessIcon ? '✅ Found' : '❌ Not found'}`);
            console.log(`  Backend Class: ${data.hasBackendClass ? '✅ Exists' : '❌ Not found'}`);
          }
        } catch (e) {
          console.log('Result:', result);
        }
      }
    }
    
    // DOM check result
    if (msg.id === 4 && msg.result && msg.result.result) {
      console.log('\nDOM Tab Search:', msg.result.result.value);
      setTimeout(() => {
        ws.close();
        process.exit(0);
      }, 500);
    }
  });
  
  setTimeout(() => {
    console.log('Timeout');
    ws.close();
    process.exit(1);
  }, 5000);
}

verifyPlugin().catch(console.error);