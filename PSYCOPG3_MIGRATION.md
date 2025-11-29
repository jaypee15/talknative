# Psycopg3 Configuration

This project uses **psycopg3** (`psycopg[binary]`), the latest PostgreSQL adapter for Python.

## What Changed

### Before (psycopg2)
```python
# requirements.txt
psycopg2-binary==2.9.9

# Database URL
postgresql://user:pass@host/db
```

### After (psycopg3)
```python
# requirements.txt
psycopg[binary]==3.2.13

# Database URL (automatically converted)
postgresql://user:pass@host/db  → postgresql+psycopg://user:pass@host/db
```

## How It Works

The code in `app/db/base.py` automatically converts standard PostgreSQL URLs to use the psycopg driver:

```python
# Automatic conversion
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(database_url)
```

## Supported URL Formats

All of these work:

```bash
# Standard format (auto-converted)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Explicit psycopg driver (recommended)
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname

# With SSL mode
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/dbname?sslmode=require

# Supabase example
DATABASE_URL=postgresql+psycopg://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
```

## Benefits of Psycopg3

### Performance
- 🚀 **Faster** - Improved performance over psycopg2
- 🔧 **Better async** - Native async/await support
- 💾 **Memory efficient** - Lower memory footprint

### Modern Python
- ✅ **Type hints** - Full typing support
- ✅ **Python 3.7+** - Modern Python features
- ✅ **Active development** - Regular updates

### Better API
- 🎯 **Cleaner API** - More Pythonic interface
- 🔒 **Better security** - Improved connection handling
- 📦 **Binary package** - No compilation needed with `psycopg[binary]`

## Compatibility

### SQLAlchemy Support
- ✅ SQLAlchemy 1.4+
- ✅ SQLAlchemy 2.0+
- ✅ Alembic migrations

### Connection Pooling
Works with all SQLAlchemy pooling strategies:
- NullPool (default for async)
- QueuePool (default for sync)
- StaticPool

## Configuration Options

### In .env
```bash
# Basic
DATABASE_URL=postgresql://user:pass@localhost:5432/talknatives

# With connection parameters
DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/talknatives?connect_timeout=10

# Supabase (with pooler)
DATABASE_URL=postgresql+psycopg://postgres.xxx:pass@region.pooler.supabase.com:5432/postgres
```

### In Code (if needed)
```python
# Custom engine with psycopg3
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg://user:pass@host/db",
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before use
)
```

## Troubleshooting

### Issue: "No module named 'psycopg2'"
**Cause**: SQLAlchemy is trying to use psycopg2 driver  
**Solution**: Ensure DATABASE_URL uses `postgresql+psycopg://` prefix

### Issue: "could not connect to server"
**Cause**: Database connection issues  
**Solution**: Check your DATABASE_URL and network connectivity

```bash
# Test connection
psql "postgresql://user:pass@host:5432/dbname"
```

### Issue: SSL required
**Cause**: Database requires SSL connections  
**Solution**: Add `sslmode=require` to URL

```bash
DATABASE_URL=postgresql+psycopg://user:pass@host:5432/db?sslmode=require
```

## Migration from psycopg2

If you're migrating from psycopg2, the change is transparent:

### Step 1: Update requirements.txt
```diff
- psycopg2-binary==2.9.9
+ psycopg[binary]==3.2.13
```

### Step 2: Update DATABASE_URL (optional)
```bash
# Old (still works with auto-conversion)
DATABASE_URL=postgresql://user:pass@host/db

# New (explicit)
DATABASE_URL=postgresql+psycopg://user:pass@host/db
```

### Step 3: Rebuild
```bash
docker-compose down
docker-compose up --build
```

## Testing

### Verify Connection
```python
from app.db.base import engine

# Test connection
with engine.connect() as conn:
    result = conn.execute("SELECT 1")
    print(result.fetchone())  # Should print (1,)
```

### Check Driver
```python
print(engine.dialect.driver)  # Should print: 'psycopg'
```

## References

- [Psycopg3 Documentation](https://www.psycopg.org/psycopg3/docs/)
- [SQLAlchemy PostgreSQL Dialects](https://docs.sqlalchemy.org/en/20/dialects/postgresql.html)
- [Migration Guide](https://www.psycopg.org/psycopg3/docs/basic/from_pg2.html)

---

**Current Setup**: psycopg[binary]==3.2.13 with automatic URL conversion  
**Status**: ✅ Production-ready
