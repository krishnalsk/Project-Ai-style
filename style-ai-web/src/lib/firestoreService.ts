// src/lib/firestoreService.ts
// Direct Firestore service layer mapping Android app data structures (project_id: best-3-52312)

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "./firebaseAuth";
import { Product, MOCK_PRODUCTS } from "./products";

// ─── Error handling wrapper ──────────────────────────────────────────────────

async function safeFirestoreQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (err) {
    console.error(`Firestore error (${context}):`, err);
    return fallback;
  }
}

// ─── 1. USER PROFILE COLLECTION (`users/{userId}`) ────────────────────────────

export async function fetchFirestoreUserProfile(userId: string): Promise<UserProfile | null> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDoc(doc(db, "users", userId));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        email: data.email ?? null,
        fullName: data.fullName ?? null,
        profession: data.profession ?? null,
        age: data.age ?? null,
        size: data.size ?? null,
        skinType: data.skinType ?? null,
        preferredFabric: data.preferredFabric ?? null,
        location: data.location ?? null,
        comfortScore: typeof data.comfortScore === "number" ? data.comfortScore : 92,
      } as UserProfile;
    },
    null,
    "fetchUserProfile"
  );
}

export async function updateFirestoreUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  await setDoc(doc(db, "users", userId), profile, { merge: true });
}

// ─── 2. PRODUCTS COLLECTION (`products/{productId}`) ──────────────────────────

export async function fetchFirestoreProducts(): Promise<Product[]> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDocs(collection(db, "products"));
      if (snap.empty) return MOCK_PRODUCTS;
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    },
    MOCK_PRODUCTS,
    "fetchProducts"
  );
}

// ─── 3. CART SUBCOLLECTION (`users/{userId}/cart`) ─────────────────────────────

export interface FirestoreCartItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  emoji?: string;
}

export async function fetchFirestoreCart(userId: string): Promise<FirestoreCartItem[]> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDocs(collection(db, "users", userId, "cart"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCartItem));
    },
    [],
    "fetchCart"
  );
}

export async function saveFirestoreCartItem(userId: string, item: FirestoreCartItem): Promise<void> {
  await setDoc(doc(db, "users", userId, "cart", item.productId), item, { merge: true });
}

export async function removeFirestoreCartItem(userId: string, productId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "cart", productId));
}

// ─── 4. WISHLIST SUBCOLLECTION (`users/{userId}/wishlist`) ────────────────────

export interface FirestoreWishlistItem {
  productId: string;
  name: string;
  price: number;
  fabric: string;
  image?: string;
  emoji?: string;
  addedAt: string;
}

export async function fetchFirestoreWishlist(userId: string): Promise<FirestoreWishlistItem[]> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDocs(collection(db, "users", userId, "wishlist"));
      return snap.docs.map((d) => ({ ...d.data() } as FirestoreWishlistItem));
    },
    [],
    "fetchWishlist"
  );
}

export async function addFirestoreWishlistItem(userId: string, item: FirestoreWishlistItem): Promise<void> {
  await setDoc(doc(db, "users", userId, "wishlist", item.productId), item, { merge: true });
}

export async function removeFirestoreWishlistItem(userId: string, productId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "wishlist", productId));
}

// ─── 5. ORDERS SUBCOLLECTION (`users/{userId}/orders`) ────────────────────────

export interface FirestoreOrder {
  id?: string;
  date: string;
  status: string;
  totalAmount: number;
  pointsEarned: number;
  items: Array<{ name: string; price: number; quantity: number; emoji?: string }>;
}

export async function fetchFirestoreOrders(userId: string): Promise<FirestoreOrder[]> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDocs(query(collection(db, "users", userId, "orders"), orderBy("date", "desc")));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreOrder));
    },
    [],
    "fetchOrders"
  );
}

export async function createFirestoreOrder(userId: string, order: FirestoreOrder): Promise<string> {
  const docRef = await addDoc(collection(db, "users", userId, "orders"), order);
  return docRef.id;
}

// ─── 6. VIRTUAL CLOSET SUBCOLLECTION (`users/{userId}/closet`) ─────────────────

export interface FirestoreClosetItem {
  id?: string;
  name: string;
  category: string;
  fabric: string;
  emoji?: string;
  wearCount: number;
  lastWorn: string;
  comfortRating: number;
}

export async function fetchFirestoreCloset(userId: string): Promise<FirestoreClosetItem[]> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDocs(collection(db, "users", userId, "closet"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreClosetItem));
    },
    [],
    "fetchCloset"
  );
}

export async function addFirestoreClosetItem(userId: string, item: FirestoreClosetItem): Promise<void> {
  await addDoc(collection(db, "users", userId, "closet"), item);
}

// ─── 7. SKIN DIARY (`users/{userId}/diaryEntries`) ────────────────────────────

export interface FirestoreDiaryEntry {
  id?: string;
  date: string;
  garment: string;
  fabric: string;
  reaction: string;
  comfortRating: number;
  notes: string;
}

export async function fetchFirestoreDiaryEntries(userId: string): Promise<FirestoreDiaryEntry[]> {
  return safeFirestoreQuery(
    async () => {
      const snap = await getDocs(collection(db, "users", userId, "diaryEntries"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreDiaryEntry));
    },
    [],
    "fetchDiaryEntries"
  );
}

export async function addFirestoreDiaryEntry(userId: string, entry: FirestoreDiaryEntry): Promise<void> {
  await addDoc(collection(db, "users", userId, "diaryEntries"), entry);
}
