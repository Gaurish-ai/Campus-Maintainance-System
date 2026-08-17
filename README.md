# Campus Maintenance Intelligence

> **Turn scattered maintenance complaints into structured, prioritized and predictive campus intelligence.**

Campus Maintenance Intelligence is a proposed **campus-scale AI/ML decision-support system** designed to transform unstructured maintenance complaints and historical maintenance records into actionable intelligence for campus facilities teams.

The system goes beyond a conventional maintenance ticketing system. Instead of only recording and tracking complaints, it aims to **understand incidents, identify duplicate reports, prioritize maintenance work, detect recurring failures, predict future failures, and recommend cost-effective interventions**.

The project is designed around a five-stage intelligence pipeline:

**Structure → Cluster → Prioritize → Predict → Optimize**

Each stage is intended to be independently testable using objective operational outcomes such as work-order IDs, completion records, recurrence, timestamps, and repair costs.

---

## 1. Problem Statement

Campus maintenance generates large amounts of operational information through complaints, work orders, repairs, asset histories, and maintenance outcomes.

However, several problems can occur in a conventional maintenance workflow:

* Multiple people may report the same maintenance issue.
* Urgent failures may be buried among routine complaints.
* Historical repairs are difficult to connect with new incidents.
* Repeated failures may only become visible after they become expensive.
* Maintenance prioritization can depend heavily on manual triage.
* Historical maintenance data may not be fully utilized for future decisions.
* Repair decisions may focus on individual incidents instead of recurring asset-level patterns.

For example, several students may independently report:

```text
"AC not working in LT-201"

"LT-201 AC is broken"

"The AC in lecture theatre 201 isn't cooling"
```

A conventional system may treat these as separate complaints.

Campus Maintenance Intelligence aims to determine whether they represent the **same underlying incident**, combine the available evidence, assess its priority, connect it with historical repairs, and use the resulting information to improve future maintenance decisions.

---

# 2. Proposed Solution

Campus Maintenance Intelligence introduces an **intelligence layer on top of the campus maintenance workflow**.

The proposed system receives maintenance reports and historical operational data and processes them through five stages.

```text
Maintenance Reports
        │
        ▼
   ┌───────────┐
   │ STRUCTURE │
   └─────┬─────┘
         │
         ▼
   ┌───────────┐
   │  CLUSTER  │
   └─────┬─────┘
         │
         ▼
   ┌──────────────┐
   │  PRIORITIZE  │
   └──────┬───────┘
          │
          ▼
   ┌───────────┐
   │  PREDICT  │
   └─────┬─────┘
         │
         ▼
   ┌───────────┐
   │ OPTIMIZE  │
   └─────┬─────┘
         │
         ▼
Maintenance Decision
```

The goal is not to replace the existing maintenance team.

The goal is to provide facilities personnel with **better information for making maintenance decisions**.

---

# 3. Project Objectives

The project aims to:

1. Convert free-text maintenance complaints into structured incident records.
2. Identify duplicate or closely related maintenance reports.
3. Rank incidents according to urgency, recurrence, impact, and other relevant factors.
4. Identify recurring failure patterns from historical maintenance data.
5. Predict the likelihood of future recurrence or asset failure.
6. Recommend appropriate intervention timing or cost trade-offs.
7. Evaluate each intelligent component using measurable ground truth.
8. Develop a prototype that can eventually be tested within a campus environment.

---

# 4. Campus Maintenance Ecosystem

The project is not only an ML pipeline. It is intended to operate as part of a larger campus maintenance ecosystem.

### Major participants

#### Students

Students can report issues involving:

* Classrooms
* Hostels
* Laboratories
* Washrooms
* Electrical systems
* Air conditioning
* Fans
* Projectors
* Water leakage
* Other campus facilities

#### Faculty and Staff

Faculty and staff can submit maintenance reports for:

* Offices
* Departments
* Laboratories
* Classrooms
* Common facilities
* Equipment and infrastructure

#### Facilities / Maintenance Department

The facilities team is the primary operational user of the intelligence layer.

They can use the system to:

* View incoming incidents
* Identify duplicate complaints
* Review priority rankings
* Inspect recurring problems
* Review asset history
* Examine predicted recurrence
* Evaluate intervention recommendations

#### Technicians

Technicians perform the physical maintenance work.

Their work can generate valuable historical information such as:

* Assignment
* Inspection
* Repair performed
* Parts replaced
* Completion time
* Resolution notes
* Repair cost
* Final outcome

#### Campus Administration

Administrators can use aggregated intelligence to understand:

* Recurring infrastructure problems
* Maintenance expenditure
* Asset reliability
* High-impact failure patterns
* Resource allocation
* Potential replacement decisions

---

# 5. Data Flow

The proposed ecosystem creates a feedback loop rather than a one-way complaint system.

```text
Students / Faculty / Staff
            │
            ▼
    Maintenance Reports
            │
            ▼
   Structured Incidents
            │
            ▼
     AI Intelligence
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
 Duplicate Priority Prediction
 Detection Ranking   │
     │      │        │
     └──────┼────────┘
            ▼
    Maintenance Action
            │
            ▼
      Work Order
            │
            ▼
    Repair / Resolution
            │
            ▼
 Historical Maintenance Data
            │
            └──────────────► Future Intelligence
```

This feedback loop allows completed maintenance work to become useful information for future decisions.

---

# 6. Five-Stage Intelligence Pipeline

## Stage 1: Structure

### Objective

Convert unstructured maintenance complaints into structured incident records.

### Example

Input:

```text
"The AC in LT-201 has stopped working again."
```

Possible structured representation:

```text
Category: HVAC
Location: LT-201
Asset: AC
Problem: Not working
Recurrence indicator: Yes
Timestamp: <report timestamp>
```

### Proposed technologies

Depending on available data and experimentation:

* spaCy
* Hugging Face Transformers
* LLM-based structured extraction
* DistilBERT / RoBERTa for classification

The initial implementation will prioritize simpler baselines before moving to more complex models.

---

# 7. Stage 2: Cluster

### Objective

Identify duplicate or closely related maintenance reports.

### Example

```text
Report A:
"AC not working in LT-201"

Report B:
"LT201 air conditioner broken"

Report C:
"Lecture theatre 201 AC isn't cooling"
```

The system should estimate whether these reports refer to the same underlying maintenance issue.

### Proposed approach

1. Convert complaint text into semantic embeddings.
2. Compare reports using similarity.
3. Apply contextual information such as:

   * Location
   * Building
   * Time window
   * Asset
   * Category
4. Group reports that are likely related.

### Proposed technologies

* Sentence Transformers
* FAISS
* HDBSCAN
* Hierarchical clustering
* Rule-based contextual checks

The final approach will be determined experimentally.

---

# 8. Stage 3: Prioritize

### Objective

Rank maintenance incidents so that high-impact cases can receive attention earlier.

Potential features include:

* Urgency
* Number of duplicate reports
* Recurrence count
* Asset criticality
* Complaint frequency
* Location
* Historical failure frequency
* Time since previous repair
* Impact on campus activities
* Historical resolution time

### Proposed model

An initial scoring or classification baseline can be developed first.

A more advanced implementation may use:

* XGBoost
* LightGBM
* Learning-to-rank approaches

### Example

```text
Incident                         Priority
------------------------------------------------
LT-201 AC failure               HIGH
Hostel water leakage            HIGH
Office light failure            LOW
Projector in unused room        LOW
```

The ranking should be evaluated against verified outcomes rather than being treated as an arbitrary score.

---

# 9. Stage 4: Predict

### Objective

Identify assets or incidents that are likely to experience recurring failures.

Potential predictive features include:

* Asset age
* Time since last repair
* Number of previous repairs
* Repair frequency
* Historical failure count
* Previous downtime
* Previous repair cost
* Asset type
* Location
* Time between failures

### Initial models

Possible models for an MVP include:

* Random Forest
* XGBoost

For a more advanced time-to-failure formulation:

* Survival analysis
* Cox proportional hazards model

The project will first establish a baseline before evaluating more advanced approaches.

---

# 10. Stage 5: Optimize

### Objective

Recommend intervention strategies while considering operational constraints.

The optimization layer may consider:

* Predicted failure risk
* Repair cost
* Replacement cost
* Asset criticality
* Technician availability
* Budget constraints
* Expected downtime
* Historical repair outcomes

### Possible approaches

* Cost-benefit scoring
* Linear programming
* Integer programming
* Google OR-Tools
* PuLP

The initial MVP may use a simpler cost-benefit approach before moving toward formal optimization.

---

# 11. Data Requirements

The project requires historical and/or operational maintenance data.

### Primary data

Potential data fields include:

#### Maintenance reports

* Report ID
* Free-text complaint
* Timestamp
* Reporter type
* Location
* Building
* Category

#### Work orders

* Work-order ID
* Incident ID
* Status
* Assigned technician
* Assignment timestamp
* Completion timestamp
* Resolution notes
* Outcome

#### Asset information

* Asset ID
* Asset type
* Location
* Installation date
* Maintenance history
* Previous failures
* Previous repairs

#### Cost information

* Repair cost
* Parts/material cost
* Replacement cost where available
* Other relevant maintenance expenses

### Important data principle

Prediction and optimization should ultimately be evaluated using **real historical outcomes** wherever possible.

Synthetic data may be useful for prototyping or testing parts of the system, but it should not be treated as equivalent to real operational ground truth.

---

# 12. Ground Truth and Evaluation

A central principle of the project is that each intelligent component should have an independently measurable evaluation.

| Task                    | Ground Truth                 | Metrics                         |
| ----------------------- | ---------------------------- | ------------------------------- |
| Incident classification | Verified work-order/category | Accuracy, Precision, Recall, F1 |
| Duplicate detection     | Known incident/work-order ID | Precision, Recall, F1           |
| Priority ranking        | Urgency + completion outcome | Precision@K, NDCG               |
| Recurrence prediction   | Later verified recurrence    | Precision, Recall, F1           |
| Cost optimization       | Actual repair cost/outcome   | Cost reduction, ROI             |

The evaluation framework is designed to avoid relying only on subjective demonstrations.

The project instead aims to connect model predictions with objective operational evidence such as:

* Timestamps
* Work-order outcomes
* Repair completion
* Recurrence
* Actual cost
* Historical repair information

---

# 13. Controlled Experiments

The project will evaluate individual components separately.

### Experiment 1: Incident Classification

Compare predicted incident categories with verified work-order categories.

### Experiment 2: Duplicate Detection

Determine whether reports belonging to the same underlying incident are correctly grouped.

### Experiment 3: Priority Ranking

Evaluate whether high-impact incidents appear near the top of the ranking.

### Experiment 4: Recurrence Prediction

Train on historical asset/maintenance information and evaluate whether later verified failures can be predicted.

### Experiment 5: Cost Optimization

Compare recommended interventions with historical repair outcomes and measure potential cost savings.

---

# 14. Baselines

A model should not be considered useful merely because it produces predictions.

The project will establish baseline methods where appropriate.

Possible baselines include:

* First-come-first-served prioritization
* Keyword-based incident classification
* Simple text similarity for duplicate detection
* Frequency-based recurrence prediction
* Rule-based priority scoring
* Simple cost-benefit heuristics

More advanced ML models will be evaluated against these baselines.

---

# 15. Proposed Technology Stack

The technology stack is currently **proposed** and will be finalized based on data availability and experimental results.

### Machine Learning / NLP

* Python
* Pandas
* NumPy
* Scikit-learn
* spaCy
* Hugging Face Transformers
* Sentence Transformers
* XGBoost / LightGBM

### Clustering / Similarity

* FAISS
* HDBSCAN
* Scikit-learn clustering

### Optimization

* Google OR-Tools
* PuLP

### Backend

* FastAPI
* Python

### Database

* PostgreSQL

### Frontend / Dashboard

For the MVP:

* Streamlit

A React-based frontend may be considered for a later deployment-oriented version.

### Experiment Tracking

* MLflow or Weights & Biases

### Development / Deployment

* Git
* GitHub
* Docker
* GitHub Actions

---

# 16. Proposed System Architecture

```text
                         CAMPUS USERS
                ┌────────────┼────────────┐
                │            │            │
             Students     Faculty       Staff
                │            │            │
                └────────────┼────────────┘
                             ▼
                  ┌─────────────────────┐
                  │ Maintenance Portal  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    FastAPI Backend  │
                  └──────────┬──────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
        PostgreSQL       AI Pipeline      Work Orders
             │               │                │
             │       ┌───────┼────────┐       │
             │       ▼       ▼        ▼       │
             │   Structure Cluster Prioritize │
             │                        │       │
             │                        ▼       │
             │                    Predict     │
             │                        │       │
             │                        ▼       │
             │                    Optimize    │
             │                        │       │
             └────────────────────────┼───────┘
                                      ▼
                            Facilities Dashboard
                                      │
                                      ▼
                              Maintenance Action
                                      │
                                      ▼
                              Repair Outcome
                                      │
                                      └──────► Historical Data
```

This architecture is a proposed implementation and may evolve during development.

---

# 17. MVP

The initial MVP will focus on the parts that can be independently tested with available data.

### MVP Scope

#### 1. Incident extraction

Convert free-text complaints into structured records.

#### 2. Incident classification

Identify the maintenance category/type.

#### 3. Duplicate detection

Identify potentially duplicated or related complaints.

#### 4. Basic prioritization

Generate an initial priority ranking.

#### 5. Maintenance dashboard

Display:

* Incoming incidents
* Structured incident information
* Duplicate groups
* Priority
* Incident history

The predictive maintenance and optimization components will be developed as subsequent phases once sufficient historical data is available.

---

# 18. Long-Term Development Roadmap

## Phase 1: MVP

* NLP incident extraction
* Classification
* Duplicate detection
* Basic prioritization
* Prototype dashboard

**Goal:** Build a campus-testable intelligence prototype.

---

## Phase 2: Pattern Intelligence

* Anomaly detection
* Recurring failure analysis
* Asset-level historical patterns
* Improved incident clustering

**Goal:** Identify patterns that are difficult to discover manually.

---

## Phase 3: Predictive Maintenance

* Failure prediction
* Recurrence prediction
* Asset risk scoring
* Failure forecasting

**Goal:** Move from reactive maintenance toward predictive maintenance.

---

## Phase 4: Cost Optimization

* Intervention recommendations
* Repair vs replacement analysis
* Budget constraints
* Technician/resource constraints
* Cost-aware scheduling

**Goal:** Optimize maintenance decisions rather than simply predicting failures.

---

# 19. Expected System Outputs

The final system is intended to produce outputs such as:

### Structured incident

```text
Incident ID: INC-1042
Category: HVAC
Location: LT-201
Asset: AC-102
Problem: Cooling failure
Reports linked: 7
Priority: HIGH
```

### Duplicate detection

```text
Potential duplicate cluster:

INC-1042
├── Report #R182
├── Report #R194
├── Report #R201
└── Report #R214

Similarity confidence: <model output>
```

### Recurrence prediction

```text
Asset: AC-102

Previous failures: 4
Last repair: <timestamp>
Historical recurrence: HIGH

Predicted recurrence risk:
<model output>
```

### Intervention recommendation

```text
Asset: AC-102

Recommended action:
Inspect / repair / consider replacement

Reason:
High recurrence + repair history + predicted failure risk
```

These are examples of intended system outputs, not current experimental results.

---

# 20. Why This Is More Than a Ticketing System

A conventional maintenance system primarily answers:

> **"What maintenance requests exist?"**

Campus Maintenance Intelligence aims to answer additional questions:

> **"Which reports describe the same problem?"**

> **"Which problem should be handled first?"**

> **"Which assets are repeatedly failing?"**

> **"Which assets are likely to fail again?"**

> **"When should we intervene?"**

> **"What intervention provides the best cost/outcome trade-off?"**

The central idea is therefore not simply digitizing maintenance requests.

It is creating an **intelligence layer over historical and current maintenance operations**.

---

# 21. Research and Technical Contribution

The project is intended to investigate how multiple ML tasks can be connected within a single operational maintenance workflow.

The proposed contribution is the integration of:

```text
Unstructured Reports
        ↓
NLP / Information Extraction
        ↓
Semantic Duplicate Detection
        ↓
Operational Prioritization
        ↓
Failure / Recurrence Prediction
        ↓
Cost-Aware Intervention Optimization
```

Each component can be studied independently while also contributing to the larger maintenance intelligence system.

This creates multiple research questions rather than depending on a single prediction model.

---

# 22. Campus Deployment Potential

The project is designed to eventually be tested within a university campus environment.

A possible deployment path is:

```text
Existing Maintenance Process
            ↓
Historical Data Integration
            ↓
AI Intelligence Prototype
            ↓
Controlled Offline Evaluation
            ↓
Pilot with Selected Facilities
            ↓
Feedback from Maintenance Staff
            ↓
Campus-wide Deployment Roadmap
```

The project should initially operate as a **decision-support system**, allowing human facilities personnel to validate recommendations before any automated operational action is taken.

---

# 23. Data Privacy and Governance

Maintenance reports may contain information such as:

* Names
* Contact information
* Room numbers
* Locations
* Identifying descriptions

If real campus records are used, appropriate authorization and data governance will be required.

The system should follow principles such as:

* Collect only necessary information.
* Minimize personally identifiable information.
* Restrict access to authorized users.
* Separate operational data from public-facing interfaces.
* Use anonymized or pseudonymized data for research where appropriate.
* Obtain required campus approvals before using internal records.

---

# 24. Limitations and Assumptions

The project depends significantly on the availability and quality of historical maintenance data.

Potential limitations include:

* Limited historical records
* Inconsistent work-order formats
* Missing repair costs
* Incomplete asset histories
* Lack of explicit duplicate labels
* Inconsistent resolution notes
* Insufficient recurrence observations
* Limited access to real campus maintenance records

If real campus data is unavailable initially, synthetic or publicly available maintenance data may be used for early prototyping and pipeline development.

However, final claims about recurrence prediction and cost optimization should ideally be supported by real historical outcomes.

---

# 25. Success Criteria

The project will be considered successful if it can demonstrate:

### Data understanding

* Maintenance reports can be converted into structured records.

### Duplicate intelligence

* Related reports can be grouped with measurable precision and recall.

### Prioritization

* High-impact maintenance cases can be ranked effectively against a defined baseline.

### Prediction

* Historical information can provide useful signals for predicting future recurrence.

### Optimization

* Intervention recommendations can be evaluated against actual or historical cost/outcome information.

### System integration

* The individual components can operate together in a coherent maintenance intelligence workflow.

---

# 26. Project Status

**Current status:** Concept / Architecture / Planning

The current project definition establishes:

* The campus maintenance problem
* The five-stage intelligence pipeline
* The evaluation framework
* The long-term development phases
* The proposed data requirements
* The proposed technical direction

Implementation, dataset acquisition, model training, and experimental results will be documented as development progresses.

---

# 27. Future Enhancements

Potential future extensions include:

* Multimodal maintenance reports using images
* Computer vision for visible infrastructure damage
* Geospatial analysis of campus failures
* Real-time maintenance dashboards
* Technician workload optimization
* Spare-parts demand prediction
* Asset replacement planning
* Natural-language querying of maintenance history
* Explainable AI for maintenance recommendations
* Integration with existing campus CMMS/facilities systems

These extensions are outside the initial MVP unless sufficient data and development time are available.

---

# 28. Repository Structure

A proposed repository structure is:

```text
campus-maintenance-intelligence/
│
├── README.md
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── sample/
│
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   ├── 02_incident_structure.ipynb
│   ├── 03_duplicate_detection.ipynb
│   ├── 04_prioritization.ipynb
│   ├── 05_recurrence_prediction.ipynb
│   └── 06_optimization.ipynb
│
├── src/
│   ├── preprocessing/
│   ├── structure/
│   ├── clustering/
│   ├── prioritization/
│   ├── prediction/
│   ├── optimization/
│   └── evaluation/
│
├── models/
│
├── api/
│
├── dashboard/
│
├── tests/
│
├── docs/
│   ├── architecture/
│   ├── experiments/
│   └── evaluation/
│
├── requirements.txt
│
└── .gitignore
```

The repository structure may change as implementation progresses.

---

# 29. Project Philosophy

The project follows four principles:

### 1. Data before complexity

Start with available data and establish simple baselines before introducing complex models.

### 2. Every intelligent component must be measurable

Predictions should be evaluated against meaningful ground truth wherever possible.

### 3. Human-in-the-loop decision making

The system should assist facilities personnel rather than blindly automate operational decisions.

### 4. Research and deployment together

The project should produce both:

* A technically measurable ML system
* A realistic pathway toward campus deployment

---

# 30. Final Vision

Campus Maintenance Intelligence aims to transform campus maintenance from a primarily reactive workflow into a **data-driven, predictive and optimization-oriented process**.

Instead of simply storing:

> "AC not working."

the system should progressively understand:

```text
What happened?
      ↓
Where did it happen?
      ↓
Is someone else reporting the same issue?
      ↓
How important is it?
      ↓
Has this happened before?
      ↓
Is the asset likely to fail again?
      ↓
What should the maintenance team do?
      ↓
What intervention is most effective and cost-efficient?
```

The long-term vision is a campus maintenance intelligence platform where every completed repair contributes knowledge that can improve future maintenance decisions.

---

## Core Pipeline

```text
┌───────────┐
│  REPORTS  │
└─────┬─────┘
      ▼
┌───────────┐
│ STRUCTURE │
└─────┬─────┘
      ▼
┌───────────┐
│  CLUSTER  │
└─────┬─────┘
      ▼
┌────────────┐
│ PRIORITIZE │
└─────┬──────┘
      ▼
┌───────────┐
│  PREDICT  │
└─────┬─────┘
      ▼
┌───────────┐
│ OPTIMIZE  │
└─────┬─────┘
      ▼
┌────────────────────┐
│ MAINTENANCE ACTION │
└─────────┬──────────┘
          ▼
┌────────────────────┐
│ REPAIR / OUTCOME   │
└─────────┬──────────┘
          │
          └──────────► Historical Intelligence
```

**Campus Maintenance Intelligence**

> **From maintenance reports to maintenance intelligence.**
