import Link from 'next/link';
import styles from './EstimatorBanner.module.css';

export default function EstimatorBanner() {
  return (
    <section className={styles.banner}>
      <h2 className={styles.title}>PROJECT ESTIMATOR</h2>
      <p className={styles.subtitle}>Get an initial Project Estimate</p>
      <Link href="/estimate" className={styles.btnGold}>
        Estimate Your Project &rarr;
      </Link>
    </section>
  );
}