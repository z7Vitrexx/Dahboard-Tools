import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const expenseCategories = [
  'Lebensmittel',
  'Transport',
  'Wohnen',
  'Unterhaltung',
  'Gesundheit',
  'Shopping',
  'Bildung',
  'Sonstiges'
];

const incomeCategories = [
  'Gehalt',
  'Nebenjob',
  'Investments',
  'Verkauf',
  'Geschenk',
  'Rückerstattung',
  'Sonstiges'
];

const FinanceManager = ({ onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    category: expenseCategories[0],
    type: 'expense',
    date: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, [selectedMonth]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/finance/transactions?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Transaktionen:', error);
    }
  };

  const fetchBudget = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/finance/budget?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyBudget(data.budget || 0);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Budgets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const [year, month] = selectedMonth.split('-');
      const transactionData = {
        ...newTransaction,
        month: month,
        year: parseInt(year),
        amount: parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toISOString()
      };

      console.log('Sending transaction data:', transactionData);

      const response = await fetch('http://localhost:3001/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      console.log('Server response:', response);

      if (response.ok) {
        const result = await response.json();
        console.log('Transaction saved:', result);
        fetchTransactions();
        setShowForm(false);
        setNewTransaction({
          description: '',
          amount: '',
          category: expenseCategories[0],
          type: 'expense',
          date: new Date().toISOString().slice(0, 10)
        });
      } else {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        alert('Fehler beim Speichern der Transaktion: ' + errorData);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Transaktion:', error);
      alert('Fehler beim Speichern der Transaktion: ' + error.message);
    }
  };

  const handleBudgetUpdate = async (e) => {
    e.preventDefault();
    try {
      const [year, month] = selectedMonth.split('-');
      const response = await fetch('http://localhost:3001/api/finance/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month: month,
          year: parseInt(year),
          budget: parseFloat(monthlyBudget)
        }),
      });

      console.log('Server response:', response);

      if (response.ok) {
        fetchBudget();
      } else {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        alert('Fehler beim Aktualisieren des Budgets: ' + errorData);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Budgets:', error);
      alert('Fehler beim Aktualisieren des Budgets: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Möchten Sie diese Transaktion wirklich löschen?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/finance/transactions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchTransactions(); // Aktualisiere die Liste nach dem Löschen
        } else {
          const errorData = await response.text();
          alert('Fehler beim Löschen der Transaktion: ' + errorData);
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Transaktion:', error);
        alert('Fehler beim Löschen der Transaktion: ' + error.message);
      }
    }
  };

  // Berechne Statistiken
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const categoryExpenses = expenseCategories.map(category => ({
    category,
    amount: transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
  }));

  // Chart-Daten
  const barChartData = {
    labels: ['Einnahmen', 'Ausgaben', 'Budget'],
    datasets: [{
      label: 'Beträge in €',
      data: [totalIncome, totalExpenses, monthlyBudget],
      backgroundColor: ['#4CAF50', '#f44336', '#2196F3'],
    }]
  };

  const pieChartData = {
    labels: expenseCategories,
    datasets: [{
      data: categoryExpenses.map(c => c.amount),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF'
      ],
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finanzverwaltung</h2>
          <p className="text-sm text-gray-500">
            Budget: {monthlyBudget}€ | Ausgaben: {totalExpenses}€ | Verbleibend: {monthlyBudget - totalExpenses}€
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Neue Transaktion
        </button>
      </div>

      {/* Filter und Monatsauswahl */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Alle Kategorien</option>
          {expenseCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex">
          <input
            type="number"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="px-4 py-2 border rounded-l-lg w-2/3"
            placeholder="Monatsbudget"
          />
          <button
            onClick={handleBudgetUpdate}
            className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 w-1/3"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* Hauptbereich */}
      <div className="flex-1 grid grid-cols-2 gap-6">
        {/* Transaktionsliste */}
        <div className="bg-white rounded-lg shadow p-4 overflow-auto">
          <h3 className="text-lg font-semibold mb-4">Transaktionen</h3>
          <div className="space-y-4">
            {transactions
              .filter(t => filterCategory === 'all' || t.category === filterCategory)
              .map(transaction => (
                <div
                  key={transaction.id}
                  className={`p-4 rounded-lg shadow flex justify-between items-center ${
                    transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{transaction.description}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()} - {transaction.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {transaction.amount} €
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Transaktion löschen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Grafiken */}
        <div className="grid grid-rows-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Übersicht</h3>
            <div className="h-[200px]">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">Ausgaben nach Kategorien</h3>
            <div className="h-[200px]">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Formular für neue Transaktion */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Neue Transaktion</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Typ</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => {
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value,
                      category: e.target.value === 'income' ? incomeCategories[0] : expenseCategories[0]
                    });
                  }}
                  className="mt-1 w-full px-4 py-2 border rounded-lg"
                >
                  <option value="expense">Ausgabe</option>
                  <option value="income">Einnahme</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategorie</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="mt-1 w-full px-4 py-2 border rounded-lg"
                >
                  {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="mt-1 w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Betrag</label>
                <input
                  type="number"
                  step="0.01"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="mt-1 w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Datum</label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="mt-1 w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;
