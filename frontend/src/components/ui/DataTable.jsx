import EmptyState from "./EmptyState";
import Loader from "./Loader";
import ErrorState from "./ErrorState";

function DataTable({
  columns = [],
  rows = [],
  rowKey = "id",
  loading = false,
  error,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching the current view.",
  className = "",
}) {
  if (loading) return <Loader label="Loading records" />;
  if (error) return <ErrorState message={error.message ?? String(error)} onRetry={onRetry} />;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} compact />;

  return (
    <div className={`data-table-wrap ${className}`.trim()}>
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.key} scope="col" className={column.className ?? ""}>{column.header}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] ?? index}>
              {columns.map((column) => <td key={column.key} className={column.className ?? ""}>{column.render ? column.render(row, index) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
