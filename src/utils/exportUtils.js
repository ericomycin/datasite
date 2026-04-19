import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export const exportToExcel = (filteredOrders) => {
  const ws = XLSX.utils.json_to_sheet(
    filteredOrders.map((order) => ({
      Date: new Date(order?.createdAt?.toDate()) ,
      Reference: order.reference,
      Recipient: order.recipientNumber,
      Status: order.status || "Unknown",
      Size: order.size,
      Amount: `$${order?.amount || "0.00"}`,
      Network: order.network || "N/A",
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, "orders.xlsx");
};

export const exportToPDF = (filteredOrders) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Add title
  doc.setFontSize(16);
  doc.text("Order History", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Add table
  doc.setFontSize(10);
  const columns = ["Order ID", "Date", "Status", "Amount", "Network"];
  const rows = filteredOrders.map((order) => [
    order.id || "N/A",
    order.createdAt?.toDate?.()?.toLocaleDateString() || "N/A",
    order.status || "Unknown",
    `₵${order?.amount || "0.00"}`,
    order.network || "N/A",
  ]);

  doc.autoTable({
    head: [columns],
    body: rows,
    startY: yPosition,
    margin: 10,
    didDrawPage: function (data) {
      // Footer
      const pageCount = doc.internal.getPages().length;
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    },
  });

  doc.save("orders.pdf");
};