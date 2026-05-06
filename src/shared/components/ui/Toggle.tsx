import styles from './Toggle.module.css';

interface Props {
  enabled: boolean;
  onChange: (val: boolean) => void;
}

export function Toggle({ enabled, onChange }: Props) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`${styles.toggle} ${enabled ? styles.on : styles.off}`}
    />
  );
}