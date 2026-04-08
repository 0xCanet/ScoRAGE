import React from 'react';

type SignalListProps = {
  items: string[];
  type: 'critical' | 'warning' | 'positive' | 'neutral';
  emptyMessage: string;
};

export function SignalList({ items, type, emptyMessage }: SignalListProps) {
  if (items.length === 0) {
    return (
      <ul className={`signal-list signal-list--${type}`}>
        <li className="signal-list__empty">{emptyMessage}</li>
      </ul>
    );
  }

  const getIcon = () => {
    switch (type) {
      case 'critical':
        return <span className="signal-list__icon signal-list__icon--critical">✕</span>;
      case 'warning':
        return <span className="signal-list__icon signal-list__icon--warning">⚠</span>;
      case 'positive':
        return <span className="signal-list__icon signal-list__icon--positive">✓</span>;
      case 'neutral':
        return <span className="signal-list__icon">•</span>;
    }
  };

  return (
    <ul className={`signal-list signal-list--${type}`}>
      {items.map((item, index) => (
        <li key={index} className="signal-list__item">
          {getIcon()}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
