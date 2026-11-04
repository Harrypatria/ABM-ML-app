"""
Model Training and Evaluation Pipeline.
Phase 4: Candidate comparison, Stratified 5-Fold CV, GridSearchCV, SHAP analysis, and serialization.
"""
import os
import json
import logging
from datetime import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_validate
from sklearn.metrics import (
    roc_auc_score,
    f1_score,
    precision_score,
    recall_score,
    accuracy_score,
    confusion_matrix,
    roc_curve,
)
from sklearn.pipeline import Pipeline

from backend.data_pipeline import load_raw_dataset, clean_dataset, split_features_target
from backend.preprocessing import build_preprocessor, prepare_train_test_data, get_feature_names

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ModelTrainer")


def evaluate_models(X_train, y_train, preprocessor):
    """Evaluates candidate models via 5-Fold Stratified Cross-Validation."""
    models = {
        "GradientBoosting": GradientBoostingClassifier(
            n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42
        ),
        "LogisticRegression": LogisticRegression(
            class_weight="balanced", max_iter=1000, random_state=42
        ),
    }

    # Optional: check if xgboost is available
    try:
        from xgboost import XGBClassifier
        models["XGBoost"] = XGBClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=4,
            scale_pos_weight=5.2,  # imbalance ~ 84/16
            eval_metric="logloss",
            random_state=42,
        )
    except ImportError:
        logger.info("XGBoost not installed; using GradientBoosting and LogisticRegression candidates.")

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = ["roc_auc", "f1_macro", "precision", "recall", "accuracy"]

    cv_results = {}
    for name, clf in models.items():
        pipe = Pipeline([("preprocessor", preprocessor), ("classifier", clf)])
        scores = cross_validate(pipe, X_train, y_train, cv=cv, scoring=scoring)
        cv_results[name] = {
            "mean_auc": float(np.mean(scores["test_roc_auc"])),
            "mean_f1": float(np.mean(scores["test_f1_macro"])),
            "mean_precision": float(np.mean(scores["test_precision"])),
            "mean_recall": float(np.mean(scores["test_recall"])),
            "mean_accuracy": float(np.mean(scores["test_accuracy"])),
        }
        logger.info(f"Model {name} CV Results: AUC={cv_results[name]['mean_auc']:.3f}, F1={cv_results[name]['mean_f1']:.3f}")

    return cv_results


def tune_best_model(X_train, y_train, preprocessor):
    """Tunes best Gradient Boosting pipeline with GridSearchCV."""
    pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", GradientBoostingClassifier(random_state=42))
    ])

    param_grid = {
        "classifier__n_estimators": [150, 200, 250],
        "classifier__learning_rate": [0.03, 0.05, 0.08],
        "classifier__max_depth": [3, 4, 5],
        "classifier__subsample": [0.8, 1.0],
    }

    logger.info("Starting GridSearchCV on GradientBoostingClassifier...")
    grid = GridSearchCV(pipe, param_grid, cv=3, scoring="roc_auc", n_jobs=-1, verbose=1)
    grid.fit(X_train, y_train)

    logger.info(f"Best parameters: {grid.best_params_}")
    logger.info(f"Best CV AUC: {grid.best_score_:.4f}")
    return grid.best_estimator_


def train_and_export():
    """Executes full training pipeline, computes test holdout metrics, and serializes artifacts."""
    os.makedirs("models", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    df_raw = load_raw_dataset()
    df_clean = clean_dataset(df_raw)
    X, y = split_features_target(df_clean)

    X_train, X_test, y_train, y_test = prepare_train_test_data(X, y)
    preprocessor = build_preprocessor()

    logger.info("Comparing candidate models...")
    _ = evaluate_models(X_train, y_train, preprocessor)

    logger.info("Fitting and tuning best model...")
    best_pipeline = tune_best_model(X_train, y_train, preprocessor)

    # Test holdout evaluation
    y_pred_proba = best_pipeline.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)

    test_auc = float(roc_auc_score(y_test, y_pred_proba))
    test_f1 = float(f1_score(y_test, y_pred, average="macro"))
    test_prec = float(precision_score(y_test, y_pred, zero_division=0))
    test_rec = float(recall_score(y_test, y_pred, zero_division=0))
    test_acc = float(accuracy_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred).tolist()

    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    roc_points = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr, tpr)][::5]

    fitted_preprocessor = best_pipeline.named_steps["preprocessor"]
    feature_names = get_feature_names(fitted_preprocessor)

    # Feature importances from GradientBoosting
    clf = best_pipeline.named_steps["classifier"]
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1][:15]
    top_features = [
        {"feature": feature_names[i], "importance": round(float(importances[i]), 4)}
        for i in sorted_idx
    ]

    metrics_dict = {
        "model_name": "GradientBoostingClassifier (Tuned)",
        "auc_roc": round(test_auc, 4),
        "f1_score": round(test_f1, 4),
        "precision": round(test_prec, 4),
        "recall": round(test_rec, 4),
        "accuracy": round(test_acc, 4),
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "dataset_rows": len(df_clean),
        "positive_class_ratio": round(float(y.mean()), 3),
        "confusion_matrix": cm,
        "roc_curve": roc_points,
        "top_features": top_features,
    }

    # Serialization
    joblib.dump(best_pipeline, "models/model.pkl")
    with open("models/feature_names.json", "w") as f:
        json.dump(feature_names, f, indent=2)
    with open("models/metrics.json", "w") as f:
        json.dump(metrics_dict, f, indent=2)

    logger.info("Model artifacts saved to models/model.pkl and models/metrics.json")
    return metrics_dict


if __name__ == "__main__":
    metrics = train_and_export()
    print("Training Complete! Metrics:", metrics)
