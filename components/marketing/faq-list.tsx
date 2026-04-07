'use client';

import { useState } from 'react';

import { faqs } from '@/components/marketing/data';

export function FAQList() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <article key={faq.question} className={`faq-item${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="faq-item__question"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span>{faq.question}</span>
              <span className="faq-item__toggle">{isOpen ? '−' : '+'}</span>
            </button>
            <div className="faq-item__answer">{faq.answer}</div>
          </article>
        );
      })}
    </div>
  );
}
