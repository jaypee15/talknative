# Development Setup Guide

This project has two Docker Compose configurations:

## 🔥 Development Mode (Hot Reload)

### Quick Start
```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Or use the shorthand
docker-compose -f docker-compose.dev.yml up
```

### Features
✅ **Backend Auto-Reload**
- Code changes instantly reload the server
- No rebuild needed
- Uvicorn `--reload` flag enabled

✅ **Frontend Hot Module Replacement (HMR)**
- Instant UI updates on save
- Vite dev server with HMR
- Fast refresh for React components

✅ **Volume Mounting**
- Your local code is synced to containers
- Edit locally, see changes immediately
- No need to rebuild after code changes

### What's Different

**Backend:**
- Uses `Dockerfile.dev`
- Mounts `./backend` → `/app` (with volume)
- Runs: `uvicorn app.main:app --reload`
- Python cache excluded from sync

**Frontend:**
- Uses `Dockerfile.dev`
- Mounts `./frontend` → `/app` (with volume)
- Runs: `npm run dev --host`
- Preserves `node_modules` in container
- Vite dev server on port 5173

### Access Points
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:8080 (FastAPI with reload)
- **Backend Health**: http://localhost:8080/healthz

### Development Workflow
```bash
# 1. Start dev environment
docker-compose -f docker-compose.dev.yml up

# 2. Edit code in your IDE
# backend/app/api/v1/chat.py
# frontend/src/App.tsx

# 3. Save → Changes appear automatically! ✨

# 4. View logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend

# 5. Stop
docker-compose -f docker-compose.dev.yml down
```

### When to Rebuild

You only need to rebuild if you change:
- ✅ `requirements.txt` (Python dependencies)
- ✅ `package.json` (npm dependencies)
- ✅ Dockerfile itself

```bash
# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build
```

## 🚀 Production Mode (Optimized Build)

### Quick Start
```bash
# Build and run production containers
docker-compose up --build
```

### Features
- ✅ Optimized builds
- ✅ Production-ready Nginx for frontend
- ✅ Smaller image sizes
- ✅ No dev dependencies

### What's Different

**Backend:**
- Uses `Dockerfile` (production)
- Runs migrations on startup
- No auto-reload
- Optimized for deployment

**Frontend:**
- Uses `Dockerfile` (production)
- Multi-stage build (Node → Nginx)
- Serves static files via Nginx
- Port 8080 (maps to 5173 for consistency)

### Access Points
- **Frontend**: http://localhost:5173 (via Nginx)
- **Backend**: http://localhost:8080

### When to Use
- ✅ Testing production builds locally
- ✅ Before deploying to Cloud Run
- ✅ Performance testing

## Comparison

| Feature | Dev Mode | Production Mode |
|---------|----------|-----------------|
| **Hot Reload** | ✅ Yes | ❌ No |
| **Volume Mounting** | ✅ Yes | ❌ No |
| **Build Speed** | Fast (cached) | Slower (optimized) |
| **Image Size** | Larger | Smaller |
| **Frontend Server** | Vite dev | Nginx |
| **Backend Reload** | Auto | Manual |
| **Use Case** | Development | Deployment/Testing |

## File Structure

```
.
├── docker-compose.yml          # Production config
├── docker-compose.dev.yml      # Development config (use this!)
├── backend/
│   ├── Dockerfile              # Production build
│   ├── Dockerfile.dev          # Development build (with reload)
│   └── ...
└── frontend/
    ├── Dockerfile              # Production build (Nginx)
    ├── Dockerfile.dev          # Development build (Vite dev)
    └── ...
```

## Environment Variables

### Development
Create `backend/.env`:
```bash
GOOGLE_API_KEY=your_key_here
YARNGPT_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ALLOW_ORIGINS=["http://localhost:5173"]
TTS_PROVIDER=yarngpt
```

### Production
Same file, but ensure `CORS_ALLOW_ORIGINS` matches your production URL.

## Troubleshooting

### Backend not reloading
```bash
# Check if volume is mounted
docker-compose -f docker-compose.dev.yml exec backend ls -la /app

# Check logs for reload events
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Frontend not hot-reloading
```bash
# Check Vite is running
docker-compose -f docker-compose.dev.yml logs frontend

# Ensure port 5173 is accessible
curl http://localhost:5173
```

### Port conflicts
```bash
# Check what's using ports
lsof -i :8080
lsof -i :5173

# Stop conflicting services
docker-compose -f docker-compose.dev.yml down
```

### Slow on macOS
Docker volumes can be slow on macOS. Consider:
- Use `:cached` or `:delegated` flags
- Or run outside Docker for development

```yaml
volumes:
  - ./backend:/app:cached  # Faster on macOS
```

## Best Practices

### Development
1. **Always use dev compose** for local work
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Keep containers running** - don't restart for code changes

3. **Watch the logs** - see reload events
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

4. **Rebuild only when needed** (dependencies change)

### Before Committing
1. **Test production build**
   ```bash
   docker-compose up --build
   ```

2. **Ensure both modes work**

3. **Check for errors** in production logs

## Quick Reference

```bash
# Development (daily use)
docker-compose -f docker-compose.dev.yml up        # Start dev
docker-compose -f docker-compose.dev.yml down      # Stop dev
docker-compose -f docker-compose.dev.yml logs -f   # Watch logs

# Production (testing)
docker-compose up --build                          # Start prod
docker-compose down                                # Stop prod

# Rebuild dependencies
docker-compose -f docker-compose.dev.yml up --build

# Shell into containers
docker-compose -f docker-compose.dev.yml exec backend bash
docker-compose -f docker-compose.dev.yml exec frontend sh
```

---

**Recommended for Development**: Always use `docker-compose.dev.yml` 🔥
