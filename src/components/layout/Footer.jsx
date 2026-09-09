import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
    InstagramLogo,
    GameController,
    GithubLogoIcon,
    LinkSimple,
    ArrowRight,
    Heart,
} from "@phosphor-icons/react";
import "./Footer.css";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="site-footer">

            <div className="container">
                <div className="site-footer__top">
                    <img
                        src="/assets/branding/deadsmile-mark.svg"
                        alt=""
                        aria-hidden="true"
                        style={{ width: 110, height: 110, opacity: 0.3, marginBottom: 12 }}
                    />
                    <p className="site-footer__tagline">
                        Independent studio making unforgettable games.<br />
                        Built with passion, shipped with intention.
                    </p>
                    <Link to="/games" className="site-footer__cta">
                        {t("nav.games")} <ArrowRight weight="bold" size={13} />
                    </Link>
                </div>

                <div className="site-footer__divider" />

                <div className="site-footer__links-row">
                    <div>
                        <span className="site-footer__col-label">Follow Deadsmile</span>
                        <div className="site-footer__social-icons">
                            <a href="https://instagram.com/teamdeadsmile" target="_blank" rel="noreferrer" aria-label="Instagram">
                                <InstagramLogo size={18} weight="bold" />
                            </a>
                            <a href="https://deadsml.itch.io" target="_blank" rel="noreferrer" aria-label="itch.io">
                                <GameController size={18} weight="bold" />
                            </a>
                            <a href="https://linktr.ee/teamdeadsmile" target="_blank" rel="noreferrer" aria-label="Linktree">
                                <LinkSimple size={18} weight="bold" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <span className="site-footer__col-label">Explore</span>
                        <div className="site-footer__col-links">
                            <Link to="/games">{t("nav.games")}</Link>
                            <Link to="/news">{t("nav.news")}</Link>
                            <Link to="/videos">{t("nav.videos")}</Link>
                            <Link to="/studio">{t("nav.studio")}</Link>
                        </div>
                    </div>

                    <div>
                        <span className="site-footer__col-label">Support</span>
                        <div className="site-footer__col-links">
                            <Link to="/support">{t("nav.support")}</Link>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Use</Link>
                        </div>
                    </div>
                </div>

                <div className="site-footer__bottom">
                    <div className="site-footer__bottom-left">
                        Made with<Heart size={14} weight="bold" /> by the{" "}
                        <a href="https://github.com/teamdeadsmile" target="_blank" rel="noreferrer">
                            Deadsmile Team
                        </a>
                    </div>
                    <div className="site-footer__bottom-right">
                        <span>© {new Date().getFullYear()} Deadsmile Games</span>
                        <a
                            href="https://github.com/teamdeadsmile/www"
                            className="site-footer__gh"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                        >
                            <GithubLogoIcon weight="bold" size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}