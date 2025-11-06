import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { managerAPI } from '../../services/api';
import { useFlash } from '../../context/FlashContext';

const Pending = () => {
  const { showFlash } = useFlash();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const data = await managerAPI.getPendingOrders();
      setOrders(data.orders || []);
    } catch (error) {
      showFlash('Failed to load pending orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (orderId, designerId) => {
    try {
      await managerAPI.assignOrder(orderId, designerId);
      showFlash('Order assigned successfully', 'success');
      fetchPendingOrders();
    } catch (error) {
      showFlash('Failed to assign order', 'error');
    }
  };

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="card-title mb-0">Pending Orders</h2>
                <Link to="/manager/dashboard" className="btn btn-outline-primary">Back to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="alert alert-info">No pending orders.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td><code>{order._id.substring(0, 8)}...</code></td>
                          <td>{order.customerId?.username || 'N/A'}</td>
                          <td>{order.items?.length || 0}</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/manager/order/${order._id}`} className="btn btn-sm btn-outline-primary">
                              View & Assign
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pending;
