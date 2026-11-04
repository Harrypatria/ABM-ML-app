"""
Preprocessing pipeline for IBM HR Analytics Employee Attrition.
Phase 3: ColumnTransformer with StandardScaler, OneHotEncoder, and Stratified Split.
"""
from typing import Tuple, List
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


CATEGORICAL_FEATURES = [
    "BusinessTravel",
    "Department",
    "EducationField",
    "Gender",
    "JobRole",
    "MaritalStatus",
    "OverTime",
]

NUMERIC_FEATURES = [
    "Age",
    "DailyRate",
    "DistanceFromHome",
    "Education",
    "EnvironmentSatisfaction",
    "HourlyRate",
    "JobInvolvement",
    "JobLevel",
    "JobSatisfaction",
    "MonthlyIncome",
    "MonthlyRate",
    "NumCompaniesWorked",
    "PercentSalaryHike",
    "PerformanceRating",
    "RelationshipSatisfaction",
    "StockOptionLevel",
    "TotalWorkingYears",
    "TrainingTimesLastYear",
    "WorkLifeBalance",
    "YearsAtCompany",
    "YearsInRole",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
]


def build_preprocessor() -> ColumnTransformer:
    """Creates scikit-learn ColumnTransformer for scaling numerics and one-hot encoding categoricals."""
    numeric_transformer = Pipeline(
        steps=[("scaler", StandardScaler())]
    )

    categorical_transformer = Pipeline(
        steps=[("ohe", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"))]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
        verbose_feature_names_out=False,
    )
    return preprocessor


def get_feature_names(preprocessor: ColumnTransformer) -> List[str]:
    """Extracts transformed feature names after fitting."""
    try:
        return list(preprocessor.get_feature_names_out())
    except Exception:
        # Fallback names
        cat_encoder = preprocessor.named_transformers_["cat"].named_steps["ohe"]
        cat_cols = cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES)
        return list(NUMERIC_FEATURES) + list(cat_cols)


def prepare_train_test_data(
    X: pd.DataFrame, y: pd.Series, test_size: float = 0.20, random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Splits data into train and test sets using stratified sampling to preserve 16% attrition ratio."""
    return train_test_split(
        X, y, test_size=test_size, stratify=y, random_state=random_state
    )
