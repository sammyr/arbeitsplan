'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Store } from '@/types/store';
import { Employee } from '@/types/employee';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { MdDragIndicator } from 'react-icons/md';

export default function SortEmployeesPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeOrders, setEmployeeOrders] = useState<{ [key: string]: string[] }>({});
  const [employeeOrderDocs, setEmployeeOrderDocs] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect wird ausgeführt, user:', user);
    const loadData = async () => {
      if (!user) {
        console.log('Kein Benutzer verfügbar');
        return;
      }

      try {
        setIsLoading(true);
        
        // Lade Stores des eingeloggten Benutzers
        const storesRef = collection(db, 'stores');
        const storesQuery = query(storesRef, where('organizationId', '==', user.uid));
        const storesSnap = await getDocs(storesQuery);
        const storesData = storesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
        console.log('Geladene Filialen:', storesData);
        setStores(storesData);

        // Lade Mitarbeiter des eingeloggten Benutzers
        const employeesRef = collection(db, 'mitarbeiter');
        const employeesQuery = query(employeesRef, where('organizationId', '==', user.uid));
        const employeesSnap = await getDocs(employeesQuery);
        const employeesData = employeesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        console.log('Geladene Mitarbeiter:', employeesData);
        setEmployees(employeesData);

        // Lade oder erstelle Reihenfolgen für alle Stores
        const orders: { [key: string]: string[] } = {};
        const orderDocs: { [key: string]: string } = {};

        for (const store of storesData) {
          console.log(`Verarbeite Filiale ${store.name}`);
          
          // Suche nach bestehender Reihenfolge
          const orderRef = collection(db, 'employeeOrder');
          const orderQuery = query(
            orderRef,
            where('storeId', '==', store.id),
            where('organizationId', '==', user.uid)
          );
          const orderSnap = await getDocs(orderQuery);

          let currentOrder: string[];
          
          if (!orderSnap.empty) {
            // Bestehende Reihenfolge gefunden
            const orderDoc = orderSnap.docs[0];
            const existingOrder = orderDoc.data().order || [];
            console.log(`Bestehende Reihenfolge für ${store.name}:`, existingOrder);
            
            // Füge fehlende Mitarbeiter hinzu
            const missingEmployees = employeesData
              .filter(emp => !existingOrder.includes(emp.id))
              .map(emp => emp.id);
            
            currentOrder = [...existingOrder, ...missingEmployees];
            orders[store.id] = currentOrder;
            orderDocs[store.id] = orderDoc.id;
            
            // Aktualisiere die Reihenfolge
            await updateDoc(doc(db, 'employeeOrder', orderDoc.id), {
              order: currentOrder,
              updatedAt: new Date().toISOString()
            });
          } else {
            // Erstelle neue Reihenfolge
            currentOrder = employeesData.map(emp => emp.id);
            console.log(`Neue Reihenfolge für ${store.name}:`, currentOrder);
            
            const orderDoc = await addDoc(collection(db, 'employeeOrder'), {
              storeId: store.id,
              organizationId: user.uid,
              order: currentOrder,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            orders[store.id] = currentOrder;
            orderDocs[store.id] = orderDoc.id;
          }
        }

        console.log('Finale Reihenfolgen:', orders);
        setEmployeeOrders(orders);
        setEmployeeOrderDocs(orderDocs);

      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        toast.error('Fehler beim Laden der Daten');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Speichere die neue Reihenfolge für einen Store
  const saveStoreOrder = async (storeId: string, newOrder: string[]) => {
    if (!user) return;

    try {
      const orderRef = collection(db, 'employeeOrder');
      
      if (employeeOrderDocs[storeId]) {
        // Aktualisiere bestehende Reihenfolge
        const docRef = doc(db, 'employeeOrder', employeeOrderDocs[storeId]);
        await updateDoc(docRef, { order: newOrder });
      } else {
        // Erstelle neue Reihenfolge
        const docRef = await addDoc(orderRef, {
          storeId,
          organizationId: user.uid,
          order: newOrder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setEmployeeOrderDocs(prev => ({
          ...prev,
          [storeId]: docRef.id
        }));
      }

      setEmployeeOrders(prev => ({
        ...prev,
        [storeId]: newOrder
      }));

      toast.success('Reihenfolge wurde gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern der Reihenfolge:', error);
      toast.error('Fehler beim Speichern der Reihenfolge');
    }
  };

  // Handle Drag & Drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceStoreId = source.droppableId;
    const destStoreId = destination.droppableId;

    // Verhindere Verschieben zwischen Filialen
    if (sourceStoreId !== destStoreId) {
      toast.error('Mitarbeiter können nicht zwischen Filialen verschoben werden');
      return;
    }

    try {
      // Hole die Employee ID aus der draggableId (Format: "storeId-employeeId")
      const employeeId = result.draggableId.split('-')[1];
      
      // Erstelle eine Kopie der aktuellen Reihenfolge
      const newOrders = { ...employeeOrders };
      const currentOrder = [...(newOrders[sourceStoreId] || [])];

      // Verschiebe den Mitarbeiter
      const [movedEmployeeId] = currentOrder.splice(source.index, 1);
      currentOrder.splice(destination.index, 0, movedEmployeeId);
      newOrders[sourceStoreId] = currentOrder;

      // Aktualisiere den State
      setEmployeeOrders(newOrders);

      // Aktualisiere die Datenbank
      const orderDoc = employeeOrderDocs[sourceStoreId];
      if (orderDoc) {
        await updateDoc(doc(db, 'employeeOrder', orderDoc), {
          order: currentOrder,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Reihenfolge:', error);
      toast.error('Fehler beim Aktualisieren der Reihenfolge');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Mitarbeiter Reihenfolge</h1>
      
      <div className="mt-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          {stores.map(store => {
            console.log(`Rendere Filiale ${store.name}:`, {
              employeeOrders: employeeOrders[store.id],
              employees
            });
            return (
              <div key={store.id} className="mb-8">
                <h2 className="text-xl font-bold mb-4">{store.name}</h2>
                <Droppable droppableId={store.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-1 gap-2"
                    >
                      {(employeeOrders[store.id] || [])
                        .map((employeeId, index) => {
                          const employee = employees.find(e => e.id === employeeId);
                          if (!employee) {
                            console.log('Mitarbeiter nicht gefunden:', employeeId);
                            return null;
                          }
                          
                          return (
                            <Draggable
                              key={`${store.id}-${employee.id}`}
                              draggableId={`${store.id}-${employee.id}`}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="font-semibold">
                                        {employee.firstName} {employee.lastName}
                                      </h3>
                                      <p className="text-gray-600 text-sm">
                                        {employee.email}
                                      </p>
                                    </div>
                                    <div className="text-gray-400">
                                      <MdDragIndicator size={24} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}
