import styles from './Services.module.css';

const services = [
  { id: '01', title: 'INTERIOR DESIGN', desc: 'Concept development, space planning, 3D visualization' },
  { id: '02', title: 'Building Consultant', desc: 'Consultation and project planning' },
  { id: '03', title: 'EXTERIOR DESIGN', desc: 'Facade and exterior planning' },
];

export default function Services() {
  return (
    <section id="services" className={styles.services}>
      <h2 className={styles.sectionTitle}>OUR SERVICES</h2>
      <div className={styles.grid}>
        {services.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.number}>{item.id}</span>
            </div>
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardDesc}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}