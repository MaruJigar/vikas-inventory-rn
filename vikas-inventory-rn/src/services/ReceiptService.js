import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export class ReceiptService {
  static async generateAndShareReceipt(order) {
    // A clean, simple order receipt without any GST or complex billing terms.
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 28px; font-weight: bold; color: #4F46E5; margin: 0; }
            .tagline { font-size: 14px; color: #666; margin-top: 5px; }
            .receipt-title { font-size: 22px; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px; color: #111; }
            .info-table { width: 100%; margin-bottom: 30px; }
            .info-table td { padding: 5px 0; vertical-align: top; }
            .label { font-weight: bold; color: #555; width: 120px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
            .items-table th { background-color: #F9FAFB; font-weight: bold; color: #374151; }
            .items-table td.right, .items-table th.right { text-align: right; }
            .total-row td { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 15px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="brand">Vikas Marketing</h1>
            <p class="tagline">Order Confirmation Receipt</p>
          </div>
          
          <table class="info-table">
            <tr>
              <td class="label">Order ID:</td>
              <td><strong>${order.id || order.orderNumber || 'N/A'}</strong></td>
              <td class="label" style="text-align: right;">Date:</td>
              <td style="text-align: right;">${order.date || new Date().toLocaleDateString()}</td>
            </tr>
            <tr>
              <td class="label">Customer:</td>
              <td>${order.customerName || order.shop_name}</td>
              <td class="label" style="text-align: right;">Salesman:</td>
              <td style="text-align: right;">${order.salesmanName || 'Assigned Agent'}</td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th class="right">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.product_name || item.name}</td>
                  <td class="right">${item.quantity}</td>
                  <td class="right">Rs. ${parseFloat(item.price_at_time || item.price || 0).toLocaleString('en-IN')}</td>
                  <td class="right">Rs. ${((item.price_at_time || item.price || 0) * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3" class="right">Grand Total</td>
                <td class="right">Rs. ${parseFloat(order.total_amount || order.total || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>This is a system-generated order receipt for confirmation purposes only.</p>
            <p>For inquiries, please contact your distributor.</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      console.log('PDF Generated at:', uri);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Order Receipt',
          UTI: 'com.adobe.pdf'
        });
      }
    } catch (error) {
      console.error('Error generating or sharing receipt:', error);
    }
  }
}
