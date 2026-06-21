import sys
import json
import pandas as pd

from analyzers import (
    get_overview,
    get_data_types,
    get_missing_values,
    get_duplicate_count,
    get_feature_summary,
    get_missing_percentage,
    get_numeric_statistics,
    get_class_imbalance,
    get_correlations,
    get_outliers,
    get_health_score,
    get_recommendations,
    get_target_analysis
)

file_path = sys.argv[1]

df = pd.read_csv(file_path)

overview = get_overview(df)

data_types = get_data_types(df)

missing_values = get_missing_values(df)

duplicate_rows = get_duplicate_count(df)

feature_summary = get_feature_summary(df)

missing_percentage = get_missing_percentage(df)

statistics = get_numeric_statistics(df)

class_imbalance = get_class_imbalance(df)

correlations = get_correlations(df)

outliers = get_outliers(df)

health_score = get_health_score(missing_percentage,
    duplicate_rows,
    outliers,
    class_imbalance)

recommendations = get_recommendations(missing_percentage,
    duplicate_rows,
    outliers,
    correlations)

target_analysis = get_target_analysis(df)


result = {
    **overview,
    "dataTypes": data_types,
    "missingValues": missing_values,
    "missingPercentage": missing_percentage,
    "duplicateRows": duplicate_rows,
    **feature_summary,
    "statistics": statistics,
    "classImbalance": class_imbalance,
    "correlations": correlations,
    "outliers": outliers,
    "healthScore": health_score,
    "recommendations": recommendations,
    "targetAnalysis": target_analysis
}

print(json.dumps(result))