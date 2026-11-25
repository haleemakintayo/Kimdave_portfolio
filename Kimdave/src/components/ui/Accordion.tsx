import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQItem } from '../../data/types';

interface AccordionProps {
  items: FAQItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="faq-list" role="region" aria-label="Frequently Asked Questions">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const contentId = `faq-content-${item.id}`;
        const buttonId = `faq-btn-${item.id}`;

        return (
          <div key={item.id} className={`faq-item ${isOpen ? 'open' : ''}`}>
            <button
              id={buttonId}
              type="button"
              className="faq-button"
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={contentId}
            >
              <span>{item.question}</span>
              <ChevronDown size={20} className="faq-icon" aria-hidden="true" />
            </button>
            <div
              id={contentId}
              role="region"
              aria-labelledby={buttonId}
              className="faq-content"
              hidden={!isOpen}
            >
              <p className="faq-answer">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
