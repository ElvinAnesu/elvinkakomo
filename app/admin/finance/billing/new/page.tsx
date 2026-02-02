"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, ChevronDown, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [clientOpen, setClientOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    clientName: "",
    is_paid: false,
    notes: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, price: 0 },
  ]);

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching clients:", error);
      } else {
        setClients(data || []);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [clients, clientSearch]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId) {
      alert("Please select a client");
      return;
    }

    if (items.some((item) => !item.description || item.price <= 0)) {
      alert("Please fill in all item descriptions and prices");
      return;
    }

    setLoading(true);

    try {
      // Create invoice in Supabase
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          client: formData.clientId,
          is_paid: formData.is_paid,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (invoiceError) {
        console.error("Error creating invoice:", invoiceError);
        alert("Failed to create invoice. Please try again.");
        setLoading(false);
        return;
      }

      if (!invoiceData) {
        alert("Failed to create invoice. Please try again.");
        setLoading(false);
        return;
      }

      // Create invoice items
      const invoiceItems = items.map((item) => ({
        invoice: invoiceData.id,
        item_description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(invoiceItems);

      if (itemsError) {
        console.error("Error creating invoice items:", itemsError);
        // Try to delete the invoice if items creation fails
        await supabase.from("invoices").delete().eq("id", invoiceData.id);
        alert("Failed to create invoice items. Please try again.");
        setLoading(false);
        return;
      }

      // Navigate to the invoice detail page
      router.push(`/admin/finance/billing/${invoiceData.id}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/finance/billing"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Billing</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Create New Invoice</h1>
        <p className="text-[#64748B]">Fill in the details to create a new invoice</p>
      </div>

      <Card className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Client Selection - Combobox */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F172A]">
                Client Name *
              </label>
              <Popover open={clientOpen} onOpenChange={setClientOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent",
                      !formData.clientName && "text-[#64748B]"
                    )}
                  >
                    <span>{formData.clientName || "Select a client"}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent mb-2"
                    />
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-[#64748B]">
                          No clients found
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                clientId: client.id,
                                clientName: client.name
                              });
                              setClientOpen(false);
                              setClientSearch("");
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors",
                              formData.clientId === client.id && "bg-purple-50"
                            )}
                          >
                            <div className="font-medium text-[#0F172A]">{client.name}</div>
                            <div className="text-xs text-[#64748B]">{client.email}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#0F172A]">
                  Invoice Items *
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 items-start p-4 border border-[#E5E7EB] rounded-lg bg-[#FAFAFA]"
                  >
                    <div className="col-span-12 md:col-span-5">
                      <label className="text-xs text-[#64748B] mb-1 block">
                        Description
                      </label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="text-xs text-[#64748B] mb-1 block">
                        Quantity
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseFloat(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <label className="text-xs text-[#64748B] mb-1 block">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      <div className="w-full">
                        <label className="text-xs text-[#64748B] mb-1 block">
                          Total
                        </label>
                        <div className="px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#0F172A]">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex justify-end pt-2">
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between text-sm text-[#64748B]">
                    <span>Subtotal:</span>
                    <span className="font-medium text-[#0F172A]">
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#0F172A] border-t border-[#E5E7EB] pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ${calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-medium text-[#0F172A]"
              >
                Notes <span className="text-[#64748B] text-xs">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent resize-none"
                rows={3}
                placeholder="Additional notes or terms..."
              />
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_paid}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_paid: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[#6B21A8] border-[#E5E7EB] rounded focus:ring-2 focus:ring-[#6B21A8]"
                />
                <span className="text-sm font-medium text-[#0F172A]">
                  Mark as Paid
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/finance/billing")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gradient-purple text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
