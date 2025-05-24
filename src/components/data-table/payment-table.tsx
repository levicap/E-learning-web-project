import React, { useState } from 'react';
import { Search, Check, X, Eye } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
 import { cn } from "./utils";

interface Payment {
  id: string;
  userName: string;
  courseName: string;
  price: number;
  imageUrl: string;
  status: 'pending' | 'approved' | 'declined';
  date: string;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    userName: 'John Doe',
    courseName: 'Advanced Web Development',
    price: 99.99,
    imageUrl: 'https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    status: 'pending',
    date: '2025-01-15'
  },
  {
    id: '2',
    userName: 'Sarah Johnson',
    courseName: 'UX/UI Design Fundamentals',
    price: 79.99,
    imageUrl: 'https://images.pexels.com/photos/5483064/pexels-photo-5483064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    status: 'approved',
    date: '2025-01-10'
  },
  {
    id: '3',
    userName: 'Michael Smith',
    courseName: 'Mobile App Development',
    price: 129.99,
    imageUrl: 'https://images.pexels.com/photos/6804581/pexels-photo-6804581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    status: 'declined',
    date: '2025-01-08'
  },
  {
    id: '4',
    userName: 'Emily Wilson',
    courseName: 'Data Science Essentials',
    price: 149.99,
    imageUrl: 'https://images.pexels.com/photos/5473298/pexels-photo-5473298.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    status: 'pending',
    date: '2025-01-20'
  },
  {
    id: '5',
    userName: 'David Brown',
    courseName: 'Blockchain Development',
    price: 199.99,
    imageUrl: 'https://images.pexels.com/photos/8471831/pexels-photo-8471831.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    status: 'pending',
    date: '2025-01-22'
  }
];

function PaymentTable() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const itemsPerPage = 3;

  const handleApprovePayment = (id: string) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id ? { ...payment, status: 'approved' } : payment
      )
    );
  };

  const handleDeclinePayment = (id: string) => {
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === id ? { ...payment, status: 'declined' } : payment
      )
    );
  };

  const filteredPayments = payments.filter(payment => 
    payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen  mt-20 ml-5">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(payment.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Dialog.Root open={selectedImage === payment.imageUrl} onOpenChange={(open) => !open && setSelectedImage(null)}>
                        <Dialog.Trigger asChild>
                          <button
                            onClick={() => setSelectedImage(payment.imageUrl)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </button>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                          <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-4 shadow-lg">
                            <img src={payment.imageUrl} alt="Receipt" className="w-full h-auto object-contain" />
                            <Dialog.Close className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
                              <X className="h-4 w-4" />
                            </Dialog.Close>
                          </Dialog.Content>
                        </Dialog.Portal>
                      </Dialog.Root>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        {
                          "bg-yellow-100 text-yellow-800": payment.status === "pending",
                          "bg-green-100 text-green-800": payment.status === "approved",
                          "bg-red-100 text-red-800": payment.status === "declined"
                        }
                      )}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {payment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprovePayment(payment.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleDeclinePayment(payment.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredPayments.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredPayments.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                        page === currentPage
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentTable;