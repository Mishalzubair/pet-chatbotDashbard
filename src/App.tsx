import React, { useState, useEffect } from 'react';
import { Calendar, Users, Download, RefreshCw, Clock, Search, Filter } from 'lucide-react';
import AppointmentsDashboard from './components/AppointmentsDashboard';
import CustomerDetails from './components/CustomerDetails';

interface Appointment {
  id: string;
  ownerName: string;
  petType: string;
  serviceType: string;
  dateTime: string;
  contactInfo: string;
  status: 'upcoming' | 'today' | 'completed';
}

interface Customer {
  id: string;
  ownerName: string;
  petType: string;
  serviceType: string;
  preferredDateTime: string;
  contactInfo: string;
  email: string;
  notes?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'customers'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - In real implementation, this would fetch from n8n API
  const mockAppointments: Appointment[] = [
    {
      id: '1',
      ownerName: 'Sarah Johnson',
      petType: 'Golden Retriever',
      serviceType: 'Full Grooming',
      dateTime: new Date().toISOString(),
      contactInfo: '(555) 123-4567',
      status: 'today'
    },
    {
      id: '2',
      ownerName: 'Mike Chen',
      petType: 'Persian Cat',
      serviceType: 'Nail Trim',
      dateTime: new Date(Date.now() + 86400000).toISOString(),
      contactInfo: '(555) 987-6543',
      status: 'upcoming'
    },
    {
      id: '3',
      ownerName: 'Emily Rodriguez',
      petType: 'Poodle',
      serviceType: 'Bath & Brush',
      dateTime: new Date(Date.now() + 172800000).toISOString(),
      contactInfo: '(555) 456-7890',
      status: 'upcoming'
    },
    {
      id: '4',
      ownerName: 'David Wilson',
      petType: 'German Shepherd',
      serviceType: 'Full Grooming',
      dateTime: new Date(Date.now() + 259200000).toISOString(),
      contactInfo: '(555) 321-0987',
      status: 'upcoming'
    }
  ];

  const mockCustomers: Customer[] = [
    {
      id: '1',
      ownerName: 'Sarah Johnson',
      petType: 'Golden Retriever',
      serviceType: 'Full Grooming',
      preferredDateTime: 'Weekday mornings',
      contactInfo: '(555) 123-4567',
      email: 'sarah.j@email.com',
      notes: 'Rex is very friendly but gets nervous with nail trims'
    },
    {
      id: '2',
      ownerName: 'Mike Chen',
      petType: 'Persian Cat',
      serviceType: 'Nail Trim',
      preferredDateTime: 'Weekends',
      contactInfo: '(555) 987-6543',
      email: 'mike.chen@email.com',
      notes: 'Fluffy needs sedative for grooming'
    },
    {
      id: '3',
      ownerName: 'Emily Rodriguez',
      petType: 'Poodle',
      serviceType: 'Bath & Brush',
      preferredDateTime: 'Any time',
      contactInfo: '(555) 456-7890',
      email: 'emily.r@email.com'
    },
    {
      id: '4',
      ownerName: 'David Wilson',
      petType: 'German Shepherd',
      serviceType: 'Full Grooming',
      preferredDateTime: 'Afternoons',
      contactInfo: '(555) 321-0987',
      email: 'david.w@email.com',
      notes: 'Max is large and needs extra time'
    }
  ];

  // Simulate data fetching
  const fetchData = async () => {
    setIsRefreshing(true);
    // In real implementation, this would be:
    // const response = await fetch('YOUR_N8N_WEBHOOK_URL');
    // const data = await response.json();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAppointments(mockAppointments);
    setCustomers(mockCustomers);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fluffy Friends Spa</h1>
                <p className="text-sm text-gray-600">Appointment Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Booked Appointments
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Customer Details
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'appointments' && (
          <AppointmentsDashboard appointments={appointments} />
        )}
        {activeTab === 'customers' && (
          <CustomerDetails customers={customers} />
        )}
      </main>
    </div>
  );
}

export default App;