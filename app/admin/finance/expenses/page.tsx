"use client";

import { useState } from "react";
import Card from "../../../components/Card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { transactions, type Transaction } from "../../../lib/mockData";
import { Trash2, Pencil } from "lucide-react";

export default function ExpensesPage() {
  const [expensesFilter, setExpensesFilter] = useState("all");
  const [expenses, setExpenses] = useState<Transaction[]>(
    transactions.filter((t) => t.type === "Expense")
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    client: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    paid: false,
  });

  const categories = ["Infrastructure", "Marketing", "Tools & Software", "Professional Development", "Office", "Travel", "Other"];

  const handleOpenModal = (expense?: Transaction) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        client: expense.client,
        description: expense.description,
        amount: Math.abs(expense.amount).toString(),
        date: expense.date,
        category: expense.category,
        paid: expense.status === "Completed",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        client: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
        paid: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      client: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
      paid: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      // Update existing expense
      setExpenses(
        expenses.map((exp) =>
          exp.id === editingExpense.id
            ? {
                ...exp,
                client: formData.client,
                description: formData.description,
                amount: -Math.abs(parseFloat(formData.amount)),
                date: formData.date,
                category: formData.category,
                status: formData.paid ? "Completed" : "Pending",
              }
            : exp
        )
      );
    } else {
      // Create new expense
      const newExpense: Transaction = {
        id: Date.now().toString(),
        client: formData.client,
        description: formData.description,
        amount: -Math.abs(parseFloat(formData.amount)),
        date: formData.date,
        type: "Expense",
        category: formData.category,
        status: formData.paid ? "Completed" : "Pending",
      };
      setExpenses([...expenses, newExpense]);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      setExpenses(expenses.filter((exp) => exp.id !== expenseToDelete));
      setExpenseToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const renderExpenseCard = (transaction: Transaction) => (
    <Card key={transaction.id}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              {transaction.client}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                transaction.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : transaction.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {transaction.status}
            </span>
            <span className="px-3 py-1 bg-[#FAFAFA] text-[#64748B] rounded-lg text-xs border border-[#E5E7EB]">
              {transaction.category}
            </span>
          </div>
          <p className="text-[#64748B] mb-2">{transaction.description}</p>
          <p className="text-sm text-[#64748B]">{transaction.date}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">
              -${Math.abs(transaction.amount).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleOpenModal(transaction)}
              className="text-[#64748B] hover:text-[#0F172A]"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDeleteClick(transaction.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Expenses</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold"
          >
            + Add Expense
          </button>
        </div>

        <Tabs value={expensesFilter} onValueChange={setExpensesFilter} className="mb-6">
          <TabsList className="bg-[#FAFAFA] border border-[#E5E7EB]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="this-month" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              This Month
            </TabsTrigger>
            <TabsTrigger value="by-category" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              By Category
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">No expenses found</p>
                </Card>
              ) : (
                expenses.map((transaction) => renderExpenseCard(transaction))
              )}
            </div>
          </TabsContent>

          <TabsContent value="this-month" className="mt-6">
            <div className="space-y-4">
              {expenses
                .filter((t) => {
                  const transactionDate = new Date(t.date);
                  const now = new Date();
                  return (
                    transactionDate.getMonth() === now.getMonth() &&
                    transactionDate.getFullYear() === now.getFullYear()
                  );
                })
                .length === 0 ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">No expenses found for this month</p>
                </Card>
              ) : (
                expenses
                  .filter((t) => {
                    const transactionDate = new Date(t.date);
                    const now = new Date();
                    return (
                      transactionDate.getMonth() === now.getMonth() &&
                      transactionDate.getFullYear() === now.getFullYear()
                    );
                  })
                  .map((transaction) => renderExpenseCard(transaction))
              )}
            </div>
          </TabsContent>

          <TabsContent value="by-category" className="mt-6">
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">No expenses found</p>
                </Card>
              ) : (
                expenses.map((transaction) => renderExpenseCard(transaction))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Expense Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#0F172A]">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription>
                {editingExpense
                  ? "Update the expense details below."
                  : "Fill in the details to record a new expense."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="client"
                    className="text-sm font-medium text-[#0F172A]"
                  >
                    Client/Vendor
                  </label>
                  <input
                    id="client"
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                    placeholder="Enter client or vendor name"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-[#0F172A]"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Enter expense description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="amount"
                      className="text-sm font-medium text-[#0F172A]"
                    >
                      Amount ($)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="date"
                      className="text-sm font-medium text-[#0F172A]"
                    >
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="text-sm font-medium text-[#0F172A]"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="paid"
                      className="text-sm font-medium text-[#0F172A] cursor-pointer"
                    >
                      Mark as Paid
                    </label>
                    <p className="text-xs text-[#64748B]">
                      Toggle to mark this expense as paid or unpaid
                    </p>
                  </div>
                  <Switch
                    id="paid"
                    checked={formData.paid}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, paid: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gradient-purple text-white">
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
