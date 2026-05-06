import "./Card.css";

export type PriorityProps = {
  className?: string;
  type?: "Highest" | "High" | "Medium" | "Low" | "Lowest";
};

export const Priority = ({
  className = "",
  type = "Highest",
}: PriorityProps) => {
  
  // Map types to specific color CSS classes and paths
  let priorityClass = "priority--highest";
  let iconPath = null;

  switch (type) {
    case "Highest":
      priorityClass = "priority--highest";
      iconPath = (
        <>
          <path d="M2 11.5L8 6.5L14 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 6.5L8 1.5L14 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;
    case "High":
      priorityClass = "priority--high";
      iconPath = (
        <>
          <path d="M2 9.5L8 4.5L14 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;
    case "Medium":
      priorityClass = "priority--medium";
      iconPath = (
        <>
           <path d="M2 6H14M2 10H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      );
      break;
    case "Low":
      priorityClass = "priority--low";
      iconPath = (
        <>
          <path d="M2 6.5L8 11.5L14 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;
    case "Lowest":
      priorityClass = "priority--lowest";
      iconPath = (
        <>
          <path d="M2 4.5L8 9.5L14 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 9.5L8 14.5L14 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
      break;
  }

  return (
    <div className={`priority ${priorityClass} ${className}`}>
      <div className="priority-icon">
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {iconPath}
        </svg>
      </div>
    </div>
  );
};
