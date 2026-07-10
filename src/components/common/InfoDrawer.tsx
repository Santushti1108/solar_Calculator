import { useState } from "react";
import  "../../App";


interface InfoSection {
  heading: string;
  content: string[];
}

interface InfoDrawerProps {
  title: string;
  sections: InfoSection[];
}

export default function InfoDrawer({
  title,
  sections,
}: InfoDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Info Button */}
      <button
        className="info-button"
        onClick={() => setOpen(true)}
      >
        ⓘ
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="drawer-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`drawer ${open ? "open" : ""}`}>

        <div className="drawer-header">

         <h2>{title}</h2>

          <button
            className="close-btn"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

        </div>

        <div className="drawer-body">

        {sections.map((section) => (
            <div key={section.heading} className="info-section">
                <h3>{section.heading}</h3>

                <ul>
                {section.content.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
                </ul>
            </div>
        ))}

        </div>

      </div>
    </>
  );
}