import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../hooks/useContent";
import { Reveal } from "../components/ui/Reveal";
import { ArrowLeft } from "@phosphor-icons/react";
import "./Downloads.css";
export function Downloads() {
    const { t } = useLanguage();
    const data = useContent("/downloads");
    return (
        <div className="downloads-page container">
            <Link to="/" className="back-link">
               <ArrowLeft weight="bold" />
                <span>Back</span>
            </Link>
            <Reveal>
                <h1>{t("downloads.title")}</h1>
                <p className="downloads-page__intro">{t("downloads.intro")}</p>
            </Reveal>
            <div className="downloads-list">
                {data.status === "loading" && <p>Loading…</p>}
                {data.status === "error" && <p>{data.error}</p>}
                {data.data.map((item) => (
                    <section className="download-card" key={item.id}>
                        <div>
                            <span>{item.category}</span>
                            <h2>{item.title}</h2>
                            <p>
                                {item.file_type} · {item.resolution}
                            </p>
                        </div>
                        {item.file_url ? (
                            <a
                                className="btn btn--primary"
                                href={item.file_url}
                            >
                                Download <ArrowUpRight weight="bold" />
                            </a>
                        ) : (
                            <button className="btn btn--secondary" disabled>
                                {t("downloads.unavailable")}
                            </button>
                        )}
                    </section>
                ))}
            </div>
        </div>
    );
}
