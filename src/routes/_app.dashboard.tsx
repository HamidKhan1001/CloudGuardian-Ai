import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DollarSign, TrendingUp, AlertTriangle, PiggyBank, Sparkles, Cpu, Database,
  HardDrive, Cloud, ArrowRight, Lightbulb, Server, Zap, CheckCircle2, Bot,
} from "lucide-react";
import { Card, KpiCard, PageHeader, AreaChart, BarsChart, DonutChart, SectionTitle, Button, StatusDot, Sparkline } from "@/components/ui-kit";
import { notificationsStore } from "@/lib/notifications-store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CloudGuardian AI" }] }),
  component: Dashboard,
});

const trend = [42,46,44,49,53,51,58,62,60,67,72,70,78,82,79,86,92,88,95,102,98,108,115,124];
const monthly = [9.2,10.1,8.6,11.4,12.7,13.5,12.0,14.1,15.6,14.2,16.8,18.5];

function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cloud Operations Intelligence"
        title="Executive Dashboard"
        subtitle="Monitor costs, predict spending, identify incidents, and receive AI-powered recommendations across your entire cloud footprint."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => fetch("http://localhost:8000/api/notifications/simulate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "critical",
                title: "Database Connection Failure",
                message: "prod-rds-us-east scaled and is rejecting connection bursts.",
                service: "prod-rds-us-east"
              })
            }).catch(console.error)}>
              <AlertTriangle className="size-3.5" /> Simulate Incident
            </Button>
            <Button variant="outline" size="sm">Last 30 days</Button>
            <Link to="/cfo"><Button size="sm"><Sparkles className="size-3.5" /> Ask AI CFO</Button></Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Current Cloud Spend" value={12450} suffix="$" icon={DollarSign} accent="primary" trend={8.4} trendLabel="vs last month" />
        <KpiCard label="Predicted Monthly Bill" value={18500} suffix="$" icon={TrendingUp} accent="info" trend={37} trendLabel="forecasted" />
        <KpiCard label="Active Incidents" value={8} icon={AlertTriangle} accent="danger" trend={-12} trendLabel="resolved today" />
        <KpiCard label="Potential Savings" value={4200} suffix="$" icon={PiggyBank} accent="success" trend={22} trendLabel="optimizations" />
      </div>

      {/* Cost analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Cost Trend"
            hint="Real-time spend across all connected providers"
            action={
              <div className="flex gap-1 text-xs">
                {["1D","7D","30D","90D","1Y"].map((t,i) => (
                  <button key={t} className={`px-2.5 py-1 rounded-md ${i===2 ? "bg-white/[0.06] text-white" : "text-muted-foreground hover:text-white"}`}>{t}</button>
                ))}
              </div>
            }
          />
          <div className="h-64"><AreaChart data={trend} gradientId="trendG" /></div>
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <Mini label="AWS" value="$6,820" delta="+4.2%" data={[3,5,4,6,7,6,8,9,10,11]} color="var(--warning)" />
            <Mini label="GCP" value="$3,140" delta="+11.3%" data={[2,3,3,4,4,5,5,6,7,8]} color="var(--info)" />
            <Mini label="Azure" value="$2,490" delta="-2.1%" data={[5,5,6,5,5,4,5,4,4,4]} color="var(--success)" />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Cost Breakdown" hint="By service category" />
          <div className="flex items-center justify-center my-2">
            <DonutChart
              segments={[
                { label: "Compute", value: 5200, color: "#4F46E5" },
                { label: "Storage", value: 2400, color: "#8B5CF6" },
                { label: "Database", value: 2100, color: "#3B82F6" },
                { label: "Network", value: 1500, color: "#22C55E" },
                { label: "Other", value: 1250, color: "#F59E0B" },
              ]}
            />
          </div>
          <div className="mt-3 space-y-2">
            {[
              ["Compute","$5,200","#4F46E5"],
              ["Storage","$2,400","#8B5CF6"],
              ["Database","$2,100","#3B82F6"],
              ["Network","$1,500","#22C55E"],
              ["Other","$1,250","#F59E0B"],
            ].map(([l,v,c]) => (
              <div key={l} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2 rounded-sm" style={{ background: c }} />{l}
                </div>
                <span className="text-white font-medium tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly + utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle title="Monthly Spending" hint="Trailing 12 months" />
          <div className="h-56"><BarsChart data={monthly} color="#4F46E5" /></div>
        </Card>
        <Card>
          <SectionTitle title="Service Utilization" />
          <div className="space-y-4 mt-2">
            {[
              { l: "Compute (EC2)", v: 78, icon: Cpu, c: "var(--primary)" },
              { l: "Storage (S3)", v: 54, icon: HardDrive, c: "var(--info)" },
              { l: "Database (RDS)", v: 92, icon: Database, c: "var(--warning)" },
              { l: "Edge / CDN", v: 33, icon: Cloud, c: "var(--success)" },
            ].map(({ l, v, icon: I, c }) => (
              <div key={l}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-2 text-muted-foreground"><I className="size-3.5" /> {l}</span>
                  <span className="text-white font-medium">{v}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Cloud CFO */}
      <Card className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px grad-primary" />
        <div className="relative flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-11 rounded-xl grad-primary flex items-center justify-center"><Bot className="size-5 text-white" /></div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-primary font-semibold">AI Cloud CFO</div>
                <h3 className="text-lg font-semibold">Financial Forecast</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Based on current consumption and traffic patterns, your monthly bill is projected to grow 37% by month-end.
              I've identified $4,200 in monthly savings across three optimizations.
            </p>
            <div className="mt-5 flex gap-2">
              <Link to="/cfo"><Button size="sm"><Sparkles className="size-3.5" /> View Plan</Button></Link>
              <Button size="sm" variant="outline">Export PDF</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
            {[
              { l: "Predicted Bill", v: "$18,500", s: "End of month", c: "text-white" },
              { l: "Cost Increase", v: "+37%", s: "vs prior period", c: "text-warning" },
              { l: "Primary Cause", v: "Traffic Growth", s: "EU + US-East", c: "text-info" },
              { l: "Potential Savings", v: "$4,200/mo", s: "3 actions", c: "text-success" },
            ].map((k) => (
              <div key={k.l} className="rounded-xl border border-border bg-white/[0.02] p-4">
                <div className="text-[11px] text-muted-foreground">{k.l}</div>
                <div className={`text-xl font-semibold mt-1.5 ${k.c}`}>{k.v}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{k.s}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Savings + Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionTitle title="Savings Center" hint="AI-recommended optimizations" action={<Link to="/savings" className="text-xs text-primary flex items-center gap-1">View all <ArrowRight className="size-3" /></Link>} />
          <div className="space-y-3">
            <SavingsRow icon={Server} title="Remove Idle Servers" desc="14 EC2 instances under 5% utilization for 30+ days" savings="$1,200" />
            <SavingsRow icon={Zap} title="Use Spot Instances" desc="Migrate batch workloads to spot capacity" savings="$1,500" />
            <SavingsRow icon={Database} title="Reduce Database Size" desc="Right-size 3 overprovisioned RDS clusters" savings="$1,500" />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Active Incidents" hint="Last 24 hours" action={<Link to="/incidents" className="text-xs text-primary flex items-center gap-1">Open analyst <ArrowRight className="size-3" /></Link>} />
          <div className="divide-y divide-border -mx-5">
            {[
              { s: "critical", t: "DB Connection Failure", svc: "prod-rds-us-east", time: "4m ago" },
              { s: "warning", t: "High CPU on api-gateway", svc: "k8s-prod-cluster", time: "22m ago" },
              { s: "info", t: "Certificate expiring in 7d", svc: "edge-cdn.acme.com", time: "1h ago" },
              { s: "warning", t: "Memory pressure: cache-01", svc: "redis-prod", time: "2h ago" },
            ].map((i) => (
              <div key={i.t} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition cursor-pointer">
                <StatusDot status={i.s as "critical"|"warning"|"info"} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.t}</div>
                  <div className="text-xs text-muted-foreground truncate">{i.svc}</div>
                </div>
                <span className="text-xs text-muted-foreground">{i.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Mini({ label, value, delta, data, color }: { label: string; value: string; delta: string; data: number[]; color: string }) {
  const pos = !delta.startsWith("-");
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-2 mt-0.5">
        <span className="text-base font-semibold tabular-nums">{value}</span>
        <span className={`text-[11px] ${pos ? "text-success" : "text-danger"}`}>{delta}</span>
      </div>
      <Sparkline data={data} color={color} />
    </div>
  );
}

function SavingsRow({ icon: Icon, title, desc, savings }: { icon: typeof Lightbulb; title: string; desc: string; savings: string }) {
  return (
    <div className="group flex items-center gap-4 p-3 rounded-xl border border-border bg-white/[0.015] hover:bg-white/[0.04] hover:border-border-strong transition">
      <div className="size-10 rounded-lg bg-success/10 text-success flex items-center justify-center"><Icon className="size-5" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{desc}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-success">{savings}</div>
        <div className="text-[10px] text-muted-foreground">/month</div>
      </div>
      <button className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/[0.04] transition opacity-0 group-hover:opacity-100">
        <CheckCircle2 className="size-4" />
      </button>
    </div>
  );
}
