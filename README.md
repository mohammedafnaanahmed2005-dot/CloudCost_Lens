# CloudCost Lens ☁️🔍
**Professional Cloud Cost Intelligence & Statistical Anomaly Optimization Platform**

Built for the 24-Hour MLH Hackathon by an Agile FinOps Engineering team.

---

## 🌟 Overview & Vision

**CloudCost Lens** transforms raw cloud billing records into traceable, evidence-based FinOps intelligence. It enables DevOps teams, cloud architects, and startups to rapidly detect abnormal expenditure spikes, estimate realistic end-of-month run-rates, and prioritize high-leverage optimization actions with zero fabricated data.

### Key Capabilities
- **Multi-Format Billing Pipeline**: Ingests Standard CSV, AWS Cost and Usage Reports (CUR), and GCP Billing exports with automatic column mapping and 1-based source line error tracking.
- **Statistical Anomaly Detection (Median + MAD)**: Employs non-parametric Median Absolute Deviation to pinpoint genuine spending outliers ($R > 3.5$) with zero-MAD fallbacks.
- **Transparent Forecasting**: Projects run-rate extrapolation and adaptive 7-day velocity forecasts with confidence bounds and documented assumptions.
- **Prioritized Optimization Opportunities**: Ranks cost reduction actions based on a mathematical formula:  
  $$\text{Priority} = 0.5 \times \text{Impact} + 0.3 \times \text{Severity} + 0.2 \times \text{Confidence}$$
- **Data Quality & Multi-Currency Protection**: Flags currency discrepancies and prevents arithmetic collisions between USD, EUR, etc.
- **Privacy-Preserving AI Briefing**: Opt-in executive briefings powered by Google GenAI / Gemma with zero transmission of raw billing rows.

---

## 📊 Analytical Formulations & Engine Architecture

### 1. Robust Anomaly Detection (Median + MAD)
Traditional standard deviation ($\sigma$) fails on financial data because massive spikes inflate $\sigma$, hiding the anomaly itself. CloudCost Lens uses:
$$m = \text{median}(x_i)$$
$$\text{MAD} = \text{median}(|x_i - m|)$$
$$\text{Robust Score } R = \frac{|x - m|}{1.4826 \times \text{MAD}}$$

- **Spike Threshold**: $R > 3.5$ and minimum dollar delta $\ge \$15.00$.
- **Zero-MAD Fallback**: When baseline spend is uniform ($\text{MAD} = 0$), flags any surge $\ge 1.5 \times m$.
- **Sample Requirement**: Enforces $\ge 7$ historical observations to avoid false alarms.

### 2. End-of-Month Run-Rate Forecast
- **Overall Run-Rate Projection**:
  $$\text{Forecast}_{\text{run-rate}} = \frac{\text{Observed Spend}}{\text{Elapsed Days}} \times \text{Billing Period Days (30)}$$
- **Adaptive Recent Velocity Projection**:
  $$\text{Forecast}_{\text{recent}} = \text{Observed Spend} + (\text{Mean of last 7 days}) \times \text{Remaining Days}$$

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 19 + TypeScript (Strict Mode) |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS (FinOps Dark Theme) |
| **Visualizations** | Recharts (Responsive Area & Donut Charts) |
| **CSV Parsing** | Papa Parse |
| **Testing** | Vitest + React Testing Library + jsdom |
| **Icons** | Lucide React |
| **Deployment** | Vercel Ready |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v11+`

### Installation
```bash
git clone https://github.com/your-username/cloudcost-lens.git
cd cloudcost-lens
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Automated Test Suite (40 Tests)
```bash
npm test
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## ☁️ Deployment Guide (Vercel)

1. **Via Vercel CLI**:
   ```bash
   npx vercel
   ```
2. **Via GitHub Integration**:
   - Push this repository to GitHub.
   - Import into [vercel.com](https://vercel.com).
   - Framework preset: `Vite`.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
   - [vercel.json](file:///c:/mlh/vercel.json) handles client-side routing and cache headers.

---

## 🎬 7-Step Hackathon Demonstration Scenario

1. **Initial Load**:
   - Launch app. The 21-day synthetic dataset loads automatically.
   - Observe **Total Observed Cost** ($4,834.40 USD across 21 days) and **Budget Utilization** (138.1% of $3,500 budget cap).
2. **Examine Daily Spending Trend**:
   - Inspect the Recharts area chart. Hover over days 1 to 16 ($120–$140/day total spend).
   - Notice the prominent red anomaly markers starting on **2026-10-17**.
3. **Statistical Anomaly Investigation**:
   - Scroll to **Statistical Anomaly Detection (Median + MAD)**.
   - Click on the high-severity alert for `Amazon EC2` on `2026-10-17`.
   - Expand the **Mathematical Proof Drawer**:
     - Baseline Median $m = \$49.50$
     - $\text{MAD} = \$0.90$
     - Robust Score $R = 219.78$ ($> 3.5$ threshold)
     - Reason: GPU instance `i-gpu-training-unattached` leaked in `ai-research`.
4. **End-of-Month Cost Projections**:
   - Review **End-of-Month Cost Projections**.
   - Compare the Standard Run-Rate ($6,906.29) with the Adaptive 7-Day Velocity ($7,725.60), reflecting current high spending speed.
5. **Prioritized Optimization Opportunities**:
   - Inspect ranked action items scored on the $0\text{--}100$ scale.
   - See #1: *Investigate Sudden Cost Surge in Amazon EC2* (Score 80/100, Est. Savings ~$1,643.90).
   - Review actionable remediation steps without unverified idle claims.
6. **Dynamic Filter & Secondary Dataset Verification**:
   - Filter by service: Select `Amazon S3` to verify real-time recalculation.
   - Click **GCP Dataset** in top header to switch to Google Cloud billing records.
   - Verify that all charts, services, and summaries update dynamically.
7. **AI Executive Briefing (Optional)**:
   - Click **AI Briefing** in header.
   - Review data privacy policy, check consent, and generate an AI synthesis.
