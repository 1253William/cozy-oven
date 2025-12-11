// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import AdminLayout from "../components/AdminLayout";
// import { useAuth } from "../../context/AuthContext";
// import {
//   Search,
//   Filter,
//   MoreVertical,
//   Mail,
//   Phone,
//   Ban,
//   CheckCircle,
//   Eye,
// } from "lucide-react";

// // Mock data - replace with actual API calls
// const mockCustomers = [
//   {
//     id: 1,
//     fullName: "John Doe",
//     email: "john.doe@email.com",
//     phoneNumber: "0201234567",
//     totalOrders: 15,
//     totalSpent: 1250.50,
//     status: "active",
//     joinedDate: "2024-01-15",
//   },
//   {
//     id: 2,
//     fullName: "Jane Smith",
//     email: "jane.smith@email.com",
//     phoneNumber: "0207654321",
//     totalOrders: 8,
//     totalSpent: 680.25,
//     status: "active",
//     joinedDate: "2024-02-20",
//   },
//   {
//     id: 3,
//     fullName: "Michael Johnson",
//     email: "michael.j@email.com",
//     phoneNumber: "0209876543",
//     totalOrders: 3,
//     totalSpent: 195.75,
//     status: "inactive",
//     joinedDate: "2024-03-10",
//   },
//   {
//     id: 4,
//     fullName: "Sarah Williams",
//     email: "sarah.w@email.com",
//     phoneNumber: "0205432109",
//     totalOrders: 22,
//     totalSpent: 2150.00,
//     status: "active",
//     joinedDate: "2023-11-05",
//   },
// ];

// export default function CustomersPage() {
//   const { user, isAuthenticated } = useAuth();
//   const router = useRouter();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
//   const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated || user?.role !== "Admin") {
//       router.push("/admin/login");
//     }
//   }, [isAuthenticated, user, router]);

//   if (!isAuthenticated || user?.role !== "Admin") {
//     return null;
//   }

//   const filteredCustomers = mockCustomers.filter((customer) => {
//     const matchesSearch =
//       customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       customer.phoneNumber.includes(searchQuery);

//     const matchesStatus = statusFilter === "all" || customer.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <AdminLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
//           <p className="text-gray-600 mt-1">Manage and view all your customers</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//             <p className="text-sm text-gray-600 font-medium">Total Customers</p>
//             <p className="text-2xl font-bold text-gray-900 mt-1">{mockCustomers.length}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//             <p className="text-sm text-gray-600 font-medium">Active Customers</p>
//             <p className="text-2xl font-bold text-green-600 mt-1">
//               {mockCustomers.filter((c) => c.status === "active").length}
//             </p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//             <p className="text-sm text-gray-600 font-medium">New This Month</p>
//             <p className="text-2xl font-bold text-blue-600 mt-1">12</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//             <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
//             <p className="text-2xl font-bold text-[#2A2C22] mt-1">
//               GHS {mockCustomers.reduce((acc, c) => acc + c.totalSpent, 0).toFixed(2)}
//             </p>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Search */}
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search by name, email, or phone..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//               />
//             </div>

//             {/* Status Filter */}
//             <div className="flex items-center gap-2">
//               <Filter className="w-5 h-5 text-gray-400" />
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
//               >
//                 <option value="all">All Status</option>
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Customer Table */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Customer
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Orders
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Total Spent
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Joined
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredCustomers.map((customer) => (
//                   <tr key={customer.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="w-10 h-10 bg-[#2A2C22] rounded-full flex items-center justify-center text-white font-semibold">
//                           {customer.fullName.charAt(0)}
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-semibold text-gray-900">
//                             {customer.fullName}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">
//                         <div className="flex items-center gap-2 mb-1">
//                           <Mail className="w-4 h-4 text-gray-400" />
//                           <span>{customer.email}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Phone className="w-4 h-4 text-gray-400" />
//                           <span>{customer.phoneNumber}</span>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-medium text-gray-900">
//                         {customer.totalOrders}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="text-sm font-semibold text-[#2A2C22]">
//                         GHS {customer.totalSpent.toFixed(2)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           customer.status === "active"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-gray-100 text-gray-800"
//                         }`}
//                       >
//                         {customer.status === "active" ? (
//                           <CheckCircle className="w-3 h-3 mr-1" />
//                         ) : (
//                           <Ban className="w-3 h-3 mr-1" />
//                         )}
//                         {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(customer.joinedDate).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <div className="relative">
//                         <button
//                           onClick={() =>
//                             setSelectedCustomer(
//                               selectedCustomer === customer.id ? null : customer.id
//                             )
//                           }
//                           className="p-1 rounded-lg hover:bg-gray-100"
//                         >
//                           <MoreVertical className="w-5 h-5 text-gray-400" />
//                         </button>

//                         {selectedCustomer === customer.id && (
//                           <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
//                             <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
//                               <Eye className="w-4 h-4" />
//                               View Details
//                             </button>
//                             <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
//                               <Mail className="w-4 h-4" />
//                               Send Email
//                             </button>
//                             <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">
//                               <Ban className="w-4 h-4" />
//                               Deactivate
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Empty State */}
//           {filteredCustomers.length === 0 && (
//             <div className="text-center py-12">
//               <p className="text-gray-500">No customers found</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </AdminLayout>
//   );
// }



"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "../components/AdminLayout"
import { useAuth } from "../../context/AuthContext"
import { Search, Filter, MoreVertical, Mail, Phone, Ban, CheckCircle, Eye } from "lucide-react"

// Mock data - replace with actual API calls
const mockCustomers = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john.doe@email.com",
    phoneNumber: "0201234567",
    totalOrders: 15,
    totalSpent: 1250.5,
    status: "active",
    joinedDate: "2024-01-15",
  },
  {
    id: 2,
    fullName: "Jane Smith",
    email: "jane.smith@email.com",
    phoneNumber: "0207654321",
    totalOrders: 8,
    totalSpent: 680.25,
    status: "active",
    joinedDate: "2024-02-20",
  },
  {
    id: 3,
    fullName: "Michael Johnson",
    email: "michael.j@email.com",
    phoneNumber: "0209876543",
    totalOrders: 3,
    totalSpent: 195.75,
    status: "inactive",
    joinedDate: "2024-03-10",
  },
  {
    id: 4,
    fullName: "Sarah Williams",
    email: "sarah.w@email.com",
    phoneNumber: "0205432109",
    totalOrders: 22,
    totalSpent: 2150.0,
    status: "active",
    joinedDate: "2023-11-05",
  },
]

export default function CustomersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/admin/login")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "Admin") {
    return null
  }

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phoneNumber.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewDetails = (customerId: number) => {
    const customer = mockCustomers.find(c => c.id === customerId)
    if (customer) {
      // In a production app, this would open a proper modal
      // For now, using a formatted alert as a placeholder
      const details = [
        `Customer Details`,
        ``,
        `Name: ${customer.fullName}`,
        `Email: ${customer.email}`,
        `Phone: ${customer.phoneNumber}`,
        `Total Orders: ${customer.totalOrders}`,
        `Total Spent: GHS ${customer.totalSpent.toFixed(2)}`,
        `Status: ${customer.status}`,
        `Joined: ${new Date(customer.joinedDate).toLocaleDateString()}`
      ].join('\n')
      alert(details)
    }
    setSelectedCustomer(null)
  }

  const handleSendEmail = (customerId: number) => {
    const customer = mockCustomers.find(c => c.id === customerId)
    if (customer) {
      // Opens default email client
      window.location.href = `mailto:${customer.email}?subject=Cozy Oven - Customer Support`
    }
    setSelectedCustomer(null)
  }

  const handleDeactivate = (customerId: number) => {
    const customer = mockCustomers.find(c => c.id === customerId)
    if (customer && confirm(`Are you sure you want to deactivate ${customer.fullName}?\n\nThis action would normally update the customer's status in the database.`)) {
      // In production, this would call an API
      alert(`Customer ${customer.fullName} deactivated successfully.\n\n(Note: This is a mock action - customer data is not persisted)`)
    }
    setSelectedCustomer(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header - Responsive text sizing for mobile */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and view all your customers</p>
        </div>

        {/* Stats Cards - Better responsive grid and text sizing */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Customers</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{mockCustomers.length}</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Active Customers</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
              {mockCustomers.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">New This Month</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">12</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Revenue</p>
            <p className="text-xl sm:text-2xl font-bold text-[#2A2C22] mt-1 line-clamp-1">
              GHS {mockCustomers.reduce((acc, c) => acc + c.totalSpent, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Search and Filters - Better mobile layout with stacked inputs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 border border-gray-100">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email..."
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2C22] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer List - Card view on mobile, table view on larger screens */}
        <div>
          {/* Mobile Card View (hidden on md and up) */}
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-[#2A2C22] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {customer.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{customer.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{customer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(selectedCustomer === customer.id ? null : customer.id)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      customer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {customer.status === "active" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Ban className="w-3 h-3 mr-1" />
                    )}
                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </span>
                </div>

                {/* Customer Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{customer.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Orders</p>
                    <p className="font-medium text-gray-900">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Spent</p>
                    <p className="font-semibold text-[#2A2C22]">GHS {customer.totalSpent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Joined</p>
                    <p className="font-medium text-gray-900">{new Date(customer.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Mobile Actions Menu */}
                {selectedCustomer === customer.id && (
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <button 
                      onClick={() => handleViewDetails(customer.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button 
                      onClick={() => handleSendEmail(customer.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </button>
                    <button 
                      onClick={() => handleDeactivate(customer.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Ban className="w-4 h-4" />
                      Deactivate
                    </button>
                  </div>
                )}
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No customers found</p>
              </div>
            )}
          </div>

          {/* Desktop Table View (hidden on md and below) */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#2A2C22] rounded-full flex items-center justify-center text-white font-semibold">
                            {customer.fullName.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900">{customer.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{customer.phoneNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{customer.totalOrders}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-[#2A2C22]">
                          GHS {customer.totalSpent.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {customer.status === "active" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Ban className="w-3 h-3 mr-1" />
                          )}
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedCustomer(selectedCustomer === customer.id ? null : customer.id)}
                            className="p-1 rounded-lg hover:bg-gray-100"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>

                          {selectedCustomer === customer.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <button 
                                onClick={() => handleViewDetails(customer.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button 
                                onClick={() => handleSendEmail(customer.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Mail className="w-4 h-4" />
                                Send Email
                              </button>
                              <button 
                                onClick={() => handleDeactivate(customer.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                              >
                                <Ban className="w-4 h-4" />
                                Deactivate
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No customers found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

