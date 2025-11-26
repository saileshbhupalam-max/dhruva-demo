/**
 * Dhruva API Service
 * Connects demo frontend to real FastAPI backend ML pipeline
 */

// API Configuration
const getApiUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Production Railway URL (will be set after deployment)
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_RAILWAY_URL || 'https://dhruva-backend.railway.app';
  }
  // Local development
  return 'http://localhost:8000';
};

export const API_URL = getApiUrl();

// Types matching backend response
export interface ClassificationResult {
  department: string | null;
  confidence: number;
  method: string | null;
  top_3: Array<{ department: string; confidence: number }>;
  needs_manual_review: boolean;
}

export interface SentimentResult {
  distress_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  confidence: number;
  signals: Array<{ keyword: string; level: string }>;
}

export interface LapsePredictionResult {
  risk_score: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  likely_lapses: Array<{ lapse: string; probability: number }>;
}

export interface SLAResult {
  hours: number;
  deadline: string;
  priority: string;
}

export interface AnalyzeResponse {
  timestamp: string;
  classification: ClassificationResult;
  sentiment: SentimentResult;
  lapse_prediction: LapsePredictionResult;
  sla: SLAResult;
  duplicate_check: {
    is_duplicate: boolean;
    existing_case_id?: string;
    similarity: number;
  };
  similar_cases: Array<{
    case_id: string;
    similarity: number;
    resolution: string;
  }>;
  proactive_alerts: Array<{
    type: string;
    location: string;
    department: string;
    count: number;
  }>;
  recommended_actions: Array<{
    action: string;
    priority: string;
    reason: string;
  }>;
  response_template: {
    telugu: string;
    english: string;
    category: string;
  } | null;
}

export interface MLHealthResponse {
  status: string;
  models_loaded: boolean;
  models: {
    telugu_classifier: boolean;
    sentiment_classifier: boolean;
    lapse_predictor: boolean;
    classification_fallback: boolean;
  };
  knowledge_base_loaded: boolean;
}

// API Service class
class DhruvaAPI {
  private baseUrl: string;
  private timeout: number = 15000; // 15 second timeout

  constructor() {
    this.baseUrl = API_URL;
  }

  /**
   * Update base URL (useful for switching between local/production)
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: MLHealthResponse }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/v1/ml/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return { healthy: true, details: data };
      }
      return { healthy: false };
    } catch {
      return { healthy: false };
    }
  }

  /**
   * Full grievance analysis through ML pipeline
   */
  async analyzeGrievance(
    text: string,
    citizenId?: string,
    location?: string
  ): Promise<AnalyzeResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ml/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          citizen_id: citizenId,
          location,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - backend may be starting up');
      }
      throw error;
    }
  }

  /**
   * Classification only endpoint
   */
  async classifyGrievance(text: string): Promise<ClassificationResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/ml/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Classification failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Sentiment/distress analysis only
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/ml/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Lapse prediction only
   */
  async predictLapse(text: string, department?: string): Promise<LapsePredictionResult> {
    const response = await fetch(`${this.baseUrl}/api/v1/ml/predict-lapse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, department }),
    });

    if (!response.ok) {
      throw new Error(`Lapse prediction failed: ${response.status}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const dhruvaApi = new DhruvaAPI();

// Export for direct usage
export default dhruvaApi;
