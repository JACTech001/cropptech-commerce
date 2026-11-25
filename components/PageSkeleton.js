import styles from "./PageSkeleton.module.css";

const variants = {
  storefront: { cards: 8, rows: 0 },
  admin: { cards: 4, rows: 6 },
  account: { cards: 2, rows: 3 },
  orders: { cards: 0, rows: 4 },
  notifications: { cards: 0, rows: 5 },
  cart: { cards: 0, rows: 2 },
  checkout: { cards: 1, rows: 3 },
  page: { cards: 3, rows: 3 },
};

export default function PageSkeleton({ variant = "page", title = true }) {
  const config = variants[variant] || variants.page;
  return (
    <main className={styles.page} aria-busy="true" aria-label="Loading page content">
      <div className={styles.inner}>
        {title && <div className={styles.heading}>
          <span className={styles.line} />
          <span className={styles.title} />
          <span className={styles.subtitle} />
        </div>}
        {config.cards > 0 && <div className={styles.cards}>
          {Array.from({ length: config.cards }, (_, index) => <div className={styles.card} key={index}>
            <div className={styles.image} />
            <div className={styles.cardBody}><span className={styles.line} /><span className={styles.lineShort} /><span className={styles.linePrice} /></div>
          </div>)}
        </div>}
        {config.rows > 0 && <div className={styles.rows}>
          {Array.from({ length: config.rows }, (_, index) => <div className={styles.row} key={index}>
            <span className={styles.avatar} />
            <div className={styles.rowCopy}><span className={styles.line} /><span className={styles.lineShort} /></div>
            <span className={styles.rowEnd} />
          </div>)}
        </div>}
      </div>
      <span className={styles.srOnly} role="status">Loading content…</span>
    </main>
  );
}
