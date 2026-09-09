import { Link } from "react-router-dom";
import { ArrowUpRight, Download, File, Image, Archive, HardDrives } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../hooks/useContent";
import { Reveal } from "../components/ui/Reveal";
import { ArrowLeft } from "@phosphor-icons/react";
import "./Downloads.css";
const CATEGORY_ICONS = {
  'PRESS KIT': Archive,
  'WALLPAPERS': Image,
  'LAUNCHER': HardDrives,
  'PATCH': Download,
  'SOUNDTRACK': File,
};

const CATEGORY_COLORS = {
  'PRESS KIT': '#e8c547',
  'WALLPAPERS': '#6fc3df',
  'LAUNCHER': '#7bcfa6',
  'PATCH': '#f7a072',
  'SOUNDTRACK': '#b39ddb',
};

export function Downloads() {
  const { t } = useLanguage();
  const data = useContent("/downloads");
  const itemsWithMeta = data.data.map((item) => {
    const category = item.category?.toUpperCase() || '';
    const Icon = CATEGORY_ICONS[category] || File;
    const color = CATEGORY_COLORS[category] || '#888';
    return { ...item, Icon, color };
  });

  return (
    <div className="downloads-page container">
      <Link to="/" className="back-link">
        <ArrowLeft weight="bold" />
        <span>Back</span>
      </Link>

      <Reveal>
        <div className="downloads-header">
          <h1>Downloads</h1>
          <p className="downloads-page__intro">
            Official files, launchers, patches, and media from DEADSMILE.
            Everything you need in one place.
          </p>
        </div>
      </Reveal>

      <div className="downloads-grid">
        {data.status === "loading" && (
          <div className="downloads-loading">
            <div className="spinner" />
            <p>Loading files…</p>
          </div>
        )}

        {data.status === "error" && (
          <div className="downloads-error">
            <p>{data.error}</p>
          </div>
        )}

        {data.status === "success" &&
          itemsWithMeta.map((item, index) => {
            const Icon = item.Icon;
            const color = item.color;

            return (
              <Reveal key={item.id} delay={index * 80}>
                <div className="download-card">
                  <div className="download-card__icon" style={{ backgroundColor: `${color}20` }}>
                    <Icon weight="bold" size={28} color={color} />
                  </div>

                  <div className="download-card__content">
                    <span className="download-card__category" style={{ color }}>
                      {item.category || 'FILE'}
                    </span>
                    <h2 className="download-card__title">{item.title}</h2>

                    <div className="download-card__meta">
                      {item.file_type && (
                        <span className="download-card__tag">
                          <File size={14} weight="bold" />
                          {item.file_type}
                        </span>
                      )}
                      {item.resolution && (
                        <span className="download-card__tag">
                          <Image size={14} weight="bold" />
                          {item.resolution}
                        </span>
                      )}
                      {item.file_size && (
                        <span className="download-card__tag">
                          <HardDrives size={14} weight="bold" />
                          {item.file_size}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="download-card__action">
                    {item.file_url ? (
                      <a
                        className="btn btn--primary"
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download weight="bold" size={18} />
                        <span>Download</span>
                        <ArrowUpRight weight="bold" size={16} />
                      </a>
                    ) : (
                      <button className="btn btn--secondary" disabled>
                        Coming soon
                      </button>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
      </div>
    </div>
  );
}