# Future Features & Components

This file contains code and components that were temporarily removed but should be retained for future use in the Nyaya Saathi project.

## 1. Landing Page Stats Counters

This animated stats counter was originally at the bottom of the video hero section. It uses `IntersectionObserver` to trigger a rapid counting animation once the footer becomes visible.

**Intended use case:**
Once Nyaya Saathi has real metrics to display (e.g., number of citizens assisted, documents analyzed), this component can be re-added to `frontend/src/app/page.tsx`.

### Code Implementation (`StatsFooter` Component):

```tsx
const StatsFooter = () => {
  const [counts, setCounts] = useState({ time: 0, uptime: 0, runtime: 0, context: 0 });
  const footerRef = useRef<HTMLElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!footerRef.current || hasAnimated) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setHasAnimated(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setCounts({ time: 10000, uptime: 5000, runtime: 24, context: 100 });
      return;
    }
    
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const animate = (target: number, delay: number, duration: number, key: keyof typeof counts) => {
      let startTime: number | null = null;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const rawT = Math.min(progress / duration, 1);
        const current = easeOutCubic(rawT) * target;
        setCounts(prev => ({ ...prev, [key]: current }));
        if (rawT < 1) requestAnimationFrame(step);
        else setCounts(prev => ({ ...prev, [key]: target }));
      };
      setTimeout(() => requestAnimationFrame(step), delay);
    };

    // Update target numbers and delays here
    animate(10000, 480, 1500, 'time');    // e.g., Citizens Assisted
    animate(5000, 570, 1580, 'uptime');   // e.g., Documents Analyzed
    animate(24, 660, 1660, 'runtime');    // e.g., 24/7 Availability
    animate(100, 750, 1740, 'context');   // e.g., 100% Confidential
  }, [hasAnimated]);

  return (
    <footer ref={footerRef} className="hero-stats-footer">
      <div className="stat-col anim" style={{ animationDelay: '0.5s' }}>
        <div className="stat-icon">&lt;</div>
        <div className="stat-val"><span className="counter">{counts.time.toFixed(0)}</span><span className="suffix">+</span></div>
        <div className="stat-label">Citizens Assisted</div>
      </div>
      <div className="stat-col anim" style={{ animationDelay: '0.58s' }}>
        <div className="stat-icon">%</div>
        <div className="stat-val"><span className="counter">{counts.uptime.toFixed(0)}</span><span className="suffix">+</span></div>
        <div className="stat-label">Documents Analyzed</div>
      </div>
      <div className="stat-col anim" style={{ animationDelay: '0.66s' }}>
        <div className="stat-icon">*</div>
        <div className="stat-val"><span className="counter">{counts.runtime.toFixed(0)}</span><span className="suffix">/7</span></div>
        <div className="stat-label">Availability</div>
      </div>
      <div className="stat-col anim" style={{ animationDelay: '0.74s' }}>
        <div className="stat-icon">#</div>
        <div className="stat-val"><span className="counter">{counts.context.toFixed(0)}</span><span className="suffix">%</span></div>
        <div className="stat-label">Confidentiality</div>
      </div>
    </footer>
  );
};
```
