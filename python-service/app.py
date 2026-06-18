import sys
import pandas as pd
import json

file_path = sys.argv[1]

df = pd.read_csv(file_path)
result = {
    "rows": int(df.shape[0]),
    "columns": int(df.shape[1])
}

print(json.dumps(result))