import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useAdminAnalytics } from "../hooks/useAdminAnalytics";
import { useAdminStats } from "../hooks/useAdminStats";
import { FiBarChart2 } from "react-icons/fi";

const CHART_COLORS = ["#168263", "#e28b55", "#3488a4", "#d2a83f", "#657c73"];

const baseChartOptions = {
  chart: {
    type: "line",
    toolbar: { show: false },
    zoom: { enabled: false },
    background: "transparent",
    fontFamily: "DM Sans, sans-serif",
    foreColor: "#475569",
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: "#e2e8f0",
    strokeDashArray: 3,
  },
  xaxis: {
    labels: {
      style: {
        colors: ["#64748b"],
        fontSize: "12px",
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: ["#64748b"],
        fontSize: "11px",
      },
    },
  },
  tooltip: {
    theme: "light",
    shared: true,
    intersect: false,
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontSize: "12px",
    markers: { radius: 9 },
    itemMargin: { vertical: 6 },
  },
};

const Analytics = () => {
  const { analytics, loading, error, fetchAnalytics } = useAdminAnalytics();
  const { stats, fetchStats } = useAdminStats();
  const [range, setRange] = useState("7d");

  useEffect(() => {
    fetchAnalytics(range);
    fetchStats();
  }, [range, fetchAnalytics, fetchStats]);

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
        <span>{error}</span>
        <button onClick={() => fetchAnalytics(range)} className="underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  const onlineData = [
    { name: "Online", value: stats?.onlineUsers || 0 },
    { name: "Offline", value: stats?.offlineUsers || 0 },
  ];

  const blockedData = [
    {
      name: "Active",
      value: (stats?.totalUsers || 0) - (stats?.blockedUsers || 0),
    },
    { name: "Blocked", value: stats?.blockedUsers || 0 },
  ];

  const lineData =
    analytics?.signupsPerDay?.map((s, i) => ({
      date: s.date.slice(5),
      signups: s.count,
      logins: analytics.loginCountPerDay?.[i]?.count || 0,
    })) || [];

  const barData =
    analytics?.messagesPerDay?.map((m) => ({
      date: m.date.slice(5),
      messages: m.count,
    })) || [];

  const lineOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "line",
    },
    colors: ["#3b82f6", "#22c55e"],
    stroke: { width: 2.5, curve: "smooth" },
    markers: { size: 4, strokeWidth: 0 },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: lineData.map((item) => item.date),
    },
  };

  const barOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "bar",
    },
    colors: ["#087f68"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "48%",
      },
    },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: barData.map((item) => item.date),
    },
  };

  const pieOptions = (title) => ({
    chart: {
      type: "donut",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "DM Sans, sans-serif",
    },
    labels: [],
    colors: CHART_COLORS,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      markers: { radius: 9 },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
    },
    tooltip: {
      theme: "light",
      y: { formatter: (value) => `${value}` },
    },
    title: {
      text: title,
      align: "left",
      style: {
        fontSize: "13px",
        fontWeight: 700,
        color: "#17211f",
      },
    },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
        },
      },
    },
  });

  const lineSeries = [
    { name: "Signups", data: lineData.map((item) => item.signups) },
    { name: "Logins", data: lineData.map((item) => item.logins) },
  ];

  const barSeries = [
    { name: "Messages", data: barData.map((item) => item.messages) },
  ];

  const onlineSeries = onlineData.map((item) => item.value);
  const blockedSeries = blockedData.map((item) => item.value);

  return (
    <div className="page-enter mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#087f68]"><FiBarChart2 size={13} /> Community insights</div>
          <h1 className="font-[Manrope] text-2xl font-bold text-[#17211f]">Analytics</h1>
          <p className="mt-1 text-sm text-[#71807b]">Usage trends and community health</p>
        </div>
        <div className="flex rounded-xl border border-[#dce6e1] bg-white p-1">
          <button
            className={`px-4 py-1.5 text-sm ${
              range === "7d" ? "rounded-lg bg-[#183b32] text-white" : "rounded-lg text-[#66746e] hover:bg-[#f3f7f5]"
            }`}
            onClick={() => setRange("7d")}
          >
            7 Days
          </button>
          <button
            className={`px-4 py-1.5 text-sm ${
              range === "30d" ? "rounded-lg bg-[#183b32] text-white" : "rounded-lg text-[#66746e] hover:bg-[#f3f7f5]"
            }`}
            onClick={() => setRange("30d")}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)] sm:p-6">
        <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Signups and logins</h2>
        {lineData.length ? (
          <div className="w-full">
            <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={280} />
          </div>
        ) : (
          <p className="text-center text-gray-400 py-10">No data for this range</p>
        )}
      </div>

      <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)] sm:p-6">
        <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Messages per day</h2>
        {barData.length ? (
          <div className="w-full">
            <ReactApexChart options={barOptions} series={barSeries} type="bar" height={260} />
          </div>
        ) : (
          <p className="text-center text-gray-400 py-10">No message data</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)]">
          <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Online vs offline</h2>
          <div className="w-full">
            <ReactApexChart
              options={{
                ...pieOptions("Online vs offline"),
                labels: onlineData.map((item) => item.name),
              }}
              series={onlineSeries}
              type="donut"
              height={220}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#e3e9e6] bg-white p-5 shadow-[0_5px_24px_rgba(28,53,44,0.04)]">
          <h2 className="mb-4 font-[Manrope] text-sm font-bold text-[#26332f]">Active vs blocked</h2>
          <div className="w-full">
            <ReactApexChart
              options={{
                ...pieOptions("Active vs blocked"),
                labels: blockedData.map((item) => item.name),
              }}
              series={blockedSeries}
              type="donut"
              height={220}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;