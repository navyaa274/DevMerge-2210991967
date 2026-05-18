import React, { useState } from 'react';
import './CourseCatalog.css';

const CourseCatalog = () => {
    const [activeTab, setActiveTab] = useState('UG');

    const programs = {
        UG: [
            {
                title: "B.Tech. Computer Science and Engineering",
                duration: "4 Years",
                level: "Bachelor",
                supports: []
            },
            {
                title: "B.Tech. CSE (Robotics & AI)",
                duration: "4 Years",
                level: "Bachelor",
                supports: [
                    { label: "Academic Support", partner: "IBM" },
                    { label: "Certification", partner: "Microsoft" }
                ]
            },
            {
                title: "B.Tech. CSE (AI & ML)",
                duration: "4 Years",
                level: "Bachelor",
                supports: [
                    { label: "Academic Support", partner: "IBM" },
                    { label: "Certification", partner: "Microsoft" }
                ]
            },
            {
                title: "B.Tech. CSE (Cybersecurity)",
                duration: "4 Years",
                level: "Bachelor",
                supports: [
                    { label: "Academic Support", partner: "EC-Council & IBM" }
                ]
            },
            {
                title: "B.Tech. CSE (Data Science)",
                duration: "4 Years",
                level: "Bachelor",
                supports: [
                    { label: "Academic Support", partner: "IBM" }
                ]
            },
            {
                title: "B.Tech. CSE (Full Stack Development)",
                duration: "4 Years",
                level: "Bachelor",
                supports: [
                    { label: "Academic Support", partner: "ImaginXP" }
                ]
            }
        ],
        PG: [
            {
                title: "Master of Computer Applications (MCA)",
                duration: "2 Years",
                level: "Masters",
                supports: []
            },
            {
                title: "MCA (AI & ML)",
                duration: "2 Years",
                level: "Masters",
                supports: [
                    { label: "Academic Support", partner: "IBM" },
                    { label: "Certification", partner: "Microsoft" }
                ]
            },
            {
                title: "M.Tech. Computer Science and Engineering",
                duration: "2 Years",
                level: "Masters",
                supports: []
            }
        ],
        PHD: [
            {
                title: "Ph.D. in Computer Science and Engineering",
                duration: "3-5 Years",
                level: "Doctoral",
                supports: []
            },
            {
                title: "Ph.D. in Mechanical Engineering",
                duration: "3-5 Years",
                level: "Doctoral",
                supports: []
            }
        ]
    };

    return (
        <div className="catalog-container">
            <header className="hero-section" style={{ backgroundImage: `url('/images/hero-bg.png')` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Academic Excellence</h1>
                    <p>Shape the future of technology with our world-class engineering and computing programs.</p>
                </div>
            </header>

            <div className="category-nav">
                <button
                    className={`nav-btn ${activeTab === 'UG' ? 'active' : ''}`}
                    onClick={() => setActiveTab('UG')}
                >
                    Undergraduate (UG)
                </button>
                <button
                    className={`nav-btn ${activeTab === 'PG' ? 'active' : ''}`}
                    onClick={() => setActiveTab('PG')}
                >
                    Postgraduate (PG)
                </button>
                <button
                    className={`nav-btn ${activeTab === 'PHD' ? 'active' : ''}`}
                    onClick={() => setActiveTab('PHD')}
                >
                    Doctoral (Ph.D.)
                </button>
            </div>

            <main className="program-grid">
                {programs[activeTab].map((course, index) => (
                    <div className="program-card" key={index}>
                        <div className="badge-row">
                            <span className="badge badge-duration">{course.duration}</span>
                            <span className="badge badge-level">{course.level}</span>
                        </div>
                        <h3 className="program-title">{course.title}</h3>

                        {course.supports.length > 0 && (
                            <div className="support-section">
                                {course.supports.map((sup, sIdx) => (
                                    <div className="support-item" key={sIdx}>
                                        <span className="support-label">{sup.label}:</span>
                                        <span className="support-logo">{sup.partner}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </main>

            <footer style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                &copy; 2026 DevMerge Academy • Faculty of Engineering & Technology
            </footer>
        </div>
    );
};

export default CourseCatalog;
