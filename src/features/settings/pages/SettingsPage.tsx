import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { useAuth } from "../../auth";
import styles from "./SettingsPage.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  id: string;
  institution: string;
  role: string;
  period: string;
}

interface Profile {
  name: string;
  email: string;
  institution: string;
  bio: string;
  education: string;
  workHistory: HistoryEntry[];
  academicHistory: HistoryEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function profileKey(address: string) {
  return `chaincred_profile_${address}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return <h3 className={styles.sectionHeader}>{label}</h3>;
}

function Field({
                 label,
                 value,
                 onChange,
                 multiline = false,
                 placeholder = "",
                 type = "text",
               }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{label}</label>
        {multiline ? (
            <textarea
                className={styles.textarea}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
            />
        ) : (
            <input
                className={styles.input}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        )}
      </div>
  );
}

function HistoryList({
                       entries,
                       onAdd,
                       onRemove,
                       onUpdate,
                       rolePlaceholder,
                       institutionPlaceholder,
                     }: {
  entries: HistoryEntry[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof HistoryEntry, val: string) => void;
  rolePlaceholder: string;
  institutionPlaceholder: string;
}) {
  return (
      <div className={styles.historyList}>
        {entries.map((entry) => (
            <div key={entry.id} className={styles.historyRow}>
              <div className={styles.historyFields}>
                <input
                    className={styles.input}
                    value={entry.institution}
                    onChange={(e) => onUpdate(entry.id, "institution", e.target.value)}
                    placeholder={institutionPlaceholder}
                />
                <input
                    className={styles.input}
                    value={entry.role}
                    onChange={(e) => onUpdate(entry.id, "role", e.target.value)}
                    placeholder={rolePlaceholder}
                />
                <input
                    className={styles.input}
                    value={entry.period}
                    onChange={(e) => onUpdate(entry.id, "period", e.target.value)}
                    placeholder="e.g. 2019 – 2023"
                />
              </div>
              <button
                  className={styles.removeBtn}
                  onClick={() => onRemove(entry.id)}
                  aria-label="Remove"
              >
                ✕
              </button>
            </div>
        ))}
        <button className={styles.addBtn} onClick={onAdd}>
          <span className={styles.addIcon}>+</span> Add entry
        </button>
      </div>
  );
}

function DeviceRow({ label, sub, active }: { label: string; sub: string; active?: boolean }) {
  return (
      <div className={styles.deviceRow}>
        <div className={styles.deviceDot} data-active={active} />
        <div className={styles.deviceInfo}>
          <span className={styles.deviceLabel}>{label}</span>
          <span className={styles.deviceSub}>{sub}</span>
        </div>
        {active && <span className={styles.activeBadge}>This device</span>}
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
            <strong>and</strong> submits a blockchain nullification record. This
            action cannot be undone.
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
  const { user, register } = useAuth();

  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      wallet.getChangeAddress().then(setWalletAddress).catch(() => setWalletAddress(null));
    } else {
      setWalletAddress(null);
    }
  }, [connected, wallet]);

  // Seed from AuthContext (registration data) + any previously saved extended fields
  const [profile, setProfile] = useState<Profile>(() => {
    const base: Profile = {
      name: user?.name ?? "",
      email: user?.email ?? "",
      institution: user?.institution ?? "",
      bio: "",
      education: "",
      workHistory: [],
      academicHistory: [],
    };
    // Merge in any extended fields saved under the wallet-scoped key
    if (user?.walletAddress) {
      try {
        const saved = localStorage.getItem(profileKey(user.walletAddress));
        if (saved) {
          const extended = JSON.parse(saved);
          return { ...base, ...extended };
        }
      } catch {
        // ignore
      }
    }
    return base;
  });

  // If the user object loads after mount (e.g. context hydrates async), sync it in
  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      name: prev.name || user.name,
      email: prev.email || user.email,
      institution: prev.institution || user.institution,
    }));
  }, [user]);

  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const set = (field: keyof Profile) => (value: string) =>
      setProfile((p) => ({ ...p, [field]: value }));

  const addWork = () =>
      setProfile((p) => ({
        ...p,
        workHistory: [...p.workHistory, { id: uid(), institution: "", role: "", period: "" }],
      }));

  const removeWork = (id: string) =>
      setProfile((p) => ({ ...p, workHistory: p.workHistory.filter((e) => e.id !== id) }));

  const updateWork = (id: string, field: keyof HistoryEntry, val: string) =>
      setProfile((p) => ({
        ...p,
        workHistory: p.workHistory.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
      }));

  const addAcademic = () =>
      setProfile((p) => ({
        ...p,
        academicHistory: [...p.academicHistory, { id: uid(), institution: "", role: "", period: "" }],
      }));

  const removeAcademic = (id: string) =>
      setProfile((p) => ({ ...p, academicHistory: p.academicHistory.filter((e) => e.id !== id) }));

  const updateAcademic = (id: string, field: keyof HistoryEntry, val: string) =>
      setProfile((p) => ({
        ...p,
        academicHistory: p.academicHistory.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
      }));

  const handleSave = () => {
    // 1. Update the AuthContext user record (name, email, institution)
    if (user) {
      register({
        ...user,
        name: profile.name,
        email: profile.email,
        institution: profile.institution,
      });
    }

    // 2. Save extended fields (bio, education, history) under wallet-scoped key
    const address = user?.walletAddress ?? walletAddress;
    if (address) {
      localStorage.setItem(
          profileKey(address),
          JSON.stringify({
            bio: profile.bio,
            education: profile.education,
            workHistory: profile.workHistory,
            academicHistory: profile.academicHistory,
            // also persist these so they survive a reload even if auth lags
            name: profile.name,
            email: profile.email,
            institution: profile.institution,
          }),
      );
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

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
            <p className={styles.deletedSub}>
              All local data has been cleared and a nullification record has been
              written to the chain.
            </p>
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
                  value={profile.name}
                  onChange={set("name")}
                  placeholder="Your full name"
              />
              <Field
                  label="Email"
                  value={profile.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  type="email"
              />
            </div>
            <div className={styles.fieldGrid}>
              <Field
                  label="Institution"
                  value={profile.institution}
                  onChange={set("institution")}
                  placeholder="Your university or company"
              />
              <Field
                  label="Current education"
                  value={profile.education}
                  onChange={set("education")}
                  placeholder="e.g. MSc Computer Science, MIT"
              />
            </div>
            <Field
                label="Bio"
                value={profile.bio}
                onChange={set("bio")}
                multiline
                placeholder="A short description about yourself…"
            />
          </section>

          {/* ── Work History ── */}
          <section className={styles.card}>
            <SectionHeader label="Work history" />
            <HistoryList
                entries={profile.workHistory}
                onAdd={addWork}
                onRemove={removeWork}
                onUpdate={updateWork}
                institutionPlaceholder="Company"
                rolePlaceholder="Role / title"
            />
          </section>

          {/* ── Academic History ── */}
          <section className={styles.card}>
            <SectionHeader label="Academic history" />
            <HistoryList
                entries={profile.academicHistory}
                onAdd={addAcademic}
                onRemove={removeAcademic}
                onUpdate={updateAcademic}
                institutionPlaceholder="Institution"
                rolePlaceholder="Degree / programme"
            />
          </section>

          {/* ── Connected wallet & devices ── */}
          <section className={styles.card}>
            <SectionHeader label="Connected wallet" />
            {connected ? (
                <div className={styles.walletInfo}>
                  <div className={styles.walletRow}>
                    <span className={styles.walletLabel}>{walletName}</span>
                    <span className={styles.connectedPill}>Connected</span>
                  </div>
                  {walletAddress && (
                      <span className={styles.walletAddress}>
                  {walletAddress.slice(0, 20)}…{walletAddress.slice(-8)}
                </span>
                  )}
                </div>
            ) : (
                <p className={styles.emptyHint}>No wallet connected.</p>
            )}

            <div className={styles.divider} />

            <SectionHeader label="Active sessions" />
            <div className={styles.deviceList}>
              <DeviceRow label="Chrome · macOS" sub="Last active just now" active />
              <DeviceRow label="Safari · iPhone 15" sub="Last active 2 hours ago" />
            </div>
          </section>

          {/* ── Save ── */}
          <div className={styles.saveRow}>
            <button className={styles.saveBtn} onClick={handleSave}>
              {saved ? "✓ Saved" : "Save changes"}
            </button>
          </div>

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