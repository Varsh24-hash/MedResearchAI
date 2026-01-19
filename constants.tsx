
import { Category } from './types';

export const DISEASE_LIST = {
  [Category.GENETIC]: [
    "Becker Muscular Dystrophy", "Cystic Fibrosis", "Down Syndrome",
    "Duchenne Muscular Dystrophy", "Gaucher Disease", "Hemophilia",
    "Klinefelter Syndrome", "Porphyria", "Smith-Lemli-Opitz Syndrome",
    "Turner Syndrome"
  ],
  [Category.SEXUAL]: [
    "Cervical Cancer", "Chlamydia", "Endometriosis", "Erectile Dysfunction",
    "HIV", "Infertility", "Pelvic Inflammatory Disease (PID)",
    "Polycystic Ovary Syndrome (PCOS)", "Prostate Cancer", "Syphilis"
  ],
  [Category.MENTAL]: [
    "Anorexia Nervosa", "ADHD", "Bipolar Disorder", "Generalized Anxiety Disorder",
    "Kleptomania", "Major Depressive Disorder", "OCD", "Schizophrenia",
    "Social Anxiety Disorder", "Alcohol Use Disorder"
  ]
};

const COMMON_PARAMS = ["age", "gender", "height_cm", "weight_kg", "bmi"];

export const PARAMETER_LIST = {
  [Category.GENETIC]: [...COMMON_PARAMS, "gene_marker_A", "gene_marker_B", "gene_marker_C", "genetic_mutation_count", "genetic_risk_score"],
  [Category.SEXUAL]: [...COMMON_PARAMS, "sexual_activity_score", "std_test_positive", "contraceptive_use", "sexual_health_index"],
  [Category.MENTAL]: [...COMMON_PARAMS, "stress_level", "depression_score", "anxiety_score", "therapy_sessions", "sleep_hours", "mental_health_index"]
};
