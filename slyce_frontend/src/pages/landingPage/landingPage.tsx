import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Button from "../../components/button/Button";
import LoginModal from "../../components/loginModal/LoginModal";
import styles from "./landingPage.module.css";

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

  return (
    <div className={styles.container}>
      {/* Hero Container */}
      <div className={styles.heroContainer}>
        <header className={styles.header}>
          <div className={styles.logo}>Slyce</div>
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
            <Button
              variant="ghost"
              className={styles.navLink}
              onClick={() => setIsLoginOpen(true)}
            >
              Log in
            </Button>
            <Button variant="primary" onClick={() => navigate("/app")}>
              Launch App
            </Button>
          </div>
        </header>

        <motion.section
          className={styles.hero}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1 variants={fadeUpVariant} className={styles.heroTitle}>
            Automate your earnings.
            <br />
            Trustless revenue sharing.
          </motion.h1>
          <motion.p variants={fadeUpVariant} className={styles.heroSubtitle}>
            The modern protocol designed for creators, founders, and teams to
            instantly split payments on-chain without middlemen or manual
            accounting.
          </motion.p>
          <motion.div variants={fadeUpVariant} className={styles.heroActions}>
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate("/app")}
            >
              Start Splitting
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
              <h3 className={styles.useCaseTitle}>Content Creators</h3>
              <p className={styles.useCaseDesc}>
                Automatically split ad revenue, sponsorships, and donations with
                your team.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className={styles.useCaseCard}>
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80"
                alt="Founders"
                className={styles.useCaseImage}
              />
              <div className={styles.useCaseOverlay} />
              <h3 className={styles.useCaseTitle}>Founders & Startups</h3>
              <p className={styles.useCaseDesc}>
                Distribute company earnings trustlessly based on hardcoded
                agreements.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className={styles.useCaseCard}>
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80"
                alt="Music"
                className={styles.useCaseImage}
              />
              <div className={styles.useCaseOverlay} />
              <h3 className={styles.useCaseTitle}>Music & Royalties</h3>
              <p className={styles.useCaseDesc}>
                Streamline royalty payments for producers, artists, and labels.
                No more waiting.
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
                <h3>Trustless Execution</h3>
                <p>
                  The protocol handles the money, not a middleman. Once a split
                  contract is deployed, funds are distributed instantly and
                  autonomously according to the predetermined percentages. No
                  one can intercept or delay your earnings.
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

            {/* Feature 2 */}
            <motion.div
              className={styles.featureRowReverse}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
            >
              <div className={styles.featureText}>
                <h3>Multi-Token Routing</h3>
                <p>
                  Accept payments in USDC, ETH, or any supported ERC-20 token.
                  The protocol automatically routes and splits the correct
                  asset, allowing participants to withdraw exactly what they are
                  owed without complex conversions.
                </p>
              </div>
              <div className={styles.featureVisual}>
                <div className={styles.routerVisual}>
                  <div className={styles.tokenPills}>
                    <span className={`${styles.tokenPill} ${styles.usdc}`}>
                      USDC
                    </span>
                    <span className={`${styles.tokenPill} ${styles.eth}`}>
                      ETH
                    </span>
                    <span className={`${styles.tokenPill} ${styles.sol}`}>
                      SOL
                    </span>
                  </div>
                  <div className={styles.routerHub}>
                    <div className={styles.routerCore}>
                      <div className={styles.pulseRing}></div>
                      <span>Slyce Router</span>
                    </div>
                  </div>
                  <div className={styles.routerDestinations}>
                    <div className={styles.destNode}>
                      <span>Split A (50%)</span>
                    </div>
                    <div className={styles.destNode}>
                      <span>Split B (50%)</span>
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
                <h3>Verifiable on-chain</h3>
                <p>
                  Every split deployed is a completely transparent, verifiable
                  smart contract. Participants can independently audit the code,
                  ensuring the allocations match exactly what was agreed upon
                  before any funds are deposited.
                </p>
              </div>
              <div className={styles.featureVisual}>
                <div className={styles.codeVisual}>
                  <div className={styles.codeHeader}>
                    <span className={styles.codeDot}></span>
                    <span className={styles.codeDot}></span>
                    <span className={styles.codeDot}></span>
                    <span className={styles.codeTitle}>SlyceSplit.sol</span>
                  </div>
                  <pre className={styles.codeBody}>
                    <code>
                      <span className={styles.codeKeyword}>contract</span>{" "}
                      SlyceSplit &#123;
                      <br />
                      &nbsp;&nbsp;
                      <span className={styles.codeKeyword}>address</span>[]{" "}
                      <span className={styles.codeVar}>payees</span>;<br />
                      &nbsp;&nbsp;
                      <span className={styles.codeKeyword}>uint256</span>[]{" "}
                      <span className={styles.codeVar}>shares</span>;<br />
                      <br />
                      &nbsp;&nbsp;
                      <span className={styles.codeKeyword}>function</span>{" "}
                      <span className={styles.codeFunc}>splitFunds</span>(){" "}
                      <span className={styles.codeKeyword}>public</span> &#123;
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.codeComment}>
                        // Verified Flow
                      </span>
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <span className={styles.codeKeyword}>distribute</span>(
                      <span className={styles.codeVar}>payees</span>,{" "}
                      <span className={styles.codeVar}>shares</span>);
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
            <h2 className={styles.sectionTitle}>The Lifecycle of a Split</h2>
            <p className={styles.sectionSubtitle}>
              Five automated steps from creation to withdrawal.
            </p>
          </motion.div>

          <div className={styles.timelineWrapper}>
            <div className={styles.timelineLine}></div>

            {[
              {
                title: "Create a Split",
                desc: "Deploy a new smart contract that serves as your shared treasury address.",
              },
              {
                title: "Add Collaborators",
                desc: "Input wallet addresses and assign precise percentage allocations.",
              },
              {
                title: "Share Address",
                desc: "Provide your new split address to sponsors, platforms, or customers.",
              },
              {
                title: "Receive Funds",
                desc: "Payments arrive and are instantly accounted for in the contract logic.",
              },
              {
                title: "Auto-Withdraw",
                desc: "Participants securely claim their exact share directly to their wallets.",
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
              entirely non-custodial—meaning we can never access, freeze, or
              redirect your assets. Trust the math, not the middleman.
            </p>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>Slyce</div>
          <div className={styles.footerLinks}>
            <span className={styles.footerLink}>Twitter</span>
            <span className={styles.footerLink}>Discord</span>
            <span className={styles.footerLink}>GitHub</span>
          </div>
          <Button variant="primary" onClick={() => navigate("/app")}>
            Launch App
          </Button>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default LandingPage;
