function NewsMeta({ date, dateLabel }) {
  return <p className="news-meta"><time dateTime={date}>{dateLabel}</time></p>;
}

export default NewsMeta;
