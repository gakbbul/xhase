import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  Firestore,
  Unsubscribe
} from "firebase/firestore";
import { FIREBASE_CONFIG } from "../constants";
import { Site, SiteFormData } from "../types";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);
const db: Firestore = getFirestore(app);
const SITES_COLLECTION = "sites";

export const subscribeToSites = (onUpdate: (sites: Site[]) => void): Unsubscribe => {
  const q = query(collection(db, SITES_COLLECTION), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const sites = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Site));
    onUpdate(sites);
  });
};

export const addSite = async (data: SiteFormData): Promise<void> => {
  try {
    const urlObj = new URL(data.url.startsWith('http') ? data.url : `https://${data.url}`);
    const name = urlObj.hostname.replace('www.', '');
    
    await addDoc(collection(db, SITES_COLLECTION), {
      ...data,
      name,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding site:", error);
    throw error;
  }
};

export const deleteSite = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, SITES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting site:", error);
    throw error;
  }
};
