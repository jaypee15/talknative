# 🎙️ Quick TTS Switch Reference

## Switch in 10 Seconds

### Option 1: YarnGPT (Native African Voices) ✅
```bash
echo "TTS_PROVIDER=yarngpt" > backend/.env
```

### Option 2: Gemini TTS (Google Latest) 🚀
```bash
echo "TTS_PROVIDER=gemini" > backend/.env
```

Then restart:
```bash
docker-compose restart backend
```

---

## Voice Comparison

| Language | YarnGPT Voice | Gemini Voice |
|----------|---------------|--------------|
| Yoruba   | Idera         | Kainene      |
| Hausa    | Zainab        | Aoife        |
| Igbo     | Amaka         | Kainene      |

---

## API Keys Required

**YarnGPT Mode:**
- `GOOGLE_API_KEY` ← For ASR/LLM
- `YARNGPT_API_KEY` ← For TTS

**Gemini Mode:**
- `GOOGLE_API_KEY` ← For everything (ASR/LLM/TTS)

---

## Which to Use?

**Choose YarnGPT if:**
- ✅ You have YarnGPT access
- ✅ Need authentic Nigerian pronunciation

**Choose Gemini if:**
- ✅ Single API key setup
- ✅ Testing without YarnGPT
- ✅ Want latest Google tech

---

See `TTS_SWITCHING.md` for complete guide.
