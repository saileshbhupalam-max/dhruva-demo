/**
 * Dhruva API Service
 * Connects demo frontend to real FastAPI backend ML pipeline
 * Backend: Railway (https://web-production-9dfcb.up.railway.app)
 */

// Debug logging prefix
const DEBUG_PREFIX = '[DHRUVA-API]';

// API Configuration
const getApiUrl = (): string => {
  console.log(`${DEBUG_PREFIX} getApiUrl() called`);
  console.log(`${DEBUG_PREFIX} VITE_API_URL:`, import.meta.env.VITE_API_URL);
  console.log(`${DEBUG_PREFIX} VITE_RAILWAY_URL:`, import.meta.env.VITE_RAILWAY_URL);
  console.log(`${DEBUG_PREFIX} PROD mode:`, import.meta.env.PROD);

  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    console.log(`${DEBUG_PREFIX} Using VITE_API_URL:`, import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  // Production Railway URL
  if (import.meta.env.PROD) {
    const url = import.meta.env.VITE_RAILWAY_URL || 'https://web-production-9dfcb.up.railway.app';
    console.log(`${DEBUG_PREFIX} Using production URL:`, url);
    return url;
  }
  // Local development
  console.log(`${DEBUG_PREFIX} Using localhost:8000`);
  return 'http://localhost:8000';
};

export const API_URL = getApiUrl();
console.log(`${DEBUG_PREFIX} Final API_URL:`, API_URL);

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
    const healthUrl = `${this.baseUrl}/api/v1/ml/health`;
    console.log(`${DEBUG_PREFIX} healthCheck() starting...`);
    console.log(`${DEBUG_PREFIX} Health URL:`, healthUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      console.log(`${DEBUG_PREFIX} Fetching health endpoint...`);
      const response = await fetch(healthUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log(`${DEBUG_PREFIX} Health response status:`, response.status);
      console.log(`${DEBUG_PREFIX} Health response ok:`, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log(`${DEBUG_PREFIX} Health response data:`, data);
        // Consider backend healthy if it responds - even if "degraded"
        // The analyze endpoint will still work with fallback classification
        const isHealthy = data.status === 'healthy' || data.status === 'degraded';
        console.log(`${DEBUG_PREFIX} healthCheck() returning healthy:`, isHealthy);
        return { healthy: isHealthy, details: data };
      }
      console.log(`${DEBUG_PREFIX} healthCheck() returning healthy: false (response not ok)`);
      return { healthy: false };
    } catch (error) {
      console.error(`${DEBUG_PREFIX} healthCheck() CAUGHT ERROR:`, error);
      console.error(`${DEBUG_PREFIX} Error name:`, error instanceof Error ? error.name : 'Unknown');
      console.error(`${DEBUG_PREFIX} Error message:`, error instanceof Error ? error.message : String(error));
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
    const analyzeUrl = `${this.baseUrl}/api/v1/ml/analyze`;
    console.log(`${DEBUG_PREFIX} analyzeGrievance() starting...`);
    console.log(`${DEBUG_PREFIX} Analyze URL:`, analyzeUrl);
    console.log(`${DEBUG_PREFIX} Request body:`, { text: text.substring(0, 50) + '...', citizen_id: citizenId, location });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`${DEBUG_PREFIX} TIMEOUT (${this.timeout}ms) - aborting request`);
      controller.abort();
    }, this.timeout);

    try {
      console.log(`${DEBUG_PREFIX} Fetching analyze endpoint...`);
      const response = await fetch(analyzeUrl, {
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
      console.log(`${DEBUG_PREFIX} Analyze response status:`, response.status);
      console.log(`${DEBUG_PREFIX} Analyze response ok:`, response.ok);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error(`${DEBUG_PREFIX} Analyze API returned error:`, errorBody);
        throw new Error(errorBody.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${DEBUG_PREFIX} Analyze SUCCESS! Response:`, data);
      console.log(`${DEBUG_PREFIX} Classification:`, data.classification?.department, data.classification?.confidence);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`${DEBUG_PREFIX} analyzeGrievance() CAUGHT ERROR:`, error);
      console.error(`${DEBUG_PREFIX} Error name:`, error instanceof Error ? error.name : 'Unknown');
      console.error(`${DEBUG_PREFIX} Error message:`, error instanceof Error ? error.message : String(error));
      console.error(`${DEBUG_PREFIX} Error stack:`, error instanceof Error ? error.stack : 'No stack');

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
