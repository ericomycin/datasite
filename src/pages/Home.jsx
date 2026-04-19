import { useState, useEffect } from "react";
// import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import PaystackComponent from "../components/Paystack";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  //Route Navigation
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [networks, setNetworks] = useState([]);
  const [packages, setPackages] = useState([]);
  const [trackingRef, setTrackingRef] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showNetworkFilter, setShowNetworkFilter] = useState(false);
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: auth?.currentUser?.displayName || "Customer",
    email: auth?.currentUser?.email || "",
    telephone: "",
  });

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //     console.log("User signed out");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // Fetch all networks
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const q = query(collection(db, "packages"));
        const querySnapshot = await getDocs(q);
        const uniqueNetworks = [
          ...new Set(querySnapshot.docs.map((doc) => doc.data().network)),
        ];
        setNetworks(uniqueNetworks.sort());
      } catch (error) {
        console.error("Error fetching networks:", error);
      }
    };
    fetchNetworks();
  }, []);

  // Fetch packages for selected network or all packages if no network selected
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        let q;
        if (selectedNetwork) {
          q = query(
            collection(db, "packages"),
            where("network", "==", selectedNetwork),
          );
        } else {
          q = query(collection(db, "packages"));
        }
        const querySnapshot = await getDocs(q);
        let packageList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Limit to 15 packages and sort by price
        packageList = packageList
          .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
          .slice(0, 15);
        setPackages(packageList);
      } catch (error) {
        console.error("Error fetching packages:", error);
      }
    };
    fetchPackages();
  }, [selectedNetwork]);

  // Track order by reference or recipient number
  const handleTrackOrder = async () => {
    try {
      setSearchAttempted(true);
      const q = query(
        collection(db, "orders"),
        where("recipientNumber", "==", trackingRef),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setTrackedOrder(null);
      } else {
        const order = querySnapshot.docs[0].data();
        setTrackedOrder({
          id: querySnapshot.docs[0].id,
          ...order,
        });
      }
    } catch (error) {
      console.error("Error tracking order:", error);
      setTrackedOrder(null);
    }
  };

  const handleBuyNow = (pkg) => {
    setSelectedProduct(pkg);
  };

  // const handlePaymentSuccess = (reference) => {
  //   console.log("Payment successful:", reference);
  //   alert(`Payment successful for ${selectedProduct.name}! Reference: ${reference.reference}`);
  //   setSelectedProduct(null);
  // };

  // const handlePaymentClose = () => {
  //   console.log("Payment cancelled");
  //   setSelectedProduct(null);
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-lg font-bold text-gray-900">Data Hub</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Agent?</span>
              <button
                onClick={() => navigate("/login")}
                className="bg-[#101828] hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Login In
              </button>
               <button
                onClick={() => navigate("/signup")}
                className="bg-[#101828] hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Data hub
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover unbeatable data bundle prices with no expiry
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Packages Section */}
          <div>
            {/* Buy Data Button / Network Filter */}
            {!showNetworkFilter ? (
              <button
                onClick={() => setShowNetworkFilter(true)}
                className="mb-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 text-lg"
              >
                Buy Data
              </button>
            ) : (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Network
                  </label>
                  <button
                    onClick={() => {
                      setShowNetworkFilter(false);
                      setSelectedNetwork("");
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Clear Filter
                  </button>
                </div>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose a Network --</option>
                  {networks.map((network) => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Packages Grid */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedNetwork
                  ? `Available Packages - ${selectedNetwork}`
                  : "Featured Packages"}
              </h3>
              {packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {pkg.size} - {pkg.network}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {pkg.description || "Data package"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-indigo-600">
                          GHS {parseFloat(pkg.price).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleBuyNow(pkg)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition duration-200 text-sm"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <p className="text-gray-600">
                    {selectedNetwork
                      ? `No packages available for ${selectedNetwork}`
                      : "No packages available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track Order Button */}
        <div className="mt-8">
          <button
            onClick={() => setShowTrackingForm(!showTrackingForm)}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition duration-200 text-lg"
          >
            {showTrackingForm ? "Hide Track Order" : "Track Your Order"}
          </button>
        </div>

        {/* Tracking Form - Full Width */}
        {showTrackingForm && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Track Your Order
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Number
                </label>
                <input
                  type="text"
                  placeholder="Enter recipient number"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleTrackOrder()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleTrackOrder}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition duration-200"
              >
                Track Order
              </button>

              {searchAttempted && (
                <div className="border-t pt-4">
                  {trackedOrder ? (
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Order Found
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Network:</span>{" "}
                            {trackedOrder.network}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span>{" "}
                            {trackedOrder.recipientNumber}
                          </p>
                          <p>
                            <span className="font-medium">Amount:</span> GHS{" "}
                            {parseFloat(trackedOrder.amount).toFixed(2)}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                trackedOrder.status === "Pending"
                                  ? "bg-orange-100 text-orange-700"
                                  : trackedOrder.status === "Processing"
                                    ? "bg-blue-100 text-blue-700"
                                    : trackedOrder.status === "Completed"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {trackedOrder.status}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium">Agent:</span>{" "}
                            {trackedOrder.agent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 rounded p-3">
                      <p className="text-sm text-red-700">
                        No order found for that number
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Complete Your Purchase</h3>
            <div className="mb-4">
              <p className="font-semibold">
                {selectedProduct.network} - {selectedProduct.size}
              </p>
              <p className="text-gray-600">
                GHS {parseFloat(selectedProduct.price).toFixed(2)}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Full Name"
                value={userDetails.name}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={userDetails.email}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={userDetails.telephone}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, telephone: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium transition duration-200"
              >
                Cancel
              </button>
              <div className="flex-1">
                <PaystackComponent
                  email={userDetails.email}
                  telephone={userDetails.telephone}
                  name={userDetails.name}
                  amount={parseFloat(selectedProduct.price)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
