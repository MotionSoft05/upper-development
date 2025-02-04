import monitor from "./firebaseMonitor";

// Para getDoc
const userDoc = await retryOperation(async () => {
  const doc = await getDoc(doc(db, "usuarios", user.uid));
  monitor.countRead();
  return doc;
});

// Para onSnapshot
const unsubscribe = onSnapshot(query, (snapshot) => {
  // tu código existente
});
monitor.trackSnapshot(unsubscribe);
