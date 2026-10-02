import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="anna-footer">
      <div className="anna-footer-inner">
        <div className="anna-footer-brand">
          <div className="anna-footer-logo">N</div>

          <div>
            <h3>Nivetha Catering Service</h3>
            <p>Owner Management Panel</p>
          </div>
        </div>

        <div className="anna-footer-center">
          <span>© 2026 Nivetha Catering Service</span>
          <span className="anna-footer-dot">•</span>
          <span>All Rights Reserved</span>
        </div>

        <div className="anna-footer-credit">
          <span>Created with</span>
          <strong>❤️</strong>
          <span>for Nivetha Catering</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;