// src/components/grove/Sapling.jsx — a plant that grows as a project gets feedback. Owned by Person 4.
//
// Usage:  <Sapling feedbackCount={4} size="sm" />   ("sm" for cards, "lg" for the project page)
import './grove.css';

const STAGES = [
  { min: 10, key: 'bloom',   label: 'In full bloom' },
  { min: 6,  key: 'tree',    label: 'Thriving' },
  { min: 3,  key: 'sapling', label: 'Growing' },
  { min: 1,  key: 'sprout',  label: 'Sprouting' },
  { min: 0,  key: 'seed',    label: 'Waiting to be planted' },
];

function getStage(feedbackCount = 0) {
  return STAGES.find((s) => feedbackCount >= s.min);
}

const LEAF = '#4f8a5b';
const LEAF_LIGHT = '#7fb069';
const TRUNK = '#6b4f3a';
const BLOSSOM = '#d9708e';

function Leaf({ x, y, angle, size = 1, color = LEAF }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={9 * size}
      ry={4.5 * size}
      fill={color}
      transform={`rotate(${angle} ${x} ${y})`}
    />
  );
}

function Plant({ stage }) {
  switch (stage) {
    case 'seed':
      return (
        <g>
          <ellipse cx="60" cy="96" rx="7" ry="5" fill={TRUNK} />
          <path d="M57 93 q3 -3 6 0" stroke="#8a6a4f" strokeWidth="1.5" fill="none" />
        </g>
      );
    case 'sprout':
      return (
        <g>
          <path d="M60 100 C60 90 60 84 61 76" stroke={LEAF} strokeWidth="3" fill="none" strokeLinecap="round" />
          <Leaf x={53} y={78} angle={-25} />
          <Leaf x={68} y={76} angle={25} color={LEAF_LIGHT} />
        </g>
      );
    case 'sapling':
      return (
        <g>
          <path d="M60 100 C59 85 61 70 60 52" stroke={TRUNK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <Leaf x={51} y={82} angle={-30} />
          <Leaf x={69} y={76} angle={30} color={LEAF_LIGHT} />
          <Leaf x={51} y={64} angle={-35} color={LEAF_LIGHT} size={1.1} />
          <Leaf x={69} y={58} angle={35} size={1.1} />
          <Leaf x={60} y={49} angle={-90} size={0.9} color={LEAF_LIGHT} />
        </g>
      );
    case 'tree':
      return (
        <g>
          <path d="M56 100 L58 62 L62 62 L64 100 Z" fill={TRUNK} />
          <circle cx="60" cy="48" r="22" fill={LEAF} />
          <circle cx="44" cy="58" r="14" fill={LEAF_LIGHT} />
          <circle cx="76" cy="58" r="14" fill={LEAF_LIGHT} />
          <circle cx="60" cy="34" r="13" fill={LEAF_LIGHT} />
        </g>
      );
    case 'bloom':
    default:
      return (
        <g>
          <path d="M55 100 L57 60 L63 60 L65 100 Z" fill={TRUNK} />
          <circle cx="60" cy="44" r="26" fill={LEAF} />
          <circle cx="40" cy="56" r="16" fill={LEAF_LIGHT} />
          <circle cx="80" cy="56" r="16" fill={LEAF_LIGHT} />
          <circle cx="60" cy="26" r="15" fill={LEAF_LIGHT} />
          {[[46, 40], [70, 34], [58, 52], [38, 60], [82, 58], [62, 22], [50, 26], [74, 50]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill={BLOSSOM} />
              <circle cx={x} cy={y} r="1.5" fill="#fbf0d4" />
            </g>
          ))}
          <path className="sapling__sparkle" d="M22 30 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#d9a63a" />
          <path className="sapling__sparkle" d="M98 22 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill="#d9a63a" />
          <path className="sapling__sparkle" d="M100 76 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 z" fill="#d9a63a" />
        </g>
      );
  }
}

export default function Sapling({ feedbackCount = 0, size = 'sm', showCount = false }) {
  const stage = getStage(feedbackCount);
  return (
    <div className={`sapling sapling--${size}`} title={`${feedbackCount} feedback — ${stage.label}`}>
      <svg viewBox="0 0 120 112" role="img" aria-label={`Sapling stage: ${stage.label}`}>
        {/* ground */}
        <ellipse cx="60" cy="101" rx="34" ry="7" fill="#c9b38f" opacity="0.55" />
        {/* key={stage.key} replays the grow animation whenever the stage changes */}
        <g className="sapling__plant" key={stage.key}>
          <Plant stage={stage.key} />
        </g>
      </svg>
      <span className="sapling__label">{stage.label}</span>
      {showCount && (
        <span className="sapling__count">
          {feedbackCount} {feedbackCount === 1 ? 'test' : 'tests'} received
        </span>
      )}
    </div>
  );
}
