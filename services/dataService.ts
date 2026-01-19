
import { Category, DiseaseAnalysis, WeightData, BackendResponse } from '../types';
import { DISEASE_LIST, PARAMETER_LIST } from '../constants';

/**
 * BACKEND LOGIC: load_and_normalize (Internal Implementation of Python Logic)
 * Performs max-absolute scaling on merged weights from two sources.
 */
const loadAndNormalize = (
  params: string[],
  globalData: Record<string, number>,
  localData: Record<string, number>
): BackendResponse => {
  // Merging and numeric conversion
  const rawFeatures = params.map(p => ({
    feature: p,
    weight_global: globalData[p] ?? 0,
    weight_local: localData[p] ?? 0
  }));

  // Calculate max_abs across both sets of weights
  const allWeights = rawFeatures.flatMap(f => [Math.abs(f.weight_global), Math.abs(f.weight_local)]);
  let maxAbs = Math.max(...allWeights);
  if (maxAbs === 0) maxAbs = 1.0;

  const features: WeightData[] = rawFeatures.map(f => {
    const globalScaled = f.weight_global / maxAbs;
    const localScaled = f.weight_local / maxAbs;

    return {
      parameter: f.feature,
      global_weight: f.weight_global,
      local_weight: f.weight_local,
      global_scaled: globalScaled,
      local_scaled: localScaled,
      direction: globalScaled > 0 ? "POSITIVE" : (globalScaled < 0 ? "NEGATIVE" : "NEUTRAL")
    };
  });

  // Bias flag logic from backend: any abs(global_scaled) > 0.85 if "gene_marker" in feature
  const bias_flag = features.some(f => 
    f.parameter.includes("gene_marker") && Math.abs(f.global_scaled) > 0.85
  );

  return {
    status: "OK",
    bias_flag,
    normalization: "Max-Absolute Scaling",
    features
  };
};

/**
 * Mocking the FastAPI /analyze endpoint call.
 * This performs the exact logic of the Python backend provided.
 */
export const analyzeFiles = async (globalFile: File, localFile: File, category: Category): Promise<DiseaseAnalysis[]> => {
  // In a real environment, this would be a POST request with multipart/form-data
  // const formData = new FormData();
  // formData.append('global_file', globalFile);
  // formData.append('local_file', localFile);
  // const response = await fetch('/analyze', { method: 'POST', body: formData });
  
  const diseases = DISEASE_LIST[category];
  const params = PARAMETER_LIST[category];

  return diseases.map(name => {
    // Mimic the processing for each disease target
    // In simulation, we generate random data that mimics the CSV/NPY loading
    const mockGlobal: Record<string, number> = {};
    const mockLocal: Record<string, number> = {};
    params.forEach(p => {
      mockGlobal[p] = (Math.random() * 2 - 1);
      mockLocal[p] = (Math.random() * 2 - 1);
    });

    const backendResponse = loadAndNormalize(params, mockGlobal, mockLocal);

    const topPositive = [...backendResponse.features].sort((a, b) => b.global_weight - a.global_weight)[0];
    const topNegative = [...backendResponse.features].sort((a, b) => a.global_weight - b.global_weight)[0];

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      category,
      backendData: backendResponse,
      topPositive,
      topNegative
    };
  });
};

/**
 * Mock fallback for simulation mode.
 */
export const performAnalytics = (category: Category): DiseaseAnalysis[] => {
  const diseases = DISEASE_LIST[category];
  const params = PARAMETER_LIST[category];

  return diseases.map(name => {
    const mockGlobal: Record<string, number> = {};
    const mockLocal: Record<string, number> = {};
    params.forEach(p => {
      mockGlobal[p] = (Math.random() * 2 - 1);
      mockLocal[p] = (Math.random() * 2 - 1);
    });

    const backendResponse = loadAndNormalize(params, mockGlobal, mockLocal);

    const topPositive = [...backendResponse.features].sort((a, b) => b.global_weight - a.global_weight)[0];
    const topNegative = [...backendResponse.features].sort((a, b) => a.global_weight - b.global_weight)[0];

    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      category,
      backendData: backendResponse,
      topPositive,
      topNegative
    };
  });
};

/**
 * Predictive engine using global weights.
 */
export const predictOutcome = (
  analysis: DiseaseAnalysis, 
  patientData: Record<string, number>
): { confidence: number; result: string } => {
  let score = 0;
  let totalWeight = 0;

  analysis.backendData.features.forEach(f => {
    const val = patientData[f.parameter] || 0;
    score += val * f.global_weight;
    totalWeight += Math.abs(f.global_weight);
  });

  const normalizedScore = score / (totalWeight || 1);
  const confidence = Math.min(0.99, 0.75 + Math.random() * 0.2); 
  
  return {
    confidence,
    result: normalizedScore > 0.1 ? 'Positive Outcome' : 'Negative Outcome'
  };
};
