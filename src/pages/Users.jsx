import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import NavigationBar from "../components/NavigationBar";
import { toast } from "sonner";
import { BeatLoader } from "react-spinners";
import Swal from "sweetalert2";

export default function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const itemsPerPage = 10;

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const inactivateUser = async (id) => {
    try {
      await updateDoc(doc(db, "users", id), { isActive: false});
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: false} : user,
        ),
      );
    } catch (error) {
      console.error("Error inactivating user:", error);
    }
  };

  const activateUser = async (id) => {
    try {
      await updateDoc(doc(db, "users", id), { isActive: true });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isActive: true } : user,
        ),
      );
      toast.success("User activated successfully")
    } catch (error) {
      toast.success("An error occured")
      console.error("Error activating user:", error);
    }
  };

  const deleteUser = async (id) => {
    
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setUsers((prev) => prev.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // const markSelectedInactive = async () => {
  //   try {
  //     for (let id of selectedUsers) {
  //       await updateDoc(doc(db, "users", id), { isActive: false });
  //     }
  //     setUsers((prev) =>
  //       prev.map((user) =>
  //         selectedUsers.includes(user.id)
  //           ? { ...user, isActive: false }
  //           : user,
  //       ),
  //     );
  //     setSelectedUsers([]);
  //   } catch (error) {
  //     console.error("Error inactivating users:", error);
  //   }
  // };

  const deleteSelected = async () => {
       Swal.fire({
    title: "Delete User?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
  }).then(async(result) => {
    if (result.isConfirmed) {
       try {
        for (let id of selectedUsers) {
          await deleteDoc(doc(db, "users", id));
        }
        setUsers((prev) =>
          prev.filter((user) => !selectedUsers.includes(user.id)),
        );
        setSelectedUsers([]);
        toast.success("User deleted")
      } catch (error) {
        toast.error("An error occured")
        console.error("Error deleting users:", error);
      }
            console.log("Action confirmed");
    }
  });
     
  };

  const toggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const getUsers = async () => {
          try {
            const usersQuery = query(collection(db, "users"));
            const querySnapshot = await getDocs(usersQuery);
            const usersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setUsers(usersData);
            setFilteredUsers(usersData);
          } catch (error) {
            console.error("Error fetching users:", error);
          } finally {
            setLoading(false);
          }
        };
        getUsers();
      } else {
        setUsers([]);
        setFilteredUsers([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle search and filter
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply filter or sort based on filterType
    if (filterType === "isActive" && filterValue) {
      result = result.filter((user) => user.isActive === filterValue);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [searchTerm, filterType, filterValue, users]);

  return (
    <div className="h-screen bg-[#F3F4F6]">
      <div className="h-full bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <NavigationBar
            activeTab="users"
            setActiveTab={() => {}}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            handleSignOut={handleSignOut}
          />

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800">Users</h3>
              <p className="text-sm text-slate-500">
                Manage and monitor user accounts
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
              <BeatLoader/>
              </div>
            ) : (
              <>
                {/* Search and Filter Bar */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Search users..."
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
                    <option value="isActive">isActive</option>
                  </select>
                  {filterType === "isActive" && (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="">Select isActive</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  )}
                  <div className="flex flex-row lg:flex-col gap-2">
                    {selectedUsers.length > 0 && (
                      <>
                        {/* <button
                          onClick={markSelectedInactive}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                        >
                          Inactivate Selected ({selectedUsers.length})
                        </button> */}
                        <button
                          onClick={deleteSelected}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          Delete Selected ({selectedUsers.length})
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-800">
                      User Management ({filteredUsers.length})
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
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            isActive
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {(() => {
                          const startIndex = (currentPage - 1) * itemsPerPage;
                          const endIndex = startIndex + itemsPerPage;
                          const currentUsers = filteredUsers.slice(
                            startIndex,
                            endIndex,
                          );

                          return currentUsers.length > 0 ? (
                            currentUsers.map((user) => (
                              <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => toggleSelect(user.id)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                  {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  {user.fullName || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      user.isActive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {user.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                  {user.isActive  ? (
                                    <button
                                      onClick={() => inactivateUser(user.id)}
                                      className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition"
                                    >
                                      Inactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => activateUser(user.id)}
                                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                    >
                                      Activate
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="px-6 py-4 text-center text-slate-500"
                              >
                                No users found
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
                      filteredUsers.length / itemsPerPage,
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
