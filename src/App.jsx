import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    // Scroll reveal observer
    const revealElements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
      root: null, // use the viewport
      threshold: 0.15, // trigger when 15% of the element is visible
      rootMargin: '0px 0px -50px 0px' // slightly offset triggering
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

    return () => {
      revealElements.forEach(element => {
        revealObserver.unobserve(element);
      });
    };
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Products />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
