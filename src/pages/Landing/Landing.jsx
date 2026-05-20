import React from 'react';
import { Music, Users, LandPlot, Speaker } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <h1 className={styles.headline}>
            Set the agreement once.<br />
            Get paid fairly, forever.
          </h1>
          <p className={styles.subhead}>
            Programmable payment splitting for musicians, teams, DAOs, and anyone who shares revenue.
          </p>
          <div className={styles.ctaGroup}>
            <button className="btn-primary" onClick={() => navigate('/signin')}>
              Create a Split
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Ticker Section */}
      <div className={styles.tickerWrapper}>
        <div className={styles.tickerContent}>
          <span className={styles.tickerItem}>✓ $1,240 split to 4 recipients</span>
          <span className={styles.tickerDot}>·</span>
          <span className={styles.tickerItem}>✓ $85 split to 3 recipients</span>
          <span className={styles.tickerDot}>·</span>
          <span className={styles.tickerItem}>✓ $320 split to 6 recipients</span>
          <span className={styles.tickerDot}>·</span>
          <span className={styles.tickerItem}>✓ $50 split to 2 recipients</span>
          <span className={styles.tickerDot}>·</span>
          {/* Repeat for seamless loop */}
          <span className={styles.tickerItem}>✓ $1,240 split to 4 recipients</span>
          <span className={styles.tickerDot}>·</span>
          <span className={styles.tickerItem}>✓ $85 split to 3 recipients</span>
          <span className={styles.tickerDot}>·</span>
          <span className={styles.tickerItem}>✓ $320 split to 6 recipients</span>
          <span className={styles.tickerDot}>·</span>
          <span className={styles.tickerItem}>✓ $50 split to 2 recipients</span>
          <span className={styles.tickerDot}>·</span>
        </div>
      </div>

      {/* Use Cases Section */}
      <section id="features" className={`container ${styles.useCases}`}>
        <div className={styles.useCaseCard}>
          <div className={styles.iconWrapper}><Music size={24} /></div>
          <h3>Musicians</h3>
          <p>Split royalties the moment they land</p>
        </div>
        <div className={styles.useCaseCard}>
          <div className={styles.iconWrapper}><Users size={24} /></div>
          <h3>Freelance Teams</h3>
          <p>Divide client invoices without the awkward chase</p>
        </div>
        <div className={styles.useCaseCard}>
          <div className={styles.iconWrapper}><LandPlot size={24} /></div>
          <h3>DAOs</h3>
          <p>Distribute bounties atomically to every contributor</p>
        </div>
        <div className={styles.useCaseCard}>
          <div className={styles.iconWrapper}><Speaker size={24} /></div>
          <h3>Creators</h3>
          <p>Split brand deals the second they pay out</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsRow}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Set the split</h3>
              <p>Add recipients, assign percentages, define distribution rules</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Everyone confirms</h3>
              <p>Each recipient reviews and signs off. Nothing locks until all agree.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Money moves itself</h3>
              <p>Payments in = payments out, instantly, to everyone</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>slyce · Built for anyone who shares revenue · © 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
