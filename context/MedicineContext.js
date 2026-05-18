"use client";

import { createContext, useContext, useEffect, useState } from "react";

const MedicineContext = createContext();

export const MedicineProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const data = [
      {
        id: 1,
        name: "Paracetamol",
        price: 50,
        description: "Used to treat fever and mild pain .",
        image: "https://images.unsplash.com/photo-1580281657527-47bb6c2d1b91?w=400",
      },
      {
        id: 2,
        name: "Ibuprofen",
        price: 80,
        description: "Reduces pain and inflammation.",
        image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
      },
      {
        id: 3,
        name: "Aspirin",
        price: 60,
        description: "Relieves headache and fever.",
        image: "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=400",
      },
      {
        id: 4,
        name: "Amoxicillin",
        price: 120,
        description: "Antibiotic for infections.",
        image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400",
      },
      {
        id: 5,
        name: "Azithromycin",
        price: 150,
        description: "Treats respiratory infections.",
        image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400",
      },
      {
        id: 6,
        name: "Metformin",
        price: 200,
        description: "Controls blood sugar.",
        image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400",
      },
      {
        id: 7,
        name: "Atorvastatin",
        price: 180,
        description: "Lowers cholesterol.",
        image: "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400",
      },
      {
        id: 8,
        name: "Omeprazole",
        price: 90,
        description: "For acidity and ulcers.",
        image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
      },
      {
        id: 9,
        name: "Cough Syrup",
        price: 110,
        description: "Relieves cough.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
      },
      {
        id: 10,
        name: "Vitamin C",
        price: 70,
        description: "Boosts immunity.",
        image: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=400",
      },
      {
        id: 11,
        name: "Dolo 650",
        price: 65,
        description: "For fever and body pain.",
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
      },
      {
        id: 12,
        name: "Cetirizine",
        price: 55,
        description: "Allergy relief.",
        image: "https://images.unsplash.com/photo-1585432959449-b1c4b5f1b4d3?w=400",
      },
      {
        id: 13,
        name: "Insulin",
        price: 500,
        description: "Used for diabetes control.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400",
      },
      {
        id: 14,
        name: "Lisinopril",
        price: 140,
        description: "For blood pressure.",
        image: "https://images.unsplash.com/photo-1582719471387-0d2f3a0b7a9f?w=400",
      },
      {
        id: 15,
        name: "Losartan",
        price: 160,
        description: "Controls hypertension.",
        image: "https://images.unsplash.com/photo-1585432959441-6c7f9f0b0f5b?w=400",
      },
      {
        id: 16,
        name: "Pantoprazole",
        price: 95,
        description: "Acid reflux treatment.",
        image: "https://images.unsplash.com/photo-1603398938370-6f2d1b1f3a5b?w=400",
      },
      {
        id: 17,
        name: "Calcium Tablets",
        price: 120,
        description: "Bone strength support.",
        image: "https://images.unsplash.com/photo-1588776814540-2c4b3d7f6a1a?w=400",
      },
      {
        id: 18,
        name: "Iron Tablets",
        price: 100,
        description: "Treats anemia.",
        image: "https://images.unsplash.com/photo-1585432959442-3c9b8f7d3e2c?w=400",
      },
      {
        id: 19,
        name: "ORS",
        price: 30,
        description: "Prevents dehydration.",
        image: "https://images.unsplash.com/photo-1582719478170-7f5a9b0c6f3b?w=400",
      },
      {
        id: 20,
        name: "Antacid",
        price: 40,
        description: "Relieves acidity.",
        image: "https://images.unsplash.com/photo-1603398938375-3b1f9f0a5b7d?w=400",
      },
    ];

    setMedicines(data);
  }, []);

  return (
    <MedicineContext.Provider value={{ medicines }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicines = () => useContext(MedicineContext);