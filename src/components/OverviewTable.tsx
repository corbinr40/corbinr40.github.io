import { useContentFrontmatter } from '../context/ContentContext';

interface OverviewTableProps {
  status?: string;
  type?: string;
  duration?: string;
  software?: string;
  languages?: string;
  availableOn?: string | { label: string; href?: string };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="d-flex justify-content-between py-2 border-bottom">
      <span className="fw-bold">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export default function OverviewTable(props: OverviewTableProps) {
  const ctx = useContentFrontmatter();

  const status = props.status ?? ctx?.status ?? '';
  const type = props.type ?? ctx?.type ?? '';
  const duration = props.duration ?? ctx?.duration ?? '';
  const software = props.software ?? ctx?.software ?? '';
  const languages = props.languages ?? ctx?.languages ?? '';
  const availableOn = props.availableOn ?? ctx?.availableOn ?? '';

  const availableContent =
    typeof availableOn === 'string' ? (
      availableOn
    ) : availableOn.href ? (
      <a href={availableOn.href} target="_blank" rel="noopener noreferrer">
        {availableOn.label}
      </a>
    ) : (
      availableOn.label
    );

  return (
    <div className="col-lg-6 mx-auto my-4">
      <Row label="Status"><span style={{ textTransform: 'capitalize' }}>{status}</span></Row>
      <Row label="Type">{type}</Row>
      <Row label="Duration">{duration}</Row>
      <Row label="Software">{software}</Row>
      <Row label="Languages">{languages}</Row>
      <Row label="Available On">{availableContent}</Row>
    </div>
  );
}
