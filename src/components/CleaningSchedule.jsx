import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';

const CleaningSchedule = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('cleaningTasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { 
        id: 1, 
        name: 'Badezimmer putzen', 
        assignedTo: 'Anna', 
        frequency: 'weekly',
        lastDone: null,
        nextDue: new Date().toISOString(),
        status: 'pending'
      }
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: '',
    assignedTo: '',
    frequency: 'weekly'
  });

  // Speichere Tasks im localStorage
  useEffect(() => {
    localStorage.setItem('cleaningTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Berechne nächstes Fälligkeitsdatum basierend auf der Frequenz
  const calculateNextDue = (frequency, lastDone = new Date()) => {
    const date = new Date(lastDone);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        date.setDate(date.getDate() + 7);
    }
    return date.toISOString();
  };

  // Task als erledigt markieren
  const markAsDone = (taskId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const now = new Date();
        return {
          ...task,
          lastDone: now.toISOString(),
          nextDue: calculateNextDue(task.frequency, now),
          status: 'done'
        };
      }
      return task;
    }));
  };

  // Task hinzufügen
  const addTask = (e) => {
    e.preventDefault();
    const task = {
      id: Date.now(),
      ...newTask,
      lastDone: null,
      nextDue: calculateNextDue(newTask.frequency),
      status: 'pending'
    };
    setTasks([...tasks, task]);
    setNewTask({ name: '', assignedTo: '', frequency: 'weekly' });
    setShowForm(false);
  };

  // Task löschen
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Task bearbeiten
  const startEditing = (task) => {
    setEditingTask(task);
    setNewTask({
      name: task.name,
      assignedTo: task.assignedTo,
      frequency: task.frequency
    });
    setShowForm(true);
  };

  // Bearbeitung speichern
  const saveEdit = (e) => {
    e.preventDefault();
    setTasks(tasks.map(task => {
      if (task.id === editingTask.id) {
        return {
          ...task,
          ...newTask,
          nextDue: calculateNextDue(newTask.frequency, task.lastDone)
        };
      }
      return task;
    }));
    setEditingTask(null);
    setNewTask({ name: '', assignedTo: '', frequency: 'weekly' });
    setShowForm(false);
  };

  // Status-Badge Styling
  const getStatusStyle = (task) => {
    const dueDate = new Date(task.nextDue);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (task.status === 'done') {
      return 'bg-green-100 text-green-800';
    } else if (diffDays <= 0) {
      return 'bg-red-100 text-red-800';
    } else if (diffDays <= 2) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Putzplan</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
            setNewTask({ name: '', assignedTo: '', frequency: 'weekly' });
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <FaPlus /> Neue Aufgabe
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
            </h3>
            <form onSubmit={editingTask ? saveEdit : addTask}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Aufgabe</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Zuständig</label>
                <input
                  type="text"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Häufigkeit</label>
                <select
                  value={newTask.frequency}
                  onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="biweekly">Alle 2 Wochen</option>
                  <option value="monthly">Monatlich</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingTask ? 'Speichern' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{task.name}</h3>
              <p className="text-gray-600">Zuständig: {task.assignedTo}</p>
              <div className="flex gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusStyle(task)}`}>
                  {new Date(task.nextDue).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                  {task.frequency === 'daily' && 'Täglich'}
                  {task.frequency === 'weekly' && 'Wöchentlich'}
                  {task.frequency === 'biweekly' && 'Alle 2 Wochen'}
                  {task.frequency === 'monthly' && 'Monatlich'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => markAsDone(task.id)}
                className="p-2 text-green-600 hover:text-green-800"
                title="Als erledigt markieren"
              >
                <FaCheck />
              </button>
              <button
                onClick={() => startEditing(task)}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="Bearbeiten"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-red-600 hover:text-red-800"
                title="Löschen"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CleaningSchedule;
