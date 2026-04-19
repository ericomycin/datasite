import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import { auth, db } from "../config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 🔑 Firebase user
  const [userData, setUserData] = useState(null); // 🔥 Firestore data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const q = query(
            collection(db, "users"),
            where("userId", "==", firebaseUser.uid),
          );

          // Use onSnapshot for real-time updates
          unsubscribeSnapshot = onSnapshot(
            q,
            (querySnapshot) => {
              if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                setUserData(data);
              } else {
                console.log("No user data found");
                setUserData(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching user data:", error);
              setLoading(false);
            },
          );
        } catch (error) {
          console.error("Error setting up listener:", error);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);
  console.log(user?.displayName);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
