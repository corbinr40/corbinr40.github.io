interface QuoteBlockProps {
  quote: string;
  attribution?: string;
}

export default function QuoteBlock({ quote, attribution }: QuoteBlockProps) {
  return (
    <figure>
      <blockquote className="blockquote">
        <p>{quote}</p>
      </blockquote>
      {attribution && (
        <figcaption className="blockquote-footer">{attribution}</figcaption>
      )}
    </figure>
  );
}
