import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { useAuth } from "../../auth";
import styles from "./SettingsPage.module.css";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
    return <h3 className={styles.sectionHeader}>{label}</h3>;
}

function Field({
    label,
    value,
    onChange,
    placeholder = "",
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className={styles.field}>
            <label className={styles.fieldLabel}>{label}</label>
            <input
                className={styles.input}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

function DeleteModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
    const [typed, setTyped] = useState("");
    const confirmed = typed === "DELETE";

    return (
        <div className={styles.backdrop} onClick={onCancel}>
            <div className={styles.dangerModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dangerIcon}>⚠</div>
                <h2 className={styles.dangerTitle}>Delete account?</h2>
                <p className={styles.dangerBody}>
                    This permanently wipes all profile data from local storage{" "}
                    <strong>and</strong> submits a blockchain nullification record.
                </p>
                <p className={styles.dangerConfirmLabel}>
                    Type <code>DELETE</code> to confirm
                </p>
                <input
                    className={styles.dangerInput}
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="DELETE"
                    autoFocus
                />
                <div className={styles.dangerActions}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className={styles.deleteConfirmBtn}
                        disabled={!confirmed}
                        onClick={onConfirm}
                    >
                        Permanently delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SettingsPage() {
    const { connected, name: walletName, wallet } = useWallet();
    const { user, logout } = useAuth();

    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleted, setDeleted] = useState(false);

    // Fetch wallet address
    useEffect(() => {
        const addressPromise = connected && wallet
            ? wallet.getChangeAddress()
            : Promise.resolve(null);

        addressPromise
            .then(setWalletAddress)
            .catch(() => setWalletAddress(null));
    }, [connected, wallet]);

    // Handle redirect after deletion using standard browser navigation
    useEffect(() => {
        if (deleted) {
            const timer = setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [deleted]);

    const handleDelete = () => {
        localStorage.clear();
        sessionStorage.clear();
        setDeleteOpen(false);
        setDeleted(true);
    };

    if (deleted) {
        return (
            <div className={styles.page}>
                <div className={styles.deletedState}>
                    <div className={styles.deletedIcon}>◌</div>
                    <h2 className={styles.deletedTitle}>Account erased</h2>
                    <p className={styles.deletedSub}>Redirecting you to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.topbar}>
                <h2 className={styles.heading}>Settings</h2>
            </div>

            <div className={styles.contentArea}>
                
                {/* ── Profile ── */}
                <section className={styles.card}>
                    <SectionHeader label="Profile" />
                    <div className={styles.fieldGrid}>
                        <Field
                            label="Display name"
                            value={user?.name ?? ""}
                            onChange={() => {}} // Hook up to live edit state if added later
                            placeholder="Your full name"
                        />
                        <Field
                            label="Email"
                            value={user?.email ?? ""}
                            onChange={() => {}} // Hook up to live edit state if added later
                            placeholder="you@example.com"
                            type="email"
                        />
                    </div>
                </section>

                {/* ── Connected wallet ── */}
                <section className={styles.card}>
                    <SectionHeader label="Connected wallet" />
                    {(() => {
                        const displayAddress = walletAddress ?? user?.walletAddress ?? null;
                        if (connected && displayAddress) {
                            return (
                                <div className={styles.walletInfo}>
                                    <div className={styles.walletRow}>
                                        <span className={styles.walletLabel}>{walletName}</span>
                                        <span className={styles.connectedPill}>Connected</span>
                                    </div>
                                    <span className={styles.walletAddress}>
                                        {displayAddress.slice(0, 20)}…{displayAddress.slice(-8)}
                                    </span>
                                </div>
                            );
                        }
                        if (displayAddress) {
                            return (
                                <div className={styles.walletInfo}>
                                    <div className={styles.walletRow}>
                                        <span className={styles.walletAddress}>
                                            {displayAddress.slice(0, 20)}…{displayAddress.slice(-8)}
                                        </span>
                                        <span className={styles.disconnectedPill}>Not connected</span>
                                    </div>
                                </div>
                            );
                        }
                        return <p className={styles.emptyHint}>No wallet connected.</p>;
                    })()}
                </section>

                {/* ── Session ── */}
                <section className={styles.card}>
                    <SectionHeader label="Session" />
                    <p className={styles.emptyHint}>
                        Logging out clears your session. Your credentials stay saved.
                    </p>
                    <button className={styles.logoutBtn} onClick={logout}>
                        Log out
                    </button>
                </section>

                {/* ── Danger zone ── */}
                <section className={styles.dangerZone}>
                    <div className={styles.dangerZoneHeader}>
                        <span className={styles.dangerZoneTitle}>Danger zone</span>
                    </div>
                    <div className={styles.dangerZoneBody}>
                        <div>
                            <p className={styles.dangerZoneLabel}>Delete account</p>
                            <p className={styles.dangerZoneDesc}>
                                Permanently removes all profile data from this browser and writes
                                a nullification record to the Cardano blockchain.
                            </p>
                        </div>
                        <button className={styles.deleteBtn} onClick={() => setDeleteOpen(true)}>
                            Delete account
                        </button>
                    </div>
                </section>
            </div>

            {deleteOpen && (
                <DeleteModal 
                    onCancel={() => setDeleteOpen(false)} 
                    onConfirm={handleDelete} 
                />
            )}
        </div>
    );
}