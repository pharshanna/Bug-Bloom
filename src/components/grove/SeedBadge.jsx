// src/components/grove/SeedBadge.jsx — shows how many Seeds a user has. Owned by Person 4.
//
// Usage:  <SeedBadge seeds={5} />
import { useEffect, useRef, useState } from 'react';
import './grove.css';

export default function SeedBadge({ seeds = 0 }) {
  const [pop, setPop] = useState(false);
  const previous = useRef(seeds);

  // little "pop" animation whenever the number changes
  useEffect(() => {
    if (previous.current !== seeds) {
      previous.current = seeds;
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
  }, [seeds]);

  return (
    <span
      className={`seed-badge ${pop ? 'seed-badge--pop' : ''}`}
      title="Seeds: earn them by testing projects, spend them to plant your own"
    >
      <svg className="seed-badge__icon" viewBox="0 0 24 24" aria-hidden="true">
        <ellipse cx="12" cy="14" rx="6.5" ry="8" fill="#a5743f" />
        <path d="M12 6 C12 3 14 2 16 2 C16 4 14.5 6 12 6 Z" fill="#4f8a5b" />
        <ellipse cx="10" cy="12" rx="1.8" ry="3" fill="#c9965e" />
      </svg>
      {seeds} {seeds === 1 ? 'Seed' : 'Seeds'}
    </span>
  );
}
