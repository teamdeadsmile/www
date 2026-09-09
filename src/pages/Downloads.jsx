import { Link } from "react-router-dom";
import { Download, File, Image, Archive, HardDrives } from "@phosphor-icons/react";
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

export function Downloads() {
  const { t } = useLanguage();
  const data = useContent("/downloads");
  const itemsWithMeta = (data.data || []).map((item) => {
    const category = item.category?.toUpperCase() || '';
    const Icon = CATEGORY_ICONS[category] || File;
    return { ...item, Icon };
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
            Official files, launchers, patches, and media.
            Everything you need in one place.
          </p>
        </div>
      </Reveal>

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

      {data.status === "success" && (
        <Reveal delay={60}>
          <div className="download-list">
            {itemsWithMeta.map((item) => {
              const Icon = item.Icon;
              return (
                <div className="download-row" key={item.id}>
                  <div className="download-row__icon">
                    <Icon weight="bold" size={22} />
                  </div>

                  <div className="download-row__info">
                    <span className="download-row__category">
                      {item.category || "FILE"}
                    </span>
                    <h2 className="download-row__title">{item.title}</h2>
                    <div className="download-row__meta">
                      {item.file_type && (
                        <span className="download-row__tag">
                          {item.file_type}
                        </span>
                      )}
                      {item.resolution && (
                        <span className="download-row__tag">
                          {item.resolution}
                        </span>
                      )}
                      {item.file_size && (
                        <span className="download-row__tag">
                          {item.file_size}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="download-row__action">
                    {item.file_url ? (
                      <a
                        className="download-row__btn"
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download weight="bold" size={15} />
                        <span>Download</span>
                      </a>
                    ) : (
                      <button
                        className="download-row__btn download-row__btn--disabled"
                        disabled
                      >
                        Soon
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}