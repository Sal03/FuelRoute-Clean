# 🚛 FuelRoute-Pro

**FuelRoute-Pro** is a smart fuel transportation cost estimator that calculates route-based costs across truck, rail, and ship modes. It intelligently evaluates distances, commodity weights, and transit times to give users actionable insights into fuel logistics.

---

## 🔍 What It Does

- 🚚 Calculate transport cost per tonne–mile
- 🌐 Support global routes using geo-coordinates
- 📊 Estimate transit duration based on real-world constraints
- 🤖 Integrate with AI models via Ollama for deeper insights
- ⚙️ Compare routes and optimize decision-making
- 🎯 Choose lowest cost or shortest distance preference

## Configuration

Set `OPENAI_PRICE_CACHE_MS` to control how long fuel price estimates are cached.
The default is 900000 (15 minutes). Use `0` to disable caching entirely.
