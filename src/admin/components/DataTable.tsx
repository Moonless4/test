import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string | number;
  /** What to draw when there is nothing to list — the caller owns the wording. */
  empty?: ReactNode;
};

/**
 * The panel's one list: a table that scrolls sideways on a phone rather than squeezing six columns
 * into 360 pixels. Empty state, loading and errors are the caller's, because only the caller knows
 * what "nothing here" means on its surface.
 */
export default function DataTable<T>({ columns, rows, rowKey, empty }: Props<T>) {
  if (rows.length === 0) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-line bg-white shadow-soft">
      <table className="w-full min-w-[680px] border-collapse text-start">
        <thead className="bg-cream/60 text-[12px] text-cocoa">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-start font-medium ${
                  column.className ?? ''
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className="transition-colors hover:bg-cream/40">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-[13px] align-middle text-ink ${
                    column.className ?? ''
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
