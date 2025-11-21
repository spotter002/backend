const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const filename = `invoice-${invoiceData._id}.pdf`;
        const filepath = path.join(__dirname, '../uploads', filename);
        
        doc.pipe(fs.createWriteStream(filepath));

        // Header
        doc.fontSize(20).text('INVOICE', 50, 50);
        doc.fontSize(12).text(`Invoice #: ${invoiceData._id}`, 50, 80);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 100);
        doc.text(`Status: ${invoiceData.status.toUpperCase()}`, 50, 120);

        // Client Info
        doc.text('Bill To:', 50, 160);
        doc.text(`Client: ${invoiceData.clientId.name}`, 50, 180);
        doc.text(`Email: ${invoiceData.clientId.email}`, 50, 200);

        // Freelancer Info
        doc.text('From:', 300, 160);
        doc.text(`Freelancer: ${invoiceData.freelancerId.name}`, 300, 180);
        doc.text(`Email: ${invoiceData.freelancerId.email}`, 300, 200);

        // Line Items
        doc.text('Description', 50, 250);
        doc.text('Amount', 400, 250);
        doc.text('Qty', 450, 250);
        doc.text('Total', 500, 250);

        let yPosition = 280;
        invoiceData.lineItems.forEach(item => {
          doc.text(item.desc, 50, yPosition);
          doc.text(`KSh ${item.amount}`, 400, yPosition);
          doc.text(item.qty.toString(), 450, yPosition);
          doc.text(`KSh ${item.amount * item.qty}`, 500, yPosition);
          yPosition += 20;
        });

        // Total
        doc.fontSize(14).text(`Total Amount: KSh ${invoiceData.totalAmount}`, 400, yPosition + 20);

        // Footer
        doc.fontSize(10).text('Thank you for your business!', 50, yPosition + 60);

        doc.end();

        doc.on('end', () => {
          resolve(`/uploads/${filename}`);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  calculateUpgradeCosts(upgrades) {
    const costs = {
      nda: 3303.90,
      ip: 3303.90,
      urgent: 1500.95,
      private: 3303.90
    };

    let total = 0;
    Object.keys(upgrades).forEach(upgrade => {
      if (upgrades[upgrade] && costs[upgrade]) {
        total += costs[upgrade];
      }
    });

    return total;
  }
}

module.exports = new InvoiceService();