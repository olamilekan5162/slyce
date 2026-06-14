import Card from "../card/Card";
import styles from "./TokensCard.module.css";

interface Token {
  id: number;
  symbol: string;
  name: string;
  fiatValue: number;
  amount: number;
  iconUrl: string;
}

interface TokensCardProps {
  tokens: Token[];
  className?: string;
}

export default function TokensCard({ tokens, className = "" }: TokensCardProps) {
  return (
    <Card className={`${styles.rightColumn} ${className}`}>
      <div className={styles.pieChartContainer}>
        <div className={styles.donutWrapper}>
          <div className={styles.donutInner}>
            <span className={styles.donutAmount}>$338</span>
            <span className={styles.donutChange}>+97%</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionHeader}>
        <h3>Tokens</h3>
      </div>

      <div className={styles.tokensList}>
        {tokens.map((token) => (
          <div key={token.id} className={styles.tokenItem}>
            <div className={styles.tokenLeft}>
              <div className={`${styles.tokenIconWrapper} ${styles[token.symbol.toLowerCase()] || ""}`}>
                <img
                  src={token.iconUrl}
                  alt={token.symbol}
                  className={styles.tokenIcon}
                />
              </div>
              <div className={styles.tokenInfo}>
                <div className={styles.tokenSymbol}>{token.symbol}</div>
                <div className={styles.tokenName}>{token.name}</div>
              </div>
            </div>
            <div className={styles.tokenRight}>
              <div className={styles.tokenFiat}>
                ${token.fiatValue.toFixed(2)}
              </div>
              <div className={styles.tokenAmount}>
                {`${token.amount} ${token.symbol}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
