import styles from "./PageSkeleton.module.css";

function Block({ className = "" }) {
  return <span className={`${styles.block} ${className}`} />;
}

function ProductCards({ count = 4 }) {
  return <div className={styles.productGrid}>{Array.from({ length: count }, (_, index) => <article className={styles.productCard} key={index}><Block className={styles.productImage}/><div className={styles.productCopy}><Block className={styles.copyLine}/><Block className={styles.copyShort}/><Block className={styles.copyPrice}/></div></article>)}</div>;
}

function Header({ back = false }) {
  return <div className={styles.storeHeader}><Block className={styles.headerLink}/><Block className={styles.logo}/><Block className={styles.headerActions}/></div>;
}

function Heading({ wide = false }) {
  return <div className={styles.heading}><Block className={styles.eyebrow}/><Block className={wide ? styles.headingWide : styles.headingTitle}/><Block className={styles.headingText}/></div>;
}

function HomeSkeleton() {
  return <main className={styles.home} aria-busy="true" aria-label="Loading homepage">
    <Block className={styles.announcement}/>
    <Header/>
    <section className={styles.hero}><div className={styles.heroCopy}><Block className={styles.heroEyebrow}/><Block className={styles.heroTitle}/><Block className={styles.heroTitleShort}/><Block className={styles.heroText}/><Block className={styles.heroButton}/></div></section>
    <div className={styles.intro}><Block className={styles.introLabel}/><Block className={styles.introText}/></div>
    <section className={styles.section}><Heading/><div className={styles.collectionGrid}><Block className={styles.collectionImage}/><Block className={styles.collectionImage}/></div></section>
    <section className={styles.feature}><Block className={styles.featureImage}/><div className={styles.featureCopy}><Block className={styles.eyebrow}/><Block className={styles.headingTitle}/><Block className={styles.headingText}/><Block className={styles.heroButton}/></div></section>
    <section className={styles.section}><Heading/><ProductCards count={4}/></section>
    <section className={styles.section}><Heading/><div className={styles.moodboard}><Block className={styles.moodTall}/><div><Block className={styles.moodSmall}/><Block className={styles.moodSmall}/></div></div></section>
    <span className={styles.srOnly} role="status">Loading homepage…</span>
  </main>;
}

function ShopSkeleton() {
  return <main className={styles.shop} aria-busy="true" aria-label="Loading shop">
    <Header/>
    <section className={styles.shopHero}><Block className={styles.eyebrow}/><Block className={styles.headingTitle}/><Block className={styles.headingText}/></section>
    <section className={styles.shopContent}><div className={styles.catalogueHeading}><Block className={styles.headingTitle}/><Block className={styles.search}/></div><div className={styles.filters}><Block className={styles.filter}/><Block className={styles.filter}/><Block className={styles.filter}/><Block className={styles.filter}/></div><ProductCards count={8}/></section>
    <span className={styles.srOnly} role="status">Loading shop…</span>
  </main>;
}

function AccountSkeleton() {
  return <main className={styles.account} aria-busy="true" aria-label="Loading account">
    <Header/><div className={styles.accountContent}><Heading/><div className={styles.accountGrid}><section className={styles.profile}><Block className={styles.profileAvatar}/><Block className={styles.copyLine}/><Block className={styles.copyShort}/><Block className={styles.profileButton}/></section><section className={styles.orders}><div className={styles.catalogueHeading}><Block className={styles.headingTitle}/><Block className={styles.filter}/></div>{Array.from({length:3},(_,i)=><div className={styles.orderRow} key={i}><Block className={styles.orderIcon}/><div><Block className={styles.copyLine}/><Block className={styles.copyShort}/></div><Block className={styles.orderEnd}/></div>)}</section></div></div>
    <span className={styles.srOnly} role="status">Loading account…</span>
  </main>;
}

function CartSkeleton() {
  return <main className={styles.cart} aria-busy="true" aria-label="Loading cart">
    <Header/><div className={styles.cartContent}><Block className={styles.eyebrow}/><Block className={styles.headingTitle}/><Block className={styles.headingText}/><div className={styles.cartLayout}><section className={styles.cartItems}>{Array.from({length:2},(_,i)=><div className={styles.cartItem} key={i}><Block className={styles.cartImage}/><div><Block className={styles.copyLine}/><Block className={styles.copyShort}/><Block className={styles.filter}/></div><Block className={styles.orderEnd}/></div>)}</section><aside className={styles.cartSummary}><Block className={styles.copyLine}/><Block className={styles.summaryLine}/><Block className={styles.summaryLine}/><Block className={styles.profileButton}/></aside></div></div>
    <span className={styles.srOnly} role="status">Loading cart…</span>
  </main>;
}

function CheckoutSkeleton() {
  return <main className={styles.cart} aria-busy="true" aria-label="Loading checkout">
    <Header/><div className={styles.cartContent}><Heading wide/><div className={styles.cartLayout}><section className={styles.checkoutForm}>{Array.from({length:2},(_,i)=><div className={styles.formSection} key={i}><Block className={styles.eyebrow}/><div className={styles.formFields}>{Array.from({length:i===0?2:5},(_,j)=><Block className={styles.input} key={j}/>)}</div></div>)}<Block className={styles.profileButton}/></section><aside className={styles.cartSummary}><Block className={styles.copyLine}/>{Array.from({length:2},(_,i)=><div className={styles.summaryProduct} key={i}><Block className={styles.summaryThumb}/><Block className={styles.copyLine}/></div>)}<Block className={styles.summaryLine}/><Block className={styles.summaryLine}/></aside></div></div>
    <span className={styles.srOnly} role="status">Loading checkout…</span>
  </main>;
}

function AdminSkeleton() {
  return <main className={styles.admin} aria-busy="true" aria-label="Loading admin workspace">
    <aside className={styles.adminSidebar}><Block className={styles.adminBrand}/><Block className={styles.adminNavActive}/>{Array.from({length:8},(_,i)=><Block className={styles.adminNav} key={i}/>)}</aside>
    <section className={styles.adminMain}><div className={styles.adminTop}><Block className={styles.search}/><Block className={styles.adminUser}/></div><div className={styles.adminContent}><Heading wide/><div className={styles.metrics}>{Array.from({length:4},(_,i)=><div key={i}><Block className={styles.eyebrow}/><Block className={styles.metricValue}/><Block className={styles.copyShort}/></div>)}</div><section className={styles.adminPanel}><div className={styles.catalogueHeading}><Block className={styles.headingTitle}/><Block className={styles.filter}/></div>{Array.from({length:5},(_,i)=><div className={styles.adminRow} key={i}><Block className={styles.orderIcon}/><Block className={styles.copyLine}/><Block className={styles.orderEnd}/></div>)}</section></div></section>
    <span className={styles.srOnly} role="status">Loading admin workspace…</span>
  </main>;
}

export default function PageSkeleton({ variant = "home" }) {
  if (variant === "storefront" || variant === "shop") return <ShopSkeleton/>;
  if (variant === "admin") return <AdminSkeleton/>;
  if (variant === "account" || variant === "notifications") return <AccountSkeleton/>;
  if (variant === "cart") return <CartSkeleton/>;
  if (variant === "checkout") return <CheckoutSkeleton/>;
  return <HomeSkeleton/>;
}

export function ProductGridSkeleton({ count = 8 }) {
  return <div className={styles.productGrid} aria-busy="true" aria-label="Loading products">
    {Array.from({ length: count }, (_, index) => <article className={styles.productCard} key={index}><Block className={styles.productImage}/><div className={styles.productCopy}><Block className={styles.copyLine}/><Block className={styles.copyShort}/><Block className={styles.copyPrice}/></div></article>)}
    <span className={styles.srOnly} role="status">Loading products…</span>
  </div>;
}
