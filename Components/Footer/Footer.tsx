import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h2>DHD<br />INTERIOR</h2>
        </div>

        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="#services">Services</Link></li>
            <li><Link href="#projects">Projects</Link></li>
            <li><Link href="/estimate">Estimate</Link></li>
          </ul>
        </div>

        <div className={styles.contact}>
          <h4>Contact us</h4>
          <p>📧 dhdinterior@gmail.com</p>
          <p>📞 +62 821-5555-1230</p>
          <p>📷 dhd.interior</p>
          <p>📍 Jalan Parit Demang No. B-54, Pontianak, West Kalimantan, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}