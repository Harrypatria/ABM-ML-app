"""
Pydantic v2 schemas for Attrition Predictor Pro API
IBM HR Analytics Employee Attrition Model
"""
from typing import List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict
import uuid


class EmployeeFeatures(BaseModel):
    # Demographics
    age: int = Field(default=35, ge=18, le=65, description="Employee Age")
    gender: Literal["Male", "Female"] = Field(default="Male")
    marital_status: Literal["Single", "Married", "Divorced"] = Field(default="Single")
    distance_from_home: int = Field(default=8, ge=1, le=50, description="Distance from home in miles")

    # Job Characteristics
    department: Literal["Sales", "Research & Development", "Human Resources"] = Field(default="Research & Development")
    job_role: Literal[
        "Sales Executive",
        "Research Scientist",
        "Laboratory Technician",
        "Manufacturing Director",
        "Healthcare Representative",
        "Manager",
        "Sales Representative",
        "Research Director",
        "Human Resources",
    ] = Field(default="Laboratory Technician")
    job_level: int = Field(default=2, ge=1, le=5)
    job_involvement: int = Field(default=3, ge=1, le=4)

    # Compensation
    monthly_income: int = Field(default=4500, ge=1000, le=25000)
    stock_option_level: int = Field(default=0, ge=0, le=3)
    percent_salary_hike: int = Field(default=13, ge=10, le=30)

    # Satisfaction
    job_satisfaction: int = Field(default=2, ge=1, le=4)
    work_life_balance: int = Field(default=2, ge=1, le=4)
    environment_satisfaction: int = Field(default=2, ge=1, le=4)
    relationship_satisfaction: int = Field(default=3, ge=1, le=4)

    # Tenure & Experience
    years_at_company: int = Field(default=3, ge=0, le=40)
    years_in_role: int = Field(default=2, ge=0, le=20)
    years_since_last_promotion: int = Field(default=1, ge=0, le=15)
    years_with_curr_manager: int = Field(default=2, ge=0, le=20)
    total_working_years: int = Field(default=8, ge=0, le=40)
    num_companies_worked: int = Field(default=3, ge=0, le=10)

    # Performance & Workload
    performance_rating: int = Field(default=3, ge=1, le=4)
    training_times_last_year: int = Field(default=2, ge=0, le=6)
    over_time: Literal["Yes", "No"] = Field(default="Yes")
    business_travel: Literal["Non-Travel", "Travel_Rarely", "Travel_Frequently"] = Field(default="Travel_Frequently")

    model_config = ConfigDict(extra="ignore")


class PredictionRequest(EmployeeFeatures):
    employee_id: Optional[str] = Field(default_factory=lambda: f"EMP-{uuid.uuid4().hex[:6].upper()}")
    employee_name: Optional[str] = Field(default="Employee Record")


class RiskFactor(BaseModel):
    feature: str
    impact: float
    direction: Literal["increases", "decreases"]
    feature_value: Optional[str] = None
    description: Optional[str] = None


class PredictionResponse(BaseModel):
    employee_id: str
    employee_name: Optional[str] = None
    attrition_probability: float = Field(ge=0.0, le=1.0)
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    top_risk_factors: List[RiskFactor]
    suggested_interventions: List[str]
    prediction_id: str
    model_version: str = "1.0.0"


class ModelMetricsResponse(BaseModel):
    model_name: str
    auc_roc: float
    f1_score: float
    precision: float
    recall: float
    accuracy: float
    trained_at: str
    dataset_rows: int
    positive_class_ratio: float
    top_features: List[dict]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
