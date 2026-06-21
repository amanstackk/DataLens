# DataLens

DataLens is a full-stack dataset assessment and machine learning readiness platform that helps users understand, evaluate, and prepare datasets for machine learning workflows.

Instead of showing only raw statistics, DataLens analyzes dataset quality, identifies potential issues, detects machine learning problem types, evaluates ML readiness, recommends suitable models, and provides actionable insights.

---

## Features

### Dataset Analysis

* Dataset Overview

  * Rows
  * Columns
  * Numeric Features
  * Categorical Features

* Data Quality Assessment

  * Missing Values
  * Missing Value Percentage
  * Duplicate Detection
  * Outlier Detection
  * Correlation Analysis
  * Class Imbalance Analysis

* Statistical Analysis

  * Mean
  * Median
  * Minimum
  * Maximum

* Dataset Health Score

  * Overall quality score
  * Strengths
  * Risks
  * Recommendations

---

### Machine Learning Analysis

#### Intelligent Target Selection

DataLens automatically suggests likely target columns and allows users to confirm or select a different target.

#### Problem Type Detection

Automatically identifies:

* Binary Classification
* Multi-Class Classification
* Regression

#### Feature Importance Analysis

Uses Random Forest models to identify the most influential features affecting predictions.

#### ML Readiness Assessment

Evaluates whether the dataset is suitable for machine learning based on:

* Missing values
* Duplicate records
* Feature correlation
* Dataset quality

#### Dataset Insights

Generates analytical findings including:

* Data quality observations
* Risk detection
* Key strengths
* Recommended actions

#### Model Recommendations

Suggests suitable machine learning algorithms based on the detected problem type.

Examples:

* Logistic Regression
* Random Forest
* XGBoost
* LightGBM
* Linear Regression

#### Baseline Model Evaluation

Trains a baseline model and reports:

* Accuracy (Classification)
* R² Score (Regression)

This provides an early estimate of how predictable the dataset is.

---

## Architecture

```text
Frontend (HTML/CSS/JavaScript)
           │
           ▼
Node.js + Express Backend
           │
           ▼
Python Analysis Engine
           │
           ├── EDA Pipeline
           ├── Data Quality Analysis
           ├── ML Readiness Analysis
           ├── Feature Importance
           └── Baseline Model Evaluation
```

---

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js
* Multer

### Data Science & ML

* Python
* Pandas
* NumPy
* Scikit-Learn

### Version Control

* Git
* GitHub

---

## Project Structure

```text
DataLens/

├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── server.js
│
├── python-service/
│   ├── app.py
│   ├── analyzers.py
│   ├── ml_analysis.py
│   └── ml_analyzers.py
│
└── uploads/
```

---

## How It Works

### Phase 1 — Dataset Upload

The user uploads a CSV dataset.

### Phase 2 — Dataset Assessment

DataLens performs:

* Quality checks
* Statistical analysis
* Health evaluation
* Target detection

### Phase 3 — Machine Learning Analysis

After target selection:

* Problem type detection
* Feature importance analysis
* ML readiness assessment
* Model recommendations
* Baseline model evaluation

### Phase 4 — Insights

DataLens summarizes findings and highlights:

* Strengths
* Risks
* Recommended next actions

---

## Example Workflow

```text
Upload Dataset
        │
        ▼
Dataset Assessment
        │
        ▼
Target Selection
        │
        ▼
ML Analysis
        │
        ▼
Feature Importance
        │
        ▼
ML Readiness
        │
        ▼
Model Recommendations
        │
        ▼
Baseline Model Performance
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd DataLens
```

### Backend Setup

```bash
cd backend
npm install
node server.js
```

### Python Service Setup

```bash
pip install pandas numpy scikit-learn
```

### Frontend

Open:

```text
frontend/index.html
```

or run:

```bash
cd frontend
python -m http.server 5500
```

---

## Future Improvements

### Planned Features

* PDF Report Generation
* Correlation Heatmaps
* Interactive Visualizations
* Advanced Model Benchmarking
* Feature Engineering Suggestions
* Dataset Versioning
* Explainable AI Insights
* Cloud Deployment
* React + TypeScript Frontend

---

## Why DataLens?

Most dataset tools focus on displaying statistics.

DataLens focuses on helping users understand:

* What was discovered
* Why it matters
* What they should do next

The goal is to bridge the gap between raw data exploration and machine learning readiness.

---

## Author

Aman Shrivastava

Built as a full-stack machine learning and data analysis project focused on practical dataset assessment and ML workflow acceleration.
