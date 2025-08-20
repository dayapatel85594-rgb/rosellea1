export default class Router {
  constructor() { this.routes = []; }
  get(path, handler) { this.routes.push({ method:'GET', path, handler }); }
  post(path, handler){ this.routes.push({ method:'POST', path, handler }); }
  put(path, handler) { this.routes.push({ method:'PUT', path, handler }); }
  delete(path,handler){ this.routes.push({ method:'DELETE', path, handler }); }
  use(base, r){
    r.routes.forEach(rt=>{
      // Handle empty path correctly
      const fullPath = rt.path === '' ? base : base + rt.path;
      this.routes.push({
        method:rt.method,
        path: fullPath,
        handler:rt.handler
      });
    });
  }
  handle(req, res){
    const { url, method } = req;
    const cleanUrl = url.split('?')[0]; // Remove query parameters for matching
    
    const route = this.routes.find(r=>{
      if(r.method!==method) return false;
      if(r.path===cleanUrl) return true;
      if(r.path.endsWith('/*')){
        const p = r.path.slice(0,-2);
        return cleanUrl.startsWith(p);
      }
      // Handle parameterized routes like /:id
      if(r.path.includes(':')){
        const pathParts = r.path.split('/');
        const urlParts = cleanUrl.split('/');
        if(pathParts.length !== urlParts.length) return false;
        return pathParts.every((part, i) => part.startsWith(':') || part === urlParts[i]);
      }
      return false;
    });
    
    if (route) {
      console.log(`[ROUTE MATCH] ${method} ${cleanUrl} -> ${route.path}`);
      try {
        route.handler(req, res);
      } catch (error) {
        console.error('Route handler error:', error);
        if (!res.headersSent) {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({success: false, message: 'Internal server error'}));
        }
      }
    } else {
      console.log(`[ROUTE MISS] ${method} ${cleanUrl} - Available routes:`, this.routes.map(r => `${r.method} ${r.path}`));
      res.writeHead(404,{'Content-Type':'application/json'});
      res.end(JSON.stringify({success:false,message:'Not found'}));
    }
  }
}
