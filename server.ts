import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";

const PORT = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  
  // Serve static files from the public directory
  if (url.pathname.startsWith("/static/")) {
    return await serveDir(req, {
      fsRoot: "public",
      urlRoot: "static",
    });
  }
  
  // Main app route
  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = await Deno.readTextFile("public/index.html");
      return new Response(html, {
        headers: {
          "content-type": "text/html",
          "access-control-allow-origin": "*",
        },
      });
    } catch {
      return new Response("App not found", { status: 404 });
    }
  }
  
  // API route for arc device info
  if (url.pathname === "/api/arc/info") {
    return new Response(JSON.stringify({
      name: "monome arc",
      protocol: "serial",
      supported: true
    }), {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    });
  }
  
  return new Response("Not Found", { status: 404 });
}

console.log(`Server running on http://localhost:${PORT}`);
await serve(handler, { port: PORT });