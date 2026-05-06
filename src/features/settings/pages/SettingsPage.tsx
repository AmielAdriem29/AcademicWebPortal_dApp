import { useState } from "react";
import { useWalletList, useWallet } from "@meshsdk/react";
import styles from "./SettingsPage.module.css";

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
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <span style={modalTitleStyle}>Connect a Wallet</span>
          <button style={closeBtnStyle} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {wallets.length === 0 ? (
          <p style={emptyStyle}>
            No Cardano wallets detected.{" "}
            <a href="https://namiwallet.io/" target="_blank" rel="noreferrer" style={{ color: "#378ADD" }}>
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
                    ...(connected && connectedName === wallet.name ? activeWalletStyle : {}),
                  }}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={connecting}
                >
                  <img src={wallet.icon} alt={wallet.name} style={walletIconStyle} />
                  <span style={walletNameStyle}>{wallet.name}</span>
                  {connected && connectedName === wallet.name && (
                    <span style={connectedBadgeStyle}>Connected</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {connecting && <p style={connectingStyle}>Connecting… please approve in your wallet.</p>}
      </div>
    </div>
  );
}

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
      <button className={styles.btn} onClick={onClick}>{actionLabel}</button>
    </div>
  );
}

export function SettingsPage() {
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h2 className={styles.heading}>Settings</h2>
      </div>

      <div className={styles.contentArea}>
        <SettingCard
          title="Identity verification"
          description="Connect a government ID to raise your trust score."
          actionLabel="Connect ID →"
        />
        <SettingCard
          title="Wallet connection"
          description="Link a Cardano wallet to sign transactions directly."
          actionLabel="Connect wallet →"
          onClick={() => setWalletModalOpen(true)}
        />
      </div>

      {walletModalOpen && <WalletModal onClose={() => setWalletModalOpen(false)} />}
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#0d1220",
  border: "0.5px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "36px 32px",
  width: "min(520px, 90vw)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#ffffff",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#8C959F",
  lineHeight: 1,
  padding: "4px",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const walletItemStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px 20px",
  border: "0.5px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  background: "#131929",
  cursor: "pointer",
  transition: "border-color 0.15s, background 0.15s",
};

const activeWalletStyle: React.CSSProperties = {
  borderColor: "#378ADD",
  background: "#0d1e35",
};

const walletIconStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  objectFit: "contain",
  borderRadius: "8px",
};

const walletNameStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#ffffff",
  flex: 1,
  textAlign: "left",
};

const connectedBadgeStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#3B6D11",
  fontWeight: 600,
  background: "#EAF3DE",
  borderRadius: "20px",
  padding: "3px 12px",
};

const emptyStyle: React.CSSProperties = {
  color: "#8C959F",
  fontSize: "18px",
  textAlign: "center",
  lineHeight: 1.6,
};

const connectingStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "16px",
  color: "#8C959F",
  margin: 0,
};