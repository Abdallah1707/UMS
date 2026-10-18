import { useState, useEffect } from 'react';
import { facilitiesService } from '../../api/facilitiesService';
import { coreService } from '../../api/coreService';
import ErrorBox from '../../components/ErrorBox';
import './ResourceAllocation.css';

const ResourceAllocation = () => {
  const [resources, setResources] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [resourceForm, setResourceForm] = useState({
    name: '',
    resource_type: 'equipment',
    description: '',
    quantity: 1
  });

  const [allocationForm, setAllocationForm] = useState({
    resource: '',
    department: '',
    quantity_allocated: 1,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [selectedDepartment]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, allocationsRes, departmentsRes] = await Promise.all([
        facilitiesService.getResources(),
        facilitiesService.getResourceAllocations(selectedDepartment ? { department: selectedDepartment } : {}),
        coreService.getDepartments()
      ]);
      setResources(resourcesRes.data);
      setAllocations(allocationsRes.data);
      setDepartments(departmentsRes.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingResource) {
        await facilitiesService.updateResource(editingResource.id, resourceForm);
      } else {
        await facilitiesService.createResource(resourceForm);
      }
      setShowResourceForm(false);
      setEditingResource(null);
      setResourceForm({ name: '', resource_type: 'equipment', description: '', quantity: 1 });
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 
                       err.response?.data?.detail || 
                       err.response?.data?.message || 
                       'Failed to save resource';
      setError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAllocationSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingAllocation) {
        await facilitiesService.updateResourceAllocation(editingAllocation.id, allocationForm);
      } else {
        await facilitiesService.createResourceAllocation(allocationForm);
      }
      setShowAllocationForm(false);
      setEditingAllocation(null);
      setAllocationForm({ resource: '', department: '', quantity_allocated: 1, notes: '' });
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 
                       err.response?.data?.detail || 
                       err.response?.data?.message || 
                       'Failed to save allocation';
      setError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setResourceForm({
      name: resource.name,
      resource_type: resource.resource_type,
      description: resource.description,
      quantity: resource.quantity
    });
    setShowResourceForm(true);
  };

  const handleEditAllocation = (allocation) => {
    setEditingAllocation(allocation);
    setAllocationForm({
      resource: allocation.resource,
      department: allocation.department,
      quantity_allocated: allocation.quantity_allocated,
      notes: allocation.notes
    });
    setShowAllocationForm(true);
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await facilitiesService.deleteResource(id);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete resource');
      }
    }
  };

  const handleDeleteAllocation = async (id) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      try {
        await facilitiesService.deleteResourceAllocation(id);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete allocation');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="resource-allocation-container">
      <h1>Resource Allocation Management</h1>
      {error && <ErrorBox error={error} onClose={() => setError(null)} />}

      <div className="section">
        <div className="section-header">
          <h2>Resources</h2>
          <button onClick={() => { setShowResourceForm(true); setEditingResource(null); setResourceForm({ name: '', resource_type: 'equipment', description: '', quantity: 1 }); }}>
            Add Resource
          </button>
        </div>

        {showResourceForm && (
          <form onSubmit={handleResourceSubmit} className="form-card">
            <h3>{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
            <input
              type="text"
              placeholder="Resource Name"
              value={resourceForm.name}
              onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
              required
            />
            <select
              value={resourceForm.resource_type}
              onChange={(e) => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
              required
            >
              <option value="equipment">Equipment</option>
              <option value="software">Software</option>
            </select>
            <textarea
              placeholder="Description"
              value={resourceForm.description}
              onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={resourceForm.quantity}
              onChange={(e) => setResourceForm({ ...resourceForm, quantity: parseInt(e.target.value) })}
              min="1"
              required
            />
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => { setShowResourceForm(false); setEditingResource(null); }}>Cancel</button>
            </div>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
              <th>Total Quantity</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.name}</td>
                <td>{resource.resource_type}</td>
                <td>{resource.description}</td>
                <td>{resource.quantity}</td>
                <td>{resource.available}</td>
                <td>
                  <button onClick={() => handleEditResource(resource)}>Edit</button>
                  <button onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <div className="section-header">
          <h2>Resource Allocations</h2>
          <div>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <button onClick={() => { setShowAllocationForm(true); setEditingAllocation(null); setAllocationForm({ resource: '', department: '', quantity_allocated: 1, notes: '' }); }}>
              Allocate Resource
            </button>
          </div>
        </div>

        {showAllocationForm && (
          <form onSubmit={handleAllocationSubmit} className="form-card">
            <h3>{editingAllocation ? 'Edit Allocation' : 'Allocate Resource'}</h3>
            <select
              value={allocationForm.resource}
              onChange={(e) => setAllocationForm({ ...allocationForm, resource: e.target.value })}
              required
            >
              <option value="">Select Resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>{resource.name} ({resource.resource_type})</option>
              ))}
            </select>
            <select
              value={allocationForm.department}
              onChange={(e) => setAllocationForm({ ...allocationForm, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity to Allocate"
              value={allocationForm.quantity_allocated}
              onChange={(e) => setAllocationForm({ ...allocationForm, quantity_allocated: parseInt(e.target.value) })}
              min="1"
              required
            />
            <textarea
              placeholder="Notes (optional)"
              value={allocationForm.notes}
              onChange={(e) => setAllocationForm({ ...allocationForm, notes: e.target.value })}
            />
            <div className="form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => { setShowAllocationForm(false); setEditingAllocation(null); }}>Cancel</button>
            </div>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Department</th>
              <th>Quantity</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => (
              <tr key={allocation.id}>
                <td>{allocation.resource_name}</td>
                <td>{allocation.resource_type}</td>
                <td>{allocation.department_name}</td>
                <td>{allocation.quantity_allocated}</td>
                <td>{allocation.notes}</td>
                <td>
                  <button onClick={() => handleEditAllocation(allocation)}>Edit</button>
                  <button onClick={() => handleDeleteAllocation(allocation.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceAllocation;
