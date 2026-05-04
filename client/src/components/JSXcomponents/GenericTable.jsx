import React from "react";
import "./../CSScomponents/GenericTable.css";
// columns: array me objekte { header: "Emri", key: "fusha_ne_db" }
// data: array me të dhënat (profiles ose users)
// onMoreClick: funksioni që ekzekutohet kur shtypet butoni "More"
export default function GenericTable({ columns, data, onMoreClick }) {
  return (
    <table className="profile-table">
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
          <th>More</th> {/* Kolona për butonin More */}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id}>
              {columns.map((col, index) => (
                <td key={index}>
                  {/* Nëse është datë, e konvertojmë, përndryshe e shfaqim si tekst */}
                  {col.key.includes("date") 
                    ? new Date(item[col.key]).toLocaleDateString() 
                    : item[col.key]}
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