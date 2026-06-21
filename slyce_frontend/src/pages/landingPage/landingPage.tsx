import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import slycelogo from "../../assets/slyce_logo.svg";
import Button from "../../components/button/Button";
import LoginModal from "../../components/loginModal/LoginModal";
import styles from "./landingPage.module.css";
import { useWalletConnection } from "@mysten/dapp-kit-react";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const connection = useWalletConnection();

  return (
    <div className={styles.container}>
      {/* Hero Container */}
      <div className={styles.heroContainer}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <img
              src={slycelogo}
              width={48}
              alt="Slyce"
              className={styles.logoImg}
            />
            <span>Slyce</span>
          </div>
          <nav className={styles.nav}>
            <span
              className={styles.navLink}
              onClick={() =>
                document
                  .getElementById("use-cases")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Use Cases
            </span>
            <span
              className={styles.navLink}
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Features
            </span>
            <span
              className={styles.navLink}
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How it Works
            </span>
          </nav>
          <div className={styles.headerActions}>
            {connection.isConnected ? (
              <Button variant="primary" onClick={() => navigate("/app")}>
                Launch App
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setIsLoginOpen(true)}>
                Log in
              </Button>
            )}
          </div>
        </header>

        <motion.section
          className={styles.hero}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 variants={fadeUpVariant} className={styles.heroTitle}>
            Collaborate now.
            <br />
            Pay when you earn.
          </motion.h1>
          <motion.p variants={fadeUpVariant} className={styles.heroSubtitle}>
            Make a credible offer to any professional without upfront cash.
            Slyce replaces upfront payments with guaranteed on-chain agreements.
            Lock in their cut before the work begins. Paid automatically the
            moment earnings arrive.
          </motion.p>
          <motion.div variants={fadeUpVariant} className={styles.heroActions}>
            <Button
              size="lg"
              variant="primary"
              onClick={() =>
                connection.isConnected ? navigate("/app") : setIsLoginOpen(true)
              }
            >
              Start Collaborating
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate("/")}
              style={{
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Read Docs
            </Button>
          </motion.div>
        </motion.section>
      </div>

      <main>
        {/* Use Cases Section */}
        <section
          id="use-cases"
          className={`${styles.section} ${styles.ambientGlow1}`}
        >
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <h2 className={styles.sectionTitle}>
              Built for modern collaboration
            </h2>
            <p className={styles.sectionSubtitle}>
              Slyce handles the complex financial routing so you can focus on
              building and creating together.
            </p>
          </motion.div>

          <motion.div
            className={styles.useCasesGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpVariant} className={styles.useCaseCard}>
              <img
                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80"
                alt="Creators"
                className={styles.useCaseImage}
              />
              <div className={styles.useCaseOverlay} />
              <h3 className={styles.useCaseTitle}>Music & Audio</h3>
              <p className={styles.useCaseDesc}>
                Secure top producers and featured artists by locking in their
                royalties before they step into the studio.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className={styles.useCaseCard}>
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80"
                alt="Founders"
                className={styles.useCaseImage}
              />
              <div className={styles.useCaseOverlay} />
              <h3 className={styles.useCaseTitle}>Film & Video</h3>
              <p className={styles.useCaseDesc}>
                Get directors, editors, and videographers on board by
                guaranteeing their cut of the final project's revenue.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className={styles.useCaseCard}>
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80"
                alt="Music"
                className={styles.useCaseImage}
              />
              <div className={styles.useCaseOverlay} />
              <h3 className={styles.useCaseTitle}>Indie Teams & Content</h3>
              <p className={styles.useCaseDesc}>
                Build a world-class team of marketers and creators without a
                massive starting budget. Offer an undeniable promise.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Asymmetrical Features (Zig-Zag) */}
        <section
          id="features"
          className={`${styles.section} ${styles.sectionDark}`}
        >
          <div className={styles.featuresWrapper}>
            {/* Feature 1 */}
            <motion.div
              className={styles.featureRow}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
            >
              <div className={styles.featureText}>
                <h3>An Undeniable Promise (Code is Law)</h3>
                <p>
                  It's not an IOU. Once a collaboration deal contract is
                  deployed, it cannot be modified or ignored. Nobody needs to
                  trust anyone, the protocol enforces the agreement.
                </p>
              </div>
              <div className={styles.featureVisual}>
                <div className={styles.codeVisual}>
                  <div className={styles.codeHeader}>
                    <span className={styles.codeDot}></span>
                    <span className={styles.codeDot}></span>
                    <span className={styles.codeDot}></span>
                    <span className={styles.codeTitle}>slyce_deal.move</span>
                  </div>
                  <pre className={styles.codeBody}>
                    <code>
                      <span className={styles.codeKeyword}>module</span>{" "}
                      slyce::deal &#123;
                      <br />
                      &nbsp;&nbsp;
                      <span className={styles.codeKeyword}>
                        public struct
                      </span>{" "}
                      <span className={styles.codeVar}>Deal</span> has key,
                      store &#123;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp; id: UID,
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp; collaborators:
                      vector&lt;address&gt;,
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp; cuts: vector&lt;u64&gt;,
                      <br />
                      &nbsp;&nbsp;&#125;
                      <br />
                      <br />
                      &nbsp;&nbsp;
                      <span className={styles.codeKeyword}>
                        public fun
                      </span>{" "}
                      <span className={styles.codeFunc}>release_earnings</span>
                      (deal: &Deal) &#123;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.codeComment}>
                        // Atomic PTB payout
                      </span>
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.codeKeyword}>distribute</span>(
                      deal.collaborators, deal.cuts);
                      <br />
                      &nbsp;&nbsp;&#125;
                      <br />
                      &#125;
                    </code>
                  </pre>
                  <div className={styles.verifiedBadge}>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className={styles.checkIcon}
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span>Verified Contract</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className={styles.featureRowReverse}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
            >
              <div className={styles.featureText}>
                <h3>Atomic, Simultaneous Payouts</h3>
                <p>
                  No one gets paid while someone else waits. The moment money
                  hits the contract, every collaborator receives their exact cut
                  simultaneously.
                </p>
              </div>
              <div className={styles.featureVisual}>
                <div className={styles.splitVisual}>
                  <div className={styles.splitInputNode}>
                    <span className={styles.splitTokenBadge}>USDC</span>
                    <span className={styles.splitAmount}>1,250</span>
                  </div>
                  <div className={styles.splitFlowLines}>
                    <div
                      className={`${styles.flowLine} ${styles.flowLineLeft}`}
                    >
                      <div className={styles.flowParticle}></div>
                    </div>
                    <div
                      className={`${styles.flowLine} ${styles.flowLineRight}`}
                    >
                      <div className={styles.flowParticle}></div>
                    </div>
                  </div>
                  <div className={styles.splitOutputs}>
                    <div className={styles.splitOutputNode}>
                      <span className={styles.splitUser}>Alice (60%)</span>
                      <span className={styles.splitPayout}>+750 USDC</span>
                    </div>
                    <div className={styles.splitOutputNode}>
                      <span className={styles.splitUser}>Bob (40%)</span>
                      <span className={styles.splitPayout}>+500 USDC</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className={styles.featureRow}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
            >
              <div className={styles.featureText}>
                <h3>No Crypto Knowledge Required</h3>
                <p>
                  Skip the wallet setup. Collaborators can join and securely
                  sign agreements using just their Google account via zkLogin.
                </p>
              </div>
              <div className={styles.featureVisual}>
                <div className={styles.routerVisual}>
                  <div className={styles.tokenPills}>
                    <span className={`${styles.tokenPill} ${styles.usdc}`}>
                      Google
                    </span>
                    <span className={`${styles.tokenPill} ${styles.eth}`}>
                      Twitch
                    </span>
                    <span className={`${styles.tokenPill} ${styles.sol}`}>
                      Apple
                    </span>
                  </div>
                  <div className={styles.routerHub}>
                    <div className={styles.routerCore}>
                      <div className={styles.pulseRing}></div>
                      <span>zkLogin Auth</span>
                    </div>
                  </div>
                  <div className={styles.routerDestinations}>
                    <div className={styles.destNode}>
                      <span>Secure Identity</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5-Step Vertical Timeline */}
        <section
          id="how-it-works"
          className={`${styles.section} ${styles.ambientGlow2}`}
        >
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
          >
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>
              From making the offer to getting paid.
            </p>
          </motion.div>

          <div className={styles.timelineWrapper}>
            <div className={styles.timelineLine}></div>

            {[
              {
                title: "Make the Offer",
                desc: "Start a collaboration and assign percentage cuts to your team.",
              },
              {
                title: "Lock the Agreement",
                desc: "Collaborators review the deal and confirm participation with one click.",
              },
              {
                title: "Start Creating",
                desc: "Focus on the work, knowing the financial agreement is set in stone.",
              },
              {
                title: "Earnings Arrive",
                desc: "The project goes live and starts generating revenue.",
              },
              {
                title: "Automatic Payout",
                desc: "Everyone receives their exact cut to their wallet at the exact same time.",
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className={styles.timelineStep}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineCard}>
                  <span className={styles.timelineNum}>Phase 0{idx + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Security Vault Banner */}
        <section className={styles.vaultBanner}>
          <div className={styles.vaultGrid}></div>
          <motion.div
            className={styles.vaultContent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
          >
            <div className={styles.vaultIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2>Code is Law</h2>
            <p>
              Your funds are protected by immutable smart contracts. Slyce is
              entirely non-custodial, meaning we can never access, freeze, or
              redirect your assets. Trust the math, not the middleman.
            </p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <img src={slycelogo} alt="Slyce" className={styles.footerLogoImg} />
            <span>Slyce</span>
          </div>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>Twitter</span>
            <span className={styles.footerLink}>Discord</span>
            <span className={styles.footerLink}>GitHub</span>
          </div>
          {connection.isConnected && (
            <Button variant="primary" onClick={() => navigate("/app")}>
              Launch App
            </Button>
          )}
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default LandingPage;
