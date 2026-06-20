import sys
import json
import pandas as pd

from analyzers import (
    get_problem_type,
    get_feature_importance
)

file_path = sys.argv[1]
target_column = sys.argv[2]

df = pd.read_csv(file_path)

problem_type = get_problem_type(df, target_column)

feature_importance = get_feature_importance(df, target_column, problem_type)

result = {
    "problemType": problem_type,
    "featureImportance": feature_importance
}

print(json.dumps(result))
