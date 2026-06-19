// "use client";

// export default function Hero() {
//   return (
//     <>
//       <style>{`
//         .ph-hero {
//           position: relative;
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           min-height: 260px;
//           overflow: hidden;
//           background: #f7f9f5;
//         }

//         /* LEFT */
//         .ph-left {
//           position: relative;
//           z-index: 2;
//           background: #ffffff;
//           display: flex;
//           flex-direction: column;
//           justify-content: center;
//           padding: 1.6rem 0rem 1.6rem 8rem;
//           gap: 0.8rem;
//         }

//         .ph-left::after {
//           content: "";
//           position: absolute;
//           top: 0;
//           right: -50px;
//           width: 50px;
//           height: 100%;
//           background: #ffffff;
//           clip-path: polygon(0 0, 0 100%, 100% 100%);
//           z-index: 3;
//         }

//         .ph-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.5rem;
//           width: fit-content;
//         }

//         .ph-badge-primary {
//           background: #e8f5e9;
//           color: #1b5e20;
//           font-size: 0.7rem;
//           font-weight: 700;
//           padding: 0.3rem 0.75rem;
//           border-radius: 4px;
//           text-transform: uppercase;
//         }

//         .ph-badge-label {
//           font-size: 0.7rem;
//           color: #888;
//         }

//         .ph-title {
//           font-size: clamp(1.4rem, 3vw, 2.2rem);
//           font-weight: 800;
//           line-height: 1.1;
//           color: #0d1b0e;
//           margin: 0;
//         }

//         .ph-title .highlight {
//           color: #2e7d32;
//         }

//         .ph-description {
//           max-width: 540px;
//           color: #666;
//           font-size: 0.9rem;
//           line-height: 1.7;
//         }

//         .ph-tags {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 0.5rem;
//         }

//         .ph-tag {
//           display: inline-flex;
//           align-items: center;
//           gap: 0.45rem;
//           background: #f4f4f4;
//           padding: 0.28rem 0.8rem;
//           border-radius: 999px;
//           font-size: 0.72rem;
//           font-weight: 500;
//           color: #333;
//         }

//         .ph-tag-dot {
//           width: 6px;
//           height: 6px;
//           border-radius: 50%;
//           background: #2e7d32;
//         }

//         /* RIGHT */
//         .ph-right {
//           position: relative;
//           overflow: hidden;
//         }

//         .ph-right-img {
//           position: absolute;
//           inset: 0;
//           background: url("https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80")
//             center center / cover no-repeat;
//         }

//         .ph-right-overlay {
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(
//             135deg,
//             rgba(46, 125, 50, 0.12) 0%,
//             rgba(0, 0, 0, 0.1) 100%
//           );
//         }

//         .ph-corner-tag {
//           position: absolute;
//           top: 1rem;
//           right: 7rem;
//           background: #2e7d32;
//           color: white;
//           font-size: 0.65rem;
//           font-weight: 700;
//           padding: 0.3rem 0.9rem;
//           border-radius: 999px;
//           z-index: 3;
//         }

//         .ph-info-card {
//           position: absolute;
//           bottom: 1rem;
//           right: 7rem;
//           background: #fff;
//           border-radius: 12px;
//           padding: 1rem;
//           box-shadow: 0 8px 24px rgba(0,0,0,.15);
//           width: 220px;
//           z-index: 3;
//         }

//         .ph-info-title {
//           color: #2e7d32;
//           font-size: 1rem;
//           font-weight: 700;
//           margin-bottom: 0.3rem;
//         }

//         .ph-info-text {
//           font-size: 0.7rem;
//           color: #555;
//           line-height: 1.5;
//         }

//         .ph-warning-box {
//           margin-top: 0.5rem;
//           background: #fff8e1;
//           border: 1px solid #ffe082;
//           padding: 0.8rem 1rem;
//           border-radius: 10px;
//           font-size: 0.75rem;
//           color: #555;
//           line-height: 1.7;
//           max-width: 580px;
//         }

//         /* MOBILE */
//         @media (max-width: 768px) {
//           .ph-hero {
//             grid-template-columns: 1fr;
//           }

//           .ph-right {
//             order: -1;
//             height: 160px;
//           }

//           .ph-left {
//             padding: 1rem;
//           }

//           .ph-left::after {
//             display: none;
//           }

//           .ph-corner-tag {
//             right: 1rem;
//             top: 1rem;
//           }

//           .ph-info-card {
//             display: none;
//           }

//           .ph-title {
//             font-size: 1.4rem;
//           }
//         }
//       `}</style>

//       <section
//         className="ph-hero"
//         aria-label="Prescription Medicine Information & Inquiry Platform"
//       >
//         {/* LEFT */}
//         <div className="ph-left">
//           <div className="ph-badge">
//             <span className="ph-badge-primary">
//               Prescription Verification Required
//             </span>

//             <span className="ph-badge-label">
//               Manual Review Process
//             </span>
//           </div>

//           <h1 className="ph-title">
//             Prescription Medicine <br />
//             <span className="highlight">
//               Information & Inquiry Platform
//             </span>
//           </h1>

//           <div className="ph-description">
//             Access medicine information, dosage details, possible side
//             effects and submit prescription inquiries. All requests are
//             manually reviewed and subject to prescription verification and
//             applicable legal compliance requirements.
//           </div>

//           <div className="ph-tags">
//             <span className="ph-tag">
//               <span className="ph-tag-dot"></span>
//               💊 Medicine Information
//             </span>

//             <span className="ph-tag">
//               <span className="ph-tag-dot"></span>
//               📋 Prescription Verification
//             </span>

//             <span className="ph-tag">
//               <span className="ph-tag-dot"></span>
//               🔍 Availability Inquiry
//             </span>
//           </div>

//           <div className="ph-warning-box">
//             <strong>Important Notice:</strong> This website functions as a
//             prescription medicine information and inquiry platform. Submission
//             of an inquiry does not constitute a purchase, sale, shipment, or
//             delivery of medicines. All requests are manually reviewed and may
//             require prescription verification in accordance with applicable
//             regulations.
//           </div>
//         </div>

//         {/* RIGHT */}
//         <div className="ph-right">
//           <div className="ph-right-img"></div>
//           <div className="ph-right-overlay"></div>

//           <div className="ph-corner-tag">
//             Information Only
//           </div>

//           <div className="ph-info-card">
//             <div className="ph-info-title">
//               Prescription Notice
//             </div>

//             <div className="ph-info-text">
//               Availability inquiries are reviewed manually. Prescription
//               verification may be required before further processing.
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }



"use client";

export default function Hero() {
  return (
    <>
      <style>{`
        .ph-hero {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 260px;
          overflow: hidden;
          background: #f7f9f5;
        }

        /* LEFT */
        .ph-left {
          position: relative;
          z-index: 2;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem 0rem 1.5rem 8rem;
          gap: .8rem;
        }

        .ph-left::after {
          content: "";
          position: absolute;
          top: 0;
          right: -50px;
          width: 50px;
          height: 100%;
          background: #fff;
          clip-path: polygon(0 0, 0 100%, 100% 100%);
        }

        .ph-badge {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
        }

        .ph-badge-main {
          background: #e8f5e9;
          color: #1b5e20;
          font-size: .7rem;
          font-weight: 700;
          padding: .3rem .8rem;
          border-radius: 4px;
        }

        .ph-badge-sub {
          color: #888;
          font-size: .7rem;
        }

        .ph-title {
          font-size: clamp(1.4rem, 3vw, 2.1rem);
          font-weight: 800;
          line-height: 1.1;
          color: #111;
          margin: 0;
        }

        .ph-title span {
          color: #2e7d32;
        }

        .ph-description {
          max-width: 550px;
          font-size: .88rem;
          line-height: 1.7;
          color: #666;
        }

        .ph-tags {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
        }

        .ph-tag {
          display: flex;
          align-items: center;
          gap: .4rem;
          background: #f5f5f5;
          padding: .25rem .8rem;
          border-radius: 999px;
          font-size: .72rem;
          color: #333;
        }

        .ph-dot {
          width: 6px;
          height: 6px;
          background: #2e7d32;
          border-radius: 50%;
        }

        .ph-warning {
          background: #fff8e1;
          border: 1px solid #ffe082;
          border-radius: 10px;
          padding: .8rem 1rem;
          font-size: .75rem;
          color: #555;
          line-height: 1.7;
          max-width: 580px;
        }

        /* RIGHT */
        .ph-right {
          position: relative;
          overflow: hidden;
        }

        .ph-right-img {
          position: absolute;
          inset: 0;
          background:
            url("https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80")
            center center / cover no-repeat;
        }

        .ph-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              135deg,
              rgba(46,125,50,.12),
              rgba(0,0,0,.1)
            );
        }

        .ph-corner {
          position: absolute;
          top: 1rem;
          right: 7rem;
          background: #2e7d32;
          color: white;
          font-size: .65rem;
          font-weight: 700;
          padding: .3rem .8rem;
          border-radius: 999px;
          z-index: 5;
        }

        .ph-card {
          position: absolute;
          bottom: 1rem;
          right: 7rem;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          width: 220px;
          box-shadow: 0 8px 24px rgba(0,0,0,.15);
          z-index: 5;
        }

        .ph-card-title {
          color: #2e7d32;
          font-weight: 700;
          margin-bottom: .4rem;
        }

        .ph-card-text {
          font-size: .72rem;
          color: #666;
          line-height: 1.6;
        }

        @media (max-width:768px) {

          .ph-hero {
            grid-template-columns: 1fr;
          }

          .ph-right {
            order: -1;
            height: 160px;
          }

          .ph-left {
            padding: 1rem;
          }

          .ph-left::after {
            display: none;
          }

          .ph-card {
            display: none;
          }

          .ph-corner {
            right: 1rem;
          }
        }
      `}</style>

      <section
        className="ph-hero"
        aria-label="Prescription Medicine Information & Inquiry Platform"
      >
        {/* LEFT */}
        <div className="ph-left">

          <div className="ph-badge">
            <span className="ph-badge-main">
              📋 Prescription Verification Required
            </span>

            <span className="ph-badge-sub">
              Manual Review Process
            </span>
          </div>

          <h1 className="ph-title">
            Prescription Medicine <br />
            <span>Information & Inquiry Platform</span>
          </h1>

          <div className="ph-description">
            Access medicine information, dosage details, side effects and
            submit prescription inquiries. All requests are manually reviewed
            and subject to prescription verification and applicable legal
            compliance requirements.
          </div>

          <div className="ph-tags">

            <div className="ph-tag">
              <span className="ph-dot"></span>
              💊 Medicine Information
            </div>

            <div className="ph-tag">
              <span className="ph-dot"></span>
              📋 Prescription Verification
            </div>

            <div className="ph-tag">
              <span className="ph-dot"></span>
              🔍 Availability Inquiry
            </div>

          </div>

          <div className="ph-warning">
            <strong>Important Notice:</strong> This website functions as a
            prescription medicine information and inquiry platform. Submission
            of an inquiry does not constitute a purchase, sale, shipment,
            supply or delivery. All requests are manually reviewed and may
            require prescription verification in accordance with applicable
            regulations.
          </div>

        </div>

        {/* RIGHT */}
        <div className="ph-right">

          <div className="ph-right-img"></div>

          <div className="ph-overlay"></div>

          <div className="ph-corner">
            Information Only
          </div>

          <div className="ph-card">

            <div className="ph-card-title">
              Prescription Notice
            </div>

            <div className="ph-card-text">
              Availability inquiries are reviewed manually. Prescription
              verification may be required before further processing.
            </div>

          </div>

        </div>
      </section>
    </>
  );
}