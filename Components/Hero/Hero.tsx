import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        TRANSFORM <br />
        <span className={styles.titleGold}>YOUR SPACE</span>
      </h1>
      <p className={styles.subtitle}>
        We&apos;re here to make your dream space come true through functional, aesthetic, <br />
        and personal interior design.
      </p>
      <div className={styles.ctaGroup}>
        <Link href="/projects" className={styles.btnDark}>
          Explore Our Project &rarr;
        </Link>
        <Link href="/estimate" className={styles.btnGold}>
          Estimate Your Project &rarr;
        </Link>
      </div>
    </section>
  );
}