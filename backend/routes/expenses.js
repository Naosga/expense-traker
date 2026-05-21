const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");

// Crear gasto
router.post("/", authMiddleware, async (req, res) => {
  const { amount, category, description, expense_date } = req.body;

  try {
    if (!amount || !category || !expense_date) {
      return res.status(400).json({
        message: "Amount, category and expense_date are required",
      });
    }

    const newExpense = await pool.query(
      `INSERT INTO expenses (user_id, amount, category, description, expense_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, amount, category, description || null, expense_date]
    );

    res.status(201).json({
      message: "Expense created successfully",
      expense: newExpense.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// Obtener gastos del usuario
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await pool.query(
      `SELECT 
        id,
        user_id,
        amount,
        category,
        description,
        TO_CHAR(expense_date, 'YYYY-MM-DD') AS expense_date,
        created_at
      FROM expenses
      WHERE user_id = $1
      ORDER BY expense_date DESC`,
      [req.user.id]
    );

    res.json(expenses.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// Actualizar gasto
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { amount, category, description, expense_date } = req.body;

  try {
    if (!amount || !category || !expense_date) {
      return res.status(400).json({
        message: "Amount, category and expense_date are required",
      });
    }

    const updatedExpense = await pool.query(
      `UPDATE expenses
       SET amount = $1,
           category = $2,
           description = $3,
           expense_date = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [amount, category, description || null, expense_date, id, req.user.id]
    );

    if (updatedExpense.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      message: "Expense updated successfully",
      expense: updatedExpense.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// Eliminar gasto
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpense = await pool.query(
      `DELETE FROM expenses
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (deletedExpense.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      message: "Expense deleted successfully",
      expense: deletedExpense.rows[0],
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;