import { Link, useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useContent } from "../hooks/useContent";
import { useAuth } from "../hooks/useAuth";
import { Reveal } from "../components/ui/Reveal";
import { ArrowLeft, ArrowUpRight, Play, Trash } from "@phosphor-icons/react";
import { api } from "../services/api";
import "./MediaPages.css";

function toEmbedUrl(url) {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be"))
            return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
        if (u.hostname.includes("youtube.com")) {
            const id = u.searchParams.get("v");
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
        return url;
    } catch {
        return url;
    }
}

export function Videos() {
    const { t } = useLanguage();
    const { id } = useParams();
    const { user, refresh } = useAuth();
    const navigate = useNavigate();
    const data = useContent("/videos", { limit: 24 });
    const detail = useContent(id ? `/videos/${id}` : null, {});
    const isAdmin = user?.role === "admin";
    async function remove(videoId, fromDetail = false) {
        if (!window.confirm("Delete this video permanently?")) return;
        try {
            try {
                await api.delete(`/admin/video/${videoId}`);
            } catch (err) {
                if (err?.status === 401) {
                    await refresh();
                    await api.delete(`/admin/video/${videoId}`);
                } else throw err;
            }
            fromDetail ? navigate("/videos", { replace: true }) : data.retry();
        } catch (err) {
            window.alert(err.message || "Unable to delete video.");
        }
    }
    if (id) {
        if (detail.status === "loading")
            return (
                <div className="media-detail container">
                    <p>Loading…</p>
                </div>
            );
        if (detail.status === "error")
            return (
                <div className="media-detail container">
                    <Link to="/videos" className="back-link">
                        <ArrowLeft weight="bold" /> <span>Back</span>
                    </Link>
                    <h1>Video not found.</h1>
                </div>
            );
        const v = detail.data;
        return (
            <div className="media-detail container">
                <Link to="/videos" className="back-link">
                    <ArrowLeft weight="bold" /> <span>Back</span>
                </Link>
                <Reveal>
                    <header className="media-detail__header">
                        <div className="media-detail__eyebrow">
                            <span>
                                {v.duration_seconds
                                    ? `${Math.floor(v.duration_seconds / 60)}:${String(v.duration_seconds % 60).padStart(2, "0")}`
                                    : "WATCH"}
                            </span>
                        </div>
                        <h1>{v.title}</h1>
                    </header>
                    <div className="media-detail__player">
                        {v.video_url ? (
                            <iframe
                                src={toEmbedUrl(v.video_url)}
                                title={v.title}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="media-detail__empty">
                                <Play weight="fill" size={28} />
                                <span>No video source available.</span>
                            </div>
                        )}
                    </div>
                    {isAdmin && (
                        <button
                            className="media-detail__delete"
                            type="button"
                            onClick={() => remove(v.id, true)}
                        >
                            <Trash weight="bold" /> Delete video
                        </button>
                    )}
                </Reveal>
            </div>
        );
    }
    return (
        <div className="media-page container">
            <Link to="/" className="back-link">
                <ArrowLeft weight="bold" /> <span>Back</span>
            </Link>
            <Reveal>
                <div className="media-page__heading">
                    <div>
                        <h1>{t("nav.videos")}</h1>
                    </div>
                    <p className="media-page__intro">{t("media.videoIntro")}</p>
                </div>
            </Reveal>
            <div className="media-page__grid">
                {data.status === "loading" && <p>Loading…</p>}
                {data.status === "error" && <p>{data.error}</p>}
                {data.data.map((v, i) => (
                    <Reveal key={v.id} delay={i * 60}>
                        <article className="media-tile">
                            <Link
                                to={`/videos/${v.id}`}
                                className="media-tile__visual"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                {v.thumbnail && (
                                    <img
                                        src={v.thumbnail}
                                        alt=""
                                        loading="lazy"
                                    />
                                )}
                                <span>
                                    <Play weight="fill" size={20} />
                                </span>
                            </Link>
                            <div className="media-tile__meta">
                                <small>{v.category}</small>
                                <h2>{v.title}</h2>
                                <div className="media-tile__actions">
                                    <Link to={`/videos/${v.id}`}>
                                        {t("media.play")}{" "}
                                        <ArrowUpRight weight="bold" />
                                    </Link>
                                    {isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => remove(v.id)}
                                            aria-label={`Delete ${v.title}`}
                                        >
                                            <Trash weight="bold" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    </Reveal>
                ))}
            </div>
        </div>
    );
}
