const StatusBadge = ({ status }) => {
  const styles = {
    PRESENT: { bg: "#dcfce7", color: "#166534" },
    LATE: { bg: "#ffedd5", color: "#9a3412" },
    ABSENT: { bg: "#fee2e2", color: "#991b1b" },
  };

  const style = styles[status] || { bg: "#e5e7eb", color: "#374151" };

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
