interface DescListItem {
  term: string;
  desc: string;
  termTag?: 'b' | 'kbd';
}

interface DescListProps {
  items: DescListItem[];
}

export default function DescList({ items }: DescListProps) {
  return (
    <dl className="desc-list">
      {items.map((item, i) => (
        <div key={i} className="desc-list__row">
          <dt className="desc-list__term">
            {item.termTag === 'kbd' ? <kbd>{item.term}</kbd> : <b>{item.term}</b>}
          </dt>
          <dd className="desc-list__sep"> - </dd>
          <dd className="desc-list__desc">{item.desc}</dd>
        </div>
      ))}
    </dl>
  );
}
