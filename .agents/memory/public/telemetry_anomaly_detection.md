# Telemetry Anomaly Detection Architecture Blueprint

**Source**: Alex (Arcane) & Aerial (`azylman/aerial-config`, PR #57)  
**Reference**: https://docs.zylman.com/anomaly-detection.md  
**Tracking**: Task #58 (P2)

---

## 🎯 Architectural Principles & The Token Diet

Rather than dumping high-frequency raw time-series metrics into an LLM prompt context window (costly, slow, and prone to hallucinations) or using fragile static rules (`val > 80`), the architecture strictly bifurcates **mathematical anomaly detection** from **agentic summarization**:

1. **Continuous Ingestion**: Home Assistant exports live entity states via Prometheus integration (`/api/prometheus`), scraped by VictoriaMetrics.
2. **Deterministic Sidecar Engine**: A dedicated lightweight Python/C sidecar service (`aerial-sidecar-anomaly-detector` running FastAPI, NumPy, SciPy) continuously queries VictoriaMetrics via PromQL range queries, calculates statistical deviations, and publishes normalized metrics back to VictoriaMetrics:
   - **Amplitude Engine**: Computes rolling Median Absolute Deviation (MAD):
     $$\text{Score} = \frac{|x - \widetilde{x}|}{\max(1.4826 \cdot \text{MAD}, \epsilon)}$$
   - **Cadence / Overdue Engine**: Extracts event peaks, calculates median intervals $\widetilde{\Delta T}$ and $\text{MAD}_{\Delta T}$, dynamically setting:
     $$\text{Threshold}_{\text{overdue}} = \widetilde{\Delta T} + \sigma \cdot \max(1.4826 \cdot \text{MAD}_{\Delta T}, 0.1 \cdot \widetilde{\Delta T})$$
     Flags dead cycles or frozen pumps automatically without hardcoded schedules.
   - Publishes `aerial_anomaly_score` and binary `aerial_anomaly_detected` back to VictoriaMetrics.
3. **Agentic Cron Audit (<1,000 Tokens)**: The daily agent cron prompt avoids raw data dumps entirely, executing two targeted PromQL queries:
   - `max_over_time(aerial_anomaly_detected[24h]) > 0`
   - `aerial_anomaly_sensor_offline > 0`
   - If empty: returns clean "all systems normal".
   - If positive: queries specifically for the affected sensor and timeframe to provide diagnostic analysis.
