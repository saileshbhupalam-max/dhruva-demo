/**
 * Dhruva API Service
 * Connects demo frontend to real FastAPI backend ML pipeline
 * Multi-URL fallback strategy for resilience
 */

// Debug logging prefix
const DEBUG_PREFIX = '[DHRUVA-API]';

// Fallback URLs to try in order (primary first, then fallbacks)
const BACKEND_URLS = [
  // Primary Railway URL (regenerated 2024-11-27)
  'https://web-production-fefe0.up.railway.app',
  // Old Railway URL (kept as fallback)
  'https://web-production-9dfcb.up.railway.app',
  // Alternative Railway URLs (if redeployed)
  'https://dhruva-backend-production.up.railway.app',
  // Render fallback (if deployed there)
  'https://dhruva-backend.onrender.com',
];

// API Configuration - returns list of URLs to try
const getApiUrls = (): string[] => {
  console.log(`${DEBUG_PREFIX} getApiUrls() called`);
  console.log(`${DEBUG_PREFIX} VITE_API_URL:`, import.meta.env.VITE_API_URL);
  console.log(`${DEBUG_PREFIX} VITE_RAILWAY_URL:`, import.meta.env.VITE_RAILWAY_URL);
  console.log(`${DEBUG_PREFIX} PROD mode:`, import.meta.env.PROD);

  const urls: string[] = [];

  // Check for environment variable first (highest priority)
  if (import.meta.env.VITE_API_URL) {
    console.log(`${DEBUG_PREFIX} Adding VITE_API_URL:`, import.meta.env.VITE_API_URL);
    urls.push(import.meta.env.VITE_API_URL);
  }

  // Add custom Railway URL if set
  if (import.meta.env.VITE_RAILWAY_URL) {
    console.log(`${DEBUG_PREFIX} Adding VITE_RAILWAY_URL:`, import.meta.env.VITE_RAILWAY_URL);
    urls.push(import.meta.env.VITE_RAILWAY_URL);
  }

  // Production: add fallback URLs
  if (import.meta.env.PROD) {
    console.log(`${DEBUG_PREFIX} Adding production fallback URLs`);
    urls.push(...BACKEND_URLS);
  } else {
    // Local development - try localhost first, then remote fallbacks
    console.log(`${DEBUG_PREFIX} Adding localhost:8000 for development`);
    urls.push('http://localhost:8000');
    urls.push(...BACKEND_URLS);
  }

  // Remove duplicates
  const uniqueUrls = [...new Set(urls)];
  console.log(`${DEBUG_PREFIX} Final URL list:`, uniqueUrls);
  return uniqueUrls;
};

export const API_URLS = getApiUrls();
export const API_URL = API_URLS[0]; // Primary URL for backwards compatibility
console.log(`${DEBUG_PREFIX} Primary API_URL:`, API_URL);

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
  private fallbackUrls: string[];
  private timeout: number = 15000; // 15 second timeout
  private workingUrl: string | null = null; // Cache the working URL

  constructor() {
    this.baseUrl = API_URL;
    this.fallbackUrls = API_URLS;
  }

  /**
   * Update base URL (useful for switching between local/production)
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
    this.workingUrl = null; // Reset cache when URL changes
  }

  /**
   * Get the current working URL (cached after successful health check)
   */
  getWorkingUrl(): string {
    return this.workingUrl || this.baseUrl;
  }

  /**
   * Try to fetch from a single URL with timeout
   */
  private async tryHealthCheck(url: string, timeoutMs: number = 5000): Promise<{ healthy: boolean; details?: MLHealthResponse; url: string }> {
    const healthUrl = `${url}/api/v1/ml/health`;
    console.log(`${DEBUG_PREFIX} Trying health check at:`, healthUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(healthUrl, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log(`${DEBUG_PREFIX} ${url} - Response status:`, response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`${DEBUG_PREFIX} ${url} - Response data:`, data);
        const isHealthy = data.status === 'healthy' || data.status === 'degraded';
        return { healthy: isHealthy, details: data, url };
      }
      return { healthy: false, url };
    } catch (error) {
      console.log(`${DEBUG_PREFIX} ${url} - Failed:`, error instanceof Error ? error.message : String(error));
      return { healthy: false, url };
    }
  }

  /**
   * Check if backend is available - tries multiple URLs with fallback
   */
  async healthCheck(): Promise<{ healthy: boolean; details?: MLHealthResponse }> {
    console.log(`${DEBUG_PREFIX} healthCheck() starting with multi-URL fallback...`);
    console.log(`${DEBUG_PREFIX} URLs to try:`, this.fallbackUrls);

    // If we have a cached working URL, try it first
    if (this.workingUrl) {
      console.log(`${DEBUG_PREFIX} Trying cached working URL first:`, this.workingUrl);
      const result = await this.tryHealthCheck(this.workingUrl, 3000);
      if (result.healthy) {
        console.log(`${DEBUG_PREFIX} Cached URL still works!`);
        return { healthy: true, details: result.details };
      }
      console.log(`${DEBUG_PREFIX} Cached URL failed, trying fallbacks...`);
      this.workingUrl = null;
    }

    // Try each URL in order
    for (const url of this.fallbackUrls) {
      const result = await this.tryHealthCheck(url, 5000);
      if (result.healthy) {
        console.log(`${DEBUG_PREFIX} SUCCESS! Found working URL:`, url);
        this.workingUrl = url;
        this.baseUrl = url;
        return { healthy: true, details: result.details };
      }
    }

    console.log(`${DEBUG_PREFIX} All URLs failed, backend unavailable`);
    return { healthy: false };
  }

  /**
   * Full grievance analysis through ML pipeline
   */
  async analyzeGrievance(
    text: string,
    citizenId?: string,
    location?: string
  ): Promise<AnalyzeResponse> {
    const workingUrl = this.getWorkingUrl();
    const analyzeUrl = `${workingUrl}/api/v1/ml/analyze`;
    console.log(`${DEBUG_PREFIX} analyzeGrievance() starting...`);
    console.log(`${DEBUG_PREFIX} Using working URL:`, workingUrl);
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
    const response = await fetch(`${this.getWorkingUrl()}/api/v1/ml/classify`, {
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
    const response = await fetch(`${this.getWorkingUrl()}/api/v1/ml/sentiment`, {
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
    const response = await fetch(`${this.getWorkingUrl()}/api/v1/ml/predict-lapse`, {
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
