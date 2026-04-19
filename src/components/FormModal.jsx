import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
// import {  onAuthStateChanged } from "firebase/auth";
// import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

const FormModal = ({ isOpen, onClose }) => {
  const { userData } = useAuth();

  const [packagePrices, setPackagePrices] = useState([]);
  const [isMultiple, setIsMultiple] = useState(false);
  const [multipleOrdersText, setMultipleOrdersText] = useState("");
  const [order, setOrder] = useState({
    network: "",
    amount: "",
    reference: "",
    size: "",
    recipientNumber: "",
    status: "Pending",
    agent: userData?.fullName,
    agentId: userData?.userId,
    createdAt: new Date(),
  });

  console.log(userData?.fullName);

  const generateRef = () => {
    const now = new Date();

    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let random = "";

    for (let i = 0; i < 4; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
  };

  // Parse multiple orders from text input
  const parseMultipleOrders = (text) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split(/\s+/);
        if (parts.length < 2) {
          throw new Error(
            `Invalid format: "${line}". Use "recipientnumber size"`,
          );
        }
        const recipientNumber = parts[0];
        const size = parts[1];

        // Find the package price for this size
        const packageItem = packagePrices.find((pkg) => pkg.size === size);
        if (!packageItem) {
          throw new Error(
            `Size "${size}" not found for network ${order.network}`,
          );
        }

        return {
          network: order.network,
          amount: packageItem.price,
          recipientNumber: recipientNumber,
          size: packageItem.size,
          status: "Pending",
          agent: userData?.fullName,
          agentId: userData?.userId,
        };
      });
  };

  //Add Order(s)
  const addOrder = async () => {
    try {
      let ordersToAdd = [];
      let totalAmount = 0;

      if (isMultiple) {
        // Parse and validate multiple orders
        ordersToAdd = parseMultipleOrders(multipleOrdersText);
        totalAmount = ordersToAdd.reduce(
          (sum, o) => sum + parseFloat(o.amount),
          0,
        );
      } else {
        // Single order
        ordersToAdd = [order];
        totalAmount = parseFloat(order.amount);
      }

      // Check wallet balance before adding any orders
      const currentWallet = parseFloat(userData?.wallet || 0);
      if (totalAmount > currentWallet) {
        toast.error("Insufficient balance for all orders");
        return;
      }

      // Add all orders to Firestore
      const addedOrders = [];
      for (const orderItem of ordersToAdd) {
        const newOrder = {
          ...orderItem,
          reference: generateRef(), // ✅ add reference here
          status: "Pending", // ensure consistency
          createdAt: new Date(), // always fresh timestamp
        };

        const docRef = await addDoc(collection(db, "orders"), newOrder);
        addedOrders.push(docRef.id);
      }
      // Decrease wallet after all orders successful
      const q = query(
        collection(db, "users"),
        where("userId", "==", userData?.userId),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];

        await updateDoc(userDoc.ref, {
          wallet: increment(-totalAmount),
        });

        toast.success(`Success: ${addedOrders.length} order(s) placed`);
        console.log("Wallet decreased by:", totalAmount);
      } else {
        console.error("User document not found");
        toast.error("Error: User not found");
      }
    } catch (e) {
      console.error("Error adding document: ", e);
      toast.error("Error: " + e.message);
    }
  };

  // const auth = getAuth();

  useEffect(() => {
    const getUserDetails = async () => {
      if (!order.network) {
        setPackagePrices([]);
        return;
      }

      const q = query(
        collection(db, "packages"),
        where("network", "==", order.network),
      );

      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPackagePrices(data); // ✅ CLEAN REPLACE
    };

    getUserDetails();
  }, [order.network]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  if (!isOpen) return null;

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   onSubmit(() => addOrder);
  //   onClose();
  // };
  console.log(order);
  console.log(packagePrices);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-bold text-gray-800">Place Order</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!order.network) {
              toast.error("Please select a network");
              return;
            }

            if (isMultiple) {
              // Multiple orders validation
              if (!multipleOrdersText.trim()) {
                toast.error("Please enter orders in the text field");
                return;
              }

              try {
                const parsedOrders = parseMultipleOrders(multipleOrdersText);
                const totalAmount = parsedOrders.reduce(
                  (sum, o) => sum + parseFloat(o.amount),
                  0,
                );
                const currentWallet = parseFloat(userData?.wallet || 0);

                if (isNaN(totalAmount) || totalAmount <= 0) {
                  console.log(totalAmount);
                  toast.error("Invalid order total");
                  return;
                }

                if (totalAmount > currentWallet) {
                  toast.error("Insufficient balance");
                  return;
                }
              } catch (error) {
                toast.error(error.message);
                return;
              }
            } else {
              // Single order validation
              if (!order.amount || !order.recipientNumber) {
                toast.error("Please fill in all fields");
                return;
              }

              const currentWallet = parseFloat(userData?.wallet || 0);
              const orderAmount = parseFloat(order.amount);

              if (isNaN(orderAmount) || orderAmount <= 0) {
                toast.error("Invalid order amount");
                return;
              }

              if (orderAmount > currentWallet) {
                toast.error("Insufficient balance");
                return;
              }
            }

            addOrder();
            onClose();
          }}
          className="space-y-6"
        >
          {/* Network Select */}
          <div>
            {/* Multiple Orders Toggle */}
            <div className="flex items-center gap-3 py-2 bg-gray-50 px-4 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={isMultiple}
                  onChange={(e) => {
                    setIsMultiple(e.target.checked);
                    setMultipleOrdersText("");
                    setOrder({ ...order, amount: "", recipientNumber: "" });
                  }}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enter Multiple Orders
                </span>
              </label>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Network
            </label>
            <select
              name="network"
              value={order.network}
              onChange={(e) => {
                setOrder({ ...order, network: e.target.value });
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
            >
              <option value="">Choose a network</option>
              <option value="MTN">MTN</option>
              <option value="Telecel">Telecel</option>
              <option value="AT">AirtelTigo</option>
            </select>
          </div>

          {/* Package Price Select */}
          {!isMultiple && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Package
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
                value={order.amount}
                onChange={(e) => {
                  const selectedItem = packagePrices.find(
                    (item) => Number(item.price) === Number(e.target.value),
                  );
                  setOrder((prev) => ({
                    ...prev,
                    amount: selectedItem.price,
                    size: selectedItem.size,
                  }));
                }}
              >
                <option value="">Choose a package</option>

                {packagePrices.map((item, index) => (
                  <option key={index} value={item.price}>
                    {item.size} - ₵{item.price}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Phone Number Input */}
          {!isMultiple && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Phone Number
              </label>
              <input
                type="tel"
                name="telephone"
                placeholder="Enter phone number"
                value={order.recipientNumber}
                onChange={(e) => {
                  setOrder({ ...order, recipientNumber: e.target.value });
                }}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
              />
            </div>
          )}

          {/* Multiple Orders Text Field */}
          {isMultiple && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Orders (Format: recipient number size, one per line)
              </label>
              <textarea
                placeholder={`Example:\n0501234567 1GB\n0559876543 2GB\n0501112222 5GB`}
                value={multipleOrdersText}
                onChange={(e) => setMultipleOrdersText(e.target.value)}
                rows="10"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white font-mono text-sm resize-none"
              />
              <p className="text-xs text-[red] mt-2">
                Enter recipient number followed by a single space and the data
                bundle size in GB
              </p>
              <p className="text-xs text-[red] mt-2">
                Each order should be entered on a new line, Don't put two orders
                in one line
              </p>
              <p className="text-xs text-[red] mt-2">
                Make sure to add GB to the size
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
