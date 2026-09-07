import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";
import "./Account.css";
export function Account() {
    const { user, logout, refresh } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: user?.username || "",
        email: user?.email || "",
        bio: user?.bio || "",
        websiteUrl: user?.websiteUrl || "",
        location: user?.location || "",
        avatarUrl: user?.avatarUrl || null,
    });
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    useEffect(
        () =>
            setForm((f) => ({
                ...f,
                username: user?.username || "",
                email: user?.email || "",
                bio: user?.bio || "",
                websiteUrl: user?.websiteUrl || "",
                location: user?.location || "",
                avatarUrl: user?.avatarUrl || null,
            })),
        [user],
    );
    if (!user) return null;
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    async function avatar(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (
            !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
            file.size > 1_500_000
        ) {
            setError("Use PNG, JPG or WEBP up to 1.5 MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            setForm((f) => ({ ...f, avatarUrl: reader.result }));
        reader.readAsDataURL(file);
    }
    async function save(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setStatus("");
        try {
            await api.patch("/account", form);
            await refresh();
            setStatus("Changes saved.");
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }
    async function del(e) {
        e.preventDefault();
        setDeleting(true);
        setError("");
        try {
            await api.delete("/account", { password });
            await logout();
            navigate("/", { replace: true });
        } catch (e) {
            setError(e.message);
        } finally {
            setDeleting(false);
        }
    }
    async function signOut() {
        await logout();
        navigate("/", { replace: true });
    }
    return (
        <div className="account-page container">
            <Link to="/" className="back-link">
                Back
            </Link>
            <Reveal>
                <div className="account-page__hero">
                    <div>
                        <h1>ACCOUNT SETTINGS</h1>
                    </div>
                    <Link
                        to={`/profile/${encodeURIComponent(user.username)}`}
                        className="account-page__avatar"
                    >
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" />
                        ) : (
                            user.username.slice(0, 1).toUpperCase()
                        )}
                    </Link>
                </div>
            </Reveal>
            <div className="account-page__layout">
                <aside>
                    <a className="is-active" href="#profile">
                        Profile
                    </a>
                    <a href="#settings">Settings</a>
                    <a href="#danger">Security</a>
                </aside>
                <div className="account-page__content">
                    <Reveal>
                        <section id="profile" className="account-panel">
                            <div className="account-panel__head">
                                <span>01</span>
                                <h2>Public profile</h2>
                            </div>
                            <form
                                className="account-profile-form"
                                onSubmit={save}
                            >
                                <div className="account-avatar-edit">
                                    <div className="account-page__avatar account-page__avatar--large">
                                        {form.avatarUrl ? (
                                            <img src={form.avatarUrl} alt="" />
                                        ) : (
                                            user.username
                                                .slice(0, 1)
                                                .toUpperCase()
                                        )}
                                    </div>
                                    <label className="avatar-upload">
                                        Change photo
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={avatar}
                                        />
                                    </label>
                                </div>
                                <label>
                                    Username
                                    <input
                                        value={form.username}
                                        onChange={set("username")}
                                        minLength={3}
                                        maxLength={24}
                                    />
                                </label>
                                <label>
                                    Bio
                                    <textarea
                                        value={form.bio}
                                        onChange={set("bio")}
                                        maxLength={500}
                                        rows="4"
                                    />
                                </label>
                                <label>
                                    Website
                                    <input
                                        value={form.websiteUrl}
                                        onChange={set("websiteUrl")}
                                        placeholder="https://…"
                                    />
                                </label>
                                <label>
                                    Location
                                    <input
                                        value={form.location}
                                        onChange={set("location")}
                                    />
                                </label>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={saving}
                                >
                                    {saving ? "Saving…" : "Save profile"}
                                </Button>
                            </form>
                        </section>
                    </Reveal>
                    <Reveal delay={80}>
                        <section id="settings" className="account-panel">
                            <div className="account-panel__head">
                                <span>02</span>
                                <h2>Settings</h2>
                            </div>
                            <form
                                className="account-profile-form"
                                onSubmit={save}
                            >
                                <label>
                                    Email
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={set("email")}
                                    />
                                </label>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    disabled={saving}
                                >
                                    {saving ? "Saving…" : "Save settings"}
                                </Button>
                            </form>
                            <div className="account-setting">
                                <div>
                                    <strong>Session</strong>
                                    <p>Sign out from this device.</p>
                                </div>
                                <Button variant="secondary" onClick={signOut}>
                                    Log out
                                </Button>
                            </div>
                        </section>
                    </Reveal>
                    <Reveal delay={140}>
                        <section
                            id="danger"
                            className="account-panel account-panel--danger"
                        >
                            <div className="account-panel__head">
                                <span>03</span>
                                <h2>Delete account</h2>
                            </div>
                            <p>
                                This permanently removes your account and public
                                profile.
                            </p>
                            <form onSubmit={del}>
                                <label>
                                    Current password
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                </label>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    disabled={deleting}
                                >
                                    {deleting ? "Deleting…" : "Delete account"}
                                </Button>
                            </form>
                        </section>
                    </Reveal>
                    {(error || status) && (
                        <p
                            className={
                                error
                                    ? "account-page__error"
                                    : "account-page__success"
                            }
                        >
                            {error || status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
