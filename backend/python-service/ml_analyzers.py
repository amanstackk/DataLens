import pandas as pd
from sklearn.ensemble import (
    RandomForestClassifier,
    RandomForestRegressor
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    r2_score
)

def get_problem_type(df, target_column):

    if not target_column:

        return {
            "type": None,
            "confidence": 0,
            "reason": "No target selected"
        }

    target = df[target_column]

    unique_values = target.nunique()

    total_rows = len(df)

    unique_ratio = unique_values / total_rows

    dtype = str(target.dtype)

    # Binary Classification
    if unique_values == 2:

        return {
            "type": "Binary Classification",
            "confidence": 95,
            "reason": "Target contains exactly 2 unique values"
        }

    # Categorical Classification
    if (
        pd.api.types.is_object_dtype(target)
        or pd.api.types.is_string_dtype(target)
        or pd.api.types.is_categorical_dtype(target)
    ):

        return {
            "type": "Multi-Class Classification",
            "confidence": 90,
            "reason": f"Target contains {unique_values} classes"
        }

    # Numeric target with low cardinality
    if unique_values <= 20:

        return {
            "type": "Multi-Class Classification",
            "confidence": 70,
            "reason": "Numeric target with few unique values"
        }

    # Numeric target with high cardinality
    if unique_ratio > 0.1:

        return {
            "type": "Regression",
            "confidence": 90,
            "reason": "Numeric target with high cardinality"
        }

    return {
        "type": "Unknown",
        "confidence": 50,
        "reason": "Could not confidently determine problem type"
    }

def get_feature_importance(
    df,
    target_column,
    problem_type
):

    if not target_column:

        return []

    df_clean = df.dropna(subset=[target_column])
    if len(df_clean) < 5:
        return []

    X = df_clean.drop(columns=[target_column])
    y = df_clean[target_column]

    X = X.select_dtypes(include="number")

    X = X.fillna(X.median())

    if problem_type["type"] == "Regression":

        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )

    else:

        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )

    model.fit(X, y)

    results = []

    for feature, importance in zip(
        X.columns,
        model.feature_importances_
    ):

        results.append({
            "feature": feature,
            "importance": round(
                float(importance),
                4
            )
        })

    results.sort(
        key=lambda x: x["importance"],
        reverse=True
    )

    return results[:10]

def get_ml_readiness(df):

    score = 100

    strengths = []

    issues = []

    missing_percentage = (
    df.isnull()
      .mean()
      .mul(100)
    )

    max_missing = missing_percentage.max()

    if max_missing > 50:

        score -= 20

        issues.append(
            "Severe missing data detected"
        )

    elif max_missing > 20:

        score -= 10

        issues.append(
            "Moderate missing data detected"
        )

    else:

        strengths.append(
            "Low missing data"
        )  

    duplicate_rows = int(
        df.duplicated().sum()   
    ) 

    if duplicate_rows > 0:

        score -= 10

        issues.append(
            f"{duplicate_rows} duplicate rows detected"
        )

    else:

        strengths.append(
            "No duplicate rows"
        )

    numeric_df = df.select_dtypes(
        include="number"
    )

    correlation_matrix = numeric_df.corr()

    high_corr = 0

    for i in range(len(correlation_matrix.columns)):

        for j in range(i + 1,
                   len(correlation_matrix.columns)):

            corr = correlation_matrix.iloc[i, j]

            if pd.notna(corr) and abs(corr) >= 0.8:

                high_corr += 1
        
    if high_corr > 5:

        score -= 10

        issues.append(
            "Many highly correlated features"
        )

    elif high_corr > 0:

        score -= 5

        issues.append(
            "Some correlated features detected"
        )
    if score >= 90:

        grade = "A"

    elif score >= 80:

        grade = "B"

    elif score >= 70:

        grade = "C"

    else:

        grade = "D"

    return {
        "score": score,
        "grade": grade,
        "strengths": strengths,
        "issues": issues
    }

def get_dataset_insights(
    problem_type,
    ml_readiness,
    feature_importance
):

    insights = []

    # ML Readiness Insight
    if ml_readiness["score"] >= 90:

        insights.append({
            "severity": "positive",
            "title": "Excellent ML Readiness",
            "description":
                "The dataset is well prepared for machine learning with minimal quality issues."
        })

    elif ml_readiness["score"] >= 75:

        insights.append({
            "severity": "positive",
            "title": "Good ML Readiness",
            "description":
                "The dataset is generally suitable for machine learning but may require minor preprocessing."
        })

    else:

        insights.append({
            "severity": "warning",
            "title": "Low ML Readiness",
            "description":
                "Data quality issues may negatively impact model performance."
        })

    # Problem Type Insight
    insights.append({
        "severity": "info",
        "title": "Detected Problem Type",
        "description":
            f"This dataset appears to be a {problem_type['type']} task."
    })

    # Feature Importance Insight
    top_features = [
        item["feature"]
        for item in feature_importance[:3]
    ]

    if len(top_features) > 0:

        insights.append({
            "severity": "info",
            "title": "Most Influential Features",
            "description":
                f"Top predictive features are {', '.join(top_features)}."
        })

    # Dataset Strengths
    for strength in ml_readiness["strengths"]:

        insights.append({
            "severity": "positive",
            "title": "Dataset Strength",
            "description": strength
        })

    # Dataset Issues
    for issue in ml_readiness["issues"]:

        insights.append({
            "severity": "warning",
            "title": "Potential Issue",
            "description": issue
        })

    return insights

def get_model_recommendation(
    problem_type
):

    model_type = problem_type["type"]

    if model_type == "Binary Classification":

        return [
            {
                "name": "Logistic Regression",
                "reason": "Strong baseline for binary classification"
            },
            {
                "name": "Random Forest",
                "reason": "Handles non-linear relationships well"
            },
            {
                "name": "XGBoost",
                "reason": "Often achieves high classification performance"
            }
        ]

    if model_type == "Multi-Class Classification":

        return [
            {
                "name": "Random Forest",
                "reason": "Works well for multi-class tasks"
            },
            {
                "name": "XGBoost",
                "reason": "Strong performance on structured datasets"
            },
            {
                "name": "LightGBM",
                "reason": "Efficient for large datasets"
            }
        ]

    if model_type == "Regression":

        return [
            {
                "name": "Linear Regression",
                "reason": "Simple baseline model"
            },
            {
                "name": "Random Forest Regressor",
                "reason": "Captures non-linear relationships"
            },
            {
                "name": "XGBoost Regressor",
                "reason": "Strong predictive performance"
            }
        ]

    return []

def get_baseline_model(
    df,
    target_column,
    problem_type
):

    if not target_column:

        return None

    df_clean = df.dropna(subset=[target_column])
    if len(df_clean) < 5:
        return {
            "model": None,
            "score": None,
            "metric": None,
            "reason": "Not enough valid target rows"
        }

    X = df_clean.drop(columns=[target_column])
    y = df_clean[target_column]

    X = X.select_dtypes(include="number")

    X = X.fillna(X.median())

    if len(X.columns) == 0:

        return {
            "model": None,
            "score": None,
            "metric": None,
            "reason": "No numeric features available"
        }

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    if problem_type["type"] == "Regression":

        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        score = r2_score(
            y_test,
            predictions
        )

        return {
            "model": "Random Forest Regressor",
            "score": round(float(score), 4),
            "metric": "R² Score"
        }

    else:

        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        score = accuracy_score(
            y_test,
            predictions
        )

        return {
            "model": "Random Forest Classifier",
            "score": round(float(score * 100), 2),
            "metric": "Accuracy"
        }