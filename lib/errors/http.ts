import type { ErrorCode } from './types';

export const httpErrors: Record<string, ErrorCode> = {
    '400': {
      code: '400',
      name: 'Bad Request',
      description: `Seeing a 400 Bad Request means the server rejected your request because it's malformed—invalid JSON syntax, missing required fields, or parameters that violate validation rules. This client-side error (4xx) happens when the browser or API client sends data the server can't parse or validate. Most common in API calls where JSON payloads have syntax errors, but also appears when form submissions miss required fields or URLs contain invalid query parameters.`,
      metaDescription: 'Struggling with a 400 Bad Request? Master debugging malformed JSON syntax, missing headers, and validation failures with our comprehensive troubleshooting guide.',
      causes: [
        `Frontend: Malformed JSON in request body—unclosed brackets, trailing commas, or invalid syntax. Missing Content-Type: application/json header. Invalid URL encoding in query parameters.`,
        `Backend: Request validation middleware rejects data before it reaches your handler. Database constraints fail during insertion. Missing request body parser middleware (express.json(), body-parser).`,
        `Infrastructure: Nginx/Apache misconfiguration rejects large request bodies. Load balancer strips required headers. Reverse proxy timeout cuts request mid-stream.`,
      ],
      solutions: [
        `Step 1: Diagnose - Open browser DevTools Network tab, find the 400 request, check the Request Payload/Headers tab for syntax errors. Look for red-highlighted JSON or missing Content-Type headers.`,
        `Step 2: Diagnose - Check server logs (tail -f /var/log/nginx/error.log or your app logs) for specific validation errors. Most frameworks log the exact field that failed.`,
        `Step 3: Fix - Validate data client-side before sending: use JSON.parse() to test JSON validity, check required fields, validate email formats and string lengths.`,
        `Step 4: Fix - Server-side: Add request validation middleware (express-validator, joi, zod) to catch errors early and return clear 400 messages. Ensure body-parser is configured with appropriate size limits.`,
        `Step 5: Fix - Infrastructure: Increase client_max_body_size in Nginx if uploading files. Check proxy_read_timeout and proxy_connect_timeout settings. Verify headers aren't being stripped by the reverse proxy.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Client-Side Validation',
          code: `// Validate request before sending to prevent 400 errors
const validateRequest = (data) => {
  if (!data.email || !data.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  if (!data.name || data.name.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }
  return true;
};

// Usage with proper error handling
try {
  validateRequest(requestData);
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  
  if (!response.ok && response.status === 400) {
    const error = await response.json();
  console.error('Validation error:', error.message);
  }
} catch (error) {
  console.error('Request error:', error.message);
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Request Validation Middleware',
          code: `// Server-side validation middleware to catch 400 errors early
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();

app.use(express.json({ limit: '10mb' }));

// Validation middleware
const validateUser = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Apply validation to route
app.post('/api/users', validateUser, (req, res) => {
  // Request is validated, proceed with business logic
  res.json({ success: true, user: req.body });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Increase Request Body Size Limit',
          code: `# Nginx configuration to handle larger request bodies
# In your server or location block:

server {
    listen 80;
    server_name api.example.com;
    
    # Increase client body size limit (default is 1MB)
    client_max_body_size 10m;
    
    # Increase buffer sizes for large headers
    client_header_buffer_size 4k;
    large_client_header_buffers 4 16k;
    
    # Timeouts for slow clients
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}`,
        },
      ],
      relatedCodes: ['401', '422'],
      provider: 'http',
    },
    '401': {
      code: '401',
      name: 'Unauthorized',
      description: `Hitting a 401 Unauthorized means the server rejected your request because authentication is required—missing Authorization header, expired JWT token, or invalid credentials. This client-side error (4xx) occurs when the server can't verify your identity. Most common in API calls where Bearer tokens are missing or expired, but also appears when session cookies expire or login credentials are incorrect.`,
      metaDescription: 'Fix 401 Unauthorized errors by mastering token refresh flows, checking Authorization headers, and resolving expired JWT issues with expert techniques.',
      causes: [
        `Frontend: Missing Authorization header in fetch/axios requests. Token expired but not refreshed. Token stored incorrectly (localStorage vs sessionStorage). CORS preflight fails before auth header is sent.`,
        `Backend: JWT token validation middleware rejects expired or malformed tokens. Session middleware can't find session cookie. Password hashing comparison fails. Token blacklist/revocation check fails.`,
        `Infrastructure: Reverse proxy strips Authorization headers. Load balancer session affinity breaks. CDN caching protected routes. Nginx auth_request module fails upstream check.`,
      ],
      solutions: [
        `Step 1: Diagnose - Open DevTools Network tab, check Request Headers for Authorization: Bearer <token>. Verify token exists and isn't expired (decode JWT at jwt.io). Check if token is sent on preflight OPTIONS request.`,
        `Step 2: Diagnose - Check server logs for authentication failures. Look for "Token expired", "Invalid signature", or "Session not found" errors. Review middleware execution order.`,
        `Step 3: Fix - Client-side: Implement token refresh logic—intercept 401 responses, call /refresh endpoint, retry original request. Store tokens securely (httpOnly cookies preferred over localStorage).`,
        `Step 4: Fix - Server-side: Add proper JWT validation middleware. Check token expiration (exp claim), verify signature, validate issuer (iss) and audience (aud). Implement token refresh endpoint with rotation.`,
        `Step 5: Fix - Infrastructure: Ensure Nginx/Apache passes Authorization headers to backend (proxy_set_header Authorization \$http_authorization). Disable caching for protected routes. Verify session affinity in load balancer.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Token Refresh on 401',
          code: `// Client-side: Handle 401 with automatic token refresh
async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem('authToken');
  
  const response = await fetch(url, {
    ...options,
  headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    // Token expired, refresh it
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Include httpOnly refresh token cookie
    });
    
    if (refreshResponse.ok) {
      const { accessToken } = await refreshResponse.json();
      localStorage.setItem('authToken', accessToken);
      
      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          'Authorization': \`Bearer \${accessToken}\`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }
  
  return response;
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: JWT Authentication Middleware',
          code: `// Server-side: JWT validation middleware
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
};

// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Authorization Headers',
          code: `# Nginx: Ensure Authorization headers reach backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        
        # Pass authorization header to backend
        proxy_set_header Authorization \$http_authorization;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Don't cache authenticated requests
        proxy_cache_bypass \$http_authorization;
        add_header Cache-Control "no-store, no-cache";
    }
}`,
        },
      ],
      relatedCodes: ['403', '407'],
      provider: 'http',
    },
    '403': {
      code: '403',
      name: 'Forbidden',
      description: `Getting a 403 Forbidden means the server knows who you are (unlike 401) but explicitly denies access—your user lacks permissions, the resource is restricted, or IP-based access control blocked you. This client-side error (4xx) happens after authentication succeeds but authorization fails. Most common when authenticated users try to access admin-only resources, but also appears when geographic restrictions, rate limiting, or firewall rules block requests.`,
      metaDescription: 'Solve 403 Forbidden access issues by debugging RBAC permissions, IP whitelisting, and WAF configurations with our detailed troubleshooting steps.',
      causes: [
        `Frontend: User lacks required role/permissions for the resource. Trying to access another user's private data. Account suspended or disabled but token still valid. CORS policy blocks cross-origin requests.`,
        `Backend: Role-based access control (RBAC) denies operation. Resource ownership check fails (user tries to access another user's data). IP whitelist/blacklist filtering. Rate limiting triggers. Account status check returns disabled.`,
        `Infrastructure: Web Application Firewall (WAF) blocks request patterns. Nginx/Apache access rules deny IP ranges. CDN geo-blocking restricts regions. Load balancer ACL rules.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—many APIs return specific permission errors. Verify user role/permissions in user profile or admin panel. Check if account is active.`,
        `Step 2: Diagnose - Server logs show which permission check failed. Look for "Insufficient permissions", "Access denied", or "Forbidden" messages with user ID and resource path.`,
        `Step 3: Fix - Client-side: Check user permissions before making requests. Show friendly "You don't have permission" messages. Implement role-based UI hiding (don't show admin buttons to regular users).`,
        `Step 4: Fix - Server-side: Review RBAC policies and permission checks. Verify resource ownership before allowing access. Check IP whitelist/blacklist logic. Implement proper error messages (don't leak sensitive info).`,
        `Step 5: Fix - Infrastructure: Review WAF rules for false positives. Check Nginx allow/deny directives. Verify CDN geo-blocking settings. Review load balancer security groups.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 403 with User Feedback',
          code: `// Client-side: Handle 403 errors gracefully
async function fetchResource(resourceId) {
  const response = await fetch(\`/api/resources/\${resourceId}\`, {
    headers: {
      'Authorization': \`Bearer \${localStorage.getItem('token')}\`,
    },
  });
  
  if (response.status === 403) {
    const error = await response.json();
    // Show user-friendly message
    alert(\`Access denied: \${error.message || 'You don't have permission to access this resource'}\`);
    return null;
  }
  
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Role-Based Access Control',
          code: `// Server-side: RBAC middleware
const express = require('express');
const app = express();

// Role-based permission check middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user; // From authentication middleware
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if user has required permission
    const hasPermission = user.permissions.includes(permission) || 
                         user.role === 'admin';
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: \`You don't have permission to \${permission}\`
      });
    }
    
    next();
  };
};

// Resource ownership check
const checkOwnership = (req, res, next) => {
  const resource = getResource(req.params.id);
  
  if (resource.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Not resource owner' });
  }
  
  next();
};

// Protected routes
app.get('/api/resources/:id', authenticateToken, checkOwnership, (req, res) => {
  res.json({ data: getResource(req.params.id) });
});

app.delete('/api/resources/:id', authenticateToken, requirePermission('delete'), (req, res) => {
  deleteResource(req.params.id);
  res.json({ success: true });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: IP-Based Access Control',
          code: `# Nginx: Block/allow specific IPs or ranges
server {
    listen 80;
    server_name api.example.com;
    
    # Allow specific IPs
    location /api/admin/ {
        allow 192.168.1.0/24;  # Internal network
        allow 10.0.0.50;        # Specific IP
        deny all;                # Block everything else
        
        proxy_pass http://backend;
    }
    
    # Block specific IPs
    location /api/ {
        deny 192.168.1.100;     # Block specific IP
        deny 10.0.0.0/8;         # Block IP range
        allow all;
        
        proxy_pass http://backend;
    }
}`,
        },
      ],
      relatedCodes: ['401', '404'],
      provider: 'http',
    },
    '404': {
      code: '404',
      name: 'Not Found',
      description: `Seeing a 404 Not Found means the server couldn't locate the resource—wrong URL, deleted endpoint, typo in the path, or route handler doesn't exist. This client-side error (4xx) occurs when the request reaches the server but no route matches. Most common when API endpoints are misspelled or resources are deleted, but also appears when frontend routes don't match backend routes or HTTP methods are incorrect.`,
      metaDescription: 'Debug 404 Not Found errors by verifying URL paths, checking route handlers, and matching frontend routes to backend endpoints effectively.',
      causes: [
        `Frontend: Typo in URL path (/api/user vs /api/users). Resource ID doesn't exist (deleted user, invalid ID). Incorrect HTTP method (GET instead of POST). Frontend routing doesn't match backend API structure.`,
        `Backend: Route handler missing for the endpoint. Resource deleted from database but URL still referenced. Incorrect route order (more specific routes after catch-all). Route parameters don't match expected format.`,
        `Infrastructure: Nginx rewrite rules don't match URL patterns. Reverse proxy routing misconfiguration. Static file serving fails (missing files in public directory). API gateway route mapping incorrect.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify exact URL being requested. Compare with API documentation. Check if URL has typos or extra/missing slashes. Verify HTTP method matches endpoint requirements.`,
        `Step 2: Diagnose - Check server logs for route matching attempts. Review Express/FastAPI route definitions. Verify resource exists in database with that ID. Check if route is defined before catch-all handlers.`,
        `Step 3: Fix - Client-side: Validate resource IDs before requests. Show user-friendly "Resource not found" messages. Implement proper error boundaries for 404s. Double-check API endpoint URLs against documentation.`,
        `Step 4: Fix - Server-side: Add catch-all 404 handler that returns JSON (not HTML) for API routes. Verify route ordering (specific routes before parameterized routes). Check database queries return null handling.`,
        `Step 5: Fix - Infrastructure: Review Nginx location block order (specific paths first). Check proxy_pass URLs match backend routes. Verify static file directories exist. Review API gateway route mappings.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Graceful 404 Handling',
          code: `// Client-side: Handle 404 errors with user feedback
async function fetchUser(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (response.status === 404) {
      // Show user-friendly error
      showNotification('User not found', 'error');
      return null;
    }
    
    if (!response.ok) {
      throw new Error(\`Request failed: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    showNotification('Failed to load user', 'error');
    return null;
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: API 404 Handler',
          code: `// Server-side: Proper 404 handling for APIs
const express = require('express');
const app = express();

// API routes (must be before 404 handler)
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'Not Found',
      message: \`User with ID \${req.params.id} not found\`
    });
  }
  
  res.json(user);
});

// Catch-all 404 handler for API routes (must be last)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: \`API endpoint \${req.method} \${req.path} not found\`,
    availableEndpoints: ['/api/users', '/api/posts']
  });
});

// For non-API routes (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Proper Route Handling',
          code: `# Nginx: Handle API routes and SPA fallback
server {
    listen 80;
    server_name api.example.com;
    root /var/www/app/public;
    
    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Return JSON 404 for API routes
        error_page 404 = @api_not_found;
    }
    
    location @api_not_found {
        default_type application/json;
        return 404 '{"error":"Not Found","message":"API endpoint not found"}';
    }
    
    # Static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}`,
        },
      ],
      relatedCodes: ['400', '403', '410'],
      provider: 'http',
    },
    '405': {
      code: '405',
      name: 'Method Not Allowed',
      description: `Getting a 405 Method Not Allowed means you're using the wrong HTTP method—trying to DELETE on a GET-only endpoint, POST on a read-only route, or the server doesn't support that method for that path. This client-side error (4xx) happens when the route exists but the method is invalid. Most common when REST API conventions are violated (GET for updates), but also appears when CORS preflight OPTIONS requests aren't handled or methods are disabled by configuration.`,
      metaDescription: 'Master fixing 405 Method Not Allowed by checking Allow headers, handling CORS preflight requests, and using correct HTTP verbs for each endpoint.',
      causes: [
        `Frontend: Wrong HTTP method for endpoint (PUT instead of PATCH, DELETE instead of POST). CORS preflight OPTIONS request fails. Method not allowed in fetch/axios call. Browser form submission uses wrong method attribute.`,
        `Backend: Route handler only implements GET, not POST/PUT/DELETE. Missing OPTIONS handler for CORS preflight. Method explicitly disabled in route configuration. Route middleware rejects specific methods.`,
        `Infrastructure: Nginx/Apache blocks specific methods (deny DELETE). Load balancer method filtering. WAF blocks certain HTTP methods. API gateway method restrictions.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify the HTTP method shown (GET, POST, PUT, DELETE). Check Response Headers for Allow header listing supported methods. Review API documentation for correct method.`,
        `Step 2: Diagnose - Server logs show which method was attempted. Check route definitions—verify method is implemented. Review CORS configuration for OPTIONS handling. Check middleware that filters methods.`,
        `Step 3: Fix - Client-side: Use correct HTTP method per API docs. Check Allow header from OPTIONS request to see supported methods. Ensure CORS preflight OPTIONS succeeds before main request.`,
        `Step 4: Fix - Server-side: Implement route handlers for all required methods. Add OPTIONS handler for CORS preflight. Include Allow header in 405 responses. Review route method registrations.`,
        `Step 5: Fix - Infrastructure: Check Nginx limit_except directives. Review WAF method filtering rules. Verify API gateway method mappings. Ensure load balancer passes all methods.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Check Allowed Methods',
          code: `// Client-side: Check allowed methods before request
async function fetchWithMethodCheck(url, method) {
  // Check allowed methods via OPTIONS
  const optionsResponse = await fetch(url, { method: 'OPTIONS' });
  const allowedMethods = optionsResponse.headers.get('Allow')?.split(', ') || [];
  
  if (!allowedMethods.includes(method)) {
    console.error(\`Method \${method} not allowed. Allowed: \${allowedMethods.join(', ')}\`);
    return null;
  }
  
  // Make request with correct method
  const response = await fetch(url, { method });
  
    if (response.status === 405) {
      const allowed = response.headers.get('Allow');
    throw new Error(\`Method \${method} not allowed. Use: \${allowed}\`);
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: CORS and Method Handling',
          code: `// Server-side: Handle CORS preflight and method restrictions
const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration for preflight OPTIONS
app.use(cors({
  origin: 'https://example.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS preflight
app.options('/api/users', (req, res) => {
  res.header('Allow', 'GET, POST, OPTIONS');
  res.sendStatus(200);
});

// Only allow GET and POST
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  res.json({ success: true });
});

// Handle unsupported methods
app.use('/api/users', (req, res) => {
  res.status(405)
     .header('Allow', 'GET, POST, OPTIONS')
     .json({ error: 'Method Not Allowed', allowed: ['GET', 'POST'] });
  });`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Method Restrictions',
          code: `# Nginx: Allow only specific HTTP methods
server {
    listen 80;
    server_name api.example.com;
    
    location /api/users {
        # Only allow GET and POST
        limit_except GET POST {
            deny all;
        }
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Handle OPTIONS for CORS
        if (\$request_method = OPTIONS) {
            add_header 'Allow' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            return 204;
        }
    }
}`,
        },
      ],
      relatedCodes: ['400', '501'],
      provider: 'http',
    },
    '408': {
      code: '408',
      name: 'Request Timeout',
      description: `Getting a 408 Request Timeout means the server stopped waiting for your request—the client took too long to send the complete request body, network latency delayed transmission, or the server's timeout is too aggressive. This client-side error (4xx) happens when the server closes the connection because the request headers or body didn't arrive within the allowed window. Most common during large file uploads without proper streaming, but also appears when slow network connections, client-side processing delays, or aggressive server timeout configurations cut requests short.`,
      metaDescription: 'Fix 408 Request Timeout errors by implementing chunked uploads, adjusting Nginx timeout settings, and optimizing slow network connections efficiently.',
      causes: [
        `Frontend: Large file uploads sent as single request without chunking or streaming. Client-side processing delays (image compression, data transformation) before sending. Slow network connections (mobile, weak WiFi) delay request transmission. Browser connection limits cause queuing delays.`,
        `Backend: Server timeout configured too short for large payloads. Request body parser (express.json()) times out before receiving full body. Database connection pool exhaustion delays request processing start. Application code blocks during request reception.`,
        `Infrastructure: Nginx proxy_read_timeout too short for slow clients. Load balancer idle timeout closes connection before request completes. Reverse proxy buffers full, drops connection. Network latency between client and server exceeds timeout window.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Timing section—look for "stalled" or long "TTFB" times. Verify if request was cancelled mid-transmission. Check browser console for timeout errors.`,
        `Step 2: Diagnose - Check server logs for timeout errors (tail -f /var/log/nginx/error.log). Look for "upstream timed out" or "client body timed out" messages. Review server timeout configuration values.`,
        `Step 3: Fix - Client-side: Implement chunked uploads for large files (split into 5MB chunks). Use AbortController with appropriate timeout. Stream request body instead of buffering entire payload.`,
        `Step 4: Fix - Server-side: Increase timeout settings (req.setTimeout(60000) for 60 seconds). Configure body parser with longer timeout. Use streaming body parsers for large uploads. Implement request queuing for slow clients.`,
        `Step 5: Fix - Infrastructure: Increase Nginx proxy_read_timeout and client_body_timeout (e.g., 120s). Configure load balancer idle timeout higher than server timeout. Enable connection keep-alive. Review reverse proxy buffering settings.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Client-Side Timeout Handling',
          code: `// Client-side: Handle timeout with AbortController
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

fetch('/api/upload', {
  method: 'POST',
  body: formData,
  signal: controller.signal
})
.then(response => {
  clearTimeout(timeoutId);
  if (!response.ok) {
    throw new Error(\`Upload failed: \${response.status}\`);
  }
  return response.json();
})
.catch(error => {
  clearTimeout(timeoutId);
  if (error.name === 'AbortError') {
    console.error('Request timeout after 60 seconds');
    showNotification('Upload timed out. Please try again.', 'error');
  } else {
    console.error('Upload error:', error);
  }
});

// Chunked upload to avoid timeout
async function uploadLargeFile(file) {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  const chunks = Math.ceil(file.size / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    await fetch('/api/upload-chunk', {
      method: 'POST',
      headers: {
        'Content-Range': \`bytes \${start}-\${end - 1}/\${file.size}\`,
        'X-Chunk-Index': i.toString(),
      },
      body: chunk,
    });
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Server-Side Timeout Configuration',
          code: `// Server-side: Configure timeouts for large requests
const express = require('express');
const app = express();

// Increase timeout for request body reception
app.use(express.json({ 
  limit: '50mb',
  extended: true 
}));

// Set request timeout (in milliseconds)
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes for slow clients
  res.setTimeout(120000);
  next();
});

// Handle timeout errors
app.use('/api/upload', (req, res, next) => {
  req.on('timeout', () => {
    res.status(408).json({ 
      error: 'Request Timeout',
      message: 'Request body took too long to receive'
    });
  });
  next();
});

// Streaming upload handler to avoid buffering delays
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  // Process uploaded file
  res.json({ success: true, filename: req.file.originalname });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Increase Timeout Settings',
          code: `# Nginx: Configure timeouts for slow clients and large uploads
server {
    listen 80;
    server_name api.example.com;
    
    # Increase timeouts for slow clients
    client_body_timeout 120s;      # Time to read client body
    client_header_timeout 60s;     # Time to read client headers
    keepalive_timeout 75s;         # Keep-alive timeout
    
    location /api/ {
        proxy_pass http://backend;
        
        # Proxy timeouts (must be > client timeouts)
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;   # Time to send request to backend
        proxy_read_timeout 120s;   # Time to read response from backend
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Increase buffer sizes for large requests
        proxy_request_buffering on;
        client_max_body_size 100m;
        client_body_buffer_size 1m;
    }
}`,
        },
      ],
      relatedCodes: ['504', '503'],
      provider: 'http',
    },
    '409': {
      code: '409',
      name: 'Conflict',
      description: `Hitting a 409 Conflict means your request collided with the server's current state—another process modified the resource, you tried to create a duplicate, or the operation conflicts with an in-progress transaction. This client-side error (4xx) happens when optimistic concurrency control detects state changes or business rules prevent the operation. Most common during concurrent edits where multiple users update the same resource, but also appears when creating resources with unique constraints, attempting state transitions that aren't allowed, or database transaction conflicts.`,
      metaDescription: 'Solve 409 Conflict errors by implementing ETag-based optimistic locking, handling concurrent modifications, and resolving duplicate resource creation issues.',
      causes: [
        `Frontend: Multiple users editing same resource simultaneously—last write wins scenarios. Client tries to create resource that already exists (duplicate email, username). Stale ETag used for conditional update after resource changed. Concurrent API calls from same client create race conditions.`,
        `Backend: Optimistic locking detects ETag/version mismatch during update. Unique constraint violation (database throws duplicate key error). State machine validation fails (trying to transition from invalid state). Transaction isolation level detects concurrent modification. Business logic prevents operation (e.g., can't delete active subscription).`,
        `Infrastructure: Load balancer routes concurrent requests to different backend instances without shared state. Database replication lag causes temporary inconsistencies. Cache invalidation timing creates stale reads. Distributed lock service fails to acquire lock.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—look for 409 response body with conflict details. Verify if multiple requests were sent simultaneously. Check ETag values in request/response headers for version mismatches.`,
        `Step 2: Diagnose - Server logs show which constraint or state check failed. Review database unique constraint violations. Check transaction logs for concurrent modification conflicts. Look for optimistic locking rejection messages.`,
        `Step 3: Fix - Client-side: Implement conflict resolution UI—show both versions, let user merge changes. Refresh resource and get new ETag before retry. Check for existing resources before creation (GET before POST). Use exponential backoff for retries.`,
        `Step 4: Fix - Server-side: Return detailed conflict information in 409 response (what changed, current state). Implement ETag-based optimistic locking. Use database transactions with proper isolation levels. Add unique constraint checks before insert.`,
        `Step 5: Fix - Infrastructure: Use distributed locks (Redis, etcd) for critical sections. Ensure database replication lag is acceptable. Implement cache invalidation strategies. Consider eventual consistency for non-critical operations.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Conflict Resolution with ETags',
          code: `// Client-side: Handle 409 conflicts with automatic retry
async function updateResource(id, data, currentEtag) {
  const response = await fetch(\`/api/resources/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': currentEtag, // Conditional update
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 409) {
    // Conflict detected - get latest version
    const latestResponse = await fetch(\`/api/resources/\${id}\`);
    const latestData = await latestResponse.json();
    const newEtag = latestResponse.headers.get('ETag');
    
    // Merge changes (simple merge, or show conflict UI)
    const mergedData = mergeChanges(data, latestData);
    
    // Retry with merged data and new ETag
    return updateResource(id, mergedData, newEtag);
  }
  
  if (!response.ok) {
    throw new Error(\`Update failed: \${response.status}\`);
  }
  
  return response.json();
}

// Check for duplicates before creation
async function createResource(data) {
  // Check if resource already exists
  const checkResponse = await fetch(\`/api/resources?email=\${data.email}\`);
  if (checkResponse.ok) {
    const existing = await checkResponse.json();
    if (existing.length > 0) {
      throw new Error('Resource with this email already exists');
    }
  }
  
  // Create resource
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (response.status === 409) {
    const error = await response.json();
    throw new Error(\`Conflict: \${error.message}\`);
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Optimistic Locking and Conflict Handling',
          code: `// Server-side: Implement optimistic locking with ETags
const express = require('express');
const crypto = require('crypto');
const app = express();

// Generate ETag from resource
function generateETag(resource) {
  const hash = crypto.createHash('md5').update(JSON.stringify(resource)).digest('hex');
  return \`"\${hash}"\`;
}

// Update with optimistic locking
app.put('/api/resources/:id', async (req, res) => {
  const resource = await db.resources.findById(req.params.id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  // Check If-Match header for optimistic locking
  const ifMatch = req.headers['if-match'];
  const currentETag = generateETag(resource);
  
  if (ifMatch && ifMatch !== currentETag) {
    // Conflict - resource was modified
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource was modified by another request',
      currentETag: currentETag,
    });
  }
  
  // Update resource
  const updated = await db.resources.update(req.params.id, req.body);
  const newETag = generateETag(updated);
  
  res.set('ETag', newETag);
  res.json(updated);
});

// Create with duplicate check
app.post('/api/resources', async (req, res) => {
  // Check for duplicate
  const existing = await db.resources.findByEmail(req.body.email);
  if (existing) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource with this email already exists',
      existingId: existing.id,
    });
  }
  
  const resource = await db.resources.create(req.body);
  res.status(201).json(resource);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass ETag Headers for Conflict Detection',
          code: `# Nginx: Ensure ETag and conditional headers reach backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        
        # Pass conditional headers for optimistic locking
        proxy_set_header If-Match \$http_if_match;
        proxy_set_header If-None-Match \$http_if_none_match;
        proxy_set_header If-Modified-Since \$http_if_modified_since;
        proxy_set_header If-Unmodified-Since \$http_if_unmodified_since;
        
        # Pass ETag from backend to client
        proxy_pass_header ETag;
        
        # Don't cache resources that use ETags (dynamic content)
        proxy_cache_bypass \$http_if_match \$http_if_none_match;
        add_header Cache-Control "no-store, must-revalidate";
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}`,
        },
      ],
      relatedCodes: ['412', '428'],
      provider: 'http',
    },
    '410': {
      code: '410',
      name: 'Gone',
      description: `Seeing a 410 Gone means the resource was permanently deleted and won't come back—unlike 404 (might exist elsewhere), this explicitly signals intentional, permanent removal. This client-side error (4xx) happens when servers want to distinguish between "not found" (404) and "was here, now deleted forever" (410). Most common when users delete content, temporary resources expire, or URLs are intentionally removed, but also appears in APIs that implement soft-delete workflows or resource lifecycle management.`,
      metaDescription: 'Debug 410 Gone responses by understanding permanent resource deletion, clearing caches, and handling soft-delete workflows in your applications.',
      causes: [
        `Frontend: User tries to access deleted content via old bookmark or cached URL. Stale cache references resource that was deleted. Deep links to expired temporary resources (upload links, preview URLs). Client retries request for resource that was intentionally removed.`,
        `Backend: Resource soft-deleted and marked as permanently removed. Temporary resource expired beyond recovery window. Admin intentionally removed content. Database record deleted with cascade, resource permanently gone. Business logic enforces permanent deletion (GDPR compliance, user request).`,
        `Infrastructure: CDN cache serves stale 410 responses. Load balancer routes to backend instance that deleted resource while others still have it. Database replication lag causes temporary inconsistencies before 410 is consistent.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—410 responses often include deletedAt timestamp or reason. Verify if this is expected (user deleted content) or unexpected. Check if resource ID is valid but deleted.`,
        `Step 2: Diagnose - Server logs show deletion timestamp and reason. Review soft-delete records to confirm permanent removal. Check database for deleted_at timestamp. Verify if resource is recoverable or truly gone.`,
        `Step 3: Fix - Client-side: Remove resource from local cache and UI immediately. Show user-friendly "This content has been permanently deleted" message. Update navigation to remove dead links. Implement cache invalidation on 410 responses.`,
        `Step 4: Fix - Server-side: Return 410 with helpful metadata (deletedAt, reason, alternative resources if available). Set proper cache headers (Cache-Control: no-store) to prevent caching. Implement proper soft-delete workflows.`,
        `Step 5: Fix - Infrastructure: Ensure CDN respects no-cache headers for 410 responses. Verify load balancer routes consistently. Clear CDN cache after deletions. Implement database cleanup jobs for truly permanent deletions.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 410 Gone Responses',
          code: `// Client-side: Handle 410 Gone with cache cleanup
async function fetchResource(resourceId) {
  const response = await fetch(\`/api/posts/\${resourceId}\`);
  
    if (response.status === 410) {
    const errorData = await response.json();
    
    // Remove from cache
    localStorage.removeItem(\`cache-post-\${resourceId}\`);
    sessionStorage.removeItem(\`post-\${resourceId}\`);
    
    // Remove from UI
    const element = document.getElementById(\`post-\${resourceId}\`);
    if (element) {
      element.remove();
    }
    
    // Show user-friendly message
    showNotification(
      errorData.message || 'This content has been permanently deleted',
      'info'
    );
    
    // Optionally redirect or update navigation
    updateNavigation();
    
      return null;
    }
  
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  
  const data = await response.json();
  
  // Cache successful responses
  localStorage.setItem(\`cache-post-\${resourceId}\`, JSON.stringify(data));
  
  return data;
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Soft Delete with 410 Response',
          code: `// Server-side: Implement soft-delete with 410 Gone
const express = require('express');
const app = express();

// Get resource (returns 410 if soft-deleted)
app.get('/api/posts/:id', async (req, res) => {
  const post = await db.posts.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  // Check if soft-deleted
  if (post.deletedAt) {
    return res
      .status(410)
      .set('Cache-Control', 'no-store, must-revalidate')
      .json({
        error: 'Gone',
        message: 'This post has been permanently deleted',
        deletedAt: post.deletedAt,
        reason: post.deletionReason || 'Deleted by user',
      });
  }
  
  res.set('ETag', generateETag(post));
  res.json(post);
});

// Soft delete (marks as deleted, returns 410)
app.delete('/api/posts/:id', async (req, res) => {
  const post = await db.posts.findById(req.params.id);
  
  if (!post) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  // Soft delete
  await db.posts.update(req.params.id, {
    deletedAt: new Date(),
    deletionReason: req.body.reason || 'Deleted by user',
  });
  
  // Return 410 Gone to indicate permanent deletion
  res.status(410).json({ 
    message: 'Post permanently deleted',
    deletedAt: new Date().toISOString(),
  });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Cache Control for 410 Responses',
          code: `# Nginx: Ensure 410 responses aren't cached
server {
    listen 80;
    server_name api.example.com;
    
    location /api/posts/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Don't cache 410 responses
        proxy_cache_valid 410 0s;
        proxy_cache_bypass \$upstream_http_status;
        
        # Add no-cache headers for 410
        add_header Cache-Control "no-store, must-revalidate" always;
        
        # Pass through backend cache headers
        proxy_pass_header Cache-Control;
        proxy_pass_header ETag;
    }
}`,
        },
      ],
      relatedCodes: ['404', '301'],
      provider: 'http',
    },
    '411': {
      code: '411',
      name: 'Length Required',
      description: `Getting a 411 Length Required means the server needs a Content-Length header but your request doesn't include one—the server can't determine request body size upfront and refuses to accept chunked encoding or streams without explicit length. This client-side error (4xx) happens when servers require knowing payload size before processing. Most common in upload endpoints that validate size limits, but also appears when servers don't support Transfer-Encoding: chunked or need Content-Length for security/validation checks.`,
      metaDescription: 'Fix 411 Length Required errors by calculating Content-Length headers, enabling chunked encoding support, and configuring Nginx for proper header handling.',
      causes: [
        `Frontend: Fetch/axios automatically sets Content-Length for string bodies, but manual requests might omit it. FormData uploads sometimes don't include Content-Length (browser handles chunked). Streaming request bodies can't provide Content-Length upfront. Client libraries strip Content-Length when using chunked encoding.`,
        `Backend: Server validation middleware requires Content-Length for size checking. Upload endpoint enforces size limits and needs length before accepting body. Security policy requires explicit Content-Length to prevent slowloris attacks. Legacy server implementation doesn't support chunked transfer encoding.`,
        `Infrastructure: Nginx proxy requires Content-Length for certain request types. Load balancer enforces Content-Length presence for uploads. WAF rules block requests without Content-Length header. API gateway validation fails without explicit length.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—verify if Content-Length is present. Look for Transfer-Encoding: chunked header (incompatible with Content-Length requirement). Check if body is being streamed (can't know length upfront).`,
        `Step 2: Diagnose - Server logs indicate which endpoint requires Content-Length. Review API documentation for endpoint requirements. Check server configuration for chunked encoding support. Verify if size validation logic needs Content-Length.`,
        `Step 3: Fix - Client-side: Calculate Content-Length before sending (new TextEncoder().encode(body).length for strings, file.size for files). Ensure fetch/axios includes Content-Length (usually automatic). For streams, buffer first or use endpoint that supports chunked encoding.`,
        `Step 4: Fix - Server-side: Accept Transfer-Encoding: chunked as alternative to Content-Length. Remove Content-Length requirement if not security-critical. Use streaming body parsers that handle chunked encoding. Update validation to work with chunked transfers.`,
        `Step 5: Fix - Infrastructure: Configure Nginx to accept chunked encoding (chunked_transfer_encoding on). Update load balancer to pass Transfer-Encoding headers. Review WAF rules for Content-Length requirements. Configure API gateway to support both Content-Length and chunked encoding.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Add Content-Length Header',
          code: `// Client-side: Calculate and add Content-Length header
async function sendDataWithLength(data) {
  // For JSON payloads
  const jsonString = JSON.stringify(data);
  const contentLength = new TextEncoder().encode(jsonString).length;
  
  const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
      'Content-Length': contentLength.toString(), // Explicit length
    },
    body: jsonString,
  });
  
  if (response.status === 411) {
    throw new Error('Server requires Content-Length header');
  }
  
  return response.json();
}

// For file uploads
async function uploadFileWithLength(file) {
  // File size is known, use it
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Length': file.size.toString(),
      'Content-Type': file.type,
      'X-Filename': file.name,
    },
    body: file, // File object works, browser sets Content-Length
  });
  
  if (!response.ok) {
    throw new Error(\`Upload failed: \${response.status}\`);
  }
  
  return response.json();
}

// For FormData, Content-Length is usually automatic, but can be explicit
async function uploadFormDataWithLength(formData) {
  // Calculate total size (approximate for FormData)
  let totalSize = 0;
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      totalSize += value.size;
    } else {
      totalSize += new TextEncoder().encode(value).length;
    }
  }
  
  const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
      'Content-Length': totalSize.toString(),
      // Don't set Content-Type, browser sets it with boundary
    },
    body: formData,
  });
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Handle Content-Length Requirement',
          code: `// Server-side: Accept requests with or without Content-Length
const express = require('express');
const app = express();

// Middleware to check Content-Length for specific endpoints
const requireContentLength = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const transferEncoding = req.headers['transfer-encoding'];
  
  // Accept either Content-Length or chunked encoding
  if (!contentLength && transferEncoding !== 'chunked') {
    return res.status(411).json({
      error: 'Length Required',
      message: 'Content-Length header or Transfer-Encoding: chunked is required',
    });
  }
  
  // Validate Content-Length if provided
  if (contentLength) {
    const length = parseInt(contentLength, 10);
    if (isNaN(length) || length < 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid Content-Length header value',
      });
    }
    
    // Check size limit
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (length > maxSize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: \`Content-Length (\${length}) exceeds maximum size (\${maxSize})\`,
      });
    }
  }
  
  next();
};

// Apply to upload endpoint
app.post('/api/upload', requireContentLength, (req, res) => {
  // Process upload
  res.json({ success: true, size: req.headers['content-length'] });
});

// Alternative: Accept chunked encoding (no Content-Length required)
app.use(express.raw({ 
  type: 'application/octet-stream',
  limit: '10mb',
  // This accepts chunked encoding
}));`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Handle Content-Length and Chunked Encoding',
          code: `# Nginx: Configure to accept both Content-Length and chunked encoding
server {
    listen 80;
    server_name api.example.com;
    
    location /api/upload {
        # Accept chunked transfer encoding
        chunked_transfer_encoding on;
        
        # Validate Content-Length if provided
        client_max_body_size 10m;
        client_body_buffer_size 1m;
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass Content-Length header if present
        proxy_set_header Content-Length \$http_content_length;
        proxy_set_header Transfer-Encoding \$http_transfer_encoding;
        
        # Don't buffer request body for large uploads
        proxy_request_buffering off;
        proxy_http_version 1.1;
    }
    
    # For endpoints that require Content-Length
    location /api/strict-upload {
        # Only accept requests with Content-Length
        if (\$http_content_length = "") {
            return 411 "Length Required";
        }
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header Content-Length \$http_content_length;
    }
}`,
        },
      ],
      relatedCodes: ['400', '413'],
      provider: 'http',
    },
    '412': {
      code: '412',
      name: 'Precondition Failed',
      description: `Hitting a 412 Precondition Failed means your conditional request headers (If-Match, If-None-Match, If-Modified-Since, If-Unmodified-Since) didn't match the server's current resource state—the ETag changed, the resource was modified, or the version check failed. This client-side error (4xx) happens when optimistic concurrency control validates request preconditions and they fail. Most common during concurrent edits where your If-Match ETag is stale, but also appears when conditional GET requests use If-None-Match to check cache validity or If-Modified-Since to verify freshness.`,
      metaDescription: 'Master resolving 412 Precondition Failed by refreshing ETags, handling If-Match header validation, and implementing proper version control strategies.',
      causes: [
        `Frontend: Stale ETag used in If-Match header—resource was modified since last fetch. If-None-Match check fails because resource exists (used for "create only if not exists"). If-Modified-Since timestamp is older than resource modification time. Client cache has outdated version information.`,
        `Backend: ETag validation fails—resource version changed, ETag mismatch. If-Match evaluates to false (resource modified by another request). If-None-Match evaluates to false (resource exists when trying to create). Last-Modified timestamp comparison fails. Version field in database doesn't match request version.`,
        `Infrastructure: Load balancer routes to different backend instances with inconsistent state. Cache serves stale ETag values. Database replication lag causes temporary ETag inconsistencies. CDN cache returns outdated Last-Modified headers.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers for conditional headers (If-Match, If-None-Match). Compare with Response Headers ETag value—do they match? Verify Last-Modified timestamps in request vs response.`,
        `Step 2: Diagnose - Server logs show which precondition failed and current resource state. Review ETag generation logic—ensure consistency. Check database for concurrent modifications. Verify version numbers or timestamps.`,
        `Step 3: Fix - Client-side: Refresh resource and get fresh ETag before retry. Implement conflict resolution UI—show both versions, let user merge. Use If-None-Match correctly (for create operations, not updates). Handle 412 gracefully with user feedback.`,
        `Step 4: Fix - Server-side: Return current ETag in 412 response for easy refresh. Include resource state in error response to help conflict resolution. Ensure ETag generation is deterministic and consistent. Validate preconditions before processing request body.`,
        `Step 5: Fix - Infrastructure: Ensure load balancer session affinity for stateful resources. Clear cache when resources are modified. Verify database replication lag is acceptable. Use distributed cache (Redis) for ETag consistency across instances.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Conditional Updates with Precondition Handling',
          code: `// Client-side: Handle 412 Precondition Failed
async function updateResource(id, data, currentETag) {
  const response = await fetch(\`/api/resources/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': currentETag, // Conditional update
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 412) {
    // Precondition failed - resource was modified
    const latestResponse = await fetch(\`/api/resources/\${id}\`);
    const latestData = await latestResponse.json();
    const newETag = latestResponse.headers.get('ETag');
    
    // Show conflict resolution UI
    const userChoice = await showConflictDialog({
      localChanges: data,
      serverVersion: latestData,
      newETag: newETag,
    });
    
    if (userChoice === 'use-local') {
      // Retry with new ETag
      return updateResource(id, data, newETag);
    } else if (userChoice === 'use-server') {
      // Use server version
      return latestData;
  } else {
      // Merge changes
      const merged = mergeChanges(data, latestData);
      return updateResource(id, merged, newETag);
    }
  }
  
  if (!response.ok) {
    throw new Error(\`Update failed: \${response.status}\`);
  }
  
    return response.json();
  }

// Conditional create (only if doesn't exist)
async function createResourceIfNotExists(data, currentETag) {
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'If-None-Match': '*', // Only create if resource doesn't exist
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 412) {
    throw new Error('Resource already exists');
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Precondition Validation Middleware',
          code: `// Server-side: Validate conditional request headers
const express = require('express');
const crypto = require('crypto');
const app = express();

function generateETag(resource) {
  const hash = crypto.createHash('md5')
    .update(JSON.stringify(resource) + resource.updatedAt)
    .digest('hex');
  return \`"\${hash}"\`;
}

// Middleware to validate preconditions
const validatePreconditions = async (req, res, next) => {
  const resource = await db.resources.findById(req.params.id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Not Found' });
  }
  
  const currentETag = generateETag(resource);
  const ifMatch = req.headers['if-match'];
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];
  const ifUnmodifiedSince = req.headers['if-unmodified-since'];
  
  // Validate If-Match (update only if ETag matches)
  if (ifMatch && ifMatch !== '*' && ifMatch !== currentETag) {
    return res.status(412)
      .set('ETag', currentETag)
      .json({
        error: 'Precondition Failed',
        message: 'Resource was modified. ETag mismatch.',
        currentETag: currentETag,
        providedETag: ifMatch,
      });
  }
  
  // Validate If-None-Match (create only if doesn't exist)
  if (ifNoneMatch && ifNoneMatch === currentETag) {
    return res.status(412).json({
      error: 'Precondition Failed',
      message: 'Resource already exists',
    });
  }
  
  // Validate If-Unmodified-Since
  if (ifUnmodifiedSince) {
    const requestedDate = new Date(ifUnmodifiedSince);
    const resourceDate = new Date(resource.updatedAt);
    if (resourceDate > requestedDate) {
      return res.status(412)
        .set('Last-Modified', resource.updatedAt.toUTCString())
        .json({
          error: 'Precondition Failed',
          message: 'Resource was modified after the specified date',
        });
    }
  }
  
  // Set current ETag for response
  res.set('ETag', currentETag);
  res.set('Last-Modified', resource.updatedAt.toUTCString());
  
  next();
};

// Apply to update route
app.put('/api/resources/:id', validatePreconditions, async (req, res) => {
  const updated = await db.resources.update(req.params.id, req.body);
  const newETag = generateETag(updated);
  res.set('ETag', newETag);
  res.json(updated);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Conditional Headers for Precondition Checks',
          code: `# Nginx: Pass conditional headers to backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/resources/ {
        proxy_pass http://backend;
        
        # Pass all conditional headers to backend
        proxy_set_header If-Match \$http_if_match;
        proxy_set_header If-None-Match \$http_if_none_match;
        proxy_set_header If-Modified-Since \$http_if_modified_since;
        proxy_set_header If-Unmodified-Since \$http_if_unmodified_since;
        
        # Pass ETag and Last-Modified from backend to client
        proxy_pass_header ETag;
        proxy_pass_header Last-Modified;
        
        # Don't cache resources that use conditional headers
        proxy_cache_bypass \$http_if_match \$http_if_none_match;
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}`,
        },
      ],
      relatedCodes: ['409', '428'],
      provider: 'http',
    },
    '413': {
      code: '413',
      name: 'Payload Too Large',
      description: `Getting a 413 Payload Too Large means your request body exceeds the server's size limits—file upload too big, JSON payload exceeds max size, or multiple large files in one request hit the configured ceiling. This client-side error (4xx) happens when servers enforce request body size limits to prevent resource exhaustion. Most common during file uploads that exceed limits, but also appears when API clients send large JSON payloads, batch operations include too many items, or uncompressed data could be compressed.`,
      metaDescription: 'Solve 413 Payload Too Large by splitting uploads into chunks, increasing Nginx client_max_body_size, and compressing large request payloads effectively.',
      causes: [
        `Frontend: Single file upload exceeds server limit (e.g., 10MB limit, 50MB file). Large JSON payloads sent without compression. Multiple files in FormData exceed combined limit. Client doesn't validate file size before upload. Uncompressed image/data that could be optimized.`,
        `Backend: express.json() limit set too low (default 100kb, needs increase). Body parser middleware rejects before reaching handler. Database BLOB size limits prevent large inserts. Server memory constraints limit acceptable payload size. Application code enforces business logic size limits.`,
        `Infrastructure: Nginx client_max_body_size too restrictive (default 1MB). Load balancer enforces payload size limits. WAF blocks large request bodies. API gateway has stricter limits than backend. Reverse proxy buffers exceed size before forwarding.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify request body size in Request Payload section. Look for Content-Length header value. Check if file size exceeds visible limits. Review if payload could be compressed.`,
        `Step 2: Diagnose - Server logs show exact size limit and current request size. Check Nginx error logs for "client intended to send too large body" messages. Review application logs for body parser rejections. Verify configured limits at each layer.`,
        `Step 3: Fix - Client-side: Validate file size before upload (file.size check). Compress large JSON payloads (JSON.stringify + compression). Split large uploads into chunks (5MB chunks, reassemble server-side). Use streaming uploads for large files.`,
        `Step 4: Fix - Server-side: Increase body parser limits (express.json({ limit: '50mb' })). Implement chunked upload endpoints for large files. Add compression middleware to accept compressed requests. Validate size early with helpful error messages.`,
        `Step 5: Fix - Infrastructure: Increase Nginx client_max_body_size (e.g., client_max_body_size 100m;). Update load balancer payload limits. Review WAF rules for file size restrictions. Configure API gateway limits to match backend. Enable request buffering for large uploads.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Validate and Chunk Large Uploads',
          code: `// Client-side: Validate size and chunk large files
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

async function uploadFile(file) {
  // Validate file size before upload
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(\`File size (\${file.size} bytes) exceeds maximum (\${MAX_FILE_SIZE} bytes)\`);
  }
  
  // For files larger than chunk size, use chunked upload
  if (file.size > CHUNK_SIZE) {
    return uploadLargeFile(file);
  }
  
  // Small file, upload directly
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (response.status === 413) {
    const error = await response.json();
    throw new Error(\`Upload failed: \${error.message || 'File too large'}\`);
  }
  
  return response.json();
}

// Chunked upload for large files
async function uploadLargeFile(file) {
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = crypto.randomUUID();
  
  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', i.toString());
    formData.append('totalChunks', chunks.toString());
    formData.append('fileName', file.name);
    
    const response = await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(\`Chunk upload failed: \${response.status}\`);
    }
  }
  
  // Finalize upload
  const finalizeResponse = await fetch(\`/api/upload-finalize/\${uploadId}\`, {
    method: 'POST',
  });
  
  return finalizeResponse.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Configure Body Size Limits',
          code: `// Server-side: Configure body size limits and handle 413
const express = require('express');
const multer = require('multer');
const app = express();

// Increase JSON body size limit
app.use(express.json({ 
  limit: '50mb', // Increase from default 100kb
  extended: true,
}));

app.use(express.urlencoded({ 
  limit: '50mb',
  extended: true,
}));

// Configure multer for file uploads with size limits
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, \`\${Date.now()}-\${file.originalname}\`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // Maximum 5 files
  },
});

// Single file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename,
    size: req.file.size,
  });
});

// Handle 413 errors from body parser
app.use((error, req, res, next) => {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: \`Request body size exceeds limit. Maximum size: \${error.limit}\`,
      limit: error.limit,
    });
  }
  next(error);
});

// Chunked upload endpoint
app.post('/api/upload-chunk', upload.single('chunk'), async (req, res) => {
  const { uploadId, chunkIndex, totalChunks, fileName } = req.body;
  
  // Store chunk (implementation depends on storage solution)
  await storeChunk(uploadId, parseInt(chunkIndex), req.file.buffer);
  
  res.json({ success: true, chunkIndex: parseInt(chunkIndex) });
});

app.post('/api/upload-finalize/:uploadId', async (req, res) => {
  const { uploadId } = req.params;
  
  // Reassemble chunks into final file
  const file = await reassembleChunks(uploadId);
  
  res.json({ success: true, file });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Increase Request Body Size Limits',
          code: `# Nginx: Configure client body size limits
server {
    listen 80;
    server_name api.example.com;
    
    # Increase maximum request body size (default is 1MB)
    client_max_body_size 100m;
    
    # Increase buffer sizes for large request bodies
    client_body_buffer_size 1m;
    client_header_buffer_size 4k;
    large_client_header_buffers 4 16k;
    
    location /api/upload {
        # Allow even larger uploads for this endpoint
        client_max_body_size 500m;
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Timeouts for large uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 60s;
        
        # Don't buffer request body (stream directly to backend)
        proxy_request_buffering off;
        proxy_http_version 1.1;
    }
    
    location /api/ {
        # Standard size limit for other endpoints
        client_max_body_size 10m;
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}`,
        },
      ],
      relatedCodes: ['400', '414'],
      provider: 'http',
    },
    '414': {
      code: '414',
      name: 'URI Too Long',
      description: `Seeing a 414 URI Too Long means your URL exceeded the server's maximum length limit—too many query parameters, large data embedded in the path, or deeply nested routes pushed the URL past acceptable boundaries. This client-side error (4xx) happens when servers enforce URI length limits (typically 2048-8192 characters) to prevent buffer overflows and performance issues. Most common when GET requests include large arrays or objects in query strings, but also appears when filters/search parameters accumulate, base64-encoded data ends up in URLs, or path parameters become excessively long.`,
      metaDescription: 'Fix 414 URI Too Long by switching to POST requests, limiting query parameters, and configuring Nginx large_client_header_buffers properly.',
      causes: [
        `Frontend: GET request with large query string (filters, search terms, IDs). Array parameters expand URL length (?id=1&id=2&id=3... for hundreds of items). Base64-encoded data in URL parameters. Deep linking with embedded state in URL. URL encoding increases length (spaces become %20, etc.).`,
        `Backend: Server URI length limit configured too restrictive (default varies: Nginx 4KB, Apache 8KB, some servers 2KB). Route parameter validation fails on long paths. Query string parsing limits enforced. Security policies restrict URI length to prevent attacks.`,
        `Infrastructure: Nginx large_client_header_buffers too small for long URLs. Load balancer URI length limits. WAF blocks long URLs as potential attacks. API gateway enforces stricter URI limits than backend. Reverse proxy buffer size limits.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify full URL length in address bar or request URL. Count query parameters and estimate encoded length. Check if URL could be shortened (remove unnecessary params, use IDs instead of full objects).`,
        `Step 2: Diagnose - Server logs show URI length and configured limits. Review Nginx error logs for "URI too long" messages. Check application route definitions for parameter length validations. Verify infrastructure layer limits.`,
        `Step 3: Fix - Client-side: Move large data from query string to POST body. Use POST instead of GET for complex filters/search. Limit query parameters (use pagination, combine filters). Shorten path segments (use IDs instead of names). Implement URL shortening for shareable links.`,
        `Step 4: Fix - Server-side: Accept POST requests for complex queries (POST /api/search with body instead of GET /api/search?q=...). Increase URI length limits if appropriate. Use path parameters sparingly, prefer query strings or body. Implement endpoint that accepts IDs in request body.`,
        `Step 5: Fix - Infrastructure: Increase Nginx large_client_header_buffers (e.g., large_client_header_buffers 8 32k;). Update load balancer URI length limits. Review WAF rules for false positives on long URLs. Configure API gateway to match backend limits. Increase proxy buffer sizes.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Avoid Long URLs, Use POST Body',
          code: `// Bad: Large data in URL (may cause 414)
const filters = {
  tags: ['tag1', 'tag2', 'tag3', /* ... 100 more tags ... */],
  categories: ['cat1', 'cat2', /* ... 50 more ... */],
  dateRange: { start: '2020-01-01', end: '2024-01-01' },
};

const params = new URLSearchParams();
Object.entries(filters).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    value.forEach(v => params.append(key, v));
  } else {
    params.append(key, JSON.stringify(value));
  }
});

// This URL will be very long and may cause 414
fetch(\`/api/search?\${params.toString()}\`); // DON'T DO THIS

// Good: Use POST with body
async function searchWithFilters(filters) {
  const response = await fetch('/api/search', {
  method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filters), // Data in body, not URL
  });
  
  if (response.status === 414) {
    throw new Error('Request URL too long. Use POST instead of GET.');
  }
  
  return response.json();
}

// For GET requests, limit query parameters
function buildSearchUrl(base, params) {
  const url = new URL(base);
  
  // Limit to first 20 parameters to keep URL short
  const limitedParams = Object.entries(params).slice(0, 20);
  
  limitedParams.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Limit array items
      value.slice(0, 10).forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.append(key, String(value).substring(0, 100)); // Truncate long values
    }
  });
  
  // Check URL length
  if (url.toString().length > 2000) {
    throw new Error('URL too long. Use POST request with body instead.');
  }
  
  return url.toString();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Handle Long URLs and POST Alternative',
          code: `// Server-side: Accept both GET (short) and POST (long) for search
const express = require('express');
const app = express();

app.use(express.json());

// GET endpoint with limited query parameters
app.get('/api/search', (req, res) => {
  // Check URL length (Express doesn't enforce this by default)
  const urlLength = req.url.length;
  const maxUrlLength = 2000;
  
  if (urlLength > maxUrlLength) {
    return res.status(414).json({
      error: 'URI Too Long',
      message: \`Request URL (\${urlLength} chars) exceeds maximum length (\${maxUrlLength} chars). Use POST /api/search with body instead.\`,
      maxLength: maxUrlLength,
      actualLength: urlLength,
    });
  }
  
  // Process search with query parameters
  const results = performSearch(req.query);
  res.json(results);
});

// POST endpoint for complex queries (no URL length limit)
app.post('/api/search', (req, res) => {
  // Complex filters in request body, no URL length concerns
  const filters = req.body;
  const results = performSearch(filters);
  res.json(results);
});

// Alternative: Accept IDs in body for GET-like operations
app.post('/api/resources/batch', (req, res) => {
  // Instead of GET /api/resources?id=1&id=2&id=3... (long URL)
  // Use POST /api/resources/batch with body: { ids: [1, 2, 3, ...] }
  const { ids } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array required' });
  }
  
  const resources = db.resources.findByIds(ids);
  res.json(resources);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Increase URI and Header Buffer Sizes',
          code: `# Nginx: Configure buffers for longer URIs
http {
    # Increase buffer sizes for long URLs and headers
    client_header_buffer_size 4k;
    large_client_header_buffers 8 32k;  # 8 buffers of 32KB each (default is 4 8k)
    
    server {
        listen 80;
        server_name api.example.com;
        
        # Check URI length (optional, nginx handles this automatically)
        # If URI exceeds large_client_header_buffers, returns 414
        
        location /api/search {
            # For search endpoints, prefer POST
            # But allow GET with reasonable limits
            
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            
            # Pass full URI to backend
            proxy_set_header X-Original-URI \$request_uri;
        }
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
    
    # Custom error page for 414
    error_page 414 /414.html;
    location = /414.html {
        return 414 '{"error":"URI Too Long","message":"Request URL exceeds maximum length. Use POST with request body instead."}';
        default_type application/json;
    }
}`,
        },
      ],
      relatedCodes: ['400', '413'],
      provider: 'http',
    },
    '415': {
      code: '415',
      name: 'Unsupported Media Type',
      description: `Getting a 415 Unsupported Media Type means the server rejected your request because the Content-Type header doesn't match what the endpoint accepts—sending JSON when it expects XML, uploading a file format the server can't process, or missing the Content-Type header entirely. This client-side error (4xx) happens when servers validate request media types before processing. Most common when file uploads use wrong MIME types or API calls send data in unsupported formats, but also appears when Accept headers request formats the server doesn't support or Content-Type is missing or malformed.`,
      metaDescription: 'Fix 415 Unsupported Media Type by setting correct Content-Type headers, configuring Express body parsers, and ensuring Nginx passes media type headers properly.',
      causes: [
        `Frontend: Wrong Content-Type header (text/plain instead of application/json). File uploads with incorrect MIME type (image/jpeg vs image/jpg). Missing Content-Type header entirely. Accept header requests unsupported format (application/xml when server only does JSON). Browser auto-sets wrong Content-Type for FormData.`,
        `Backend: Server validation middleware rejects unsupported media types. File upload handler only accepts specific formats (e.g., only images, not PDFs). Content negotiation fails—server can't produce requested Accept format. Body parser configured for specific types only.`,
        `Infrastructure: Nginx/Apache blocks certain Content-Type values. WAF rules filter unsupported media types. Load balancer strips or modifies Content-Type headers. API gateway enforces stricter media type validation than backend.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—verify Content-Type value matches what server expects. Look for Accept header if making GET requests. Check if file uploads have correct MIME type.`,
        `Step 2: Diagnose - Server logs show which media type was rejected and what's accepted. Review API documentation for supported Content-Type values. Check server configuration for media type restrictions.`,
        `Step 3: Fix - Client-side: Set correct Content-Type header (application/json for JSON, multipart/form-data for forms). For file uploads, use file.type or detect MIME type correctly. Remove or fix Accept header if requesting unsupported format.`,
        `Step 4: Fix - Server-side: Accept multiple media types (express.json() for JSON, express.raw() for binary). Return 415 with Accept header showing supported types. Configure body parsers for all needed formats. Update validation to be more permissive if appropriate.`,
        `Step 5: Fix - Infrastructure: Review Nginx/Apache Content-Type filtering rules. Check WAF media type restrictions. Ensure load balancer passes Content-Type headers unchanged. Configure API gateway to accept same types as backend.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Set Correct Content-Type Headers',
          code: `// Client-side: Handle 415 by setting correct Content-Type
async function sendData(data, contentType = 'application/json') {
  const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
      'Content-Type': contentType, // Must match server expectations
    },
    body: contentType === 'application/json' 
      ? JSON.stringify(data) 
      : data,
  });
  
  if (response.status === 415) {
    const acceptedTypes = response.headers.get('Accept') || 
                         response.headers.get('Content-Type');
    throw new Error(\`Unsupported media type. Server accepts: \${acceptedTypes}\`);
  }
  
  return response.json();
}

// For file uploads, detect MIME type correctly
async function uploadFile(file) {
  // Use file.type or detect MIME type
  const contentType = file.type || 'application/octet-stream';
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });
  
  if (response.status === 415) {
    const error = await response.json();
    throw new Error(\`File type \${contentType} not supported: \${error.message}\`);
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Accept Multiple Media Types',
          code: `// Server-side: Configure body parsers for multiple media types
const express = require('express');
const multer = require('multer');
const app = express();

// Accept JSON
app.use(express.json({ type: 'application/json' }));

// Accept URL-encoded
app.use(express.urlencoded({ extended: true, type: 'application/x-www-form-urlencoded' }));

// Accept raw text
app.use(express.text({ type: 'text/plain' }));

// Accept XML (requires xml2js or similar)
// app.use(express.text({ type: 'application/xml' }));

// File uploads with multer
const upload = multer({
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(\`File type \${file.mimetype} not supported\`), false);
    }
  },
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, filename: req.file.originalname });
});

// Handle 415 errors
app.use((error, req, res, next) => {
  if (error.message.includes('not supported')) {
    return res.status(415)
      .set('Accept', 'image/jpeg, image/png, image/gif, application/pdf')
      .json({
        error: 'Unsupported Media Type',
        message: error.message,
        acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      });
  }
  next(error);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Content-Type Headers',
          code: `# Nginx: Ensure Content-Type headers reach backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        
        # Pass Content-Type header to backend
        proxy_set_header Content-Type \$http_content_type;
        proxy_set_header Accept \$http_accept;
        
        # Don't modify Content-Type
        proxy_pass_request_headers on;
        
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Optional: Block specific Content-Types at Nginx level
    # location /api/upload {
    #     if (\$http_content_type !~* "^image/(jpeg|png|gif)$") {
    #         return 415 '{"error":"Unsupported Media Type","message":"Only JPEG, PNG, and GIF images are accepted"}';
    #     }
    #     proxy_pass http://backend;
    # }
}`,
        },
      ],
      relatedCodes: ['400', '406'],
      provider: 'http',
    },
    '416': {
      code: '416',
      name: 'Range Not Satisfiable',
      description: `Hitting a 416 Range Not Satisfiable means your Range header requested bytes outside the file's actual size—asking for bytes 1000-2000 on a 500-byte file, or the range format is invalid. This client-side error (4xx) happens when servers validate Range headers for partial content requests. Most common during video streaming or large file downloads where range calculations are wrong, but also appears when file sizes change between requests, range syntax is malformed, or multiple overlapping ranges confuse the server.`,
      metaDescription: 'Fix 416 Range Not Satisfiable by validating range headers against file size, implementing proper range request support, and configuring Nginx for partial content delivery.',
      causes: [
        `Frontend: Range header exceeds file size (requesting bytes beyond Content-Length). Invalid range format (bytes=start-end syntax errors). Range start value greater than end value. Multiple overlapping ranges in single request. Stale file size cached, file was truncated.`,
        `Backend: File size changed between HEAD and GET requests. Range validation logic rejects valid ranges. Server doesn't support range requests (no Accept-Ranges header). File was deleted or modified during range request.`,
        `Infrastructure: CDN serves stale Content-Length headers. Load balancer modifies Range headers incorrectly. Reverse proxy doesn't support range requests. File storage system reports wrong file size.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response Headers for Content-Length and Accept-Ranges. Verify Range header format (bytes=start-end). Compare requested range against Content-Length value.`,
        `Step 2: Diagnose - Server logs show which range was requested and file size. Check if file was modified between requests. Review range validation logic. Verify Accept-Ranges header is present.`,
        `Step 3: Fix - Client-side: Get file size first with HEAD request before sending Range header. Validate range values (start < end, both < Content-Length). Use single range requests (not multiple). Handle 416 by requesting full resource.`,
        `Step 4: Fix - Server-side: Return Accept-Ranges: bytes header. Validate range syntax before processing. Return 416 with Content-Range header showing actual file size. Support range requests properly (206 Partial Content for valid ranges).`,
        `Step 5: Fix - Infrastructure: Ensure CDN passes Range headers correctly. Configure load balancer to support range requests. Verify reverse proxy doesn't strip Range headers. Check file storage system reports accurate sizes.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Validate Range Before Request',
          code: `// Client-side: Handle 416 by validating ranges first
async function downloadChunk(url, start, end) {
  // First, get file size with HEAD request
  const headResponse = await fetch(url, { method: 'HEAD' });
  const contentLength = parseInt(headResponse.headers.get('Content-Length') || '0');
  const acceptRanges = headResponse.headers.get('Accept-Ranges');
  
  if (acceptRanges !== 'bytes') {
    throw new Error('Server does not support range requests');
  }
  
  // Validate range
  if (start < 0 || end < start || start >= contentLength) {
    throw new Error(\`Invalid range: start=\${start}, end=\${end}, size=\${contentLength}\`);
  }
  
  // Clamp end to file size
  const clampedEnd = Math.min(end, contentLength - 1);
  
  const response = await fetch(url, {
    headers: {
      'Range': \`bytes=\${start}-\${clampedEnd}\`,
    },
  });
  
  if (response.status === 416) {
    // Range not satisfiable - get full resource
    console.warn('Range not satisfiable, downloading full resource');
    return fetch(url);
  }
  
  if (response.status === 206) {
    // Partial content - valid range
  return response;
}

  return response;
}

// Download file in chunks with proper error handling
async function downloadFileInChunks(url, chunkSize = 1024 * 1024) {
const headResponse = await fetch(url, { method: 'HEAD' });
  const totalSize = parseInt(headResponse.headers.get('Content-Length') || '0');
  const chunks = [];
  
  for (let start = 0; start < totalSize; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, totalSize - 1);
    const chunk = await downloadChunk(url, start, end);
    const blob = await chunk.blob();
    chunks.push(blob);
  }
  
  return new Blob(chunks);
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Support Range Requests',
          code: `// Server-side: Implement range request support
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Helper to parse Range header
function parseRange(rangeHeader, fileSize) {
  if (!rangeHeader) return null;
  
  const match = rangeHeader.match(/bytes=(\\d+)-(\\d*)/);
  if (!match) return null;
  
  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
  
  if (start < 0 || end < start || start >= fileSize) {
    return null; // Invalid range
  }
  
  return { start, end };
}

// Serve file with range support
app.get('/api/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;
  
  // Set headers
  res.set('Accept-Ranges', 'bytes');
  res.set('Content-Length', fileSize);
  
  const range = parseRange(req.headers.range, fileSize);
  
  if (!range) {
    // No range or invalid range - return 416 or full file
    if (req.headers.range) {
      return res.status(416)
        .set('Content-Range', \`bytes */\${fileSize}\`)
        .json({ error: 'Range Not Satisfiable' });
    }
    // Return full file
    return res.sendFile(filePath);
  }
  
  // Valid range - return 206 Partial Content
  const { start, end } = range;
  const chunkSize = end - start + 1;
  
  res.status(206)
    .set('Content-Range', \`bytes \${start}-\${end}/\${fileSize}\`)
    .set('Content-Length', chunkSize);
  
  const stream = fs.createReadStream(filePath, { start, end });
  stream.pipe(res);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Enable Range Request Support',
          code: `# Nginx: Configure range request support
server {
    listen 80;
    server_name api.example.com;
    root /var/www/files;
    
    location /api/files/ {
        # Enable range requests
        sendfile on;
        tcp_nopush on;
        
        # Pass Range header to backend
        proxy_set_header Range \$http_range;
        
        # Backend should handle range requests
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Or serve files directly with Nginx range support
        # try_files \$uri =404;
        # add_header Accept-Ranges bytes;
    }
    
    # Direct file serving with range support (alternative)
    location /files/ {
        alias /var/www/files/;
        sendfile on;
        # Nginx automatically handles Range headers for static files
        add_header Accept-Ranges bytes;
    }
}`,
        },
      ],
      relatedCodes: ['206', '413'],
      provider: 'http',
    },
    '422': {
      code: '422',
      name: 'Unprocessable Entity',
      description: `Getting a 422 Unprocessable Entity means your request syntax is valid (unlike 400) but the data violates business rules or validation constraints—email format is wrong, required relationships are missing, or values break domain-specific rules. This client-side error (4xx) happens when servers validate request semantics after parsing succeeds. Most common in API calls where data passes JSON validation but fails business logic (e.g., duplicate email, invalid date ranges), but also appears when nested resources don't exist, foreign key constraints fail, or custom validation rules reject the data.`,
      metaDescription: 'Solve 422 Unprocessable Entity by fixing validation errors, checking business logic constraints, and implementing detailed field-level error responses for better debugging.',
      causes: [
        `Frontend: Email format validation fails (missing @, invalid domain). Date ranges are invalid (end date before start date). Required nested resources referenced but don't exist. Business rule violations (e.g., quantity exceeds stock). Data relationships are invalid (circular references, orphaned records).`,
        `Backend: Validation middleware catches semantic errors (express-validator, joi, zod). Database constraints fail (unique violations, foreign key errors). Business logic rejects valid syntax but invalid semantics. Nested resource validation fails. Custom validation rules trigger.`,
        `Infrastructure: API gateway enforces additional validation rules. WAF blocks certain data patterns. Load balancer validation layer rejects requests. Middleware stack validates before reaching application code.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—422 responses usually include detailed validation errors with field names and messages. Review each error to understand what failed.`,
        `Step 2: Diagnose - Server logs show which validation rule failed. Review validation middleware output. Check database constraint violations. Examine business logic validation messages.`,
        `Step 3: Fix - Client-side: Display validation errors to users with field-level feedback. Fix email formats, date ranges, and required fields. Check nested resource IDs exist before referencing. Implement client-side validation matching server rules.`,
        `Step 4: Fix - Server-side: Return detailed 422 responses with field-level errors. Use validation libraries (express-validator, joi) for consistent error format. Validate business rules clearly. Check nested resources exist before processing.`,
        `Step 5: Fix - Infrastructure: Review API gateway validation rules for conflicts. Check WAF pattern matching for false positives. Ensure load balancer doesn't add extra validation. Coordinate validation layers to avoid duplicate checks.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 422 Validation Errors',
          code: `// Client-side: Display field-level validation errors
async function createUser(userData) {
  const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  if (response.status === 422) {
    const errorData = await response.json();
    
    // Display validation errors by field
    if (errorData.errors && Array.isArray(errorData.errors)) {
      errorData.errors.forEach(error => {
        const field = error.field || error.path;
        const message = error.message || error.msg;
        
        // Show error next to form field
        const fieldElement = document.querySelector(\`[name="\${field}"]\`);
        if (fieldElement) {
          fieldElement.classList.add('error');
          showFieldError(field, message);
        }
        
        console.error(\`Validation error: \${field} - \${message}\`);
      });
    }
    
    throw new Error('Validation failed');
  }
  
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  
  return response.json();
}

function showFieldError(field, message) {
  // Display error message in UI
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  document.querySelector(\`[name="\${field}"]\`).parentNode.appendChild(errorElement);
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Detailed 422 Validation Responses',
          code: `// Server-side: Return detailed validation errors
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();

app.use(express.json());

// Validation middleware
const validateUser = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('age')
    .isInt({ min: 18, max: 120 })
    .withMessage('Age must be between 18 and 120'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('departmentId')
    .isInt()
    .withMessage('Department ID must be an integer')
    .custom(async (value) => {
      // Check if department exists
      const department = await db.departments.findById(value);
      if (!department) {
        throw new Error('Department does not exist');
      }
      return true;
    }),
];

// Route with validation
app.post('/api/users', validateUser, async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  // Process valid request
  const user = await db.users.create(req.body);
  res.status(201).json(user);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Validation Errors to Client',
          code: `# Nginx: Ensure 422 responses reach client properly
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass through 422 responses with body
        proxy_intercept_errors off;
        
        # Don't cache 422 responses
        proxy_cache_bypass \$upstream_http_status;
        add_header Cache-Control "no-store" always;
        
        # Increase buffer for large error responses
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
}`,
        },
      ],
      relatedCodes: ['400', '400'],
      provider: 'http',
    },
    '429': {
      code: '429',
      name: 'Too Many Requests',
      description: `Hitting a 429 Too Many Requests means you've exceeded the rate limit—too many API calls in a time window, API quota exhausted, or DDoS protection triggered throttling. This client-side error (4xx) happens when servers enforce rate limiting to prevent abuse and ensure fair resource usage. Most common when clients make rapid-fire requests without throttling, but also appears when API quotas are reached, retry loops create request storms, or traffic spikes trigger automatic rate limiting.`,
      metaDescription: 'Fix 429 Too Many Requests by implementing exponential backoff, respecting Retry-After headers, and configuring rate limiting middleware to prevent request storms.',
      causes: [
        `Frontend: Rapid-fire API calls without throttling (loops, event handlers firing repeatedly). Retry logic creates request storms (exponential backoff not implemented). Multiple tabs/windows making simultaneous requests. Polling intervals too aggressive. Missing request queuing or debouncing.`,
        `Backend: Rate limiting middleware enforces per-IP or per-user limits. API quota system tracks usage and blocks when exceeded. DDoS protection triggers automatic throttling. Business logic enforces custom rate limits. Database connection pool exhaustion causes throttling.`,
        `Infrastructure: Nginx rate limiting (limit_req module) blocks requests. Load balancer enforces global rate limits. WAF triggers rate limiting on suspicious patterns. CDN rate limiting protects origin servers. API gateway enforces tier-based quotas.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—count requests per second. Look for Retry-After header in 429 response. Review if multiple components are making duplicate requests. Check request timing patterns.`,
        `Step 2: Diagnose - Server logs show rate limit configuration and current usage. Review rate limiting middleware settings. Check API quota usage in dashboard. Examine which endpoint or IP triggered the limit.`,
        `Step 3: Fix - Client-side: Implement exponential backoff with jitter for retries. Use request queuing to serialize rapid requests. Add debouncing/throttling to event handlers. Respect Retry-After header values. Reduce polling frequency.`,
        `Step 4: Fix - Server-side: Return Retry-After header with wait time. Implement sliding window or token bucket rate limiting. Provide rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining). Log rate limit hits for monitoring.`,
        `Step 5: Fix - Infrastructure: Adjust Nginx limit_req zone sizes and burst values. Review load balancer rate limit settings. Configure WAF rate limiting thresholds. Set appropriate API gateway quotas per tier.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Exponential Backoff with Retry-After',
          code: `// Client-side: Handle 429 with exponential backoff and Retry-After
async function fetchWithRateLimitHandling(url, options = {}, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      // Check Retry-After header (seconds) or use exponential backoff
      const retryAfter = response.headers.get('Retry-After');
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');
      
      let delay;
      if (retryAfter) {
        delay = parseInt(retryAfter) * 1000; // Convert to milliseconds
      } else if (rateLimitReset) {
        delay = Math.max(0, (parseInt(rateLimitReset) * 1000) - Date.now());
      } else {
        // Exponential backoff with jitter
        delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      }
      
      if (attempt < maxRetries - 1) {
        console.log(\`Rate limited, retrying in \${delay}ms (attempt \${attempt + 1}/\${maxRetries})\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        throw new Error('Rate limit exceeded after maximum retries');
      }
    }
    
    return response;
  }
}

// Request queue to prevent rate limit storms
class RequestQueue {
  constructor(maxConcurrent = 3, minDelay = 100) {
    this.queue = [];
    this.processing = 0;
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelay;
    this.lastRequestTime = 0;
  }
  
  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, this.minDelay - timeSinceLastRequest);
    
    setTimeout(async () => {
      this.processing++;
      this.lastRequestTime = Date.now();
      
      const { fn, resolve, reject } = this.queue.shift();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.processing--;
        this.process();
      }
    }, delay);
  }
}

// Usage
const queue = new RequestQueue(3, 200); // Max 3 concurrent, 200ms between requests
queue.add(() => fetchWithRateLimitHandling('/api/endpoint'));`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Rate Limiting Middleware',
          code: `// Server-side: Implement rate limiting with Retry-After
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

// Per-IP rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in \`RateLimit-*\` headers
  legacyHeaders: false, // Disable \`X-RateLimit-*\` headers
  handler: (req, res) => {
    const resetTime = new Date(Date.now() + req.rateLimit.resetTime);
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
    
    res.status(429)
      .set('Retry-After', retryAfter.toString())
      .set('X-RateLimit-Limit', req.rateLimit.limit.toString())
      .set('X-RateLimit-Remaining', req.rateLimit.remaining.toString())
      .set('X-RateLimit-Reset', new Date(req.rateLimit.resetTime).toISOString())
      .json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: retryAfter,
        resetTime: resetTime.toISOString(),
      });
  },
});

// Per-user rate limiting (requires authentication)
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip, // Use user ID if authenticated
  skip: (req) => !req.user, // Skip if not authenticated
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.post('/api/users', userLimiter, (req, res) => {
  res.json({ success: true });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Rate Limiting Configuration',
          code: `# Nginx: Configure rate limiting with Retry-After
http {
    # Define rate limit zones
    limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login_limit:10m rate=5r/m;
    
    server {
        listen 80;
        server_name api.example.com;
        
        # General API rate limiting
        location /api/ {
            limit_req zone=api_limit burst=20 nodelay;
            limit_req_status 429;
            
            # Custom 429 response with Retry-After
            error_page 429 @rate_limit;
            
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
        
        # Stricter rate limiting for login
        location /api/auth/login {
            limit_req zone=login_limit burst=3 nodelay;
            limit_req_status 429;
            error_page 429 @rate_limit;
            
            proxy_pass http://backend;
        }
        
        # Custom 429 handler with Retry-After header
        location @rate_limit {
            default_type application/json;
            return 429 '{"error":"Too Many Requests","message":"Rate limit exceeded. Please try again later."}';
            add_header Retry-After 60 always;
            add_header Content-Type application/json always;
    }
  }
}`,
        },
      ],
      relatedCodes: ['503', '509'],
      provider: 'http',
    },
    '500': {
      code: '500',
      name: 'Internal Server Error',
      description: `Seeing a 500 Internal Server Error means the server crashed or encountered an unexpected condition—unhandled exceptions, database connection failures, memory exhaustion, or configuration mistakes. This server-side error (5xx) indicates the server failed, not your request. Most common when application code throws uncaught exceptions, but also appears when database connections fail, memory runs out, environment variables are missing, or server configuration is broken.`,
      metaDescription: 'Debug 500 Internal Server Error by checking server logs, implementing proper error handling middleware, and adding retry logic with exponential backoff for resilience.',
      causes: [
        `Frontend: Client can't fix 500 errors directly, but rapid retries can worsen server load. Missing error boundaries in React apps crash the UI. No retry logic means users see cryptic errors.`,
        `Backend: Unhandled exceptions in application code (null pointer, undefined property access). Database connection pool exhausted or queries timeout. Memory leaks cause OOM (Out of Memory) errors. Missing environment variables or configuration files. Third-party API calls fail without error handling.`,
        `Infrastructure: Application server crashes (Node.js, Python, PHP). Database server is down or unreachable. Load balancer health checks fail. Container runs out of memory or CPU. File system permissions prevent writes.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check server logs immediately (tail -f /var/log/app/error.log or application logs). Look for stack traces, exception messages, or error codes. Check database connection status. Review memory/CPU usage (top, htop).`,
        `Step 2: Diagnose - Check application monitoring (Sentry, DataDog, New Relic) for error details. Review database connection pool metrics. Check if specific endpoints trigger 500s. Examine recent deployments or configuration changes.`,
        `Step 3: Fix - Client-side: Implement retry logic with exponential backoff for 500s. Show user-friendly error messages. Log 500 errors for monitoring. Implement circuit breakers to stop retrying failing endpoints.`,
        `Step 4: Fix - Server-side: Add try-catch blocks around all async operations. Implement proper error handling middleware. Add database connection retry logic. Validate environment variables on startup. Add health check endpoints.`,
        `Step 5: Fix - Infrastructure: Restart application server if it crashed. Check database server status and connectivity. Review load balancer health check configuration. Scale resources if memory/CPU exhausted. Fix file system permissions.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Retry Logic for 500 Errors',
          code: `// Client-side: Handle 500 errors with retry and user feedback
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 500) {
        if (attempt < maxRetries - 1) {
          // Exponential backoff for server errors
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(\`Server error, retrying in \${delay}ms (attempt \${attempt + 1})\`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error('Server error after maximum retries');
        }
      }
      
      return response;
} catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Network errors - retry with backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage with user feedback
async function loadData() {
  try {
    const response = await fetchWithRetry('/api/data');
    return await response.json();
  } catch (error) {
    showUserMessage({
      type: 'error',
      title: 'Server Error',
      message: 'The server encountered an error. Please try again in a moment.',
    });
    throw error;
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Comprehensive Error Handling',
          code: `// Server-side: Proper error handling middleware
const express = require('express');
const app = express();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Example route with error handling
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  // Database query with error handling
  const user = await db.users.findById(userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
}));

// Global error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error to monitoring service (Sentry, etc.)
  // logErrorToService(err, req);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to error tracking service
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log and exit gracefully
  process.exit(1);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Error Handling and Logging',
          code: `# Nginx: Configure error handling and logging
server {
    listen 80;
    server_name api.example.com;
    
    # Access and error logs
    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log warn;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Error handling
        proxy_intercept_errors on;
        error_page 500 502 503 504 /50x.html;
    }
    
    # Custom 500 error page
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }
    
    # Health check endpoint (bypasses error handling)
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}`,
        },
      ],
      relatedCodes: ['502', '503', '504'],
      provider: 'http',
    },
    '501': {
      code: '501',
      name: 'Not Implemented',
      description: `Getting a 501 Not Implemented means the server doesn't support the HTTP method or feature you're requesting—trying PATCH on a server that only supports GET/POST, or requesting HTTP/2 features on an HTTP/1.1-only server. This server-side error (5xx) indicates a permanent limitation, not a temporary issue. Most common when using modern HTTP methods (PATCH, DELETE) on legacy servers, but also appears when requesting unsupported protocol features, WebDAV operations on non-WebDAV servers, or experimental HTTP extensions.`,
      metaDescription: 'Fix 501 Not Implemented by checking Allow headers, implementing missing HTTP method handlers, and using fallback methods when server capabilities are limited.',
      causes: [
        `Frontend: Using HTTP methods server doesn't support (PATCH, DELETE, OPTIONS). Requesting HTTP/2 or HTTP/3 features on HTTP/1.1 server. Using WebDAV methods (PROPFIND, PROPPATCH) on regular server. Experimental headers or extensions not supported.`,
        `Backend: Route handler missing for specific HTTP method. Server framework doesn't support requested method. Feature flag disabled or not implemented. Legacy server without modern method support. Intentionally disabled for security reasons.`,
        `Infrastructure: Load balancer doesn't forward certain methods. Reverse proxy strips unsupported methods. API gateway method restrictions. Legacy infrastructure without modern HTTP support.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify HTTP method used (GET, POST, PUT, DELETE, PATCH). Review API documentation for supported methods. Check if Allow header lists supported methods.`,
        `Step 2: Diagnose - Server logs show which method was rejected. Review route definitions for missing method handlers. Check server framework capabilities. Verify infrastructure method filtering.`,
        `Step 3: Fix - Client-side: Use alternative methods (PUT instead of PATCH, POST with _method override). Check Allow header for supported methods. Fallback to GET/POST if needed. Update client to match server capabilities.`,
        `Step 4: Fix - Server-side: Implement missing method handlers. Add method support to framework configuration. Return Allow header with supported methods. Upgrade server software if needed.`,
        `Step 5: Fix - Infrastructure: Configure load balancer to pass all HTTP methods. Review reverse proxy method filtering rules. Update API gateway method mappings. Upgrade infrastructure for modern HTTP support.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Fallback for Unsupported Methods',
          code: `// Client-side: Handle 501 by checking Allow header and using fallback
async function updateResource(id, data, usePatch = true) {
  // Try PATCH first (preferred for partial updates)
  let response = await fetch(\`/api/resources/\${id}\`, {
    method: usePatch ? 'PATCH' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
    if (response.status === 501) {
    // Check Allow header for supported methods
    const allowedMethods = response.headers.get('Allow');
    console.warn(\`PATCH not supported. Allowed methods: \${allowedMethods}\`);
    
    if (allowedMethods && allowedMethods.includes('PUT')) {
      // Fallback to PUT (full resource update)
      response = await fetch(\`/api/resources/\${id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else if (allowedMethods && allowedMethods.includes('POST')) {
      // Fallback to POST with _method override
      response = await fetch(\`/api/resources/\${id}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HTTP-Method-Override': 'PATCH',
        },
        body: JSON.stringify(data),
      });
    } else {
      throw new Error(\`No supported update method available. Allowed: \${allowedMethods}\`);
    }
  }
  
  return response.json();
}

// Check server capabilities with OPTIONS
async function checkServerCapabilities(endpoint) {
  const response = await fetch(endpoint, { method: 'OPTIONS' });
  const allowedMethods = response.headers.get('Allow');
  return allowedMethods ? allowedMethods.split(', ') : [];
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Implement Missing Methods',
          code: `// Server-side: Implement all required HTTP methods
const express = require('express');
const methodOverride = require('method-override');
const app = express();

app.use(express.json());
app.use(methodOverride('X-HTTP-Method-Override')); // Support _method override

// GET - Read resource
app.get('/api/resources/:id', async (req, res) => {
  const resource = await db.resources.findById(req.params.id);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(resource);
});

// POST - Create resource
app.post('/api/resources', async (req, res) => {
  const resource = await db.resources.create(req.body);
  res.status(201).json(resource);
});

// PUT - Full update (replace entire resource)
app.put('/api/resources/:id', async (req, res) => {
  const resource = await db.resources.update(req.params.id, req.body);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(resource);
});

// PATCH - Partial update (update only provided fields)
app.patch('/api/resources/:id', async (req, res) => {
  const resource = await db.resources.partialUpdate(req.params.id, req.body);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(resource);
});

// DELETE - Remove resource
app.delete('/api/resources/:id', async (req, res) => {
  const deleted = await db.resources.delete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.status(204).send();
});

// OPTIONS - Return allowed methods
app.options('/api/resources/:id', (req, res) => {
  res.set('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.sendStatus(200);
});

// Handle unsupported methods
app.use('/api/resources/:id', (req, res) => {
  res.status(501)
    .set('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    .json({
      error: 'Not Implemented',
      message: \`Method \${req.method} not supported for this endpoint\`,
      allowed: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass All HTTP Methods',
          code: `# Nginx: Ensure all HTTP methods reach backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        # Pass all HTTP methods to backend
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Method \$request_method;
        
        # Don't filter methods at Nginx level
        # Allow all standard methods
    }
    
    # Handle OPTIONS for CORS (if backend doesn't handle it)
    location /api/ {
        if (\$request_method = OPTIONS) {
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
            return 204;
        }
    }
}`,
        },
      ],
      relatedCodes: ['405', '500'],
      provider: 'http',
    },
    '502': {
      code: '502',
      name: 'Bad Gateway',
      description: `Getting a 502 Bad Gateway means the gateway or proxy server received an invalid response from the upstream server—the backend crashed, returned malformed data, or closed the connection unexpectedly. This server-side error (5xx) happens when infrastructure (load balancer, reverse proxy, API gateway) can't get a valid response from the application server. Most common when the backend application crashes or times out, but also appears when upstream servers return invalid HTTP responses, network issues break connections mid-request, or the backend is overloaded and can't respond.`,
      metaDescription: 'Fix 502 Bad Gateway by checking upstream server status, increasing gateway timeouts, and implementing retry logic with exponential backoff for transient failures.',
      causes: [
        `Frontend: Client can't fix 502s directly, but retries can help if it's transient. No retry logic means users see errors during backend restarts.`,
        `Backend: Application server crashed or is restarting. Backend returns invalid HTTP response (malformed headers, incomplete response). Backend times out before completing request. Application errors cause backend to close connection. Database connection failures cascade to HTTP errors.`,
        `Infrastructure: Upstream server is down or unreachable. Network issues between gateway and backend (timeouts, packet loss). Load balancer health checks fail. Reverse proxy misconfiguration. API gateway can't reach backend service.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check gateway/proxy logs (Nginx error.log, load balancer logs) for upstream connection errors. Look for "upstream timed out", "connection refused", or "invalid response" messages. Check if backend server is running.`,
        `Step 2: Diagnose - Check backend application logs for crashes or errors. Verify backend server status (systemctl status, process list). Check network connectivity between gateway and backend. Review health check endpoints.`,
        `Step 3: Fix - Client-side: Implement retry logic with exponential backoff for 502s (they're often transient). Show user-friendly error messages. Log 502 errors for monitoring. Implement circuit breakers.`,
        `Step 4: Fix - Server-side: Restart crashed backend application. Fix application errors causing invalid responses. Increase backend timeout settings. Add health check endpoints. Implement graceful shutdown.`,
        `Step 5: Fix - Infrastructure: Increase gateway timeout settings (proxy_read_timeout, proxy_connect_timeout). Configure health checks properly. Add fallback upstream servers. Fix network connectivity issues. Scale backend if overloaded.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Retry Logic for 502 Errors',
          code: `// Client-side: Handle 502 with retry (often transient)
async function fetchWithGatewayRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 502) {
        if (attempt < maxRetries - 1) {
          // Exponential backoff for gateway errors
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(\`Gateway error, retrying in \${delay}ms (attempt \${attempt + 1})\`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error('Gateway error after maximum retries');
        }
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Network errors - retry with backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage with user feedback
async function loadData() {
  try {
    const response = await fetchWithGatewayRetry('/api/data');
    return await response.json();
  } catch (error) {
    showUserMessage({
      type: 'error',
      title: 'Service Temporarily Unavailable',
      message: 'The server is temporarily unavailable. Please try again in a moment.',
    });
    throw error;
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Gateway Error Handling',
          code: `// Server-side: Handle upstream errors gracefully
const express = require('express');
const app = express();

// Gateway/proxy middleware
app.use('/api', async (req, res, next) => {
  try {
    const upstreamUrl = process.env.UPSTREAM_URL || 'http://backend:3000';
    const timeout = 30000; // 30 seconds
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const upstreamResponse = await fetch(upstreamUrl + req.path, {
      method: req.method,
      headers: {
        ...req.headers,
        'host': new URL(upstreamUrl).host,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body) 
        : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check for invalid response
    if (!upstreamResponse.ok && upstreamResponse.status >= 500) {
      return res.status(502).json({
        error: 'Bad Gateway',
        message: 'Upstream server returned an error',
      });
    }
    
    // Forward response
    const data = await upstreamResponse.json();
    res.status(upstreamResponse.status).json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway Timeout' });
    }
    
    console.error('Gateway error:', error);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Failed to connect to upstream server',
    });
  }
});

// Health check endpoint (bypasses gateway)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Gateway Error Handling',
          code: `# Nginx: Configure gateway with proper error handling
upstream backend {
    server backend1:3000 max_fails=3 fail_timeout=30s;
    server backend2:3000 max_fails=3 fail_timeout=30s backup;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        
        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Error handling
        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
        proxy_next_upstream_tries 3;
        proxy_next_upstream_timeout 10s;
        
        # Custom 502 error page
        error_page 502 503 504 /50x.html;
    }
    
    # Health check (bypasses error handling)
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
    
    # Custom error page
    location = /50x.html {
        root /usr/share/nginx/html;
        internal;
    }
}`,
        },
      ],
      relatedCodes: ['503', '504'],
      provider: 'http',
    },
    '503': {
      code: '503',
      name: 'Service Unavailable',
      description: `Hitting a 503 Service Unavailable means the server is temporarily unable to handle requests—it's overloaded, under maintenance, or resources are exhausted. This server-side error (5xx) indicates a temporary condition that should resolve. Most common during traffic spikes that overwhelm the server, but also appears when maintenance mode is enabled, database connection pools are exhausted, or the server is scaling up to handle load.`,
      metaDescription: 'Solve 503 Service Unavailable by respecting Retry-After headers, implementing exponential backoff, and scaling resources to handle traffic spikes effectively.',
      causes: [
        `Frontend: Client can't fix 503s directly, but respecting Retry-After helps. Rapid retries worsen server load. No retry logic means users see errors during maintenance.`,
        `Backend: Server overloaded (CPU/memory exhausted). Database connection pool exhausted. Application in maintenance mode. Service dependencies unavailable (external APIs down). Rate limiting triggered at application level.`,
        `Infrastructure: Load balancer marks all backends as unhealthy. All upstream servers overloaded. Maintenance mode enabled in infrastructure. Auto-scaling hasn't caught up with traffic spike. CDN origin server overloaded.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check server logs for overload indicators (high CPU, memory usage). Review Retry-After header value. Check if maintenance mode is enabled. Review database connection pool metrics.`,
        `Step 2: Diagnose - Check application monitoring for resource exhaustion. Review load balancer health check status. Check if all upstream servers are down. Examine traffic patterns (DDoS, traffic spike).`,
        `Step 3: Fix - Client-side: Respect Retry-After header values. Implement exponential backoff for retries. Show user-friendly "Service temporarily unavailable" messages. Queue requests instead of rapid retries.`,
        `Step 4: Fix - Server-side: Scale resources (add more instances, increase memory). Increase database connection pool size. Disable maintenance mode if not needed. Implement request queuing. Add circuit breakers for dependencies.`,
        `Step 5: Fix - Infrastructure: Scale horizontally (add more backend servers). Configure auto-scaling rules. Review load balancer health check thresholds. Enable CDN caching to reduce origin load.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Respect Retry-After Header',
          code: `// Client-side: Handle 503 with Retry-After header
async function fetchWithServiceRetry(url, options = {}, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);
    
    if (response.status === 503) {
      // Check Retry-After header (seconds) or use exponential backoff
      const retryAfter = response.headers.get('Retry-After');
      let delay;
      
      if (retryAfter) {
        // Parse Retry-After (can be seconds or HTTP-date)
        const retryAfterNum = parseInt(retryAfter);
        if (!isNaN(retryAfterNum)) {
          delay = retryAfterNum * 1000; // Convert to milliseconds
        } else {
          // HTTP-date format
          const retryDate = new Date(retryAfter);
          delay = Math.max(0, retryDate.getTime() - Date.now());
        }
      } else {
        // Exponential backoff with jitter
        delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      }
      
      if (attempt < maxRetries - 1) {
        console.log(\`Service unavailable, retrying in \${Math.ceil(delay / 1000)}s (attempt \${attempt + 1})\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        throw new Error('Service unavailable after maximum retries');
      }
    }
    
    return response;
  }
}

// Usage with user feedback
async function loadData() {
  try {
    const response = await fetchWithServiceRetry('/api/data');
    return await response.json();
  } catch (error) {
    showUserMessage({
      type: 'warning',
      title: 'Service Temporarily Unavailable',
      message: 'The service is temporarily unavailable. Please try again in a few moments.',
    });
    throw error;
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Maintenance Mode and Resource Limits',
          code: `// Server-side: Handle service unavailable scenarios
const express = require('express');
const app = express();

let isMaintenanceMode = false;
let requestCount = 0;
const MAX_CONCURRENT_REQUESTS = 100;

// Maintenance mode middleware
app.use((req, res, next) => {
  if (isMaintenanceMode) {
    return res.status(503)
      .set('Retry-After', '3600') // 1 hour
      .json({
        error: 'Service Unavailable',
        message: 'Service is under maintenance',
        retryAfter: 3600,
      });
  }
  next();
});

// Request limit middleware
app.use((req, res, next) => {
  requestCount++;
  
  if (requestCount > MAX_CONCURRENT_REQUESTS) {
    requestCount--;
    return res.status(503)
      .set('Retry-After', '60') // 1 minute
      .json({
        error: 'Service Unavailable',
        message: 'Server is overloaded. Please try again later.',
        retryAfter: 60,
      });
  }
  
  res.on('finish', () => {
    requestCount--;
  });
  
  next();
});

// Database connection pool check
app.use(async (req, res, next) => {
  try {
    // Check if database connection pool is available
    const pool = db.getPool();
    if (pool.totalCount >= pool.max) {
      return res.status(503)
        .set('Retry-After', '30')
        .json({
          error: 'Service Unavailable',
          message: 'Database connection pool exhausted',
          retryAfter: 30,
        });
    }
    next();
  } catch (error) {
    return res.status(503)
      .set('Retry-After', '60')
      .json({
        error: 'Service Unavailable',
        message: 'Database connection failed',
        retryAfter: 60,
      });
  }
});

// Health check endpoint (bypasses all middleware)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    maintenanceMode: isMaintenanceMode,
    requestCount: requestCount,
    timestamp: new Date().toISOString(),
  });
});

// Toggle maintenance mode
app.post('/admin/maintenance', (req, res) => {
  isMaintenanceMode = req.body.enabled || false;
  res.json({ maintenanceMode: isMaintenanceMode });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Service Unavailable Handling',
          code: `# Nginx: Configure service unavailable responses
upstream backend {
    server backend1:3000;
    server backend2:3000;
    # Health checks will mark servers as down if they return 503
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Handle 503 from upstream
        proxy_next_upstream error timeout http_500 http_502 http_503;
        proxy_next_upstream_tries 2;
        
        # Custom 503 error page
        error_page 503 /503.html;
    }
    
    # Custom 503 page
    location = /503.html {
        root /usr/share/nginx/html;
        internal;
        default_type text/html;
        return 503 '<!DOCTYPE html><html><head><title>Service Unavailable</title></head><body><h1>503 Service Unavailable</h1><p>The service is temporarily unavailable. Please try again later.</p></body></html>';
        add_header Retry-After 60 always;
    }
    
    # Maintenance mode (return 503 for all requests)
    # if (\$maintenance_mode = 1) {
    #     return 503 'Service under maintenance';
    #     add_header Retry-After 3600 always;
    # }
}`,
        },
      ],
      relatedCodes: ['502', '504', '429'],
      provider: 'http',
    },
    '504': {
      code: '504',
      name: 'Gateway Timeout',
      description: `Getting a 504 Gateway Timeout means the gateway or proxy waited too long for the upstream server to respond—the backend took longer than the gateway's timeout, the request is still processing, or the backend is hung. This server-side error (5xx) happens when infrastructure (load balancer, reverse proxy) times out waiting for the application server. Most common when backend operations are slow (database queries, external API calls), but also appears when gateway timeout settings are too aggressive, network latency is high, or the backend is overloaded and can't respond in time.`,
      metaDescription: 'Fix 504 Gateway Timeout by increasing proxy timeouts, optimizing slow database queries, and implementing async processing for long-running operations.',
      causes: [
        `Frontend: Client can't fix 504s directly, but retries can help if it's transient. Long-running requests may need timeout handling.`,
        `Backend: Slow database queries (missing indexes, full table scans). Long-running operations (file processing, data exports). External API calls timeout. Application hangs or deadlocks. Resource exhaustion (CPU, memory) slows processing.`,
        `Infrastructure: Gateway timeout too short (proxy_read_timeout, proxy_send_timeout). Network latency between gateway and backend. Upstream server overloaded and slow to respond. Load balancer health check timeout.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check gateway logs for timeout messages ("upstream timed out"). Review gateway timeout settings (Nginx proxy_read_timeout). Check backend response times in monitoring. Look for slow database queries.`,
        `Step 2: Diagnose - Check backend application logs for slow operations. Review database query performance. Check external API response times. Examine resource usage (CPU, memory).`,
        `Step 3: Fix - Client-side: Implement longer timeouts for long-running requests. Show progress indicators for operations that take time. Implement retry logic with longer delays. Use polling for async operations instead of waiting.`,
        `Step 4: Fix - Server-side: Optimize slow database queries (add indexes, optimize joins). Implement async processing for long operations (queue jobs). Add timeouts to external API calls. Fix application hangs or deadlocks.`,
        `Step 5: Fix - Infrastructure: Increase gateway timeout settings (proxy_read_timeout 60s, proxy_send_timeout 60s). Optimize network connectivity. Scale backend if overloaded. Configure appropriate health check timeouts.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle Long-Running Requests',
          code: `// Client-side: Handle 504 with longer timeouts and retries
async function fetchWithTimeout(url, options = {}, timeout = 60000) {
const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 504) {
      // Gateway timeout - might be transient, retry once
      console.warn('Gateway timeout, retrying...');
      return fetchWithTimeout(url, options, timeout);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// For long-running operations, use polling instead
async function startLongOperation() {
  // Start async operation
  const startResponse = await fetch('/api/operations/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'export' }),
  });
  
  const { operationId } = await startResponse.json();
  
  // Poll for completion instead of waiting
  while (true) {
    const statusResponse = await fetch(\`/api/operations/\${operationId}\`);
    const { status, result } = await statusResponse.json();
    
    if (status === 'completed') {
      return result;
    } else if (status === 'failed') {
      throw new Error('Operation failed');
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Optimize Slow Operations',
          code: `// Server-side: Optimize operations to prevent timeouts
const express = require('express');
const app = express();

// Add timeout middleware
const timeout = (ms) => (req, res, next) => {
  req.setTimeout(ms, () => {
    res.status(504).json({
      error: 'Gateway Timeout',
      message: 'Request took too long to process',
    });
  });
  next();
};

// Optimize slow database queries
app.get('/api/users', timeout(30000), async (req, res) => {
  try {
    // Use indexed queries, limit results, add pagination
    const users = await db.users
      .find()
      .select('name email') // Only select needed fields
      .limit(100) // Limit results
      .skip((req.query.page || 0) * 100)
      .lean(); // Faster queries
    
    res.json(users);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// For long-running operations, use async processing
app.post('/api/export', async (req, res) => {
  // Start async job instead of processing synchronously
  const jobId = await queue.add('export', {
    userId: req.user.id,
    filters: req.body.filters,
  });
  
  res.status(202).json({
    message: 'Export started',
    jobId: jobId,
    statusUrl: \`/api/jobs/\${jobId}\`,
  });
});

// Check job status
app.get('/api/jobs/:id', async (req, res) => {
  const job = await queue.getJob(req.params.id);
  const status = await job.getState();
  
  res.json({
    id: job.id,
    status: status,
    progress: job.progress,
    result: status === 'completed' ? job.returnvalue : null,
  });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Increase Gateway Timeouts',
          code: `# Nginx: Configure longer timeouts for slow operations
upstream backend {
    server backend1:3000;
    server backend2:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Increase timeouts for slow operations
        proxy_connect_timeout 10s;
        proxy_send_timeout 60s;      # Increased from default 60s
        proxy_read_timeout 60s;      # Increased from default 60s
        
        # Buffer settings for large responses
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # Don't fail on timeouts immediately
        proxy_next_upstream timeout;
        proxy_next_upstream_tries 2;
    }
    
    # Special location for long-running operations
    location /api/export {
        proxy_pass http://backend;
        proxy_read_timeout 300s;    # 5 minutes for exports
        proxy_send_timeout 300s;
    }
}`,
        },
      ],
      relatedCodes: ['408', '502', '503'],
      provider: 'http',
    },
    '505': {
      code: '505',
      name: 'HTTP Version Not Supported',
      description: `Hitting a 505 HTTP Version Not Supported means the server doesn't support the HTTP protocol version you're using—requesting HTTP/2 or HTTP/3 on a server that only supports HTTP/1.1, or using an experimental version the server rejects. This server-side error (5xx) indicates a permanent protocol limitation. Most common when clients force HTTP/2 or HTTP/3 on legacy servers, but also appears when protocol negotiation fails, servers explicitly reject certain versions, or infrastructure doesn't support newer protocols.`,
      metaDescription: 'Fix 505 HTTP Version Not Supported by enabling HTTP/2 in Nginx, forcing HTTP/1.1 in clients, and configuring proper protocol negotiation with ALPN.',
      causes: [
        `Frontend: Client forces HTTP/2 or HTTP/3 on server that doesn't support it. Browser auto-negotiates unsupported version. Fetch API uses unsupported protocol version. Client library defaults to newer HTTP version.`,
        `Backend: Server only supports HTTP/1.1. HTTP/2 or HTTP/3 not configured. Protocol negotiation fails. Server explicitly rejects certain versions. Legacy server without modern protocol support.`,
        `Infrastructure: Load balancer doesn't support HTTP/2. Reverse proxy strips HTTP/2 headers. TLS/SSL configuration doesn't support ALPN (Application-Layer Protocol Negotiation). CDN doesn't support requested HTTP version.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Protocol column—see which HTTP version is used. Review server response headers. Check if client is forcing specific version. Review protocol negotiation logs.`,
        `Step 2: Diagnose - Server logs show which HTTP version was rejected. Check server configuration for supported protocols. Review TLS/SSL configuration for ALPN. Verify infrastructure protocol support.`,
        `Step 3: Fix - Client-side: Downgrade to HTTP/1.1 if server doesn't support newer versions. Let browser auto-negotiate protocol. Remove explicit protocol version forcing. Update client libraries.`,
        `Step 4: Fix - Server-side: Enable HTTP/2 support if needed (requires TLS). Configure protocol negotiation (ALPN). Update server software for modern protocol support. Return 505 with Upgrade header if appropriate.`,
        `Step 5: Fix - Infrastructure: Configure load balancer for HTTP/2 support. Enable ALPN in TLS configuration. Update reverse proxy for protocol support. Configure CDN for requested HTTP version.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle HTTP Version Issues',
          code: `// Client-side: Handle 505 by falling back to HTTP/1.1
async function fetchWithVersionFallback(url, options = {}) {
  try {
    // Try with default protocol (browser will negotiate)
    const response = await fetch(url, options);
    
    if (response.status === 505) {
      console.warn('HTTP version not supported, server may only support HTTP/1.1');
      
      // Check Upgrade header if present
      const upgrade = response.headers.get('Upgrade');
      if (upgrade) {
        console.log(\`Server suggests upgrade to: \${upgrade}\`);
      }
      
      // For 505, we can't easily force HTTP/1.1 in browser
      // The browser handles protocol negotiation automatically
      // This is more relevant for server-side clients
      throw new Error('HTTP version not supported by server');
    }
    
    return response;
  } catch (error) {
  if (error.message.includes('HTTP version')) {
      // Log error for debugging
      console.error('HTTP version negotiation failed');
    }
    throw error;
  }
}

// Note: Browser Fetch API handles HTTP version negotiation automatically
// 505 errors are rare in browsers but can occur with custom clients`,
        },
        {
          language: 'javascript',
          title: 'Node.js: Force HTTP/1.1 for Compatibility',
          code: `// Server-side client: Force HTTP/1.1 if server doesn't support HTTP/2
const https = require('https');
const http = require('http');

async function fetchWithHTTPVersion(url, options = {}) {
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  const client = isHttps ? https : http;
  
  return new Promise((resolve, reject) => {
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      // Force HTTP/1.1 by not using HTTP/2 agent
      // HTTP/2 requires special agent configuration
    }, (res) => {
      if (res.statusCode === 505) {
        // Server doesn't support HTTP version
        const upgrade = res.headers.upgrade;
        reject(new Error(\`HTTP version not supported. Server suggests: \${upgrade || 'HTTP/1.1'}\`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Usage
fetchWithHTTPVersion('https://api.example.com/endpoint')
  .then(response => console.log('Success:', response))
  .catch(error => console.error('Error:', error.message));`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Enable HTTP/2 Support',
          code: `# Nginx: Configure HTTP/2 support (requires TLS)
server {
    listen 443 ssl http2;  # Enable HTTP/2
    listen [::]:443 ssl http2;
    server_name api.example.com;
    
    # SSL/TLS configuration (required for HTTP/2)
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    
    # ALPN (Application-Layer Protocol Negotiation) for HTTP/2
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # HTTP/2 settings
    http2_max_field_size 16k;
    http2_max_header_size 32k;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass HTTP version to backend
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# Fallback HTTP/1.1 server (if HTTP/2 not available)
server {
    listen 80;
    server_name api.example.com;
    
    # Redirect to HTTPS/HTTP/2
    return 301 https://\$server_name\$request_uri;
}`,
        },
      ],
      relatedCodes: ['400', '501'],
      provider: 'http',
    },
    '507': {
      code: '507',
      name: 'Insufficient Storage',
      description: `Getting a 507 Insufficient Storage means the server ran out of disk space or hit storage quotas—the file system is full, storage quota exceeded, or there's no room to save uploaded files or generated data. This server-side error (5xx) happens when servers can't write data due to storage limits. Most common during large file uploads when disk space is exhausted, but also appears when log files fill up the disk, database storage quotas are reached, or temporary file storage runs out.`,
      metaDescription: 'Fix 507 Insufficient Storage by monitoring disk space, implementing storage quotas, and handling file upload limits to prevent storage exhaustion.',
      causes: [
        `Frontend: Client can't fix 507s directly, but reducing upload sizes helps. Large file uploads fail when server storage is full. No retry logic means users see errors.`,
        `Backend: Disk space exhausted (df -h shows 100% usage). Storage quota exceeded (user/application quotas). Log files filling up disk (unrotated logs). Database storage limits reached. Temporary file storage full.`,
        `Infrastructure: Container storage limits exceeded. Volume mounts full. Cloud storage quotas reached. Backup storage consuming space. File system corruption preventing writes.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check server disk usage (df -h, du -sh). Review storage quotas in cloud console. Check log file sizes (find /var/log -size +100M). Review database storage usage. Check container storage limits.`,
        `Step 2: Diagnose - Server logs show "No space left on device" errors. Review which directories are consuming space. Check for large temporary files. Examine backup storage usage.`,
        `Step 3: Fix - Client-side: Reduce file upload sizes. Compress files before uploading. Implement chunked uploads. Show user-friendly error messages. Retry with smaller files.`,
        `Step 4: Fix - Server-side: Free up disk space (delete old logs, temporary files). Implement log rotation. Increase storage quotas. Clean up old database records. Implement storage monitoring and alerts.`,
        `Step 5: Fix - Infrastructure: Increase container storage limits. Expand volume sizes. Request cloud storage quota increases. Configure automatic log rotation. Set up storage monitoring.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle Storage Errors',
          code: `// Client-side: Handle 507 with user feedback
async function uploadFile(file) {
  // Check file size before upload
  const maxFileSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxFileSize) {
    throw new Error('File too large. Maximum size is 100MB.');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
  const response = await fetch('/api/upload', {
    method: 'POST',
      body: formData,
  });
  
  if (response.status === 507) {
      const error = await response.json();
      showUserMessage({
        type: 'error',
        title: 'Storage Full',
        message: 'Server storage is full. Please try again later or contact support.',
      });
      throw new Error('Insufficient storage on server');
    }
    
    if (!response.ok) {
      throw new Error(\`Upload failed: \${response.status}\`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Check storage availability before upload
async function checkStorageAvailability() {
  try {
    const response = await fetch('/api/storage/info');
    const { available, total, used } = await response.json();
    
    if (available < 1024 * 1024) { // Less than 1MB
      console.warn('Server storage is running low');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to check storage:', error);
    return true; // Assume available if check fails
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Storage Monitoring and Limits',
          code: `// Server-side: Monitor storage and handle 507 errors
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const multer = require('multer');

// Check disk space
function checkDiskSpace(dir) {
  try {
    const stats = fs.statfsSync(dir);
    const freeBytes = stats.bavail * stats.bsize;
    const totalBytes = stats.blocks * stats.bsize;
    const usedBytes = totalBytes - freeBytes;
    const freePercent = (freeBytes / totalBytes) * 100;
    
    return {
      free: freeBytes,
      total: totalBytes,
      used: usedBytes,
      freePercent: freePercent,
    };
  } catch (error) {
    console.error('Failed to check disk space:', error);
    return null;
  }
}

// Storage check middleware
const checkStorage = (req, res, next) => {
  const uploadDir = path.join(__dirname, 'uploads');
  const storage = checkDiskSpace(uploadDir);
  
  if (!storage) {
    return res.status(500).json({ error: 'Failed to check storage' });
  }
  
  // Warn if less than 10% free
  if (storage.freePercent < 10) {
    console.warn(\`Low disk space: \${storage.freePercent.toFixed(2)}% free\`);
  }
  
  // Reject if less than 1% free
  if (storage.freePercent < 1) {
    return res.status(507).json({
      error: 'Insufficient Storage',
      message: 'Server storage is full. Please try again later.',
      storage: {
        free: storage.free,
        freePercent: storage.freePercent.toFixed(2),
      },
    });
  }
  
  req.storageInfo = storage;
  next();
};

// Configure multer with storage limits
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Check storage before accepting file
    const storage = checkDiskSpace('uploads/');
    if (storage && storage.freePercent < 1) {
      cb(new Error('Insufficient storage'));
    } else {
      cb(null, true);
    }
  },
});

// Upload endpoint with storage check
app.post('/api/upload', checkStorage, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename,
    size: req.file.size,
    storage: req.storageInfo,
  });
});

// Storage info endpoint
app.get('/api/storage/info', (req, res) => {
  const storage = checkDiskSpace('uploads/');
  if (!storage) {
    return res.status(500).json({ error: 'Failed to check storage' });
  }
  
  res.json({
    available: storage.free,
    total: storage.total,
    used: storage.used,
    freePercent: storage.freePercent.toFixed(2),
  });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Storage and File Upload Limits',
          code: `# Nginx: Configure file upload limits and storage monitoring
server {
    listen 80;
    server_name api.example.com;
    
    # Limit request body size (prevents filling disk)
    client_max_body_size 100M;
    
    # Buffer settings
    client_body_buffer_size 128k;
    client_body_temp_path /var/cache/nginx/client_temp;
    
    location /api/upload {
        # Check if temp directory has space
        # (Nginx doesn't directly check disk space, but limits help)
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Increase timeouts for large uploads
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
        
        # Don't buffer large uploads
        proxy_request_buffering off;
    }
    
    # Error page for 413 (Payload Too Large) - related to storage
    error_page 413 /413.html;
    location = /413.html {
        return 413 '{"error":"Payload Too Large","message":"File size exceeds maximum allowed size"}';
        default_type application/json;
    }
}

# Monitor disk space with external script
# Add to crontab: */5 * * * * /usr/local/bin/check-disk-space.sh
# Script should alert if disk usage > 90%`,
        },
      ],
      relatedCodes: ['413', '503'],
      provider: 'http',
    },
    '511': {
      code: '511',
      name: 'Network Authentication Required',
      description: `Hitting a 511 Network Authentication Required means you need to authenticate with the network before accessing the internet—captive portals in hotels, airports, or public Wi-Fi require login or terms acceptance. This client-side error (4xx) happens when network infrastructure intercepts requests to force authentication. Most common when connecting to public Wi-Fi that requires login, but also appears when corporate networks require authentication, terms of service must be accepted, or network access control (NAC) systems block unauthenticated devices.`,
      metaDescription: 'Fix 511 Network Authentication Required by implementing captive portal detection, redirecting to authentication pages, and handling network access control properly.',
      causes: [
        `Frontend: Browser automatically detects captive portal and shows login page. User hasn't completed network authentication. Terms of service not accepted. Network requires payment or registration.`,
        `Backend: Captive portal system intercepts requests. Network access control (NAC) requires authentication. Corporate network requires device registration. Guest network requires login.`,
        `Infrastructure: Router/gateway redirects to captive portal. Network firewall blocks unauthenticated traffic. Wi-Fi access point requires authentication. Network management system enforces authentication.`,
      ],
      solutions: [
        `Step 1: Diagnose - Browser shows captive portal login page automatically. Check if URL redirects to authentication page. Look for "Network Authentication Required" message. Check network connection status.`,
        `Step 2: Diagnose - Network logs show authentication status. Check captive portal configuration. Review network access control rules. Verify device registration status.`,
        `Step 3: Fix - Client-side: Complete captive portal login. Accept terms of service if prompted. Register device on network if required. Pay for network access if needed. Wait for authentication to complete.`,
        `Step 4: Fix - Server-side: Return 511 with Location header pointing to login page. Provide clear authentication instructions. Support automatic portal detection. Implement proper redirect handling.`,
        `Step 5: Fix - Infrastructure: Configure captive portal properly. Set up network access control rules. Ensure authentication redirects work. Configure DNS for portal detection.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle Captive Portal',
          code: `// Client-side: Detect and handle 511 network authentication
async function fetchWithNetworkAuth(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 511) {
      // Network authentication required
      const authUrl = response.headers.get('Location') || 
                   response.headers.get('X-Authentication-URL') ||
                   '/network-auth';
      
      // Redirect to authentication page
      if (typeof window !== 'undefined') {
      window.location.href = authUrl;
      }
      
      throw new Error('Network authentication required');
    }
    
    return response;
  } catch (error) {
    if (error.message.includes('Network authentication')) {
      console.warn('Network authentication required - redirecting to login');
    }
    throw error;
  }
}

// Detect captive portal automatically
async function detectCaptivePortal() {
  try {
    // Try to fetch a known endpoint
    const response = await fetch('/api/health', {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (response.status === 511) {
      return {
        requiresAuth: true,
        authUrl: response.headers.get('Location') || '/network-auth',
      };
    }
    
    // Check if response was redirected to login page
    if (response.redirected && response.url.includes('login')) {
      return {
        requiresAuth: true,
        authUrl: response.url,
      };
    }
    
    return { requiresAuth: false };
  } catch (error) {
    // Network error might indicate captive portal
    return { requiresAuth: true, authUrl: '/network-auth' };
  }
}

// Usage
detectCaptivePortal().then(({ requiresAuth, authUrl }) => {
  if (requiresAuth) {
    showNetworkAuthDialog(authUrl);
  }
  });`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Captive Portal Implementation',
          code: `// Server-side: Implement captive portal with 511
const express = require('express');
const app = express();

// Middleware to check network authentication
const requireNetworkAuth = (req, res, next) => {
  // Check if user is authenticated on network
  const networkAuthToken = req.cookies.network_auth_token;
  const isAuthenticated = checkNetworkAuth(networkAuthToken);
  
  if (!isAuthenticated) {
    // Return 511 with authentication URL
    const authUrl = \`\${req.protocol}://\${req.get('host')}/network-auth?redirect=\${encodeURIComponent(req.originalUrl)}\`;
    
    return res.status(511)
      .set('Location', authUrl)
      .set('X-Authentication-URL', authUrl)
      .json({
        error: 'Network Authentication Required',
        message: 'You must authenticate with the network to access this resource',
        authenticationUrl: authUrl,
      });
  }
  
  next();
};

// Network authentication endpoint
app.get('/network-auth', (req, res) => {
  const redirectUrl = req.query.redirect || '/';
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Network Authentication Required</title>
    </head>
    <body>
      <h1>Network Authentication</h1>
      <p>Please authenticate to access the network.</p>
      <form action="/network-auth" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Authenticate</button>
      </form>
      <input type="hidden" name="redirect" value="\${redirectUrl}">
    </body>
    </html>
  \`);
});

// Handle authentication
app.post('/network-auth', (req, res) => {
  const { username, password, redirect } = req.body;
  
  // Validate credentials (simplified example)
  if (validateNetworkCredentials(username, password)) {
    // Set authentication token
    const token = generateNetworkAuthToken(username);
    res.cookie('network_auth_token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Redirect to original URL
    res.redirect(redirect || '/');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Protected routes require network authentication
app.use('/api', requireNetworkAuth);

// Health check (bypasses authentication)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Captive Portal Configuration',
          code: `# Nginx: Configure captive portal with 511 redirects
server {
    listen 80;
    server_name _;  # Catch-all for captive portal
    
    # Default location - redirect to authentication
    location / {
        # Check if user is authenticated (via cookie or IP)
        if (\$cookie_network_auth != "authenticated") {
            return 511 '{"error":"Network Authentication Required","authenticationUrl":"/network-auth"}';
            add_header Location /network-auth always;
            add_header Content-Type application/json always;
        }
        
        proxy_pass http://backend;
    }
    
    # Authentication page
    location /network-auth {
        root /var/www/captive-portal;
        try_files \$uri /network-auth.html;
    }
    
    # Allow access to authentication endpoints
    location ~ ^/(network-auth|login|terms) {
        proxy_pass http://backend;
    }
    
    # Health check (bypasses authentication)
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}

# Alternative: Use external authentication service
# location / {
#     auth_request /auth;
#     auth_request_set \$auth_status \$upstream_status;
#     
#     if (\$auth_status = 401) {
#         return 511 '{"error":"Network Authentication Required"}';
#     }
#     
#     proxy_pass http://backend;
# }`,
        },
      ],
      relatedCodes: ['401', '403'],
      provider: 'http',
    },
    '417': {
      code: '417',
      name: 'Expectation Failed',
      description: `Getting a 417 Expectation Failed means the server couldn't meet the requirement in your Expect header—most commonly "Expect: 100-continue" where the server refuses to send a 100 Continue response before processing the request body. This client-side error (4xx) happens when servers reject expectation headers they don't support or can't fulfill. Most common when clients send Expect: 100-continue for large uploads but the server doesn't support it, but also appears when custom expectation values are unsupported, servers explicitly reject expectations, or proxy servers strip Expect headers.`,
      metaDescription: 'Fix 417 Expectation Failed by removing Expect headers, implementing 100-continue support, and configuring Nginx to properly handle expectation requests.',
      causes: [
        `Frontend: Sending Expect: 100-continue header but server doesn't support it. Custom Expect header values not recognized. Browser or HTTP client automatically adds Expect header. Expect header format is invalid.`,
        `Backend: Server doesn't implement 100-continue protocol. Expect header validation rejects the value. Server configuration disables expectation support. Proxy middleware strips Expect headers before reaching application.`,
        `Infrastructure: Load balancer doesn't support Expect headers. Reverse proxy strips or modifies Expect headers. API gateway rejects expectation requests. WAF blocks Expect headers for security.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—look for Expect header. Verify if Expect: 100-continue is present. Check if server response includes explanation. Review if proxy is stripping headers.`,
        `Step 2: Diagnose - Server logs show which Expect value was rejected. Review server configuration for Expect header support. Check if middleware is removing Expect headers. Verify proxy settings.`,
        `Step 3: Fix - Client-side: Remove Expect header if not needed (most servers work without it). Retry request without Expect header if 417 occurs. Use chunked transfer encoding instead of 100-continue.`,
        `Step 4: Fix - Server-side: Implement 100-continue support if needed. Return 417 with clear error message. Configure middleware to pass Expect headers. Update server configuration to support expectations.`,
        `Step 5: Fix - Infrastructure: Configure load balancer to pass Expect headers. Review reverse proxy header handling. Update API gateway to support Expect headers. Check WAF rules for Expect header blocking.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 417 by Removing Expect Header',
          code: `// Client-side: Handle 417 by retrying without Expect header
async function uploadData(data) {
  // First attempt with Expect header (if needed for large uploads)
  let response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
      'Expect': '100-continue', // Server may not support this
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 417) {
    // Server doesn't support Expect header - retry without it
    console.warn('Server rejected Expect header, retrying without it');
    response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Expect header removed
      },
      body: JSON.stringify(data),
    });
  }
  
  return response.json();
}

// For large file uploads, use chunked encoding instead
async function uploadLargeFile(file) {
  // Don't use Expect: 100-continue, use chunked transfer instead
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData, // FormData automatically uses chunked encoding
    // No Expect header needed
  });
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Support 100-Continue Protocol',
          code: `// Server-side: Implement 100-continue support
const express = require('express');
const app = express();

// Middleware to handle Expect: 100-continue
app.use((req, res, next) => {
  const expectHeader = req.headers.expect;
  
  if (expectHeader && expectHeader.toLowerCase() === '100-continue') {
    // Check if we can handle the request
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      // Reject with 417 if file too large
      return res.status(417).json({
        error: 'Expectation Failed',
        message: 'Request body too large for 100-continue',
      });
    }
    
    // Send 100 Continue response
    res.writeContinue();
  }
  
  next();
});

// Or explicitly reject Expect headers
app.use((req, res, next) => {
  if (req.headers.expect && req.headers.expect.toLowerCase() === '100-continue') {
    // Server doesn't support 100-continue
    return res.status(417).json({
      error: 'Expectation Failed',
      message: '100-continue not supported',
    });
  }
  next();
});

// Upload endpoint
app.post('/api/upload', express.json({ limit: '10mb' }), (req, res) => {
  res.json({ success: true, data: req.body });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Expect Headers',
          code: `# Nginx: Configure Expect header handling
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass Expect header to backend
        proxy_set_header Expect \$http_expect;
        
        # Or remove Expect header if backend doesn't support it
        # proxy_set_header Expect "";
        
        # Handle 100-continue
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}`,
        },
      ],
      relatedCodes: ['400', '100'],
      provider: 'http',
    },
    '426': {
      code: '426',
      name: 'Upgrade Required',
      description: `Hitting a 426 Upgrade Required means the server refuses your request because it requires a protocol upgrade—using HTTP/1.0 when the server needs HTTP/1.1, or trying HTTP when HTTPS is mandatory. This client-side error (4xx) happens when servers enforce minimum protocol versions. Most common when legacy clients use HTTP/1.0 on servers requiring HTTP/1.1, but also appears when servers require TLS upgrades, WebSocket upgrades are mandatory, or security policies enforce protocol minimums.`,
      metaDescription: 'Fix 426 Upgrade Required by upgrading to HTTP/1.1, enabling HTTPS, and configuring servers to properly handle protocol upgrade requirements.',
      causes: [
        `Frontend: Using HTTP/1.0 when server requires HTTP/1.1. Making HTTP requests when server requires HTTPS. Client library defaults to old protocol version. Browser using outdated HTTP version.`,
        `Backend: Server configuration requires HTTP/1.1 minimum. Security policy enforces TLS/HTTPS. Protocol upgrade middleware rejects old versions. Server explicitly requires protocol upgrade.`,
        `Infrastructure: Load balancer enforces protocol minimums. Reverse proxy requires protocol upgrade. API gateway rejects old protocol versions. WAF blocks outdated protocols.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Protocol column—see which HTTP version is used. Review request URL (http:// vs https://). Check Upgrade header in response. Verify protocol negotiation.`,
        `Step 2: Diagnose - Server logs show which protocol was rejected. Review server configuration for protocol requirements. Check if Upgrade header specifies required protocol. Verify infrastructure protocol settings.`,
        `Step 3: Fix - Client-side: Upgrade to HTTP/1.1 or higher. Use HTTPS instead of HTTP. Update client libraries to support modern protocols. Let browser auto-negotiate protocol.`,
        `Step 4: Fix - Server-side: Return 426 with Upgrade header showing required protocol. Configure server to accept HTTP/1.1 minimum. Implement protocol upgrade handling. Update security policies.`,
        `Step 5: Fix - Infrastructure: Configure load balancer for protocol upgrades. Enable HTTPS redirects. Update reverse proxy protocol requirements. Review API gateway protocol settings.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle Protocol Upgrade',
          code: `// Client-side: Handle 426 by upgrading protocol
async function fetchWithProtocolUpgrade(url) {
  let response = await fetch(url);
  
  if (response.status === 426) {
    // Check Upgrade header for required protocol
    const upgradeHeader = response.headers.get('Upgrade');
    console.warn(\`Protocol upgrade required: \${upgradeHeader}\`);
    
    // Upgrade to HTTPS if HTTP was used
    if (url.startsWith('http://')) {
      const httpsUrl = url.replace('http://', 'https://');
      console.log(\`Upgrading to HTTPS: \${httpsUrl}\`);
      response = await fetch(httpsUrl);
    }
    
    // Or check Upgrade header for specific protocol
    if (upgradeHeader && upgradeHeader.includes('TLS')) {
      // Upgrade to HTTPS
      const urlObj = new URL(url);
      urlObj.protocol = 'https:';
      response = await fetch(urlObj.toString());
    }
  }
  
  return response;
}

// Usage
fetchWithProtocolUpgrade('http://api.example.com/endpoint')
  .then(response => response.json())
  .catch(error => console.error('Protocol upgrade failed:', error));`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Require Protocol Upgrade',
          code: `// Server-side: Return 426 for protocol upgrades
const express = require('express');
const app = express();

// Middleware to require HTTP/1.1 or higher
app.use((req, res, next) => {
  const httpVersion = req.httpVersion;
  
  if (httpVersion === '1.0') {
    return res.status(426)
      .set('Upgrade', 'HTTP/1.1')
      .set('Connection', 'Upgrade')
      .json({
        error: 'Upgrade Required',
        message: 'Server requires HTTP/1.1 or higher',
        upgrade: 'HTTP/1.1',
      });
  }
  
  next();
});

// Require HTTPS
app.use((req, res, next) => {
  if (req.protocol !== 'https' && process.env.NODE_ENV === 'production') {
    return res.status(426)
      .set('Upgrade', 'TLS/1.2')
      .set('Connection', 'Upgrade')
      .json({
        error: 'Upgrade Required',
        message: 'Server requires HTTPS',
        upgrade: 'TLS/1.2',
      });
  }
  next();
});

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.protocol === 'http' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, \`https://\${req.get('host')}\${req.originalUrl}\`);
  }
  next();
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Force Protocol Upgrade',
          code: `# Nginx: Configure protocol upgrade requirements
server {
    listen 80;
    server_name api.example.com;
    
    # Redirect HTTP to HTTPS (upgrade required)
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    # SSL/TLS configuration
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    
    # Require HTTP/1.1 minimum
    # Nginx automatically handles this, but you can add custom logic
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Pass protocol version to backend
        proxy_set_header X-Protocol-Version \$server_protocol;
    }
    
    # Custom 426 response if needed
    # error_page 426 @upgrade_required;
    # location @upgrade_required {
    #     return 426 '{"error":"Upgrade Required","upgrade":"HTTP/1.1"}';
    #     add_header Upgrade "HTTP/1.1" always;
    #     add_header Connection "Upgrade" always;
    # }
}`,
        },
      ],
      relatedCodes: ['101', '505'],
      provider: 'http',
    },
    '428': {
      code: '428',
      name: 'Precondition Required',
      description: `Getting a 428 Precondition Required means the server requires conditional headers (If-Match, If-None-Match, If-Modified-Since, If-Unmodified-Since) but your request doesn't include them—the server enforces optimistic concurrency control and won't process requests without version checks. This client-side error (4xx) happens when servers mandate conditional requests to prevent lost updates. Most common when updating resources without ETag validation, but also appears when servers require If-Match for all modifications, delete operations need conditional headers, or security policies enforce version checks.`,
      metaDescription: 'Fix 428 Precondition Required by adding If-Match headers, retrieving ETags before updates, and configuring servers to properly enforce conditional request requirements.',
      causes: [
        `Frontend: Missing If-Match header for PUT/PATCH requests. No If-None-Match for create operations. Conditional headers not included in delete requests. ETag not retrieved before update.`,
        `Backend: Server middleware requires conditional headers for all modifications. Security policy enforces optimistic locking. Resource versioning mandates conditional requests. Server configuration requires If-Match for updates.`,
        `Infrastructure: API gateway enforces conditional header requirements. Load balancer strips conditional headers. Reverse proxy doesn't pass If-Match headers. WAF blocks requests without conditional headers.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—verify if If-Match or If-None-Match headers are present. Review server response for Precondition-Required header. Check if ETag was retrieved first.`,
        `Step 2: Diagnose - Server logs show which conditional header is missing. Review server configuration for precondition requirements. Check if middleware is enforcing conditional requests. Verify infrastructure header handling.`,
        `Step 3: Fix - Client-side: Get resource ETag first with GET request. Include If-Match header with ETag value for updates. Add If-None-Match: * for create operations. Retry with conditional headers if 428 occurs.`,
        `Step 4: Fix - Server-side: Return 428 with Precondition-Required header listing needed headers. Provide clear error messages about required conditions. Configure middleware to require conditional headers.`,
        `Step 5: Fix - Infrastructure: Ensure load balancer passes conditional headers. Configure reverse proxy to preserve If-Match headers. Update API gateway to allow conditional headers. Review WAF rules.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 428 with Conditional Headers',
          code: `// Client-side: Handle 428 by adding required conditional headers
async function updateResource(id, data) {
  // First, get resource to retrieve ETag
  const getResponse = await fetch(\`/api/resources/\${id}\`);
  
  if (getResponse.status === 428) {
    // Server requires conditional headers even for GET
    const preconditionRequired = getResponse.headers.get('Precondition-Required');
    throw new Error(\`Precondition required: \${preconditionRequired}\`);
  }
  
  const etag = getResponse.headers.get('ETag');
  
  if (!etag) {
    throw new Error('ETag not found in response');
  }
  
  // Update with If-Match header
  const updateResponse = await fetch(\`/api/resources/\${id}\`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': etag, // Required conditional header
    },
    body: JSON.stringify(data),
  });
  
  if (updateResponse.status === 428) {
    // Precondition required - check which header is needed
    const preconditionRequired = updateResponse.headers.get('Precondition-Required');
    throw new Error(\`Precondition required: \${preconditionRequired}\`);
  }
  
  if (updateResponse.status === 412) {
    // Precondition failed - ETag mismatch
    throw new Error('Resource was modified by another request');
  }
  
  return updateResponse.json();
}

// For create operations, use If-None-Match
async function createResource(data) {
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'If-None-Match': '*', // Prevents overwriting existing resources
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 428) {
    throw new Error('Precondition required for create operation');
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Require Conditional Headers',
          code: `// Server-side: Enforce conditional headers
const express = require('express');
const app = express();

// Middleware to require conditional headers for modifications
const requireConditionalHeaders = (req, res, next) => {
  const method = req.method;
  
  // Require conditional headers for PUT, PATCH, DELETE
  if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
    const hasIfMatch = req.headers['if-match'];
    const hasIfNoneMatch = req.headers['if-none-match'];
    const hasIfModifiedSince = req.headers['if-modified-since'];
    const hasIfUnmodifiedSince = req.headers['if-unmodified-since'];
    
    if (!hasIfMatch && !hasIfNoneMatch && !hasIfModifiedSince && !hasIfUnmodifiedSince) {
      return res.status(428)
        .set('Precondition-Required', 'If-Match, If-None-Match')
        .json({
          error: 'Precondition Required',
          message: 'This operation requires conditional headers (If-Match or If-None-Match)',
          required: ['If-Match', 'If-None-Match'],
        });
    }
  }
  
  next();
};

// Apply to all routes
app.use('/api/resources', requireConditionalHeaders);

// Update endpoint
app.put('/api/resources/:id', async (req, res) => {
  const etag = req.headers['if-match'];
  const resource = await db.resources.findById(req.params.id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  // Verify ETag matches
  if (etag && etag !== resource.etag) {
    return res.status(412).json({ error: 'Precondition Failed' });
  }
  
  const updated = await db.resources.update(req.params.id, req.body);
  res.set('ETag', updated.etag).json(updated);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Conditional Headers',
          code: `# Nginx: Ensure conditional headers reach backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass conditional headers to backend
        proxy_set_header If-Match \$http_if_match;
        proxy_set_header If-None-Match \$http_if_none_match;
        proxy_set_header If-Modified-Since \$http_if_modified_since;
        proxy_set_header If-Unmodified-Since \$http_if_unmodified_since;
        
        # Don't strip conditional headers
        proxy_pass_request_headers on;
    }
}`,
        },
      ],
      relatedCodes: ['412', '409'],
      provider: 'http',
    },
    '402': {
      code: '402',
      name: 'Payment Required',
      description: `Hitting a 402 Payment Required means the server requires payment to access the resource—subscription expired, credit limit reached, or payment method failed. This client-side error (4xx) is reserved for future use but commonly implemented by APIs requiring payment. Most common when accessing premium content without active subscription, but also appears when free tier limits are exceeded, payment methods are invalid, or billing issues block access.`,
      metaDescription: 'Fix 402 Payment Required by redirecting to payment pages, validating subscription status, and implementing proper payment gateway integration for premium content access.',
      causes: [
        `Frontend: User tries to access premium content without subscription. Free tier quota exceeded. Payment method expired or invalid. Subscription renewal failed. Account billing issue.`,
        `Backend: Subscription validation middleware checks payment status. Payment gateway reports failed transaction. Billing system marks account as unpaid. Free tier limit enforcement. Credit limit exceeded.`,
        `Infrastructure: API gateway enforces payment tiers. Load balancer routes based on subscription status. CDN restricts premium content access. Payment service integration fails.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—402 responses usually include payment information. Review subscription status in user account. Check payment method validity.`,
        `Step 2: Diagnose - Server logs show payment validation failures. Review subscription database records. Check payment gateway transaction logs. Examine billing system status.`,
        `Step 3: Fix - Client-side: Redirect user to payment page. Show subscription upgrade prompts. Display payment method update forms. Handle payment flow completion.`,
        `Step 4: Fix - Server-side: Return 402 with payment URL in headers. Implement subscription validation logic. Integrate payment gateway properly. Handle payment webhooks.`,
        `Step 5: Fix - Infrastructure: Configure API gateway payment tiers. Set up payment service integration. Review CDN access control rules. Monitor payment processing.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 402 Payment Required',
          code: `// Client-side: Handle 402 by redirecting to payment
async function fetchPremiumContent() {
  const response = await fetch('/api/premium-content', {
    method: 'GET',
    headers: { 'Authorization': \`Bearer \${token}\` },
  });
  
  if (response.status === 402) {
    const errorData = await response.json();
    const paymentUrl = response.headers.get('X-Payment-Url') || 
                      errorData.paymentUrl || 
                      '/payment';
    const redirectUrl = encodeURIComponent(window.location.pathname);
    
    // Redirect to payment page
    window.location.href = \`\${paymentUrl}?redirect=\${redirectUrl}\`;
    return null;
  }
  
  return response.json();
}

// Show subscription upgrade prompt
async function checkSubscription() {
  const response = await fetch('/api/subscription/status');
  
  if (response.status === 402) {
    showSubscriptionModal({
      title: 'Subscription Required',
      message: 'This feature requires a premium subscription.',
      actionUrl: '/subscribe',
    });
    return null;
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Payment Validation Middleware',
          code: `// Server-side: Implement payment validation
const express = require('express');
const app = express();

// Payment validation middleware
const requirePayment = async (req, res, next) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Check subscription status
  const subscription = await db.subscriptions.findByUserId(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return res.status(402)
      .set('X-Payment-Url', '/payment/subscribe')
      .json({
        error: 'Payment Required',
        message: 'This resource requires an active subscription',
        paymentUrl: '/payment/subscribe',
        subscriptionStatus: subscription?.status || 'none',
      });
  }
  
  // Check if free tier limit exceeded
  const usage = await db.usage.getCurrentMonth(userId);
  if (subscription.tier === 'free' && usage.count >= subscription.limit) {
    return res.status(402)
      .set('X-Payment-Url', '/payment/upgrade')
      .json({
        error: 'Payment Required',
        message: 'Free tier limit exceeded',
        paymentUrl: '/payment/upgrade',
        limit: subscription.limit,
        used: usage.count,
      });
  }
  
  next();
};

// Protected premium endpoint
app.get('/api/premium-content', requirePayment, async (req, res) => {
  const content = await db.content.findPremium();
  res.json(content);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Payment-Based Routing',
          code: `# Nginx: Route based on subscription status (via backend)
server {
    listen 80;
    server_name api.example.com;
    
    location /api/premium/ {
        # Backend handles payment validation
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header Authorization \$http_authorization;
        
        # Pass payment URL header to client
        proxy_pass_header X-Payment-Url;
    }
    
    # Payment endpoints (no authentication required)
    location /payment/ {
        proxy_pass http://payment-service;
        proxy_set_header Host \$host;
    }
}`,
        },
      ],
      relatedCodes: ['401', '403'],
      provider: 'http',
    },
    '406': {
      code: '406',
      name: 'Not Acceptable',
      description: `Getting a 406 Not Acceptable means the server can't produce a response in any format your Accept header requests—asking for application/xml when the server only serves JSON, or requesting a language/encoding the server doesn't support. This client-side error (4xx) happens when content negotiation fails. Most common when Accept headers request unsupported MIME types, but also appears when language preferences (Accept-Language) aren't available, character encodings (Accept-Encoding) are unsupported, or quality values (q=) prioritize unavailable formats.`,
      metaDescription: 'Fix 406 Not Acceptable by adjusting Accept headers, adding fallback formats, and implementing proper content negotiation with multiple MIME type support.',
      causes: [
        `Frontend: Accept header requests unsupported format (application/xml when server only does JSON). Accept-Language requests unavailable language. Accept-Encoding requests unsupported compression. Quality values prioritize unavailable formats. Missing fallback options in Accept header.`,
        `Backend: Server only supports specific content types. Content negotiation middleware rejects Accept header. Language/encoding not configured. Server doesn't implement requested format.`,
        `Infrastructure: API gateway enforces content type restrictions. Load balancer modifies Accept headers. Reverse proxy doesn't support content negotiation. CDN restricts available formats.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—review Accept header values. Verify if requested format is supported. Check Accept-Language and Accept-Encoding headers. Review quality values.`,
        `Step 2: Diagnose - Server logs show which Accept value was rejected. Review API documentation for supported formats. Check server content negotiation configuration. Verify infrastructure header handling.`,
        `Step 3: Fix - Client-side: Add fallback options to Accept header (application/json, application/xml;q=0.9). Use wildcard as last resort (*/*). Remove unsupported format requests. Simplify Accept header.`,
        `Step 4: Fix - Server-side: Support multiple content types (JSON, XML, etc.). Return 406 with Vary and Accept headers showing supported formats. Implement content negotiation properly. Add format detection.`,
        `Step 5: Fix - Infrastructure: Configure API gateway to pass Accept headers. Review reverse proxy content negotiation. Update CDN format support. Ensure load balancer preserves headers.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 406 with Accept Header Fallback',
          code: `// Client-side: Handle 406 by adjusting Accept header
async function fetchWithContentNegotiation(url) {
  // Try with preferred format first
  let response = await fetch(url, {
    headers: {
      'Accept': 'application/json, application/xml;q=0.9, text/plain;q=0.8',
    },
  });
  
  if (response.status === 406) {
    // Check what formats server supports
    const acceptHeader = response.headers.get('Accept');
    console.warn(\`Server doesn't support requested formats. Available: \${acceptHeader}\`);
    
    // Fallback to JSON only
    response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.status === 406) {
      // Last resort - accept anything
      response = await fetch(url, {
        headers: {
          'Accept': '*/*',
        },
      });
    }
  }
  
  return response.json();
}

// Handle language negotiation
async function fetchWithLanguage(url, preferredLanguage = 'en-US') {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Accept-Language': \`\${preferredLanguage}, en;q=0.9, *;q=0.8\`,
    },
  });
  
  if (response.status === 406) {
    // Fallback to English
    return fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
      },
    }).then(r => r.json());
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Content Negotiation Middleware',
          code: `// Server-side: Implement content negotiation
const express = require('express');
const app = express();

// Content negotiation middleware
const contentNegotiation = (req, res, next) => {
  const acceptHeader = req.headers.accept || '*/*';
  const acceptedTypes = acceptHeader.split(',').map(type => {
    const [mimeType, qValue] = type.trim().split(';q=');
    return {
      type: mimeType.trim(),
      q: qValue ? parseFloat(qValue) : 1.0,
    };
  }).sort((a, b) => b.q - a.q);
  
  // Check if server supports any requested format
  const supportedTypes = ['application/json', 'application/xml', 'text/plain'];
  const supported = acceptedTypes.find(accepted => 
    supportedTypes.some(supported => 
      accepted.type === supported || accepted.type === '*/*'
    )
  );
  
  if (!supported && !acceptedTypes.some(a => a.type === '*/*')) {
    return res.status(406)
      .set('Vary', 'Accept')
      .json({
        error: 'Not Acceptable',
        message: 'Server cannot produce a response in the requested format',
        supported: supportedTypes,
        requested: acceptedTypes.map(a => a.type),
      });
  }
  
  // Store preferred format
  req.preferredFormat = supported?.type === '*/*' 
    ? 'application/json' 
    : supported?.type || 'application/json';
  
  next();
};

// Route with content negotiation
app.get('/api/data', contentNegotiation, (req, res) => {
  const data = { message: 'Hello World', timestamp: Date.now() };
  
  if (req.preferredFormat === 'application/xml') {
    res.set('Content-Type', 'application/xml');
    res.send(\`<?xml version="1.0"?><data><message>\${data.message}</message></data>\`);
  } else {
    res.json(data);
  }
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Accept Headers',
          code: `# Nginx: Ensure Accept headers reach backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass Accept headers to backend
        proxy_set_header Accept \$http_accept;
        proxy_set_header Accept-Language \$http_accept_language;
        proxy_set_header Accept-Encoding \$http_accept_encoding;
        
        # Backend handles content negotiation
    }
}`,
        },
      ],
      relatedCodes: ['415', '300'],
      provider: 'http',
    },
    '407': {
      code: '407',
      name: 'Proxy Authentication Required',
      description: `Getting a 407 Proxy Authentication Required means the proxy server needs authentication before forwarding your request—similar to 401 but for proxy-level authentication. This client-side error (4xx) happens when corporate proxies, VPN gateways, or network proxies require credentials. Most common in enterprise networks with authenticated proxies, but also appears when proxy credentials expire, Proxy-Authorization headers are missing, or proxy configuration is incorrect.`,
      metaDescription: 'Fix 407 Proxy Authentication Required by configuring Proxy-Authorization headers, setting up proxy credentials, and implementing proper proxy authentication in enterprise networks.',
      causes: [
        `Frontend: Missing Proxy-Authorization header. Proxy credentials expired or invalid. Browser proxy settings not configured. Client doesn't support proxy authentication. Proxy-Authorization format incorrect.`,
        `Backend: Proxy server requires authentication. Proxy credentials validation fails. Proxy authentication middleware rejects credentials. Proxy session expired.`,
        `Infrastructure: Corporate proxy enforces authentication. VPN gateway requires proxy auth. Network proxy configuration requires credentials. Load balancer proxy authentication.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—look for Proxy-Authorization header. Verify proxy settings in browser/OS. Check if proxy credentials are configured.`,
        `Step 2: Diagnose - Proxy logs show authentication failures. Review proxy server configuration. Check proxy authentication requirements. Verify credentials are valid.`,
        `Step 3: Fix - Client-side: Configure proxy credentials in browser/OS. Add Proxy-Authorization header with Basic auth. Update expired proxy credentials. Use proxy authentication libraries.`,
        `Step 4: Fix - Server-side: Return 407 with Proxy-Authenticate header. Implement proxy authentication logic. Validate Proxy-Authorization credentials. Handle proxy auth sessions.`,
        `Step 5: Fix - Infrastructure: Configure proxy authentication properly. Update proxy credentials in environment. Review network proxy settings. Ensure proxy auth headers pass through.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 407 Proxy Authentication',
          code: `// Client-side: Handle 407 by adding Proxy-Authorization header
// Note: Browser Fetch API doesn't directly support proxy auth
// This is more relevant for Node.js environments

// Node.js example with proxy authentication
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

async function fetchWithProxyAuth(url, proxyUrl, username, password) {
  const proxyAuth = Buffer.from(\`\${username}:\${password}\`).toString('base64');
const agent = new HttpsProxyAgent(proxyUrl);

  const response = await fetch(url, {
  agent: agent,
  headers: {
      'Proxy-Authorization': \`Basic \${proxyAuth}\`,
    },
  });
  
  if (response.status === 407) {
    // Proxy authentication failed
    const proxyAuthenticate = response.headers.get('Proxy-Authenticate');
    throw new Error(\`Proxy authentication failed. Required: \${proxyAuthenticate}\`);
  }
  
  return response.json();
}

// Browser: Configure proxy in OS/browser settings
// For programmatic access, use environment variables or proxy configuration files`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Proxy Authentication (as Proxy Server)',
          code: `// Server-side: Act as proxy requiring authentication
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Proxy authentication middleware
const requireProxyAuth = (req, res, next) => {
  const proxyAuth = req.headers['proxy-authorization'];
  
  if (!proxyAuth) {
    return res.status(407)
      .set('Proxy-Authenticate', 'Basic realm="Proxy"')
      .json({
        error: 'Proxy Authentication Required',
        message: 'Proxy server requires authentication',
      });
  }
  
  // Validate proxy credentials
  const authString = proxyAuth.replace('Basic ', '');
  const credentials = Buffer.from(authString, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  
  // Validate against proxy user database
  if (!validateProxyCredentials(username, password)) {
    return res.status(407)
      .set('Proxy-Authenticate', 'Basic realm="Proxy"')
      .json({
        error: 'Proxy Authentication Required',
        message: 'Invalid proxy credentials',
      });
  }
  
  req.proxyUser = username;
  next();
};

// Proxy middleware with authentication
app.use('/proxy', requireProxyAuth, createProxyMiddleware({
  target: 'http://target-server:3000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Forward original request with proxy auth
    if (req.headers['proxy-authorization']) {
      proxyReq.setHeader('X-Proxy-User', req.proxyUser);
    }
  },
}));`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Proxy Authentication',
          code: `# Nginx: Configure as authenticated proxy
server {
    listen 8080;
    server_name proxy.example.com;
    
    # Require proxy authentication
    location / {
        # Check Proxy-Authorization header
        if (\$http_proxy_authorization = "") {
            return 407 '{"error":"Proxy Authentication Required"}';
            add_header Proxy-Authenticate 'Basic realm="Proxy"' always;
        }
        
        # Validate credentials (simplified - use auth_basic for real auth)
        # auth_basic "Proxy Authentication Required";
        # auth_basic_user_file /etc/nginx/.htpasswd;
        
        # Forward to upstream
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Proxy-User \$remote_user;
    }
}

# Or: Nginx as client using authenticated proxy
# http {
#     proxy_http_version 1.1;
#     proxy_set_header Proxy-Authorization "Basic <base64-encoded-credentials>";
# }`,
        },
      ],
      relatedCodes: ['401', '408'],
      provider: 'http',
    },
    '418': {
      code: '418',
      name: "I'm a Teapot",
      description: `Hitting a 418 I'm a Teapot is a joke status code from RFC 2324 (Hyper Text Coffee Pot Control Protocol)—the server is humorously refusing to brew coffee because it identifies as a teapot. This client-side error (4xx) is intentionally whimsical and often used for testing, Easter eggs, or API humor. Most common when accessing joke endpoints or test routes, but also appears when developers implement RFC 2324 compliance, April Fools' pranks, or intentional API easter eggs.`,
      metaDescription: "Handle 418 I'm a Teapot by recognizing it's a joke status code from RFC 2324, using correct endpoints, and implementing proper error handling for test/humor routes.",
      causes: [
        `Frontend: Accessing joke/test endpoint. Hitting intentional easter egg route. Using wrong endpoint URL. April Fools' implementation. Testing error handling.`,
        `Backend: Developer implemented 418 for humor. Test endpoint returns 418. RFC 2324 compliance demonstration. Easter egg feature. Intentional API joke.`,
        `Infrastructure: Test environment returns 418. Staging server has joke endpoints. API gateway configured with easter eggs.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify the endpoint URL. Review if this is a known test/joke endpoint. Check API documentation for correct endpoints.`,
        `Step 2: Diagnose - Server logs show 418 responses. Review if this is intentional. Check endpoint configuration. Verify if test environment.`,
        `Step 3: Fix - Client-side: Use correct endpoint URL. Avoid joke/test endpoints in production. Handle 418 gracefully with humor. Update API client configuration.`,
        `Step 4: Fix - Server-side: Remove 418 from production endpoints. Keep only in test/staging. Document joke endpoints clearly. Implement proper error handling.`,
        `Step 5: Fix - Infrastructure: Review API gateway routes. Remove joke endpoints from production. Keep test endpoints separate.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 418 Teapot Error',
          code: `// Client-side: Handle 418 with humor (usually test/joke endpoint)
async function brewCoffee(coffeeType) {
  const response = await fetch('/api/coffee/brew', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: coffeeType, strength: 'strong' }),
  });
  
  if (response.status === 418) {
    // Server is a teapot - handle with humor
    const errorData = await response.json().catch(() => ({}));
    console.log('☕ Server is a teapot - cannot brew coffee!');
    
    showUserMessage({
      type: 'info',
      title: "I'm a Teapot",
      message: 'This is a joke endpoint from RFC 2324. The server cannot brew coffee because it is a teapot.',
      note: errorData.note || 'This endpoint is for testing/humor purposes only',
    });
    
    return { 
      message: "I'm a teapot",
      note: 'This endpoint is for testing purposes only',
      rfc: 'RFC 2324',
    };
  }
  
  return response.json();
}

// Graceful handling in production
async function handleTeapotError(response) {
  if (response.status === 418) {
    // Log for monitoring but don't break the app
    console.warn('418 Teapot error - likely test endpoint');
    return { error: 'Test endpoint accessed', status: 418 };
  }
  return response;
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Implement 418 Teapot Endpoint',
          code: `// Server-side: Implement 418 for humor/testing (RFC 2324)
const express = require('express');
const app = express();

// Joke endpoint - RFC 2324 Hyper Text Coffee Pot Control Protocol
app.post('/api/coffee/brew', (req, res) => {
  // Return 418 I'm a Teapot
  res.status(418)
    .set('X-RFC', '2324')
    .json({
      error: "I'm a Teapot",
      message: 'The server refuses to brew coffee because it is a teapot.',
      rfc: 'RFC 2324 - Hyper Text Coffee Pot Control Protocol',
      note: 'This is a joke status code. Use the correct endpoint for actual functionality.',
      correctEndpoint: '/api/beverages/brew',
    });
});

// Test endpoint for error handling
app.get('/api/test/teapot', (req, res) => {
  res.status(418).json({
    error: "I'm a Teapot",
    message: 'Test endpoint for error handling',
    purpose: 'testing',
  });
});

// Production: Remove or disable 418 endpoints
if (process.env.NODE_ENV === 'production') {
  // Remove joke endpoints in production
  // Or return 404 instead
}`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Custom 418 Response',
          code: `# Nginx: Custom 418 response (for testing/humor)
server {
    listen 80;
    server_name api.example.com;
    
    # Joke endpoint - return 418
    location /api/coffee/brew {
        return 418 '{"error":"I\\'m a Teapot","message":"The server refuses to brew coffee because it is a teapot.","rfc":"2324"}';
        default_type application/json;
        add_header X-RFC "2324" always;
    }
    
    # Or proxy to backend that returns 418
    location /api/test/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
    }
}`,
        },
      ],
      relatedCodes: ['400', '501'],
      provider: 'http',
    },
    '421': {
      code: '421',
      name: 'Misdirected Request',
      description: `Getting a 421 Misdirected Request means the request reached a server that can't handle it for the given scheme and authority—HTTP/2 requests hitting a server configured for different virtual hosts, or requests sent to the wrong server instance. This client-side error (4xx) happens when servers reject requests they're not configured to handle. Most common in HTTP/2 environments where requests are misrouted, but also appears when virtual host configurations don't match, load balancers route incorrectly, or DNS points to wrong servers.`,
      metaDescription: 'Fix 421 Misdirected Request by using correct server endpoints, configuring virtual hosts properly, and handling HTTP/2 authority routing correctly.',
      causes: [
        `Frontend: Request sent to wrong server instance. HTTP/2 connection reused for wrong authority. Client connects to misconfigured server. DNS resolution points to wrong server.`,
        `Backend: Server not configured for request's scheme/authority. Virtual host mismatch. HTTP/2 server can't handle authority. Server configuration error.`,
        `Infrastructure: Load balancer routes to wrong backend. HTTP/2 connection reuse issues. Virtual host misconfiguration. DNS points to incorrect server.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—verify request URL and host. Review if HTTP/2 connection is reused incorrectly. Check DNS resolution. Verify server hostname.`,
        `Step 2: Diagnose - Server logs show misdirected requests. Review virtual host configuration. Check load balancer routing rules. Verify HTTP/2 connection handling.`,
        `Step 3: Fix - Client-side: Use correct server endpoint. Close and reopen HTTP/2 connections if needed. Verify DNS resolution. Update API endpoint configuration.`,
        `Step 4: Fix - Server-side: Configure virtual hosts correctly. Handle HTTP/2 authority properly. Return 421 with correct server information. Update server configuration.`,
        `Step 5: Fix - Infrastructure: Fix load balancer routing. Configure HTTP/2 connection handling. Update DNS records. Review virtual host settings.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 421 Misdirected Request',
          code: `// Client-side: Handle 421 by retrying with correct endpoint
async function fetchWithRetry(url) {
  let response = await fetch(url);
  
  if (response.status === 421) {
    console.warn('Request misdirected - server cannot handle this authority');
    
    // Extract alternative URL from response headers
    const altUrl = response.headers.get('Location') || 
                   response.headers.get('X-Alternative-Url') ||
                   response.headers.get('X-Correct-Server');
    
    if (altUrl) {
      console.log(\`Retrying with correct server: \${altUrl}\`);
      response = await fetch(altUrl);
    } else {
      // Try with different scheme or reconstruct URL
      const urlObj = new URL(url);
      
      // Try HTTPS if HTTP was used
      if (urlObj.protocol === 'http:') {
        urlObj.protocol = 'https:';
        response = await fetch(urlObj.toString());
      } else {
        // Try different hostname (if known)
        throw new Error('Request misdirected and no alternative server provided');
      }
    }
  }
  
  return response.json();
}

// For HTTP/2, close connection and retry
async function fetchWithHTTP2Handling(url) {
  try {
    const response = await fetch(url);
    
    if (response.status === 421) {
      // HTTP/2 connection issue - may need to close connection
      console.warn('HTTP/2 connection misdirected');
      // Browser will handle connection reuse, but log for debugging
    }
    
    return response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Handle Misdirected Requests',
          code: `// Server-side: Return 421 for misdirected requests
const express = require('express');
const app = express();

// Virtual host configuration
const virtualHosts = {
  'api.example.com': app,
  'api-staging.example.com': require('./staging-app'),
};

// Middleware to check virtual host
app.use((req, res, next) => {
  const host = req.get('host');
  const expectedHost = process.env.API_HOST || 'api.example.com';
  
  // Check if request is for this server
  if (host !== expectedHost && !host.includes('localhost')) {
    return res.status(421)
      .set('X-Correct-Server', \`https://\${expectedHost}\${req.originalUrl}\`)
      .json({
        error: 'Misdirected Request',
        message: \`This server cannot handle requests for \${host}\`,
        correctServer: expectedHost,
        requestedHost: host,
      });
  }
  
  next();
});

// HTTP/2 authority check (if using HTTP/2)
app.use((req, res, next) => {
  const authority = req.headers[':authority'] || req.get('host');
  const scheme = req.protocol;
  
  // Check if server is configured for this authority/scheme combination
  if (!isConfiguredForAuthority(authority, scheme)) {
    return res.status(421).json({
      error: 'Misdirected Request',
      message: 'Server not configured for this authority',
      authority: authority,
      scheme: scheme,
    });
  }
  
  next();
});

function isConfiguredForAuthority(authority, scheme) {
  // Check server configuration
  const configuredAuthorities = ['api.example.com', 'api-staging.example.com'];
  return configuredAuthorities.includes(authority);
}`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Virtual Host Configuration',
          code: `# Nginx: Configure virtual hosts to prevent 421
server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    
    # Handle requests for this virtual host
    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}

# Catch-all server for misdirected requests
server {
    listen 443 ssl http2 default_server;
    server_name _;
    
    # Return 421 for requests to wrong virtual host
    return 421 '{"error":"Misdirected Request","message":"This server cannot handle requests for this hostname"}';
    default_type application/json;
}

# Or redirect to correct server
# server {
#     listen 443 ssl http2;
#     server_name wrong-host.example.com;
#     return 301 https://api.example.com\$request_uri;
# }`,
        },
      ],
      relatedCodes: ['400', '502'],
      provider: 'http',
    },
    '423': {
      code: '423',
      name: 'Locked',
      description: `Hitting a 423 Locked means the resource is currently locked by another process or user—a file is in use, a database record has an active lock, or concurrent access is blocked. This client-side error (4xx) happens when servers enforce resource locking to prevent conflicts. Most common in WebDAV operations or file systems, but also appears when database transactions lock records, concurrent edits are prevented, or distributed locks are active.`,
      metaDescription: 'Fix 423 Locked by respecting Retry-After headers, implementing proper resource locking with timeouts, and using exponential backoff for retries.',
      causes: [
        `Frontend: Multiple users editing same resource simultaneously. File upload in progress locks resource. Long-running operation holds lock. Previous operation didn't release lock.`,
        `Backend: WebDAV lock mechanism active. Database row-level locking. File system lock on file. Distributed lock (Redis, etc.) not released. Transaction holds lock too long.`,
        `Infrastructure: File server locks files during access. Database connection holds locks. Distributed locking service (Redis, etc.) maintains locks.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response headers—look for Retry-After header. Review Lock-Token header if present. Check if resource is locked by current user.`,
        `Step 2: Diagnose - Server logs show which resource is locked and by whom. Review lock expiration times. Check if locks are being released properly. Verify distributed lock status.`,
        `Step 3: Fix - Client-side: Wait for Retry-After duration before retrying. Implement exponential backoff for retries. Check Lock-Token and release if holding. Show user-friendly "resource in use" message.`,
        `Step 4: Fix - Server-side: Return 423 with Retry-After header. Implement lock timeout mechanisms. Release locks on operation completion. Add lock status endpoints.`,
        `Step 5: Fix - Infrastructure: Configure lock timeouts. Review distributed lock expiration. Ensure locks are released on errors. Monitor lock contention.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 423 with Retry-After',
          code: `// Client-side: Handle 423 by respecting Retry-After header
async function updateResourceWithLockHandling(id, data, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(\`/api/resources/\${id}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'If-Match': '*',
      },
      body: JSON.stringify(data),
    });
    
    if (response.status === 423) {
      if (attempt < maxRetries - 1) {
        // Resource locked - check Retry-After header
        const retryAfter = parseInt(response.headers.get('Retry-After') || '0');
        const lockToken = response.headers.get('Lock-Token');
        
        const delay = retryAfter > 0 
          ? retryAfter * 1000 
          : Math.pow(2, attempt) * 1000; // Exponential backoff fallback
        
        console.log(\`Resource locked, retrying in \${Math.ceil(delay / 1000)} seconds...\`);
        
        // Show user-friendly message
        showUserMessage({
          type: 'info',
          message: 'Resource is currently being edited by another user. Please wait...',
          duration: delay,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        throw new Error('Resource remains locked after maximum retries');
      }
    }
    
    return response.json();
  }
}

// Check lock status before attempting update
async function checkLockStatus(id) {
  const response = await fetch(\`/api/resources/\${id}/lock\`, {
    method: 'HEAD',
  });
  
  if (response.status === 423) {
    const retryAfter = response.headers.get('Retry-After');
    return {
      locked: true,
      retryAfter: retryAfter ? parseInt(retryAfter) : null,
      lockToken: response.headers.get('Lock-Token'),
    };
  }
  
  return { locked: false };
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Resource Locking with Timeout',
          code: `// Server-side: Implement resource locking
const express = require('express');
const Redis = require('ioredis');
const app = express();

const redis = new Redis();
const LOCK_TIMEOUT = 300; // 5 minutes

// Lock resource
async function lockResource(resourceId, userId, timeout = LOCK_TIMEOUT) {
  const lockKey = \`lock:resource:\${resourceId}\`;
  const lockValue = \`\${userId}:\${Date.now()}\`;
  
  // Try to acquire lock
  const result = await redis.set(lockKey, lockValue, 'EX', timeout, 'NX');
  return result === 'OK';
}

// Release lock
async function releaseLock(resourceId, userId) {
  const lockKey = \`lock:resource:\${resourceId}\`;
  const lockValue = await redis.get(lockKey);
  
  if (lockValue && lockValue.startsWith(\`\${userId}:\`)) {
    await redis.del(lockKey);
    return true;
  }
  
  return false;
}

// Check lock status
async function getLockStatus(resourceId) {
  const lockKey = \`lock:resource:\${resourceId}\`;
  const lockValue = await redis.get(lockKey);
  
  if (lockValue) {
    const [userId, timestamp] = lockValue.split(':');
    const age = Date.now() - parseInt(timestamp);
    const ttl = await redis.ttl(lockKey);
    
    return {
      locked: true,
      userId: userId,
      age: age,
      ttl: ttl,
    };
  }
  
  return { locked: false };
}

// Update endpoint with locking
app.put('/api/resources/:id', async (req, res) => {
  const resourceId = req.params.id;
  const userId = req.user.id;
  
  // Try to acquire lock
  const locked = await lockResource(resourceId, userId);
  
  if (!locked) {
    const lockStatus = await getLockStatus(resourceId);
    const retryAfter = lockStatus.ttl || 60;
    
    return res.status(423)
      .set('Retry-After', retryAfter.toString())
      .set('Lock-Token', \`resource-\${resourceId}\`)
      .json({
        error: 'Locked',
        message: 'Resource is currently locked by another user',
        retryAfter: retryAfter,
        lockStatus: lockStatus,
      });
  }
  
  try {
    // Perform update
    const updated = await db.resources.update(resourceId, req.body);
    
    // Release lock after update
    await releaseLock(resourceId, userId);
    
    res.json(updated);
  } catch (error) {
    // Release lock on error
    await releaseLock(resourceId, userId);
    throw error;
  }
});

// Lock status endpoint
app.head('/api/resources/:id/lock', async (req, res) => {
  const lockStatus = await getLockStatus(req.params.id);
  
  if (lockStatus.locked) {
    res.status(423)
      .set('Retry-After', lockStatus.ttl.toString())
      .set('Lock-Token', \`resource-\${req.params.id}\`)
      .send();
  } else {
    res.status(200).send();
  }
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Lock Headers',
          code: `# Nginx: Pass lock-related headers
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass lock-related headers
        proxy_set_header Lock-Token \$http_lock_token;
        proxy_set_header Timeout \$http_timeout;
        
        # Pass Retry-After to client
        proxy_pass_header Retry-After;
    }
}`,
        },
      ],
      relatedCodes: ['409', '428'],
      provider: 'http',
    },
    '424': {
      code: '424',
      name: 'Failed Dependency',
      description: `Getting a 424 Failed Dependency means the operation failed because a required dependency operation failed—creating an order item when the order doesn't exist, or a nested operation in a batch request failed. This client-side error (4xx) is common in WebDAV but also appears in REST APIs with dependencies. Most common when creating nested resources where the parent fails, but also appears when batch operations have partial failures, transaction dependencies fail, or prerequisite operations don't complete.`,
      metaDescription: 'Fix 424 Failed Dependency by ensuring parent resources exist, validating dependencies before operations, and implementing proper error handling for nested resource creation.',
      causes: [
        `Frontend: Creating child resource when parent doesn't exist. Batch operation includes failed dependencies. Nested resource creation fails. Transaction dependencies not met.`,
        `Backend: WebDAV operation dependency fails. Database foreign key constraint fails. Transaction rollback due to dependency failure. Nested operation validation fails.`,
        `Infrastructure: Distributed transaction coordinator fails. Microservice dependency unavailable. External API dependency fails. Database replication lag causes dependency issues.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—424 responses usually include which dependency failed. Review error details for failed operation. Check parent resource status.`,
        `Step 2: Diagnose - Server logs show which dependency operation failed. Review transaction logs. Check foreign key constraints. Examine batch operation results.`,
        `Step 3: Fix - Client-side: Ensure parent resources exist before creating children. Handle dependency failures gracefully. Retry failed dependencies first. Implement proper error handling.`,
        `Step 4: Fix - Server-side: Return 424 with details about failed dependency. Implement proper transaction handling. Validate dependencies before operations. Add dependency status checks.`,
        `Step 5: Fix - Infrastructure: Ensure dependency services are available. Review distributed transaction configuration. Check database replication status. Monitor microservice dependencies.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 424 Failed Dependency',
          code: `// Client-side: Handle 424 by fixing dependencies first
async function createOrderWithItems(orderData, items) {
  try {
    // First, ensure order exists (main dependency)
    const orderResponse = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    if (!orderResponse.ok) {
      throw new Error(\`Failed to create order: \${orderResponse.status}\`);
    }
    
    const order = await orderResponse.json();
    
    // Then add items (depends on order existing)
    const itemResults = [];
    for (const item of items) {
      const itemResponse = await fetch(\`/api/orders/\${order.id}/items\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      
      if (itemResponse.status === 424) {
        // Dependency failed - order might have been deleted
        const errorData = await itemResponse.json();
        throw new Error(\`Dependency failed: \${errorData.message || 'Order may have been deleted'}\`);
      }
      
      if (!itemResponse.ok) {
        // Rollback order if items fail
        await fetch(\`/api/orders/\${order.id}\`, { method: 'DELETE' });
        throw new Error(\`Failed to add item: \${itemResponse.status}\`);
      }
      
      itemResults.push(await itemResponse.json());
    }
    
    return { order, items: itemResults };
  } catch (error) {
    console.error('Failed dependency:', error);
    showUserMessage({
      type: 'error',
      title: 'Operation Failed',
      message: 'Failed to complete operation due to dependency error. Please try again.',
    });
    throw error;
  }
}

// Check dependencies before operation
async function checkDependencies(orderId) {
  const orderResponse = await fetch(\`/api/orders/\${orderId}\`);
  
  if (!orderResponse.ok) {
    throw new Error('Order dependency not found');
  }
  
  return orderResponse.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Dependency Validation',
          code: `// Server-side: Return 424 for failed dependencies
const express = require('express');
const app = express();

// Create order item (depends on order existing)
app.post('/api/orders/:orderId/items', async (req, res) => {
  const orderId = req.params.orderId;
  
  // Check if order exists (dependency)
  const order = await db.orders.findById(orderId);
  
  if (!order) {
    return res.status(424).json({
      error: 'Failed Dependency',
      message: 'Cannot create item: order does not exist',
      dependency: 'order',
      dependencyId: orderId,
    });
  }
  
  // Check if order is in valid state
  if (order.status === 'cancelled' || order.status === 'completed') {
    return res.status(424).json({
      error: 'Failed Dependency',
      message: \`Cannot add items to \${order.status} order\`,
      dependency: 'order',
      dependencyStatus: order.status,
    });
  }
  
  try {
    // Create item
    const item = await db.orderItems.create({
      orderId: orderId,
      ...req.body,
    });
    
    res.status(201).json(item);
  } catch (error) {
    // Check if it's a foreign key constraint failure
    if (error.code === '23503') { // PostgreSQL foreign key violation
      return res.status(424).json({
        error: 'Failed Dependency',
        message: 'Dependency constraint failed',
        dependency: 'order',
      });
    }
    throw error;
  }
});

// Batch operation with dependency tracking
app.post('/api/orders/:orderId/items/batch', async (req, res) => {
  const orderId = req.params.orderId;
  const items = req.body.items;
  
  // Verify order exists first
  const order = await db.orders.findById(orderId);
  if (!order) {
    return res.status(424).json({
      error: 'Failed Dependency',
      message: 'Order does not exist',
    });
  }
  
  const results = [];
  const errors = [];
  
  for (const itemData of items) {
    try {
      const item = await db.orderItems.create({
        orderId: orderId,
        ...itemData,
      });
      results.push(item);
    } catch (error) {
      errors.push({
        item: itemData,
        error: error.message,
      });
      
      // If dependency fails, return 424
      if (error.code === '23503') {
        return res.status(424).json({
          error: 'Failed Dependency',
          message: 'One or more items failed due to dependency error',
          results: results,
          errors: errors,
        });
      }
    }
  }
  
  res.json({ results, errors });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Dependency Headers',
          code: `# Nginx: Pass dependency-related headers
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Backend handles dependency validation
        # Nginx just passes requests through
    }
}`,
        },
      ],
      relatedCodes: ['409', '500'],
      provider: 'http',
    },
    '425': {
      code: '425',
      name: 'Too Early',
      description: `Hitting a 425 Too Early means the server rejected your request because it might be a replay attack—the request arrived too early in a timing window, or replay protection detected a potential duplicate. This client-side error (4xx) is used in HTTP/2 Server Push and HTTP/3 to prevent replay attacks. Most common when requests are sent too quickly after a previous request, but also appears when timing windows are violated, nonces are reused, or replay protection mechanisms trigger.`,
      metaDescription: 'Fix 425 Too Early by adding timestamps and nonces to requests, respecting Retry-After headers, and implementing proper replay attack prevention mechanisms.',
      causes: [
        `Frontend: Request sent too early after previous request. Missing or invalid timestamp in request. Nonce reused or missing. Request timing violates server window. Rapid retries trigger replay protection.`,
        `Backend: Replay attack prevention middleware detects early request. Timing window validation fails. Nonce validation rejects request. HTTP/2 push timing issue. Server replay protection active.`,
        `Infrastructure: Load balancer replay protection. API gateway timing validation. WAF replay attack detection. Network timing issues cause early arrival.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request timing—review request timestamps. Verify if requests are sent too quickly. Check Retry-After header. Review request timing patterns.`,
        `Step 2: Diagnose - Server logs show timing window violations. Review replay protection configuration. Check nonce validation. Examine timing window settings.`,
        `Step 3: Fix - Client-side: Wait for Retry-After duration before retrying. Add proper timestamps to requests. Generate unique nonces for each request. Implement proper request timing.`,
        `Step 4: Fix - Server-side: Return 425 with Retry-After header. Configure appropriate timing windows. Implement nonce validation. Add replay protection logging.`,
        `Step 5: Fix - Infrastructure: Review load balancer timing settings. Configure API gateway replay protection. Adjust WAF timing rules. Monitor network latency.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 425 with Timing and Nonces',
          code: `// Client-side: Handle 425 by adding timing information
async function sendRequestWithTiming(data) {
  const timestamp = Date.now();
  const nonce = crypto.randomUUID(); // Generate unique nonce for each request
  
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Timestamp': timestamp.toString(),
      'X-Request-Nonce': nonce,
    },
    body: JSON.stringify(data),
  });
  
  if (response.status === 425) {
    // Request too early - wait for Retry-After
    const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
    console.log(\`Request too early, waiting \${retryAfter} seconds...\`);
    
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    
    // Retry with updated timestamp and new nonce
    return sendRequestWithTiming(data);
  }
  
  return response.json();
}

// Prevent rapid retries that trigger 425
class RequestThrottler {
  constructor(minDelay = 1000) {
    this.minDelay = minDelay;
    this.lastRequestTime = 0;
  }
  
  async throttle(fn) {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, this.minDelay - timeSinceLastRequest);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    return fn();
  }
}

const throttler = new RequestThrottler(1000); // 1 second minimum between requests
await throttler.throttle(() => sendRequestWithTiming(data));`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Replay Attack Prevention',
          code: `// Server-side: Implement replay attack prevention
const express = require('express');
const crypto = require('crypto');
const app = express();

// Store used nonces (in production, use Redis)
const usedNonces = new Set();
const NONCE_TTL = 5 * 60 * 1000; // 5 minutes

// Clean up old nonces periodically
setInterval(() => {
  // In production, use Redis TTL instead
  usedNonces.clear(); // Simplified - should track timestamps
}, NONCE_TTL);

// Replay protection middleware
const preventReplay = (req, res, next) => {
  const timestamp = parseInt(req.headers['x-request-timestamp'] || '0');
  const nonce = req.headers['x-request-nonce'];
  const now = Date.now();
  
  // Check if nonce is provided
  if (!nonce) {
    return res.status(425)
      .set('Retry-After', '1')
      .json({
        error: 'Too Early',
        message: 'Request must include X-Request-Nonce header',
      });
  }
  
  // Check if nonce was already used (replay attack)
  if (usedNonces.has(nonce)) {
    return res.status(425)
      .set('Retry-After', '60')
      .json({
        error: 'Too Early',
        message: 'Request replay detected',
      });
  }
  
  // Check if request is too early (within timing window)
  const timeDiff = now - timestamp;
  const TIMING_WINDOW = 5000; // 5 seconds
  
  if (timeDiff < 0 || timeDiff > TIMING_WINDOW) {
    return res.status(425)
      .set('Retry-After', '1')
      .json({
        error: 'Too Early',
        message: 'Request timing window violation',
        timingWindow: TIMING_WINDOW,
        timeDiff: timeDiff,
      });
  }
  
  // Mark nonce as used
  usedNonces.add(nonce);
  
  // Clean up nonce after TTL
  setTimeout(() => {
    usedNonces.delete(nonce);
  }, NONCE_TTL);
  
  next();
};

// Apply to sensitive endpoints
app.post('/api/payment', preventReplay, express.json(), (req, res) => {
  // Process payment with replay protection
  res.json({ success: true });
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Pass Timing Headers',
          code: `# Nginx: Pass timing headers to backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Pass timing headers to backend
        proxy_set_header X-Request-Timestamp \$http_x_request_timestamp;
        proxy_set_header X-Request-Nonce \$http_x_request_nonce;
        
        # Backend handles replay protection
    }
}`,
        },
      ],
      relatedCodes: ['408', '429'],
      provider: 'http',
    },
    '431': {
      code: '431',
      name: 'Request Header Fields Too Large',
      description: `Getting a 431 Request Header Fields Too Large means your request headers exceeded the server's size limit—too many cookies, large custom headers, or cumulative header size is too big. This client-side error (4xx) happens when servers enforce header size limits (typically 8-16KB) to prevent buffer overflows. Most common when Cookie headers accumulate and grow large, but also appears when custom headers contain too much data, multiple authentication tokens are sent, or debug headers add excessive size.`,
      metaDescription: 'Fix 431 Request Header Fields Too Large by optimizing cookie headers, removing unnecessary headers, and increasing Nginx large_client_header_buffers configuration.',
      causes: [
        `Frontend: Cookie header too large (many cookies accumulated). Custom headers contain large data. Multiple Authorization headers. Debug headers add size. Headers exceed browser/server limits.`,
        `Backend: Server header size limit too restrictive. Header validation rejects large headers. Buffer size configuration too small. Server doesn't support large headers.`,
        `Infrastructure: Nginx/Apache header buffer limits. Load balancer header size restrictions. API gateway enforces header limits. WAF blocks large headers.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Request Headers—calculate total header size. Review Cookie header size. Count number of headers. Check custom header sizes.`,
        `Step 2: Diagnose - Server logs show header size exceeded. Review server header buffer configuration. Check Nginx/Apache limits. Verify infrastructure header limits.`,
        `Step 3: Fix - Client-side: Remove unnecessary cookies. Split large cookies. Compress or remove custom headers. Delete debug headers. Reduce header count.`,
        `Step 4: Fix - Server-side: Increase server header buffer size. Configure appropriate header limits. Return 431 with size information. Add header size monitoring.`,
        `Step 5: Fix - Infrastructure: Increase Nginx large_client_header_buffers. Configure Apache LimitRequestFieldSize. Update load balancer header limits. Review WAF header size rules.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Optimize Headers to Prevent 431',
          code: `// Client-side: Optimize headers to prevent 431
function optimizeHeaders(headers) {
  const optimized = { ...headers };
  let totalSize = 0;
  
  // Calculate current header size
  Object.entries(headers).forEach(([key, value]) => {
    totalSize += key.length + (value?.toString().length || 0) + 4; // +4 for ": " and "\\r\\n"
  });
  
  // Typical limit is 8-16KB
  const MAX_HEADER_SIZE = 8000;
  
  if (totalSize > MAX_HEADER_SIZE) {
    console.warn(\`Headers too large (\${totalSize} bytes), optimizing...\`);
    
    // Remove debug headers first
    delete optimized['X-Debug-Info'];
    delete optimized['X-Trace-Id'];
    delete optimized['X-Request-Id'];
    delete optimized['X-Request-Start-Time'];
    
    // Optimize cookie header (often the culprit)
    if (optimized['Cookie']) {
      const cookies = optimized['Cookie'].split('; ');
      // Keep only essential cookies (first 10)
      optimized['Cookie'] = cookies.slice(0, 10).join('; ');
    }
    
    // Remove or compress large custom headers
    if (optimized['X-Custom-Data']) {
      // Remove large custom data or compress it
      delete optimized['X-Custom-Data'];
    }
    
    // Remove duplicate headers
    const seen = new Set();
    Object.keys(optimized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (seen.has(lowerKey)) {
        delete optimized[key];
      } else {
        seen.add(lowerKey);
      }
    });
  }
  
  return optimized;
}

// Usage with automatic optimization
async function fetchWithOptimizedHeaders(url, options = {}) {
  const optimizedHeaders = optimizeHeaders(options.headers || {});
  
  const response = await fetch(url, {
    ...options,
    headers: optimizedHeaders,
  });
  
  if (response.status === 431) {
    // Headers still too large - try with minimal headers
    const minimalHeaders = {
      'Authorization': optimizedHeaders['Authorization'],
      'Content-Type': optimizedHeaders['Content-Type'],
    };
    
    return fetch(url, {
      ...options,
      headers: minimalHeaders,
    });
  }
  
  return response;
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Configure Header Size Limits',
          code: `// Server-side: Configure header size limits
const express = require('express');
const app = express();

// Middleware to check header size
const checkHeaderSize = (req, res, next) => {
  let totalSize = 0;
  
  // Calculate total header size
  Object.entries(req.headers).forEach(([key, value]) => {
    totalSize += key.length + (Array.isArray(value) 
      ? value.join(', ').length 
      : value.toString().length) + 4;
  });
  
  const MAX_HEADER_SIZE = 8192; // 8KB default
  
  if (totalSize > MAX_HEADER_SIZE) {
    return res.status(431)
      .json({
        error: 'Request Header Fields Too Large',
        message: \`Total header size (\${totalSize} bytes) exceeds limit (\${MAX_HEADER_SIZE} bytes)\`,
        maxSize: MAX_HEADER_SIZE,
        actualSize: totalSize,
        suggestion: 'Reduce cookie count or custom header sizes',
      });
  }
  
  next();
};

app.use(checkHeaderSize);

// Or use express built-in limit (if available)
// app.use(express.json({ limit: '10mb' }));
// Note: Express doesn't directly limit header size, use middleware above

// Log large headers for monitoring
app.use((req, res, next) => {
  const headerSize = JSON.stringify(req.headers).length;
  if (headerSize > 4000) {
    console.warn(\`Large headers detected: \${headerSize} bytes from \${req.ip}\`);
  }
  next();
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Increase Header Buffer Sizes',
          code: `# Nginx: Configure header buffer sizes to prevent 431
http {
    # Increase header buffer sizes
    client_header_buffer_size 4k;
    large_client_header_buffers 8 32k;  # 8 buffers of 32KB each
    
    server {
        listen 80;
        server_name api.example.com;
        
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            
            # Pass all headers (within buffer limits)
            proxy_pass_request_headers on;
        }
    }
}

# Or return 431 for oversized headers
# server {
#     # If headers exceed large_client_header_buffers, Nginx returns 431
#     # Custom error page
#     error_page 431 /431.html;
#     location = /431.html {
#         return 431 '{"error":"Request Header Fields Too Large","message":"Headers exceed server limit"}';
#         default_type application/json;
#     }
# }`,
        },
      ],
      relatedCodes: ['400', '414'],
      provider: 'http',
    },
    '451': {
      code: '451',
      name: 'Unavailable For Legal Reasons',
      description: `Hitting a 451 Unavailable For Legal Reasons means the server blocked access due to legal requirements—government censorship, DMCA takedown, geographic restrictions, or court orders. This client-side error (4xx) is a reference to Ray Bradbury's "Fahrenheit 451" and indicates legal compliance blocking. Most common when content is geo-blocked in certain regions, but also appears when DMCA takedowns remove content, government censorship blocks access, or legal compliance requires content removal.`,
      causes: [
        `Frontend: User in geo-blocked region tries to access content. Content removed due to legal order. Government censorship blocks access. DMCA takedown removes content.`,
        `Backend: Server enforces geographic restrictions. Legal compliance middleware blocks content. DMCA takedown system removes content. Government censorship filters active.`,
        `Infrastructure: CDN geo-blocking restricts regions. WAF enforces legal compliance rules. Load balancer routes based on legal restrictions. Content delivery network blocks regions.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—451 responses usually include legal restriction details. Review Link header for more information. Check if content is available in other regions.`,
        `Step 2: Diagnose - Server logs show which legal restriction triggered. Review geographic restriction configuration. Check DMCA takedown status. Examine legal compliance rules.`,
        `Step 3: Fix - Client-side: Show user-friendly message about legal restrictions. Display Link header information if available. Handle geo-blocking gracefully. Don't attempt to bypass legal restrictions.`,
        `Step 4: Fix - Server-side: Return 451 with Link header pointing to legal information. Implement proper geo-blocking logic. Handle DMCA takedowns correctly. Add legal compliance logging.`,
        `Step 5: Fix - Infrastructure: Configure CDN geo-blocking properly. Review WAF legal compliance rules. Ensure load balancer respects legal restrictions. Monitor legal compliance.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 451 Legal Restrictions',
          code: `// Client-side: Handle 451 with user-friendly messaging
async function fetchContent(contentId) {
  const response = await fetch(\`/api/content/\${contentId}\`);
  
  if (response.status === 451) {
    // Extract restriction information (RFC 7725)
    const link = response.headers.get('Link');
    const restrictionInfo = await response.json().catch(() => ({}));
    
    // Show user-friendly message
    showUserMessage({
      title: 'Content Unavailable',
      message: 'This content is not available in your region due to legal restrictions.',
      type: 'warning',
      action: link ? { 
        label: 'Learn More', 
        url: link 
      } : null,
      reference: 'RFC 7725 - 451 Unavailable For Legal Reasons',
    });
    
    console.warn('Content blocked for legal reasons:', restrictionInfo);
    return null;
  }
  
  return response.json();
}

// Check geographic restrictions
async function checkContentAvailability(contentId, region) {
  const response = await fetch(\`/api/content/\${contentId}/availability?region=\${region}\`);
  
  if (response.status === 451) {
    const { reason, blockedRegions } = await response.json();
    return {
      available: false,
      reason: reason,
      blockedRegions: blockedRegions,
    };
  }
  
  return { available: true };
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Implement Legal Restrictions',
          code: `// Server-side: Return 451 for legal restrictions
const express = require('express');
const app = express();

// Geographic restriction middleware
const checkGeographicRestriction = async (req, res, next) => {
  const contentId = req.params.id;
  const userRegion = req.headers['cf-ipcountry'] || // Cloudflare
                    req.headers['x-country-code'] ||
                    detectRegionFromIP(req.ip);
  
  // Check if content is blocked in user's region
  const content = await db.content.findById(contentId);
  const blockedRegions = content?.blockedRegions || [];
  
  if (blockedRegions.includes(userRegion)) {
    return res.status(451)
      .set('Link', '</legal/restrictions>; rel="blocked-by"')
      .json({
        error: 'Unavailable For Legal Reasons',
        message: 'This content is not available in your region due to legal restrictions',
        region: userRegion,
        blockedRegions: blockedRegions,
        reference: 'RFC 7725',
      });
  }
  
  next();
};

// DMCA takedown check
const checkDMCATakedown = async (req, res, next) => {
  const contentId = req.params.id;
  const takedown = await db.dmcaTakedowns.findActive(contentId);
  
  if (takedown) {
    return res.status(451)
      .set('Link', \`</dmca/\${takedown.id}>; rel="blocked-by"\`)
      .json({
        error: 'Unavailable For Legal Reasons',
        message: 'Content removed due to DMCA takedown notice',
        takedownId: takedown.id,
        reference: 'RFC 7725',
      });
  }
  
  next();
};

// Protected content endpoint
app.get('/api/content/:id', checkGeographicRestriction, checkDMCATakedown, async (req, res) => {
  const content = await db.content.findById(req.params.id);
  res.json(content);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Geo-Blocking Configuration',
          code: `# Nginx: Configure geographic restrictions
geo \$allowed_country {
    default 0;
    US 1;
    CA 1;
    GB 1;
    # Add allowed countries
}

map \$allowed_country \$block_reason {
    0 "Content not available in your region";
    default "";
}

server {
    listen 80;
    server_name api.example.com;
    
    location /api/content/ {
        # Check geographic restriction
        if (\$allowed_country = 0) {
            return 451 '{"error":"Unavailable For Legal Reasons","message":"Content not available in your region"}';
            add_header Link '</legal/restrictions>; rel="blocked-by"' always;
            default_type application/json;
        }
        
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Country-Code \$geoip_country_code;
    }
}

# Or use GeoIP module for more advanced blocking
# http {
#     geoip_country /usr/share/GeoIP/GeoIP.dat;
#     map \$geoip_country_code \$blocked {
#         default 0;
#         CN 1;  # Block China
#         RU 1;  # Block Russia
#     }
# }`,
        },
      ],
      metaDescription: 'Struggling with 451 Unavailable For Legal Reasons? Master geo-blocking, DMCA takedowns, and legal compliance with our expert troubleshooting guide for content restrictions.',
      relatedCodes: ['403', '410'],
      provider: 'http',
    },
    '506': {
      code: '506',
      name: 'Variant Also Negotiates',
      description: `Getting a 506 Variant Also Negotiates means the server has a configuration error where a variant resource is trying to negotiate its own content, creating a negotiation loop. This server-side error (5xx) indicates an internal server misconfiguration, not a client problem. Most common when content negotiation is misconfigured, but also appears when variant resources are set up incorrectly, negotiation loops occur, or server configuration conflicts create recursive negotiation.`,
      causes: [
        `Frontend: Client can't fix 506s directly—this is a server configuration issue. Requests trigger server's negotiation loop. Content negotiation headers may expose the issue.`,
        `Backend: Server content negotiation misconfigured. Variant resource tries to negotiate itself. Negotiation loop detected. Server configuration conflict. Content negotiation middleware error.`,
        `Infrastructure: Web server content negotiation misconfiguration. Reverse proxy negotiation conflicts. CDN variant handling errors.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—506 responses indicate server misconfiguration. Review Accept headers sent. Check if content negotiation is involved.`,
        `Step 2: Diagnose - Server logs show negotiation loop details. Review content negotiation configuration. Check variant resource setup. Examine server configuration files.`,
        `Step 3: Fix - Client-side: Simplify Accept headers to avoid triggering negotiation. Use specific content types. Retry with simpler headers.`,
        `Step 4: Fix - Server-side: Fix content negotiation configuration. Remove recursive variant negotiation. Configure variants properly. Test negotiation logic.`,
        `Step 5: Fix - Infrastructure: Review web server negotiation settings. Fix reverse proxy configuration. Update CDN variant handling.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 506 with Simplified Headers',
          code: `// Client-side: Handle 506 by simplifying content negotiation
async function fetchResourceWithFallback() {
  // Try with full content negotiation first
  let response = await fetch('/api/resource', {
    headers: {
      'Accept': 'application/json, application/xml;q=0.9',
      'Accept-Language': 'en-US, en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
    },
  });
  
  if (response.status === 506) {
    console.warn('Variant negotiation error - server misconfiguration detected');
    
    // Fallback to simpler Accept header (no variants)
    response = await fetch('/api/resource', {
      headers: {
        'Accept': 'application/json', // Single format, no negotiation
      },
    });
    
    if (response.status === 506) {
      // Last resort - accept anything (no negotiation)
      response = await fetch('/api/resource', {
        headers: {
          'Accept': '*/*',
        },
      });
    }
  }
  
  return response.json();
}

// Avoid triggering negotiation loops
async function fetchResourceSimple(url) {
  // Use simple Accept header to avoid negotiation issues
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json', // Single format
    },
  });
  
  if (response.status === 506) {
    throw new Error('Server configuration error: variant negotiation loop');
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Fix Content Negotiation Configuration',
          code: `// Server-side: Fix content negotiation to prevent 506
const express = require('express');
const app = express();

// BAD: This causes 506 - variant tries to negotiate itself
app.get('/api/resource', (req, res) => {
  const acceptHeader = req.headers.accept;
  
  // Don't create variants that negotiate themselves
  // Variant resources should return content directly, not negotiate
  
  // GOOD: Return content directly based on Accept header
  if (acceptHeader.includes('application/json')) {
    res.json({ data: 'content' });
  } else if (acceptHeader.includes('application/xml')) {
    res.set('Content-Type', 'application/xml');
    res.send('<data>content</data>');
  } else {
    // Default to JSON
    res.json({ data: 'content' });
  }
});

// Prevent negotiation loops
const preventNegotiationLoop = (req, res, next) => {
  // Check if we're already in a negotiation context
  if (req.headers['x-negotiation-depth']) {
    const depth = parseInt(req.headers['x-negotiation-depth']);
    if (depth > 1) {
      return res.status(506).json({
        error: 'Variant Also Negotiates',
        message: 'Content negotiation loop detected',
      });
    }
  }
  
  // Add depth tracking
  req.headers['x-negotiation-depth'] = 
    (parseInt(req.headers['x-negotiation-depth'] || '0') + 1).toString();
  
  next();
};

// Apply to negotiation endpoints
app.use('/api/variants', preventNegotiationLoop);`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Fix Content Negotiation',
          code: `# Nginx: Configure content negotiation properly to prevent 506
server {
    listen 80;
    server_name api.example.com;
    
    # Enable content negotiation
    location /api/resources/ {
        # Don't create recursive negotiation
        # Variants should be static files, not dynamic negotiation
        
        # Serve JSON by default
        try_files \$uri.json \$uri/index.json =404;
        
        # Or proxy to backend (backend handles negotiation)
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header Accept \$http_accept;
        
        # Backend should not create variants that negotiate
    }
    
    # Avoid variant negotiation loops
    # Don't configure variants that point to other variants
}`,
        },
      ],
      metaDescription: 'Debug 506 Variant Also Negotiates by fixing content negotiation loops, simplifying Accept headers, and resolving server configuration conflicts with our step-by-step guide.',
      relatedCodes: ['500', '406'],
      provider: 'http',
    },
    '508': {
      code: '508',
      name: 'Loop Detected',
      description: `Hitting a 508 Loop Detected means the server found an infinite loop while processing your request—circular references in resource structures, recursive operations that never terminate, or WebDAV depth infinity requests that create loops. This server-side error (5xx) happens when server logic detects it's stuck in a loop. Most common in WebDAV PROPFIND requests with depth infinity on circular structures, but also appears when recursive operations hit circular references, resource trees have cycles, or server processing logic creates loops.`,
      causes: [
        `Frontend: WebDAV PROPFIND with depth infinity on circular structure. Recursive resource fetching hits circular references. Client requests create server-side loops.`,
        `Backend: WebDAV depth infinity request on circular directory structure. Recursive operation without cycle detection. Resource tree has circular references. Server processing logic creates infinite loop.`,
        `Infrastructure: File system has circular symlinks. Directory structure creates loops. Resource storage has circular dependencies.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—508 responses indicate server detected a loop. Review request parameters (especially depth for WebDAV). Check if recursive requests are involved.`,
        `Step 2: Diagnose - Server logs show where the loop was detected. Review WebDAV depth settings. Check resource structure for cycles. Examine recursive operation logic.`,
        `Step 3: Fix - Client-side: Use limited depth instead of infinity for WebDAV. Implement cycle detection in recursive operations. Add depth limits to requests.`,
        `Step 4: Fix - Server-side: Implement cycle detection in recursive operations. Limit WebDAV depth processing. Add loop detection to resource traversal. Fix circular references in data.`,
        `Step 5: Fix - Infrastructure: Fix circular symlinks in file system. Resolve circular directory structures. Review resource storage for cycles.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Prevent Loops in Recursive Operations',
          code: `// Client-side: Prevent loops with depth limits and cycle detection
async function fetchResourceTree(path, depth = 0, maxDepth = 10, visited = new Set()) {
  // Prevent infinite loops
  if (depth > maxDepth) {
    throw new Error('Maximum depth exceeded');
  }
  
  // Cycle detection
  if (visited.has(path)) {
    throw new Error('Circular reference detected');
  }
  
  visited.add(path);
  
  try {
    // Use limited depth for WebDAV PROPFIND
    const response = await fetch(\`/api/resources?path=\${encodeURIComponent(path)}&depth=\${maxDepth - depth}\`);
    
    if (response.status === 508) {
      console.error('Loop detected in resource tree by server');
      // Return partial results instead of continuing
      return { 
        path, 
        children: [], 
        error: 'Loop detected',
        partial: true,
        message: 'Server detected circular reference in resource structure',
      };
    }
    
    const data = await response.json();
    
    // Recursively fetch children with depth limit and cycle detection
    if (data.children && depth < maxDepth) {
      data.children = await Promise.all(
        data.children.map(child => 
          fetchResourceTree(
            child.path, 
            depth + 1, 
            maxDepth,
            new Set(visited) // Pass copy to prevent false positives
          )
        )
      );
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching resource:', error);
    throw error;
  }
}

// WebDAV PROPFIND with depth limit
async function propfindWithDepthLimit(url, maxDepth = 5) {
  const response = await fetch(url, {
    method: 'PROPFIND',
    headers: {
      'Depth': maxDepth.toString(), // Don't use 'infinity'
      'Content-Type': 'application/xml',
    },
    body: \`<?xml version="1.0"?><propfind xmlns="DAV:"><prop><displayname/></prop></propfind>\`,
  });
  
  if (response.status === 508) {
    throw new Error('Loop detected - reduce depth or fix circular references');
  }
  
  return response.text();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Detect and Prevent Loops',
          code: `// Server-side: Detect loops and return 508
const express = require('express');
const app = express();

// Loop detection for recursive operations
const detectLoops = (req, res, next) => {
  const depth = parseInt(req.headers['depth'] || '0');
  const maxDepth = 10;
  
  if (depth > maxDepth) {
    return res.status(508).json({
      error: 'Loop Detected',
      message: 'Maximum depth exceeded',
      maxDepth: maxDepth,
    });
  }
  
  // Track visited paths to detect cycles
  const visitedPaths = req.visitedPaths || new Set();
  const currentPath = req.path;
  
  if (visitedPaths.has(currentPath)) {
    return res.status(508).json({
      error: 'Loop Detected',
      message: 'Circular reference detected in resource structure',
      path: currentPath,
    });
  }
  
  visitedPaths.add(currentPath);
  req.visitedPaths = visitedPaths;
  
  next();
};

// WebDAV PROPFIND handler with loop detection
app.propfind('/api/resources/*', detectLoops, async (req, res) => {
  const depth = parseInt(req.headers['depth'] || '0');
  const path = req.params[0];
  
  // Don't allow infinity depth
  if (req.headers['depth'] === 'infinity') {
    return res.status(508).json({
      error: 'Loop Detected',
      message: 'Depth infinity not allowed - use limited depth',
      suggestion: 'Use depth=5 or less',
    });
  }
  
  try {
    const resources = await getResourcesRecursive(path, depth, req.visitedPaths);
    res.set('Content-Type', 'application/xml');
    res.send(generatePROPFINDResponse(resources));
  } catch (error) {
    if (error.message.includes('circular')) {
      return res.status(508).json({
        error: 'Loop Detected',
        message: error.message,
      });
    }
    throw error;
  }
});

async function getResourcesRecursive(path, maxDepth, visited = new Set(), currentDepth = 0) {
  if (currentDepth >= maxDepth) {
    return [];
  }
  
  if (visited.has(path)) {
    throw new Error('Circular reference detected');
  }
  
  visited.add(path);
  const resources = await db.resources.findByPath(path);
  
  if (currentDepth < maxDepth) {
    for (const resource of resources) {
      resource.children = await getResourcesRecursive(
        resource.path,
        maxDepth,
        new Set(visited),
        currentDepth + 1
      );
    }
  }
  
  return resources;
}`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Limit WebDAV Depth',
          code: `# Nginx: Configure WebDAV with depth limits
server {
    listen 80;
    server_name api.example.com;
    
    location /api/resources/ {
        # Proxy to WebDAV backend
        proxy_pass http://webdav-backend;
        proxy_set_header Host \$host;
        proxy_set_header Depth \$http_depth;
        
        # Limit depth to prevent loops
        if (\$http_depth = "infinity") {
            return 508 '{"error":"Loop Detected","message":"Depth infinity not allowed"}';
            default_type application/json;
        }
        
        # Or modify depth header
        # set \$depth \$http_depth;
        # if (\$depth = "") {
        #     set \$depth "0";
        # }
        # proxy_set_header Depth \$depth;
    }
}`,
        },
      ],
      metaDescription: 'Solve 508 Loop Detected errors by implementing cycle detection, limiting WebDAV depth, and fixing circular references in resource structures with our expert guide.',
      relatedCodes: ['500', '507'],
      provider: 'http',
    },
    '510': {
      code: '510',
      name: 'Not Extended',
      description: `Getting a 510 Not Extended means the server needs additional protocol extensions to process your request—the Require header lists extensions that must be included. This client-side error (4xx) happens when servers mandate specific HTTP extensions. Most common when servers require experimental or custom extensions, but also appears when protocol extensions are mandatory, extension negotiation fails, or servers enforce extension requirements.`,
      causes: [
        `Frontend: Missing Require header extensions. Protocol extensions not included in request. Client doesn't support required extensions. Extension headers missing or incorrect.`,
        `Backend: Server requires specific protocol extensions. Extension validation middleware rejects requests. Server configuration mandates extensions. Extension negotiation fails.`,
        `Infrastructure: API gateway enforces extension requirements. Load balancer requires extensions. Reverse proxy extension validation.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response headers—look for Require header listing needed extensions. Review which extensions are missing. Check extension format.`,
        `Step 2: Diagnose - Server logs show which extensions are required. Review Require header in response. Check server extension configuration. Verify extension requirements.`,
        `Step 3: Fix - Client-side: Add required extensions from Require header. Include extension headers in request. Update client to support extensions. Retry with extensions.`,
        `Step 4: Fix - Server-side: Return 510 with Require header listing needed extensions. Provide clear extension documentation. Implement extension validation properly.`,
        `Step 5: Fix - Infrastructure: Configure API gateway extension handling. Review load balancer extension requirements. Update reverse proxy extension support.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 510 Extension Requirements',
          code: `// Client-side: Handle 510 by adding required extensions
async function fetchWithExtensions() {
  let response = await fetch('/api/endpoint', {
    method: 'GET',
    headers: {
      'X-Protocol-Version': '1.0',
    },
  });
  
  if (response.status === 510) {
    // Server requires extensions - check Require header
    const requiredExtensions = response.headers.get('Require');
    console.log('Required extensions:', requiredExtensions);
    
    // Parse and add required extensions
    const extensions = requiredExtensions?.split(', ') || [];
    const headers = { 
      'X-Protocol-Version': '1.0',
    };
    
    // Add required extensions
    extensions.forEach(ext => {
      const trimmed = ext.trim();
      if (trimmed === 'feature-x') {
        headers['X-Feature-X'] = 'enabled';
      } else if (trimmed === 'feature-y') {
        headers['X-Feature-Y'] = 'enabled';
      } else if (trimmed === 'custom-auth') {
        headers['X-Custom-Auth'] = 'token-value';
      }
    });
    
    // Retry with required extensions
    response = await fetch('/api/endpoint', {
      method: 'GET',
      headers,
    });
  }
  
  if (!response.ok) {
    throw new Error(\`Request failed: \${response.status}\`);
  }
  
  return response.json();
}

// Automatic extension handling
async function fetchWithAutoExtensions(url) {
  const extensions = [];
  let response = await fetch(url);
  
  // Retry with extensions if 510
  while (response.status === 510) {
    const required = response.headers.get('Require');
    if (!required) break;
    
    const newExtensions = required.split(', ').map(e => e.trim());
    extensions.push(...newExtensions);
    
    // Build headers with extensions
    const headers = {};
    newExtensions.forEach(ext => {
      headers[\`X-Extension-\${ext}\`] = 'enabled';
    });
    
    response = await fetch(url, { headers });
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Return 510 with Required Extensions',
          code: `// Server-side: Return 510 with Require header
const express = require('express');
const app = express();

// Extension requirement middleware
const requireExtensions = (requiredExtensions) => {
  return (req, res, next) => {
    const providedExtensions = [];
    
    // Check for required extensions
    requiredExtensions.forEach(ext => {
      const headerName = \`x-extension-\${ext}\`;
      if (req.headers[headerName] || req.headers[headerName.replace(/-/g, '_')]) {
        providedExtensions.push(ext);
      }
    });
    
    // Check if all required extensions are present
    const missing = requiredExtensions.filter(ext => !providedExtensions.includes(ext));
    
    if (missing.length > 0) {
      return res.status(510)
        .set('Require', missing.join(', '))
        .json({
          error: 'Not Extended',
          message: 'Additional extensions required',
          requiredExtensions: missing,
          providedExtensions: providedExtensions,
        });
    }
    
    next();
  };
};

// Endpoint requiring extensions
app.get('/api/secure', 
  requireExtensions(['feature-x', 'custom-auth']),
  (req, res) => {
    res.json({ 
      message: 'Access granted',
      extensions: ['feature-x', 'custom-auth'],
    });
  }
);

// Extension validation
app.use('/api/extended', (req, res, next) => {
  const required = ['feature-x', 'feature-y'];
  const provided = [];
  
  required.forEach(ext => {
    if (req.headers[\`x-extension-\${ext}\`]) {
      provided.push(ext);
    }
  });
  
  if (provided.length < required.length) {
    const missing = required.filter(ext => !provided.includes(ext));
    return res.status(510)
      .set('Require', missing.join(', '))
      .json({
        error: 'Not Extended',
        requiredExtensions: missing,
      });
  }
  
  next();
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Handle Extension Requirements',
          code: `# Nginx: Pass extension headers and handle 510
server {
    listen 80;
    server_name api.example.com;
    
    location /api/extended/ {
        # Pass extension headers to backend
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Extension-Feature-X \$http_x_extension_feature_x;
        proxy_set_header X-Extension-Custom-Auth \$http_x_extension_custom_auth;
        
        # Or pass all X-Extension-* headers
        proxy_pass_request_headers on;
        
        # Backend will return 510 if extensions missing
    }
    
    # Optional: Validate extensions at Nginx level
    # location /api/secure/ {
    #     if (\$http_x_extension_feature_x = "") {
    #         return 510 '{"error":"Not Extended","requiredExtensions":["feature-x"]}';
    #         add_header Require "feature-x" always;
    #         default_type application/json;
    #     }
    #     proxy_pass http://backend;
    # }
}`,
        },
      ],
      metaDescription: 'Master 510 Not Extended by reading Require headers, adding missing protocol extensions, and implementing extension validation with our comprehensive troubleshooting guide.',
      relatedCodes: ['400', '501'],
      provider: 'http',
    },
    '300': {
      code: '300',
      name: 'Multiple Choices',
      description: `Seeing a 300 Multiple Choices means the server found multiple representations of the resource and can't decide which one to return—different formats, languages, or versions are available. This client-side informational response (3xx) requires the client to choose. Most common when content negotiation offers multiple options, but also appears when resources exist in multiple formats, servers provide multiple versions, or Accept headers match several variants.`,
      causes: [
        `Frontend: Accept header matches multiple content types. Multiple resource formats available. Content negotiation offers several options. No specific format preference.`,
        `Backend: Server has multiple representations of resource. Content negotiation returns multiple matches. Resource available in different formats/languages. Server can't choose default.`,
        `Infrastructure: CDN serves multiple variants. Load balancer routes to different formats. Reverse proxy offers multiple options.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Response body—300 responses usually list available options. Review Link headers for variant URLs. Check Content-Location headers.`,
        `Step 2: Diagnose - Server logs show which variants matched. Review content negotiation configuration. Check available resource formats. Examine Accept header matching.`,
        `Step 3: Fix - Client-side: Specify preferred format in Accept header. Use more specific Accept values. Follow Link headers to choose variant. Implement content negotiation logic.`,
        `Step 4: Fix - Server-side: Return 300 with Link headers listing variants. Provide Content-Location for each variant. Set default format if possible. Improve content negotiation.`,
        `Step 5: Fix - Infrastructure: Configure CDN variant selection. Review load balancer content negotiation. Update reverse proxy variant handling.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 300 Multiple Choices',
          code: `// Client-side: Handle 300 by choosing preferred format
async function fetchResourceWithChoice(url) {
  let response = await fetch(url);
  
  if (response.status === 300) {
    // Multiple choices available - parse options
    const links = response.headers.get('Link');
    const contentType = response.headers.get('Content-Type');
    
    // Parse Link header for available variants
    const variants = parseLinkHeader(links);
    console.log('Available variants:', variants);
    
    // Choose based on Accept header preference
    response = await fetch(url, {
      headers: {
        'Accept': 'application/json', // Specify preferred format
      },
    });
    
    // If still 300, choose first variant from Link header
    if (response.status === 300 && variants.length > 0) {
      const preferredVariant = variants.find(v => v.rel === 'alternate' && v.type === 'application/json') 
                              || variants[0];
      response = await fetch(preferredVariant.url);
    }
  }
  
  return response.json();
}

// Parse Link header
function parseLinkHeader(linkHeader) {
  if (!linkHeader) return [];
  
  const links = linkHeader.split(',');
  return links.map(link => {
    const parts = link.split(';');
    const url = parts[0].trim().slice(1, -1); // Remove < >
    const params = {};
    
    parts.slice(1).forEach(param => {
      const [key, value] = param.trim().split('=');
      params[key] = value?.replace(/"/g, '');
    });
    
    return { url, ...params };
  });
}

// Automatic format selection
async function fetchWithAutoSelection(url, preferredFormat = 'application/json') {
  const response = await fetch(url, {
    headers: {
      'Accept': preferredFormat,
    },
  });
  
  if (response.status === 300) {
    // Use more specific Accept header
    return fetch(url, {
      headers: {
        'Accept': \`\${preferredFormat}, */*;q=0.1\`,
      },
    });
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Return 300 with Variants',
          code: `// Server-side: Return 300 with multiple choices
const express = require('express');
const app = express();

// Resource with multiple representations
app.get('/api/resource', (req, res) => {
  const acceptHeader = req.headers.accept || '*/*';
  
  // Check if multiple formats match
  const formats = ['application/json', 'application/xml', 'text/html'];
  const matches = formats.filter(format => 
    acceptHeader.includes(format) || acceptHeader === '*/*'
  );
  
  if (matches.length > 1) {
    // Multiple choices - return 300 with Link headers
    const links = formats.map(format => {
      const url = \`/api/resource.\${format.split('/')[1]}\`;
      return \`<\${url}>; rel="alternate"; type="\${format}"\`;
    }).join(', ');
    
    return res.status(300)
      .set('Link', links)
      .set('Content-Type', 'text/html')
      .send(\`
        <html>
          <body>
            <h1>Multiple Choices</h1>
            <p>Available formats:</p>
            <ul>
              <li><a href="/api/resource.json">JSON</a></li>
              <li><a href="/api/resource.xml">XML</a></li>
              <li><a href="/api/resource.html">HTML</a></li>
            </ul>
          </body>
        </html>
      \`);
  }
  
  // Single match - return that format
  if (matches.includes('application/json')) {
    res.json({ data: 'resource' });
  } else if (matches.includes('application/xml')) {
    res.set('Content-Type', 'application/xml');
    res.send('<data>resource</data>');
  } else {
    res.send('<html><body>resource</body></html>');
  }
});

// Variant endpoints
app.get('/api/resource.json', (req, res) => {
  res.json({ data: 'resource' });
});

app.get('/api/resource.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.send('<data>resource</data>');
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Content Negotiation with Multiple Choices',
          code: `# Nginx: Handle multiple choices in content negotiation
server {
    listen 80;
    server_name api.example.com;
    
    location /api/resource {
        # Enable content negotiation
        index index.json index.xml index.html;
        
        # If multiple formats exist, return 300
        # Or let backend handle it
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header Accept \$http_accept;
    }
    
    # Or serve static variants
    location /api/resource.json {
        default_type application/json;
        return 200 '{"data":"resource"}';
    }
    
    location /api/resource.xml {
        default_type application/xml;
        return 200 '<data>resource</data>';
    }
}`,
        },
      ],
      metaDescription: 'Fix 300 Multiple Choices by specifying preferred formats in Accept headers, parsing Link headers for variants, and mastering content negotiation with our guide.',
      relatedCodes: ['301', '302', '406'],
      provider: 'http',
    },
    '301': {
      code: '301',
      name: 'Moved Permanently',
      description: `Getting a 301 Moved Permanently means the resource has permanently moved to a new URL—the Location header shows where it went, and you should update all references to use the new URL permanently. This client-side redirect (3xx) tells browsers and search engines the old URL is obsolete. Most common when APIs migrate endpoints, domains change, or URL structures are restructured, but also appears when resources are permanently relocated, old URLs are deprecated, or permanent redirects are configured.`,
      causes: [
        `Frontend: Old URL still in use. Bookmarks point to deprecated endpoint. Application code uses outdated API URL. Client hasn't updated to new endpoint.`,
        `Backend: Resource permanently moved. API endpoint migrated. Domain changed. URL structure restructured. Permanent redirect configured.`,
        `Infrastructure: Domain migration in progress. CDN redirects to new location. Load balancer routes to new endpoint. Reverse proxy permanent redirect.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Location header—301 responses show the new permanent URL. Review redirect chain. Check if redirect is actually permanent.`,
        `Step 2: Diagnose - Server logs show redirect configuration. Review permanent redirect rules. Check if resource actually moved. Verify new URL is correct.`,
        `Step 3: Fix - Client-side: Update all references to new URL permanently. Update bookmarks and saved URLs. Change API base URL in code. Update client configuration.`,
        `Step 4: Fix - Server-side: Configure 301 redirect with correct Location header. Ensure new URL is accessible. Set proper cache headers. Update documentation.`,
        `Step 5: Fix - Infrastructure: Update DNS if domain changed. Configure CDN permanent redirects. Update load balancer routing. Set reverse proxy redirects.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 301 Permanent Redirects',
          code: `// Client-side: Handle 301 and update URLs permanently
async function fetchWithPermanentRedirect(url) {
  const response = await fetch(url, { redirect: 'manual' });
  
  if (response.status === 301) {
    const newUrl = response.headers.get('Location');
    console.log('Resource moved permanently to:', newUrl);
    
    // Update stored URL permanently for future requests
    localStorage.setItem('api-url', newUrl);
    updateApiBaseUrl(newUrl);
    
    // Follow redirect to new location
    return fetch(newUrl);
  }
  
  return response.json();
}

// Update API base URL permanently
function updateApiBaseUrl(newUrl) {
  // Update in-memory config
  API_BASE_URL = newUrl;
  
  // Update localStorage
  localStorage.setItem('api-base-url', newUrl);
  
  // Update any cached URLs
  const cachedUrls = JSON.parse(localStorage.getItem('cached-urls') || '{}');
  cachedUrls[oldUrl] = newUrl;
  localStorage.setItem('cached-urls', JSON.stringify(cachedUrls));
}

// Automatic permanent redirect handling
async function fetchWithAutoUpdate(url) {
  let response = await fetch(url, { redirect: 'manual' });
  
  // Handle 301 permanently
  if (response.status === 301) {
    const newUrl = response.headers.get('Location');
    
    // Update all references to new URL
    updateAllReferences(url, newUrl);
    
    // Follow redirect
    response = await fetch(newUrl);
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Configure 301 Permanent Redirects',
          code: `// Server-side: Return 301 for permanently moved resources
const express = require('express');
const app = express();

// Permanent redirect for moved endpoint
app.get('/api/v1/users', (req, res) => {
  // Resource permanently moved
  res.redirect(301, '/api/v2/users');
});

// Or use redirect with explicit status
app.get('/old-endpoint', (req, res) => {
  res.status(301)
    .set('Location', '/new-endpoint')
    .set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    .end();
});

// API endpoint migration
app.get('/api/v1/data', (req, res) => {
  // Permanently redirect to new version
  const newUrl = '/api/v2/data';
  res.status(301)
    .set('Location', newUrl)
    .json({
      message: 'This endpoint has permanently moved',
      newUrl: newUrl,
      migrationDate: '2024-01-01',
    });
});

// Domain migration
app.get('*', (req, res, next) => {
  const host = req.headers.host;
  
  // Redirect old domain to new domain
  if (host === 'old-domain.com') {
    return res.redirect(301, \`https://new-domain.com\${req.url}\`);
  }
  
  next();
});

// URL structure change
app.get('/api/old-structure/:id', (req, res) => {
  const newUrl = \`/api/new-structure/\${req.params.id}\`;
  res.redirect(301, newUrl);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Configure 301 Permanent Redirects',
          code: `# Nginx: Configure permanent redirects
server {
    listen 80;
    server_name old-domain.com;
    
    # Permanent redirect entire domain
    return 301 https://new-domain.com\$request_uri;
}

server {
    listen 80;
    server_name api.example.com;
    
    # Permanent redirect for moved endpoint
    location /api/v1/users {
        return 301 /api/v2/users\$is_args\$args;
    }
    
    # Permanent redirect with cache headers
    location /old-endpoint {
        return 301 /new-endpoint\$is_args\$args;
        add_header Cache-Control "public, max-age=31536000" always;
    }
    
    # URL structure change
    location ~ ^/api/old-structure/(.+)$ {
        return 301 /api/new-structure/\$1\$is_args\$args;
    }
    
    # Or use rewrite for permanent redirect
    location /api/legacy {
        rewrite ^/api/legacy(.*)$ /api/v2\$1 permanent;
    }
}`,
        },
      ],
      metaDescription: 'Solve 301 Moved Permanently redirects by updating URL references, following Location headers, and configuring permanent redirects with our expert troubleshooting guide.',
      relatedCodes: ['302', '308', '410'],
      provider: 'http',
    },
    '302': {
      code: '302',
      name: 'Found',
      description: `Seeing a 302 Found means the resource temporarily moved to a new URL—follow the Location header for this request, but keep using the original URL for future requests since it's temporary. This client-side redirect (3xx) is the classic temporary redirect, though browsers often change POST to GET. Most common when resources are temporarily relocated, maintenance mode redirects users, or A/B testing routes traffic, but also appears when temporary redirects are configured, maintenance windows redirect, or temporary location changes occur.`,
      causes: [
        `Frontend: Resource temporarily moved. Maintenance mode active. A/B testing redirects traffic. Temporary location change.`,
        `Backend: Temporary redirect configured. Resource temporarily relocated. Maintenance mode redirect. A/B testing logic. Temporary URL change.`,
        `Infrastructure: Load balancer temporary redirect. CDN temporary routing. Reverse proxy temporary redirect. Maintenance mode active.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Location header—302 responses show temporary redirect URL. Review redirect chain. Check if redirect is actually temporary.`,
        `Step 2: Diagnose - Server logs show redirect configuration. Review temporary redirect rules. Check if resource actually moved. Verify redirect is temporary.`,
        `Step 3: Fix - Client-side: Follow Location header for this request. Keep original URL for future requests. Handle redirect in application logic. Don't cache redirect.`,
        `Step 4: Fix - Server-side: Configure 302 redirect with correct Location header. Ensure redirect is actually temporary. Set proper cache headers. Use 307 if method must be preserved.`,
        `Step 5: Fix - Infrastructure: Configure temporary redirects properly. Review load balancer routing. Update CDN temporary redirects. Check maintenance mode.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 302 Temporary Redirects',
          code: `// Client-side: Handle 302 temporary redirects
async function fetchWithTemporaryRedirect(url) {
  // Option 1: Let fetch follow redirect automatically
  const response = await fetch(url, { redirect: 'follow' });
  return response.json();
}

// Option 2: Manual redirect handling
async function fetchWithManualRedirect(url) {
  let response = await fetch(url, { redirect: 'manual' });
  
  if (response.status === 302) {
    const newUrl = response.headers.get('Location');
    console.log('Temporary redirect to:', newUrl);
    
    // Follow redirect for this request only
    // Don't update stored URL - it's temporary
    response = await fetch(newUrl);
  }
  
  return response.json();
}

// Handle redirect chain
async function fetchWithRedirectChain(url, maxRedirects = 5) {
  let currentUrl = url;
  let redirectCount = 0;
  
  while (redirectCount < maxRedirects) {
    const response = await fetch(currentUrl, { redirect: 'manual' });
    
    if (response.status === 302) {
      currentUrl = response.headers.get('Location');
      redirectCount++;
      continue;
    }
    
    return response.json();
  }
  
  throw new Error('Too many redirects');
}

// Note: 302 may change POST to GET in some browsers
// Use 307 if you need to preserve method`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Configure 302 Temporary Redirects',
          code: `// Server-side: Return 302 for temporary redirects
const express = require('express');
const app = express();

// Temporary redirect
app.get('/api/temp-endpoint', (req, res) => {
  // Resource temporarily moved
  res.redirect(302, '/api/temporary-location');
});

// Maintenance mode redirect
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    return res.redirect(302, '/maintenance');
  }
  next();
});

// A/B testing redirect
app.get('/api/feature', (req, res) => {
  const variant = Math.random() > 0.5 ? 'a' : 'b';
  res.redirect(302, \`/api/feature/\${variant}\`);
});

// Temporary location change
app.get('/api/old-location', (req, res) => {
  res.status(302)
    .set('Location', '/api/new-location')
    .set('Cache-Control', 'no-cache') // Don't cache temporary redirect
    .end();
});

// Temporary redirect with query params
app.get('/api/search', (req, res) => {
  // Temporarily redirect to new search endpoint
  const query = req.query.q;
  res.redirect(302, \`/api/v2/search?q=\${query}\`);
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Configure 302 Temporary Redirects',
          code: `# Nginx: Configure temporary redirects
server {
    listen 80;
    server_name api.example.com;
    
    # Temporary redirect
    location /api/temp-endpoint {
        return 302 /api/temporary-location\$is_args\$args;
    }
    
    # Maintenance mode redirect
    location / {
        if (\$maintenance_mode = 1) {
            return 302 /maintenance;
        }
        proxy_pass http://backend;
    }
    
    # Temporary redirect with no cache
    location /api/old-location {
        return 302 /api/new-location\$is_args\$args;
        add_header Cache-Control "no-cache" always;
    }
    
    # A/B testing redirect
    location /api/feature {
        set \$variant "a";
        if (\$arg_test = "b") {
            set \$variant "b";
        }
        return 302 /api/feature/\$variant\$is_args\$args;
    }
    
    # Or use rewrite for temporary redirect
    location /api/legacy {
        rewrite ^/api/legacy(.*)$ /api/temp\$1 redirect;
    }
}`,
        },
      ],
      metaDescription: 'Debug 302 Found temporary redirects by following Location headers, preserving original URLs, and configuring temporary redirects with our step-by-step guide.',
      relatedCodes: ['301', '307', '308'],
      provider: 'http',
    },
    '303': {
      code: '303',
      name: 'See Other',
      description: `Getting a 303 See Other means the server wants you to fetch the result of your POST/PUT/DELETE operation using GET at a different URL—the Location header shows where to get the result, and you must use GET even if the original request was POST. This client-side redirect (3xx) is designed for POST-after-GET patterns. Most common after form submissions when results are available elsewhere, but also appears when POST operations redirect to result pages, form submissions redirect to confirmation pages, or operations redirect to status pages.`,
      causes: [
        `Frontend: POST request submitted. Form submission completed. Operation result available elsewhere. Need to fetch result with GET.`,
        `Backend: POST operation completed. Form submission processed. Result available at different URL. Server redirects to result page.`,
        `Infrastructure: Form handler redirects after submission. Operation result served at different endpoint.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Location header—303 responses show where to GET the result. Review redirect after POST. Check if GET is required.`,
        `Step 2: Diagnose - Server logs show POST operation completion. Review redirect configuration. Check result URL. Verify GET requirement.`,
        `Step 3: Fix - Client-side: Follow Location header with GET request (not POST). Fetch result page with GET. Handle redirect after form submission.`,
        `Step 4: Fix - Server-side: Return 303 with Location header after POST. Ensure result is available at Location URL. Use GET for result page.`,
        `Step 5: Fix - Infrastructure: Configure form handler redirects. Set up result pages. Ensure GET works at redirect URL.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 303 See Other Redirects',
          code: `// Client-side: Handle 303 - must use GET for redirect
async function submitForm(formData) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
    redirect: 'manual', // Handle redirect manually
  });
  
  if (response.status === 303) {
    const location = response.headers.get('Location');
    console.log('See Other - redirect to:', location);
    
    // 303 requires GET request to new location (not POST)
    const resultResponse = await fetch(location, { 
      method: 'GET', // Must use GET
    });
    
    return resultResponse.json();
  }
  
  return response.json();
}

// Form submission with 303 handling
async function handleFormSubmission(form) {
  const formData = new FormData(form);
  
  const response = await fetch('/api/form-submit', {
    method: 'POST',
    body: formData,
    redirect: 'manual',
  });
  
  if (response.status === 303) {
    // Redirect to result/confirmation page
    const resultUrl = response.headers.get('Location');
    window.location.href = resultUrl; // Browser will GET the page
    return;
  }
  
  // Handle other status codes
  const result = await response.json();
  displayResult(result);
}

// POST-after-GET pattern
async function createResource(data) {
  const response = await fetch('/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'manual',
  });
  
  if (response.status === 303) {
    // GET the created resource
    const resourceUrl = response.headers.get('Location');
    return fetch(resourceUrl, { method: 'GET' });
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Return 303 After POST',
          code: `// Server-side: Return 303 after POST operations
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Form submission - redirect to result page
app.post('/api/form-submit', async (req, res) => {
  // Process form submission
  const result = await processFormSubmission(req.body);
  
  // Redirect to result page with GET
  res.redirect(303, \`/api/results/\${result.id}\`);
});

// POST operation - redirect to resource
app.post('/api/resources', async (req, res) => {
  // Create resource
  const resource = await db.resources.create(req.body);
  
  // Redirect to GET the created resource
  res.status(303)
    .set('Location', \`/api/resources/\${resource.id}\`)
    .end();
});

// File upload - redirect to status page
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const fileId = await processUpload(req.file);
  
  // Redirect to status/result page
  res.redirect(303, \`/api/uploads/\${fileId}/status\`);
});

// Operation completion - redirect to confirmation
app.post('/api/operations', async (req, res) => {
  const operation = await performOperation(req.body);
  
  // Redirect to confirmation page
  res.redirect(303, \`/api/operations/\${operation.id}/confirmation\`);
});

// POST-after-GET pattern
app.post('/api/orders', async (req, res) => {
  const order = await createOrder(req.body);
  
  // Redirect to GET the order
  res.status(303)
    .set('Location', \`/api/orders/\${order.id}\`)
    .end();
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Handle 303 Redirects',
          code: `# Nginx: Pass 303 redirects from backend
server {
    listen 80;
    server_name api.example.com;
    
    location /api/submit {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        
        # Backend returns 303, Nginx passes it through
        proxy_redirect off;
    }
    
    # Or configure 303 redirect at Nginx level
    location /api/form-submit {
        # After POST, redirect to result page
        if (\$request_method = POST) {
            return 303 /api/results\$is_args\$args;
        }
        
        proxy_pass http://backend;
    }
}`,
        },
      ],
      metaDescription: 'Master 303 See Other redirects by using GET after POST, implementing POST-after-GET patterns, and redirecting form submissions with our comprehensive troubleshooting guide.',
      relatedCodes: ['302', '307'],
      provider: 'http',
    },
    '304': {
      code: '304',
      name: 'Not Modified',
      description: `Getting a 304 Not Modified means the resource hasn't changed since your last request—the ETag or Last-Modified timestamp matches, so you can use your cached version. This client-side informational response (3xx) saves bandwidth by not sending the full response. Most common when conditional requests use If-None-Match or If-Modified-Since, but also appears when cached resources are still valid, ETags match, or Last-Modified timestamps are unchanged.`,
      causes: [
        `Frontend: Resource cached and still valid. ETag matches If-None-Match. Last-Modified unchanged. Conditional request sent.`,
        `Backend: Resource not modified since last request. ETag validation passed. Last-Modified check passed. Cache validation successful.`,
        `Infrastructure: CDN serves cached content. Reverse proxy cache valid. Load balancer cache hit.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab—304 responses mean cache is valid. Review ETag headers. Check Last-Modified headers. Verify cache is working.`,
        `Step 2: Diagnose - Server logs show cache validation. Review ETag generation. Check Last-Modified timestamps. Verify conditional request handling.`,
        `Step 3: Fix - Client-side: Use cached version when 304 received. Implement ETag/Last-Modified caching. Handle conditional requests properly. Update cache on 200.`,
        `Step 4: Fix - Server-side: Return 304 with proper headers. Generate ETags correctly. Set Last-Modified timestamps. Implement conditional request handling.`,
        `Step 5: Fix - Infrastructure: Configure CDN cache headers. Set reverse proxy cache. Update load balancer cache settings.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 304 Not Modified',
          code: `// Client-side: Handle 304 and use cache
async function fetchWithCache(url) {
  const cached = localStorage.getItem(\`cache-\${url}\`);
  const cacheData = cached ? JSON.parse(cached) : null;
  
  // Build conditional request headers
  const headers = {};
  if (cacheData?.etag) {
    headers['If-None-Match'] = cacheData.etag;
  }
  if (cacheData?.lastModified) {
    headers['If-Modified-Since'] = cacheData.lastModified;
  }
  
  const response = await fetch(url, { headers });
  
  if (response.status === 304) {
    // Resource not modified - use cached version
    console.log('Using cached version (304 Not Modified)');
    return cacheData.data;
  }
  
  // Resource modified - update cache
  const data = await response.json();
  const etag = response.headers.get('ETag');
  const lastModified = response.headers.get('Last-Modified');
  
  // Update cache
  localStorage.setItem(\`cache-\${url}\`, JSON.stringify({
    data,
    etag,
    lastModified,
    timestamp: Date.now(),
  }));
  
  return data;
}

// ETag-based caching
async function fetchWithETag(url) {
  const cached = localStorage.getItem(\`etag-\${url}\`);
  const cacheData = cached ? JSON.parse(cached) : null;
  
  const headers = {};
  if (cacheData?.etag) {
    headers['If-None-Match'] = cacheData.etag;
  }
  
  const response = await fetch(url, { headers });
  
  if (response.status === 304) {
    return cacheData.data;
  }
  
  const data = await response.json();
  const etag = response.headers.get('ETag');
  
  localStorage.setItem(\`etag-\${url}\`, JSON.stringify({
    data,
    etag,
    timestamp: Date.now(),
  }));
  
  return data;
}

// Last-Modified caching
async function fetchWithLastModified(url) {
  const cached = localStorage.getItem(\`modified-\${url}\`);
  const cacheData = cached ? JSON.parse(cached) : null;
  
  const headers = {};
  if (cacheData?.lastModified) {
    headers['If-Modified-Since'] = cacheData.lastModified;
  }
  
  const response = await fetch(url, { headers });
  
  if (response.status === 304) {
    return cacheData.data;
  }
  
  const data = await response.json();
  const lastModified = response.headers.get('Last-Modified');
  
  localStorage.setItem(\`modified-\${url}\`, JSON.stringify({
    data,
    lastModified,
    timestamp: Date.now(),
  }));
  
  return data;
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Return 304 for Unchanged Resources',
          code: `// Server-side: Return 304 for conditional requests
const express = require('express');
const app = express();

// ETag-based conditional request
app.get('/api/resource/:id', async (req, res) => {
  const resource = await db.resources.findById(req.params.id);
  
  // Generate ETag from resource
  const etag = generateETag(resource);
  res.set('ETag', etag);
  
  // Check If-None-Match header
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch === etag) {
    // Resource not modified
    return res.status(304).end();
  }
  
  // Resource modified - return full response
  res.json(resource);
});

// Last-Modified conditional request
app.get('/api/data/:id', async (req, res) => {
  const data = await db.data.findById(req.params.id);
  const lastModified = new Date(data.updatedAt).toUTCString();
  
  res.set('Last-Modified', lastModified);
  
  // Check If-Modified-Since header
  const ifModifiedSince = req.headers['if-modified-since'];
  if (ifModifiedSince) {
    const modifiedSince = new Date(ifModifiedSince);
    const resourceModified = new Date(data.updatedAt);
    
    if (resourceModified <= modifiedSince) {
      // Resource not modified
      return res.status(304).end();
    }
  }
  
  // Resource modified - return full response
  res.json(data);
});

// Combined ETag and Last-Modified
app.get('/api/content/:id', async (req, res) => {
  const content = await db.content.findById(req.params.id);
  const etag = generateETag(content);
  const lastModified = new Date(content.updatedAt).toUTCString();
  
  res.set('ETag', etag);
  res.set('Last-Modified', lastModified);
  
  // Check both conditions
  const ifNoneMatch = req.headers['if-none-match'];
  const ifModifiedSince = req.headers['if-modified-since'];
  
  if (ifNoneMatch === etag) {
    return res.status(304).end();
  }
  
  if (ifModifiedSince) {
    const modifiedSince = new Date(ifModifiedSince);
    const resourceModified = new Date(content.updatedAt);
    if (resourceModified <= modifiedSince) {
      return res.status(304).end();
    }
  }
  
  res.json(content);
});

function generateETag(data) {
  // Simple ETag generation (use crypto for production)
  const hash = require('crypto')
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
  return \`"\${hash}"\`;
}`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Cache Validation Headers',
          code: `# Nginx: Configure cache validation for 304 responses
server {
    listen 80;
    server_name api.example.com;
    
    location /api/static/ {
        # Enable ETag
        etag on;
        
        # Enable Last-Modified
        if_modified_since exact;
        
        # Proxy to backend
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        
        # Pass conditional headers
        proxy_set_header If-None-Match \$http_if_none_match;
        proxy_set_header If-Modified-Since \$http_if_modified_since;
        
        # Backend returns 304 if not modified
    }
    
    # Static file serving with 304
    location /static/ {
        root /var/www;
        etag on;
        if_modified_since exact;
        
        # Nginx automatically handles 304 for static files
    }
    
    # Cache validation
    location /api/cached/ {
        proxy_pass http://backend;
        proxy_cache_valid 200 1h;
        proxy_cache_valid 304 1h;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        
        # Pass conditional headers
        proxy_set_header If-None-Match \$http_if_none_match;
        proxy_set_header If-Modified-Since \$http_if_modified_since;
    }
}`,
        },
      ],
      metaDescription: 'Fix 304 Not Modified by implementing ETag and Last-Modified caching, using conditional requests, and configuring cache validation with our expert guide.',
      relatedCodes: ['200', '412'],
      provider: 'http',
    },
    '305': {
      code: '305',
      name: 'Use Proxy',
      description: `Seeing a 305 Use Proxy means the server wants you to access the resource through a proxy specified in the Location header—this status code is deprecated and rarely used in modern web development. This client-side redirect (3xx) was meant for proxy configuration but is obsolete. Most common in legacy systems, but modern applications should use 307 or 308 redirects instead, or configure proxies directly without this status code.`,
      causes: [
        `Frontend: Legacy system returns 305. Deprecated proxy configuration. Old API uses 305.`,
        `Backend: Legacy server returns 305. Deprecated redirect method. Old proxy configuration.`,
        `Infrastructure: Legacy proxy configuration. Old reverse proxy setup.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Location header—305 responses show proxy URL. Review if proxy is actually needed. Check if this is legacy behavior.`,
        `Step 2: Diagnose - Server logs show 305 configuration. Review proxy setup. Check if this is intentional. Verify proxy URL.`,
        `Step 3: Fix - Client-side: Use proxy from Location header if needed. Configure proxy directly. Update to modern redirect handling. Use 307/308 instead.`,
        `Step 4: Fix - Server-side: Replace 305 with 307 or 308. Configure proxy directly. Update to modern redirect methods. Remove deprecated status code.`,
        `Step 5: Fix - Infrastructure: Update proxy configuration. Replace 305 with modern redirects. Configure proxies directly.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 305 Use Proxy (Deprecated)',
          code: `// Client-side: Handle deprecated 305 status code
async function fetchWithProxy(url) {
  const response = await fetch(url, { redirect: 'manual' });
  
  if (response.status === 305) {
    const proxyUrl = response.headers.get('Location');
    console.warn('305 Use Proxy is deprecated - use 307 or 308 instead');
    console.log('Proxy URL:', proxyUrl);
    
    // Use proxy for request
    // Note: Modern browsers may handle this automatically
    // Better to configure proxy directly or use 307/308
    return fetch(proxyUrl);
  }
  
  return response.json();
}

// Modern alternative: Configure proxy directly
async function fetchWithDirectProxy(url, proxyUrl) {
  // Configure proxy directly instead of using 305
  const proxyConfig = {
    host: new URL(proxyUrl).hostname,
    port: new URL(proxyUrl).port || 80,
  };
  
  // Use proxy for request (implementation depends on environment)
  // In Node.js, use http-proxy-agent
  // In browser, configure proxy at network level
  return fetch(url);
}

// Recommended: Use 307/308 redirects instead
async function fetchWithModernRedirect(url) {
  const response = await fetch(url, { redirect: 'manual' });
  
  // Modern servers should use 307 or 308 instead of 305
  if (response.status === 307 || response.status === 308) {
    const newUrl = response.headers.get('Location');
    return fetch(newUrl);
  }
  
  return response.json();
}`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Replace 305 with Modern Redirects',
          code: `// Server-side: Replace deprecated 305 with modern redirects
const express = require('express');
const app = express();

// DON'T use 305 - it's deprecated
// BAD:
app.get('/api/legacy', (req, res) => {
  res.status(305)
    .set('Location', 'http://proxy.example.com/api/legacy')
    .end();
});

// GOOD: Use 307 or 308 instead
app.get('/api/resource', (req, res) => {
  // Temporary redirect with method preservation
  res.redirect(307, 'http://proxy.example.com/api/resource');
});

// Or configure proxy directly
const httpProxy = require('http-proxy-middleware');

app.use('/api/proxied', httpProxy({
  target: 'http://proxy.example.com',
  changeOrigin: true,
  // No need for 305 status code
}));

// Modern approach: Configure proxy at infrastructure level
// Don't use 305 status code in modern applications`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Replace 305 with Modern Redirects',
          code: `# Nginx: Don't use deprecated 305 - use 307/308 instead
server {
    listen 80;
    server_name api.example.com;
    
    # DON'T use 305 - it's deprecated
    # BAD:
    # location /api/legacy {
    #     return 305 http://proxy.example.com/api/legacy;
    # }
    
    # GOOD: Use 307 or 308 instead
    location /api/resource {
        return 307 http://proxy.example.com/api/resource\$is_args\$args;
    }
    
    # Or configure proxy directly
    location /api/proxied/ {
        proxy_pass http://proxy.example.com/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        # No need for 305 status code
    }
    
    # Modern approach: Configure proxy at load balancer level
    # Don't use 305 status code in modern configurations`,
        },
      ],
      metaDescription: 'Solve deprecated 305 Use Proxy by replacing with modern 307/308 redirects, configuring proxies directly, and updating legacy systems with our guide.',
      relatedCodes: ['302', '307'],
      provider: 'http',
    },
    '307': {
      code: '307',
      name: 'Temporary Redirect',
      description: `Getting a 307 Temporary Redirect means the resource temporarily moved to a new URL—follow the Location header using the same HTTP method (POST stays POST, PUT stays PUT). This client-side redirect (3xx) preserves the request method, unlike 302 which browsers may change POST to GET. Most common when resources are temporarily relocated and method must be preserved, but also appears when maintenance mode redirects, load balancing routes traffic, or temporary location changes occur.`,
      causes: [
        `Frontend: Resource temporarily moved. Maintenance mode active. Load balancing redirect. Temporary location change.`,
        `Backend: Temporary redirect configured. Resource temporarily relocated. Maintenance mode redirect. Load balancing logic.`,
        `Infrastructure: Load balancer temporary redirect. CDN temporary routing. Reverse proxy temporary redirect. Maintenance mode active.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Location header—307 responses show temporary redirect URL. Review redirect chain. Verify method is preserved.`,
        `Step 2: Diagnose - Server logs show redirect configuration. Review temporary redirect rules. Check if method preservation is needed. Verify redirect is temporary.`,
        `Step 3: Fix - Client-side: Follow Location header with same HTTP method. Preserve POST/PUT/DELETE methods. Handle redirect in application logic. Don't cache redirect.`,
        `Step 4: Fix - Server-side: Configure 307 redirect with correct Location header. Ensure method is preserved. Set proper cache headers. Use 308 if permanent.`,
        `Step 5: Fix - Infrastructure: Configure temporary redirects properly. Review load balancer routing. Update CDN temporary redirects. Check maintenance mode.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 307 Temporary Redirects',
          code: `// Client-side: Handle 307 with method preservation
async function fetchWithMethodPreservation(url, method = 'GET', body = null) {
  let response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
    redirect: 'manual', // Handle redirect manually
  });
  
  if (response.status === 307) {
    const newUrl = response.headers.get('Location');
    console.log('Temporary redirect to:', newUrl);
    
    // 307 preserves original method (POST stays POST, PUT stays PUT)
    response = await fetch(newUrl, {
      method, // Same method as original
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : null,
    });
  }
  
  return response.json();
}

// POST request with 307 redirect
async function postWithRedirect(url, data) {
  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'manual',
  });
  
  if (response.status === 307) {
    const newUrl = response.headers.get('Location');
    // POST method is preserved
    response = await fetch(newUrl, {
      method: 'POST', // Still POST, not GET
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  
  return response.json();
}

// PUT request with 307 redirect
async function putWithRedirect(url, data) {
  let response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'manual',
  });
  
  if (response.status === 307) {
    const newUrl = response.headers.get('Location');
    // PUT method is preserved
    return fetch(newUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  
  return response.json();
}

// Usage
fetchWithMethodPreservation('/api/data', 'POST', { key: 'value' });`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Configure 307 Temporary Redirects',
          code: `// Server-side: Return 307 for temporary redirects with method preservation
const express = require('express');
const app = express();

// Temporary redirect with method preservation
app.all('/api/temp-endpoint', (req, res) => {
  // 307 preserves the HTTP method
  res.redirect(307, '/api/temporary-location');
});

// POST endpoint with temporary redirect
app.post('/api/submit', (req, res) => {
  // Temporarily redirect POST to new location
  // Method will be preserved (POST stays POST)
  res.redirect(307, '/api/temp-submit');
});

// Maintenance mode with method preservation
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Preserve method during maintenance redirect
    return res.redirect(307, '/maintenance');
  }
  next();
});

// Load balancing redirect
app.all('/api/load-balanced', (req, res) => {
  const server = selectServer(); // Load balancing logic
  res.redirect(307, \`http://\${server}/api/load-balanced\`);
});

// Temporary location change
app.all('/api/old-location', (req, res) => {
  res.status(307)
    .set('Location', '/api/new-location')
    .set('Cache-Control', 'no-cache') // Don't cache temporary redirect
    .end();
});

// Preserve method and body
app.post('/api/migrate', (req, res) => {
  // Temporarily redirect POST with body preserved
  res.status(307)
    .set('Location', '/api/temp-migrate')
    .end();
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Configure 307 Temporary Redirects',
          code: `# Nginx: Configure 307 temporary redirects with method preservation
server {
    listen 80;
    server_name api.example.com;
    
    # Temporary redirect (preserves method)
    location /api/temp-endpoint {
        return 307 /api/temporary-location\$is_args\$args;
    }
    
    # POST redirect (method preserved)
    location = /api/submit {
        if (\$request_method = POST) {
            return 307 /api/temp-submit\$is_args\$args;
        }
        proxy_pass http://backend;
    }
    
    # Maintenance mode redirect
    location / {
        if (\$maintenance_mode = 1) {
            return 307 /maintenance;
        }
        proxy_pass http://backend;
    }
    
    # Load balancing redirect
    location /api/load-balanced {
        set \$backend "server1.example.com";
        if (\$arg_server = "2") {
            set \$backend "server2.example.com";
        }
        return 307 http://\$backend/api/load-balanced\$is_args\$args;
    }
    
    # Temporary redirect with no cache
    location /api/old-location {
        return 307 /api/new-location\$is_args\$args;
        add_header Cache-Control "no-cache" always;
    }
    
    # Note: 307 preserves method, unlike 302 which may change POST to GET`,
        },
      ],
      metaDescription: 'Master 307 Temporary Redirect by preserving HTTP methods, following Location headers correctly, and configuring method-preserving redirects with our troubleshooting guide.',
      relatedCodes: ['302', '308'],
      provider: 'http',
    },
    '308': {
      code: '308',
      name: 'Permanent Redirect',
      description: `Getting a 308 Permanent Redirect means the resource permanently moved to a new URL—follow the Location header using the same HTTP method (POST stays POST, PUT stays PUT) and update all references permanently. This client-side redirect (3xx) is like 301 but preserves the request method. Most common when APIs permanently migrate endpoints and method must be preserved, but also appears when domains permanently change, URL structures are permanently restructured, or permanent redirects with method preservation are needed.`,
      causes: [
        `Frontend: Old URL still in use. Bookmarks point to deprecated endpoint. Application code uses outdated API URL. Client hasn't updated to new endpoint.`,
        `Backend: Resource permanently moved. API endpoint permanently migrated. Domain permanently changed. URL structure permanently restructured.`,
        `Infrastructure: Domain permanently migrated. CDN permanently redirects. Load balancer permanently routes. Reverse proxy permanent redirect.`,
      ],
      solutions: [
        `Step 1: Diagnose - Check DevTools Network tab Location header—308 responses show the new permanent URL. Review redirect chain. Check if redirect is actually permanent.`,
        `Step 2: Diagnose - Server logs show redirect configuration. Review permanent redirect rules. Check if resource actually moved. Verify new URL is correct.`,
        `Step 3: Fix - Client-side: Update all references to new URL permanently. Update bookmarks and saved URLs. Change API base URL in code. Update client configuration.`,
        `Step 4: Fix - Server-side: Configure 308 redirect with correct Location header. Ensure new URL is accessible. Set proper cache headers. Update documentation.`,
        `Step 5: Fix - Infrastructure: Update DNS if domain changed. Configure CDN permanent redirects. Update load balancer routing. Set reverse proxy redirects.`,
      ],
      codeExamples: [
        {
          language: 'javascript',
          title: 'Fetch API: Handle 308 Permanent Redirects',
          code: `// Client-side: Handle 308 with method preservation and permanent update
async function fetchWithPermanentRedirect(url, method = 'GET', body = null) {
  let response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : null,
    redirect: 'manual', // Handle redirect manually
  });
  
  if (response.status === 308) {
    const newUrl = response.headers.get('Location');
    console.log('Permanent redirect to:', newUrl);
    
    // Update stored URL permanently
    updateApiBaseUrl(url, newUrl);
    
    // 308 preserves original method (POST stays POST, PUT stays PUT)
    response = await fetch(newUrl, {
      method, // Same method as original
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : null,
    });
  }
  
  return response.json();
}

// Update API base URL permanently
function updateApiBaseUrl(oldUrl, newUrl) {
  // Update in-memory config
  API_BASE_URL = newUrl;
  
  // Update localStorage permanently
  localStorage.setItem('api-base-url', newUrl);
  
  // Update all cached URLs
  const cachedUrls = JSON.parse(localStorage.getItem('cached-urls') || '{}');
  cachedUrls[oldUrl] = newUrl;
  localStorage.setItem('cached-urls', JSON.stringify(cachedUrls));
  
  // Update any stored endpoints
  const endpoints = JSON.parse(localStorage.getItem('endpoints') || '{}');
  Object.keys(endpoints).forEach(key => {
    if (endpoints[key] === oldUrl) {
      endpoints[key] = newUrl;
    }
  });
  localStorage.setItem('endpoints', JSON.stringify(endpoints));
}

// POST request with 308 redirect
async function postWithPermanentRedirect(url, data) {
  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    redirect: 'manual',
  });
  
  if (response.status === 308) {
    const newUrl = response.headers.get('Location');
    updateApiBaseUrl(url, newUrl);
    
    // POST method is preserved
    response = await fetch(newUrl, {
      method: 'POST', // Still POST, not GET
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  
  return response.json();
}

// Usage
fetchWithPermanentRedirect('/api/data', 'POST', { key: 'value' });`,
        },
        {
          language: 'javascript',
          title: 'Express.js: Configure 308 Permanent Redirects',
          code: `// Server-side: Return 308 for permanent redirects with method preservation
const express = require('express');
const app = express();

// Permanent redirect with method preservation
app.all('/api/v1/endpoint', (req, res) => {
  // 308 preserves the HTTP method and is permanent
  res.redirect(308, '/api/v2/endpoint');
});

// POST endpoint with permanent redirect
app.post('/api/v1/submit', (req, res) => {
  // Permanently redirect POST to new location
  // Method will be preserved (POST stays POST)
  res.redirect(308, '/api/v2/submit');
});

// API version migration
app.all('/api/v1/*', (req, res) => {
  const newPath = req.path.replace('/v1', '/v2');
  res.redirect(308, newPath);
});

// Domain migration
app.all('*', (req, res, next) => {
  const host = req.headers.host;
  
  // Permanently redirect old domain to new domain
  if (host === 'old-domain.com') {
    return res.redirect(308, \`https://new-domain.com\${req.url}\`);
  }
  
  next();
});

// URL structure change
app.all('/api/old-structure/:id', (req, res) => {
  const newUrl = \`/api/new-structure/\${req.params.id}\`;
  res.redirect(308, newUrl);
});

// Permanent redirect with cache headers
app.all('/api/legacy', (req, res) => {
  res.status(308)
    .set('Location', '/api/modern')
    .set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    .end();
});`,
        },
        {
          language: 'nginx',
          title: 'Nginx: Configure 308 Permanent Redirects',
          code: `# Nginx: Configure 308 permanent redirects with method preservation
server {
    listen 80;
    server_name old-domain.com;
    
    # Permanent redirect entire domain (preserves method)
    return 308 https://new-domain.com\$request_uri;
}

server {
    listen 80;
    server_name api.example.com;
    
    # Permanent redirect with method preservation
    location /api/v1/endpoint {
        return 308 /api/v2/endpoint\$is_args\$args;
    }
    
    # POST endpoint permanent redirect
    location = /api/v1/submit {
        return 308 /api/v2/submit\$is_args\$args;
    }
    
    # API version migration
    location ~ ^/api/v1/(.+)$ {
        return 308 /api/v2/\$1\$is_args\$args;
    }
    
    # URL structure change
    location ~ ^/api/old-structure/(.+)$ {
        return 308 /api/new-structure/\$1\$is_args\$args;
    }
    
    # Permanent redirect with cache headers
    location /api/legacy {
        return 308 /api/modern\$is_args\$args;
        add_header Cache-Control "public, max-age=31536000" always;
    }
    
    # Or use rewrite for permanent redirect
    location /api/old {
        rewrite ^/api/old(.*)$ /api/new\$1 permanent;
    }
    
    # Note: 308 preserves method, unlike 301 which may change POST to GET`,
        },
      ],
      metaDescription: 'Debug 308 Permanent Redirect by updating URL references permanently, preserving HTTP methods, and configuring method-preserving redirects with our expert guide.',
      relatedCodes: ['301', '307'],
      provider: 'http',
    },
};