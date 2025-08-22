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
  const [error, setError] = useState<string | null>(null);

  // Mock data - In real implementation, this would fetch from n8n API
  const N8N_WEBHOOK_URL = 'https://n8n.srv846726.hstgr.cloud/webhook/f9993f5c-0eda-499b-9e41-e9fbdebc6b45/chat';

  // Simulate data fetching
  const fetchData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_data',
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process appointments data
      if (data.appointments && Array.isArray(data.appointments)) {
        const processedAppointments = data.appointments.map((apt: any, index: number) => ({
          id: apt.id || `apt-${index}`,
          ownerName: apt.ownerName || apt.owner_name || '',
          petType: apt.petType || apt.pet_type || '',
          serviceType: apt.serviceType || apt.service_type || '',
          dateTime: apt.dateTime || apt.date_time || new Date().toISOString(),
          contactInfo: apt.contactInfo || apt.contact_info || apt.phone || '',
          status: determineAppointmentStatus(apt.dateTime || apt.date_time)
        }));
        setAppointments(processedAppointments);
      }
      
      // Process customers data
      if (data.customers && Array.isArray(data.customers)) {
        const processedCustomers = data.customers.map((customer: any, index: number) => ({
          id: customer.id || `cust-${index}`,
          ownerName: customer.ownerName || customer.owner_name || '',
          petType: customer.petType || customer.pet_type || '',
          serviceType: customer.serviceType || customer.service_type || '',
          preferredDateTime: customer.preferredDateTime || customer.preferred_date_time || '',
          contactInfo: customer.contactInfo || customer.contact_info || customer.phone || '',
          email: customer.email || '',
          notes: customer.notes || ''
        }));
        setCustomers(processedCustomers);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching data from n8n:', error);
      setError(`Failed to fetch data: ${errorMessage}`);
      // Fallback to empty arrays if there's an error
      setAppointments([]);
      setCustomers([]);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Helper function to determine appointment status based on date
  const determineAppointmentStatus = (dateTimeString: string): 'upcoming' | 'today' | 'completed' => {
    if (!dateTimeString) return 'upcoming';
    
    const appointmentDate = new Date(dateTimeString);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    if (appointmentDate >= todayStart && appointmentDate < todayEnd) {
      return 'today';
    } else if (appointmentDate < todayStart) {
      return 'completed';
    } else {
      return 'upcoming';
    }
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
              {error && (
                <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
                  {error}
                </div>
              )}
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
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to connect to the appointment system. Please check:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Your n8n workflow is active and running</li>
                    <li>The webhook URL is accessible</li>
                    <li>Your internet connection is stable</li>
                  </ul>
                  <p className="mt-2">
                    <button 
                      onClick={handleManualRefresh}
                      className="font-medium text-red-800 underline hover:text-red-900"
                    >
                      Try refreshing the data
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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