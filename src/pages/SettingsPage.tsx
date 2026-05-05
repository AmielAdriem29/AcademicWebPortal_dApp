import { useState } from "react";
import { useWalletList, useWallet } from "@meshsdk/react";
import styles from "./SettingsPage.module.css";

// ---------------------------------------------------------------------------
// Wallet Modal
// ---------------------------------------------------------------------------
function WalletModal({ onClose }: { onClose: () => void }) {
    const wallets = useWalletList();
    const { connect, connecting, connected, name: connectedName } = useWallet();

    const handleConnect = async (walletId: string) => {
        try {
            await connect(walletId);
            onClose();
        } catch (err) {
            console.error("Wallet connection failed:", err);
        }
    };

    return (
        // Backdrop
        <div style={backdropStyle} onClick={onClose}>
            {/* Modal panel – stop clicks from bubbling to the backdrop */}
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={modalHeaderStyle}>
                    <span style={modalTitleStyle}>Connect a Wallet</span>
                    <button style={closeBtnStyle} onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {wallets.length === 0 ? (
                    <p style={emptyStyle}>
                        No Cardano wallets detected.{" "}
                        <a
                            href="https://namiwallet.io/"
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#6c63ff" }}
                        >
                            Install Nami
                        </a>{" "}
                        or another CIP-30 wallet to continue.
                    </p>
                ) : (
                    <ul style={listStyle}>
                        {wallets.map((wallet) => (
                            <li key={wallet.id}>
                                <button
                                    style={{
                                        ...walletItemStyle,
                                        ...(connected && connectedName === wallet.name
                                            ? activeWalletStyle
                                            : {}),
                                    }}
                                    onClick={() => handleConnect(wallet.id)}
                                    disabled={connecting}
                                >
                                    <img
                                        src={wallet.icon}
                                        alt={wallet.name}
                                        style={walletIconStyle}
                                    />
                                    <span style={walletNameStyle}>{wallet.name}</span>
                                    {connected && connectedName === wallet.name && (
                                        <span style={connectedBadgeStyle}>Connected</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {connecting && (
                    <p style={connectingStyle}>Connecting… please approve in your wallet.</p>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Setting Card
// ---------------------------------------------------------------------------
interface SettingCardProps {
    title: string;
    description: string;
    actionLabel: string;
    onClick?: () => void;
}

function SettingCard({ title, description, actionLabel, onClick }: SettingCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.cardDesc}>{description}</div>
            <button className={styles.btn} onClick={onClick}>
                {actionLabel}
            </button>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Settings Page
// ---------------------------------------------------------------------------
export function SettingsPage() {
    const [walletModalOpen, setWalletModalOpen] = useState(false);

    return (
        <div className={styles.page}>
            <div className={styles.topbar}>
                <h2 className={styles.heading}>Settings</h2>
            </div>

            <SettingCard
                title="Identity verification"
                description="Connect a government ID to raise your trust score."
                actionLabel="Connect ID →"
            />

            <SettingCard
                title="Wallet connection"
                description="Link a Web3 wallet to sign transactions directly."
                actionLabel="Connect wallet →"
                onClick={() => setWalletModalOpen(true)}
            />

            {walletModalOpen && (
                <WalletModal onClose={() => setWalletModalOpen(false)} />
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Inline styles for the modal (no extra CSS file needed)
// ---------------------------------------------------------------------------
const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "28px 24px",
    width: "min(420px, 90vw)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
};

const modalHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
};

const modalTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111",
};

const closeBtnStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#666",
    lineHeight: 1,
    padding: "4px",
};

const listStyle: React.CSSProperties = {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
};

const walletItemStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 16px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fafafa",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
};

const activeWalletStyle: React.CSSProperties = {
    borderColor: "#6c63ff",
    background: "#f3f2ff",
};

const walletIconStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    objectFit: "contain",
    borderRadius: "6px",
};

const walletNameStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
    color: "#222",
    flex: 1,
    textAlign: "left",
};

const connectedBadgeStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#6c63ff",
    fontWeight: 600,
    background: "#ede9fe",
    borderRadius: "20px",
    padding: "2px 10px",
};

const emptyStyle: React.CSSProperties = {
    color: "#555",
    fontSize: "14px",
    textAlign: "center",
    lineHeight: 1.6,
};

const connectingStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "13px",
    color: "#888",
    margin: 0,
};