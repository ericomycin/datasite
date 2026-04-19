import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import FormModal from "../components/FormModal";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import Navigation from "../components/NavigationBar";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import { BeatLoader } from "react-spinners";

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
  const itemsPerPage = 10;

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const completeOrder = async (id) => {
    try {
      await updateDoc(doc(db, "orders", id), { status: "Completed" });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: "Completed" } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const markSelectedCompleted = async () => {
    try {
      for (let id of selectedOrders) {
        await updateDoc(doc(db, "orders", id), { status: "Completed" });
      }
      setOrders((prev) =>
        prev.map((order) =>
          selectedOrders.includes(order.id)
            ? { ...order, status: "Completed" }
            : order,
        ),
      );
      setSelectedOrders([]);
    } catch (error) {
      console.error("Error updating orders:", error);
    }
  };

  const handleExportExcel = async () => {
    exportToExcel(filteredOrders);
    if (filterType === "status" && filterValue === "Pending") {
      try {
        const pendingIds = filteredOrders.map((order) => order.id);
        for (let id of pendingIds) {
          await updateDoc(doc(db, "orders", id), { status: "Processing" });
        }
        setOrders((prev) =>
          prev.map((order) =>
            pendingIds.includes(order.id)
              ? { ...order, status: "Processing" }
              : order,
          ),
        );
      } catch (error) {
        console.error("Error updating orders to Processing:", error);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const getOrders = async () => {
          try {
            const ordersQuery = query(
              collection(db, "orders"),
              orderBy("createdAt", "desc"),
            );
            const querySnapshot = await getDocs(ordersQuery);
            const ordersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setOrders(ordersData);
            setFilteredOrders(ordersData);
          } catch (error) {
            console.error("Error fetching orders:", error);
          } finally {
            setLoading(false);
          }
        };
        getOrders();
      } else {
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let result = [...orders];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.recipientNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Apply filter or sort based on filterType
    if (filterType === "status" && filterValue) {
      result = result.filter((order) => order.status === filterValue);
    } else if (filterType === "network" && filterValue) {
      result = result.filter((order) => order.network === filterValue);
    } else if (filterType === "date" && filterValue) {
      result.sort((a, b) => {
        let aVal = a.createdAt?.toDate?.()?.getTime?.() || 0;
        let bVal = b.createdAt?.toDate?.()?.getTime?.() || 0;
        if (filterValue === "newest") {
          return bVal - aVal;
        } else {
          return aVal - bVal;
        }
      });
    }

    setFilteredOrders(result);
    setCurrentPage(1);
    setSelectedOrders([]);
  }, [searchTerm, filterType, filterValue, orders]);

  return (
    <div className="h-screen bg-[#F3F4F6]">
      <div className="h-full bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <Navigation
            activeTab="orders"
            setActiveTab={() => {}}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleSignOut={handleSignOut}
          />
<FormModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  // onSubmit={handleSubmit}
                />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Orders</h3>
              <p className="text-sm text-slate-500">
                Manage and analyze your order history
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-[50%]">
                <BeatLoader className=" border-indigo-600"/>
              </div>
            ) : (
              <>
                {/* Search and Filter Bar */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <button                                          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-800 transition font-medium"
onClick={() => setIsModalOpen(true)}
>
                  Place Order
                </button>
                  <input
                    type="text"
                    placeholder="Search orders"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setFilterValue("");
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Select Filter</option>
                    <option value="status">Status</option>
                    <option value="date">Date</option>
                    <option value="network">Network</option>
                  </select>
                  {filterType && (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="">Select Option</option>
                      {filterType === "status" && (
                        <>
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Completed">Completed</option>
                        </>
                      )}
                      {filterType === "date" && (
                        <>
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                        </>
                      )}
                      {filterType === "network" && (
                        <>
                          <option value="MTN">MTN</option>
                          <option value="Telecel">Telecel</option>
                          <option value="AT">AirtelTigo</option>
                        </>
                      )}
                    </select>
                  )}
                  {selectedOrders.length <= 0 &&
                  <div className="flex gap-2">

                    <button
                      onClick={handleExportExcel}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      📊 Excel
                    </button>
                    <button
                      onClick={() => exportToPDF(filteredOrders)}
                      className="hidden flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      📄 PDF
                    </button>
                  </div>}
                  {selectedOrders.length > 0 && (
                    <button
                      onClick={markSelectedCompleted}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Complete Selected ({selectedOrders.length})
                    </button>
                  )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-800">
                      Order History ({filteredOrders.length})
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Select
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Recipient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Network
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {(() => {
                          const startIndex = (currentPage - 1) * itemsPerPage;
                          const endIndex = startIndex + itemsPerPage;
                          const currentOrders = filteredOrders.slice(
                            startIndex,
                            endIndex,
                          );
                          {
                            /* const totalPages = Math.ceil(filteredOrders.length / itemsPerPage); */
                          }

                          return currentOrders.length > 0 ? (
                            currentOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order.id)}
                                    onChange={() => toggleSelect(order.id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                  {order.reference}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {new Date(
                                    order.createdAt?.toDate(),
                                  ).toLocaleString() || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {order?.recipientNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      order.status === "Completed"
                                        ? "bg-green-100 text-green-800"
                                        : order.status === "Pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {order.status || "Unknown"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {order?.size}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {"\u20B5"} {order?.amount || "0.00"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {order.network}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {order.status !== "Completed" && (
                                    <button
                                      onClick={() => completeOrder(order.id)}
                                      className="px-3 py-1 bg-orange-400 text-white text-xs rounded hover:bg-orange-500 transition"
                                    >
                                      Complete
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="7"
                                className="px-6 py-4 text-center text-slate-500"
                              >
                                No orders found
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {(() => {
                    const totalPages = Math.ceil(
                      filteredOrders.length / itemsPerPage,
                    );
                    return totalPages > 1 ? (
                      <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-slate-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
