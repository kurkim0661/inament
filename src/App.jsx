import React, { useEffect, useState } from 'react';
import mainImage from './assets/img-wall-shelf-1.jpg';
import detailTopImage from './assets/img-wall-shelf-2.jpg';
import detailBottomImage from './assets/img-wall-shelf-3.jpg';
import logoBlack from './assets/logo-inament-black.svg';
import logoFooter from './assets/logo-inament-footer.svg';
import arrowLeftIcon from './assets/ic-arrow-left.svg';
import arrowRightIcon from './assets/ic-arrow-right.svg';

const MOBILE_BREAKPOINT = 1160;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

const bulletPoints = [
  '견고한 오크를 손으로 직접 조각하여 제작했습니다.',
  '티크 스테인으로 마감했습니다.',
  '벽에 안정적으로 밀착되도록 비례를 잡았습니다.',
  '두 개의 선반과 서랍으로 구성되어 있습니다.',
  '작은 물건을 올려두기에 안성맞춤입니다.',
];

const isMobileViewport = () => (typeof window !== 'undefined' ? window.matchMedia(MOBILE_MEDIA_QUERY).matches : false);

function ProductCopy({ titleNodeId, listNodeId, className = '' }) {
  return (
    <article className={`product-copy ${className}`.trim()}>
      <h2 data-node-id={titleNodeId}>앤티크에서 영감을 받은 벽걸이 선반</h2>
      <ul data-node-id={listNodeId}>
        {bulletPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  );
}

function FooterContent({ logoNodeId, textNodeId, copyrightNodeId, className = '' }) {
  return (
    <div className={`footer-content ${className}`.trim()}>
      <img className="footer-logo" src={logoFooter} alt="inament." loading="lazy" data-node-id={logoNodeId} />
      <p className="footer-meta" data-node-id={textNodeId}>
        스튜디오 이나무 | 대표: 강인화 | 사업자등록번호: 508-15-92589
        <br />
        T. 010-3301-3108 | E. info.inament@gmail.com
      </p>
      <p className="footer-meta" data-node-id={copyrightNodeId}>
        © 2026 inament. All rights reserved.
      </p>
    </div>
  );
}

function App() {
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);

    const syncViewportMode = () => {
      setIsMobile(isMobileViewport());
    };

    syncViewportMode();
    window.addEventListener('resize', syncViewportMode);
    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', syncViewportMode);
    } else if (typeof mediaQueryList.addListener === 'function') {
      mediaQueryList.addListener(syncViewportMode);
    }

    return () => {
      window.removeEventListener('resize', syncViewportMode);
      if (typeof mediaQueryList.removeEventListener === 'function') {
        mediaQueryList.removeEventListener('change', syncViewportMode);
      } else if (typeof mediaQueryList.removeListener === 'function') {
        mediaQueryList.removeListener(syncViewportMode);
      }
    };
  }, []);

  return (
    <div className="page-root">
      <header className="site-header">
        <img className="site-logo" src={logoBlack} alt="inament." loading="eager" data-node-id="2:150" />
      </header>

      {!isMobile && (
        <div className="desktop-view" data-node-id="2:14">
          <button className="nav-arrow nav-arrow-left" type="button" aria-label="Previous image" data-node-id="2:27">
            <img src={arrowLeftIcon} alt="" aria-hidden="true" />
          </button>

          <button className="nav-arrow nav-arrow-right" type="button" aria-label="Next image" data-node-id="2:29">
            <img src={arrowRightIcon} alt="" aria-hidden="true" />
          </button>

          <main className="desktop-content-frame" data-node-id="2:121">
            <section className="desktop-left-column" data-node-id="2:117">
              <div className="main-image-wrap" data-node-id="2:103">
                <img src={mainImage} alt="Wall Shelf" loading="eager" />
              </div>
              <h1 className="product-title" data-node-id="2:18">
                Wall Shelf
              </h1>
            </section>

            <section className="desktop-right-column" data-node-id="2:119">
              <div className="desktop-detail-grid" data-node-id="2:106">
                <div className="detail-image detail-image-top" data-node-id="2:104">
                  <img src={detailTopImage} alt="" aria-hidden="true" loading="lazy" />
                </div>
                <div className="detail-image detail-image-bottom" data-node-id="2:105">
                  <img src={detailBottomImage} alt="" aria-hidden="true" loading="lazy" />
                </div>
              </div>
              <ProductCopy titleNodeId="2:19" listNodeId="2:20" data-node-id="2:36" />
            </section>
          </main>

          <footer className="site-footer desktop-footer" data-node-id="2:127">
            <FooterContent logoNodeId="2:152" textNodeId="2:24" copyrightNodeId="2:25" />
          </footer>
        </div>
      )}

      {isMobile && (
        <div className="mobile-view" data-node-id="2:162">
          <main className="mobile-main">
            <section className="mobile-image-stack" data-node-id="17:201">
              <div className="mobile-image mobile-image-1" data-node-id="2:174">
                <img src={mainImage} alt="Wall Shelf" loading="eager" />
              </div>
              <div className="mobile-image mobile-image-2" data-node-id="17:196">
                <img src={detailTopImage} alt="" aria-hidden="true" loading="lazy" />
              </div>
              <div className="mobile-image mobile-image-3" data-node-id="17:200">
                <img src={detailBottomImage} alt="" aria-hidden="true" loading="lazy" />
              </div>
            </section>

            <section className="mobile-text-block" data-node-id="17:207">
              <h1 className="product-title mobile-product-title" data-node-id="17:202">
                Wall Shelf
              </h1>
              <ProductCopy titleNodeId="17:205" listNodeId="17:206" className="mobile-product-copy" />
            </section>

            <footer className="site-footer mobile-footer" data-node-id="17:208">
              <FooterContent logoNodeId="17:211" textNodeId="17:220" copyrightNodeId="17:221" className="mobile-footer-content" />
            </footer>
          </main>

          <nav className="mobile-bottom-nav" data-node-id="17:195" aria-label="Previous and next object navigation">
            <button className="mobile-nav-btn mobile-nav-btn-prev" type="button" aria-label="Previous object" data-node-id="17:193">
              <img src={arrowLeftIcon} alt="" aria-hidden="true" data-node-id="2:186" />
              <span data-node-id="17:191">Previous Object</span>
            </button>
            <button className="mobile-nav-btn mobile-nav-btn-next" type="button" aria-label="Next object" data-node-id="17:194">
              <span data-node-id="2:190">Next Object</span>
              <img src={arrowRightIcon} alt="" aria-hidden="true" data-node-id="2:188" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default App;
