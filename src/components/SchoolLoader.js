import React, { useState, useEffect } from 'react';
import './SchoolLoader.css';
import {
  BookOutlined,
  CalculatorOutlined,
  CompassOutlined,
  ExperimentOutlined,
  GlobalOutlined,
  HistoryOutlined,
  LaptopOutlined,
  ReadOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const schoolIcons = [
  { icon: <BookOutlined />, color: '#4a90e2' },
  { icon: <CalculatorOutlined />, color: '#f5a623' },
  { icon: <CompassOutlined />, color: '#7ed321' },
  { icon: <ExperimentOutlined />, color: '#9013fe' },
  { icon: <GlobalOutlined />, color: '#50e3c2' },
  { icon: <HistoryOutlined />, color: '#d0021b' },
  { icon: <LaptopOutlined />, color: '#417505' },
  { icon: <ReadOutlined />, color: '#f8e71c' },
  { icon: <TrophyOutlined />, color: '#b8e986' }
];

const SchoolLoader = () => {
  const [activeIcons, setActiveIcons] = useState([]);

  useEffect(() => {
    // Select 3 random icons
    const shuffled = [...schoolIcons].sort(() => 0.5 - Math.random());
    setActiveIcons(shuffled.slice(0, 3));

    // Change icons every 3 seconds
    const interval = setInterval(() => {
      const shuffled = [...schoolIcons].sort(() => 0.5 - Math.random());
      setActiveIcons(shuffled.slice(0, 3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="school-loader-container">
      <div className="school-loader">
        <div className="pencil">
          <div className="pencil-body">
            <div className="pencil-tip"></div>
            <div className="pencil-eraser"></div>
          </div>
        </div>
        <div className="paper">
          <div className="lines">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
        </div>
        <div className="floating-icons">
          {activeIcons.map((item, index) => (
            <div 
              key={index} 
              className="floating-icon"
              style={{ 
                animationDelay: `${index * 0.2}s`,
                color: item.color
              }}
            >
              {item.icon}
            </div>
          ))}
        </div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default SchoolLoader; 