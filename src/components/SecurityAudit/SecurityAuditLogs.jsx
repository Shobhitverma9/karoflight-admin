import React, { useState } from 'react';
import { FaShieldAlt, FaHistory, FaUserShield, FaDownload, FaFilter, FaSearch, FaExclamationTriangle, FaCheckCircle, FaFileAlt, FaTrash, FaClock, FaGlobe, FaKey, FaDatabase } from 'react-icons/fa';

const SecurityAuditLogs = () => {
  const [activeTab, setActiveTab] = useState('audit-logs');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('7days');

  const auditLogs = [
    { id: 1, timestamp: '2025-10-31 14:23:15', user: 'john.doe@company.com', action: 'User Login', status: 'success', ip: '192.168.1.100', details: 'Successful authentication' },
    { id: 2, timestamp: '2025-10-31 14:20:45', user: 'admin@company.com', action: 'Data Export', status: 'success', ip: '192.168.1.50', details: 'Exported user data for GDPR request' },
    { id: 3, timestamp: '2025-10-31 14:15:30', user: 'jane.smith@company.com', action: 'Failed Login', status: 'failed', ip: '203.45.67.89', details: 'Invalid credentials' },
    { id: 4, timestamp: '2025-10-31 13:45:12', user: 'system', action: 'Data Deletion', status: 'success', ip: 'internal', details: 'Automated deletion of expired data' },
    { id: 5, timestamp: '2025-10-31 13:30:00', user: 'compliance@company.com', action: 'Access Request', status: 'success', ip: '192.168.1.75', details: 'User data access request processed' },
    { id: 6, timestamp: '2025-10-31 12:15:22', user: 'john.doe@company.com', action: 'Permission Change', status: 'warning', ip: '192.168.1.100', details: 'Elevated privileges granted' },
  ];

  const gdprRequests = [
    { id: 1, type: 'Data Access', user: 'user123@email.com', submitted: '2025-10-28', status: 'completed', deadline: '2025-11-27' },
    { id: 2, type: 'Data Deletion', user: 'user456@email.com', submitted: '2025-10-30', status: 'in-progress', deadline: '2025-11-29' },
    { id: 3, type: 'Data Portability', user: 'user789@email.com', submitted: '2025-10-31', status: 'pending', deadline: '2025-11-30' },
    { id: 4, type: 'Right to be Forgotten', user: 'user321@email.com', submitted: '2025-10-25', status: 'completed', deadline: '2025-11-24' },
  ];

  const complianceMetrics = [
    { label: 'Data Retention Compliance', value: '98.5%', status: 'good' },
    { label: 'Encryption Coverage', value: '100%', status: 'good' },
    { label: 'Access Control Compliance', value: '96.2%', status: 'good' },
    { label: 'Audit Log Retention', value: '365 days', status: 'good' },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-blue-600 text-3xl" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Security & Compliance Dashboard</h1>
                <p className="text-gray-600">Audit logs and GDPR-compliant data handling</p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <FaDownload />
              Export Report
            </button>
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {complianceMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                </div>
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'audit-logs'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaHistory />
                Audit Logs
              </button>
              <button
                onClick={() => setActiveTab('gdpr-requests')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'gdpr-requests'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaUserShield />
                GDPR Requests
              </button>
              <button
                onClick={() => setActiveTab('data-management')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'data-management'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FaDatabase />
                Data Management
              </button>
            </div>
          </div>

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <div className="p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="warning">Warning</option>
                </select>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="24hours">Last 24 Hours</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">IP Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm text-gray-600">{log.timestamp}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{log.user}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{log.action}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.ip}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GDPR Requests Tab */}
          {activeTab === 'gdpr-requests' && (
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <FaExclamationTriangle className="text-blue-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">GDPR Compliance Notice</h3>
                    <p className="text-blue-800 text-sm">All data subject requests must be processed within 30 days as per GDPR Article 12.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {gdprRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FaFileAlt className="text-gray-600" />
                          <h3 className="font-semibold text-gray-800">{request.type}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Requestor</p>
                            <p className="text-gray-800 font-medium">{request.user}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Submitted</p>
                            <p className="text-gray-800 font-medium">{request.submitted}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Deadline</p>
                            <p className="text-gray-800 font-medium">{request.deadline}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <FaDownload />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                          <FaFileAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data-management' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaClock className="text-blue-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-800">Data Retention Policies</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">User Activity Logs</span>
                      <span className="font-semibold text-gray-800">365 days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Audit Trails</span>
                      <span className="font-semibold text-gray-800">7 years</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">User Personal Data</span>
                      <span className="font-semibold text-gray-800">Account lifetime</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaKey className="text-green-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-800">Encryption Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Data at Rest</span>
                      <FaCheckCircle className="text-green-500" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Data in Transit</span>
                      <FaCheckCircle className="text-green-500" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Backup Encryption</span>
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaGlobe className="text-purple-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-800">Data Processing Locations</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Primary Region</p>
                      <p className="text-gray-600 text-sm">EU West (Frankfurt)</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Backup Region</p>
                      <p className="text-gray-600 text-sm">EU Central (Amsterdam)</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FaTrash className="text-red-600 text-2xl" />
                    <h3 className="text-lg font-semibold text-gray-800">Data Deletion</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Permanently delete user data in compliance with GDPR right to erasure.</p>
                  <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                    <FaTrash />
                    Initialize Data Deletion Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityAuditLogs;