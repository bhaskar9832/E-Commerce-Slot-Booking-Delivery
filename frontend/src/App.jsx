import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [runs, setRuns] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // States for Booking Form
  const [selectedRun, setSelectedRun] = useState('');
  const [orderToken, setOrderToken] = useState('');

  // States for Add Driver Form
  const [newDriverName, setNewDriverName] = useState('');
  const [newShiftTiming, setNewShiftTiming] = useState('Morning');
  const [newMaxCapacity, setNewMaxCapacity] = useState(10);

const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchRuns = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/delivery-runs`);
      setRuns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRuns();
    fetchLogs();
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedRun || !orderToken) return alert('Select a run and enter an order token');

    try {
      await axios.post(`${API_URL}/api/delivery-runs/book`, {
        run_id: selectedRun,
        order_token: orderToken
      });
      setOrderToken('');
      fetchRuns();
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed');
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriverName || !newMaxCapacity) return alert('Enter driver name and capacity');

    try {
      await axios.post(`${API_URL}/api/delivery-runs`, {
        driver_name: newDriverName,
        shift_timing: newShiftTiming,
        max_orders_capacity: parseInt(newMaxCapacity)
      });
      setNewDriverName('');
      setNewMaxCapacity(10);
      fetchRuns();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add driver');
    }
  };

  const getRowClass = (run) => {
    const ratio = run.current_assigned_orders / run.max_orders_capacity;
    if (ratio >= 1) return 'row-red';
    if (ratio >= 0.8) return 'row-amber';
    return '';
  };

  return (
    <div className="container">
      <h1>E-Commerce Slot Booking & Delivery</h1>

      <div className="grid">
        <div className="card">
          <h2>Live Status / Dashboard</h2>
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Shift</th>
                <th>Capacity</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {runs.map(run => (
                <tr key={run.id} className={getRowClass(run)}>
                  <td>{run.driver_name}</td>
                  <td>{run.shift_timing}</td>
                  <td>{run.max_orders_capacity}</td>
                  <td>{run.current_assigned_orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>Add New Driver</h2>
          <form onSubmit={handleAddDriver}>
            <div>
              <label>Driver Name:</label>
              <input type="text" value={newDriverName} onChange={e => setNewDriverName(e.target.value)} placeholder="e.g. Alice" />
            </div>
            <div>
              <label>Shift Timing:</label>
              <select value={newShiftTiming} onChange={e => setNewShiftTiming(e.target.value)}>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>
            <div>
              <label>Max Orders Capacity:</label>
              <input type="number" min="1" value={newMaxCapacity} onChange={e => setNewMaxCapacity(e.target.value)} />
            </div>
            <button type="submit" className="btn-secondary">Add Driver</button>
          </form>

          <hr style={{margin: '20px 0'}} />

          <h2>Log Order Booking</h2>
          <form onSubmit={handleBooking}>
            <div>
              <label>Select Shift:</label>
              <select value={selectedRun} onChange={e => setSelectedRun(e.target.value)}>
                <option value="">--Select--</option>
                {runs.map(run => (
                  <option key={run.id} value={run.id} disabled={run.current_assigned_orders >= run.max_orders_capacity}>
                    {run.driver_name} ({run.shift_timing})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Order Token:</label>
              <input type="text" value={orderToken} onChange={e => setOrderToken(e.target.value)} placeholder="e.g. ORD-1234" />
            </div>
            <button type="submit">Save Booking</button>
          </form>
        </div>
      </div>

      <div className="card full-width">
        <h2>History Feed</h2>
        <ul>
          {logs.map(log => (
            <li key={log.id}>
              [{new Date(log.timestamp).toLocaleString()}] Order <strong>{log.order_token}</strong> assigned to {log.driver_name} ({log.shift_timing})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
