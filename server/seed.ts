
import { storage } from "./storage";

export async function seedDatabase() {
  const existingCities = await storage.getCities();
  if (existingCities.length === 0) {
    console.log("Деректер базасын әдепкі қалалармен толтыру...");
    await storage.createCity({
      name: "Лондон",
      lat: "51.5074",
      lon: "-0.1278",
      country: "Біріккен Корольдік",
      admin1: "Англия",
      isFavorite: true
    });
    await storage.createCity({
      name: "Нью-Йорк",
      lat: "40.7128",
      lon: "-74.0060",
      country: "АҚШ",
      admin1: "Нью-Йорк",
      isFavorite: true
    });
    await storage.createCity({
      name: "Токио",
      lat: "35.6895",
      lon: "139.6917",
      country: "Жапония",
      admin1: "Токио",
      isFavorite: false
    });
    await storage.createCity({
      name: "Сидней",
      lat: "-33.8688",
      lon: "151.2093",
      country: "Аустралия",
      admin1: "Жаңа Оңтүстік Уэльс",
      isFavorite: false
    });
    await storage.createCity({
      name: "Алматы",
      lat: "43.2389",
      lon: "76.8897",
      country: "Қазақстан",
      admin1: "Алматы",
      isFavorite: true
    });
    await storage.createCity({
      name: "Астана",
      lat: "51.1605",
      lon: "71.4272",
      country: "Қазақстан",
      admin1: "Астана",
      isFavorite: true
    });
    console.log("Толтыру аяқталды.");
  } else {
      console.log("Деректер базасы қазірдің өзінде толтырылған.");
  }
}
