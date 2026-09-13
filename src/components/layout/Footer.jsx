import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import {
    InstagramLogo,
    GameController,
    GithubLogo,
    LinkSimple,
    ArrowUpRight,
    Heart,
    ShieldCheck,
    LockKey,
} from "@phosphor-icons/react";
import "./Footer.css";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="site-footer__top">
                    <div className="site-footer__identity">
                        <img
                            src="/assets/branding/deadsmile-mark.svg"
                            alt="Deadsmile Games"
                            className="site-footer__logo"
                        />

                        <div>

                            <p className="site-footer__tagline">
                                Independent games, worlds and stories
                                built without compromise.
                            </p>
                        </div>
                    </div>

                    <Link to="/games" className="btn btn--primary btn--large">
                        <span>{t("nav.games")}</span>
                        <ArrowUpRight weight="bold" size={17} />
                    </Link>
                </div>

                <div className="site-footer__divider" />

                <div className="site-footer__links-row">

                    <div className="site-footer__social-column">
                        <span className="site-footer__col-label">
                            Follow
                        </span>

                        <div className="site-footer__social-icons">
                            <a
                                href="https://instagram.com/deadsmilegames"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                            >
                                <InstagramLogo size={19} weight="regular" />
                            </a>

                            <a
                                href="https://deadsml.itch.io"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="itch.io"
                            >
                                <GameController size={19} weight="regular" />
                            </a>

                            <a
                                href="https://linktr.ee/deadsmilegames"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Linktree"
                            >
                                <LinkSimple size={19} weight="regular" />
                            </a>

                            <a
                                href="https://github.com/deadsmilegames"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                            >
                                <GithubLogo size={19} weight="regular" />
                            </a>
                        </div>
                    </div>

                    <nav aria-label="Explore">
                        <span className="site-footer__col-label">
                            Explore
                        </span>

                        <div className="site-footer__col-links">
                            <Link to="/games">{t("nav.games")}</Link>
                            <Link to="/news">{t("nav.news")}</Link>
                            <Link to="/videos">{t("nav.videos")}</Link>
                            <Link to="/studio">{t("nav.studio")}</Link>
                        </div>
                    </nav>

                    <nav aria-label="Support">
                        <span className="site-footer__col-label">
                            Support
                        </span>

                        <div className="site-footer__col-links">
                            <Link to="/support">{t("nav.support")}</Link>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Use</Link>
                        </div>
                    </nav>
                </div>

                <div className="site-footer__security">
                    <div className="site-footer__security-item">
                        <span className="site-footer__security-icon">
                            <ShieldCheck size={15} weight="bold" />
                        </span>
                        <span>
                            Protected by reCAPTCHA
                        </span>
                    </div>

                    <span className="site-footer__security-links">
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy
                        </a>

                        <span>·</span>

                        <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms
                        </a>
                    </span>
                </div>

                <div className="site-footer__bottom">
                    <div className="site-footer__bottom-left">
                        <span>
                            © {new Date().getFullYear()} Deadsmile Games
                        </span>

                        <span className="site-footer__dot">
                            •
                        </span>

                        <span>
                            Made with
                            <Heart
                                className="site-footer__heart"
                                size={13}
                                weight="bold"
                                aria-hidden="true"
                            />
                            by{" "}
                            <a
                                href="https://github.com/deadsmilegames"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Deadsmile Team
                            </a>
                        </span>
                    </div>

                    <a
                        href="https://github.com/deadsmilegames/www"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="site-footer__source"
                    >
                        <GithubLogo size={15} weight="regular" />
                        <span>Source</span>
                        <ArrowUpRight size={13} weight="bold" />
                    </a>
                </div>

            </div>
        </footer>
    );
}