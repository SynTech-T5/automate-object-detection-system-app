"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

// Dynamic import (ApexCharts ต้องรันบน client)
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type DistData = {
  evt_name: string;
  count: string;
};

export default function AlertsDistributionChart(): React.ReactElement {
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/alerts/analytics/distribution");
        const data: DistData[] = await res.json();

        setLabels(data.map((d) => d.evt_name));
        setSeries(data.map((d) => Number(d.count)));
      } catch (err) {
        console.error("Error fetching distribution data:", err);
      }
    }

    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    labels,
    colors: [
      "#3B82F6", // blue
      "#10B981", // emerald
      "#F59E0B", // amber
      "#EF4444", // red
      "#8B5CF6", // violet
      "#06B6D4", // cyan
      "#F472B6", // pink
      "#64748B", // gray slate
    ],
    legend: {
      position: "bottom",
      fontSize: "13px",
      labels: { colors: "#6B7280" },
      markers: { size: 8 },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { show: false },
            value: {
              fontSize: "18px",
              fontWeight: 600,
              color: "#111827",
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              color: "#6B7280",
              formatter: (w) =>
                w.globals.seriesTotals
                  .reduce((a: number, b: number) => a + b, 0)
                  .toString(),
            },
          },
        },
      },
    },
    stroke: { show: false },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: "100%" },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  return (
    <div className="w-full flex justify-center">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        width={360}
      />
    </div>
  );
}