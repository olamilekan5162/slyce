import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useBalances } from "../../hooks/useBalances";
import { useSplitBalances } from "../../hooks/useSplitBalances";
import Card from "../card/Card";
import LoadingState from "../loadingState/LoadingState";
import styles from "./TokensCard.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

// Color palette — matches the existing Slyce design tokens
const SLICE_COLORS = [
  "#3e9b8f",
  "#7cd4d5",
  "#dfbc9f",
  "#645f6e",
  "#529552",
  "#4a7fa5",
  "#c4804a",
];

const EMPTY_COLOR = "#f3f4f6";

interface TokensCardProps {
  address: string;
  className?: string;
  isSplit?: boolean;
}

function parseUsd(value: string): number {
  return parseFloat(value?.replace(/[$,]/g, "") || "0") || 0;
}

export default function TokensCard({
  address,
  className = "",
  isSplit = false,
}: TokensCardProps) {
  const userBalances = useBalances(isSplit ? address : address);
  const splitBalances = useSplitBalances(isSplit ? address : "");

  const activeBalances = isSplit ? splitBalances : userBalances;
  const { assets, totalBalance, loading } = activeBalances;

  const hasAssets = assets.length > 0;

  // Build chart data
  const chartData = {
    labels: hasAssets ? assets.map((a) => a.symbol) : ["No tokens"],
    datasets: [
      {
        data: hasAssets
          ? assets.map((a) => parseUsd(a.usdValue))
          : [1],
        backgroundColor: hasAssets
          ? assets.map((_, i) => SLICE_COLORS[i % SLICE_COLORS.length])
          : [EMPTY_COLOR],
        borderColor: "#ffffff",
        borderWidth: hasAssets ? 2 : 0,
        hoverBorderWidth: hasAssets ? 3 : 0,
        hoverOffset: hasAssets ? 6 : 0,
      },
    ],
  };

  const formattedTotal =
    totalBalance > 0
      ? `$${totalBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "$0.00";

  // Center text plugin
  const centerTextPlugin: Plugin<"doughnut"> = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Total balance
      ctx.font = "700 18px Inter, sans-serif";
      ctx.fillStyle = "#111827";
      ctx.fillText(formattedTotal, centerX, centerY - 10);

      // Label
      ctx.font = "500 11px Inter, sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("Portfolio", centerX, centerY + 12);

      ctx.restore();
    },
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "72%",
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      animateRotate: true,
      animateScale: false,
      duration: 600,
      easing: "easeInOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: hasAssets,
        callbacks: {
          label(ctx) {
            const asset = assets[ctx.dataIndex];
            const val = parseUsd(asset?.usdValue || "0");
            const pct =
              totalBalance > 0
                ? ((val / totalBalance) * 100).toFixed(1)
                : "0";
            return ` ${asset?.symbol}: ${asset?.usdValue} (${pct}%)`;
          },
        },
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.8)",
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
      },
    },
  };

  return (
    <Card className={`${styles.rightColumn} ${className}`}>
      <div className={styles.pieChartContainer}>
        {loading ? (
          <LoadingState message=" " />
        ) : (
          <div className={styles.doughnutWrapper}>
            <Doughnut
              data={chartData}
              options={options}
              plugins={[centerTextPlugin]}
            />
          </div>
        )}
      </div>

      <div className={styles.sectionHeader}>
        {!loading && <h3>Tokens</h3>}
      </div>

      <div className={styles.tokensList}>
        {!loading && assets.length === 0 && (
          <div className={styles.emptyState}>
            <p>No tokens found</p>
          </div>
        )}
        {assets.map((asset, i) => (
          <div key={i} className={styles.tokenItem}>
            <div className={styles.tokenLeft}>
              <div
                className={styles.tokenIconWrapper}
                style={{
                  backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length],
                }}
              >
                <img
                  src={asset.iconUrl || undefined}
                  alt={asset.symbol}
                  className={styles.tokenIcon}
                />
              </div>
              <div className={styles.tokenInfo}>
                <div className={styles.tokenSymbol}>{asset.symbol}</div>
                <div className={styles.tokenName}>{asset.name}</div>
              </div>
            </div>
            <div className={styles.tokenRight}>
              <div className={styles.tokenFiat}>{asset.usdValue}</div>
              <div className={styles.tokenAmount}>
                {`${asset.balance} ${asset.symbol}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
