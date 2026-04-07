'use client';

import React, { useState } from 'react';

type DisclosureProps = {
  title: string;
  children: React.ReactNode;
};

export function Disclosure({ title, children }: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="disclosure">
      <button
        type="button"
        className="disclosure__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="disclosure__icon">{isOpen ? '▾' : '▸'}</span>
        {title}
      </button>
      {isOpen && (
        <div className="disclosure__content">
          {children}
        </div>
      )}
    </div>
  );
}
