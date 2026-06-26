import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'wholesale',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryType: 'wholesale',
        message: ''
      });
    }, 1500);
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        
        <div className="section-header reveal">
          <span className="section-subtitle">Get In Touch</span>
          <h2 className="section-title">Inquire & Partner</h2>
          <p style={{ marginTop: '16px', color: 'var(--color-brown-subtle)' }}>
            Have a custom order request or need pricing tables for wholesale volumes? Drop us a message, and our representative will contact you.
          </p>
        </div>

        <div className="contact-grid">
          
          {/* Left Column: Contact details */}
          <div className="contact-info reveal">
            <h3 className="contact-subheading">Corporate Office</h3>
            <p className="contact-info-desc">
              Visit our headquarters to browse physical swatches, discuss custom textures, and align wholesale contracts.
            </p>

            <ul className="info-list">
              <li>
                <div className="info-icon-box">
                  <MapPin size={20} />
                </div>
                <div className="info-text-box">
                  <span className="info-label">Address</span>
                  <span className="info-value">Suite 740, Golden Weave Mansion, Textile Avenue, Mumbai, MH 400012</span>
                </div>
              </li>
              <li>
                <div className="info-icon-box">
                  <Phone size={20} />
                </div>
                <div className="info-text-box">
                  <span className="info-label">Phone</span>
                  <span className="info-value">+91 (22) 555-8291 / +91 (22) 555-8292</span>
                </div>
              </li>
              <li>
                <div className="info-icon-box">
                  <Mail size={20} />
                </div>
                <div className="info-text-box">
                  <span className="info-label">Email</span>
                  <span className="info-value">corporate@rudrakshatextiles.com</span>
                </div>
              </li>
              <li>
                <div className="info-icon-box">
                  <Clock size={20} />
                </div>
                <div className="info-text-box">
                  <span className="info-label">Business Hours</span>
                  <span className="info-value">Monday – Saturday: 9:00 AM – 7:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="contact-form-container reveal delay-200">
            {isSubmitted ? (
              <div className="success-state">
                <CheckCircle className="success-icon pulse-gold" size={60} />
                <h3>Thank You!</h3>
                <p>
                  Your inquiry has been successfully sent. A Rudraksha Textiles representative will review your message and contact you within 24 hours.
                </p>
                <button className="btn btn-outline" onClick={() => setIsSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inquiryType" className="form-label">Inquiry Type</label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="wholesale">Wholesale Order & Pricing</option>
                    <option value="retail">Retail Custom Purchase</option>
                    <option value="design">Custom Pattern Weaving</option>
                    <option value="samples">Request Fabric Swatch Samples</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    placeholder="Describe your volume needs, custom designs, or general fabric queries..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary form-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Sending Inquiry...</span>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Send size={16} style={{ marginLeft: '10px' }} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
