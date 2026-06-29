import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Products from '../components/Products';
import Gallery from '../components/Gallery';
import ContactSection from '../components/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Products />
      <Gallery />
      <ContactSection />
    </>
  );
}
