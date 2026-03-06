import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({ 
  children, 
  baseOpacity = 0, 
  translateY = 30, 
  translateX = 0, 
  scale = 1, 
  duration = 1, 
  delay = 0,
  ease = "power3.out"
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;

    gsap.fromTo(el, 
      { 
        opacity: baseOpacity, 
        y: translateY, 
        x: translateX,
        scale: scale 
      },
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: duration,
        delay: delay / 1000,
        ease: ease,
        scrollTrigger: {
          trigger: el,
          start: "top 85%", // Se activa cuando el elemento está al 85% de la pantalla
          toggleActions: "play none none reverse",
          once: true // Solo se anima la primera vez que aparece
        }
      }
    );
  }, [baseOpacity, translateY, translateX, scale, duration, delay, ease]);

  return (
    <div ref={elementRef} style={{ opacity: baseOpacity }}>
      {children}
    </div>
  );
};

export default ScrollReveal;