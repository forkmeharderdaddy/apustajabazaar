import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import TradingViewWidget from "../components/widgets/radingviewwidget.jsx"
/**
 * Landing page with a simple gradient background and a hero asset.
 * Free to customize as you see fit.
 */


const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.hero}>
          <div className={styles.heroBackground}>
            <div className={styles.heroBackgroundInner}>
              <Image
                src="/hero-gradient.png"
                width={1390}
                height={1390}
                alt="Background gradient from red to blue"
                quality={100}
                className={styles.gradient}
              />
            </div>
          </div>
          <div className={styles.heroAssetFrame}> 
            <Image
              src="/peakyautismos.gif"
              width={860}
              height={540}
              alt="Hero asset, NFT marketplace"
              quality={100}
              className={styles.heroAsset}
            />
          </div>
          <div className={styles.heroBodyContainer}>
            <div className={styles.heroBody}>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleGradient}>
                  Apustajas
                </span>
                <br />
                Bazaar
              </h1>
              <p className={styles.heroSubtitle}>
                <Link
                  className={styles.link}
                  href="https://thirdweb.com"
                  target="_blank"
                >
                  A marketplace
                </Link>{" "}
                for shitlords and memetic masters
              </p>

              <div className={styles.heroCtaContainer}>
                <Link className={styles.heroCta} href="/buy">
                  Browse Wares
                </Link>
                <Link
                  className={styles.secondaryCta}
                  href="https://mint.jammybears.com"
                  target="_blank"
                >
                  Create
                </Link> 
                </div>
                </div>
                <TradingViewWidget/>
                </div>            
              </div>
            </div>
          </div>
  );
};

export default Home;
