export default function RevsLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/revs-logo.svg"
      alt="New England Revolution"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
