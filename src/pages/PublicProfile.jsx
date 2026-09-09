import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import { api } from "../services/api";
import { Reveal } from "../components/ui/Reveal";
import "./PublicProfile.css";
import { ArrowLeft } from "@phosphor-icons/react";
export function PublicProfile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    useEffect(() => {
        api.get(`/account/profile/${encodeURIComponent(username)}`)
            .then(setProfile)
            .catch((e) => setError(e.message));
    }, [username]);
    if (error)
        return (
            <div className="profile-page container">
                <Link to="/" className="back-link">
                    <ArrowLeft weight="bold" />
                    <span>Back</span>
                </Link>
                <h1>Profile not found.</h1>
            </div>
        );
    if (!profile)
        return (
            <div className="profile-page container">
                <p>Loading…</p>
            </div>
        );
    return (
        <div className="profile-page container">
            <Link to="/" className="back-link">
                <ArrowLeft weight="bold" />
                <span>Back</span>
            </Link>
            <Reveal>
                <div className="profile-page__hero">
                    <div className="profile-page__avatar">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" />
                        ) : (
                            profile.username.slice(0, 1).toUpperCase()
                        )}
                    </div>
                    <div>
                        <span>DEADSMILE COMMUNITY</span>
                        <h1>{profile.username}</h1>
                        <p>{profile.bio || "No bio yet."}</p>
                    </div>
                </div>
            </Reveal>
            <section className="profile-page__meta">
                <span>
                    Member since{" "}
                    {new Date(profile.createdAt).toLocaleDateString(
                        'en-US',
                                  {
                                    day: '2-digit',
                                    month:
                                      'short',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                  }
                    )}
                </span>
                {profile.location && <span>{profile.location}</span>}
                {profile.websiteUrl && (
                    <a
                        href={profile.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Website <ArrowUpRight weight="bold" />
                    </a>
                )}
            </section>
        </div>
    );
}
