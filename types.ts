
export enum Category {
  GENETIC = 'Genetic',
  SEXUAL = 'Sexual',
  MENTAL = 'Mental'
}

export interface WeightData {
  parameter: string;
  global_weight: number;
  local_weight: number;
  global_scaled: number;
  local_scaled: number;
  direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface BackendResponse {
  status: string;
  features: WeightData[];
  bias_flag: boolean;
  normalization: string;
}

export interface DiseaseAnalysis {
  id: string;
  name: string;
  category: Category;
  backendData: BackendResponse;
  // Computed for UI shorthand
  topPositive: WeightData;
  topNegative: WeightData;
}

export interface PatientRecord {
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  bmi: number;
  [key: string]: string | number;
}
