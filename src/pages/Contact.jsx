import React from 'react';
import ContactSection from '../components/Contact';
import './Contact.css';

export default function Contact() {
  return (
    <div className="contact-page-container">
      {/* Page Header Banner */}
      <div className="contact-page-banner">
        <div className="container">
          <span className="section-subtitle">Get In Touch</span>
          <h1 className="contact-banner-title">Contact Our Team</h1>
          <p className="contact-banner-desc">
            We are here to support your wholesale accounts, bespoke designer fabric orders, and sample catalog requests.
          </p>
        </div>
      </div>

      {/* Reused Contact Component */}
      <ContactSection />
      
      {/* Embedded Map Widget */}
      <div className="map-embed-section container">
        <h3 className="map-heading">Our Location</h3>
        <div className="map-wrapper">
          <iframe
            title="Rudraksha Headquarters"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.803527448375!2d72.82737671531649!3d19.028373458284897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ced0b0f2a9db%3A0xb5b79e7c3e1e9124!2sDadar%20West%2C%20Dadar%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
