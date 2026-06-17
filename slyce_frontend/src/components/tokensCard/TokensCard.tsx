import { useBalances } from "../../hooks/useBalances";
import Card from "../card/Card";
import LoadingState from "../loadingState/LoadingState";
import styles from "./TokensCard.module.css";

interface TokensCardProps {
  address: string;
  className?: string;
}

export default function TokensCard({
  address,
  className = "",
}: TokensCardProps) {
  const { assets, portfolioChange, totalBalance, loading } =
    useBalances(address);

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
                  +{portfolioChange?.amount.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        {loading ? "" : assets.length > 0 && <h3>Tokens</h3>}
      </div>

      <div className={styles.tokensList}>
        {assets.map((asset) => (
          <div key={asset.name} className={styles.tokenItem}>
            <div className={styles.tokenLeft}>
              <div
                className={`${styles.tokenIconWrapper} ${styles[asset.symbol.toLowerCase()] || ""}`}
              >
                <img
                  src={asset.iconUrl}
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
