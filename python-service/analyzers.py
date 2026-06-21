import pandas as pd
import sys

def safe_number(value):

    if pd.isna(value):
        return None

    return round(float(value), 2)

def get_overview(df):

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "columnNames": df.columns.tolist()
    }

def get_data_types(df):

    return {
        column: str(dtype)
        for column, dtype in df.dtypes.items()
    }

def get_missing_values(df):

    return (
        df.isnull()
          .sum()
          .to_dict()
    )

def get_duplicate_count(df):

    return int(
        df.duplicated().sum()
    )

def get_feature_summary(df):

    numeric_columns = len(
        df.select_dtypes(include="number").columns
    )

    categorical_columns = len(
        df.select_dtypes(exclude="number").columns
    )

    return {
        "numericColumns": numeric_columns,
        "categoricalColumns": categorical_columns
    }

def get_missing_percentage(df):

    return (
        (df.isnull().sum() / len(df) * 100)
        .round(2)
        .to_dict()
    )

def get_numeric_statistics(df):

    numeric_df = df.select_dtypes(include="number")

    statistics = {}

    for column in numeric_df.columns:

        statistics[column] = {
            "mean": safe_number(numeric_df[column].mean()),
            "median": safe_number(numeric_df[column].median()),
            "min": safe_number(numeric_df[column].min()),
            "max": safe_number(numeric_df[column].max())
        }

    return statistics

def get_class_imbalance(df):
    
    categorical_df = df.select_dtypes(exclude="number")

    result = {}

    for column in categorical_df.columns:

        distribution = (
            categorical_df[column]
            .value_counts(normalize = True)
            .mul(100)
            .round(2)
            .to_dict()
        )

        result[column] = distribution

    return result
    
def get_correlations(df):

    numeric_df = df.select_dtypes(include="number")

    correlation_matrix = numeric_df.corr()

    correlations = []

    for i in range(len(correlation_matrix.columns)):

        for j in range(i + 1, len(correlation_matrix.columns)):

            feature_a = correlation_matrix.columns[i]

            feature_b = correlation_matrix.columns[j]

            correlation = correlation_matrix.iloc[i, j]

            if pd.notna(correlation) and abs(correlation) >= 0.7:

                correlations.append({
                    "featureA": feature_a,
                    "featureB": feature_b,
                    "correlation": round(float(correlation), 2)
                })
    
    correlations.sort(
        key=lambda x: abs(x["correlation"]),
        reverse=True
    )

    return correlations
    
def get_outliers(df):
    numeric_df = df.select_dtypes(include="number")

    outliers = {}

    for column in numeric_df.columns:
        q1 = numeric_df[column].quantile(0.25)

        q3 = numeric_df[column].quantile(0.75)

        iqr = q3 - q1

        lower_bound = q1 - (1.5 * iqr)

        upper_bound = q3 + (1.5 * iqr)
        count = (
            (numeric_df[column] < lower_bound)
            |
            (numeric_df[column] > upper_bound)
        ).sum()

        outliers[column] = int(count)

    return outliers

def get_health_score(
    missing_percentage,
    duplicate_rows,
    outliers,
    class_imbalance
):

    score = 100

    # Missing Values Penalty
    total_missing = sum(
        missing_percentage.values()
    )

    if total_missing > 30:
        score -= 30

    elif total_missing > 10:
        score -= 15

    elif total_missing > 0:
        score -= 5

    # Duplicate Rows Penalty
    if duplicate_rows > 0:
        score -= 10

    # Outlier Penalty
    total_outliers = sum(
        outliers.values()
    )

    if total_outliers > 20:
        score -= 10

    elif total_outliers > 0:
        score -= 5

    # Class Imbalance Penalty
    for distribution in class_imbalance.values():

        largest_class = max(
            distribution.values()
        )

        if largest_class > 90:
            score -= 15

        elif largest_class > 80:
            score -= 10

    score = max(score, 0)

    return {
        "score": score
    }

def get_recommendations(
    missing_percentage,
    duplicate_rows,
    outliers,
    correlations
):

    recommendations = []

    # Missing Values
    for column, percentage in missing_percentage.items():

        if percentage == 100:

            recommendations.append(
                f"Remove '{column}' because it is completely empty."
            )

        elif percentage >= 50:

            recommendations.append(
                f"'{column}' contains {percentage}% missing values and may require cleaning."
            )

    # Duplicates
    if duplicate_rows > 0:

        recommendations.append(
            f"Dataset contains {duplicate_rows} duplicate rows."
        )

    # Outliers
    for column, count in outliers.items():

        if count > 0:

            recommendations.append(
                f"'{column}' contains {count} potential outliers."
            )

    # Correlations
    for item in correlations:

        recommendations.append(
            f"'{item['featureA']}' and '{item['featureB']}' are highly correlated ({item['correlation']})."
        )

    # Dataset looks clean
    if len(recommendations) == 0:

        recommendations.append(
            "No major data quality issues detected."
        )

    return recommendations

def get_target_analysis(df):

    candidates = []

    all_columns = df.columns.tolist()

    target_keywords = [
        "target",
        "label",
        "class",
        "output",
        "y",
        "churn",
        "survived",
        "diagnosis",
        "default",
        "fraud",
        "species",
        "exited",
        "spam",
        "ham",
        "outcome",
        "status"
    ]

    for col in all_columns:

        col_lower = str(col).lower()

        unique_count = df[col].nunique()

        # Rule 1: Common target names
        if col_lower in target_keywords:

            candidates.append({
                "name": col,
                "confidence": 95,
                "reason": "Matched common target naming pattern"
            })

            continue

        # Rule 2: Binary features (0/1, Yes/No, True/False, etc.)
        if unique_count == 2:

            candidates.append({
                "name": col,
                "confidence": 84,
                "reason": "Binary outcome-like feature"
            })

            continue

        # Rule 3: Low-cardinality categorical features
        dtype = str(df[col].dtype)

        if (
            2 < unique_count <= 10 and
            dtype in ["object", "category"]
        ):

            candidates.append({
                "name": col,
                "confidence": 75,
                "reason": "Low-cardinality categorical feature"
            })

            continue

    candidates.sort(
        key=lambda x: x["confidence"],
        reverse=True
    )

    return {
        "candidates": candidates[:5],
        "allColumns": all_columns,
        "selectedTarget": None
    }

