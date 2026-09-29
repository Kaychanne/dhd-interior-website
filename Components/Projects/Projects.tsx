import Link from 'next/link';
import styles from './Projects.module.css';

const projects = [
  { id: 1, title: 'Office Space', location: 'Office - Pontianak' },
  { id: 2, title: 'Office Space', location: 'Office - Pontianak' },
  { id: 3, title: 'Office Space', location: 'Office - Pontianak' },
  { id: 4, title: 'Office Space', location: 'Office - Pontianak' },
];

export default function Projects() {
  return (
    <section id="projects" className={styles.projects}>
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>OUR PROJECTS</h2>
        <Link href="/projects" className={styles.linkMore}>
          Lihat semua project &gt;
        </Link>
      </div>

      <div className={styles.grid}>
        {projects.map((p) => (
          <div key={p.id} className={styles.card}>
            <div className={styles.imagePlaceholder} />
            <div className={styles.cardInfo}>
              <h4>{p.title}</h4>
              <p>{p.location}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}