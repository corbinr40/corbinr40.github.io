import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  title: string;
  description: string;
  image?: string;
  href?: string;
  externalLink?: boolean;
  badges: { icon: string; label: string }[];
  category?: string;
  status?: string;
}

export default function ProjectCard({
  title,
  description,
  image,
  href,
  externalLink,
  badges,
  status,
}: ProjectCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!href) return;
    if (externalLink) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate(href);
    }
  };

  return (
    <div
      className={`card-hover card card-cover h-100 overflow-hidden text-bg-dark rounded-4 shadow project-card-bg${href ? " cursor-pointer" : ""}`}
      style={{
        backgroundImage: image ? `url('${image}')` : undefined,
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (href && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      aria-label={title}
    >
      {status && (
        <span className={`badge position-absolute top-0 end-0 m-2 ${
          status === 'completed' ? 'bg-success' :
          status === 'ongoing' ? 'bg-primary' :
          'bg-secondary'
        }`}>
          {status === 'completed' ? 'Completed' :
           status === 'ongoing' ? 'Ongoing' :
           status === 'coming-soon' ? 'Coming Soon' :
           status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
      <div className="d-flex flex-column h-100 p-5 pb-3 text-white text-shadow-1">
        <h3 className="display-6 fw-bold">{title}</h3>
        <p>{description}</p>
        <ul className="d-flex list-unstyled mt-auto">
          {badges.map((badge, i) => (
            <li key={i} className="me-auto">
              <i className={`bi ${badge.icon} me-1`} />
              <small>{badge.label}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
