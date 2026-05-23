import React from "react";
import "./../CSScomponents/GenericTable.css";

export default function GenericTable({ columns, data, onMoreClick }) {
  return (
    <table className="profile-table">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}<th>More</th>{/* Kjo kllapë është ngjitur me <th> për të shmangur whitespace error */}
        </tr>
      </thead>
      <tbody>
  {data && data.length > 0 ? (
    data.map((item) => (
      <tr key={item.id}>
        {columns.map((col, index) => (
          <td key={index}>
            {col.render
              ? col.render(item[col.key], item)
              : col.key.includes("date") && item[col.key]
                ? new Date(item[col.key]).toLocaleDateString()
                : (item[col.key] ?? "-")}
          </td>
        ))}
        <td>
          <button 
            className="more-button" 
            onClick={() => onMoreClick(item)}
          >
            &hellip;
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={columns.length + 1} style={{ textAlign: "center" }}>
        No records found.
      </td>
    </tr>
  )}
</tbody>
    </table>
  );
}