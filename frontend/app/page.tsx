"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Command,
  Crosshair,
  FileText,
  Lightbulb,
  Megaphone,
  MessageCircle,
  Play,
  RefreshCw,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

type Analysis = {
  revenue_change_percent: number;
  recent_revenue: number;
  previous_revenue: number;
  evening_change_percent: number;
  affected_product: string;
  affected_product_change_percent?: number;
  product_analysis?: {
    product: string;
    previous_revenue: number;
    recent_revenue: number;
    change_percent: number;
  }[];
  problem: string;
  recommended_action: string;
};

type Campaign = {
  id: string;
  type: string;
  objective: string;
  target_segment: string;
  target_time: string;
  affected_product: string;
  offer: string;
  message: string;
  channel: string;
  status: string;
  expected_impact: string;
  created_at: string;
};

type ActivityItem = {
  id: string;
  timestamp: string;
  action: string;
  message: string;
  status: string;
};

type AgentStatus = {
  status: string;
  current_task: string;
  activity_log: ActivityItem[];
  campaign: Campaign | null;
};

type CampaignMetrics = {
  customers_reached: number;
  messages_delivered: number;
  conversions: number;
  attributed_revenue: number;
  revenue_uplift: number;
  roi: number;
};

const navItems = [
  { name: "Dashboard", icon: BarChart3 },
  { name: "AI Agent", icon: Bot },
  { name: "Campaigns", icon: Megaphone },
  { name: "Customers", icon: Users },
  { name: "Analytics", icon: TrendingUp },
  { name: "Activity", icon: Activity },
];

function formatTime(timestamp: string) {
  if (!timestamp) return "--:--";

  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--:--";
  }
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ").toUpperCase();
}

export default function Home() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [agent, setAgent] = useState<AgentStatus>({
    status: "idle",
    current_task: "Waiting for instruction",
    activity_log: [],
    campaign: null,
  });

  const [campaignMetrics, setCampaignMetrics] =
    useState<CampaignMetrics | null>(null);

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationMessage, setSimulationMessage] = useState("");

  async function loadDashboard() {
    try {
      const [analysisResponse, agentResponse] = await Promise.all([
        fetch(`${API}/api/business-analysis`),
        fetch(`${API}/api/agent/status`),
      ]);

      if (analysisResponse.ok) {
        setAnalysis(await analysisResponse.json());
      }

      if (agentResponse.ok) {
        setAgent(await agentResponse.json());
      }
    } catch (error) {
      console.error("Dashboard loading failed:", error);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const activeStatuses = [
      "observing",
      "analyzing",
      "deciding",
      "executing",
    ];

    if (!activeStatuses.includes(agent.status)) {
      return;
    }

    const interval = setInterval(loadDashboard, 700);

    return () => clearInterval(interval);
  }, [agent.status]);

  async function runInvestigation() {
    setLoading(true);
    setCampaignMetrics(null);

    try {
      const response = await fetch(`${API}/api/agent/investigate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Investigation request failed.");
      }

      await loadDashboard();
    } catch (error) {
      console.error("Investigation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function simulateTransaction() {
    setSimulationLoading(true);
    setSimulationMessage("");

    try {
      const response = await fetch(`${API}/api/simulation/transaction`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Transaction simulation failed.");
      }

      const data = await response.json();

      setSimulationMessage(
        `Transaction of ₹${data.transaction.amount} recorded`
      );

      await loadDashboard();

      setTimeout(() => {
        setSimulationMessage("");
      }, 4000);
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulationMessage("Unable to simulate transaction.");
    } finally {
      setSimulationLoading(false);
    }
  }

  async function approveCampaign() {
    setActionLoading(true);

    try {
      const response = await fetch(`${API}/api/agent/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Approval request failed.");
      }

      await loadDashboard();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  async function executeCampaign() {
    setActionLoading(true);

    try {
      const response = await fetch(`${API}/api/agent/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Execution request failed.");
      }

      await loadDashboard();

      setTimeout(() => {
        setCampaignMetrics({
          customers_reached: 1248,
          messages_delivered: 1196,
          conversions: 86,
          attributed_revenue: 12480,
          revenue_uplift: 18.6,
          roi: 4.2,
        });
      }, 1500);
    } catch (error) {
      console.error("Execution failed:", error);
    } finally {
      setActionLoading(false);
    }
  }

  const revenueChange = analysis?.revenue_change_percent ?? 0;
  const eveningChange = analysis?.evening_change_percent ?? 0;

  const affectedProductChange =
    analysis?.product_analysis?.find(
      (product) => product.product === analysis.affected_product
    )?.change_percent ??
    analysis?.affected_product_change_percent ??
    0;

  const activeStatuses = [
    "observing",
    "analyzing",
    "deciding",
    "executing",
  ];

  const isRunning =
    loading || activeStatuses.includes(agent.status);

  const pipelineSteps = [
    {
      key: "observing",
      label: "OBSERVE",
    },
    {
      key: "analyzing",
      label: "ANALYZE",
    },
    {
      key: "deciding",
      label: "DECIDE",
    },
    {
      key: "waiting_for_approval",
      label: "APPROVAL",
    },
  ];

  const statusOrder = [
    "observing",
    "analyzing",
    "deciding",
    "waiting_for_approval",
    "approved",
    "executing",
    "executed",
  ];

  const currentStatusIndex = statusOrder.indexOf(agent.status);

  /* ============================================================
     REUSABLE ACTIVITY LIST
     ============================================================ */

  const ActivityTimeline = ({
    compact = false,
  }: {
    compact?: boolean;
  }) => (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      {agent.activity_log.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
            <Activity className="h-6 w-6 text-slate-300" />
          </div>

          <p className="mt-4 text-sm font-bold text-slate-500">
            No activity yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Run an AI investigation to get started.
          </p>
        </div>
      ) : (
        agent.activity_log
          .slice()
          .reverse()
          .map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="relative flex gap-4"
            >
              {index !== agent.activity_log.length - 1 && (
                <div className="absolute left-[17px] top-9 h-full w-px bg-slate-100" />
              )}

              <div
                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  item.status === "completed"
                    ? "bg-emerald-50 text-emerald-500"
                    : item.status === "running"
                      ? "bg-blue-50 text-blue-500"
                      : "bg-violet-50 text-violet-500"
                }`}
              >
                {item.status === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-700">
                    {item.action}
                  </p>

                  <span className="shrink-0 text-[10px] text-slate-400">
                    {formatTime(item.timestamp)}
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  {item.message}
                </p>
              </div>
            </div>
          ))
      )}
    </div>
  );

  /* ============================================================
     WORKSPACE PANELS
     ============================================================ */

  function renderWorkspacePanel() {
    if (activeTab === "AI Agent") {
      return (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-violet-100 bg-white p-7 shadow-sm">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-100">
                  <Bot className="h-7 w-7" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900">
                      AI Agent
                    </h1>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                        isRunning
                          ? "bg-blue-50 text-blue-600"
                          : agent.status === "waiting_for_approval"
                            ? "bg-orange-50 text-orange-600"
                            : agent.status === "executed"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {formatStatus(agent.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    Autonomous merchant growth teammate
                  </p>
                </div>
              </div>

              <button
                onClick={runInvestigation}
                disabled={isRunning}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}

                {isRunning ? "Agent is working..." : "Run Investigation"}
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {pipelineSteps.map((step, index) => {
                const stepIndex = statusOrder.indexOf(step.key);
                const completed = currentStatusIndex > stepIndex;
                const current = agent.status === step.key;

                return (
                  <div
                    key={step.key}
                    className={`rounded-2xl border p-5 ${
                      current
                        ? "border-blue-200 bg-blue-50"
                        : completed
                          ? "border-emerald-100 bg-emerald-50"
                          : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          completed
                            ? "bg-emerald-100 text-emerald-600"
                            : current
                              ? "bg-blue-100 text-blue-600"
                              : "bg-white text-slate-400"
                        }`}
                      >
                        {completed ? (
                          <Check className="h-5 w-5" />
                        ) : current ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span className="text-[10px] font-black text-slate-400">
                        0{index + 1}
                      </span>
                    </div>

                    <p
                      className={`mt-5 text-xs font-black ${
                        current
                          ? "text-blue-600"
                          : completed
                            ? "text-emerald-600"
                            : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {current
                        ? "In progress"
                        : completed
                          ? "Completed"
                          : "Waiting"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Command className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                    Current task
                  </p>

                  <p className="mt-1 text-base font-black text-slate-800">
                    {agent.current_task}
                  </p>
                </div>
              </div>

              {analysis && (
                <div className="mt-6 rounded-xl bg-slate-50 p-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Latest reasoning
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {analysis.recommended_action}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-900">
                    Live Agent Activity
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Real-time autonomous actions
                  </p>
                </div>

                <Activity className="text-cyan-500" />
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                <ActivityTimeline compact />
              </div>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "Campaigns") {
      return (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-pink-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                <Megaphone className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  Campaigns
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  AI-generated merchant growth actions
                </p>
              </div>
            </div>
          </section>

          {!agent.campaign ? (
            <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50">
                <Megaphone className="h-7 w-7 text-violet-500" />
              </div>

              <h2 className="mt-5 text-lg font-black text-slate-800">
                No campaign generated yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Run an AI investigation. PayPilot will identify a business
                signal and create an actionable campaign.
              </p>

              <button
                onClick={runInvestigation}
                disabled={isRunning}
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-violet-100 disabled:opacity-50"
              >
                {isRunning ? "Agent Working..." : "Generate AI Campaign"}
              </button>
            </section>
          ) : (
            <section className="rounded-2xl border border-violet-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">
                      {agent.campaign.type}
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      {agent.campaign.offer}
                    </h2>
                  </div>

                  <span className="rounded-full bg-violet-50 px-4 py-2 text-[10px] font-black uppercase text-violet-600">
                    {formatStatus(agent.campaign.status)}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm leading-6 text-slate-500">
                    {agent.campaign.objective}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Target segment
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {agent.campaign.target_segment}
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-[10px] font-black uppercase text-blue-400">
                        Timing
                      </p>

                      <p className="mt-1 text-sm font-bold text-blue-700">
                        {agent.campaign.target_time}
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-[10px] font-black uppercase text-emerald-500">
                        Channel
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {agent.campaign.channel}
                      </p>
                    </div>

                    <div className="rounded-xl bg-pink-50 p-4">
                      <p className="text-[10px] font-black uppercase text-pink-500">
                        Product
                      </p>

                      <p className="mt-1 text-sm font-bold text-pink-700">
                        {agent.campaign.affected_product}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-5">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">
                          Generated message
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {agent.campaign.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50 p-6">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Proposed offer
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {agent.campaign.offer}
                  </p>

                  <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Expected impact
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {agent.campaign.expected_impact}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {agent.campaign.status === "awaiting_approval" && (
                      <button
                        onClick={approveCampaign}
                        disabled={actionLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <Check className="h-5 w-5" />
                        )}
                        Approve Campaign
                      </button>
                    )}

                    {agent.campaign.status === "approved" && (
                      <button
                        onClick={executeCampaign}
                        disabled={actionLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <Play className="h-5 w-5 fill-current" />
                        )}
                        Execute with n8n
                      </button>
                    )}

                    {agent.campaign.status === "executing" && (
                      <div className="flex items-center justify-center gap-3 rounded-xl bg-blue-50 px-5 py-3.5 text-sm font-black text-blue-600">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Executing Campaign...
                      </div>
                    )}

                    {agent.campaign.status === "executed" && (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3.5 text-sm font-black text-emerald-600">
                        <Check className="h-5 w-5" />
                        Campaign Executed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {campaignMetrics && agent.campaign?.status === "executed" && (
            <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BarChart3 className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Campaign Impact
                  </h2>

                  <p className="text-xs text-slate-400">
                    Measured outcome from the simulated execution
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[
                  [
                    "Customers",
                    campaignMetrics.customers_reached.toLocaleString("en-IN"),
                    "blue",
                  ],
                  [
                    "Delivered",
                    campaignMetrics.messages_delivered.toLocaleString("en-IN"),
                    "cyan",
                  ],
                  ["Conversions", campaignMetrics.conversions, "violet"],
                  [
                    "Revenue",
                    `₹${campaignMetrics.attributed_revenue.toLocaleString("en-IN")}`,
                    "emerald",
                  ],
                  [
                    "Uplift",
                    `+${campaignMetrics.revenue_uplift}%`,
                    "pink",
                  ],
                  ["ROI", `${campaignMetrics.roi}×`, "orange"],
                ].map(([label, value, tone]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      {label}
                    </p>

                    <p
                      className={`mt-3 text-2xl font-black ${
                        tone === "emerald"
                          ? "text-emerald-600"
                          : tone === "pink"
                            ? "text-pink-600"
                            : tone === "orange"
                              ? "text-orange-600"
                              : tone === "violet"
                                ? "text-violet-600"
                                : tone === "cyan"
                                  ? "text-cyan-600"
                                  : "text-blue-600"
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }

    if (activeTab === "Customers") {
      return (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-emerald-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Users className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  Customers
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  AI-powered customer targeting and segmentation
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <Users className="text-blue-500" />

              <p className="mt-6 text-3xl font-black text-slate-900">
                {campaignMetrics?.customers_reached?.toLocaleString(
                  "en-IN"
                ) ?? "1,248"}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-400">
                Eligible customers
              </p>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <Clock3 className="text-violet-500" />

              <p className="mt-6 text-3xl font-black text-slate-900">
                5–8 PM
              </p>

              <p className="mt-1 text-sm font-bold text-slate-400">
                Target activity window
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <Target className="text-orange-500" />

              <p className="mt-6 text-3xl font-black text-slate-900">
                {campaignMetrics?.conversions ?? 86}
              </p>

              <p className="mt-1 text-sm font-bold text-slate-400">
                Simulated conversions
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Crosshair className="text-violet-500" />

              <div>
                <h2 className="font-black text-slate-900">
                  Active AI Target Segment
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Generated from the detected business signal
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 p-5">
              <p className="font-black text-slate-800">
                {agent.campaign?.target_segment ??
                  "Customers active during evening hours"}
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                PayPilot focuses the campaign on customers whose historical
                behaviour matches the identified opportunity instead of
                sending a broad promotion to every customer.
              </p>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "Analytics") {
      return (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-indigo-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  Analytics
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Business signals powering autonomous decisions
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <TrendingDown className="text-red-500" />

              <p className="mt-5 text-xs font-black uppercase text-slate-400">
                Revenue Change
              </p>

              <p className="mt-2 text-3xl font-black text-red-600">
                {revenueChange.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
              <Clock3 className="text-orange-500" />

              <p className="mt-5 text-xs font-black uppercase text-slate-400">
                Evening Change
              </p>

              <p className="mt-2 text-3xl font-black text-orange-600">
                {eveningChange.toFixed(1)}%
              </p>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
              <Coffee className="text-pink-500" />

              <p className="mt-5 text-xs font-black uppercase text-slate-400">
                Affected Product
              </p>

              <p className="mt-2 truncate text-xl font-black text-slate-900">
                {analysis?.affected_product ?? "—"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-blue-500" />

              <div>
                <h2 className="font-black text-slate-900">
                  Product Performance
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Previous period vs recent period
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {analysis?.product_analysis?.length ? (
                analysis.product_analysis.map((product) => (
                  <div
                    key={product.product}
                    className="flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {product.product}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ₹
                        {product.previous_revenue.toLocaleString(
                          "en-IN"
                        )}{" "}
                        → ₹
                        {product.recent_revenue.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-black ${
                        product.change_percent < 0
                          ? "text-red-500"
                          : "text-emerald-500"
                      }`}
                    >
                      {product.change_percent > 0 ? "+" : ""}
                      {product.change_percent.toFixed(1)}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-slate-400">
                  Run an AI investigation to populate product analytics.
                </p>
              )}
            </div>
          </section>

          {campaignMetrics && (
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
              <div className="flex items-center gap-3">
                <Sparkles className="text-emerald-600" />

                <div>
                  <h2 className="font-black text-slate-900">
                    Campaign Outcome
                  </h2>

                  <p className="text-xs text-slate-500">
                    Simulated measurement after autonomous execution
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs text-slate-400">
                    Attributed Revenue
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-600">
                    ₹
                    {campaignMetrics.attributed_revenue.toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs text-slate-400">
                    Revenue Uplift
                  </p>

                  <p className="mt-2 text-xl font-black text-emerald-600">
                    +{campaignMetrics.revenue_uplift}%
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs text-slate-400">ROI</p>

                  <p className="mt-2 text-xl font-black text-emerald-600">
                    {campaignMetrics.roi}×
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      );
    }

    if (activeTab === "Activity") {
      return (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-cyan-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <Activity className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  Activity Center
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Everything your AI teammate has observed and executed
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-black text-slate-900">
                  Agent Timeline
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Live autonomous activity log
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-[10px] font-black ${
                  isRunning
                    ? "bg-blue-50 text-blue-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isRunning ? "LIVE" : "MONITORING"}
              </span>
            </div>

            <ActivityTimeline />
          </section>
        </div>
      );
    }

    return null;
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-800">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* =========================================================
            SIDEBAR
           ========================================================= */}

        <aside className="hidden w-72 shrink-0 flex-col border-r border-blue-950/30 bg-gradient-to-b from-[#071a41] via-[#08265b] to-[#063b78] px-6 py-7 text-white shadow-2xl shadow-blue-950/20 lg:flex">
          <div className="mb-12 flex items-center gap-4 px-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-black/20">
              <img
                src="/assets/paytm-logo.png"
                alt="Paytm"
                className="h-11 w-auto max-w-[145px] object-contain"
              />
            </div>

            <div>
              <p className="text-xl font-black tracking-tight text-white">
                PayPilot
              </p>

              <p className="mt-0.5 text-xs font-medium text-blue-200">
                Autonomous AI
              </p>
            </div>
          </div>

          <div className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">
            Workspace
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-[15px] font-bold transition-all ${
                    active
                      ? "bg-white text-[#0755a5] shadow-lg shadow-black/10"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active
                        ? "text-[#0755a5]"
                        : "text-blue-200 group-hover:text-white"
                    }`}
                  />

                  <span>{item.name}</span>

                  {item.name === "AI Agent" && (
                    <span
                      className={`ml-auto h-2.5 w-2.5 rounded-full ${
                        active
                          ? "bg-emerald-500"
                          : "bg-emerald-400 shadow-lg shadow-emerald-300/50"
                      }`}
                    />
                  )}

                  {active && (
                    <ChevronRight className="ml-auto h-4 w-4 text-[#00BAF2]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-950/30">
                <Bot className="h-6 w-6" />
              </div>

              <span className="flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-300/50" />
                ONLINE
              </span>
            </div>

            <p className="text-base font-black text-white">
              PayPilot Agent
            </p>

            <p className="mt-1.5 text-xs leading-5 text-blue-200">
              Monitoring your business and identifying growth opportunities.
            </p>
          </div>

          <button className="mt-5 flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-white/10 hover:text-white">
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </aside>

        {/* =========================================================
            MAIN
           ========================================================= */}

        <section className="min-w-0 flex-1">
          {/* HEADER */}

          <header className="sticky top-0 z-30 flex h-[88px] items-center justify-between border-b border-slate-200/70 bg-white/85 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-5">
              <div className="flex h-[68px] items-center rounded-2xl bg-white px-5 shadow-md shadow-blue-100/70 ring-1 ring-slate-100">
                <img
                  src="/assets/paytm-logo.png"
                  alt="Paytm"
                  className="h-14 w-auto max-w-[190px] object-contain"
                />
              </div>

              <div className="hidden h-9 w-px bg-slate-200 sm:block" />

              <div className="hidden sm:block">
                <p className="text-base font-bold text-slate-800">
                  Merchant Intelligence
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Autonomous growth workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`hidden items-center gap-2 rounded-full px-4 py-2 sm:flex ${
                  isRunning
                    ? "border border-blue-200 bg-blue-50"
                    : "border border-emerald-100 bg-emerald-50"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isRunning
                      ? "animate-pulse bg-blue-500"
                      : "animate-pulse bg-emerald-500"
                  }`}
                />

                <span
                  className={`text-xs font-bold ${
                    isRunning ? "text-blue-700" : "text-emerald-700"
                  }`}
                >
                  {isRunning ? "AGENT WORKING" : "AGENT ONLINE"}
                </span>
              </div>

              <button
                onClick={loadDashboard}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-base font-black text-white shadow-lg shadow-blue-200">
                S
              </div>
            </div>
          </header>

          {/* =======================================================
              DASHBOARD
             ======================================================= */}

          {activeTab === "Dashboard" ? (
            <div className="mx-auto max-w-[1500px] space-y-7 p-5 md:p-8">
              {/* HERO */}

              <section className="relative overflow-hidden rounded-[30px] border border-blue-100 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2efff] p-7 shadow-sm md:p-9">
                <div className="absolute right-[-80px] top-[-100px] h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

                <div className="absolute bottom-[-100px] right-1/3 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                  <div className="max-w-3xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 shadow-sm">
                      <Sparkles className="h-4 w-4 text-violet-500" />

                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-violet-600">
                        Autonomous AI Teammate
                      </span>
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                      Good afternoon,{" "}
                      <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">
                        Sanvi.
                      </span>
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500 md:text-lg">
                      Your AI teammate continuously monitors your business,
                      identifies growth opportunities, and prepares actions
                      for your approval.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <button
                        onClick={runInvestigation}
                        disabled={isRunning}
                        className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#00BAF2] via-blue-600 to-violet-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRunning ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <Zap className="h-5 w-5" />
                        )}

                        {isRunning
                          ? "Agent is working..."
                          : "Run AI Investigation"}

                        {!isRunning && (
                          <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                        )}
                      </button>

                      <button
                        onClick={simulateTransaction}
                        disabled={simulationLoading}
                        className="group flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-5 py-3.5 text-sm font-black text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {simulationLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <ShoppingBag className="h-5 w-5" />
                        )}

                        {simulationLoading
                          ? "Recording..."
                          : "Simulate Transaction"}
                      </button>

                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 py-3.5 text-sm font-medium text-slate-500">
                        <Clock3 className="h-5 w-5 text-slate-400" />
                        Live agent monitoring
                      </div>
                    </div>

                    {simulationMessage && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        <Check className="h-5 w-5" />
                        {simulationMessage}
                      </div>
                    )}
                  </div>

                  {/* AI CHARACTER */}

                  <div className="relative mx-auto flex h-52 w-52 shrink-0 items-center justify-center lg:mr-10">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-200/60 via-blue-200/40 to-violet-200/60 blur-2xl" />

                    <div className="absolute inset-5 rotate-6 rounded-[40%] bg-gradient-to-br from-blue-500 via-violet-500 to-pink-400 shadow-2xl shadow-violet-200" />

                    <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-[36px] bg-white shadow-xl ring-4 ring-white/80">
                      <div className="mb-3 flex gap-3">
                        <span className="h-3.5 w-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-300" />
                        <span className="h-3.5 w-3.5 rounded-full bg-violet-500 shadow-sm shadow-violet-300" />
                      </div>

                      <div className="h-1.5 w-14 rounded-full bg-gradient-to-r from-blue-400 to-violet-400" />

                      <Bot className="mt-4 h-8 w-8 text-blue-600" />
                    </div>

                    <div className="absolute -right-2 top-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white bg-white shadow-lg">
                      <Sparkles className="h-6 w-6 text-violet-500" />
                    </div>

                    <div className="absolute -bottom-1 -left-2 flex h-12 w-12 items-center justify-center rounded-xl border border-white bg-white shadow-lg">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </section>

              {/* LIVE PIPELINE */}

              {(isRunning || agent.status === "waiting_for_approval") && (
                <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Zap className="h-6 w-6" />
                        </div>

                        <div>
                          <h2 className="text-base font-black text-slate-900">
                            Autonomous Agent Pipeline
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-400">
                            PayPilot is reasoning through the business signal
                          </p>
                        </div>
                      </div>

                      <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[10px] font-black uppercase text-blue-600">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                        LIVE
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-6 md:grid-cols-4">
                    {pipelineSteps.map((step, index) => {
                      const stepIndex = statusOrder.indexOf(step.key);

                      const completed =
                        currentStatusIndex > stepIndex;

                      const current =
                        agent.status === step.key;

                      return (
                        <div
                          key={step.key}
                          className={`relative rounded-xl border p-4 transition-all ${
                            current
                              ? "border-blue-200 bg-blue-50 shadow-md shadow-blue-100"
                              : completed
                                ? "border-emerald-100 bg-emerald-50/70"
                                : "border-slate-100 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                completed
                                  ? "bg-emerald-100 text-emerald-600"
                                  : current
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-white text-slate-400"
                              }`}
                            >
                              {completed ? (
                                <Check className="h-5 w-5" />
                              ) : current ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                              ) : (
                                index + 1
                              )}
                            </div>

                            <div>
                              <p
                                className={`text-xs font-black ${
                                  current
                                    ? "text-blue-700"
                                    : completed
                                      ? "text-emerald-700"
                                      : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {current
                                  ? "In progress"
                                  : completed
                                    ? "Completed"
                                    : "Pending"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* AI DETECTION */}

              {analysis && (
                <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                  <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <AlertCircle className="h-6 w-6" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-base font-black text-slate-900">
                            AI Detection
                          </h2>

                          <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase text-orange-600">
                            Attention
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {analysis.problem}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-gradient-to-r from-orange-50 to-rose-50 px-5 py-4 md:max-w-md">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                        Recommended action
                      </p>

                      <p className="mt-1.5 text-sm font-bold leading-5 text-slate-700">
                        {analysis.recommended_action}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* AI REASONING */}

              {analysis && (
                <section className="rounded-2xl border border-violet-100 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-100">
                        <Brain className="h-6 w-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-base font-black text-slate-900">
                            Agent Reasoning
                          </h2>

                          <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-black uppercase text-violet-600">
                            Explainable AI
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-400">
                          Why PayPilot identified this opportunity and chose
                          this action
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="relative rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <TrendingDown className="h-5 w-5" />
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                            Step 01
                          </span>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Signal detected
                        </p>

                        <p className="mt-2 text-sm font-black leading-5 text-slate-800">
                          Revenue changed by{" "}
                          <span className="text-orange-600">
                            {Math.abs(revenueChange).toFixed(1)}%
                          </span>
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          PayPilot compares recent performance against the
                          previous period.
                        </p>
                      </div>

                      <div className="relative rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Clock3 className="h-5 w-5" />
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                            Step 02
                          </span>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Pattern identified
                        </p>

                        <p className="mt-2 text-sm font-black leading-5 text-slate-800">
                          Evening sales are{" "}
                          <span className="text-blue-600">
                            {Math.abs(eveningChange).toFixed(1)}%
                          </span>{" "}
                          lower
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          The decline is concentrated between 5 PM and 8 PM.
                        </p>
                      </div>

                      <div className="relative rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                            <Coffee className="h-5 w-5" />
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-wider text-pink-500">
                            Step 03
                          </span>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Affected area
                        </p>

                        <p className="mt-2 truncate text-sm font-black leading-5 text-slate-800">
                          {analysis.affected_product}
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Strongest negative product movement.
                        </p>
                      </div>

                      <div className="relative rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <Target className="h-5 w-5" />
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                            Step 04
                          </span>
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Agent decision
                        </p>

                        <p className="mt-2 text-sm font-black leading-5 text-slate-800">
                          Target evening customers
                        </p>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Targeted campaign instead of broad discounting.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-start gap-4 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50 p-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                        <Lightbulb className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">
                          Agent reasoning summary
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          PayPilot detected a meaningful revenue decline,
                          isolated the evening period as the strongest
                          signal, identified{" "}
                          <span className="font-black text-slate-900">
                            {analysis.affected_product}
                          </span>{" "}
                          as the most affected product, and selected a
                          targeted evening campaign.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* METRICS */}

              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/60">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100/70 blur-xl" />

                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">
                        Revenue
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="text-3xl font-black text-slate-900">
                      ₹
                      {analysis?.recent_revenue?.toLocaleString("en-IN") ??
                        "--"}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      {revenueChange < 0 ? (
                        <ArrowDownRight className="h-5 w-5 text-rose-500" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                      )}

                      <span
                        className={`text-sm font-black ${
                          revenueChange < 0
                            ? "text-rose-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {Math.abs(revenueChange).toFixed(1)}%
                      </span>

                      <span className="text-xs text-slate-400">
                        vs previous period
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/60">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-100/70 blur-xl" />

                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">
                        Evening Sales
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Clock3 className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="text-3xl font-black text-slate-900">
                      {Math.abs(eveningChange).toFixed(1)}%
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      {eveningChange < 0 ? (
                        <TrendingDown className="h-5 w-5 text-rose-500" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      )}

                      <span
                        className={`text-sm font-black ${
                          eveningChange < 0
                            ? "text-rose-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {eveningChange < 0 ? "Declining" : "Growing"}
                      </span>

                      <span className="text-xs text-slate-400">
                        5–8 PM
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100/60">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-pink-100/70 blur-xl" />

                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">
                        Affected Product
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                        <Coffee className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="truncate text-xl font-black text-slate-900">
                      {analysis?.affected_product ?? "—"}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-rose-500" />

                      <span className="text-sm font-black text-rose-500">
                        {Math.abs(affectedProductChange).toFixed(1)}%
                      </span>

                      <span className="text-xs text-slate-400">
                        revenue change
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/60">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-100/70 blur-xl" />

                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-400">
                        AI Opportunity
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Target className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="text-xl font-black text-slate-900">
                      Evening Recovery
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-500" />

                      <span className="text-sm font-black text-emerald-600">
                        Action identified
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* AGENT + ACTIVITY */}

              <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-violet-100">
                        <Brain className="h-6 w-6" />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-slate-900">
                          Agent Status
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Autonomous decision pipeline
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase ${
                        isRunning
                          ? "bg-blue-50 text-blue-600"
                          : agent.status === "waiting_for_approval"
                            ? "bg-orange-50 text-orange-600"
                            : agent.status === "approved" ||
                                agent.status === "executed"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {formatStatus(agent.status)}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="rounded-xl bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                          <Command className="h-6 w-6 text-violet-600" />
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">
                            Current task
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {agent.current_task}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-4 gap-2">
                      {pipelineSteps.map((step) => {
                        const stepIndex = statusOrder.indexOf(step.key);

                        const complete =
                          currentStatusIndex > stepIndex;

                        const current =
                          agent.status === step.key;

                        return (
                          <div key={step.key} className="text-center">
                            <div
                              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                                complete
                                  ? "bg-emerald-100 text-emerald-600"
                                  : current
                                    ? "bg-blue-100 text-blue-600 ring-4 ring-blue-50"
                                    : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {complete ? (
                                <Check className="h-5 w-5" />
                              ) : current ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                stepIndex + 1
                              )}
                            </div>

                            <p
                              className={`mt-2 text-[10px] font-black ${
                                current
                                  ? "text-blue-600"
                                  : complete
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                        <Activity className="h-6 w-6" />
                      </div>

                      <div>
                        <h2 className="text-base font-black text-slate-900">
                          Activity Timeline
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-400">
                          What your AI teammate is doing
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black ${
                        isRunning
                          ? "animate-pulse text-blue-500"
                          : "text-slate-400"
                      }`}
                    >
                      {isRunning ? "UPDATING" : "LIVE"}
                    </span>
                  </div>

                  <div className="max-h-[330px] overflow-y-auto p-6">
                    <ActivityTimeline compact />
                  </div>
                </div>
              </section>

              {/* ACTION PLAN */}

              <section className="rounded-2xl border border-violet-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Megaphone className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-base font-black text-slate-900">
                        AI Action Plan
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-400">
                        Generated from the detected business signal
                      </p>
                    </div>
                  </div>

                  {agent.campaign && (
                    <span className="rounded-full bg-violet-50 px-4 py-1.5 text-[10px] font-black uppercase text-violet-600">
                      {formatStatus(agent.campaign.status)}
                    </span>
                  )}
                </div>

                {!agent.campaign ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50">
                      <Lightbulb className="h-7 w-7 text-violet-500" />
                    </div>

                    <h3 className="mt-5 text-base font-black text-slate-700">
                      No action generated yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                      Run an investigation and PayPilot will analyze the
                      business, decide on an action, and prepare it for your
                      approval.
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                      <div>
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-violet-100">
                            <Send className="h-6 w-6" />
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-slate-900">
                              {agent.campaign.type}
                            </h3>

                            <p className="mt-1.5 text-sm leading-6 text-slate-500">
                              {agent.campaign.objective}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Target
                            </p>

                            <p className="mt-1.5 text-sm font-bold text-slate-700">
                              {agent.campaign.target_segment}
                            </p>
                          </div>

                          <div className="rounded-xl bg-blue-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                              Timing
                            </p>

                            <p className="mt-1.5 text-sm font-bold text-blue-700">
                              {agent.campaign.target_time}
                            </p>
                          </div>

                          <div className="rounded-xl bg-emerald-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                              Channel
                            </p>

                            <p className="mt-1.5 text-sm font-bold text-emerald-700">
                              {agent.campaign.channel}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-5">
                          <div className="flex items-start gap-3">
                            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-violet-500">
                                Generated message
                              </p>

                              <p className="mt-1.5 text-sm leading-6 text-slate-700">
                                {agent.campaign.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/70 p-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Proposed offer
                        </p>

                        <p className="mt-2 text-3xl font-black text-slate-900">
                          {agent.campaign.offer}
                        </p>

                        <div className="mt-6 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                          <Target className="h-5 w-5 text-violet-500" />

                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">
                              Expected impact
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-slate-700">
                              {agent.campaign.expected_impact}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                          {agent.campaign.status ===
                            "awaiting_approval" && (
                            <>
                              <button
                                onClick={approveCampaign}
                                disabled={actionLoading}
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                              >
                                {actionLoading ? (
                                  <RefreshCw className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Check className="h-5 w-5" />
                                )}

                                Approve Campaign
                              </button>

                              <p className="text-center text-xs leading-5 text-slate-400">
                                AI prepares the action. You remain in control
                                of execution.
                              </p>
                            </>
                          )}

                          {agent.campaign.status === "approved" && (
                            <button
                              onClick={executeCampaign}
                              disabled={actionLoading}
                              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
                            >
                              {actionLoading ? (
                                <RefreshCw className="h-5 w-5 animate-spin" />
                              ) : (
                                <Play className="h-5 w-5 fill-current" />
                              )}

                              Execute with n8n
                            </button>
                          )}

                          {agent.campaign.status === "executing" && (
                            <div className="flex items-center justify-center gap-3 rounded-xl bg-blue-50 px-5 py-3.5 text-sm font-black text-blue-600">
                              <RefreshCw className="h-5 w-5 animate-spin" />
                              Executing Campaign...
                            </div>
                          )}

                          {agent.campaign.status === "executed" && (
                            <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3.5 text-sm font-black text-emerald-600">
                              <Check className="h-5 w-5" />
                              Campaign Executed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* CAMPAIGN IMPACT */}

              {campaignMetrics && agent.campaign?.status === "executed" && (
                <section className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                  <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

                  <div className="relative">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <BarChart3 className="h-6 w-6" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-base font-black text-slate-900">
                              Campaign Impact
                            </h2>

                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Measured
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            Outcome measurement from autonomous execution
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                            Campaign result
                          </p>

                          <p className="text-sm font-black text-emerald-700">
                            Positive business impact detected
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-6">
                      {[
                        [
                          "Customers reached",
                          campaignMetrics.customers_reached.toLocaleString(
                            "en-IN"
                          ),
                          "blue",
                        ],
                        [
                          "Messages delivered",
                          campaignMetrics.messages_delivered.toLocaleString(
                            "en-IN"
                          ),
                          "cyan",
                        ],
                        [
                          "Conversions",
                          campaignMetrics.conversions.toString(),
                          "violet",
                        ],
                        [
                          "Attributed revenue",
                          `₹${campaignMetrics.attributed_revenue.toLocaleString(
                            "en-IN"
                          )}`,
                          "emerald",
                        ],
                        [
                          "Revenue uplift",
                          `+${campaignMetrics.revenue_uplift}%`,
                          "pink",
                        ],
                        [
                          "Campaign ROI",
                          `${campaignMetrics.roi}×`,
                          "orange",
                        ],
                      ].map(([label, value, tone]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                        >
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {label}
                          </p>

                          <p
                            className={`mt-4 text-2xl font-black ${
                              tone === "emerald"
                                ? "text-emerald-600"
                                : tone === "pink"
                                  ? "text-pink-600"
                                  : tone === "orange"
                                    ? "text-orange-600"
                                    : tone === "violet"
                                      ? "text-violet-600"
                                      : tone === "cyan"
                                        ? "text-cyan-600"
                                        : "text-blue-600"
                            }`}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mx-6 mb-6 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-blue-50 to-cyan-50 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                          <Brain className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">
                            AI measurement summary
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            PayPilot completed the full autonomous loop:
                            <span className="font-black text-slate-900">
                              {" "}
                              detect → reason → recommend → approve → execute
                              → measure.
                            </span>{" "}
                            The campaign reached{" "}
                            <span className="font-black text-slate-900">
                              {campaignMetrics.customers_reached.toLocaleString(
                                "en-IN"
                              )}
                            </span>{" "}
                            customers and generated{" "}
                            <span className="font-black text-emerald-600">
                              ₹
                              {campaignMetrics.attributed_revenue.toLocaleString(
                                "en-IN"
                              )}
                            </span>{" "}
                            in simulated attributed revenue.
                          </p>

                          <p className="mt-2 text-xs font-medium text-slate-400">
                            Demo metrics are simulated for the hackathon
                            environment and do not represent real Paytm
                            transaction results.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* BOTTOM CARDS */}

              <section className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/50 p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>

                  <p className="mt-5 text-sm font-bold text-slate-400">
                    Business Signal
                  </p>

                  <p className="mt-1.5 text-base font-black text-slate-800">
                    {analysis?.affected_product || "Waiting for analysis"}
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/50 p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Crosshair className="h-6 w-6" />
                  </div>

                  <p className="mt-5 text-sm font-bold text-slate-400">
                    AI Decision
                  </p>

                  <p className="mt-1.5 text-base font-black text-slate-800">
                    Target evening customers
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/50 p-6 shadow-sm transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <FileText className="h-6 w-6" />
                  </div>

                  <p className="mt-5 text-sm font-bold text-slate-400">
                    Execution Mode
                  </p>

                  <p className="mt-1.5 text-base font-black text-slate-800">
                    Human approval required
                  </p>
                </div>
              </section>

              {/* FOOTER */}

              <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 py-6 text-xs text-slate-400 sm:flex-row">
                <p>
                  PayPilot • Autonomous AI Teammate for Paytm Merchants
                </p>

                <div className="flex items-center gap-2">
                  <span>Built for</span>

                  <span className="font-black text-blue-600">
                    Paytm AI Hackathon
                  </span>

                  <span>• Track 3</span>
                </div>
              </footer>
            </div>
          ) : (
            /* =====================================================
               WORKSPACE PANELS
               ===================================================== */

            <div className="mx-auto max-w-[1500px] p-5 md:p-8">
              {renderWorkspacePanel()}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}