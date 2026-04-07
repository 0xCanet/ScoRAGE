'use client';

import { useState } from 'react';

import { firesItems } from '@/components/marketing/data';

export function FiresFramework() {
  const [activeKey, setActiveKey] = useState(firesItems[0].key);
  const activeItem = firesItems.find((item) => item.key === activeKey) ?? firesItems[0];

  return (
    <div className="fires-layout">
      <div className="fires-tabs" role="tablist" aria-label="Dimensions F.I.R.E.S.">
        {firesItems.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={activeKey === item.key}
            className={`fires-tab${activeKey === item.key ? ' is-active' : ''}`}
            onClick={() => setActiveKey(item.key)}
          >
            <span className="fires-tab__letter">{item.letter}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      <div className="card fires-panel" role="tabpanel" aria-live="polite">
        <div className="label-row">
          {firesItems.map((item) => (
            <span key={item.key} className={`fires-label${activeKey === item.key ? ' is-active' : ''}`}>
              {item.letter}
            </span>
          ))}
        </div>
        <h3>{activeItem.name}</h3>
        <p>{activeItem.description}</p>
        <div className="criteria-grid">
          {activeItem.criteria.map((criterion) => (
            <span key={criterion} className="criteria-item">
              ◆ {criterion}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
