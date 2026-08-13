import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { Trip, TripFormData, ExpenseItem, TripMemory } from "../types/trip";

const COLLECTION_NAME = "trips";

/**
 * Calcula o custo total da viagem somando hospedagem, aluguel de carro, combustível, pedágio e itens extras
 */
export function calculateTotalEstimateCost(tripData: Partial<TripFormData>): number {
  const hospedagem = tripData.accommodation?.totalCost || 0;
  const aluguelCarro = tripData.carRental?.enabled ? (tripData.carRental?.totalCost || 0) : 0;
  const combustivel = tripData.transport?.calculatedFuelCost || 0;
  const pedagio = tripData.transport?.tollCost || 0;
  const extras = (tripData.extraItems || []).reduce((acc, item) => acc + (item.value || 0), 0);

  return Math.round((hospedagem + aluguelCarro + combustivel + pedagio + extras) * 100) / 100;
}

/**
 * Sincroniza em tempo real as viagens cadastradas no Cloud Firestore
 */
export function subscribeTrips(onUpdate: (trips: Trip[]) => void, onError?: (error: Error) => void) {
  const tripsRef = collection(db, COLLECTION_NAME);
  const q = query(tripsRef, orderBy("startDate", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const trips: Trip[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
        } as Trip;
      });
      onUpdate(trips);
    },
    (err) => {
      console.error("Erro ao escutar viagens no Firestore:", err);
      if (onError) onError(err);
    }
  );
}

/**
 * Busca todas as viagens uma única vez
 */
export async function getTrips(): Promise<Trip[]> {
  const tripsRef = collection(db, COLLECTION_NAME);
  const q = query(tripsRef, orderBy("startDate", "asc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as Trip[];
}

/**
 * Cria uma nova viagem no Firestore
 */
export async function createTrip(formData: TripFormData): Promise<string> {
  const totalEstimateCost = calculateTotalEstimateCost(formData);
  const now = new Date().toISOString();

  const newTripPayload = {
    ...formData,
    totalEstimateCost,
    memories: [],
    createdAt: now,
    updatedAt: now
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newTripPayload);
  return docRef.id;
}

/**
 * Atualiza os dados de uma viagem existente
 */
export async function updateTrip(tripId: string, formData: Partial<TripFormData>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tripId);
  const totalEstimateCost = calculateTotalEstimateCost(formData as TripFormData);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    ...formData,
    totalEstimateCost,
    updatedAt: now
  });
}

/**
 * Exclui uma viagem do Firestore
 */
export async function deleteTrip(tripId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tripId);
  await deleteDoc(docRef);
}

/**
 * Adiciona um item de gasto extra à viagem
 */
export async function addExpenseItemToTrip(trip: Trip, newItem: Omit<ExpenseItem, 'id'>): Promise<void> {
  const itemWithId: ExpenseItem = {
    ...newItem,
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
  };

  const updatedExtraItems = [...(trip.extraItems || []), itemWithId];
  
  const docRef = doc(db, COLLECTION_NAME, trip.id);
  await updateDoc(docRef, {
    extraItems: updatedExtraItems,
    totalEstimateCost: calculateTotalEstimateCost({
      accommodation: trip.accommodation,
      transport: trip.transport,
      carRental: trip.carRental,
      extraItems: updatedExtraItems
    }),
    updatedAt: new Date().toISOString()
  });
}

/**
 * Remove um item de gasto extra da viagem
 */
export async function removeExpenseItemFromTrip(trip: Trip, itemId: string): Promise<void> {
  const updatedExtraItems = (trip.extraItems || []).filter(item => item.id !== itemId);
  
  const docRef = doc(db, COLLECTION_NAME, trip.id);
  await updateDoc(docRef, {
    extraItems: updatedExtraItems,
    totalEstimateCost: calculateTotalEstimateCost({
      accommodation: trip.accommodation,
      transport: trip.transport,
      carRental: trip.carRental,
      extraItems: updatedExtraItems
    }),
    updatedAt: new Date().toISOString()
  });
}

/**
 * Adiciona uma lembrança (foto) à viagem
 */
export async function addMemoryToTrip(trip: Trip, memory: Omit<TripMemory, 'id' | 'addedAt'>): Promise<void> {
  const newMemory: TripMemory = {
    ...memory,
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    addedAt: new Date().toISOString()
  };

  const updatedMemories = [...(trip.memories || []), newMemory];
  
  const docRef = doc(db, COLLECTION_NAME, trip.id);
  await updateDoc(docRef, {
    memories: updatedMemories,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Remove uma lembrança da viagem
 */
export async function removeMemoryFromTrip(trip: Trip, memoryId: string): Promise<void> {
  const updatedMemories = (trip.memories || []).filter(m => m.id !== memoryId);
  
  const docRef = doc(db, COLLECTION_NAME, trip.id);
  await updateDoc(docRef, {
    memories: updatedMemories,
    updatedAt: new Date().toISOString()
  });
}
