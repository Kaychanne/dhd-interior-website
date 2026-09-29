'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className={styles.header}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoBold}>DHD</span> Interior
      </div>

      {/* Navigasi Desktop */}
      <nav className={styles.nav}>
        <Link 
          href="/" 
          className={pathname === '/' ? styles.activeLink : ''}
        >
          Home
        </Link>
        <Link 
          href="/projects" 
          className={pathname === '/projects' ? styles.activeLink : ''}
        >
          Projects
        </Link>
        <Link 
          href="/estimate" 
          className={pathname === '/estimate' ? styles.activeLink : ''}
        >
          Estimate
        </Link>
      </nav>

      {/* Tombol Konsultasi (Desktop) */}
      <div className={styles.desktopConsultation}>
        <Link href="/estimate" className={styles.btnConsultation}>
          Get a Consultation
        </Link>
      </div>

      {/* Tombol Hamburger (Mobile Only) */}
      <button 
        className={styles.hamburgerBtn} 
        onClick={toggleSidebar}
        aria-label="Toggle Navigation Menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay Hitam saat Sidebar Terbuka */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      {/* Sidebar Navigation (Mobile Only) */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoBold}>DHD</span> Interior
          </div>
          <button className={styles.closeBtn} onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <Link 
            href="/" 
            className={pathname === '/' ? styles.activeLink : ''}
            onClick={toggleSidebar}
          >
            Home
          </Link>
          <Link 
            href="/projects" 
            className={pathname === '/projects' ? styles.activeLink : ''}
            onClick={toggleSidebar}
          >
            Projects
          </Link>
          <Link 
            href="/estimate" 
            className={pathname === '/estimate' ? styles.activeLink : ''}
            onClick={toggleSidebar}
          >
            Estimate
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link 
            href="/estimate" 
            className={styles.btnConsultation} 
            style={{ display: 'block', textAlign: 'center' }}
            onClick={toggleSidebar}
          >
            Get a Consultation
          </Link>
        </div>
      </aside>
    </header>
  );
}