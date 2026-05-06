import "./Card.css";

export type ShopLabelProps = {
  className?: string;
  branch?: string;
  color?: "Green" | "Lime" | "Rose" | "Pink" | "Blue" | "Turquoise";
  country?: string;
};

export const ShopLabel = ({
  className = "",
  branch = "Wien",
  color = "Green",
  country = "AT",
}: ShopLabelProps) => {
  const colorClass = `shop-label--${color.toLowerCase()}`;

  return (
    <div className={`shop-label ${colorClass} ${className}`}>
      <span className="shop-label-text">{country}</span>
      <span className="shop-label-text">/</span>
      <span className="shop-label-text">{branch}</span>
    </div>
  );
};
