import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Database, Activity, HardDrive, Cpu, Globe,
  Zap, Loader2, AlertCircle, CheckCircle2,
  BrainCircuit, AlertTriangle, TrendingUp, Wrench, Clock, Server,
} from "lucide-react";

export const Route = createFileRoute("/_app/incidents")({
  head: () => ({ meta: [{ title: "Incident Analyst — CloudGuardian AI" }] }),
  component: IncidentAnalyst,
});

// ─────────────────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────────────────

const INCIDENTS = [
  {
    id: "db",
    label: "Database Credential Failure",
    icon: Database,
    severity: "critical" as const,
    service: "prod-rds-us-east-1",
    time: "2024-06-06 03:12 UTC",
    logs: [
      { t: "03:12:01", lvl: "ERROR",    msg: "Authentication failed for user 'app_user' on rds-proxy" },
      { t: "03:12:01", lvl: "ERROR",    msg: "FATAL: password authentication failed — app-server-1" },
      { t: "03:12:02", lvl: "WARN",     msg: "All connections exhausted — retrying in 5s (attempt 1/5)" },
      { t: "03:12:07", lvl: "ERROR",    msg: "Retry failed: SQLSTATE 28P01 Invalid authorization" },
      { t: "03:12:07", lvl: "ERROR",    msg: "pg_connect(): FATAL password authentication failed" },
      { t: "03:12:08", lvl: "CRITICAL", msg: "/api/health returning 503 — DB unreachable" },
      { t: "03:12:09", lvl: "ERROR",    msg: "PostgresException 28P01: auth failed — app-server-3" },
      { t: "03:12:10", lvl: "INFO",     msg: "secrets-manager: last rotation 2024-06-05 03:00 UTC (ok)" },
      { t: "03:12:10", lvl: "ERROR",    msg: "AccessDeniedException — IAM role missing GetSecretValue" },
      { t: "03:12:15", lvl: "CRITICAL", msg: "P0 Alert: DB connection failure rate 100% (60/60)" },
    ],
  },
  {
    id: "traffic",
    label: "Traffic Spike",
    icon: Activity,
    severity: "warning" as const,
    service: "api-gateway / checkout-svc",
    time: "2024-06-06 14:02 UTC",
    logs: [
      { t: "14:02:00", lvl: "INFO",     msg: "Requests/sec: 1,240  (baseline: 320)" },
      { t: "14:02:15", lvl: "WARN",     msg: "Request queue depth: 8,500  (threshold: 1,000)" },
      { t: "14:02:30", lvl: "WARN",     msg: "P99 latency: 4,200ms  (SLA: 800ms)" },
      { t: "14:02:45", lvl: "ERROR",    msg: "Circuit breaker OPEN — payment-svc timeout 5,000ms" },
      { t: "14:03:00", lvl: "ERROR",    msg: "Load balancer: 3/8 target instances unhealthy" },
      { t: "14:03:10", lvl: "WARN",     msg: "Auto-scaler: scale-out triggered 8 → 12 instances" },
      { t: "14:03:11", lvl: "ERROR",    msg: "429 Too Many Requests — rate limiter tripped" },
      { t: "14:03:20", lvl: "INFO",     msg: "CDN cache hit ratio dropped: 12%  (normal: 78%)" },
      { t: "14:03:25", lvl: "ERROR",    msg: "OOMKilled: container memory 3.9Gi / 4.0Gi limit" },
      { t: "14:03:30", lvl: "CRITICAL", msg: "P1: Checkout conversion -68% — estimated $42k/hr impact" },
    ],
  },
  {
    id: "memory",
    label: "Memory Leak",
    icon: Cpu,
    severity: "warning" as const,
    service: "k8s-prod / api-worker-pod",
    time: "2024-06-06 09:00 UTC",
    logs: [
      { t: "09:00:00", lvl: "INFO",     msg: "api-worker: Memory 512Mi / 2Gi  (25%)" },
      { t: "10:00:00", lvl: "INFO",     msg: "api-worker: Memory 820Mi / 2Gi  (40%)" },
      { t: "11:00:00", lvl: "WARN",     msg: "api-worker: Memory 1.3Gi / 2Gi  (65%) — rising fast" },
      { t: "12:00:00", lvl: "WARN",     msg: "api-worker: Memory 1.7Gi / 2Gi  (85%) — GC pressure" },
      { t: "12:15:00", lvl: "ERROR",    msg: "GC pause 2,800ms — application unresponsive" },
      { t: "12:30:00", lvl: "WARN",     msg: "api-worker: Memory 1.92Gi / 2Gi  (96%)" },
      { t: "12:45:00", lvl: "ERROR",    msg: "Heap dump triggered: /tmp/heapdump-1245.hprof (1.8Gi)" },
      { t: "12:50:00", lvl: "CRITICAL", msg: "OOMKilled: pod api-worker-7f4c terminated (exit 137)" },
      { t: "12:50:05", lvl: "INFO",     msg: "k8s: Pod restarted — restart count: 4" },
      { t: "12:50:06", lvl: "WARN",     msg: "EventListener cache: 14,200 registered, 0 released" },
    ],
  },
  {
    id: "storage",
    label: "Storage Full",
    icon: HardDrive,
    severity: "critical" as const,
    service: "prod-db-primary / data vol",
    time: "2024-06-06 22:00 UTC",
    logs: [
      { t: "22:00:00", lvl: "WARN",     msg: "Disk /data: 85% used  (340Gi / 400Gi)" },
      { t: "23:00:00", lvl: "WARN",     msg: "Disk /data: 90% used  (360Gi / 400Gi) — +20Gi/hr" },
      { t: "23:30:00", lvl: "ERROR",    msg: "postgres: WAL archival failed — ENOSPC" },
      { t: "23:45:00", lvl: "ERROR",    msg: "postgres: PANIC — could not write pg_wal, no space" },
      { t: "23:45:01", lvl: "CRITICAL", msg: "postgres: Database system is shut down" },
      { t: "23:45:02", lvl: "ERROR",    msg: "app-server-1: FATAL — PostgreSQL socket not found" },
      { t: "23:45:03", lvl: "CRITICAL", msg: "All DB health checks failing — cluster unavailable" },
      { t: "23:45:10", lvl: "INFO",     msg: "Disk /data: 99.8%  (399.2Gi / 400Gi)" },
      { t: "23:45:11", lvl: "ERROR",    msg: "backup-agent: Incremental backup failed — disk full" },
      { t: "23:46:00", lvl: "INFO",     msg: "log-analyzer: Largest files pg_wal 85Gi, audit_logs 62Gi" },
    ],
  },
  {
    id: "api",
    label: "API Service Down",
    icon: Globe,
    severity: "critical" as const,
    service: "payment-svc / eu-west-1",
    time: "2024-06-06 06:30 UTC",
    logs: [
      { t: "06:30:00", lvl: "INFO",     msg: "payment-svc started on :8080" },
      { t: "06:30:05", lvl: "ERROR",    msg: "Stripe API unreachable — connection refused (port 443)" },
      { t: "06:30:06", lvl: "ERROR",    msg: "TLS error: x509 certificate expired 2024-06-05 23:59" },
      { t: "06:30:07", lvl: "ERROR",    msg: "All outbound requests failing — UNHEALTHY" },
      { t: "06:30:10", lvl: "ERROR",    msg: "api-gateway: payment-svc health check failed (503)" },
      { t: "06:30:15", lvl: "ERROR",    msg: "Circuit breaker opened for /api/v1/payments" },
      { t: "06:30:20", lvl: "CRITICAL", msg: "P0: Payment processing completely unavailable" },
      { t: "06:30:25", lvl: "ERROR",    msg: "checkout-svc: PaymentServiceException — fallback exhausted" },
      { t: "06:31:00", lvl: "ERROR",    msg: "cert-manager: Certificate renewal failed — ACME timeout" },
      { t: "06:35:00", lvl: "CRITICAL", msg: "1,240 failed payments in 5 min — estimated loss $86,000" },
    ],
  },
];

type Incident = typeof INCIDENTS[number];

interface AnalysisResult {
  incidentType: string;
  rootCause: string;
  severity: string;
  confidenceScore: string;
  businessImpact: string;
  recommendedActions: string[];
  affected_services?: string[];
  estimated_recovery_time?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Style maps
// ─────────────────────────────────────────────────────────────────────────

const SEV = {
  critical: {
    dot:   "#ef4444",
    badge: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", color: "#f87171" },
    icon:  { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)",  color: "#f87171" },
    label: "CRITICAL",
  },
  warning: {
    dot:   "#f59e0b",
    badge: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", color: "#fbbf24" },
    icon:  { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  color: "#fbbf24" },
    label: "WARNING",
  },
  info: {
    dot:   "#3b82f6",
    badge: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.35)", color: "#60a5fa" },
    icon:  { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)",  color: "#60a5fa" },
    label: "INFO",
  },
};

const LVL = {
  CRITICAL: { bg: "rgba(239,68,68,0.08)", tag_bg: "rgba(239,68,68,0.2)",  tag_color: "#fca5a5", text: "#fca5a5", fw: "600" },
  ERROR:    { bg: "transparent",           tag_bg: "rgba(239,68,68,0.1)",  tag_color: "#f87171", text: "#f87171", fw: "400" },
  WARN:     { bg: "rgba(245,158,11,0.05)", tag_bg: "rgba(245,158,11,0.1)", tag_color: "#fbbf24", text: "#fbbf24", fw: "400" },
  INFO:     { bg: "transparent",           tag_bg: "rgba(34,197,94,0.1)",  tag_color: "#6ee7b7", text: "#6ee7b7", fw: "400" },
};

// ─────────────────────────────────────────────────────────────────────────
// Page — full-height 3-col layout
// ─────────────────────────────────────────────────────────────────────────

/*
  The AppShell <main> has: px-6 md:px-8  py-6 md:py-8
  TopNav is h-16 (64px).
  We escape that with negative margin trick so we can own the full height.
*/

function IncidentAnalyst() {
  const [selected, setSelected] = useState<Incident>(INCIDENTS[0]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const pick = (inc: Incident) => { setSelected(inc); setAnalysis(null); setError(null); };

  const analyze = async () => {
    setLoading(true); setAnalysis(null); setError(null);
    try {
      let res: Response;
      try {
        res = await fetch("http://localhost:8000/api/analyze-incident", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            incident_type: selected.label,
            logs: selected.logs.map(l => `[${l.t}] ${l.lvl} ${l.msg}`).join("\n"),
          }),
          signal: AbortSignal.timeout(90_000),
        });
      } catch (e: unknown) {
        const isTO = e instanceof DOMException && e.name === "TimeoutError";
        throw new Error(isTO ? "Request timed out — please retry." :
          "Cannot reach backend.\n\ncd backend\nuvicorn main:app --reload --port 8000");
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail ?? `HTTP ${res.status}`);
      setAnalysis(json.analysis as AnalysisResult);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  const ss = SEV[selected.severity];

  // Escape the parent <main> padding so we own the full height
  return (
    <div
      style={{
        // Pull back the parent's padding: px-8 py-8 = 32px each side
        margin: "-32px -32px -32px -32px",
        height: "calc(100vh - 64px)", // viewport minus topnav
        display: "grid",
        gridTemplateColumns: "20% 1fr 30%",
        gap: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >

      {/* ══════════════════════════════════════════════════
          COL 1  —  Incident Queue  (20%)
      ══════════════════════════════════════════════════ */}
      <div style={{
        height: "100%",
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        background: "#111827",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* col header */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#64748b", marginBottom: 4 }}>
            Incident Queue
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>5 Active Scenarios</div>
        </div>

        {/* incident cards */}
        <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: 8 }}>
          {INCIDENTS.map((inc) => {
            const Icon   = inc.icon;
            const active = selected.id === inc.id;
            const s      = SEV[inc.severity];
            return (
              <button
                key={inc.id}
                onClick={() => pick(inc)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: active ? "1px solid rgba(79,70,229,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  background: active ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                  minHeight: 64,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)"; }}
              >
                {/* icon box */}
                <div style={{
                  width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: active ? "rgba(79,70,229,0.2)" : s.icon.bg,
                  border: `1px solid ${active ? "rgba(79,70,229,0.4)" : s.icon.border}`,
                  color: active ? "#818cf8" : s.icon.color,
                }}>
                  <Icon size={15} />
                </div>

                {/* text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "#cbd5e1", lineHeight: 1.3 }}>
                    {inc.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {inc.service}
                  </div>
                </div>

                {/* severity dot */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          COL 2  —  Incident Details + Logs  (50%)
      ══════════════════════════════════════════════════ */}
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}>

        {/* ── Incident header (fixed height) ── */}
        <div style={{
          flexShrink: 0,
          padding: "18px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "#111827",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              {(() => {
                const Icon = selected.icon;
                return (
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: ss.icon.bg, border: `1px solid ${ss.icon.border}`, color: ss.icon.color,
                  }}>
                    <Icon size={18} />
                  </div>
                );
              })()}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>
                  {selected.label}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{selected.service}</div>
              </div>
            </div>
            <div style={{
              flexShrink: 0,
              fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20,
              background: ss.badge.bg, border: `1px solid ${ss.badge.border}`, color: ss.badge.color,
              letterSpacing: "0.08em",
            }}>
              {ss.label}
            </div>
          </div>

          {/* metadata row */}
          <div style={{ display: "flex", gap: 24, marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[
              { k: "Detected", v: selected.time },
              { k: "Type",     v: selected.label },
              { k: "Source",   v: selected.service },
            ].map(({ k, v }) => (
              <div key={k} style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#475569", marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Logs section header ── */}
        <div style={{
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#475569" }}>
            System Logs
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>{selected.logs.length} entries</div>
        </div>

        {/* ── Log rows (flex-1, scrollable) ── */}
        <div style={{ flex: 1, overflowY: "auto", background: "#05090f" }}>
          {/* column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "70px 48px 1fr",
            padding: "6px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.02)", position: "sticky", top: 0, zIndex: 1,
          }}>
            {["TIME", "LEVEL", "MESSAGE"].map(h => (
              <div key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#334155" }}>{h}</div>
            ))}
          </div>

          {/* log rows */}
          {selected.logs.map((row, i) => {
            const lv = LVL[row.lvl as keyof typeof LVL] ?? LVL.INFO;
            return (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "70px 48px 1fr",
                  padding: "0 16px",
                  minHeight: 40,
                  alignItems: "center",
                  background: lv.bg,
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  gap: 0,
                }}
              >
                {/* time */}
                <div style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", paddingRight: 8 }}>
                  {row.t}
                </div>
                {/* level badge */}
                <div>
                  <span style={{
                    display: "inline-block",
                    fontSize: 9, fontWeight: 700,
                    padding: "2px 6px", borderRadius: 4,
                    background: lv.tag_bg, color: lv.tag_color,
                    letterSpacing: "0.06em",
                  }}>
                    {row.lvl === "CRITICAL" ? "CRIT" : row.lvl}
                  </span>
                </div>
                {/* message */}
                <div style={{
                  fontFamily: "monospace", fontSize: 12.5,
                  color: lv.text, fontWeight: lv.fw as React.CSSProperties["fontWeight"],
                  paddingLeft: 8, wordBreak: "break-word",
                }}>
                  {row.msg}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Action footer ── */}
        <div style={{
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "#111827",
          gap: 12,
        }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {analysis ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#34d399", fontWeight: 600 }}>
                <CheckCircle2 size={15} /> Analysis complete
              </span>
            ) : loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#818cf8" }}>
                <Loader2 size={15} className="animate-spin" /> Analyzing logs…
              </span>
            ) : (
              `${selected.logs.length} log entries · ready`
            )}
          </div>
          <button
            onClick={analyze}
            disabled={loading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 20px", borderRadius: 10,
              background: "linear-gradient(135deg,#4F46E5,#8B5CF6)",
              boxShadow: "0 4px 18px -4px rgba(79,70,229,0.55)",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              border: "none",
              transition: "all 0.15s",
            }}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Analyzing…</> : <><Zap size={15} /> Analyze Incident</>}
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          COL 3  —  AI Analysis Report  (30%)
      ══════════════════════════════════════════════════ */}
      <div style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0f172a",
        overflow: "hidden",
      }}>
        {/* header */}
        <div style={{
          flexShrink: 0,
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "#111827",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
          }}>
            <BrainCircuit size={18} color="#a78bfa" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>AI Incident Report</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Groq · LLaMA 3.3 70B</div>
          </div>
          {analysis && <CheckCircle2 size={16} color="#34d399" />}
        </div>

        {/* scrollable report body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {loading   && <ReportSkeleton />}
          {!loading && error    && <ErrorState msg={error} />}
          {!loading && !error && !analysis && <EmptyState />}
          {!loading && !error && analysis  && <AnalysisReport data={analysis} />}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Analysis Report
// ─────────────────────────────────────────────────────────────────────────

function AnalysisReport({ data }: { data: AnalysisResult }) {
  const sevColor: Record<string, { bg: string; border: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.3)",  color: "#f87171" },
    High:     { bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.3)", color: "#fb923c" },
    Medium:   { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", color: "#fbbf24" },
    Low:      { bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.3)",  color: "#4ade80" },
  };
  const sc    = sevColor[data.severity] ?? { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", color: "#94a3b8" };
  const score = parseFloat(String(data.confidenceScore)) || 0;
  const barC  = score >= 85 ? "#22c55e" : score >= 65 ? "#f59e0b" : "#ef4444";
  const numC  = score >= 85 ? "#4ade80" : score >= 65 ? "#fbbf24" : "#f87171";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Severity + Confidence row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* severity */}
        <div style={{ padding: "12px 14px", borderRadius: 10, background: sc.bg, border: `1px solid ${sc.border}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: sc.color, opacity: 0.7, marginBottom: 6 }}>Severity</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} color={sc.color} />
            <span style={{ fontSize: 14, fontWeight: 700, color: sc.color }}>{data.severity}</span>
          </div>
        </div>
        {/* confidence */}
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#475569", marginBottom: 6 }}>Confidence</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: numC, lineHeight: 1 }}>
            {score > 0 ? `${score}%` : data.confidenceScore}
          </div>
          {score > 0 && (
            <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${score}%`, background: barC, borderRadius: 4 }} />
            </div>
          )}
        </div>
      </div>

      {/* Root Cause */}
      <AiCard icon={<AlertTriangle size={13} color="#f87171" />} label="Root Cause" accentColor="#ef4444">
        <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, margin: 0 }}>{data.rootCause}</p>
      </AiCard>

      {/* Business Impact */}
      <AiCard icon={<TrendingUp size={13} color="#fbbf24" />} label="Business Impact" accentColor="#f59e0b">
        <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>{data.businessImpact}</p>
      </AiCard>

      {/* Recommended Actions */}
      <AiCard icon={<Wrench size={13} color="#4ade80" />} label="Recommended Actions" accentColor="#22c55e">
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {(data.recommendedActions ?? []).map((a, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", minHeight: 32 }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)",
                color: "#4ade80", fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.55 }}>{a}</span>
            </li>
          ))}
        </ol>
      </AiCard>

      {/* Recovery time */}
      {data.estimated_recovery_time && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Clock size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#475569", marginBottom: 3 }}>Est. Recovery Time</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{data.estimated_recovery_time}</div>
          </div>
        </div>
      )}

      {/* Affected services */}
      {(data.affected_services ?? []).length > 0 && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Server size={12} color="#475569" />
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#475569" }}>Affected Services</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {data.affected_services!.map(sv => (
              <span key={sv} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}>
                {sv}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AI Card wrapper
// ─────────────────────────────────────────────────────────────────────────

function AiCard({ icon, label, accentColor, children }: {
  icon: React.ReactNode; label: string; accentColor: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: `3px solid ${accentColor}`,
      background: "rgba(255,255,255,0.02)",
      overflow: "hidden",
    }}>
      {/* card header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.015)",
      }}>
        {icon}
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#475569" }}>{label}</span>
      </div>
      {/* card body */}
      <div style={{ padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// States
// ─────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 16px", gap: 16, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BrainCircuit size={26} color="rgba(167,139,250,0.5)" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>No Analysis Yet</div>
        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
          Select an incident and click<br /><strong style={{ color: "rgba(255,255,255,0.35)" }}>Analyze Incident</strong> to begin
        </div>
      </div>
    </div>
  );
}

function ErrorState({ msg }: { msg: string }) {
  return (
    <div style={{ borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", overflow: "hidden", background: "rgba(239,68,68,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.1)" }}>
        <AlertCircle size={14} color="#f87171" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#f87171" }}>Analysis Failed</span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <pre style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{msg}</pre>
      </div>
    </div>
  );
}

function ReportSkeleton() {
  const heights = [68, 68, 80, 80, 130, 52];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ height: 68, borderRadius: 10 }} className="skeleton" />
        <div style={{ height: 68, borderRadius: 10 }} className="skeleton" />
      </div>
      {heights.slice(2).map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 10 }} className="skeleton" />
      ))}
    </div>
  );
}
