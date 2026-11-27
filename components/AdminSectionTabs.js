"use client";

import { useState } from "react";

export default function AdminSectionTabs({ sections, initialSection }) {
  const [activeSection, setActiveSection] = useState(initialSection || sections[0]?.id);

  return (
    <div className="admin-section-tabs-workspace">
      <nav className="admin-home-media-tabs admin-workspace-tabs" aria-label="Page content sections">
        {sections.map((section) => (
          <button
            type="button"
            key={section.id}
            className={activeSection === section.id ? "is-active" : ""}
            aria-pressed={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </nav>
      {sections.map((section) => (
        <div key={section.id} hidden={activeSection !== section.id}>
          {section.content}
        </div>
      ))}
    </div>
  );
}
