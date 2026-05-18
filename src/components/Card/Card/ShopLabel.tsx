import "./Card.css";

export type ShopLabelProps = {
  className?: string;
  branch?: string;
  color?: "Green" | "Lime" | "Rose" | "Pink" | "Blue" | "Turquoise";
  country?: string;
};

const COLORS: Array<"Green" | "Lime" | "Rose" | "Pink" | "Blue" | "Turquoise"> = [
  "Green", "Lime", "Rose", "Pink", "Blue", "Turquoise"
];

const getColorForBranch = (branch: string) => {
  let hash = 0;
  for (let i = 0; i < branch.length; i++) {
    hash = branch.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

export const ShopLabel = ({
  className = "",
  branch = "Wien",
  color,
  country = "AT",
}: ShopLabelProps) => {
  const actualColor = color || getColorForBranch(branch);
  const colorClass = `shop-label--${actualColor.toLowerCase()}`;

  return (
    <div className={`shop-label ${colorClass} ${className}`}>
      <span className="shop-label-text">{country}</span>
      <span className="shop-label-text">/</span>
      <span className="shop-label-text">{branch}</span>
    </div>
  );
};
