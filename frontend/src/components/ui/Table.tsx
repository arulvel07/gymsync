import React, { HTMLAttributes, TableHTMLAttributes } from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-md border border-white/10 ${containerClassName}`}>
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
    <thead className={`bg-[#121215] border-b border-white/10 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableHead: React.FC<HTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#71717a] select-none whitespace-nowrap ${className}`}
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
      className={`transition-colors duration-150 hover:bg-[#18181c] ${
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
    <td className={`px-4 py-3 text-sm text-[#a1a1aa] align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};
