import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";

export default function InvoicePage() {
  const { orderId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInvoice = async () => {
      const res = await fetch(
        `https://localdelivery-app-backend.vercel.app/orders/${orderId}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setInvoice(data.invoice);
      setLoading(false);
    };
    fetchInvoice();
  }, [orderId, token]);

  if (loading) return <div className="p-6">Loading invoice...</div>;
  if (!invoice) return <div className="p-6">Invoice not found</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white p-6 shadow mt-6">
        <h1 className="text-2xl font-bold mb-2">🧾 Invoice</h1>

        <div className="text-sm text-gray-600 mb-4">
          Invoice No: <b>{invoice.invoiceNumber}</b><br />
          Order Date: {new Date(invoice.orderDate).toLocaleString()}
        </div>

        <hr className="my-3" />

        <h3 className="font-semibold">Customer</h3>
        <p className="text-sm">{invoice.customer.name}</p>
        <p className="text-sm">{invoice.customer.phone}</p>
        <p className="text-sm">{invoice.customer.address}</p>

        <hr className="my-3" />

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border text-center">{item.quantity}</td>
                <td className="p-2 border">₹{item.price}</td>
                <td className="p-2 border">₹{item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4 font-bold text-lg">
          Total: ₹{invoice.totalAmount}
        </div>

        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </>
  );
}

