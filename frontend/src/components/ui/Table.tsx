import React, { HTMLAttributes, TableHTMLAttributes } from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  label?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  containerClassName = '',
  label = 'Data table',
  ...props
}) => {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={label}
      className={`w-full overflow-x-auto rounded-xl border border-white/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${containerClassName}`}
    >
      <table className={`w-full border-collapse text-left text-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className={`bg-[#18181c] border-b border-white/10 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  scope = 'col',
  className = '',
  ...props
}) => {
  return (
    <th
      scope={scope}
      className={`px-4 py-3 sm:px-5 sm:py-3.5 text-xs font-semibold uppercase tracking-wider text-[#71717a] select-none whitespace-nowrap ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableBody: React.FC<HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`divide-y divide-white/5 bg-[#09090b] ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  selected = false,
  className = '',
  ...props
}) => {
  return (
    <tr
      className={`transition-colors duration-150 hover:bg-white/[0.02] ${
        selected ? 'bg-blue-500/10' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableCell: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-4 py-3 sm:px-5 sm:py-3.5 text-sm text-[#a1a1aa] align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};
