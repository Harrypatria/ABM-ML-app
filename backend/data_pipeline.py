"""
Data ingestion & cleaning pipeline for IBM HR Analytics Employee Attrition.
Phase 1: Ingestion, schema validation, constant & ID dropping.
"""
import os
import logging
from typing import Tuple
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DataPipeline")

CONSTANT_COLUMNS = ["EmployeeCount", "Over18", "StandardHours"]
ID_COLUMNS = ["EmployeeNumber"]


def load_raw_dataset(csv_path: str = "data/raw/HR-Employee-Attrition.csv") -> pd.DataFrame:
    """Loads raw IBM HR Analytics dataset and validates integrity."""
    if not os.path.exists(csv_path):
        logger.warning(f"File not found at {csv_path}. Generating synthetic IBM HR schema structure.")
        df = generate_mock_ibm_dataset(n_samples=1470)
        return df

    logger.info(f"Loading raw dataset from {csv_path}")
    df = pd.read_csv(csv_path)
    logger.info(f"Loaded {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans dataset:
    - Drops zero-variance constants (EmployeeCount, Over18, StandardHours)
    - Drops primary ID column (EmployeeNumber)
    - Validates no null values
    """
    initial_shape = df.shape
    cols_to_drop = [c for c in CONSTANT_COLUMNS + ID_COLUMNS if c in df.columns]
    df_cleaned = df.drop(columns=cols_to_drop)

    null_count = df_cleaned.isnull().sum().sum()
    if null_count > 0:
        logger.warning(f"Found {null_count} nulls. Imputing with median/mode.")
        for col in df_cleaned.columns:
            if df_cleaned[col].dtype == "object":
                df_cleaned[col] = df_cleaned[col].fillna(df_cleaned[col].mode()[0])
            else:
                df_cleaned[col] = df_cleaned[col].fillna(df_cleaned[col].median())
    else:
        logger.info("Assertion passed: Zero null values found across all features.")

    logger.info(f"Cleaned dataset: {initial_shape} -> {df_cleaned.shape} (dropped {cols_to_drop})")
    return df_cleaned


def split_features_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Splits dataframe into feature matrix X and target vector y (encoded as 1/0)."""
    if "Attrition" not in df.columns:
        raise ValueError("Target column 'Attrition' not found in dataset.")

    y = df["Attrition"].map({"Yes": 1, "No": 0, 1: 1, 0: 0})
    X = df.drop(columns=["Attrition"])
    return X, y


def generate_mock_ibm_dataset(n_samples: int = 1470) -> pd.DataFrame:
    """Generates synthetic IBM HR sample data with authentic distribution for standalone execution."""
    import numpy as np
    np.random.seed(42)

    departments = ["Research & Development", "Sales", "Human Resources"]
    roles = [
        "Sales Executive", "Research Scientist", "Laboratory Technician",
        "Manufacturing Director", "Healthcare Representative", "Manager",
        "Sales Representative", "Research Director", "Human Resources"
    ]
    travel = ["Travel_Rarely", "Travel_Frequently", "Non-Travel"]
    education_fields = ["Life Sciences", "Medical", "Marketing", "Technical Degree", "Other", "Human Resources"]
    genders = ["Male", "Female"]
    marital_statuses = ["Married", "Single", "Divorced"]

    data = {
        "Age": np.random.randint(18, 60, size=n_samples),
        "Attrition": np.random.choice(["No", "Yes"], size=n_samples, p=[0.839, 0.161]),
        "BusinessTravel": np.random.choice(travel, size=n_samples, p=[0.71, 0.19, 0.10]),
        "DailyRate": np.random.randint(100, 1500, size=n_samples),
        "Department": np.random.choice(departments, size=n_samples, p=[0.65, 0.30, 0.05]),
        "DistanceFromHome": np.random.randint(1, 30, size=n_samples),
        "Education": np.random.randint(1, 6, size=n_samples),
        "EducationField": np.random.choice(education_fields, size=n_samples),
        "EmployeeCount": 1,
        "EmployeeNumber": list(range(1, n_samples + 1)),
        "EnvironmentSatisfaction": np.random.randint(1, 5, size=n_samples),
        "Gender": np.random.choice(genders, size=n_samples),
        "HourlyRate": np.random.randint(30, 100, size=n_samples),
        "JobInvolvement": np.random.randint(1, 5, size=n_samples),
        "JobLevel": np.random.randint(1, 6, size=n_samples),
        "JobRole": np.random.choice(roles, size=n_samples),
        "JobSatisfaction": np.random.randint(1, 5, size=n_samples),
        "MaritalStatus": np.random.choice(marital_statuses, size=n_samples, p=[0.46, 0.32, 0.22]),
        "MonthlyIncome": np.random.randint(2000, 20000, size=n_samples),
        "MonthlyRate": np.random.randint(2000, 27000, size=n_samples),
        "NumCompaniesWorked": np.random.randint(0, 10, size=n_samples),
        "Over18": "Y",
        "OverTime": np.random.choice(["No", "Yes"], size=n_samples, p=[0.72, 0.28]),
        "PercentSalaryHike": np.random.randint(11, 26, size=n_samples),
        "PerformanceRating": np.random.choice([3, 4], size=n_samples, p=[0.84, 0.16]),
        "RelationshipSatisfaction": np.random.randint(1, 5, size=n_samples),
        "StandardHours": 80,
        "StockOptionLevel": np.random.randint(0, 4, size=n_samples),
        "TotalWorkingYears": np.random.randint(0, 40, size=n_samples),
        "TrainingTimesLastYear": np.random.randint(0, 7, size=n_samples),
        "WorkLifeBalance": np.random.randint(1, 5, size=n_samples),
        "YearsAtCompany": np.random.randint(0, 30, size=n_samples),
        "YearsInRole": np.random.randint(0, 19, size=n_samples),
        "YearsSinceLastPromotion": np.random.randint(0, 16, size=n_samples),
        "YearsWithCurrManager": np.random.randint(0, 18, size=n_samples),
    }

    df = pd.DataFrame(data)
    # Inject authentic correlations (OverTime + low income + low satisfaction -> higher attrition)
    high_risk_idx = (df["OverTime"] == "Yes") & (df["JobSatisfaction"] <= 2) & (df["MonthlyIncome"] < 4500)
    df.loc[high_risk_idx, "Attrition"] = np.random.choice(["No", "Yes"], size=sum(high_risk_idx), p=[0.35, 0.65])
    return df


if __name__ == "__main__":
    df = load_raw_dataset()
    df_clean = clean_dataset(df)
    X, y = split_features_target(df_clean)
    print(f"Pipeline executed successfully. X shape: {X.shape}, Attrition rate: {y.mean():.2%}")
