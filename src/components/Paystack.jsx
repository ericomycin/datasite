// PaystackButton.jsx
import { updateDoc, increment } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { PaystackButton } from "react-paystack";
import { db } from "../config/firebase";
import { toast } from "sonner";

const PaystackComponent = ({
  email,
  telephone,
  name,
  amount,
  refreshState,
}) => {
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  // const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  console.log(userId);
  const addToWallet = async (userId, amount) => {
    try {
      const q = query(collection(db, "users"), where("userId", "==", userId));
      console.log(q);

      const snapshot = await getDocs(q);

      snapshot.forEach(async (docSnap) => {
        const x = await updateDoc(docSnap.ref, {
          wallet: increment(amount),
        });
        console.log(x);
      });

      console.log("Wallet updated successfully");
    } catch (error) {
      console.error("Error updating wallet:", error);
    }
  };
  const componentProps = {
    email,
    amount: amount * 100, // Paystack uses kobo/pesewas
    currency: "GHS",
    metadata: {
      name,
      telephone,
    },
    publicKey,
    text: "Pay",
    onSuccess: async (reference) => {
      toast.loading("Verifying payment...");
      refreshState();

      try {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: reference.reference,
            amount,
          }),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Wallet top up successful ");
          refreshState();

          console.log("Verified payment:", data);
          toast.dismiss();
          addToWallet(userId, amount);
        } else {
          toast.error("Payment verification failed ");
          console.log(data);
          toast.dismiss();
          refreshState();
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
        toast.dismiss();
        refreshState();
      }
    },
    onClose: () => {
      toast.error("Wallet top up cancelled");
      refreshState();
    },
  };

  return (
    <div>
      <PaystackButton
        {...componentProps}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      />
    </div>
  );
};

export default PaystackComponent;
