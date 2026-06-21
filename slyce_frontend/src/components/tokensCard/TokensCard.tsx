import { useBalances } from "../../hooks/useBalances";
import { useSplitBalances } from "../../hooks/useSplitBalances";
import Card from "../card/Card";
import LoadingState from "../loadingState/LoadingState";
import styles from "./TokensCard.module.css";

interface TokensCardProps {
  address: string;
  className?: string;
  isSplit?: boolean;
}

export default function TokensCard({
  address,
  className = "",
  isSplit = false,
}: TokensCardProps) {
  const userBalances = useBalances(isSplit ? address : address);
  const splitBalances = useSplitBalances(isSplit ? address : "");

  const activeBalances = isSplit ? splitBalances : userBalances;
  const { assets, portfolioChange, totalBalance, loading } = activeBalances;

  return (
    <Card className={`${styles.rightColumn} ${className}`}>
      <div className={styles.pieChartContainer}>
        <div className={styles.donutWrapper}>
          <div className={styles.donutInner}>
            {loading ? (
              <LoadingState message=" " />
            ) : (
              <>
                <span className={styles.donutAmount}>${totalBalance}</span>
                <span className={styles.donutChange}>
                  {portfolioChange?.amount?.toFixed(2) || "0.00"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        {loading ? "" : <h3>Tokens</h3>}
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
                className={`${styles.tokenIconWrapper} ${styles[asset.symbol.toLowerCase()] || ""}`}
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
