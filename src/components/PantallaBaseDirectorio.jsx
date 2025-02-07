// "use client";
// import { useEffect, useState, useCallback, useMemo } from "react";
// import { useTranslation } from "react-i18next";
// import { usePathname, useSearchParams } from "next/navigation";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   where,
//   query,
//   doc,
//   getDoc,
//   onSnapshot,
// } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { initializeApp } from "firebase/app";
// import debounce from "lodash/debounce";
// import LogIn from "../login/page";
// import { LoadingSpinner, ErrorDisplay } from "@/components/StatusComponents";
// import { firebaseConfig } from "@/firebase/config";
// import DirectoryTemplateManager from "./templates/PDTemplateManager";

// // Constants
// const REFRESH_INTERVAL = 60000;
// const DEFAULT_HOUR = "00:00";
// const COUNTDOWN_START = 60;
// const WEATHER_API_KEY = "a067ad0b3d4440b192b223344240201";
// const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

// // Initial States
// const initialScreenData = {
//   events: [],
//   ads: [],
//   template: null,
//   weather: null,
//   currentMedia: 0,
// };

// // Helper functions
// const getCurrentTime = () => {
//   return new Date().toLocaleTimeString("es-ES", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const convertTimeToMinutes = (timeString) => {
//   const [hours, minutes] = timeString.split(":").map(Number);
//   return hours * 60 + minutes;
// };

// const loadAds = async (db, userCompany) => {
//   const adsQuery = query(
//     collection(db, "Publicidad"),
//     where("empresa", "==", userCompany),
//     where("tipo", "==", "directorio")
//   );

//   const snapshot = await getDocs(adsQuery);
//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// };

// const DirectoryScreen = () => {
//   const { t } = useTranslation();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const companyName = searchParams.get("emp");

//   // Core states
//   const [user, setUser] = useState(null);
//   const [screenData, setScreenData] = useState(initialScreenData);
//   const [currentTime, setCurrentTime] = useState(getCurrentTime());
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [countdown, setCountdown] = useState(COUNTDOWN_START);

//   // Memoized values
//   const currentEvent = useMemo(() => screenData.events[0], [screenData.events]);
//   const currentAd = useMemo(
//     () => screenData.ads[screenData.currentMedia],
//     [screenData.ads, screenData.currentMedia]
//   );

//   // Firebase initialization
//   useEffect(() => {
//     const app = initializeApp(firebaseConfig);
//     const auth = getAuth(app);

//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       if (!user) setIsLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   // Time update handler
//   const updateCurrentTime = useCallback(
//     debounce(() => {
//       setCurrentTime(getCurrentTime());
//     }, 1000),
//     []
//   );

//   // Event filtering logic
//   const filterCurrentEvents = useCallback((events, company) => {
//     const now = new Date();
//     const currentMinutes = convertTimeToMinutes(getCurrentTime());

//     return events.filter((event) => {
//       const startDate = new Date(event.fechaInicio);
//       const endDate = new Date(event.fechaFinal);
//       startDate.setHours(0, 0, 0, 0);
//       endDate.setHours(23, 59, 59, 999);

//       const isWithinDateRange = now >= startDate && now <= endDate;
//       const startMinutes =
//         event.horaInicialSalon === DEFAULT_HOUR
//           ? 0
//           : convertTimeToMinutes(event.horaInicialSalon);
//       const endMinutes =
//         event.horaFinalSalon === DEFAULT_HOUR
//           ? 1439
//           : convertTimeToMinutes(event.horaFinalSalon);

//       return (
//         isWithinDateRange &&
//         currentMinutes >= startMinutes &&
//         currentMinutes <= endMinutes &&
//         event.empresa === company &&
//         event.status
//       );
//     });
//   }, []);

//   // Data fetching effect
//   useEffect(() => {
//     if (!user) return;

//     let unsubscribe = () => {};
//     const db = getFirestore();

//     const fetchData = async () => {
//       try {
//         const userDoc = await getDoc(doc(db, "usuarios", user.uid));
//         if (!userDoc.exists()) throw new Error("User not found");

//         const userData = userDoc.data();
//         const userCompany =
//           userData.empresa === companyName ? userData.empresa : companyName;

//         // Set up real-time listeners for events
//         const eventsQuery = query(
//           collection(db, "eventos"),
//           where("empresa", "==", userCompany)
//         );

//         unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
//           const events = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));

//           const filteredEvents = filterCurrentEvents(events, userCompany);

//           // Si no hay eventos, cargar anuncios
//           if (filteredEvents.length === 0) {
//             loadAds(db, userCompany).then((ads) => {
//               setScreenData((prev) => ({
//                 ...prev,
//                 events: filteredEvents,
//                 ads,
//               }));
//             });
//           } else {
//             setScreenData((prev) => ({
//               ...prev,
//               events: filteredEvents,
//               ads: [],
//             }));
//           }
//         });

//         setIsLoading(false);
//       } catch (error) {
//         setError(error.message);
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//     return () => unsubscribe();
//   }, [user, companyName, filterCurrentEvents]);

//   // Render logic
//   if (!user) return <LogIn url={pathname} />;
//   if (isLoading) return <LoadingSpinner />;
//   if (error) return <ErrorDisplay error={error} />;

//   return (
//     <DirectoryTemplateManager
//       screenData={screenData}
//       currentTime={currentTime}
//       isPortrait={screenData.template?.setPortrait}
//     />
//   );
// };

// export default DirectoryScreen;
