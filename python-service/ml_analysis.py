import sys
import json
import pandas as pd

from ml_analyzers import (
    get_problem_type,
    get_feature_importance,
    get_ml_readiness,
    get_dataset_insights,
    get_model_recommendation,
    get_baseline_model
)

file_path = sys.argv[1]
target_column = sys.argv[2]

df = pd.read_csv(file_path)

problem_type = get_problem_type(df, target_column)

feature_importance = get_feature_importance(df, target_column, problem_type)

ml_readiness = get_ml_readiness(df)

dataset_insights = get_dataset_insights(
    problem_type,
    ml_readiness,
    feature_importance
)

model_recommendations = get_model_recommendation(
    problem_type
)

baseline_model = get_baseline_model(
    df,
    target_column,
    problem_type
)

result = {
    "problemType": problem_type,
    "featureImportance": feature_importance,
    "mlReadiness": ml_readiness,
    "datasetInsights": dataset_insights,
    "modelRecommendations": model_recommendations,
    "baselineModel": baseline_model
}

print(json.dumps(result))
