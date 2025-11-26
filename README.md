# Dhruva - AI-Powered Grievance Redressal System

**Live Demo:** [https://dhruva-demo.vercel.app](https://dhruva-demo.vercel.app)

Dhruva is an intelligent grievance redressal system designed for Andhra Pradesh, featuring real-time ML classification, distress detection, and multi-stakeholder views.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                        │
│                  https://dhruva-demo.vercel.app                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Citizen   │  │   Officer   │  │     Policymaker         │ │
│  │    View     │  │    View     │  │        View             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                            │                                     │
│                    React + TypeScript + Tailwind                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS API Calls
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Railway)                         │
│            https://web-production-9dfcb.up.railway.app          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     FastAPI + Uvicorn                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     ML Pipeline                           │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │  │
│  │  │   Telugu    │ │  Sentiment  │ │  Classification     │ │  │
│  │  │ Classifier  │ │  Analyzer   │ │  Fallback           │ │  │
│  │  │   (v3)      │ │             │ │                     │ │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### For Citizens
- Submit grievances in Telugu or English
- Real-time AI classification and routing
- Track grievance status
- Receive acknowledgment with SLA timeline

### For Officers
- AI-assisted case queue with priority scoring
- Distress level indicators (CRITICAL/HIGH/MEDIUM/NORMAL)
- Similar case matching for faster resolution
- Lapse risk prediction

### For Policymakers
- Aggregate analytics dashboard
- Trend analysis
- Proactive alert system

## ML Pipeline Components

| Component | Status | Description |
|-----------|--------|-------------|
| Telugu Classifier v3 | Active | Department classification for Telugu text |
| Sentiment Analyzer | Active | Distress level detection (CRITICAL/HIGH/MEDIUM/NORMAL) |
| Classification Fallback | Active | Keyword-based fallback when primary model uncertain |
| Lapse Predictor | Degraded | Predicts SLA compliance risk |

## API Endpoints

### Health Check
```bash
GET /api/v1/ml/health
```

### Full Analysis
```bash
POST /api/v1/ml/analyze
Content-Type: application/json

{
  "text": "నా పెన్షన్ 6 నెలలుగా రాలేదు",
  "citizen_id": "CIT001",
  "location": "Guntur"
}
```

Response includes:
- Department classification with confidence
- Distress level detection
- SLA calculation
- Lapse risk prediction
- Similar cases
- Recommended actions
- Response template (Telugu/English)

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Clone repository
git clone https://github.com/saileshbhupalam-max/dhruva-demo.git
cd dhruva-demo

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
```bash
# .env.local
VITE_API_URL=http://localhost:8000  # For local backend
# Or use production backend:
# VITE_API_URL=https://web-production-9dfcb.up.railway.app
```

## Deployment

### Frontend (Vercel)
- Auto-deploys on push to `master` branch
- Build command: `npm run build`
- Output directory: `dist`

### Backend (Railway)
- Deployed at: `https://web-production-9dfcb.up.railway.app`
- Uses `run.py` for PORT environment variable handling

## Debugging

The application includes comprehensive debug logging. Open browser console (F12) to see:

```
[DHRUVA-API] getApiUrl() called
[DHRUVA-API] Final API_URL: https://web-production-9dfcb.up.railway.app
[DEMO-CONTEXT] useEffect - checking backend health on mount
[DEMO-CONTEXT] Backend IS healthy - clearing error
[DEMO-CONTEXT] *** USING REAL API ***
```

## Mode Indicators

- **Real ML**: Connected to Railway backend, using actual ML models
- **Simulation**: Using local fallback simulation (when backend unavailable)

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Framer Motion

### Backend
- FastAPI
- Python 3.11
- scikit-learn / PyTorch
- Uvicorn

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details.
