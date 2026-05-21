import { useEffect, useState } from "react";
import api from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Expense = {
  id: number;
  user_id: number;
  amount: string;
  category: string;
  description: string | null;
  expense_date: string;
  created_at: string;
};

function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  const loadExpenses = async () => {
    try {
      const response = await api.get("/expenses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await api.get("/expenses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setExpenses(response.data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [token]);

  // aqui agregamos gastos
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    // si los datos se editan entra en esta validadion antes de continuar
    try {
      if (editingExpenseId) {
        await api.put(
          `/expenses/${editingExpenseId}`,
          {
            amount: Number(amount),
            category,
            description,
            expense_date: expenseDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          "/expenses",
          {
            amount: Number(amount),
            category,
            description,
            expense_date: expenseDate,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setAmount("");
      setCategory("");
      setDescription("");
      setExpenseDate("");
      setEditingExpenseId(null);

      loadExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Could not save expense");
    }
  };

  // aqui editamos gastos
  const handleStartEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDescription(expense.description || "");
    setExpenseDate(expense.expense_date.slice(0, 10));
  };
  // fin de agregar/editar

  // aqui borramos gastos
  const handleDeleteExpense = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      loadExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Could not delete expense");
    }
  };
  // fin de borrar

  // aqui agregamos el resumen financiero
  const totalSpent = expenses.reduce((total, expense) => {
    return total + Number(expense.amount);
  }, 0);

  const totalExpenses = expenses.length;

  const highestExpense =
    expenses.length > 0
      ? expenses.reduce((max, expense) => {
          return Number(expense.amount) > Number(max.amount) ? expense : max;
        }, expenses[0])
      : null;
  // fin de resumen financiero

  // aqui empieza la creacion de los chart por categorias
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    const amount = Number(expense.amount);

    const existingCategory = acc.find((item) => item.name === category);

    if (existingCategory) {
      existingCategory.value += amount;
    } else {
      acc.push({
        name: category,
        value: amount,
      });
    }

    return acc;
  }, [] as { name: string; value: number }[]);

  const chartColors = ["#3b82f6", "#22c55e", "#f97316", "#eab308", "#ec4899"];
  // fin de los chart por categorias

  // aqui hacemos la lista para el select del tipo de categoria del gasto
  const categories = [
    "Food",
    "Transport",
    "Rent",
    "Shopping",
    "Health",
    "Entertainment",
    "Education",
    "Other",
  ];

  const categoryIcons: Record<string, string> = {
    Food: "🍔",
    Transport: "🚗",
    Rent: "🏠",
    Shopping: "🛍️",
    Health: "❤️",
    Entertainment: "🎬",
    Education: "📚",
    Other: "📦",
  };
  // fin de la lista

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Expense Tracker</h1>
            <p className="text-slate-400">Manage your personal expenses</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-slate-700 px-4 py-2 hover:bg-slate-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-2xl bg-slate-800 p-6 shadow-xl">
            <p className="text-slate-400 text-sm">Total spent</p>
            <p className="text-3xl font-bold mt-2">${totalSpent.toFixed(2)}</p>
          </div>

          <div className="rounded-2xl bg-slate-800 p-6 shadow-xl">
            <p className="text-slate-400 text-sm">Number of expenses</p>
            <p className="text-3xl font-bold mt-2">{totalExpenses}</p>
          </div>

          <div className="rounded-2xl bg-slate-800 p-6 shadow-xl">
            <p className="text-slate-400 text-sm">Highest expense</p>
            <p className="text-3xl font-bold mt-2">
              {highestExpense ? `$${Number(highestExpense.amount).toFixed(2)}` : "$0.00"}
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-slate-800 p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Expenses by category</h2>

          {expensesByCategory.length === 0 ? (
            <p className="text-slate-400">No data yet</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 bg-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">{editingExpenseId ? "Edit expense" : "Add expense"}</h2>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Category</label>
                <select
                  className="w-full appearance-none rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>

                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm">Description</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 outline-none focus:border-blue-500"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold hover:bg-blue-500 transition"
              >
                {editingExpenseId ? "Save changes" : "Add expense"}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your expenses</h2>

            {expenses.length === 0 ? (
              <p className="text-slate-400">No expenses yet</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-4 flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="text-lg font-semibold">${expense.amount}</p>
                      <p className="text-slate-300">{categoryIcons[expense.category]} {expense.category}</p>
                      <p className="text-slate-400 text-sm">{expense.description || "No description"}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <p className="text-sm text-slate-400">
                        {expense.expense_date.slice(0, 10)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(expense)}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium hover:bg-blue-500 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium hover:bg-red-500 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;