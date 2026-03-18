#!/usr/bin/env node

/**
 * Better-Auth Documentation Scraper
 * 
 * Este script facilita el scraping de documentación de better-auth
 * para mantener actualizado el skill del proyecto.
 * 
 * Uso:
 *   node .mcp/better-auth-scraper.js <url>
 * 
 * URLs útiles:
 *   - https://better-auth.com/docs
 *   - https://better-auth.com/docs/plugins/oauth-provider
 *   - https://better-auth.com/docs/authentication/email-password
 *   - https://better-auth.com/docs/authentication/sessions
 */

const https = require('https');
const http = require('http');

/**
 * Hace fetch de una URL y devuelve el HTML
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Extrae texto limpio del HTML
 */
function extractText(html) {
  // Remover scripts y estilos
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remover comentarios HTML
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remover tags HTML pero mantener el texto
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Limpiar espacios múltiples
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Extrae links del HTML
 */
function extractLinks(html, baseUrl) {
  const linkRegex = /href=["']([^"']+)["']/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];
    
    // Convertir URLs relativas a absolutas
    if (href.startsWith('/')) {
      href = new URL(href, baseUrl).href;
    }
    
    // Solo incluir links de better-auth.com
    if (href.includes('better-auth.com')) {
      links.push(href);
    }
  }
  
  return [...new Set(links)];
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(JSON.stringify({
      error: 'URL requerida',
      usage: 'node .mcp/better-auth-scraper.js <url>',
      examples: [
        'node .mcp/better-auth-scraper.js https://better-auth.com/docs',
        'node .mcp/better-auth-scraper.js https://better-auth.com/docs/plugins/oauth-provider'
      ]
    }, null, 2));
    process.exit(1);
  }
  
  const url = args[0];
  
  try {
    console.error(`Fetching: ${url}`);
    const html = await fetchUrl(url);
    const text = extractText(html);
    const links = extractLinks(html, url);
    
    console.log(JSON.stringify({
      url,
      text,
      relatedLinks: links,
      fetchedAt: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    process.exit(1);
  }
}

main();
