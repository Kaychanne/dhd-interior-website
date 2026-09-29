'use client';

import { useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import styles from './projects.module.css';

interface ProjectItem {
  id: number;
  title: string;
  location: string;
  category: string;
  description: string;
  imageUrl: string;
}

const ALL_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: 'Minimalist Kitchen Set',
    location: 'Residential - Pontianak',
    category: 'Interior',
    description: 'Desain dapur minimalis dengan sentuhan kayu hangat, pencahayaan LED tersembunyi, serta penataan kabinet yang efisien untuk memaksimalkan ruang penyimpanan.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Modern Living Room',
    location: 'Residential - Jakarta',
    category: 'Interior',
    description: 'Ruang tamu bernuansa modern elegan dengan pemilihan sofa bertekstur, aksen dinding panel kayu, dan pencahayaan warm putih yang menenangkan.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Executive Office Space',
    location: 'Office - Pontianak',
    category: 'Office',
    description: 'Rancangan area kerja eksekutif yang ergonomis dan profesional, mengombinasikan material kaca, baja, serta pencahayaan alami.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    title: 'Coffee Shop Facade',
    location: 'Commercial - Bandung',
    category: 'Exterior',
    description: 'Fasad luar kafe bergaya industrial modern yang eye-catching, dirancang untuk menarik perhatian pengunjung dari kejauhan.',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Luxury Villa Master Bedroom',
    location: 'Residential - Bali',
    category: 'Interior',
    description: 'Kamar tidur utama bergaya resor mewah dengan aksen tropis, pencahayaan alami melimpah, dan interior bernuansa netral.',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    title: 'Contemporary Dining Room',
    location: 'Residential - Surabaya',
    category: 'Interior',
    description: 'Ruang makan kontemporer dengan meja kayu solid kustom dan lampu gantung artistik sebagai focal point ruangan.',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function ProjectsPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const nextProject = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prevIndex) => ((prevIndex ?? 0) + 1) % ALL_PROJECTS.length);
    }
  };

  const prevProject = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prevIndex) => ((prevIndex ?? 0) - 1 + ALL_PROJECTS.length) % ALL_PROJECTS.length);
    }
  };

  const activeProject = selectedIndex !== null ? ALL_PROJECTS[selectedIndex] : null;

  return (
    <main>
      <Navbar />

      <section className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>OUR PROJECTS</h1>
          <p className={styles.subtitle}>
            Klik pada gambar untuk melihat detail proyek, konsep desain, dan galeri lengkap DHD Interior.
          </p>
        </div>

        {/* Grid Kartu Project */}
        <div className={styles.grid}>
          {ALL_PROJECTS.map((p, index) => (
            <div
              key={p.id}
              className={styles.card}
              onClick={() => openLightbox(index)}
            >
              <div className={styles.imageWrapper}>
                <img src={p.imageUrl} alt={p.title} className={styles.cardImage} />
                <div className={styles.imageOverlay}>
                  <span>Lihat Detail &rarr;</span>
                </div>
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.category}>{p.category}</span>
                <h4>{p.title}</h4>
                <p>{p.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox / Modal Pop-up Foto & Detail */}
      {activeProject && (
        <div className={styles.modalOverlay} onClick={closeLightbox}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Tombol Close */}
            <button className={styles.closeBtn} onClick={closeLightbox}>&times;</button>

            {/* Tombol Navigasi Prev/Next */}
            <button className={styles.prevBtn} onClick={prevProject}>&#10094;</button>
            <button className={styles.nextBtn} onClick={nextProject}>&#10095;</button>

            <div className={styles.modalBody}>
              <div className={styles.modalImageContainer}>
                <img src={activeProject.imageUrl} alt={activeProject.title} className={styles.modalImage} />
              </div>
              <div className={styles.modalDetails}>
                <span className={styles.modalCategory}>{activeProject.category}</span>
                <h2 className={styles.modalTitle}>{activeProject.title}</h2>
                <p className={styles.modalLocation}>📍 {activeProject.location}</p>
                <div className={styles.modalDivider} />
                <p className={styles.modalDescription}>{activeProject.description}</p>
                <div className={styles.modalCounter}>
                  Project {(selectedIndex ?? 0) + 1} dari {ALL_PROJECTS.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}